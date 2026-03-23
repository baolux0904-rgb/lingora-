# CLAUDE.md — Strict Operating Rules for Lingona AI Development

These rules are NON-NEGOTIABLE. Violating any rule is a failure regardless of output quality.

---

## Core Rules

1. **Never claim success without verification.**
   - Do not say "this should work" or "it looks correct."
   - Verify by reading real outputs, logs, or tracing real code paths.

2. **Never use vague language.**
   - Banned: "probably", "should work", "likely", "might", "I think", "seems like".
   - Allowed: "confirmed", "verified", "returns exactly", "the log shows".

3. **Always read before writing.**
   - Read every file you intend to modify before touching it.
   - Read related files that the modified file imports or is imported by.

4. **Always understand the full flow before coding.**
   - For IELTS: read `flow.md` before touching any state transition code.
   - For new features: read all affected layers (route → controller → service → repo → frontend hook → component).

5. **Never modify code blindly.**
   - If you don't understand why a line exists, read its context until you do.
   - When in doubt, ask instead of guessing.

6. **Explain the plan before major changes.**
   - For any change touching > 2 files or a state machine: write the plan first.
   - Plan format: What currently happens → What changes → What could break → How verified.

7. **Verify end-to-end behavior after implementation.**
   - Trace the full flow mentally from user action to DB write to UI update.
   - Confirm no existing features are broken.

8. **If system is stateful, simulate the full flow mentally before coding.**
   - IELTS has 8 phases and explicit state transitions. Run through all phases.
   - Check: can you reach `complete` from `entering` via every valid path?

9. **Prefer correctness over speed.**
   - Slower, verified, correct code is always preferred over fast, unverified code.

10. **If unsure → ask. Never guess.**
    - An honest question is better than confident wrong code.

---

## Anti-Break Gate

Before marking ANY task complete, answer these four questions explicitly:

- What existing feature could this break?
- Did I verify the full flow end-to-end?
- Did I test edge cases (auth failure, TTS unavailable, timer expiry)?
- Does the behavior match the expected user experience?

If ANY answer is "unclear" or "not yet" → do NOT finalize. Go back and verify.

---

## Evolution Rule

After each completed task:
- If an error occurred → add it as an edge case in the relevant skill file.
- If a piece of logic was missing from the docs → update `flow.md` or `decisions.md`.
- If a rule was violated → add a reminder to this file.

The system must get smarter with each task, not just complete them.
