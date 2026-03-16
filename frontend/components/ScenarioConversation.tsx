"use client";

/**
 * ScenarioConversation.tsx
 *
 * Full-screen conversation UI for AI role-play scenarios.
 * Chat-bubble layout with text input per turn.
 * Scores hidden during conversation — only shown on session summary.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  startScenarioSession,
  submitScenarioTurn,
  endScenarioSession,
} from "@/lib/api";
import type {
  Scenario,
  ConversationTurn,
  EndSessionResult,
} from "@/lib/types";
import ScenarioSummary from "./ScenarioSummary";

// ─── Props ────────────────────────────────────────────────────────────

interface ScenarioConversationProps {
  scenario: Scenario;
  onClose: () => void;
  onComplete?: () => void;
}

// ─── State ────────────────────────────────────────────────────────────

type Phase = "loading" | "conversation" | "ending" | "summary" | "error";

export default function ScenarioConversation({
  scenario,
  onClose,
  onComplete,
}: ScenarioConversationProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<EndSessionResult | null>(null);
  const [startTime] = useState(() => Date.now());

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new turns
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, sending]);

  // Start session on mount
  useEffect(() => {
    let cancelled = false;

    startScenarioSession(scenario.id)
      .then((result) => {
        if (cancelled) return;
        setSessionId(result.sessionId);
        // Map backend turns to frontend ConversationTurn shape
        const mappedTurns: ConversationTurn[] = result.turns.map((t) => ({
          id: `init-${t.turnIndex}`,
          turnIndex: t.turnIndex,
          role: t.role,
          content: t.content,
          audioStorageKey: null,
          scores: null,
          feedback: null,
          createdAt: t.createdAt,
        }));
        setTurns(mappedTurns);
        setPhase("conversation");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to start session");
        setPhase("error");
      });

    return () => {
      cancelled = true;
    };
  }, [scenario.id]);

  // Submit a user message
  const handleSend = useCallback(async () => {
    if (!sessionId || !inputText.trim() || sending) return;

    const message = inputText.trim();
    setInputText("");
    setSending(true);

    // Optimistic: add user turn immediately
    const tempUserTurn: ConversationTurn = {
      id: `temp-${Date.now()}`,
      turnIndex: turns.length,
      role: "user",
      content: message,
      audioStorageKey: null,
      scores: null,
      feedback: null,
      createdAt: new Date().toISOString(),
    };
    setTurns((prev) => [...prev, tempUserTurn]);

    try {
      const result = await submitScenarioTurn(sessionId, message);
      // Replace optimistic turn + add AI turn
      setTurns((prev) => {
        const withoutTemp = prev.filter((t) => t.id !== tempUserTurn.id);
        return [
          ...withoutTemp,
          {
            id: `user-${result.userTurn.turnIndex}`,
            turnIndex: result.userTurn.turnIndex,
            role: result.userTurn.role,
            content: result.userTurn.content,
            audioStorageKey: null,
            scores: null,
            feedback: null,
            createdAt: result.userTurn.createdAt,
          },
          {
            id: `ai-${result.aiTurn.turnIndex}`,
            turnIndex: result.aiTurn.turnIndex,
            role: result.aiTurn.role,
            content: result.aiTurn.content,
            audioStorageKey: null,
            scores: null,
            feedback: null,
            createdAt: result.aiTurn.createdAt,
          },
        ];
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to send message";
      setError(msg);
      // Remove optimistic turn on error
      setTurns((prev) => prev.filter((t) => t.id !== tempUserTurn.id));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [sessionId, inputText, sending, turns.length]);

  // End conversation and get scores
  const handleEndConversation = useCallback(async () => {
    if (!sessionId) return;
    setPhase("ending");

    try {
      const durationMs = Date.now() - startTime;
      const result = await endScenarioSession(sessionId, durationMs);
      setSummary(result);
      setPhase("summary");
      onComplete?.();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to end session";
      setError(msg);
      setPhase("error");
    }
  }, [sessionId, startTime, onComplete]);

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Count user turns
  const userTurnCount = turns.filter((t) => t.role === "user").length;

  // ─── Render ─────────────────────────────────────────────────────────

  // Summary screen
  if (phase === "summary" && summary) {
    return <ScenarioSummary result={summary} onClose={onClose} />;
  }

  return (
    <div
      style={{ background: "var(--color-bg)" }}
      className="fixed inset-0 z-50 flex flex-col"
    >
      {/* ── Header ── */}
      <div
        style={{
          background: "var(--color-bg-card)",
          borderBottom: "1px solid var(--color-border)",
        }}
        className="flex items-center gap-3 px-4 py-3 shrink-0"
      >
        <button
          onClick={onClose}
          style={{ color: "var(--color-text-secondary)" }}
          className="text-xl hover:opacity-70"
        >
          ✕
        </button>
        <div className="flex-1 min-w-0">
          <div
            style={{ color: "var(--color-text)" }}
            className="font-semibold truncate"
          >
            {scenario.emoji} {scenario.title}
          </div>
          <div
            style={{ color: "var(--color-text-secondary)" }}
            className="text-xs"
          >
            {scenario.difficulty} · {scenario.category}
          </div>
        </div>
        {phase === "conversation" && userTurnCount >= 2 && (
          <button
            onClick={handleEndConversation}
            style={{
              background: "var(--color-primary)",
              color: "#fff",
            }}
            className="px-4 py-1.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
          >
            End Chat
          </button>
        )}
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Loading state */}
        {phase === "loading" && (
          <div className="flex items-center justify-center h-full">
            <div
              style={{
                borderColor: "var(--color-border)",
                borderTopColor: "var(--color-primary)",
              }}
              className="w-8 h-8 border-2 rounded-full animate-spin"
            />
          </div>
        )}

        {/* Error state */}
        {phase === "error" && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div
              style={{ color: "var(--color-warning)" }}
              className="text-lg"
            >
              ⚠️ {error || "Something went wrong"}
            </div>
            <button
              onClick={onClose}
              style={{ color: "var(--color-primary)" }}
              className="underline"
            >
              Go back
            </button>
          </div>
        )}

        {/* Ending state */}
        {phase === "ending" && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div
              style={{
                borderColor: "var(--color-border)",
                borderTopColor: "var(--color-primary)",
              }}
              className="w-8 h-8 border-2 rounded-full animate-spin"
            />
            <div
              style={{ color: "var(--color-text-secondary)" }}
              className="text-sm"
            >
              Analyzing your conversation...
            </div>
          </div>
        )}

        {/* Chat bubbles */}
        {(phase === "conversation" || phase === "ending") &&
          turns.map((turn) => (
            <div
              key={turn.id}
              className={`flex ${turn.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                style={{
                  background:
                    turn.role === "user"
                      ? "var(--color-primary)"
                      : "var(--color-bg-card)",
                  color:
                    turn.role === "user" ? "#fff" : "var(--color-text)",
                  border:
                    turn.role === "assistant"
                      ? "1px solid var(--color-border)"
                      : "none",
                }}
                className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${
                  turn.role === "user"
                    ? "rounded-2xl rounded-br-md"
                    : "rounded-2xl rounded-bl-md"
                }`}
              >
                {turn.content}
              </div>
            </div>
          ))}

        {/* Typing indicator */}
        {sending && (
          <div className="flex justify-start">
            <div
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
              }}
              className="px-4 py-2.5 rounded-2xl rounded-bl-md"
            >
              <div className="flex gap-1">
                <span
                  style={{
                    background: "var(--color-text-secondary)",
                    animationDelay: "0ms",
                  }}
                  className="w-2 h-2 rounded-full animate-bounce"
                />
                <span
                  style={{
                    background: "var(--color-text-secondary)",
                    animationDelay: "150ms",
                  }}
                  className="w-2 h-2 rounded-full animate-bounce"
                />
                <span
                  style={{
                    background: "var(--color-text-secondary)",
                    animationDelay: "300ms",
                  }}
                  className="w-2 h-2 rounded-full animate-bounce"
                />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Input area ── */}
      {phase === "conversation" && (
        <div
          style={{
            background: "var(--color-bg-card)",
            borderTop: "1px solid var(--color-border)",
          }}
          className="px-4 py-3 shrink-0"
        >
          {/* Turn counter hint */}
          {userTurnCount < 2 && (
            <div
              style={{ color: "var(--color-text-secondary)" }}
              className="text-xs text-center mb-2"
            >
              💡 Reply at least 2 times before ending the chat
            </div>
          )}

          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your reply..."
              rows={1}
              disabled={sending}
              style={{
                background: "var(--color-primary-soft)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
              }}
              className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[color:var(--color-primary)] transition-colors placeholder:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || sending}
              style={{
                background: inputText.trim()
                  ? "var(--color-primary)"
                  : "var(--color-border)",
                color: inputText.trim()
                  ? "#fff"
                  : "var(--color-text-secondary)",
              }}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors disabled:opacity-50"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
