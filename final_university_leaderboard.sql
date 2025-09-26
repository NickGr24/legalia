-- Final University Leaderboard with Data Fixes
-- Excludes "Alta Universitate" and ensures all universities have logos

-- Drop existing views
DROP VIEW IF EXISTS leaderboard_universities_all_time;
DROP VIEW IF EXISTS leaderboard_universities_week;

-- Create Universities All-Time Leaderboard View
-- Excludes "Alta Universitate" and ensures logo display
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
      (SELECT COUNT(*) * 15 -- Fixed 15 XP per successfully completed quiz
       FROM home_userprofile up 
       JOIN home_marks_of_user mou ON mou.user_id = up.user_id 
       WHERE up.university_id = u.id 
         AND mou.completed = true), 
      0
    ) as total_xp
  FROM home_university u
  WHERE u.name NOT ILIKE '%alta universitate%'
    AND u.name IS NOT NULL 
    AND u.name != ''
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

-- Create Universities This Week Leaderboard View
-- Same exclusions and logo handling for weekly data
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
      (SELECT COUNT(*) * 15 -- Fixed 15 XP per successfully completed quiz
       FROM home_userprofile up 
       JOIN home_marks_of_user mou ON mou.user_id = up.user_id 
       WHERE up.university_id = u.id 
         AND mou.completed = true
         AND (mou.completed_at >= date_trunc('week', CURRENT_DATE) 
              OR (mou.completed_at IS NULL AND mou.updated_at >= date_trunc('week', CURRENT_DATE)))), 
      0
    ) as total_xp
  FROM home_university u
  WHERE u.name NOT ILIKE '%alta universitate%'
    AND u.name IS NOT NULL 
    AND u.name != ''
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

-- Test the final leaderboard
SELECT 'Final leaderboard test - should exclude Alta Universitate:' as test;
SELECT 
  rank_position,
  university_name,
  total_xp,
  students_count,
  logo_url
FROM leaderboard_universities_all_time 
ORDER BY rank_position 
LIMIT 10;