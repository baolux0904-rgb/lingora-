# Onboarding modal layout

The first moment a user sees Lingona after signup. This module locks
the layout decisions made across Sprints 4B → 4E.2 so future
onboarding-adjacent screens (e.g. settings band edit, "redo
onboarding" admin tool) inherit the same restraint.

## Modal context vs landing canvas

Onboarding is a **modal**, not a marketing canvas:

| Property | Modal context | Landing canvas |
|----------|---------------|----------------|
| Max width | `max-w-[640px] mx-auto` | `max-w-[1120px] mx-auto` |
| Padding | `px-6 py-12 lg:py-16` | `px-6 lg:px-12 xl:px-20 py-20 lg:py-28` |
| Surface | `bg-cream` (modal IS the card — no inner card wrapper) | `bg-cream` with feature cards inside |
| Hierarchy | 1 task per screen | Multi-section narrative |

The modal owns the viewport (`fixed inset-0 z-splash`) but reads as a
calm cream surface, not a splash. Don't add inner card containers
inside the modal — the modal already is one.

## Vertical rhythm (top → bottom)

1. **Step indicator** — `1 / 2` / `2 / 2`, top-right corner,
   `text-sm font-medium text-navy/40 tabular-nums`. Tabular-nums so the
   digit doesn't shift width between steps.
2. **Mascot Lintopus** — top-center, 96px width, `mood="happy"`.
   Smaller than landing 240px, larger than badge 32px. The
   onboarding-intro register.
3. **Headline** — `font-display italic text-navy text-3xl lg:text-4xl
   leading-tight`. Single sentence. No subhead-as-headline.
4. **Subhead** — `text-base text-gray-700 max-w-sm`. One sentence,
   peer voice. References the previous step's value when possible
   (e.g. "Lintopus sẽ vẽ lộ trình từ band 6.5 đến đây").
5. **Step content** (BandGrid, OptionalSection, etc.) — `mt-8`.
6. **Primary CTA + secondary stack** — `mt-10`, `flex flex-col gap-3`.
   Primary first ("Tiếp tục" / "Hoàn tất"), then back link if
   applicable ("← Quay lại"), then defer link ("Để sau").

All elements centered (`items-center text-center`). The modal is a
single-column flow; don't introduce horizontal layout primitives.

## Step transitions

Use `stepCrossfade` from `frontend/lib/motionVariants.ts` —
`AnimatePresence mode="wait"` between steps:

```tsx
<AnimatePresence mode="wait">
  {step === 1 && (
    <motion.section
      key="step-1"
      variants={stepCrossfade}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      ...
    </motion.section>
  )}
</AnimatePresence>
```

**NOT a horizontal slide.** Lingona prefers a stable canvas over
carousel feel — fade-out + fade-in with a 4px y-offset matches the
visual restraint of the cream surface.

## Mount transition

The whole modal uses `pageEnter` from motionVariants.ts: 400ms fade +
8px slide-up. Don't add a backdrop fade — the modal is full-viewport,
no underlying surface shows through.

## Step indicator semantics

- Critical fields count as steps (current band + target band = 2 steps).
- Optional collapsible (4D OptionalSection) does **not** count.
  Step indicator stays "2 / 2" when expanded.
- The "Để sau" defer button is always visible regardless of step —
  user can leave at any point, defer state persists via the
  Sprint 4E.1 backend `/onboarding/defer` endpoint.

## Voice

- 0 `nhé` instances anywhere. First impression should be calm and
  clean, not chatty. The warm-moment exception (e.g. WaitlistModal
  success "Tuyệt — đóng nhé") does NOT extend here.
- 0 banned jargon. The single AI reference allowed is "Lintopus" or
  "Lintopus AI" — branded mascot voice, not implementation.
- Headline copy must be a question for selection steps ("Bạn đang ở
  band nào?", "Mục tiêu band của bạn?") — frames the screen as a
  conversation, not a form.

## Defer behavior

"Để sau" calls `POST /api/v1/users/onboarding/defer` (Sprint 4E.1)
which sets `users.onboarding_deferred_at = now()` without flipping
`has_completed_onboarding`. The /home banner (Sprint 4E.2 HomeBanner)
reads `has_deferred_onboarding` from `/onboarding/status` and shows a
resumption CTA on subsequent home visits.

The legacy `skipOnboarding()` endpoint (POST `/onboarding/skip`)
flips `has_completed_onboarding = true` AND `onboarding_skipped =
true` — that endpoint is reserved for the pre-Wave-6 cohort and
should NOT be called from any new code path.

## Anti-patterns

- ❌ Inner card wrapper inside the modal (`<div class="bg-cream-warm
  rounded-card">…</div>` around the step content) — the modal IS the
  card.
- ❌ Horizontal slide between steps (carousel feel).
- ❌ Hiding the "Để sau" button on later steps (user must always have
  an out).
- ❌ Step indicator counting optional collapsible as a step.
- ❌ Mascot Lintopus rendered larger than 128px in this context (240px
  is landing-only).
- ❌ Calling `skipOnboarding()` from new code — use `deferOnboarding()`.
- ❌ Headlines framed as imperatives ("Chọn band của bạn") — questions
  read as conversation, imperatives read as forms.

## See also

- `frontend/components/Onboarding/OnboardingFlow.tsx` — canonical impl
- `03-components/band-grid.md` — picker component used in both steps
- `03-components/preset-button-group.md` — chip picker for optional fields
- `06-motion/accordion-pattern.md` — OptionalSection collapse pattern
- `05-voice/persona.md` — peer voice rules + warm-moment exceptions
- `09-anti-patterns/jargon-ban.md` — Lintopus branded voice rules
