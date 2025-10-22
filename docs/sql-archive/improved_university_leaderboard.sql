-- Improved University Leaderboard with Better Point System
-- Based on actual database schema: home_university, home_userprofile, home_marks_of_user

-- Drop existing views
DROP VIEW IF EXISTS leaderboard_universities_all_time;
DROP VIEW IF EXISTS leaderboard_universities_week;

-- Create improved Universities All-Time Leaderboard View
-- Uses a proper point system: each quiz completion = base points + score bonus
CREATE OR REPLACE VIEW leaderboard_universities_all_time AS
WITH university_totals AS (
  SELECT
    u.id as university_id,
    u.name as university_name,
    u.logo_url,
    COALESCE(
      (SELECT COUNT(DISTINCT up.user_id) 
       FROM home_userprofile up 
       WHERE up.university_id = u.id), 
      0
    ) as students_count,
    COALESCE(
      (SELECT SUM(
         10 + -- Base 10 points for completing a quiz
         ROUND(
           CASE 
             WHEN mou.score > 1 THEN mou.score -- Score as percentage (e.g., 86)
             ELSE mou.score * 100 -- Score as decimal (e.g., 0.86 -> 86)
           END
         )::int -- Convert score to integer points (0-100)
       )
       FROM home_userprofile up 
       JOIN home_marks_of_user mou ON mou.user_id = up.user_id 
       WHERE up.university_id = u.id 
         AND mou.completed = true), 
      0
    ) as total_xp
  FROM home_university u
),
ranked_universities AS (
  SELECT
    *,
    ROW_NUMBER() OVER (ORDER BY total_xp DESC, students_count DESC, university_name ASC) as rank_position
  FROM university_totals
)
SELECT
  rank_position,
  university_name,
  total_xp,
  students_count,
  logo_url
FROM ranked_universities
ORDER BY rank_position;

-- Create improved Universities This Week Leaderboard View
-- Same point system but only for this week's completions
CREATE OR REPLACE VIEW leaderboard_universities_week AS
WITH weekly_university_totals AS (
  SELECT
    u.id as university_id,
    u.name as university_name,
    u.logo_url,
    COALESCE(
      (SELECT COUNT(DISTINCT up.user_id) 
       FROM home_userprofile up 
       WHERE up.university_id = u.id), 
      0
    ) as students_count,
    COALESCE(
      (SELECT SUM(
         10 + -- Base 10 points for completing a quiz
         ROUND(
           CASE 
             WHEN mou.score > 1 THEN mou.score -- Score as percentage (e.g., 86)
             ELSE mou.score * 100 -- Score as decimal (e.g., 0.86 -> 86)
           END
         )::int -- Convert score to integer points (0-100)
       )
       FROM home_userprofile up 
       JOIN home_marks_of_user mou ON mou.user_id = up.user_id 
       WHERE up.university_id = u.id 
         AND mou.completed = true
         AND (mou.completed_at >= date_trunc('week', CURRENT_DATE) 
              OR (mou.completed_at IS NULL AND mou.updated_at >= date_trunc('week', CURRENT_DATE)))), 
      0
    ) as total_xp
  FROM home_university u
),
ranked_weekly_universities AS (
  SELECT
    *,
    ROW_NUMBER() OVER (ORDER BY total_xp DESC, students_count DESC, university_name ASC) as rank_position
  FROM weekly_university_totals
)
SELECT
  rank_position,
  university_name,
  total_xp,
  students_count,
  logo_url
FROM ranked_weekly_universities
ORDER BY rank_position;

-- Grant permissions for the views
GRANT SELECT ON leaderboard_universities_all_time TO authenticated;
GRANT SELECT ON leaderboard_universities_week TO authenticated;

-- Test the new point system
SELECT 'Testing improved point system - All-time:' as test;
SELECT 
  rank_position,
  university_name,
  total_xp,
  students_count,
  CASE 
    WHEN students_count > 0 THEN ROUND(total_xp::decimal / students_count, 1)
    ELSE 0 
  END as avg_xp_per_student
FROM leaderboard_universities_all_time 
WHERE rank_position <= 10;

SELECT 'Testing improved point system - This week:' as test;
SELECT 
  rank_position,
  university_name,
  total_xp,
  students_count,
  CASE 
    WHEN students_count > 0 THEN ROUND(total_xp::decimal / students_count, 1)
    ELSE 0 
  END as avg_weekly_xp_per_student
FROM leaderboard_universities_week 
WHERE rank_position <= 10;