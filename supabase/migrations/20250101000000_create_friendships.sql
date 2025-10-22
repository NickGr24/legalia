-- Migration: Create friendships table and policies
-- Description: Two-way friendship system with request/accept/decline flow
-- Created: 2025-01-01

-- Create friendships table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent self-friendship
  CONSTRAINT no_self_friendship CHECK (requester_id != addressee_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON public.friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);
CREATE INDEX IF NOT EXISTS idx_friendships_created ON public.friendships(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_friendships_requester_status ON public.friendships(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee_status ON public.friendships(addressee_id, status);

-- Unique partial index: prevent duplicate pending/accepted requests between same users (bidirectional)
CREATE UNIQUE INDEX IF NOT EXISTS idx_friendships_unique_pending_accepted
ON public.friendships(LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id))
WHERE status IN ('pending', 'accepted');

-- Enable Row Level Security
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view their own friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can create friend requests" ON public.friendships;
DROP POLICY IF EXISTS "Users can respond to requests addressed to them" ON public.friendships;
DROP POLICY IF EXISTS "Users can unfriend (update to declined)" ON public.friendships;
DROP POLICY IF EXISTS "Users can delete their own friendship records" ON public.friendships;

-- RLS Policies

-- SELECT: Users can see friendships they are part of
CREATE POLICY "Users can view their own friendships"
ON public.friendships
FOR SELECT
USING (
  auth.uid() = requester_id OR auth.uid() = addressee_id
);

-- INSERT: Users can only create requests where they are the requester
CREATE POLICY "Users can create friend requests"
ON public.friendships
FOR INSERT
WITH CHECK (
  auth.uid() = requester_id
);

-- UPDATE: Addressee can accept/decline pending requests; either party can update accepted → declined (unfriend)
CREATE POLICY "Users can respond to requests addressed to them"
ON public.friendships
FOR UPDATE
USING (
  -- Addressee updating pending request
  (auth.uid() = addressee_id AND status = 'pending') OR
  -- Either party can unfriend (accepted → declined)
  ((auth.uid() = requester_id OR auth.uid() = addressee_id) AND status = 'accepted')
)
WITH CHECK (
  -- Addressee can only change pending to accepted/declined
  ((auth.uid() = addressee_id AND status = 'pending' AND NEW.status IN ('accepted', 'declined')) OR
  -- Either party can change accepted to declined (unfriend)
  ((auth.uid() = requester_id OR auth.uid() = addressee_id) AND status = 'accepted' AND NEW.status = 'declined'))
);

-- DELETE: Allow either party to delete friendship records (alternative to unfriend)
CREATE POLICY "Users can delete their own friendship records"
ON public.friendships
FOR DELETE
USING (
  auth.uid() = requester_id OR auth.uid() = addressee_id
);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_friendships_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS set_friendships_updated_at ON public.friendships;
CREATE TRIGGER set_friendships_updated_at
BEFORE UPDATE ON public.friendships
FOR EACH ROW
EXECUTE FUNCTION update_friendships_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.friendships IS 'Two-way friendship system with request/accept/decline flow';
COMMENT ON COLUMN public.friendships.requester_id IS 'User who initiated the friend request';
COMMENT ON COLUMN public.friendships.addressee_id IS 'User who received the friend request';
COMMENT ON COLUMN public.friendships.status IS 'Status: pending, accepted, or declined';
COMMENT ON CONSTRAINT no_self_friendship ON public.friendships IS 'Prevents users from sending friend requests to themselves';
