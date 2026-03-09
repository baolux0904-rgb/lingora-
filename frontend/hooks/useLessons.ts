/**
 * hooks/useLessons.ts
 *
 * Fetches the flat lesson list from GET /api/v1/lessons and maps the API
 * response to the frontend `Lesson` type expected by LessonCard.
 *
 * Mapping decisions (Phase 1 — no user progress yet):
 *
 *  status    → "recommended" for all lessons. Once user-progress is wired
 *               up (Phase 3) this will reflect real completion state.
 *
 *  type      → derived from order_index to produce visual variety across
 *               lesson cards ("vocabulary", "grammar", "speaking", …).
 *               The backend `lessons.type` column is the node category
 *               ("lesson"/"challenge"/"boss"), a different concept.
 *
 *  duration  → estimated from content counts:
 *               vocab × 0.5 min + quiz × 1.2 min + speaking × 1.5 min
 *
 *  detail    → primary content count (vocab first, then quiz, then speaking).
 *
 *  level     → backend "beginner/intermediate/advanced" → CEFR "B1/B2/C1".
 *
 *  progress  → 0 for all (no progress tracking yet).
 */

"use client";

import { useState, useEffect } from "react";
import { getLessons, type ApiLesson } from "@/lib/api";
import type { Lesson, LessonType, LessonStatus } from "@/lib/types";

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

/** Cycle of lesson-card types to produce visual variety in the dashboard. */
const CONTENT_TYPE_CYCLE: LessonType[] = [
  "vocabulary",
  "grammar",
  "speaking",
  "listening",
  "reading",
];

/** Derive a display-friendly lesson type from the lesson's order_index. */
function deriveContentType(orderIndex: number): LessonType {
  return CONTENT_TYPE_CYCLE[orderIndex % CONTENT_TYPE_CYCLE.length];
}

/** Map backend level string to CEFR notation used in the UI. */
function mapLevel(level: ApiLesson["level"]): string {
  if (level === "intermediate") return "B2";
  if (level === "advanced") return "C1";
  return "B1";
}

/** Estimate reading/study time in minutes from content counts. */
function deriveDuration(lesson: ApiLesson): number {
  const minutes =
    lesson.vocab_count * 0.5 +
    lesson.quiz_count * 1.2 +
    lesson.speaking_count * 1.5;
  return Math.max(5, Math.round(minutes));
}

/** Build a short detail string shown below the lesson title. */
function buildDetail(lesson: ApiLesson): string {
  if (lesson.vocab_count > 0) return `${lesson.vocab_count} words`;
  if (lesson.quiz_count > 0) return `${lesson.quiz_count} exercises`;
  if (lesson.speaking_count > 0) return `${lesson.speaking_count} prompts`;
  return "Content";
}

/**
 * Map one API lesson to the Lesson shape consumed by LessonCard.
 * No user-progress data is available yet, so status is always "recommended".
 */
function mapApiLesson(api: ApiLesson): Lesson {
  return {
    id: api.id,
    title: api.title,
    type: deriveContentType(api.order_index),
    status: "recommended" as LessonStatus,
    duration: deriveDuration(api),
    level: mapLevel(api.level),
    progress: 0,
    detail: buildDetail(api),
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseLessonsResult {
  lessons: Lesson[];
  loading: boolean;
  error: string | null;
}

/**
 * useLessons
 *
 * Returns the mapped lesson list, a loading flag, and an error message.
 * Falls back gracefully when the backend is unreachable.
 */
export function useLessons(): UseLessonsResult {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getLessons()
      .then((data) => {
        if (cancelled) return;
        setLessons(data.map(mapApiLesson));
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { lessons, loading, error };
}
