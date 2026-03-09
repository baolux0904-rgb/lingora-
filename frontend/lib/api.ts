/**
 * lib/api.ts
 *
 * Thin HTTP client for the Lingora backend.
 *
 * Base URL is read from NEXT_PUBLIC_API_URL (set in .env.local) and falls
 * back to http://localhost:4000/api/v1 for local development — no extra
 * configuration needed to get started.
 *
 * All functions throw a plain Error with the backend's message on non-2xx
 * responses, so callers (hooks) can forward it directly to the error state.
 *
 * Authentication headers are NOT added here yet (Phase 2).
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

// ---------------------------------------------------------------------------
// Core fetch helper
// ---------------------------------------------------------------------------

/**
 * apiFetch<T>
 *
 * Fetches BASE_URL + path, checks for HTTP errors, unwraps the
 * standard `{ success, data, message }` envelope, and returns `data` as T.
 */
async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    // Do not cache — lesson data should always be fresh.
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      (json as { message?: string }).message ?? `API error ${res.status}`
    );
  }

  // Backend envelope: { success: true, data: T, message: string }
  return (json as { data: T }).data;
}

// ---------------------------------------------------------------------------
// Response shape types
// ---------------------------------------------------------------------------

/** Shape returned by GET /api/v1/lessons (list item, from lesson_summary view) */
export interface ApiLesson {
  id: string;
  title: string;
  description: string | null;
  level: "beginner" | "intermediate" | "advanced";
  order_index: number;
  vocab_count: number;
  quiz_count: number;
  speaking_count: number;
}

/** Shape returned by GET /api/v1/courses (list item, no units) */
export interface ApiCourse {
  id: number;
  title: string;
  description: string | null;
  level: "beginner" | "intermediate" | "advanced";
  language: string;
  thumbnail_url: string | null;
  created_at: string;
}

/**
 * A lesson node nested inside a unit.
 * Returned by GET /api/v1/courses/:courseId → units[n].lessons[n]
 */
export interface ApiUnitLesson {
  id: string;
  unit_id: number;
  title: string;
  /** Node category: regular lesson, mini-challenge, or end-of-unit boss. */
  type: "lesson" | "challenge" | "boss";
  order_index: number;
  xp_reward: number;
}

/** A unit with its lesson nodes, nested inside a course detail response. */
export interface ApiUnit {
  id: number;
  course_id: number;
  title: string;
  order_index: number;
  lessons: ApiUnitLesson[];
}

/** Full course detail returned by GET /api/v1/courses/:courseId */
export interface ApiCourseDetail extends ApiCourse {
  units: ApiUnit[];
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/lessons
 * Returns the flat list of all lessons with content counts.
 * Used by: LessonsSection (dashboard "Today's Lessons" grid).
 */
export async function getLessons(): Promise<ApiLesson[]> {
  // Envelope: { data: { lessons: ApiLesson[] } }
  const data = await apiFetch<{ lessons: ApiLesson[] }>("/lessons");
  return data.lessons;
}

/**
 * GET /api/v1/courses
 * Returns all courses (summaries only, no units).
 * Used by: useCourses hook to discover available course IDs.
 */
export async function getCourses(): Promise<ApiCourse[]> {
  return apiFetch<ApiCourse[]>("/courses");
}

/**
 * GET /api/v1/courses/:courseId
 * Returns a single course with fully-populated units → lessons.
 * Used by: useCourses hook to build the learning-path UI.
 */
export async function getCourseById(id: number): Promise<ApiCourseDetail> {
  return apiFetch<ApiCourseDetail>(`/courses/${id}`);
}
