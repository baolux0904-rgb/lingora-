# SKILL: debug-error

## Purpose
Identify and fix the root cause of a bug — not the symptom. Leave no side effects.

## When to Use
- Something crashes, throws, or returns wrong data.
- A flow stops working that previously worked.
- A UI gets stuck or shows unexpected state.
- A network request fails or returns unexpected shape.

---

## Required Inputs
- Error message or symptom description.
- Which user action triggers it.
- Any logs, stack traces, or network responses available.

## Expected Outputs
- Root cause identified and stated clearly.
- Fix applied to root cause (not the symptom).
- Verification that the fix works and nothing else broke.

---

## Execution Steps

### Step 1 — Read the Error
Read the full error message, stack trace, or symptom carefully.
- What file and line number is mentioned?
- What function threw or failed?
- What was the input that caused it?

Do NOT skip this. Most bugs are solved by actually reading the error.

### Step 2 — Trace the Cause
Starting from the error location, trace backwards:
- What called this function?
- What was passed in?
- What state was the system in?

If stateful (IELTS flow): read `ai/flow.md` to understand what state should have been active.

### Step 3 — Identify Root Cause
State the root cause in one sentence:
- "The session ID was null because `startScenarioSession` was called before auth was confirmed."
- "The timer fires `handlePart2End` while `isProcessing = true`, and the early return guard wasn't present."
- "The AI response didn't include `ieltsState` because the scenario type wasn't set to `ielts`."

If you cannot state the root cause in one sentence, you haven't found it yet.

### Step 4 — Fix Root Cause
Fix the cause, not the symptom.

Wrong: Adding a null check on `sessionId` when the real issue is it's never set.
Right: Fix the code path that fails to set `sessionId`.

Wrong: Catching and swallowing an error with a safe default.
Right: Prevent the error from occurring in the first place.

Exception: If the root cause is in an external system (API, browser quirk), a defensive guard is acceptable — but document why.

### Step 5 — Verify
- Read the fixed code path top to bottom.
- Trace the same input that caused the bug. Does it reach the fix?
- Does the fix introduce any new failure mode?
- Are there other code paths that have the same bug? Fix all of them.

---

## Quality Criteria
- Root cause is named explicitly before fix is written.
- Fix is minimal — changes only what's needed to address the cause.
- No swallowed errors (`.catch(() => {})` without logging or re-throwing).
- No added null checks that hide a missing initialization.

## Verification Checklist
- [ ] Error message read fully.
- [ ] Root cause stated in one sentence.
- [ ] Fix addresses root cause, not symptom.
- [ ] Fix traced through the code path to confirm it intercepts the bug.
- [ ] No new failure modes introduced.
- [ ] Other occurrences of the same bug checked and fixed.

## Edge Cases
- IELTS stuck in a phase: check `session_meta` in DB. If `phase` column is stale, the state machine is reading wrong data — the bug is in the write, not the read.
- TTS examiner speaking forever: `setExaminerSpeaking(false)` not called in an error branch. Check `audio.onerror` and the catch blocks of `playTTS`.
- Optimistic turn not removed on error: check that the `catch` block in `handleSend` filters by the correct `tempId`.
- Auth 401 in mid-session: verify `tryRefresh()` in `api.ts` is not stuck in a pending state from a previous failed refresh.

## Common Mistakes
- Fixing the UI state without fixing the underlying data.
- Adding a try/catch that swallows the error, hiding it for later.
- Fixing only the specific scenario that was reported, missing identical bugs in parallel code paths.
- Confusing "it doesn't crash anymore" with "it's fixed".
