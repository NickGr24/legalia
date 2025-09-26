-- Updated User Leaderboard Views with 15 XP Logic
-- Drop existing views
DROP VIEW IF EXISTS leaderboard_users_all_time;

-- Create Users All-Time Leaderboard View
-- Fixed 15 XP per successfully completed quiz
-- Uses email as nickname fallback
CREATE OR REPLACE VIEW leaderboard_users_all_time AS
WITH user_totals AS (
  SELECT
    mou.user_id,
    COALESCE(au.email, 'Utilizator') as user_name, -- Use email as nickname fallback
    NULL as avatar_url, -- Avatar not available in current schema
    u.name as university_name,
    COUNT(*) * 15 as total_xp -- Fixed 15 XP per successfully completed quiz
  FROM home_marks_of_user mou
  LEFT JOIN auth.users au ON mou.user_id = au.id
  LEFT JOIN home_userprofile up ON mou.user_id = up.user_id
  LEFT JOIN home_university u ON up.university_id = u.id
  WHERE mou.completed = true
    AND au.email IS NOT NULL
  GROUP BY mou.user_id, au.email, u.name
),
ranked_users AS (
  SELECT
    *,
    ROW_NUMBER() OVER (ORDER BY total_xp DESC, user_name ASC) as rank_position
  FROM user_totals
  WHERE total_xp > 0 -- Only show users with at least one completed quiz
)
SELECT
  rank_position,
  user_id,
  user_name,
  avatar_url,
  university_name,
  total_xp
FROM ranked_users
WHERE rank_position <= 100 -- Top 100 only
ORDER BY rank_position;

-- Grant permissions for the view
GRANT SELECT ON leaderboard_users_all_time TO authenticated;

-- Test the user leaderboard
SELECT 'User leaderboard test - fixed 15 XP per completed quiz:' as test;
SELECT 
  rank_position,
  user_name,
  university_name,
  total_xp
FROM leaderboard_users_all_time 
ORDER BY rank_position 
LIMIT 10;