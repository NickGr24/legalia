-- Updated University Leaderboard Views to show ALL universities (including 0 XP)
-- Based on actual database schema with home_university, home_userprofile, home_marks_of_user tables

-- Drop existing views
DROP VIEW IF EXISTS leaderboard_universities_all_time;
DROP VIEW IF EXISTS leaderboard_universities_week;

-- Create updated Universities All-Time Leaderboard View
-- This includes ALL universities, even those with 0 XP
-- Uses home_marks_of_user table to calculate points from quiz completions
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
         CASE 
           WHEN mou.score > 1 THEN mou.score -- Score as percentage (e.g., 86)
           ELSE mou.score * 100 -- Score as decimal (e.g., 0.86 -> 86)
         END
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

-- Create updated Universities This Week Leaderboard View
-- This includes ALL universities, even those with 0 weekly XP
-- Uses home_marks_of_user table for weekly calculations
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
         CASE 
           WHEN mou.score > 1 THEN mou.score -- Score as percentage (e.g., 86)
           ELSE mou.score * 100 -- Score as decimal (e.g., 0.86 -> 86)
         END
       )
       FROM home_userprofile up 
       JOIN home_marks_of_user mou ON mou.user_id = up.user_id 
       WHERE up.university_id = u.id 
         AND mou.completed = true
         AND (mou.completed_at >= date_trunc('week', CURRENT_DATE) 
              OR mou.updated_at >= date_trunc('week', CURRENT_DATE))), 
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

-- Test the new views
SELECT 'Testing updated leaderboard_universities_all_time (should show ALL universities):' as test;
SELECT university_name, total_xp, students_count FROM leaderboard_universities_all_time ORDER BY rank_position LIMIT 10;

SELECT 'Testing updated leaderboard_universities_week (should show ALL universities):' as test;
SELECT university_name, total_xp, students_count FROM leaderboard_universities_week ORDER BY rank_position LIMIT 10;

-- Verify we're showing all universities
SELECT 'Total universities in database:' as info, COUNT(*) as count FROM home_university;
SELECT 'Universities in all-time leaderboard:' as info, COUNT(*) as count FROM leaderboard_universities_all_time;
SELECT 'Universities in weekly leaderboard:' as info, COUNT(*) as count FROM leaderboard_universities_week;