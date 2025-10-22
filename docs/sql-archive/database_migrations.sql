-- =====================================================
-- LEGALIA POINTS & LEADERBOARD SYSTEM - DATABASE MIGRATIONS
-- =====================================================

-- 1. Add points-related columns to existing home_marks_of_user table
ALTER TABLE home_marks_of_user 
ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_taken INTEGER DEFAULT 0, -- in seconds
ADD COLUMN IF NOT EXISTS perfect_run BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS speed_bonus INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS perfect_bonus INTEGER DEFAULT 0;

-- 2. Create user_points table for aggregated scoring
CREATE TABLE IF NOT EXISTS user_points (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    weekly_points INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Create weekly_leaderboard_periods table to track reset cycles
CREATE TABLE IF NOT EXISTS weekly_leaderboard_periods (
    id SERIAL PRIMARY KEY,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(week_start)
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_points_total ON user_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_weekly ON user_points(weekly_points DESC);
CREATE INDEX IF NOT EXISTS idx_home_marks_quiz_user ON home_marks_of_user(quiz_id, user_id);
CREATE INDEX IF NOT EXISTS idx_home_marks_completed_at ON home_marks_of_user(completed_at);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_leaderboard_periods ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for user_points
CREATE POLICY "Users can view all user points for leaderboards" ON user_points
    FOR SELECT USING (true);

CREATE POLICY "Users can only update their own points" ON user_points
    FOR ALL USING (auth.uid() = user_id);

-- 7. RLS Policies for weekly_leaderboard_periods
CREATE POLICY "Everyone can view leaderboard periods" ON weekly_leaderboard_periods
    FOR SELECT USING (true);

-- 8. Insert initial weekly period (current week)
INSERT INTO weekly_leaderboard_periods (week_start, week_end, is_current)
VALUES (
    date_trunc('week', CURRENT_DATE),
    date_trunc('week', CURRENT_DATE) + INTERVAL '6 days',
    true
) ON CONFLICT (week_start) DO NOTHING;

-- 9. Create or replace function to initialize user points
CREATE OR REPLACE FUNCTION initialize_user_points(p_user_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO user_points (user_id, total_points, weekly_points)
    VALUES (p_user_id, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Trigger to automatically initialize user points when user profile is created
CREATE OR REPLACE FUNCTION trigger_initialize_user_points()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM initialize_user_points(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_profile_created
    AFTER INSERT ON home_userprofile
    FOR EACH ROW
    EXECUTE FUNCTION trigger_initialize_user_points();