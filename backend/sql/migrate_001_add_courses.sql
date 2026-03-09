-- =============================================================================
-- Lingora · migrate_001_add_courses.sql
--
-- PURPOSE
--   Adds the courses → units → lessons hierarchy to a database that was set up
--   with the original schema (lessons table only, no courses/units).
--
-- SAFE TO RUN:
--   · CREATE TABLE IF NOT EXISTS — skips if already present.
--   · ALTER TABLE … ADD COLUMN IF NOT EXISTS — skips if already present.
--   · CREATE OR REPLACE VIEW — always updates the view.
--   · ON CONFLICT (id) DO NOTHING — seed inserts are idempotent.
--   · UPDATE … WHERE unit_id IS NULL — never overwrites manual changes.
--   · Wrapped in a single transaction — full rollback on any error.
--
-- WHAT IT DOES (in dependency order):
--   1. Create courses table
--   2. Create units table (FK → courses)
--   3. Add unit_id, type, xp_reward columns to lessons (FK → units)
--   4. Create supporting indexes
--   5. Fix lesson_summary view (add missing description column)
--   6. Seed course id=2 "Everyday English"
--   7. Seed units 3 and 4 for the 5 lessons in seed_current.sql
--   8. Wire all 5 existing lessons to their unit
-- =============================================================================

BEGIN;

-- ===========================================================================
-- 1. COURSES TABLE
-- ===========================================================================
CREATE TABLE IF NOT EXISTS courses (
    id             SERIAL        PRIMARY KEY,
    title          VARCHAR(200)  NOT NULL,
    description    TEXT,
    level          VARCHAR(50)   NOT NULL DEFAULT 'beginner'
                                 CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    language       VARCHAR(100)  NOT NULL DEFAULT 'English',
    thumbnail_url  TEXT,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ===========================================================================
-- 2. UNITS TABLE
-- ===========================================================================
CREATE TABLE IF NOT EXISTS units (
    id          SERIAL        PRIMARY KEY,
    course_id   INT           NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    title       VARCHAR(200)  NOT NULL,
    order_index SMALLINT      NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX        IF NOT EXISTS idx_units_course ON units (course_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_units_order   ON units (course_id, order_index);

-- ===========================================================================
-- 3. EXTEND LESSONS TABLE
--    Add new columns — all idempotent via IF NOT EXISTS.
--    unit_id must come AFTER units table is created because of the FK.
-- ===========================================================================
ALTER TABLE lessons
    ADD COLUMN IF NOT EXISTS unit_id    INT      REFERENCES units (id) ON DELETE SET NULL;

ALTER TABLE lessons
    ADD COLUMN IF NOT EXISTS type       VARCHAR(50) NOT NULL DEFAULT 'lesson';

ALTER TABLE lessons
    ADD COLUMN IF NOT EXISTS xp_reward  SMALLINT    NOT NULL DEFAULT 10;

CREATE INDEX IF NOT EXISTS idx_lessons_unit ON lessons (unit_id);

-- ===========================================================================
-- 4. FIX lesson_summary VIEW
--    Original view was missing l.description — caused all lessons to return
--    description: null from GET /api/v1/lessons.
-- ===========================================================================
CREATE OR REPLACE VIEW lesson_summary AS
SELECT
    l.id,
    l.title,
    l.description,
    l.level,
    l.order_index,
    COUNT(DISTINCT v.id)  AS vocab_count,
    COUNT(DISTINCT q.id)  AS quiz_count,
    COUNT(DISTINCT s.id)  AS speaking_count
FROM lessons           l
LEFT JOIN vocab_items      v ON v.lesson_id = l.id
LEFT JOIN quiz_items        q ON q.lesson_id = l.id
LEFT JOIN speaking_prompts  s ON s.lesson_id = l.id
GROUP BY l.id, l.title, l.description, l.level, l.order_index
ORDER BY l.order_index;

-- ===========================================================================
-- 5. SEED — COURSE
--    "Everyday English" matches the 5 lessons in seed_current.sql.
-- ===========================================================================
INSERT INTO courses (id, title, description, level, language) VALUES
(
    2,
    'Everyday English',
    'Build practical communication skills across greetings, dining, and shopping topics.',
    'beginner',
    'English'
)
ON CONFLICT (id) DO NOTHING;

-- Keep the serial sequence ahead of our manually inserted id.
SELECT setval(pg_get_serial_sequence('courses', 'id'), GREATEST(MAX(id), 2)) FROM courses;

-- ===========================================================================
-- 6. SEED — UNITS
--    Unit 3 = "The Basics" (lessons 1–3, beginner)
--    Unit 4 = "Out and About" (lessons 4–5, intermediate)
-- ===========================================================================
INSERT INTO units (id, course_id, title, order_index) VALUES
(3, 2, 'Unit 1 – The Basics',    1),
(4, 2, 'Unit 2 – Out and About', 2)
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('units', 'id'), GREATEST(MAX(id), 4)) FROM units;

-- ===========================================================================
-- 7. WIRE LESSONS → UNITS
--    UPDATE is guarded by "WHERE unit_id IS NULL" so re-running this file
--    will never overwrite changes made later.
-- ===========================================================================

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

-- ===========================================================================
-- 8. VERIFY (runs inside the transaction — you will see the counts)
-- ===========================================================================
DO $$
DECLARE
    v_courses  INT;
    v_units    INT;
    v_wired    INT;
BEGIN
    SELECT COUNT(*) INTO v_courses FROM courses;
    SELECT COUNT(*) INTO v_units   FROM units;
    SELECT COUNT(*) INTO v_wired   FROM lessons WHERE unit_id IS NOT NULL;

    RAISE NOTICE '=== migrate_001 verification ===';
    RAISE NOTICE 'courses rows  : %', v_courses;
    RAISE NOTICE 'units rows    : %', v_units;
    RAISE NOTICE 'lessons wired : % / 5', v_wired;

    IF v_courses = 0 THEN
        RAISE EXCEPTION 'courses table is empty — seed failed';
    END IF;
    IF v_units = 0 THEN
        RAISE EXCEPTION 'units table is empty — seed failed';
    END IF;
END $$;

COMMIT;
