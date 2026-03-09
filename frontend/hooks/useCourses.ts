/**
 * hooks/useCourses.ts
 *
 * Fetches all courses with their units and lesson nodes, then maps the API
 * response to the `UnitData` / `PathNode` shape that LessonsPage renders.
 *
 * Strategy:
 *  1. GET /api/v1/courses  — get the list of courses.
 *  2. GET /api/v1/courses/:id  — fetch full unit+lesson tree for each course
 *     (in parallel). Typically only 1-2 courses exist in Phase 1.
 *  3. Flatten into a single `UnitData[]` ordered across courses.
 *
 * Mapping decisions (Phase 1 — no user progress yet):
 *
 *  unit.level  → derived from unit's position inside the course:
 *                 1st unit → "B1", 2nd → "B2", 3rd+ → "C1".
 *                 The backend schema has no level column on units yet.
 *
 *  node.status → first lesson of the very first unit = "current" (start here),
 *                everything else = "locked".
 *                Will reflect real completion state once Phase 3 is wired up.
 *
 *  node.difficulty → derived from node type:
 *                    "lesson" → "easy", "challenge" → "medium", "boss" → "hard".
 */

"use client";

import { useState, useEffect } from "react";
import {
  getCourses,
  getCourseById,
  type ApiUnit,
  type ApiUnitLesson,
} from "@/lib/api";

// ---------------------------------------------------------------------------
// Shape types — exported so LessonsPage can import instead of duplicating.
// ---------------------------------------------------------------------------

export type NodeType = "lesson" | "challenge" | "boss";
export type NodeStatus = "completed" | "current" | "locked";
export type Difficulty = "easy" | "medium" | "hard";
export type Level = "B1" | "B2" | "C1";

export interface PathNode {
  id: string;
  title: string;
  subtitle?: string;
  type: NodeType;
  status: NodeStatus;
  xp?: number;
  duration?: number;
  difficulty?: Difficulty;
  level?: Level;
  progress?: number;
}

export interface UnitData {
  id: string;
  title: string;
  description: string;
  level: Level;
  nodes: PathNode[];
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

/** Derive CEFR level for a unit based on its 0-based index within the course. */
function unitLevel(unitIndex: number): Level {
  if (unitIndex === 0) return "B1";
  if (unitIndex === 1) return "B2";
  return "C1";
}

/** Map node type to a difficulty label for the DifficultyBadge. */
function nodeDifficulty(type: NodeType): Difficulty {
  if (type === "boss") return "hard";
  if (type === "challenge") return "medium";
  return "easy";
}

/**
 * Map one API lesson node to a PathNode.
 *
 * @param lesson     - lesson data from the API
 * @param isFirst    - true only for the very first lesson in the first unit
 */
function mapNode(lesson: ApiUnitLesson, isFirst: boolean): PathNode {
  return {
    id: lesson.id,
    title: lesson.title,
    type: lesson.type,
    // Phase 1: only the entry point is "current"; everything else is locked.
    status: isFirst ? "current" : "locked",
    xp: lesson.xp_reward,
    difficulty: nodeDifficulty(lesson.type),
    progress: 0,
  };
}

/**
 * Map one API unit (with nested lessons) to a UnitData.
 *
 * @param unit       - unit data from the API
 * @param unitIndex  - 0-based position within the course (used for level)
 * @param isFirst    - true only for the very first unit across all courses
 */
function mapUnit(unit: ApiUnit, unitIndex: number, isFirst: boolean): UnitData {
  return {
    id: String(unit.id),
    title: unit.title,
    // Units have no description in the schema yet — left empty for Phase 1.
    description: "",
    level: unitLevel(unitIndex),
    nodes: unit.lessons.map((lesson, lessonIndex) =>
      mapNode(lesson, isFirst && lessonIndex === 0)
    ),
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseCoursesResult {
  units: UnitData[];
  loading: boolean;
  error: string | null;
}

/**
 * useCourses
 *
 * Returns a flat list of UnitData (all units across all courses), a loading
 * flag, and an error message. Falls back gracefully when the backend is down.
 */
export function useCourses(): UseCoursesResult {
  const [units, setUnits] = useState<UnitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Step 1: get the course list to discover IDs.
        const courses = await getCourses();

        if (cancelled) return;

        if (courses.length === 0) {
          setUnits([]);
          setLoading(false);
          return;
        }

        // Step 2: fetch full details (units + lessons) for all courses in parallel.
        const details = await Promise.all(
          courses.map((c) => getCourseById(c.id))
        );

        if (cancelled) return;

        // Step 3: flatten all units across all courses into one ordered list.
        let globalUnitIndex = 0;
        const allUnits: UnitData[] = [];

        for (const course of details) {
          for (let i = 0; i < course.units.length; i++) {
            const isFirstEver = globalUnitIndex === 0;
            allUnits.push(mapUnit(course.units[i], i, isFirstEver));
            globalUnitIndex++;
          }
        }

        setUnits(allUnits);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
        setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { units, loading, error };
}
