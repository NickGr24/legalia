-- =====================================================
-- LEADERBOARD SYSTEM FUNCTIONS
-- =====================================================

-- 1. Function to get all-time leaderboard with current user ranking
CREATE OR REPLACE FUNCTION get_alltime_leaderboard(p_current_user_id UUID DEFAULT NULL)
RETURNS TABLE(
    rank_position INTEGER,
    user_id UUID,
    user_name TEXT,
    avatar_url TEXT,
    total_points INTEGER,
    is_current_user BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH ranked_users AS (
        SELECT 
            ROW_NUMBER() OVER (ORDER BY up.total_points DESC, up.last_updated ASC) as rank_pos,
            up.user_id,
            COALESCE(au.raw_user_meta_data->>'full_name', 
                     au.raw_user_meta_data->>'name', 
                     au.email, 
                     'Anonymous User') as name,
            au.raw_user_meta_data->>'avatar_url' as avatar,
            up.total_points,
            (up.user_id = p_current_user_id) as is_current
        FROM user_points up
        JOIN auth.users au ON up.user_id = au.id
        WHERE up.total_points > 0
        ORDER BY up.total_points DESC, up.last_updated ASC
    ),
    top_100 AS (
        SELECT * FROM ranked_users WHERE rank_pos <= 100
    ),
    current_user_rank AS (
        SELECT * FROM ranked_users WHERE user_id = p_current_user_id AND rank_pos > 100
    )
    SELECT 
        r.rank_pos::INTEGER,
        r.user_id,
        r.name::TEXT,
        r.avatar::TEXT,
        r.total_points,
        r.is_current
    FROM (
        SELECT * FROM top_100
        UNION ALL
        SELECT * FROM current_user_rank
    ) r
    ORDER BY r.rank_pos;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to get weekly leaderboard with current user ranking
CREATE OR REPLACE FUNCTION get_weekly_leaderboard(p_current_user_id UUID DEFAULT NULL)
RETURNS TABLE(
    rank_position INTEGER,
    user_id UUID,
    user_name TEXT,
    avatar_url TEXT,
    weekly_points INTEGER,
    is_current_user BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH ranked_users AS (
        SELECT 
            ROW_NUMBER() OVER (ORDER BY up.weekly_points DESC, up.last_updated ASC) as rank_pos,
            up.user_id,
            COALESCE(au.raw_user_meta_data->>'full_name', 
                     au.raw_user_meta_data->>'name', 
                     au.email, 
                     'Anonymous User') as name,
            au.raw_user_meta_data->>'avatar_url' as avatar,
            up.weekly_points,
            (up.user_id = p_current_user_id) as is_current
        FROM user_points up
        JOIN auth.users au ON up.user_id = au.id
        WHERE up.weekly_points > 0
        ORDER BY up.weekly_points DESC, up.last_updated ASC
    ),
    top_100 AS (
        SELECT * FROM ranked_users WHERE rank_pos <= 100
    ),
    current_user_rank AS (
        SELECT * FROM ranked_users WHERE user_id = p_current_user_id AND rank_pos > 100
    )
    SELECT 
        r.rank_pos::INTEGER,
        r.user_id,
        r.name::TEXT,
        r.avatar::TEXT,
        r.weekly_points,
        r.is_current
    FROM (
        SELECT * FROM top_100
        UNION ALL
        SELECT * FROM current_user_rank
    ) r
    ORDER BY r.rank_pos;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function to get user's current ranking and stats
CREATE OR REPLACE FUNCTION get_user_leaderboard_stats(p_user_id UUID)
RETURNS TABLE(
    total_points INTEGER,
    weekly_points INTEGER,
    alltime_rank INTEGER,
    weekly_rank INTEGER,
    total_users_count INTEGER,
    weekly_users_count INTEGER
) AS $$
DECLARE
    v_total_points INTEGER := 0;
    v_weekly_points INTEGER := 0;
    v_alltime_rank INTEGER := 0;
    v_weekly_rank INTEGER := 0;
    v_total_users INTEGER := 0;
    v_weekly_users INTEGER := 0;
BEGIN
    -- Get user's points
    SELECT up.total_points, up.weekly_points 
    INTO v_total_points, v_weekly_points
    FROM user_points up 
    WHERE up.user_id = p_user_id;
    
    -- If user not found, initialize with zeros
    IF v_total_points IS NULL THEN
        v_total_points := 0;
        v_weekly_points := 0;
    END IF;
    
    -- Get all-time rank
    SELECT COUNT(*) + 1 INTO v_alltime_rank
    FROM user_points 
    WHERE total_points > v_total_points;
    
    -- Get weekly rank
    SELECT COUNT(*) + 1 INTO v_weekly_rank
    FROM user_points 
    WHERE weekly_points > v_weekly_points;
    
    -- Get total user counts
    SELECT COUNT(*) INTO v_total_users
    FROM user_points 
    WHERE total_points > 0;
    
    SELECT COUNT(*) INTO v_weekly_users
    FROM user_points 
    WHERE weekly_points > 0;
    
    RETURN QUERY SELECT 
        v_total_points,
        v_weekly_points,
        v_alltime_rank,
        v_weekly_rank,
        v_total_users,
        v_weekly_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Weekly reset function (to be called via cron job or scheduled function)
CREATE OR REPLACE FUNCTION reset_weekly_leaderboard()
RETURNS void AS $$
DECLARE
    v_current_week_start DATE;
    v_current_week_end DATE;
BEGIN
    -- Calculate current week dates (Monday to Sunday)
    v_current_week_start := date_trunc('week', CURRENT_DATE);
    v_current_week_end := v_current_week_start + INTERVAL '6 days';
    
    -- Mark previous period as inactive
    UPDATE weekly_leaderboard_periods 
    SET is_current = false 
    WHERE is_current = true;
    
    -- Create new weekly period
    INSERT INTO weekly_leaderboard_periods (week_start, week_end, is_current)
    VALUES (v_current_week_start, v_current_week_end, true)
    ON CONFLICT (week_start) DO UPDATE SET is_current = true;
    
    -- Reset all users' weekly points to 0
    UPDATE user_points SET weekly_points = 0, last_updated = NOW();
    
    -- Log the reset (optional - for debugging)
    RAISE NOTICE 'Weekly leaderboard reset completed for week starting %', v_current_week_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function to check if weekly reset is needed and perform it
CREATE OR REPLACE FUNCTION check_and_reset_weekly_leaderboard()
RETURNS BOOLEAN AS $$
DECLARE
    v_current_period_start DATE;
    v_should_reset BOOLEAN := FALSE;
BEGIN
    -- Get current period start date
    SELECT week_start INTO v_current_period_start
    FROM weekly_leaderboard_periods 
    WHERE is_current = true;
    
    -- Check if we need to reset (current week is different from stored week)
    IF v_current_period_start IS NULL OR v_current_period_start != date_trunc('week', CURRENT_DATE) THEN
        v_should_reset := TRUE;
        PERFORM reset_weekly_leaderboard();
    END IF;
    
    RETURN v_should_reset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to get leaderboard summary for dashboard
CREATE OR REPLACE FUNCTION get_leaderboard_summary(p_user_id UUID)
RETURNS TABLE(
    user_total_points INTEGER,
    user_weekly_points INTEGER,
    user_alltime_rank INTEGER,
    user_weekly_rank INTEGER,
    top_alltime_user_name TEXT,
    top_alltime_points INTEGER,
    top_weekly_user_name TEXT,
    top_weekly_points INTEGER
) AS $$
DECLARE
    v_user_stats RECORD;
    v_top_alltime RECORD;
    v_top_weekly RECORD;
BEGIN
    -- Get user stats
    SELECT * INTO v_user_stats FROM get_user_leaderboard_stats(p_user_id);
    
    -- Get top all-time user
    SELECT 
        COALESCE(au.raw_user_meta_data->>'full_name', 
                 au.raw_user_meta_data->>'name', 
                 au.email, 
                 'Anonymous User') as name,
        up.total_points
    INTO v_top_alltime
    FROM user_points up
    JOIN auth.users au ON up.user_id = au.id
    WHERE up.total_points > 0
    ORDER BY up.total_points DESC, up.last_updated ASC
    LIMIT 1;
    
    -- Get top weekly user
    SELECT 
        COALESCE(au.raw_user_meta_data->>'full_name', 
                 au.raw_user_meta_data->>'name', 
                 au.email, 
                 'Anonymous User') as name,
        up.weekly_points
    INTO v_top_weekly
    FROM user_points up
    JOIN auth.users au ON up.user_id = au.id
    WHERE up.weekly_points > 0
    ORDER BY up.weekly_points DESC, up.last_updated ASC
    LIMIT 1;
    
    RETURN QUERY SELECT 
        v_user_stats.total_points,
        v_user_stats.weekly_points,
        v_user_stats.alltime_rank,
        v_user_stats.weekly_rank,
        v_top_alltime.name::TEXT,
        v_top_alltime.total_points,
        v_top_weekly.name::TEXT,
        v_top_weekly.weekly_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;