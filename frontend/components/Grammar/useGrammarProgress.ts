/**
 * useGrammarProgress.ts
 *
 * Server-backed grammar progression hook (Wave 5.4.5 commit 2/3).
 *
 * Progression chain:
 *   English Tense (Present → Past → Future) → Passive Voice → Modal Verbs → Final Exam
 *
 * State source:
 *   - On mount: GET /api/v1/grammar/progress hydrates lessonResults,
 *     examResults, and totalXp.
 *   - On completion: POST /grammar/progress/lesson | exam updates the
 *     local state optimistically and writes through to the server.
 *     The server emits xp_ledger via awardXp; replays are idempotent
 *     by migration 0041's UNIQUE (user_id, reason, ref_id).
 *
 * The localStorage key 'lingona-grammar-progress' is left intact in
 * this commit — Wave 5.4.5 commit 3/3 reads it once on the next
 * authenticated load, POSTs to /grammar/backfill, and clears it on
 * success. Until that commit lands, fresh users persist via the API
 * and existing localStorage progress is dormant (still on disk, not
 * read).
 *
 * Hook return shape preserved verbatim from the pre-Wave-5.4.5
 * version so the 19 Grammar consumer components don't change.
 */

"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { GRAMMAR_UNITS, GRAMMAR_TOPICS, TOTAL_GRAMMAR_LESSONS } from "./grammarData";
import {
  getGrammarProgress,
  recordGrammarLesson,
  recordGrammarExam,
} from "@/lib/api";
import { useAuthStore } from "@/lib/stores/authStore";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LessonResult {
  lessonId: string;
  score: number; // 0-100
  completedAt: string; // ISO date
}

export interface ExamResult {
  unitId: string; // or "final"
  score: number;
  passed: boolean;
  completedAt: string;
}

interface GrammarProgressData {
  lessonResults: Record<string, LessonResult>; // lessonId → result
  examResults: Record<string, ExamResult>; // unitId or "final" → result
  totalXp: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "lingona-grammar-progress";
const XP_PER_LESSON = 10;
const XP_PERFECT_BONUS = 5;
const XP_PER_EXAM = 20;
const XP_FINAL_EXAM = 50;
const XP_PER_LEVEL = 100;

// Topic dependency chain: topic ID → required predecessor ID(s)
// Passive Voice requires all 3 tense unit exams passed
// Modal Verbs requires Passive Voice exam passed
const TOPIC_DEPENDENCIES: Record<string, string[]> = {
  "topic-passive-voice": GRAMMAR_UNITS.map((u) => u.id), // all tense unit exams
  "topic-modal-verbs": ["topic-passive-voice"],
};

// ---------------------------------------------------------------------------
// Level computation
// ---------------------------------------------------------------------------

export function computeLevel(xp: number): { level: number; currentXp: number; nextLevelXp: number } {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const currentXp = xp % XP_PER_LEVEL;
  return { level, currentXp, nextLevelXp: XP_PER_LEVEL };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

const EMPTY_PROGRESS: GrammarProgressData = { lessonResults: {}, examResults: {}, totalXp: 0 };

export interface UseGrammarProgressResult {
  isLessonCompleted: (lessonId: string) => boolean;
  getLessonScore: (lessonId: string) => number | null;
  /** Record completion. Returns XP earned. */
  completeLesson: (lessonId: string, score: number) => number;
  /** Record exam completion. Returns XP earned. */
  completeExam: (unitId: string, score: number, passed: boolean) => number;
  isExamPassed: (unitId: string) => boolean;
  getExamResult: (unitId: string) => ExamResult | null;
  isLessonUnlocked: (lessonId: string) => boolean;
  isUnitUnlocked: (unitId: string) => boolean;
  /** Whether all tense unit exams are passed. */
  allTensesComplete: boolean;
  /** Whether the final exam is unlocked (all units + topics complete). */
  isFinalExamUnlocked: boolean;
  totalXp: number;
  /** Current level (1-based). */
  level: number;
  /** XP progress within current level. */
  levelProgress: { currentXp: number; nextLevelXp: number };
  completedLessonsCount: number;
  totalLessons: number;
  /** Total lessons across ALL content (tenses + topics). */
  totalAllLessons: number;
  /** Count of all completed lessons (tenses + topics). */
  completedAllLessonsCount: number;
  reset: () => void;
}

export function useGrammarProgress(): UseGrammarProgressResult {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const [data, setData] = useState<GrammarProgressData>(EMPTY_PROGRESS);

  // Hydrate from server on mount + when the authenticated user changes.
  // No re-fetch on completion calls — those write through to local state
  // optimistically. The server xp_earned and totalXp are recomputed from
  // xp_ledger; the FE keeps a tier-based local total during the session
  // for snappy UI, then re-hydrates from server next mount.
  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setData(EMPTY_PROGRESS);
      return;
    }
    (async () => {
      try {
        const remote = await getGrammarProgress();
        if (cancelled) return;
        setData({
          lessonResults: remote.lessonResults ?? {},
          examResults: remote.examResults ?? {},
          totalXp: remote.totalXp ?? 0,
        });
      } catch {
        // Silent — keep EMPTY_PROGRESS so the UI shows "not yet started"
        // rather than blocking. Wave 5.4.5 commit 3/3 backfill flow will
        // recover any pre-existing localStorage progress.
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  // Only count tenses lessons for the tenses progress display
  const tensesLessonIds = useMemo(
    () => new Set(GRAMMAR_UNITS.flatMap((u) => u.lessons.map((l) => l.id))),
    []
  );

  const completedLessonsCount = useMemo(
    () =>
      Object.keys(data.lessonResults).filter((id) => tensesLessonIds.has(id))
        .length,
    [data.lessonResults, tensesLessonIds]
  );

  // All lessons count (tenses + topics)
  const totalAllLessons = useMemo(
    () =>
      GRAMMAR_UNITS.reduce((sum, u) => sum + u.lessons.length, 0) +
      GRAMMAR_TOPICS.reduce((sum, t) => sum + t.lessons.length, 0),
    []
  );

  const completedAllLessonsCount = useMemo(
    () => Object.keys(data.lessonResults).length,
    [data.lessonResults]
  );

  // Level
  const { level, currentXp: levelCurrentXp, nextLevelXp } = useMemo(
    () => computeLevel(data.totalXp),
    [data.totalXp]
  );

  const isLessonCompleted = useCallback(
    (lessonId: string) => lessonId in data.lessonResults,
    [data.lessonResults]
  );

  const getLessonScore = useCallback(
    (lessonId: string) => data.lessonResults[lessonId]?.score ?? null,
    [data.lessonResults]
  );

  const completeLesson = useCallback(
    (lessonId: string, score: number): number => {
      const xp = XP_PER_LESSON + (score >= 100 ? XP_PERFECT_BONUS : 0);
      // Optimistic in-memory update so the UI reacts instantly. The
      // server is the source of truth on next hydrate; replays are
      // idempotent via xp_ledger UNIQUE (Wave 2 0041).
      setData((prev) => ({
        ...prev,
        lessonResults: {
          ...prev.lessonResults,
          [lessonId]: { lessonId, score, completedAt: new Date().toISOString() },
        },
        totalXp: prev.totalXp + xp,
      }));
      // Fire-and-forget; the hook does not block on the network. If the
      // POST fails the local state will resync on the next mount.
      recordGrammarLesson(lessonId, score).catch(() => { /* silent — server reconciles on next hydrate */ });
      return xp;
    },
    []
  );

  const completeExam = useCallback(
    (unitId: string, score: number, passed: boolean): number => {
      const xp = unitId === "final" ? XP_FINAL_EXAM : XP_PER_EXAM;
      const earnedXp = passed ? xp : 0;
      setData((prev) => ({
        ...prev,
        examResults: {
          ...prev.examResults,
          [unitId]: { unitId, score, passed, completedAt: new Date().toISOString() },
        },
        totalXp: prev.totalXp + earnedXp,
      }));
      recordGrammarExam(unitId, score, passed).catch(() => { /* silent — server reconciles on next hydrate */ });
      return earnedXp;
    },
    []
  );

  const isExamPassed = useCallback(
    (unitId: string) => data.examResults[unitId]?.passed === true,
    [data.examResults]
  );

  const getExamResult = useCallback(
    (unitId: string) => data.examResults[unitId] ?? null,
    [data.examResults]
  );

  const isLessonUnlocked = useCallback(
    (lessonId: string): boolean => {
      // Check tenses curriculum (sequential cross-unit gating)
      for (const unit of GRAMMAR_UNITS) {
        for (let i = 0; i < unit.lessons.length; i++) {
          if (unit.lessons[i].id === lessonId) {
            if (i === 0) {
              const unitIndex = GRAMMAR_UNITS.indexOf(unit);
              if (unitIndex === 0) return true;
              return data.examResults[GRAMMAR_UNITS[unitIndex - 1].id]?.passed === true;
            }
            return unit.lessons[i - 1].id in data.lessonResults;
          }
        }
      }
      // Check standalone grammar topics — respect dependency chain
      for (const topic of GRAMMAR_TOPICS) {
        for (let i = 0; i < topic.lessons.length; i++) {
          if (topic.lessons[i].id === lessonId) {
            // First, check if the topic itself is unlocked
            const deps = TOPIC_DEPENDENCIES[topic.id];
            if (deps) {
              const topicUnlocked = deps.every(
                (depId) => data.examResults[depId]?.passed === true
              );
              if (!topicUnlocked) return false;
            }
            if (i === 0) return true; // first lesson in unlocked topic
            return topic.lessons[i - 1].id in data.lessonResults;
          }
        }
      }
      return false;
    },
    [data.lessonResults, data.examResults]
  );

  const isUnitUnlocked = useCallback(
    (unitId: string): boolean => {
      // Tenses curriculum: sequential gating
      const unitIndex = GRAMMAR_UNITS.findIndex((u) => u.id === unitId);
      if (unitIndex === 0) return true;
      if (unitIndex > 0) {
        return data.examResults[GRAMMAR_UNITS[unitIndex - 1].id]?.passed === true;
      }
      // Grammar topics: check dependency chain
      const deps = TOPIC_DEPENDENCIES[unitId];
      if (deps) {
        return deps.every((depId) => data.examResults[depId]?.passed === true);
      }
      // Unknown topic with no dependencies: unlocked
      return true;
    },
    [data.examResults]
  );

  // All 3 tense unit exams passed
  const allTensesComplete = useMemo(
    () => GRAMMAR_UNITS.every((u) => data.examResults[u.id]?.passed === true),
    [data.examResults]
  );

  // Final exam: requires ALL unit exams AND ALL topic exams passed
  const isFinalExamUnlocked = useMemo(
    () => {
      const tensesOk = GRAMMAR_UNITS.every((u) => data.examResults[u.id]?.passed === true);
      const topicsOk = GRAMMAR_TOPICS.every((t) => data.examResults[t.id]?.passed === true);
      return tensesOk && topicsOk;
    },
    [data.examResults]
  );

  const reset = useCallback(() => {
    // Local-only reset — clears the session view. The server-side
    // grammar_progress + xp_ledger rows are NOT deleted (audit
    // contract: ledger is append-only). Re-hydrating in a new
    // session will resurrect the user's actual progress.
    setData(EMPTY_PROGRESS);
  }, []);

  return {
    isLessonCompleted,
    getLessonScore,
    completeLesson,
    completeExam,
    isExamPassed,
    getExamResult,
    isLessonUnlocked,
    isUnitUnlocked,
    allTensesComplete,
    isFinalExamUnlocked,
    totalXp: data.totalXp,
    level,
    levelProgress: { currentXp: levelCurrentXp, nextLevelXp },
    completedLessonsCount,
    totalLessons: TOTAL_GRAMMAR_LESSONS,
    totalAllLessons,
    completedAllLessonsCount,
    reset,
  };
}
