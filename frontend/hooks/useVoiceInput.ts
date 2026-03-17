"use client";

/**
 * useVoiceInput
 *
 * Web Speech API hook for voice-to-text in the IELTS conversation.
 * Uses SpeechRecognition (Chrome/Edge) with no API key or backend required.
 *
 * Behaviour:
 *  - startRecording() → mic opens, interim transcript appears live
 *  - stopRecording()  → recognition ends, onFinalTranscript called with final text
 *  - Auto-ends on silence (browser-managed)
 *  - isSupported = false on Firefox / unsupported browsers → caller shows text input fallback
 *
 * Safety:
 *  - Existing session aborted before starting a new one (no duplicate sessions)
 *  - onFinalTranscript called exactly once per recording session
 *  - Cleans up on unmount
 */

import { useState, useRef, useCallback, useEffect } from "react";

// ---------------------------------------------------------------------------
// Web Speech API type shims
// TypeScript's built-in dom lib may not include these — declare them locally.
// ---------------------------------------------------------------------------

interface ISpeechRecognition extends EventTarget {
  continuous:      boolean;
  interimResults:  boolean;
  lang:            string;
  maxAlternatives: number;
  start():  void;
  stop():   void;
  abort():  void;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onend:    (() => void) | null;
  onerror:  ((event: ISpeechRecognitionErrorEvent) => void) | null;
}

interface ISpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length:  number;
  [index: number]: { readonly transcript: string };
}

interface ISpeechRecognitionResultList {
  readonly length:      number;
  readonly resultIndex: number;
  [index: number]: ISpeechRecognitionResult;
}

interface ISpeechRecognitionEvent {
  readonly resultIndex: number;
  readonly results:     ISpeechRecognitionResultList;
}

interface ISpeechRecognitionErrorEvent {
  readonly error: string;
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

// Extend window for standard + webkit prefix
declare global {
  interface Window {
    SpeechRecognition?:       ISpeechRecognitionConstructor;
    webkitSpeechRecognition?: ISpeechRecognitionConstructor;
  }
}

export interface VoiceInputState {
  isSupported: boolean;
  isRecording: boolean;
  interimTranscript: string;
  startRecording: () => void;
  stopRecording: () => void;
}

/**
 * @param onFinalTranscript – called with the final transcript when recording ends.
 *                            Called exactly once per recording session.
 */
export function useVoiceInput(
  onFinalTranscript: (text: string) => void,
): VoiceInputState {
  const [isSupported, setIsSupported]         = useState(false);
  const [isRecording, setIsRecording]         = useState(false);
  const [interimTranscript, setInterim]       = useState("");

  const recognitionRef  = useRef<ISpeechRecognition | null>(null);
  const finalRef        = useRef<string>("");
  const onTranscriptRef = useRef(onFinalTranscript);

  // Keep callback ref up to date without invalidating startRecording
  useEffect(() => {
    onTranscriptRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  // Detect browser support once on mount (client-only)
  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setIsSupported(!!SR);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const startRecording = useCallback(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    // Abort any existing session
    recognitionRef.current?.abort();
    finalRef.current = "";

    const recognition = new SR();
    recognition.continuous      = false; // end on natural pause
    recognition.interimResults  = true;
    recognition.lang            = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalRef.current += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setInterim(interim);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterim("");
      const text = finalRef.current.trim();
      finalRef.current = "";
      if (text) {
        onTranscriptRef.current(text);
      }
    };

    recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
      // "no-speech" and "aborted" are expected — don't log as errors
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.warn("SpeechRecognition error:", event.error);
      }
      setIsRecording(false);
      setInterim("");
      finalRef.current = "";
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    // .stop() triggers onend → onFinalTranscript (graceful)
    // .abort() would discard the result — use stop() here
    recognitionRef.current?.stop();
  }, []);

  return { isSupported, isRecording, interimTranscript, startRecording, stopRecording };
}
