# SKILL: review-code

## Purpose
Verify that new or changed code is correct, consistent with system architecture, and free from logic errors, async bugs, and state integrity issues.

## When to Use
- After implementing a feature, before marking it complete.
- When asked to review a diff or a set of changed files.
- When something "seems right" but you want to confirm before shipping.

---

## Required Inputs
- The files or diff to review.
- The user flow or behavior being implemented.
- Any known constraints from `ai/decisions.md` or `ai/flow.md`.

## Expected Outputs
- Specific issues found, or explicit confirmation that none were found.
- For each issue: file, line, what's wrong, and what the correct version is.

---

## Execution Steps

### Step 1 — Read the Code
Read the full file, not just the changed lines.
Context matters. A bug is often visible only when you see what comes before and after the change.

### Step 2 — Check Logic Correctness
Ask for each function:
- Does it do what its name says?
- Are all code paths handled? (if/else, try/catch, early returns)
- If it returns data, is the shape correct for the caller?
- If it mutates state, is the mutation atomic where it needs to be?

### Step 3 — Check Async Behavior
For any `async` function or `useEffect`:
- Is there a cleanup/cancellation for unmount? (`cancelled` flag, `clearInterval`, `controller.abort()`)
- Can two calls race? Is there a guard (`isProcessing`, `pendingRefresh`)?
- Are `await` calls properly awaited? (accidental fire-and-forget)
- Does error in one async branch leave other state inconsistent?

### Step 4 — Check State Integrity
For any state update:
- After the update, is the system in a valid state?
- Can a failure between two state updates leave things half-updated? (needs transaction or rollback)
- Is UI state derived from server state, or independently tracked? (independently tracked state drifts)

### Step 5 — Check Architecture Rules
Verify against `ai/decisions.md`:
- No controller importing a repository directly.
- No component calling `fetch()` directly.
- No service calling another domain's repository.
- No `require('openai')` or `require('azure')` outside provider files.
- Error thrown as `new Error(msg)` with `.status` attached, not as a plain object.
- Response uses `sendSuccess(res, data)`, not `res.json(data)`.

### Step 6 — Check Edge Cases
- What happens if the network is slow or fails?
- What happens if the user is not authenticated?
- What happens if the component unmounts before an async call completes?
- What happens if the same action is triggered twice quickly?

---

## Quality Criteria
- Every code path is handled.
- No unguarded async operations.
- No layer boundary violations.
- State is always left in a valid, consistent shape.
- Errors are logged and propagated correctly (not swallowed).

## Verification Checklist
- [ ] Full files read (not just diffs).
- [ ] Logic correct for all code paths.
- [ ] Async operations have cleanup and race guards.
- [ ] State updates are atomic where required.
- [ ] Architecture rules followed (layer order, provider abstraction, response envelope).
- [ ] Edge cases covered (auth, network failure, unmount, concurrent submit).

## Edge Cases to Always Check
- Optimistic update not cleaned up on error.
- `useEffect` with missing dependency or stale closure.
- `setInterval` started but not cleared on unmount.
- `Promise.all` where one rejection silently fails the others.
- JWT token read at call time vs. captured in closure (stale token).
- DB query with no transaction wrapping two mutating operations.

## Common Mistakes Found in This Codebase
- Timer `useEffect` dependency on `[timerActive, timerSeconds]` — changing both simultaneously restarts interval mid-count.
- `playTTS` called without nulling `audioRef.current` first — two Audio objects play simultaneously.
- `userTurnCount` used for logic instead of `ieltsState.questionIndex` — local counter drifts.
- Placeholder turns `[READY FOR PART 2]` stored in `conversation_turns` and included in AI scoring prompt.
