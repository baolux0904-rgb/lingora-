"use client";

/**
 * WritingTab.tsx — Main IELTS Writing container.
 *
 * Phase state machine: intro → editor → pending → result → history
 * Includes: task type toggle, question input, textarea with live word count,
 * submit button, usage indicator, countdown timer, and navigation between phases.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { submitWritingEssay, startWritingFullTest, submitWritingFullTestTask, getInProgressWritingFullTest } from "@/lib/api";
import { useWritingResult } from "@/hooks/useWritingResult";
import { useDailyLimits } from "@/hooks/useDailyLimits";
import { useOnboardingStatus } from "@/lib/hooks/useOnboardingStatus";
import OnboardingGateModal from "@/components/Onboarding/OnboardingGateModal";
import UpgradeTrigger from "@/components/Pro/UpgradeTrigger";
import RemainingBadge from "@/components/Pro/RemainingBadge";
import ProUpgradeModal from "@/components/Pro/ProUpgradeModal";
import WritingResult from "./WritingResult";
import WritingFullTestResult from "./WritingFullTestResult";
import WritingHistory from "./WritingHistory";
import WritingTimerBar from "./WritingTimerBar";
import WritingNotesModal from "./WritingNotesModal";
import WritingPromptSelector from "./WritingPromptSelector";
import WritingChartRenderer from "./WritingChartRenderer";
import WritingEditorCore from "./WritingEditorCore";
import WritingFullTestShell from "./WritingFullTestShell";
import WritingExamChrome from "./WritingExamChrome";
import type { WritingTaskType, WritingQuestionDetail, WritingFullTestInProgress } from "@/lib/types";

// localStorage slot the resume-banner uses as a belt-and-braces hint.
// Backend is always the source of truth; this just survives a cold reload.
const FULL_TEST_LS_KEY = "lingona.writing.full_test_id";

interface WritingTabProps {
  onClose: () => void;
  /** Initial mode — used by Mode Selection routing (PR5a). Default "practice". */
  initialMode?: "practice" | "full_test";
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MIN_WORDS: Record<WritingTaskType, number> = { task1: 150, task2: 250 };
// Combined 60-min pool shared across Task 1 + Task 2 (real IELTS behavior).
const TOTAL_TIMER_SECONDS = 3600;
const EMPTY_TASK_BUFFERS: Record<WritingTaskType, string> = { task1: "", task2: "" };

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Phase = "intro" | "editor" | "pending" | "result" | "history" | "full_test_result";
type WritingMode = "practice" | "full_test";

export default function WritingTab({ onClose, initialMode }: WritingTabProps) {
  // Phase management — starts with intro
  const [phase, setPhase] = useState<Phase>("intro");
  // Practice (default) is pauseable and forgiving; Full Test mimics the real exam.
  const [mode, setMode] = useState<WritingMode>(initialMode ?? "practice");
  const limits = useDailyLimits();
  const [proModalOpen, setProModalOpen] = useState(false);

  // Editor state — per-task buffers so the user can freely switch without losing work.
  const [taskType, setTaskType] = useState<WritingTaskType>("task2");
  const [prompts, setPrompts] = useState<Record<WritingTaskType, WritingQuestionDetail | null>>({ task1: null, task2: null });
  const [essayTexts, setEssayTexts] = useState<Record<WritingTaskType, string>>(EMPTY_TASK_BUFFERS);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fullTestLoading, setFullTestLoading] = useState(false);
  const [fullTestError, setFullTestError] = useState<string | null>(null);
  const [fullTestId, setFullTestId] = useState<string | null>(null);
  // Per-task submission IDs captured during a Full Test run so we can
  // disable the editor for a task once it's been scored server-side.
  const [fullTestSubmitted, setFullTestSubmitted] = useState<Record<WritingTaskType, string | null>>({ task1: null, task2: null });
  const [fullTestResultId, setFullTestResultId] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<WritingFullTestInProgress | null>(null);
  const [resumeDismissed, setResumeDismissed] = useState(false);

  const activePrompt = prompts[taskType];
  const questionText = activePrompt?.question_text ?? "";
  const essayText = essayTexts[taskType];

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerStarted, setTimerStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pauseConfirmOpen, setPauseConfirmOpen] = useState(false);
  const [timeOutFired, setTimeOutFired] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);

  // Ephemeral toast slot — used for paste-blocked, time warnings, timeout messages.
  const [toast, setToast] = useState<{ message: string; key: number } | null>(null);
  // Fire-once guards for Practice-mode time warnings.
  const [warned5m, setWarned5m] = useState(false);
  const [warned1m, setWarned1m] = useState(false);

  // Scratch notes — kept in local state, reset on task switch / submit, NOT persisted to DB
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState<Record<WritingTaskType, string>>({ task1: "", task2: "" });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = useCallback((message: string) => {
    setToast({ message, key: Date.now() });
  }, []);

  // Practice-mode time warnings — fire once at 5min and 1min remaining.
  useEffect(() => {
    if (mode !== "practice" || !timerStarted || paused || timeLeft === null) return;
    if (!warned5m && timeLeft <= 300 && timeLeft > 60) {
      setWarned5m(true);
      showToast("Còn 5 phút");
    } else if (!warned1m && timeLeft <= 60 && timeLeft > 0) {
      setWarned1m(true);
      showToast("Còn 1 phút — cố lên!");
    }
  }, [mode, timerStarted, paused, timeLeft, warned5m, warned1m, showToast]);

  // Result state
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const { submission, loading: resultLoading, polling, timedOut: resultTimedOut, refetch: refetchResult } = useWritingResult(
    phase === "pending" || phase === "result" ? activeSubmissionId : null
  );

  // ---------------------------------------------------------------------------
  // Intro phase — auto-advance after 1.5s
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (phase === "intro") {
      const t = setTimeout(() => setPhase("editor"), 1500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // ---------------------------------------------------------------------------
  // Countdown timer
  // ---------------------------------------------------------------------------

  useEffect(() => {
    // Sprint 5C.2b4 (R2b): Full Test timer owned by WritingExamChrome.
    // WritingTab countdown narrowed to Practice mode only.
    if (mode !== "practice") return;
    if (!timerStarted || paused || timeLeft === null || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => (t !== null ? t - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, timerStarted, paused, timeLeft]);

  // When polling completes, move to result phase
  if (phase === "pending" && submission && submission.status !== "pending") {
    setPhase("result");
  }

  const wordCount = countWords(essayText);
  const minRequired = MIN_WORDS[taskType];
  const isValid = wordCount >= minRequired && questionText.trim().length > 0;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  // Task switch keeps all state — combined-timer mode preserves both buffers + timer.
  const handleTaskSwitch = useCallback((type: WritingTaskType) => {
    setTaskType(type);
    setNotesOpen(false);
  }, []);

  // Essay change — starts the combined 60-min pool on first keystroke (Practice).
  // Sprint 5C.2b4 (R2b): Full Test timer is owned by WritingExamChrome, which
  // mounts when the user clicks "Bắt đầu Full Test". Don't double-start a
  // WritingTab countdown for Full Test mode.
  const handleEssayChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      if (mode === "practice" && !timerStarted && newText.length > 0) {
        setTimeLeft(TOTAL_TIMER_SECONDS);
        setTimerStarted(true);
      }
      setEssayTexts((prev) => ({ ...prev, [taskType]: newText }));
    },
    [mode, timerStarted, taskType]
  );

  // Wave 6 Sprint 4E.2 — onboarding soft-gate. Fires once per submit
  // attempt when the user hasn't completed onboarding (and hasn't
  // already chosen "Bỏ qua" this session). Backend AI scorer falls
  // back to band 5.0 / exam_type 'academic' when fields are NULL, so
  // skipping is safe — the gate is a nudge, not a blocker.
  const onboarding = useOnboardingStatus();
  const [gateOpen, setGateOpen] = useState(false);
  const gateSkipped = useRef(false);

  // Submit essay
  const handleSubmit = useCallback(async () => {
    if (!isValid || submitting) return;
    // Proactive gate: if the free user has already hit the daily writing limit,
    // open the Pro modal instead of calling the API.
    if (!limits.isPro && !limits.writing.allowed) {
      setProModalOpen(true);
      return;
    }
    // Onboarding soft-gate.
    if (
      !gateSkipped.current &&
      onboarding.status &&
      !onboarding.status.has_completed_onboarding
    ) {
      setGateOpen(true);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    try {
      // ── Full Test flow ─────────────────────────────────────────────
      if (mode === "full_test" && fullTestId) {
        const ftResult = await submitWritingFullTestTask(fullTestId, {
          taskType,
          questionText: questionText.trim(),
          essayText: essayText.trim(),
          writingQuestionId: activePrompt?.id,
        });
        setFullTestSubmitted((prev) => ({ ...prev, [taskType]: ftResult.submissionId }));
        if (ftResult.finalized) {
          setFullTestResultId(fullTestId);
          setPhase("full_test_result");
          setNotes(EMPTY_TASK_BUFFERS);
          try { localStorage.removeItem(FULL_TEST_LS_KEY); } catch { /* ignore */ }
        } else {
          // First task done; nudge to the other one.
          const other: WritingTaskType = taskType === "task1" ? "task2" : "task1";
          setTaskType(other);
          showToast(`${taskType === "task1" ? "Task 1" : "Task 2"} đã nộp. Tiếp tục ${other === "task1" ? "Task 1" : "Task 2"}.`);
        }
        limits.refetch();
        return;
      }

      // ── Practice flow (default) ────────────────────────────────────
      const result = await submitWritingEssay({
        taskType,
        questionText: questionText.trim(),
        essayText: essayText.trim(),
        writingQuestionId: activePrompt?.id,
      });
      setActiveSubmissionId(result.submissionId);
      setPhase("pending");
      setNotes(EMPTY_TASK_BUFFERS);
      // Refetch limits so the RemainingBadge updates after a successful submit.
      limits.refetch();
    } catch (err) {
      // Backend returns 403 "Daily writing limit reached" when the gate is hit
      // between the hook's fetch and the user's submit — catch and surface the modal.
      const message = err instanceof Error ? err.message : "Submission failed";
      if (/limit reached/i.test(message) || /403/.test(message)) {
        setProModalOpen(true);
        limits.refetch();
      } else {
        setSubmitError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }, [isValid, submitting, taskType, questionText, essayText, activePrompt, limits, mode, fullTestId, showToast, onboarding.status]);

  // Timer reaching 0 — Practice shows a toast, user decides next step.
  // Sprint 5C.2b4 (R2b): Full Test auto-submit owned by WritingExamChrome.onComplete.
  // This handler narrowed to Practice scope to avoid double-fire.
  useEffect(() => {
    if (mode !== "practice") return;
    if (!timerStarted || timeLeft === null || timeLeft > 0 || timeOutFired) return;
    setTimeOutFired(true);
    showToast("Hết giờ — tùy bạn quyết tiếp");
  }, [mode, timerStarted, timeLeft, timeOutFired, showToast]);

  // View a submission from history
  const handleHistorySelect = useCallback((submissionId: string) => {
    setActiveSubmissionId(submissionId);
    setPhase("result");
  }, []);

  // User selected a prompt from the PromptSelector — hydrate the current task slot.
  const handlePromptSelect = useCallback((prompt: WritingQuestionDetail) => {
    setPrompts((prev) => ({ ...prev, [prompt.task_type]: prompt }));
    if (prompt.task_type !== taskType) setTaskType(prompt.task_type);
  }, [taskType]);

  const handleChangePrompt = useCallback(() => {
    setPrompts((prev) => ({ ...prev, [taskType]: null }));
    setEssayTexts((prev) => ({ ...prev, [taskType]: "" }));
  }, [taskType]);

  const handleStartFullTest = useCallback(async () => {
    if (fullTestLoading) return;
    setFullTestLoading(true);
    setFullTestError(null);
    try {
      const pair = await startWritingFullTest();
      setPrompts({ task1: pair.task1, task2: pair.task2 });
      setFullTestId(pair.full_test_id);
      setFullTestSubmitted({ task1: null, task2: null });
      setTaskType("task1");
      try { localStorage.setItem(FULL_TEST_LS_KEY, pair.full_test_id); } catch { /* SSR / quota — ignore */ }
    } catch (err) {
      setFullTestError(err instanceof Error ? err.message : "Không tải được Full Test");
    } finally {
      setFullTestLoading(false);
    }
  }, [fullTestLoading]);

  // Resume-banner fetch: once the editor is live and the user has no
  // active Full Test, check whether there's an unfinished run server-side.
  useEffect(() => {
    if (phase !== "editor") return;
    if (fullTestId) return;         // already resumed or freshly started
    if (resumeData !== null) return; // banner already populated
    if (resumeDismissed) return;
    let cancelled = false;
    getInProgressWritingFullTest()
      .then((d) => { if (!cancelled) setResumeData(d); })
      .catch(() => { /* silent — resume is optional UX */ });
    return () => { cancelled = true; };
  }, [phase, fullTestId, resumeData, resumeDismissed]);

  const handleResumeFullTest = useCallback(() => {
    if (!resumeData || !resumeData.task1_question || !resumeData.task2_question) return;
    setMode("full_test");
    setPrompts({ task1: resumeData.task1_question, task2: resumeData.task2_question });
    setFullTestId(resumeData.id);
    setFullTestSubmitted({
      task1: resumeData.task1_submitted ? "resumed" : null,
      task2: resumeData.task2_submitted ? "resumed" : null,
    });
    const firstOpen: WritingTaskType =
      !resumeData.task1_submitted ? "task1" :
      !resumeData.task2_submitted ? "task2" : "task1";
    setTaskType(firstOpen);
    // Resume the combined 60-min timer at its remaining value.
    setTimeLeft(resumeData.time_remaining_seconds);
    setTimerStarted(true);
    setTimeOutFired(false);
    setResumeData(null);
    try { localStorage.setItem(FULL_TEST_LS_KEY, resumeData.id); } catch { /* ignore */ }
  }, [resumeData]);

  const handleDismissResume = useCallback(() => {
    setResumeDismissed(true);
    setResumeData(null);
    try { localStorage.removeItem(FULL_TEST_LS_KEY); } catch { /* ignore */ }
  }, []);

  // Reset to editor — wipes both task buffers and the combined timer.
  const handleNewEssay = useCallback(() => {
    setPhase("editor");
    setEssayTexts(EMPTY_TASK_BUFFERS);
    setPrompts({ task1: null, task2: null });
    setNotes(EMPTY_TASK_BUFFERS);
    setActiveSubmissionId(null);
    setSubmitError(null);
    setTimeLeft(null);
    setTimerStarted(false);
    setPaused(false);
    setPauseConfirmOpen(false);
    setWarned5m(false);
    setWarned1m(false);
    setTimeOutFired(false);
    setSubmitConfirmOpen(false);
    setToast(null);
    setFullTestId(null);
    setFullTestSubmitted({ task1: null, task2: null });
    setFullTestResultId(null);
    setResumeData(null);
    setResumeDismissed(false);
    try { localStorage.removeItem(FULL_TEST_LS_KEY); } catch { /* ignore */ }
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cream font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 shrink-0 bg-cream-warm border-b border-navy/10">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-cream-soft text-navy hover:bg-cream transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="flex-1">
          <div className="font-semibold text-base text-navy">
            IELTS Writing
          </div>
          <div className="text-xs text-navy-light">
            {phase === "intro" && "Đang chuẩn bị..."}
            {phase === "editor" && "Viết bài luận"}
            {phase === "pending" && "Đang phân tích bài viết..."}
            {phase === "result" && "Kết quả của bạn"}
            {phase === "history" && "Lịch sử bài viết"}
          </div>
        </div>

        {/* Progress page link (Writing analytics dashboard) */}
        {phase === "editor" && (
          <a
            href="/writing/progress"
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 bg-cream-soft text-navy-light hover:text-navy transition-colors"
            aria-label="Tiến độ Writing"
            title="Tiến độ Writing"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            <span className="hidden sm:inline">Tiến độ</span>
          </a>
        )}

        {/* History button */}
        {phase === "editor" && (
          <button
            onClick={() => setPhase("history")}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cream-soft text-navy-light hover:text-navy transition-colors"
          >
            Lịch sử
          </button>
        )}
        {(phase === "history" || phase === "result") && (
          <button
            onClick={handleNewEssay}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{
              background: "rgba(0,168,150,0.10)",
              color: "#00A896",
            }}
          >
            New Essay
          </button>
        )}
      </div>

      {/* Global Timer Bar — Practice mode only. Sprint 5C.2b4 (R2b):
          Full Test timing is owned by WritingExamChrome (chrome's own
          stopwatch in the top bar), so WritingTimerBar suppresses here. */}
      {phase === "editor" && timerStarted && mode === "practice" && (
        <WritingTimerBar
          timerSeconds={timeLeft}
          totalSeconds={TOTAL_TIMER_SECONDS}
          canPause={timeLeft !== null && timeLeft > 0}
          paused={paused}
          onPauseToggle={() => {
            if (paused) setPaused(false);
            else setPauseConfirmOpen(true);
          }}
        />
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* ── INTRO PHASE ── */}
        {phase === "intro" && (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="text-4xl">📋</div>
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
                Examiner is preparing your test...
              </p>
              <p className="text-sm mt-2" style={{ color: "var(--color-text-secondary)" }}>
                Please wait a moment
              </p>
            </div>
          </div>
        )}

        {/* ── EDITOR PHASE ── */}
        {phase === "editor" && (() => {
          const editorContent = (
          <div className="flex flex-col gap-4 max-w-[1400px] mx-auto">
            {/* Remaining-count badge (free users only, hides for Pro) */}
            {!limits.loading && !limits.isPro && limits.writing.allowed && (
              <div className="flex justify-start">
                <RemainingBadge type="writing" bucket={limits.writing} />
              </div>
            )}

            {/* Limit-hit banner — shown above the editor when the free user has used all writing submissions */}
            {!limits.loading && !limits.isPro && !limits.writing.allowed && (
              <UpgradeTrigger
                type="writing"
                used={limits.writing.used}
                limit={limits.writing.limit ?? 0}
                onUpgrade={() => setProModalOpen(true)}
              />
            )}

            {/* Resume-Full-Test banner — shown when the backend says the user
                has an unfinished run and they haven't dismissed or resumed yet. */}
            {resumeData && !fullTestId && (
              <div className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-navy/5 border border-navy/25 text-navy">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">
                    Bạn có 1 Full Test chưa hoàn thành
                  </span>
                  <span className="text-xs text-navy-light">
                    Còn {Math.max(1, Math.round(resumeData.time_remaining_seconds / 60))} phút.
                    {resumeData.task1_submitted ? " Task 1 đã nộp." : ""}
                    {resumeData.task2_submitted ? " Task 2 đã nộp." : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDismissResume}
                    className="px-3 py-1.5 rounded-lg text-sm cursor-pointer bg-cream-soft text-navy-light border border-navy/10 hover:text-navy transition-colors"
                  >
                    Bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleResumeFullTest}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white cursor-pointer bg-navy hover:bg-navy-dark transition-colors"
                  >
                    Tiếp tục
                  </button>
                </div>
              </div>
            )}

            {/* Mode Selector — locked once the timer starts */}
            <div className="flex rounded-xl overflow-hidden bg-cream-warm border border-navy/10 shadow-sm">
              {(["practice", "full_test"] as WritingMode[]).map((m) => {
                const active = mode === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => !timerStarted && setMode(m)}
                    disabled={timerStarted}
                    className={
                      "flex-1 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed " +
                      (active
                        ? (m === "full_test" ? "bg-navy text-white" : "bg-teal text-white")
                        : "bg-transparent text-navy-light hover:text-navy")
                    }
                    title={timerStarted ? "Không đổi mode khi đang làm bài" : undefined}
                  >
                    {m === "practice" ? "Luyện tập" : "Bắt đầu Full Test"}
                  </button>
                );
              })}
            </div>

            {/* Task Type Toggle */}
            <div className="flex rounded-xl overflow-hidden bg-cream-warm border border-navy/10 shadow-sm">
              {(["task1", "task2"] as WritingTaskType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleTaskSwitch(t)}
                  className={
                    "flex-1 py-2.5 text-sm font-medium transition-colors cursor-pointer " +
                    (taskType === t
                      ? "bg-teal text-white"
                      : "bg-transparent text-navy-light hover:text-navy")
                  }
                >
                  {t === "task1" ? "Task 1 (~20 min)" : "Task 2 (~40 min)"}
                </button>
              ))}
            </div>

            {/* Entry state — pick a prompt (Practice) or launch Full Test pair */}
            {!activePrompt && mode === "practice" && (
              <WritingPromptSelector onSelect={handlePromptSelect} />
            )}

            {!activePrompt && mode === "full_test" && (
              <WritingFullTestShell
                error={fullTestError}
                loading={fullTestLoading}
                onStart={() => void handleStartFullTest()}
              />
            )}

            {/* Split view: prompt panel (left) + answer panel (right) — only when a prompt is loaded */}
            {activePrompt && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ── PROMPT PANEL (left) ── */}
              <div className="rounded-xl p-5 flex flex-col gap-3 bg-cream-warm border border-navy/10 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-navy-light/70">
                    Question / Prompt
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider bg-teal/10 text-teal">
                      {taskType === "task1" ? "Task 1" : "Task 2"}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider bg-cream-soft text-navy-light border border-navy/10">
                      {activePrompt.topic}
                    </span>
                    {mode === "practice" && !timerStarted && (
                      <button
                        type="button"
                        onClick={handleChangePrompt}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider cursor-pointer bg-cream-soft text-navy-light border border-navy/10 hover:text-navy hover:border-teal/30 transition-colors"
                        title="Chọn đề khác"
                      >
                        Đổi đề
                      </button>
                    )}
                  </div>
                </div>

                {activePrompt.title && (
                  <p className="text-sm font-semibold text-navy">
                    {activePrompt.title}
                  </p>
                )}

                {/* Task 1 chart — rendered from writing_questions.chart_data */}
                {taskType === "task1" && activePrompt.chart_type && activePrompt.chart_data != null && (
                  <WritingChartRenderer
                    chartType={activePrompt.chart_type}
                    data={activePrompt.chart_data}
                  />
                )}

                <div
                  className="rounded-lg px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap flex-1 overflow-auto bg-cream-soft border border-navy/10 text-navy"
                  style={{ minHeight: "120px" }}
                >
                  {questionText}
                </div>
              </div>

              {/* ── ANSWER PANEL (right) ── */}
              <div className="rounded-xl p-5 flex flex-col gap-3 bg-cream-warm border border-navy/10 shadow-sm">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label className="text-xs font-semibold uppercase tracking-widest text-navy-light/70">
                    Your Essay
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNotesOpen(true)}
                      className={
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border border-navy/10 " +
                        (notes[taskType].length > 0
                          ? "bg-teal/10 text-teal"
                          : "bg-cream-soft text-navy-light hover:text-navy")
                      }
                      aria-label="Mở ghi chú"
                    >
                      <span>📝</span>
                      <span>Ghi chú{notes[taskType].length > 0 ? ` (${notes[taskType].length})` : ""}</span>
                    </button>
                    {/* Live word count badge — semantic emerald (at target) /
                        coral (below target) preserved per Sprint 5C.2b5b2 lesson 3. */}
                    <span
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      style={{
                        background: wordCount >= minRequired
                          ? "rgba(22,163,74,0.08)"
                          : wordCount > 0
                            ? "rgba(239,68,68,0.08)"
                            : undefined,
                        color: wordCount >= minRequired
                          ? "#16A34A"
                          : wordCount > 0
                            ? "#EF4444"
                            : undefined,
                      }}
                    >
                      {wordCount} / {minRequired} words
                    </span>
                  </div>
                </div>
                <WritingEditorCore
                  value={essayText}
                  onChange={handleEssayChange}
                  onPaste={(e) => { e.preventDefault(); showToast("Thi thật không cho phép paste"); }}
                  onContextMenu={(e) => e.preventDefault()}
                  readOnly={paused || Boolean(fullTestSubmitted[taskType])}
                  paused={paused}
                  placeholder={`Start writing your ${taskType === "task1" ? "Task 1" : "Task 2"} response...\n\nMinimum ${minRequired} words required. Timer starts on first keystroke.`}
                  wordCount={wordCount}
                  minRequired={minRequired}
                />
              </div>
            </div>
            )}

            {/* Submit Error — semantic red preserved (error indicator, not a band score). */}
            {activePrompt && submitError && (
              <div
                className="rounded-xl px-4 py-3 text-sm flex items-center gap-2 border"
                style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444", borderColor: "rgba(239,68,68,0.2)" }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {submitError}
              </div>
            )}

            {/* Submit Button — Full Test with time remaining asks for confirmation first.
                Sprint 5C.2b4 (R2a): hidden in Full Test mode — WritingExamChrome footer
                owns the Submit CTA there. Practice mode keeps the inline button.
                Sprint 5C.2b5b3a: teal gradient preserved for enabled state (brand
                primary CTA gradient — semantic), cream-warm fallback for disabled. */}
            {activePrompt && mode === "practice" && (
              <button
                onClick={() => {
                  // Practice has no mid-session confirm — submit immediately.
                  // Full Test confirmation lives in WritingExamChrome.onSubmit (R2a).
                  void handleSubmit();
                }}
                disabled={!isValid || submitting}
                className={
                  "w-full py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer " +
                  (isValid
                    ? "text-white shadow-md"
                    : "bg-cream-warm text-navy-light/70 border border-navy/10")
                }
                style={isValid ? {
                  background: "linear-gradient(135deg, #00A896, #00C4B0)",
                  boxShadow: "0 4px 16px rgba(0,168,150,0.25)",
                } : undefined}
              >
                {submitting ? "Đang nộp..." : `Nộp bài chấm điểm (${wordCount} từ)`}
              </button>
            )}
          </div>
          );
          // Sprint 5C.2b4 (R2a): wrap editorContent in WritingExamChrome for Full Test
          // post-launch (activePrompt set). Practice mode and Full Test pre-launch
          // (launch panel via WritingFullTestShell) render editorContent directly.
          // Chrome.onComplete is no-op — WritingTab's existing timeout handler (line ~273)
          // owns auto-submit during R2a transient state. R2b will rewire.
          if (mode === "full_test" && activePrompt) {
            return (
              <WritingExamChrome
                durationSeconds={3600}
                onComplete={() => {
                  // Sprint 5C.2b4 (R2b): chrome owns Full Test timing.
                  // Auto-submit on stopwatch 0 with timeOutFired guard so
                  // double-clicks/re-renders don't double-fire handleSubmit.
                  if (!timeOutFired) {
                    setTimeOutFired(true);
                    void handleSubmit();
                  }
                }}
                onSubmit={() => {
                  // Sprint 5C.2b4 (R2b): chrome stopwatch is the source of
                  // truth — no WritingTab timeLeft to gate confirmation on.
                  // User clicks "Nộp bài" in chrome footer → submit confirm
                  // modal asks for explicit confirmation before scoring.
                  setSubmitConfirmOpen(true);
                }}
                wordCount={wordCount}
              >
                {editorContent}
              </WritingExamChrome>
            );
          }
          return editorContent;
        })()}

        {/* ── PENDING PHASE ── */}
        {phase === "pending" && !resultTimedOut && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div
              className="w-12 h-12 border-3 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "#F59E0B", borderTopColor: "transparent", borderWidth: "3px" }}
            />
            <div className="text-center">
              <p className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
                Analyzing your essay
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                Our AI examiner is scoring your writing...
              </p>
              {polling && (
                <p className="text-xs mt-2" style={{ color: "var(--color-text-tertiary)" }}>
                  This usually takes 10-30 seconds
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── PENDING PHASE — timeout after 40 attempts (120s) ── */}
        {phase === "pending" && resultTimedOut && (
          <div className="max-w-md mx-auto flex flex-col items-center justify-center py-16 gap-4">
            <div
              className="rounded-xl p-5 flex flex-col gap-3 w-full"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}
            >
              <div className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
                Việc chấm điểm mất nhiều thời gian hơn dự kiến
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                Bạn có thể thử lại hoặc quay lại sau ít phút — bài viết đã được nộp và sẽ tiếp tục chấm ở nền.
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => refetchResult()}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer shadow-md hover:shadow-lg transition-shadow"
                  style={{ background: "linear-gradient(135deg, #00A896, #00C4B0)" }}
                >
                  Thử lại
                </button>
                <button
                  type="button"
                  onClick={handleNewEssay}
                  className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer bg-cream-soft text-navy border border-navy/10 hover:bg-cream transition-colors"
                >
                  Quay lại Writing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── RESULT PHASE ── */}
        {phase === "result" && submission && (
          <div className="max-w-2xl mx-auto">
            <WritingResult
              submission={submission}
              onBack={handleNewEssay}
            />
          </div>
        )}

        {phase === "result" && resultLoading && !submission && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* ── HISTORY PHASE ── */}
        {phase === "history" && (
          <div className="max-w-2xl mx-auto">
            <WritingHistory onSelect={handleHistorySelect} />
          </div>
        )}

        {/* ── FULL TEST RESULT PHASE ── */}
        {phase === "full_test_result" && fullTestResultId && (
          <div className="max-w-3xl mx-auto">
            <WritingFullTestResult
              fullTestId={fullTestResultId}
              onBack={handleNewEssay}
            />
          </div>
        )}
      </div>

      {/* Full Test manual submit confirmation (time remaining > 0).
          Sprint 5C.2b5b3b: Pattern 5 branded scrim (bg-navy/50 + backdrop-blur-sm)
          replaces raw rgba(0,0,0,0.5). */}
      {submitConfirmOpen && (
        <div
          className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm"
          onClick={() => setSubmitConfirmOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-sm rounded-xl p-5 flex flex-col gap-4 bg-cream-warm border border-navy/10 shadow-xl font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="text-base font-semibold text-navy">
                Bạn muốn kiểm tra lại bài không?
              </div>
              <p className="text-sm mt-1.5 text-navy-light">
                Còn thời gian để xem lại trước khi nộp.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSubmitConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium cursor-pointer bg-cream-soft text-navy border border-navy/10 hover:bg-cream transition-colors"
              >
                Xem lại
              </button>
              <button
                type="button"
                onClick={() => { setSubmitConfirmOpen(false); void handleSubmit(); }}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer shadow-md hover:shadow-lg transition-shadow"
                style={{ background: "linear-gradient(135deg, #00A896, #00C4B0)" }}
              >
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause-confirmation modal (Practice mode).
          Sprint 5C.2b5b3b: Pattern 5 branded scrim + #1B2B4B literal → bg-navy. */}
      {pauseConfirmOpen && (
        <div
          className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm"
          onClick={() => setPauseConfirmOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-sm rounded-xl p-5 flex flex-col gap-4 bg-cream-warm border border-navy/10 shadow-xl font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="text-base font-semibold text-navy">
                Tạm dừng luyện tập?
              </div>
              <p className="text-sm mt-1.5 text-navy-light">
                Đây chỉ là luyện tập. Nếu bận thì dừng lại, xong quay lại tiếp tục.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPauseConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium cursor-pointer bg-cream-soft text-navy border border-navy/10 hover:bg-cream transition-colors"
              >
                Tiếp tục làm
              </button>
              <button
                type="button"
                onClick={() => { setPaused(true); setPauseConfirmOpen(false); }}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer bg-navy hover:bg-navy-dark transition-colors"
              >
                Tạm dừng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scratch-notes modal */}
      <WritingNotesModal
        open={notesOpen}
        value={notes[taskType]}
        onChange={(next) => setNotes((prev) => ({ ...prev, [taskType]: next }))}
        onClose={() => setNotesOpen(false)}
      />

      {/* Ephemeral toast (paste-blocked, time warnings, etc.) */}
      {toast && (
        <div
          key={toast.key}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg"
          style={{
            background: "rgba(27,43,75,0.95)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}

      <ProUpgradeModal
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
        onUpgraded={() => {
          setProModalOpen(false);
          limits.refetch();
        }}
      />

      <OnboardingGateModal
        open={gateOpen}
        onComplete={() => {
          setGateOpen(false);
          window.dispatchEvent(new Event("lingona:open-onboarding"));
        }}
        onSkip={() => {
          setGateOpen(false);
          gateSkipped.current = true;
          // Caller should re-trigger submit now that gate is dismissed.
          void handleSubmit();
        }}
        headline="Lintopus cần biết band mục tiêu"
        body="Để chấm bài Writing chính xác hơn theo cấp độ của bạn."
      />
    </div>
  );
}
