-- =====================================================
-- POINTS CALCULATION SYSTEM
-- =====================================================

-- Points Configuration Constants
-- Base points per correct answer: 10 points
-- Speed bonus: up to 5 extra points (awarded if completed under target time)
-- Perfect run bonus: 20 extra points (awarded for zero mistakes)
-- Target time per question: 30 seconds

-- 1. Function to calculate points for a quiz attempt
CREATE OR REPLACE FUNCTION calculate_quiz_points(
    p_quiz_id INTEGER,
    p_correct_answers INTEGER,
    p_total_questions INTEGER,
    p_time_taken INTEGER, -- in seconds
    p_is_perfect_run BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
    base_points INTEGER,
    speed_bonus INTEGER,
    perfect_bonus INTEGER,
    total_points INTEGER
) AS $$
DECLARE
    v_base_points INTEGER := 0;
    v_speed_bonus INTEGER := 0;
    v_perfect_bonus INTEGER := 0;
    v_total_points INTEGER := 0;
    v_target_time INTEGER;
    v_time_saved INTEGER;
BEGIN
    -- Calculate base points (10 points per correct answer)
    v_base_points := p_correct_answers * 10;
    
    -- Calculate target time (30 seconds per question)
    v_target_time := p_total_questions * 30;
    
    -- Calculate speed bonus (only if quiz completed correctly)
    IF p_correct_answers > 0 AND p_time_taken < v_target_time THEN
        v_time_saved := v_target_time - p_time_taken;
        -- Award 1 point for every 10 seconds saved, max 5 points
        v_speed_bonus := LEAST(5, GREATEST(0, v_time_saved / 10));
    END IF;
    
    -- Calculate perfect run bonus (20 points for zero mistakes)
    IF p_is_perfect_run THEN
        v_perfect_bonus := 20;
    END IF;
    
    -- Calculate total points
    v_total_points := v_base_points + v_speed_bonus + v_perfect_bonus;
    
    RETURN QUERY SELECT v_base_points, v_speed_bonus, v_perfect_bonus, v_total_points;
END;
$$ LANGUAGE plpgsql;

-- 2. Function to record quiz completion and update points
CREATE OR REPLACE FUNCTION record_quiz_completion(
    p_user_id UUID,
    p_quiz_id INTEGER,
    p_score FLOAT,
    p_correct_answers INTEGER,
    p_total_questions INTEGER,
    p_time_taken INTEGER,
    p_completed BOOLEAN DEFAULT TRUE
)
RETURNS TABLE(
    points_earned INTEGER,
    speed_bonus INTEGER,
    perfect_bonus INTEGER,
    total_user_points INTEGER,
    weekly_user_points INTEGER
) AS $$
DECLARE
    v_is_perfect_run BOOLEAN := FALSE;
    v_points_data RECORD;
    v_marks_id INTEGER;
    v_total_points INTEGER;
    v_weekly_points INTEGER;
BEGIN
    -- Determine if this is a perfect run (100% score)
    v_is_perfect_run := (p_score >= 1.0 AND p_correct_answers = p_total_questions);
    
    -- Calculate points using the points calculation function
    SELECT * INTO v_points_data 
    FROM calculate_quiz_points(p_quiz_id, p_correct_answers, p_total_questions, p_time_taken, v_is_perfect_run);
    
    -- Insert or update quiz attempt record
    INSERT INTO home_marks_of_user (
        user_id, quiz_id, score, completed, completed_at, updated_at,
        points_earned, time_taken, perfect_run, speed_bonus, perfect_bonus
    ) VALUES (
        p_user_id, p_quiz_id, p_score, p_completed, NOW(), NOW(),
        v_points_data.total_points, p_time_taken, v_is_perfect_run, 
        v_points_data.speed_bonus, v_points_data.perfect_bonus
    )
    ON CONFLICT (user_id, quiz_id) 
    DO UPDATE SET
        score = GREATEST(home_marks_of_user.score, p_score), -- Keep best score
        completed = p_completed,
        updated_at = NOW(),
        -- Only update points if new attempt has higher points
        points_earned = CASE 
            WHEN v_points_data.total_points > home_marks_of_user.points_earned 
            THEN v_points_data.total_points 
            ELSE home_marks_of_user.points_earned 
        END,
        time_taken = CASE 
            WHEN v_points_data.total_points > home_marks_of_user.points_earned 
            THEN p_time_taken 
            ELSE home_marks_of_user.time_taken 
        END,
        perfect_run = CASE 
            WHEN v_points_data.total_points > home_marks_of_user.points_earned 
            THEN v_is_perfect_run 
            ELSE home_marks_of_user.perfect_run 
        END,
        speed_bonus = CASE 
            WHEN v_points_data.total_points > home_marks_of_user.points_earned 
            THEN v_points_data.speed_bonus 
            ELSE home_marks_of_user.speed_bonus 
        END,
        perfect_bonus = CASE 
            WHEN v_points_data.total_points > home_marks_of_user.points_earned 
            THEN v_points_data.perfect_bonus 
            ELSE home_marks_of_user.perfect_bonus 
        END
    RETURNING id INTO v_marks_id;
    
    -- Update user's total points (recalculate from all quiz attempts)
    WITH user_stats AS (
        SELECT 
            COALESCE(SUM(points_earned), 0) as total_points,
            COALESCE(SUM(CASE 
                WHEN completed_at >= (SELECT week_start FROM weekly_leaderboard_periods WHERE is_current = true)
                THEN points_earned 
                ELSE 0 
            END), 0) as weekly_points
        FROM home_marks_of_user 
        WHERE user_id = p_user_id AND completed = true
    )
    INSERT INTO user_points (user_id, total_points, weekly_points, last_updated)
    SELECT p_user_id, total_points, weekly_points, NOW()
    FROM user_stats
    ON CONFLICT (user_id) 
    DO UPDATE SET
        total_points = EXCLUDED.total_points,
        weekly_points = EXCLUDED.weekly_points,
        last_updated = NOW();
    
    -- Get updated user points for return
    SELECT total_points, weekly_points INTO v_total_points, v_weekly_points
    FROM user_points WHERE user_id = p_user_id;
    
    RETURN QUERY SELECT 
        v_points_data.total_points as points_earned,
        v_points_data.speed_bonus,
        v_points_data.perfect_bonus,
        v_total_points as total_user_points,
        v_weekly_points as weekly_user_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function to recalculate all user points (useful for maintenance)
CREATE OR REPLACE FUNCTION recalculate_user_points(p_user_id UUID DEFAULT NULL)
RETURNS void AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- If specific user provided, recalculate only for that user
    IF p_user_id IS NOT NULL THEN
        WITH user_stats AS (
            SELECT 
                p_user_id as user_id,
                COALESCE(SUM(points_earned), 0) as total_points,
                COALESCE(SUM(CASE 
                    WHEN completed_at >= (SELECT week_start FROM weekly_leaderboard_periods WHERE is_current = true)
                    THEN points_earned 
                    ELSE 0 
                END), 0) as weekly_points
            FROM home_marks_of_user 
            WHERE user_id = p_user_id AND completed = true
        )
        INSERT INTO user_points (user_id, total_points, weekly_points, last_updated)
        SELECT user_id, total_points, weekly_points, NOW()
        FROM user_stats
        ON CONFLICT (user_id) 
        DO UPDATE SET
            total_points = EXCLUDED.total_points,
            weekly_points = EXCLUDED.weekly_points,
            last_updated = NOW();
    ELSE
        -- Recalculate for all users
        WITH all_user_stats AS (
            SELECT 
                user_id,
                COALESCE(SUM(points_earned), 0) as total_points,
                COALESCE(SUM(CASE 
                    WHEN completed_at >= (SELECT week_start FROM weekly_leaderboard_periods WHERE is_current = true)
                    THEN points_earned 
                    ELSE 0 
                END), 0) as weekly_points
            FROM home_marks_of_user 
            WHERE completed = true
            GROUP BY user_id
        )
        INSERT INTO user_points (user_id, total_points, weekly_points, last_updated)
        SELECT user_id, total_points, weekly_points, NOW()
        FROM all_user_stats
        ON CONFLICT (user_id) 
        DO UPDATE SET
            total_points = EXCLUDED.total_points,
            weekly_points = EXCLUDED.weekly_points,
            last_updated = NOW();
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;