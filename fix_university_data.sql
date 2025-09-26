-- Fix University Data Issues
-- 1. Remove "Alta Universitate" 
-- 2. Update "Universitatea de Educatie fizica" to "USEM - Universitatea de Studii Europene"
-- 3. Ensure proper logo paths for all universities

-- First, let's see what we have
SELECT 'Current universities:' as info, id, name, logo_url FROM home_university ORDER BY name;

-- Remove "Alta Universitate" if it exists
-- Note: This will also clean up any user profiles associated with it
DELETE FROM home_userprofile WHERE university_id IN (
  SELECT id FROM home_university WHERE name ILIKE '%alta universitate%'
);

DELETE FROM home_university WHERE name ILIKE '%alta universitate%';

-- Update "Universitatea de Educatie fizica" to "USEM - Universitatea de Studii Europene"
UPDATE home_university 
SET 
  name = 'USEM - Universitatea de Studii Europene',
  slug = 'usem',
  logo_url = COALESCE(logo_url, 'usem.png')
WHERE name ILIKE '%educatie fizica%' OR name ILIKE '%educație fizică%';

-- Ensure all universities have proper logo URLs
-- Update missing logos based on university names or slugs
UPDATE home_university 
SET logo_url = CASE 
  WHEN name ILIKE '%asem%' THEN 'asem.png'
  WHEN name ILIKE '%hasdeu%' OR name ILIKE '%cahul%' THEN 'hasdeu.png'
  WHEN name ILIKE '%stefan%' OR name ILIKE '%ștefan%' THEN 'stefancelmare.png'
  WHEN name ILIKE '%ulim%' OR name ILIKE '%libera%' THEN 'ulim.png'
  WHEN name ILIKE '%usarb%' OR name ILIKE '%agrara%' THEN 'usarb.png'
  WHEN name ILIKE '%usem%' OR name ILIKE '%europene%' THEN 'usem.png'
  WHEN name ILIKE '%usm%' OR name ILIKE '%moldova%' AND name NOT ILIKE '%stefan%' THEN 'usm.png'
  ELSE COALESCE(logo_url, 'default-university.png')
END
WHERE logo_url IS NULL OR logo_url = '';

-- Show the updated universities
SELECT 'Updated universities:' as info, id, name, logo_url FROM home_university ORDER BY name;