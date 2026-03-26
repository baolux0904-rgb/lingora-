/**
 * useGrammarSounds.ts
 *
 * Grammar-scoped audio feedback utility.
 * Preloads sound files and exposes safe play methods.
 *
 * Safety:
 * - Uses Audio API with try/catch for graceful degradation
 * - Resets currentTime before play to prevent overlap buildup
 * - No autoplay — only triggered by user interaction callbacks
 * - Singleton instances per sound — no memory leaks
 * - If playback fails (browser policy, missing file), silently ignores
 */

"use client";

import { useRef, useCallback, useEffect } from "react";

// ---------------------------------------------------------------------------
// Sound paths (served from public/)
// ---------------------------------------------------------------------------

const SOUNDS = {
  click: "/sounds/click.mp3",
  correct: "/sounds/correct.mp3",
  wrong: "/sounds/wrong.mp3",
  levelup: "/sounds/levelup.mp3",
} as const;

type SoundKey = keyof typeof SOUNDS;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGrammarSounds() {
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  // Preload on mount (client-side only)
  useEffect(() => {
    if (typeof window === "undefined") return;

    for (const [key, src] of Object.entries(SOUNDS)) {
      try {
        const audio = new Audio(src);
        audio.preload = "auto";
        audio.volume = 0.5;
        audioRefs.current[key] = audio;
      } catch {
        // Audio construction failed — degrade silently
        audioRefs.current[key] = null;
      }
    }

    return () => {
      // Cleanup on unmount
      for (const audio of Object.values(audioRefs.current)) {
        if (audio) {
          audio.pause();
          audio.src = "";
        }
      }
      audioRefs.current = {};
    };
  }, []);

  const play = useCallback((key: SoundKey) => {
    const audio = audioRefs.current[key];
    if (!audio) return;
    try {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Browser blocked playback — silently ignore
      });
    } catch {
      // Playback error — silently ignore
    }
  }, []);

  const playClick = useCallback(() => play("click"), [play]);
  const playCorrect = useCallback(() => play("correct"), [play]);
  const playWrong = useCallback(() => play("wrong"), [play]);
  const playLevelUp = useCallback(() => play("levelup"), [play]);

  return { playClick, playCorrect, playWrong, playLevelUp };
}
