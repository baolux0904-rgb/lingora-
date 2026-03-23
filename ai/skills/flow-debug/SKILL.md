# SKILL: flow-debug

## Purpose
Debug multi-step conversational flows by tracing state transitions across backend and frontend, detecting stuck states, broken transitions, and timing bugs.

## When to Use
- The IELTS exam gets stuck on a phase and never advances.
- A transition fires at the wrong time (e.g., jumping to Part 3 too early).
- The mic doesn't auto-start after TTS ends.
- The timer doesn't expire or fires multiple times.
- The user sees the wrong phase UI (e.g., cue card shows during Part 1).
- Backend state and frontend phase are out of sync.

---

## Required Inputs
- Which phase or transition is broken.
- What the user did before the break.
- Any console logs, network responses, or DB state available.

## Expected Outputs
- The specific state or transition that is incorrect.
- Whether the bug is in the backend state machine, the frontend phase machine, or the transition between them.
- A minimal fix that restores correct flow without disrupting other phases.

---

## Execution Steps

### Step 1 — Read `ai/flow.md` First
This is not optional. The full flow is documented there. Before debugging, confirm:
- Which backend `phase` should be active at the broken point.
- Which frontend `ExamPhase` should match.
- What trigger should advance the state.

### Step 2 — Locate the Break
Determine where the flow broke:

**Option A — Backend broke:**
- The `session_meta.phase` in DB is wrong.
- Query: `SELECT session_meta FROM scenario_sessions WHERE id = '<sessionId>';`
- Expected phase for the user's position in the exam?
- If wrong: `advanceIeltsState()` was either not called, called incorrectly, or skipped a transition.

**Option B — Frontend broke:**
- The UI `phase` React state is wrong even though `result.ieltsState` from the API is correct.
- Check: does the `handleSend` switch statement have a branch for this `state.phase`?
- Check: is the correct `setPhase()` call inside that branch?

**Option C — Mismatch:**
- Backend `ieltsState.phase` is correct but the frontend doesn't handle it.
- Usually a new backend phase added without updating the frontend switch statement.

### Step 3 — Trace the Trigger
Find the exact event that should advance the state:
- User submit → `handleSend()` → `submitScenarioTurn()` → backend `advanceIeltsState()`.
- Timer expiry → `handlePart2End()` or `handlePrepSkip()` → `submitScenarioTurn()`.
- Auto-advance placeholder → `submitScenarioTurn(sessionId, "[READY FOR PART 2]")`.

Which of these failed or was skipped?

### Step 4 — Check Timing
Timing bugs are common in this flow:
- Was `setIsProcessing(false)` called before the auto-advance placeholder was sent? (It must be, or the guard blocks it.)
- Was `await playTTS(...)` not awaited, causing the next transition to fire before audio ended?
- Did `setTimeout(..., 2500)` overlap with a user action that also called `handleSend`?

### Step 5 — Simulate Full Flow
Starting from `entering`, mentally walk through all 8 phases with the fix applied:
1. `entering` → init → `part1`
2. 5 Part 1 answers → `part2_intro`
3. auto-advance `[READY FOR PART 2]` → `part2_prep` (60s timer)
4. prep skip / timer expire → `part2_speak` (120s timer)
5. long turn submit / timer expire → `follow_up` (part1 layout)
6. follow-up answer → `transition_to_part3`
7. auto-advance `[READY FOR PART 3]` → `part3`
8. 5 Part 3 answers → `complete` → `ending` → `summary`

Can you reach `summary` without getting stuck? If not, where does it fail?

---

## Quality Criteria
- The broken phase is identified precisely (backend state OR frontend phase, not "something is wrong with Part 2").
- The fix is minimal — it changes only the transition that was broken.
- All other transitions are unaffected.
- No new stuck states are possible after the fix.

## Verification Checklist
- [ ] `ai/flow.md` read before debugging.
- [ ] Backend phase vs. frontend phase compared — which is wrong?
- [ ] Trigger event traced (user submit, timer expiry, auto-advance placeholder).
- [ ] Timing issue checked (`isProcessing`, `await`, `setTimeout` overlap).
- [ ] Full flow simulated mentally with fix applied.
- [ ] No other phase transitions broken by the fix.

## Common Stuck States in This Codebase

| Stuck State | Cause | Fix |
|---|---|---|
| `part2_intro` never advances | `[READY FOR PART 2]` placeholder call failed | Add try/catch + retry, or check network error |
| `transition_to_part3` never advances | Same — `[READY FOR PART 3]` placeholder failed | Same fix pattern |
| Mic never starts after TTS | `audio.onended` not firing (audio error branch missing mic start) | ✅ FIXED — `tryStartMic()` helper called in all 5 branches with `micStarted` double-fire guard |
| Timer fires twice | `timerActive` and `timerSeconds` changed in same render — both deps trigger `useEffect` | Decouple timer state updates into a single transition |
| Phase jumps to wrong state | `handleSend` switch statement missing `else if` — falls through to default | Check every `state.phase` value has its own branch |
| `isProcessing` stuck as `true` | `finally` block missing after a caught error | Ensure all `handleSend` paths reach `finally { setIsProcessing(false) }` |
| Backend state advances but UI doesn't | `result.ieltsState` not read after auto-advance placeholder call | Read `cueResult.ieltsState` / `p3Result.ieltsState` and set UI phase |

## Diagnostic Logs to Add (Temporarily)
```typescript
// In handleSend, after receiving result:
console.log('[ielts-ui] state:', result.ieltsState);

// In playTTS:
console.log('[tts] playing:', text.slice(0, 50), 'autoMic:', autoMic);
console.log('[tts] ended — examinerSpeaking=false, autoMic will fire:', autoMic);

// In phase transitions:
console.log('[ielts-ui] setPhase:', newPhase);
```

Remove all diagnostic logs before finalizing any fix.
