-- =============================================================================
-- Lingora · seed_courses_current.sql
--
-- Run AFTER schema.sql AND seed_current.sql.
-- Adds the course/unit structure for the 5 lessons seeded by seed_current.sql.
--
-- Lesson UUIDs (from seed_current.sql):
--   aaaaaaaa-0001-4000-8000-000000000001  Greetings         (beginner)
--   aaaaaaaa-0001-4000-8000-000000000002  Introducing Yourself (beginner)
--   aaaaaaaa-0001-4000-8000-000000000003  Daily Conversation  (beginner)
--   aaaaaaaa-0001-4000-8000-000000000004  At the Restaurant   (intermediate)
--   aaaaaaaa-0001-4000-8000-000000000005  Shopping Basics     (intermediate)
--
-- Safety:
--   · All PKs are pinned values  → seed is deterministic.
--   · ON CONFLICT (id) DO NOTHING  → re-running never duplicates rows.
--   · UPDATE ... WHERE unit_id IS NULL  → re-running does not overwrite manual changes.
--   · Single transaction  → partial failure leaves the DB unchanged.
-- =============================================================================

BEGIN;

-- =============================================================================
-- COURSE
-- =============================================================================
INSERT INTO courses (id, title, description, level, language) VALUES
(
    2,
    'Everyday English',
    'Build practical communication skills across greetings, dining, and shopping topics.',
    'beginner',
    'English'
)
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('courses', 'id'), GREATEST(MAX(id), 2)) FROM courses;

-- =============================================================================
-- UNITS
-- =============================================================================
INSERT INTO units (id, course_id, title, order_index) VALUES
(3, 2, 'Unit 1 – The Basics',         1),
(4, 2, 'Unit 2 – Out and About',      2)
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('units', 'id'), GREATEST(MAX(id), 4)) FROM units;

-- =============================================================================
-- WIRE LESSONS → UNITS
--   Lessons 1-3 (beginner) → Unit 3 – The Basics
--   Lessons 4-5 (intermediate) → Unit 4 – Out and About
-- =============================================================================

-- Unit 3: The Basics
UPDATE lessons
SET    unit_id   = 3,
       type      = 'lesson',
       xp_reward = 10
WHERE  id = 'aaaaaaaa-0001-4000-8000-000000000001'
  AND  unit_id IS NULL;

UPDATE lessons
SET    unit_id   = 3,
       type      = 'lesson',
       xp_reward = 10
WHERE  id = 'aaaaaaaa-0001-4000-8000-000000000002'
  AND  unit_id IS NULL;

UPDATE lessons
SET    unit_id   = 3,
       type      = 'challenge',
       xp_reward = 20
WHERE  id = 'aaaaaaaa-0001-4000-8000-000000000003'
  AND  unit_id IS NULL;

-- Unit 4: Out and About
UPDATE lessons
SET    unit_id   = 4,
       type      = 'lesson',
       xp_reward = 10
WHERE  id = 'aaaaaaaa-0001-4000-8000-000000000004'
  AND  unit_id IS NULL;

UPDATE lessons
SET    unit_id   = 4,
       type      = 'challenge',
       xp_reward = 20
WHERE  id = 'aaaaaaaa-0001-4000-8000-000000000005'
  AND  unit_id IS NULL;

COMMIT;
