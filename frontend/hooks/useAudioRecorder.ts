"use client";

/**
 * useAudioRecorder
 *
 * Cross-browser audio capture via the native MediaRecorder API. Replaces the
 * Chrome/Edge-only `useVoiceInput` (Web Speech API) — Safari/Firefox/mobile
 * now get the same capture path as Chrome, and transcription happens on the
 * backend (Whisper) rather than in the browser.
 *
 * Contract:
 *  - `start()`  → requests mic permission and starts recording.
 *  - `stop()`   → stops recording; resolves `audioBlob` with the final webm.
 *  - `cancel()` → stops recording without emitting a blob (discards audio).
 *  - `isSupported = false` when the runtime can't produce audio/webm;opus.
 *
 * Safety:
 *  - Media tracks are always released on stop/cancel/unmount (no stuck mic).
 *  - Multiple `start()` calls abort the previous session first.
 *  - All state is component-local; no singletons.
 */

import { useCallback, useEffect, useRef, useState } from "react";

const MIME_TYPE = "audio/webm;codecs=opus";
const AUDIO_BITS_PER_SECOND = 64_000; // 64 kbps — voice-quality, small file

export interface AudioRecorderState {
  isSupported: boolean;
  isRecording: boolean;
  audioBlob: Blob | null;
  durationMs: number;
  /** Raw error string from the browser (English, may be empty). For debugging. */
  error: string | null;
  /** Vietnamese peer-voice error mapped from {@link error}. Display this to users. */
  errorMessage: string | null;
  start: () => Promise<void>;
  stop: () => Promise<Blob | null>;
  cancel: () => void;
  reset: () => void;
}

/**
 * Map a raw recorder/getUserMedia error string to a Vietnamese peer-voice
 * message that tells the user WHAT TO DO. Detection is best-effort: matches
 * DOMException names + common message substrings emitted by Chromium / Firefox
 * / Safari / Webkit.
 */
function mapErrorToVietnamese(raw: string | null): string | null {
  if (!raw) return null;
  const s = raw.toLowerCase();

  if (s.includes("notallowed") || s.includes("permission denied") || s.includes("permission dismissed")) {
    return "Lingona cần quyền dùng mic — bấm icon ổ khóa trên thanh địa chỉ trình duyệt để bật lại nha.";
  }
  if (s.includes("notfound") || s.includes("no device") || s.includes("requested device not found")) {
    return "Mình không tìm thấy mic. Bạn cắm tai nghe hoặc kiểm tra mic của máy chưa?";
  }
  if (s.includes("notreadable") || s.includes("could not start") || s.includes("device in use") || s.includes("hardware")) {
    return "Mic đang được app khác dùng. Bạn đóng Zoom / Google Meet / Discord rồi thử lại nha.";
  }
  if (s.includes("overconstrained") || s.includes("constraint")) {
    return "Mic hiện không tương thích với cấu hình. Bạn thử mic khác xem.";
  }
  if (s.includes("security") || s.includes("insecure")) {
    return "Trình duyệt chặn mic vì lý do bảo mật. Bạn dùng Chrome / Edge / Safari mới nhất nha.";
  }
  if (s.includes("not supported") || s.includes("audio recording is not supported")) {
    return "Trình duyệt này chưa hỗ trợ ghi âm. Bạn mở bằng Chrome / Edge / Safari mới nhất nha.";
  }
  // Generic fallback — keep it actionable.
  return "Mic chưa thu được tiếng. Bạn thử reload trang xem.";
}

export function useAudioRecorder(): AudioRecorderState {
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const stopResolverRef = useRef<((blob: Blob | null) => void) | null>(null);

  // Feature detection runs once on mount (window-only, SSR-safe).
  useEffect(() => {
    if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
      setIsSupported(false);
      return;
    }
    try {
      setIsSupported(MediaRecorder.isTypeSupported(MIME_TYPE));
    } catch {
      setIsSupported(false);
    }
  }, []);

  // Guaranteed cleanup on unmount — never leak the mic.
  useEffect(() => {
    return () => {
      try {
        recorderRef.current?.stop();
      } catch { /* already stopped */ }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      recorderRef.current = null;
    };
  }, []);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    setDurationMs(0);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Audio recording is not supported in this browser.");
      return;
    }

    // Abort any previous session so start() is idempotent-ish.
    try {
      recorderRef.current?.stop();
    } catch { /* already stopped */ }
    releaseStream();

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Microphone permission denied.";
      setError(msg);
      return;
    }
    streamRef.current = stream;

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, {
        mimeType: MIME_TYPE,
        audioBitsPerSecond: AUDIO_BITS_PER_SECOND,
      });
    } catch (e) {
      releaseStream();
      setError(e instanceof Error ? e.message : "Failed to start recorder.");
      return;
    }

    chunksRef.current = [];
    recorder.ondataavailable = (evt) => {
      if (evt.data && evt.data.size > 0) chunksRef.current.push(evt.data);
    };
    recorder.onerror = (evt: Event) => {
      const msg = (evt as unknown as { error?: { message?: string } }).error?.message ?? "Recorder error.";
      setError(msg);
    };
    recorder.onstop = () => {
      const elapsed = Date.now() - startedAtRef.current;
      setDurationMs(elapsed);
      releaseStream();
      setIsRecording(false);

      const resolver = stopResolverRef.current;
      stopResolverRef.current = null;

      if (chunksRef.current.length === 0) {
        setAudioBlob(null);
        resolver?.(null);
        return;
      }
      const blob = new Blob(chunksRef.current, { type: MIME_TYPE });
      chunksRef.current = [];
      setAudioBlob(blob);
      resolver?.(blob);
    };

    recorderRef.current = recorder;
    startedAtRef.current = Date.now();
    recorder.start();
    setIsRecording(true);
  }, [releaseStream]);

  const stop = useCallback(async (): Promise<Blob | null> => {
    const rec = recorderRef.current;
    if (!rec || rec.state === "inactive") return null;

    return new Promise<Blob | null>((resolve) => {
      stopResolverRef.current = resolve;
      try {
        rec.stop();
      } catch {
        stopResolverRef.current = null;
        releaseStream();
        setIsRecording(false);
        resolve(null);
      }
    });
  }, [releaseStream]);

  const cancel = useCallback(() => {
    const rec = recorderRef.current;
    // Clear chunks BEFORE stop so onstop produces a null blob.
    chunksRef.current = [];
    try {
      rec?.stop();
    } catch { /* already stopped */ }
    releaseStream();
    setIsRecording(false);
    setAudioBlob(null);
  }, [releaseStream]);

  const reset = useCallback(() => {
    setAudioBlob(null);
    setDurationMs(0);
    setError(null);
  }, []);

  return {
    isSupported,
    isRecording,
    audioBlob,
    durationMs,
    error,
    errorMessage: mapErrorToVietnamese(error),
    start,
    stop,
    cancel,
    reset,
  };
}
