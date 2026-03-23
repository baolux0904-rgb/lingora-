# SKILL: implement-feature

## Purpose
Implement a new feature or enhancement into the Lingona codebase while maintaining flow integrity, layer discipline, and zero regressions.

## When to Use
- Adding new UI behavior, API endpoint, or business logic.
- Extending an existing flow (e.g., adding a new IELTS phase, new provider, new scoring criterion).
- Integrating a new external service.

---

## Required Inputs
- Feature description: what the user wants to happen.
- Affected user flow: which screen/action/endpoint is touched.
- Any new dependencies or env vars needed.

## Expected Outputs
- Working code changes across all affected layers.
- No regression in existing flows.
- Documented edge cases if behavior is stateful.

---

## Execution Steps

### Step 1 — Read Before Touching
1. Read `ai/flow.md` if the feature touches any speaking or IELTS flow.
2. Read `ai/decisions.md` for relevant architectural constraints.
3. Read every file that will be modified — fully, not just the relevant section.
4. Read files that import or are imported by the files you'll modify.

### Step 2 — Write the Plan
Write out explicitly:
- What currently happens in this flow.
- What the new behavior is.
- Which files change and why.
- What could break (be specific — name the feature/function).
- How you will verify it works end-to-end.

Do NOT start coding until this plan is written and clear.

### Step 3 — Implement
Follow layer order: backend changes first (route → controller → service → repo), then frontend (hook → component).

Rules:
- One concern per file. Don't put business logic in controllers.
- New external service calls go through a provider abstraction — never `require('openai')` in a service directly.
- New frontend data fetching goes in a `hooks/` file, not in the component.
- Use existing response envelope: `{ success, message, data }`.
- New state transitions in IELTS must go through `advanceIeltsState()` — never set `phase` directly on the state object outside that function.

### Step 4 — Verify

Before marking complete, verify all of the following:

**Logic correctness:**
- Trace the full request path: what enters the route, what the service receives, what the repo returns, what the controller sends.
- Trace the full UI path: what the hook returns, what the component renders, what the user sees.

**Flow integrity:**
- If IELTS flow is touched: simulate all 8 phases mentally. Can you reach `complete` from `entering` via every valid path?
- If auth is touched: test both authenticated and guest paths.

**No regression:**
- List every other feature that uses the same files or endpoints.
- Confirm their behavior is unchanged.

---

## Quality Criteria
- All layers follow single responsibility.
- No cross-domain repository access.
- No raw `fetch()` in components.
- No direct OpenAI/Azure/R2 SDK calls in services.
- Error thrown as proper `Error` instance with `.status` attached.

## Verification Checklist
- [ ] Read all modified files before editing.
- [ ] Plan written before coding.
- [ ] Backend layers: route → controller → service → repository.
- [ ] Frontend layers: api.ts → hook → component.
- [ ] Full flow traced mentally (or in logs).
- [ ] Auth edge case handled (guest vs authenticated).
- [ ] TTS lifecycle not broken (if speaking flow touched).
- [ ] No new stuck states possible.

## Edge Cases
- User refreshes mid-flow → session must resume from DB state.
- TTS API unavailable → mic must still auto-start after delay.
- Auth token expires mid-session → 401 retry must work, session must not corrupt.
- Concurrent submits → `isProcessing` guard must hold.

## Common Mistakes
- Setting phase directly in frontend without reading `ieltsState` from backend.
- Calling `advanceIeltsState` twice for one user turn.
- Forgetting `autoMic = false` for announcement TTS calls (not a question).
- Adding a new provider and forgetting to update the factory.
- Forgetting to add route to Express `app.js` or `index.js` mount.
