-- Test queries to verify all universities appear in leaderboard
-- Based on actual database schema

-- Check total universities in the database
SELECT 'Total universities in database:' as test, COUNT(*) as count FROM home_university;

-- Check existing data structure
SELECT 'Sample universities:' as test, id, name, logo_url FROM home_university LIMIT 5;
SELECT 'Sample user profiles:' as test, COUNT(*) as count FROM home_userprofile;
SELECT 'Sample quiz marks:' as test, COUNT(*) as count FROM home_marks_of_user WHERE completed = true;

-- Check universities in all-time leaderboard (should match total)
SELECT 'Universities in all-time leaderboard:' as test, COUNT(*) as count FROM leaderboard_universities_all_time;

-- Check universities in weekly leaderboard (should match total)
SELECT 'Universities in weekly leaderboard:' as test, COUNT(*) as count FROM leaderboard_universities_week;

-- Show first 10 universities with their XP (should include 0 XP ones)
SELECT 
  'All-time leaderboard sample:' as test,
  rank_position,
  university_name,
  total_xp,
  students_count
FROM leaderboard_universities_all_time 
ORDER BY rank_position 
LIMIT 10;

-- Show universities with 0 XP (should exist if there are any)
SELECT 
  'Universities with 0 XP (all-time):' as test,
  university_name,
  total_xp,
  students_count
FROM leaderboard_universities_all_time 
WHERE total_xp = 0
ORDER BY university_name;

-- Show universities with 0 students (should exist if there are any)
SELECT 
  'Universities with 0 students:' as test,
  university_name,
  total_xp,
  students_count
FROM leaderboard_universities_all_time 
WHERE students_count = 0
ORDER BY university_name;

-- Show weekly vs all-time comparison for top 5
SELECT 
  'Weekly vs All-time Top 5:' as test,
  at.university_name,
  at.total_xp as alltime_xp,
  wk.total_xp as weekly_xp,
  at.students_count
FROM leaderboard_universities_all_time at
JOIN leaderboard_universities_week wk ON at.university_name = wk.university_name
ORDER BY at.rank_position
LIMIT 5;