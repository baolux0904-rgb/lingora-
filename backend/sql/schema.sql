-- =============================================================================
-- Lingora – Database Schema
-- PostgreSQL >= 14
--
-- Run order: this file first, then seed.sql (or seed_current.sql).
-- To reset:  DROP SCHEMA public CASCADE; CREATE SCHEMA public; then re-run.
--
-- Table creation order matters for FK references:
--   courses → units → lessons → vocab_items / quiz_items / speaking_prompts
--                              → users → user_progress
-- =============================================================================

-- Enable UUID generation (available in all modern PG installs)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. COURSES
--    Top-level curriculum container. A course groups multiple units.
-- =============================================================================
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

-- =============================================================================
-- 2. UNITS
--    A course is divided into ordered units, each containing lesson nodes.
-- =============================================================================
CREATE TABLE IF NOT EXISTS units (
    id          SERIAL        PRIMARY KEY,
    course_id   INT           NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    title       VARCHAR(200)  NOT NULL,
    order_index SMALLINT      NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX        IF NOT EXISTS idx_units_course ON units (course_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_units_order   ON units (course_id, order_index);

-- =============================================================================
-- 3. LESSONS
--    Individual lesson nodes. Can belong to a unit (via unit_id) or be
--    standalone (unit_id NULL). unit_id is nullable so legacy rows are valid.
-- =============================================================================
CREATE TABLE IF NOT EXISTS lessons (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id       INT           REFERENCES units (id) ON DELETE SET NULL,
    title         VARCHAR(200)  NOT NULL,
    description   TEXT,
    level         VARCHAR(50)   NOT NULL DEFAULT 'beginner'
                                CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    type          VARCHAR(50)   NOT NULL DEFAULT 'lesson',
    order_index   SMALLINT      NOT NULL DEFAULT 0,
    xp_reward     SMALLINT      NOT NULL DEFAULT 10,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_lessons_order_index ON lessons (order_index);
CREATE INDEX        IF NOT EXISTS idx_lessons_unit        ON lessons (unit_id);

-- ---------------------------------------------------------------------------
-- Idempotent column additions for databases that pre-date this schema version.
-- These are safe no-ops when the columns already exist.
-- ---------------------------------------------------------------------------
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS unit_id     INT      REFERENCES units (id) ON DELETE SET NULL;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS type        VARCHAR(50) NOT NULL DEFAULT 'lesson';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS xp_reward   SMALLINT    NOT NULL DEFAULT 10;

-- =============================================================================
-- 4. VOCAB ITEMS
--    Vocabulary words that belong to a lesson.
-- =============================================================================
CREATE TABLE IF NOT EXISTS vocab_items (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id         UUID          NOT NULL
                                    REFERENCES lessons (id) ON DELETE CASCADE,
    word              VARCHAR(100)  NOT NULL,
    meaning           TEXT          NOT NULL,
    example_sentence  TEXT,
    pronunciation     VARCHAR(200),             -- IPA or phonetic guide
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vocab_lesson ON vocab_items (lesson_id);

-- =============================================================================
-- 5. QUIZ ITEMS
--    Multiple-choice questions that belong to a lesson.
-- =============================================================================
CREATE TABLE IF NOT EXISTS quiz_items (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id       UUID          NOT NULL
                                  REFERENCES lessons (id) ON DELETE CASCADE,
    question        TEXT          NOT NULL,
    option_a        TEXT          NOT NULL,
    option_b        TEXT          NOT NULL,
    option_c        TEXT          NOT NULL,
    option_d        TEXT          NOT NULL,
    correct_option  CHAR(1)       NOT NULL
                                  CHECK (correct_option IN ('a', 'b', 'c', 'd')),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_lesson ON quiz_items (lesson_id);

-- =============================================================================
-- 6. SPEAKING PROMPTS
--    Open-ended prompts that encourage spoken practice.
-- =============================================================================
CREATE TABLE IF NOT EXISTS speaking_prompts (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id       UUID          NOT NULL
                                  REFERENCES lessons (id) ON DELETE CASCADE,
    prompt_text     TEXT          NOT NULL,
    sample_answer   TEXT,
    hint            TEXT,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_speaking_lesson ON speaking_prompts (lesson_id);

-- =============================================================================
-- 7. USERS
--    Learner accounts. auth_provider_id links to an external auth service
--    (e.g. Auth0, Supabase Auth) and is kept nullable until auth is wired up.
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_provider_id   VARCHAR(255)  UNIQUE,           -- external identity token
    email              VARCHAR(255)  UNIQUE NOT NULL,
    name               VARCHAR(150)  NOT NULL,
    avatar_url         TEXT,
    created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- =============================================================================
-- 8. USER PROGRESS
--    Tracks one learner's result for one lesson.
--    A (user_id, lesson_id) pair is unique — progress is upserted, not appended.
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_progress (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID          NOT NULL
                                REFERENCES users   (id) ON DELETE CASCADE,
    lesson_id     UUID          NOT NULL
                                REFERENCES lessons (id) ON DELETE CASCADE,
    score         SMALLINT      CHECK (score BETWEEN 0 AND 100),
    completed     BOOLEAN       NOT NULL DEFAULT FALSE,
    completed_at  TIMESTAMPTZ,                         -- NULL until completed = true
    CONSTRAINT uq_user_lesson UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user   ON user_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson ON user_progress (lesson_id);

-- =============================================================================
-- VIEW: lesson_summary
--    Returns all lesson metadata plus content counts in one query.
--    Used by GET /api/v1/lessons to avoid N+1 queries.
--
-- BUG FIX: description was missing from the original view definition,
--          causing lessonRepository.SQL_GET_ALL_LESSONS to return NULL for
--          every lesson's description field.
-- =============================================================================
CREATE OR REPLACE VIEW lesson_summary AS
SELECT
    l.id,
    l.title,
    l.description,                          -- was missing in original view
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
