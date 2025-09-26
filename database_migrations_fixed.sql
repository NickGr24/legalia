-- =====================================================
-- LEGALIA ENHANCED DATABASE MIGRATIONS - FIXED VERSION
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Add unique constraint to home_userprofile.user_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'home_userprofile_user_id_key'
        AND table_name = 'home_userprofile'
    ) THEN
        ALTER TABLE home_userprofile ADD CONSTRAINT home_userprofile_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- 2. Create home_university table (NEW)
CREATE TABLE IF NOT EXISTS home_university (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    logo_path VARCHAR(255),
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add university columns to home_userprofile (if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='home_userprofile' AND column_name='university_id') THEN
        ALTER TABLE home_userprofile
        ADD COLUMN university_id INTEGER REFERENCES home_university(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='home_userprofile' AND column_name='full_name') THEN
        ALTER TABLE home_userprofile
        ADD COLUMN full_name VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='home_userprofile' AND column_name='avatar_url') THEN
        ALTER TABLE home_userprofile
        ADD COLUMN avatar_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='home_userprofile' AND column_name='graduated') THEN
        ALTER TABLE home_userprofile
        ADD COLUMN graduated BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='home_userprofile' AND column_name='workplace') THEN
        ALTER TABLE home_userprofile
        ADD COLUMN workplace VARCHAR(255);
    END IF;
END $$;

-- 4. Create home_user_xp_events table (NEW)
-- FIXED: Ensure foreign key references auth.users correctly
CREATE TABLE IF NOT EXISTS home_user_xp_events (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    delta INTEGER NOT NULL,
    reason VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_home_user_xp_events_user_id
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_home_userprofile_user_id ON home_userprofile(user_id);
CREATE INDEX IF NOT EXISTS idx_home_userprofile_university_id ON home_userprofile(university_id);
CREATE INDEX IF NOT EXISTS idx_home_user_xp_events_user_id ON home_user_xp_events(user_id);
CREATE INDEX IF NOT EXISTS idx_home_user_xp_events_timestamp ON home_user_xp_events(timestamp);

-- 6. Create materialized view for university totals
DROP MATERIALIZED VIEW IF EXISTS home_universities_totals;
CREATE MATERIALIZED VIEW home_universities_totals AS
WITH university_stats AS (
  SELECT
    up.university_id,
    COUNT(DISTINCT up.user_id) as students_count,
    COALESCE(SUM(xp.delta), 0) as total_xp
  FROM home_userprofile up
  LEFT JOIN home_user_xp_events xp ON xp.user_id = up.user_id
  WHERE up.university_id IS NOT NULL
  GROUP BY up.university_id
)
SELECT
  us.university_id,
  us.students_count,
  us.total_xp,
  ROW_NUMBER() OVER (ORDER BY us.total_xp DESC) as rank_position
FROM university_stats us
ORDER BY us.total_xp DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_home_universities_totals_university_id
ON home_universities_totals(university_id);

-- 7. Create the missing leaderboard views that the app expects

-- Users All-Time Leaderboard View
CREATE OR REPLACE VIEW leaderboard_users_all_time AS
WITH user_xp_totals AS (
  SELECT
    up.user_id,
    COALESCE(up.full_name, 'Anonymous User') as user_name,
    u.name as university_name,
    COALESCE(SUM(xp.delta), 0) as total_xp,
    up.avatar_url
  FROM home_userprofile up
  LEFT JOIN home_user_xp_events xp ON xp.user_id = up.user_id
  LEFT JOIN home_university u ON u.id = up.university_id
  GROUP BY up.user_id, up.full_name, u.name, up.avatar_url
)
SELECT
  ROW_NUMBER() OVER (ORDER BY total_xp DESC) as rank_position,
  user_id,
  user_name,
  university_name,
  total_xp,
  avatar_url
FROM user_xp_totals
ORDER BY total_xp DESC;

-- Universities All-Time Leaderboard View  
CREATE OR REPLACE VIEW leaderboard_universities_all_time AS
SELECT
  ut.rank_position,
  u.name as university_name,
  ut.total_xp,
  ut.students_count,
  u.logo_url
FROM home_universities_totals ut
JOIN home_university u ON u.id = ut.university_id
ORDER BY ut.rank_position;

-- Universities This Week Leaderboard View
CREATE OR REPLACE VIEW leaderboard_universities_week AS
WITH weekly_university_stats AS (
  SELECT
    up.university_id,
    COUNT(DISTINCT up.user_id) as students_count,
    COALESCE(SUM(xp.delta), 0) as total_xp
  FROM home_userprofile up
  LEFT JOIN home_user_xp_events xp ON xp.user_id = up.user_id
  WHERE up.university_id IS NOT NULL
    AND xp.timestamp >= date_trunc('week', CURRENT_DATE) -- This week only
  GROUP BY up.university_id
)
SELECT
  ROW_NUMBER() OVER (ORDER BY ws.total_xp DESC) as rank_position,
  u.name as university_name,
  ws.total_xp,
  ws.students_count,
  u.logo_url
FROM weekly_university_stats ws
JOIN home_university u ON u.id = ws.university_id
ORDER BY ws.total_xp DESC;

-- 8. Create RPC functions
CREATE OR REPLACE FUNCTION set_user_university(
  p_user_id UUID,
  p_name TEXT,
  p_graduated BOOLEAN DEFAULT false,
  p_workplace TEXT DEFAULT NULL,
  p_logo_path TEXT DEFAULT NULL,
  p_logo_url TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_university_id INTEGER;
  v_slug TEXT;
BEGIN
  v_slug := LOWER(TRIM(REGEXP_REPLACE(p_name, '\s+', ' ', 'g')));

  INSERT INTO home_university (name, slug, logo_path, logo_url)
  VALUES (p_name, v_slug, p_logo_path, p_logo_url)
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    logo_path = COALESCE(EXCLUDED.logo_path, home_university.logo_path),
    logo_url = COALESCE(EXCLUDED.logo_url, home_university.logo_url),
    updated_at = NOW()
  RETURNING id INTO v_university_id;

  IF v_university_id IS NULL THEN
    SELECT id INTO v_university_id
    FROM home_university
    WHERE slug = v_slug;
  END IF;

  UPDATE home_userprofile
  SET
    university_id = v_university_id,
    graduated = p_graduated,
    workplace = p_workplace,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  REFRESH MATERIALIZED VIEW home_universities_totals;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION award_xp(
  p_user_id UUID,
  p_delta INTEGER,
  p_reason TEXT DEFAULT 'manual'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO home_user_xp_events (user_id, delta, reason, timestamp)
  VALUES (p_user_id, p_delta, p_reason, NOW());

  REFRESH MATERIALIZED VIEW home_universities_totals;
END;
$$ LANGUAGE plpgsql;

-- 9. Insert universities
INSERT INTO home_university (name, slug, logo_path, logo_url, created_at, updated_at) VALUES
  ('Universitatea de Stat din Moldova', 'universitatea de stat din moldova', 'local_logo_usm', NULL, NOW(), NOW()),
  ('Academia de Studii Economice din Moldova', 'academia de studii economice din moldova', 'local_logo_asem', NULL, NOW(), NOW()),
  ('Universitatea Liberă Internațională din Moldova', 'universitatea liberă internațională din moldova', 'local_logo_ulim', NULL, NOW(), NOW()),
  ('Universitatea de Stat "Alecu Russo" din Bălți', 'universitatea de stat "alecu russo" din bălți', 'local_logo_usarb', NULL, NOW(), NOW()),
  ('Universitatea "Bogdan Petriceicu Hasdeu" din Cahul', 'universitatea "bogdan petriceicu hasdeu" din cahul', 'local_logo_hasdeu', NULL, NOW(), NOW()),
  ('Academia "Ștefan cel Mare"', 'academia "ștefan cel mare"', 'local_logo_stefancelmare', NULL, NOW(), NOW()),
  ('Universitatea de Stat de Educație Fizică și Sport', 'universitatea de stat de educație fizică și sport', 'local_logo_usem', NULL, NOW(), NOW()),
  ('Altă universitate...', 'altă universitate...', NULL, NULL, NOW(), NOW())
ON CONFLICT (slug)
DO UPDATE SET
  name = EXCLUDED.name,
  logo_path = EXCLUDED.logo_path,
  updated_at = NOW();

-- 10. REMOVED TEST DATA CREATION
-- Note: Test data creation has been removed because it would violate foreign key constraints.
-- In Supabase, users must be created through the auth.users table via authentication,
-- not by manually inserting UUIDs into home_userprofile.
-- 
-- To create test data:
-- 1. Use Supabase Auth to create real users via your app's registration
-- 2. Or use the Supabase Dashboard to create test users in auth.users first
-- 3. Then manually insert corresponding profiles in home_userprofile

-- 11. Refresh materialized view
REFRESH MATERIALIZED VIEW home_universities_totals;

-- 12. Test the views to make sure they work (these will work even with no data)
SELECT 'Testing leaderboard_users_all_time:' as test;
SELECT * FROM leaderboard_users_all_time LIMIT 5;

SELECT 'Testing leaderboard_universities_all_time:' as test;
SELECT * FROM leaderboard_universities_all_time LIMIT 5;

SELECT 'Testing leaderboard_universities_week:' as test;
SELECT * FROM leaderboard_universities_week LIMIT 5;

-- 13. Verification queries
SELECT 'Universities:' as info, COUNT(*) as count FROM home_university;
SELECT 'User profiles:' as info, COUNT(*) as count FROM home_userprofile;
SELECT 'XP events:' as info, COUNT(*) as count FROM home_user_xp_events;

-- 14. Enable RLS on new tables
ALTER TABLE home_university ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_user_xp_events ENABLE ROW LEVEL SECURITY;

-- 15. Create RLS policies for new tables
CREATE POLICY "Everyone can view universities" ON home_university
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage universities" ON home_university
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view all XP events for leaderboards" ON home_user_xp_events
    FOR SELECT USING (true);

CREATE POLICY "Users can only insert their own XP events" ON home_user_xp_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 16. Success message
SELECT '✅ Migration completed successfully! No test data was created to avoid foreign key violations.' as result;
