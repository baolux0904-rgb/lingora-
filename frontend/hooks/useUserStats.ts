import { useMemo } from "react";
import type { ApiProgressItem, ApiLesson } from "@/lib/api";

export interface UserStats {
  totalXp: number;
  level: number;
  xp: number;           // XP within current level
  xpToNext: number;     // XP needed to reach next level
  streak: number;       // consecutive days with at least one completed lesson
  completedLessons: number;
  vocabLearned: number; // sum of vocab_count from completed lessons
  studyMinutes: number; // estimated: completedLessons × MINUTES_PER_LESSON
}

const XP_PER_LESSON = 10;
const XP_PER_LEVEL = 100;
/** Average lesson duration in minutes — derived from content-count estimates. */
const MINUTES_PER_LESSON = 9;

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function computeUserStats(
  progress: ApiProgressItem[],
  lessons: ApiLesson[] = []
): UserStats {
  const completed = progress.filter((p) => p.completed);
  const totalXp = completed.length * XP_PER_LESSON;
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xp = totalXp % XP_PER_LEVEL;
  const xpToNext = XP_PER_LEVEL - xp;

  // Build a set of unique days that had at least one completed lesson
  const activeDays = new Set(
    completed
      .filter((p) => p.completedAt !== null)
      .map((p) => dateKey(new Date(p.completedAt!)))
  );

  // Streak: consecutive days counting back from today.
  // If today has no activity yet, the streak is still alive from yesterday.
  const today = new Date();
  const todayKey = dateKey(today);
  const startOffset = activeDays.has(todayKey) ? 0 : 1;

  let streak = 0;
  for (let i = startOffset; i <= 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (activeDays.has(dateKey(d))) {
      streak++;
    } else {
      break;
    }
  }

  // Vocabulary: sum vocab_count from lessons the user has completed
  const completedIds = new Set(completed.map((p) => p.lessonId));
  const vocabLearned = lessons
    .filter((l) => completedIds.has(l.id))
    .reduce((sum, l) => sum + (l.vocab_count ?? 0), 0);

  // Study time: estimated from number of completed lessons
  const studyMinutes = completed.length * MINUTES_PER_LESSON;

  return {
    totalXp,
    level,
    xp,
    xpToNext,
    streak,
    completedLessons: completed.length,
    vocabLearned,
    studyMinutes,
  };
}

export function useUserStats(
  progress: ApiProgressItem[],
  lessons: ApiLesson[] = []
): UserStats {
  return useMemo(() => computeUserStats(progress, lessons), [progress, lessons]);
}
