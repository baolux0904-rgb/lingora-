# Sprint 5C.2b Series Closure — WritingTab Decomposition + Wave 6 Cream Canon

**Closed:** 2026-05-08 · **Closure commit:** 5C.2b6

## Series Overview

Sprint 5C.2b shipped **11 sub-commits + 1 retroactive skip + 1 closure (this doc)** covering:

- WritingTab decomposition (3 NEW companion files extracted from 1083-LOC monolith)
- WritingExamChrome activation (R2 sequential strategy: R2a + R2b)
- Cream canon restyle (67 functional `var(--*)` refs eliminated in WritingTab + WritingFullTestShell; cumulative Writing/ folder = **163 refs eliminated** across 8 components)

**WritingTab.tsx Wave 6 cream canon: COMPLETE.**
**Writing/ folder Wave 6 cream canon: COMPLETE.**
**Sprint 5A.2 Q1 lock: FULLY SATISFIED at production.**

---

## Sub-commit Inventory

| Sub-commit | Commit | Scope | LOC delta |
|---|---|---|---|
| 5C.2b1 | `bdd1e6e` | Extract `WritingEditorCore.tsx` (textarea + progress bar) | +117 / -35 |
| 5C.2b2 | — | **SKIPPED** (Practice render had no clean atomic seam) | — |
| 5C.2b3 | `1687154` | Extract `WritingFullTestShell.tsx` (launch panel) | +71 / -26 |
| 5C.2b4 R2a | `1d4c410` | WritingExamChrome activated via inline IIFE wrap | +36 / -9 |
| 5C.2b4 R2b | `19bcfe4` | Surgical removal of WritingTab Full Test timer infra | +34 / -20 |
| 5C.2b5a | `bc9707b` | WritingFullTestShell cream canon | +12 / -19 |
| 5C.2b5b1 | `199063c` | WritingTab header chrome cream canon | +8 / -26 |
| 5C.2b5b2 | `67ec748` | WritingTab toggles + resume banner cream | +18 / -28 |
| 5C.2b5b3a | `e3ef5c0` | WritingTab editor panels cream | +50 / -62 |
| 5C.2b5b3b | `0ebc530` | WritingTab pending + result spinner + 2 modals cream | +20 / -44 |
| 5C.2b5b3c | `06cdd42` | WritingTab final 7 refs (intro + pending text) cream | +7 / -7 |
| 5C.2b6 | this | Series closure assessment (docs only) | — |

**Net code delta across the series:** +373 / -276 = +97 LOC across 1 NEW file (`WritingExamChrome.tsx` 338 LOC standalone) + 3 extracted files (`WritingEditorCore` 112 + `WritingFullTestShell` 58) + WritingTab (1083 → 1010, -73 LOC). The +97 reflects new component scaffolding offset by WritingTab decomposition.

---

## Cumulative Wave 6 Cream Canon — Writing/ folder

| Sprint | File(s) | Refs eliminated |
|---|---|---|
| 5C.1b | WritingResult | 44 |
| 5C.1c | WritingPromptSelector | 12 |
| 5C.1d | WritingSelfCompareBanner | 4 |
| 5C.1e | WritingHistory | 8 |
| 5C.1e | WritingParaphraseChips | 9 |
| 5C.1e | WritingTimerBar | 7 |
| 5C.1f | WritingNotesModal | 12 |
| 5C.2b5a | WritingFullTestShell | 5 |
| 5C.2b5b1 | WritingTab header chrome | 11 |
| 5C.2b5b2 | WritingTab toggles + resume | 9 |
| 5C.2b5b3a | WritingTab editor panels | 19 |
| 5C.2b5b3b | WritingTab pending + 2 modals | 16 |
| 5C.2b5b3c | WritingTab intro + pending text | 7 |
| **TOTAL** | **8 components** | **163 refs** |

---

## Patterns Established (Sprint 5I closer skill-module candidates)

### Sprint 5C.1 Patterns 1-6 (carry-over from prior series)

1. **`bandColor()` Soul-rule helper** — band scores never red, slate for sub-5.0
2. **Off-brand color migration** — e.g. `#7E4EC1` purple → teal canon
3. **Imperative onMouse → declarative Tailwind hover**
4. **Tailwind shorthand adoption** — `letter-spacing: 0.1em` → `tracking-wider`
5. **Branded scrim** — `rgba(0,0,0,0.5)` → `bg-navy/50 backdrop-blur-sm`
6. **Inherited color** — `undefined` returns so spans inherit parent text color

### Sprint 5C.2b NEW Pattern 7

7. **Inline-style → className refactor** — converting `style={{...}}` blocks into Tailwind class strings (sometimes via `cn()` for conditionals). Each ref ≈ small refactor, not a 1-line swap.

### Lessons Accumulated

**Lesson 1 (5C.2b5a):** Inline `style={{}}` ≠ token swap. Each ref is a small refactor — lift inline → className, restructure conditional logic. Realistic LOC delta is ±0–3 per ref, not always negative.

**Lesson 2 (5C.2b5b1):** **Sub-slice ship strategy.** When 30+ refs are spread across multiple JSX sections, ship one isolated section per commit. Atomic isolated section ships clean; forced broad scope risks Practice regression.

**Lesson 3 (5C.2b5b2 + b3a + b3b):** **Semantic color preservation > palette uniformity.** Examples shipped:
- Mode toggle Practice = teal, Full Test = navy (exam mode signal — different semantic weight)
- Word counter emerald (target met) / coral (below target) = semantic warnings, not band scores
- Submit error coral = semantic error indicator (Soul rule N/A, "never red" only applies to band scores)
- Submit button teal gradient = brand primary CTA visual lifestyle treatment
- Pause confirm modal navy = serious action signal (different from submit teal)

### Decomposition Lessons

**Decomposition seams over spec hopes.** Spec estimates consistently under-call reality. WritingTab decomposition shipped ~30 LOC peeled per commit, not the 200-300 the spec hoped. Honest scope reduction protocol mandatory.

**Standalone-first NEW component pattern.** When a NEW component will integrate into an >800 LOC monolith, ship the NEW file standalone first (zero-risk dead code). Then integrate in a fresh session with thorough monolith audit. Sprint 5C.2a → 5C.2b4 precedent.

**Sequential ship strategy (R2a + R2b).** Each ship was monotonically improving — R2a accepted a transient dual-stopwatch UI, R2b cleaned it up. Combined ship would have been HIGH RISK. Each transient state was acceptable cosmetic at production.

**Architectural exploration before integration.** Sprint 5C.2b4's journey R3 → R1 → R2 → R2a was 4 architectural pivots before landing a safe ship. Honest exploration > forced integration. Each "report findings, no commit" turn was correct.

**Audit table carry-over.** R2 attempt produced Phase 1.6 timer map; R2b execute used the same map without re-auditing. Carrying over Phase 1 audits between sequential commits saves real work.

### Honest Scope Reality

- **Sprint 5C.2b initial estimate:** 6 commits.
- **Sprint 5C.2b actual:** 12 commits (1 skip).
- **Multiplier:** ~2.0x.

**Future estimate adjustment:** When integration + cream restyle work is combined in one sprint, multiply initial estimate by 1.5-2x for accurate planning.

---

## Files State (Sprint 5C scope)

### NEW components created Sprint 5C series

| File | LOC | Sprint | State |
|---|---|---|---|
| `SkillPageShell.tsx` | 135 | 5C.1 | Reusable mode-select shell |
| `WritingExamChrome.tsx` | 338 | 5C.2a | **ACTIVE production** |
| `WritingEditorCore.tsx` | 112 | 5C.2b1 | Active (consumed by WritingTab) |
| `WritingFullTestShell.tsx` | 58 | 5C.2b3 + 5C.2b5a | Cream canon |

### Modified components (cream canon shipped)

| File | LOC | Refs eliminated |
|---|---|---|
| `WritingTab.tsx` | 1010 (was 1083) | 60 (across 6 sub-commits) |
| `WritingResult.tsx` | — | 44 (5C.1b) |
| `WritingPromptSelector.tsx` | — | 12 (5C.1c) |
| `WritingSelfCompareBanner.tsx` | — | 4 (5C.1d) |
| `WritingHistory.tsx` | — | 8 (5C.1e) |
| `WritingParaphraseChips.tsx` | — | 9 (5C.1e) |
| `WritingTimerBar.tsx` | — | 7 (5C.1e) |
| `WritingNotesModal.tsx` | — | 12 (5C.1f) |

### Deferred to Sprint 5C.3

- `WritingCorrectionDrawer.tsx`
- `WritingFullTestResult.tsx`
- `WritingTrendChart.tsx`

---

## Sprint 5A.2 Q1 Lock — Production Verification

| Q1 feature | Source | Status |
|---|---|---|
| Stopwatch flash 10/5min red urgency | WritingExamChrome | ✅ Active |
| Settings popover (font + bg presets) | WritingExamChrome | ✅ Active |
| Hide button (bathroom break overlay) | WritingExamChrome | ✅ Active |
| Sterile typography (font-mono digits, no Playfair body) | WritingExamChrome | ✅ Active |
| textarea spellCheck/autoCorrect/autoCapitalize false | WritingTab + WritingEditorCore | ✅ Preserved |
| Single-source Full Test timer | WritingExamChrome (post-R2b) | ✅ Active |
| No double-submit (timeOutFired guard) | WritingTab + WritingExamChrome.onComplete | ✅ Active |

---

## Sprint 5C.3 Scope (queued)

Polish remaining Writing/ components — same 6 patterns + Lesson 7:
- `WritingCorrectionDrawer.tsx` (cream canon + functional polish)
- `WritingFullTestResult.tsx` (cream canon + functional polish)
- `WritingTrendChart.tsx` (cream canon + Recharts color palette migration)

Estimated 2-3 commits per Sprint 5C.1 single-file restyle precedent.

## Sprint 5D Reading Scope (deferred)

Louis to specify exam-mode change scope before Sprint 5D start. Reading exam mode may adopt the WritingExamChrome chrome-wrap pattern OR develop a similar reusable component. Sprint 5C patterns + lessons apply directly.

---

## Sprint 5I Closer Skill Module Library Candidates

This series closure feeds Sprint 5I closer mega-prompt. Candidates documented:

### From Sprint 5C.1
- 6 Sprint 5C.1 patterns (1-6 above)

### From Sprint 5C.2b
- Pattern 7 inline-style → className refactor
- Lesson 1: Inline-style ≠ token swap
- Lesson 2: Sub-slice ship strategy
- Lesson 3: Semantic color preservation (multiple worked examples)
- Decomposition seams over spec hopes
- Standalone-first NEW component pattern
- Sequential ship strategy (transient state acceptance)
- Architectural exploration before integration
- Audit table carry-over between sequential commits
- Honest scope reality protocol (1.5-2x estimate multiplier)

### Total: ~15 skill module candidates documented.

---

## Closure Notes

- All cumulative milestones verified via `grep -c "var(--color-\|var(--surface-"` returning 0 across every `frontend/components/Writing/*.tsx` file shipped this series.
- Production behavior preserved 100% across Practice + Full Test paths.
- Mascot SVG R1 untouched throughout the series (asset preserved, only conditional render logic touched).
- Backend untouched throughout the series.
- 18+ commits across the session arc; series closes with WritingTab + Writing/ folder Wave 6 cream canon COMPLETE.
