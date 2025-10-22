-- Friends Feature Test Data Seeding Script
-- Run this script in Supabase SQL Editor to create test data
-- WARNING: This is for development/testing only

-- Create test users (if using Supabase Auth, you'll need to create these through the auth system)
-- This script assumes you have existing user IDs to work with

-- Example: Insert test friendships
-- Replace these UUIDs with actual user IDs from your auth.users table

-- STEP 1: Get some user IDs from your database
-- SELECT id, email FROM auth.users LIMIT 10;

-- STEP 2: Create test friendships using real user IDs
-- Replace USER_ID_1, USER_ID_2, etc. with actual UUIDs

-- Example pending incoming request (USER_2 sent request to USER_1)
-- INSERT INTO public.friendships (requester_id, addressee_id, status)
-- VALUES (
--   'USER_ID_2',
--   'USER_ID_1',
--   'pending'
-- );

-- Example pending outgoing request (USER_1 sent request to USER_3)
-- INSERT INTO public.friendships (requester_id, addressee_id, status)
-- VALUES (
--   'USER_ID_1',
--   'USER_ID_3',
--   'pending'
-- );

-- Example accepted friendship (USER_1 and USER_4 are friends)
-- INSERT INTO public.friendships (requester_id, addressee_id, status)
-- VALUES (
--   'USER_ID_1',
--   'USER_ID_4',
--   'accepted'
-- );

-- Example accepted friendship (USER_1 and USER_5 are friends)
-- INSERT INTO public.friendships (requester_id, addressee_id, status)
-- VALUES (
--   'USER_ID_1',
--   'USER_ID_5',
--   'accepted'
-- );

-- Example declined request (historical, won't show up in UI)
-- INSERT INTO public.friendships (requester_id, addressee_id, status)
-- VALUES (
--   'USER_ID_6',
--   'USER_ID_1',
--   'declined'
-- );

-- STEP 3: Verify the data
-- SELECT
--   f.id,
--   f.status,
--   f.created_at,
--   requester.email as requester_email,
--   addressee.email as addressee_email
-- FROM public.friendships f
-- JOIN auth.users requester ON f.requester_id = requester.id
-- JOIN auth.users addressee ON f.addressee_id = addressee.id
-- ORDER BY f.created_at DESC;

-- CLEANUP SCRIPT (use with caution!)
-- To remove all test friendships:
-- DELETE FROM public.friendships WHERE created_at > NOW() - INTERVAL '1 hour';

-- ============================================
-- SAMPLE DATA GENERATION FUNCTION
-- ============================================

-- Function to create random friendships between existing users
-- Usage: SELECT create_random_friendships(10); -- Creates 10 random friendships

CREATE OR REPLACE FUNCTION create_random_friendships(count INTEGER)
RETURNS TABLE(
  friendship_id UUID,
  requester_email TEXT,
  addressee_email TEXT,
  status TEXT
) AS $$
DECLARE
  user_ids UUID[];
  requester_id UUID;
  addressee_id UUID;
  random_status TEXT;
  i INTEGER;
BEGIN
  -- Get array of user IDs
  SELECT ARRAY_AGG(id) INTO user_ids FROM auth.users LIMIT 50;

  IF ARRAY_LENGTH(user_ids, 1) < 2 THEN
    RAISE EXCEPTION 'Not enough users in database. Need at least 2 users.';
  END IF;

  FOR i IN 1..count LOOP
    -- Select two random different users
    requester_id := user_ids[1 + FLOOR(RANDOM() * ARRAY_LENGTH(user_ids, 1))];
    addressee_id := user_ids[1 + FLOOR(RANDOM() * ARRAY_LENGTH(user_ids, 1))];

    -- Ensure different users
    WHILE requester_id = addressee_id LOOP
      addressee_id := user_ids[1 + FLOOR(RANDOM() * ARRAY_LENGTH(user_ids, 1))];
    END LOOP;

    -- Random status (70% accepted, 20% pending, 10% declined)
    random_status := CASE
      WHEN RANDOM() < 0.7 THEN 'accepted'
      WHEN RANDOM() < 0.9 THEN 'pending'
      ELSE 'declined'
    END;

    -- Insert if not exists
    BEGIN
      INSERT INTO public.friendships (requester_id, addressee_id, status)
      VALUES (requester_id, addressee_id, random_status)
      ON CONFLICT DO NOTHING
      RETURNING id, requester_id, addressee_id, status
      INTO friendship_id, requester_id, addressee_id, random_status;

      IF friendship_id IS NOT NULL THEN
        RETURN QUERY
        SELECT
          friendship_id,
          (SELECT email FROM auth.users WHERE id = requester_id),
          (SELECT email FROM auth.users WHERE id = addressee_id),
          random_status;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Skip duplicates
      CONTINUE;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Usage examples:
-- SELECT * FROM create_random_friendships(20); -- Create 20 random friendships

-- ============================================
-- CLEANUP FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_test_friendships()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.friendships
  WHERE created_at > NOW() - INTERVAL '24 hours';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Usage:
-- SELECT cleanup_test_friendships(); -- Delete friendships created in last 24 hours

-- ============================================
-- USEFUL QUERIES FOR TESTING
-- ============================================

-- 1. View all friendships for a specific user
-- SELECT
--   f.id,
--   f.status,
--   CASE
--     WHEN f.requester_id = 'YOUR_USER_ID' THEN 'outgoing'
--     ELSE 'incoming'
--   END as direction,
--   CASE
--     WHEN f.requester_id = 'YOUR_USER_ID' THEN addressee.email
--     ELSE requester.email
--   END as other_user_email
-- FROM public.friendships f
-- JOIN auth.users requester ON f.requester_id = requester.id
-- JOIN auth.users addressee ON f.addressee_id = addressee.id
-- WHERE f.requester_id = 'YOUR_USER_ID' OR f.addressee_id = 'YOUR_USER_ID'
-- ORDER BY f.created_at DESC;

-- 2. Count friendships by status
-- SELECT status, COUNT(*) as count
-- FROM public.friendships
-- GROUP BY status;

-- 3. Find users with most friends
-- SELECT
--   u.email,
--   COUNT(*) as friend_count
-- FROM (
--   SELECT requester_id as user_id FROM public.friendships WHERE status = 'accepted'
--   UNION ALL
--   SELECT addressee_id as user_id FROM public.friendships WHERE status = 'accepted'
-- ) f
-- JOIN auth.users u ON f.user_id = u.id
-- GROUP BY u.email
-- ORDER BY friend_count DESC
-- LIMIT 10;

-- 4. Find duplicate/conflicting friendships (should be none with proper constraints)
-- SELECT
--   LEAST(requester_id, addressee_id) as user1,
--   GREATEST(requester_id, addressee_id) as user2,
--   COUNT(*) as count
-- FROM public.friendships
-- WHERE status IN ('pending', 'accepted')
-- GROUP BY LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id)
-- HAVING COUNT(*) > 1;
