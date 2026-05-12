# Scenario card — Tình huống nói list anatomy

Keywords for skill search: scenario, tình huống, speak scenarios, filter chip, pill, category icon, difficulty badge, empty state, list card.

Pattern for the Nói theo tình huống (`/learn/scenarios`) list — and any future feature that follows the same "filterable list of practice tasks" anatomy (e.g., Writing prompt picker, future skill drills).

## Filter chip (pill)

Pill-shaped filter button rendered above the list. Active = one chip, inactive = rest.

```tsx
<button
  onClick={() => setActiveCategory(cat.key)}
  aria-pressed={isActive}
  className={[
    "px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap shrink-0 min-h-[44px]",
    "transition-colors duration-fast",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
    isActive
      ? "bg-teal text-cream shadow-colored"
      : "bg-navy/5 text-navy/70 hover:bg-navy/10 hover:text-navy",
  ].join(" ")}
>
  {cat.label}
</button>
```

| Element | Token | Notes |
|---|---|---|
| Shape | `rounded-full` | Pill (NOT `rounded-xl`). |
| Active bg | `bg-teal` + `shadow-colored` | Canonical teal CTA pattern. |
| Active text | `text-cream` | High contrast on teal. |
| Inactive bg | `bg-navy/5` | Very subtle wash; `bg-navy/10` on hover. |
| Inactive text | `text-navy/70` → hover `text-navy` | Quiet by default, sharpens on hover. |
| Touch target | `min-h-[44px]` + `py-2.5` | Mobile-safe. |
| Focus ring | `ring-teal/40` `ring-offset-cream` | Canonical Lingona pattern (matches About/Help/auth). |
| Transition | `duration-fast` (150ms) | Local app-mode convention; matches auth forms. |
| ARIA | `aria-pressed={isActive}` | Toggle semantics for screen readers. |

Container: `flex gap-2 sm:gap-3 overflow-x-auto pb-1 -mx-1 px-1` — horizontal scroll on mobile when chips overflow.

## Scenario card

```
┌───────────────────────────────────────────────────┐
│ ┌──────┐  Title (Playfair italic 20-22px)         │
│ │ icon │  Description line 1 (DM Sans 15-16px,    │
│ │ 64×64│   line-clamp-2, navy/70-ish via CSS var) │
│ └──────┘  [badge: cơ bản] · ~8 lượt          >    │
└───────────────────────────────────────────────────┘
```

| Element | Spec |
|---|---|
| Container | `p-4 sm:p-5 rounded-lg`, CSS vars `--color-bg-card` + `--color-border`. NOT `bg-cream`/`border-gray-200` (those are public-mode card-language.md canon — app-mode uses CSS vars). |
| Icon container | `w-16 h-16 rounded-lg bg-teal/10 text-teal-dark` — pinned 64×64 across all viewports (consistency over per-breakpoint optimization). |
| Icon | Lucide stroke icon, `size={24}` `strokeWidth={2}`. See category map below. |
| Title | `font-display italic text-[20px] sm:text-[22px] leading-tight truncate` — Playfair italic. |
| Description | `text-[15px] sm:text-[16px] mt-1 line-clamp-2 leading-snug` — 2-line clamp (NOT 1). |
| Meta line | difficulty badge + `·` separator + `~N lượt`, `text-[13px] sm:text-[14px]`, `text-tertiary` CSS var. |
| Chevron | 16px SVG right-pointing, `text-secondary` CSS var, `shrink-0`. |
| Focus ring | Canonical `ring-teal/40` + `ring-offset-cream`. |
| Hover | `card-hover` global class (subtle scale/translate per existing app-mode hover style). |

## Category → Lucide icon map

```ts
import { Sun, Utensils, Plane, Briefcase, Users, GraduationCap, MessageSquare } from "lucide-react";

const CATEGORY_ICON = {
  daily: Sun,
  food: Utensils,
  travel: Plane,
  work: Briefcase,
  social: Users,
  academic: GraduationCap,
};
// Fallback for IELTS / unknown: MessageSquare
```

Rationale per pick: `Sun` over `Coffee` cho daily (coffee associatively conflicts with food); `Plane` over `MapPin` cho travel (more associative); `Users` over `MessageCircle` cho social (emphasis on people, not chat).

NOTE: `scenario.emoji` field exists on the DB row but is **unused for rendering**. Don't delete the column — keeping it as historical/optional metadata is harmless and avoids a migration. Frontend reads `scenario.category` only.

## Difficulty badge tier colors

```ts
const DIFFICULTY_BADGE_CLASS = {
  beginner:     "bg-teal/10 text-teal",
  intermediate: "bg-navy/10 text-navy",
  advanced:     "bg-amber-100 text-amber-700",
};
```

`bg-amber-100 text-amber-700` is the ONE accepted palette deviation in this component — applied only to `nâng cao` to keep difficulty signal scannable across the three tiers. Don't extend amber to other surfaces.

Badge JSX:

```tsx
<span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${diffClass}`}>
  {DIFFICULTY_LABEL[scenario.difficulty] ?? scenario.difficulty}
</span>
```

VN labels (Session 1 voice canon): beginner → cơ bản · intermediate → trung cấp · advanced → nâng cao.

## Empty state (filtered category, 0 results)

```tsx
<div className="max-w-[480px] mx-auto py-16 text-center flex flex-col items-center gap-5">
  <p className="text-base" style={{ color: "var(--color-text-secondary)" }}>
    Chưa có tình huống trong nhóm này.
  </p>
  <Mascot size={80} mood="default" />
  <button
    type="button"
    onClick={() => setActiveCategory(undefined)}
    className="inline-flex items-center gap-1.5 text-sm font-medium text-teal hover:text-teal-dark transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-md px-2 py-1"
  >
    Xem tất cả tình huống
    <span aria-hidden="true">→</span>
  </button>
</div>
```

Three elements stacked: copy → Lintopus (mood default, 80px) → soft reset-CTA link. `max-w-[480px]` keeps the block from spreading on wide viewports. Peer voice — no `vui lòng`, no error-toast register.

## Voice / banned-phrase compliance applied

- Section heading: `Tình huống nói` (NOT `Speak Scenarios` — Session 1 voice canon).
- Filter labels: Tất cả / Hàng ngày / Ăn uống / Du lịch / Công việc / Xã hội / Học thuật.
- Difficulty: cơ bản / trung cấp / nâng cao.
- Empty state: `Chưa có tình huống trong nhóm này.` (NOT `Không tìm thấy kịch bản nào cho danh mục này` — drops `kịch bản` corporate-translate of "scenario").
- Reset CTA: `Xem tất cả tình huống →` (peer, soft).

## Token system note

This component is **app-mode** (lives inside `(app)` group, requires auth). Uses CSS vars (`--color-bg-card`, `--color-border`, `--color-text`, `--color-text-secondary`, `--color-text-tertiary`) — NOT the public-mode Tailwind palette (`bg-cream` / `text-navy`). Don't migrate to Tailwind tokens here without a coordinated app-mode token reconciliation pass; doing it in isolation creates visual jarring against adjacent Exam/Profile cards.

The Tailwind palette tokens DO appear inside this component for:
- Icon container wash (`bg-teal/10 text-teal-dark`)
- Difficulty badge tiers (`bg-teal/10`, `bg-navy/10`, `bg-amber-100`)
- Filter chips (`bg-teal`, `bg-navy/5`, etc.)
- Focus rings (`ring-teal/40`)

This is a deliberate hybrid: structural surfaces use CSS vars (mode-aware), semantic accents use Tailwind palette (mode-stable). Both layers coexist; don't force one or the other.

## Origin

Established in commit `[Phase A push hash placeholder]` (Session 2 polish, May 2026) — refactor of ScenarioList.tsx replacing per-row `scenario.emoji` with category-based Lucide icons + filter chip pill refinement + empty-state with reset CTA. Same disclaimer pattern as `09-anti-patterns/tailwind-grid-rows-fr-gotcha.md` — scale may revise after second consumer adopts the pattern (Writing prompt picker is the likely next site).

## See also

- `03-components/card-language.md` — public-mode card canon (`bg-cream` etc.); contrasts with the app-mode CSS-var pattern documented here.
- `03-components/primary-button.md` — teal CTA shape language; filter active chip borrows this.
- `03-components/mascot.md` — Lintopus placement; empty-state uses size 80 mood `default`.
- `05-voice/never-say-list.md` — `kịch bản` is corporate-translate; `tình huống` is canon.
- `09-anti-patterns/corporate-translate.md` — `tìm thấy ... cho danh mục` reads translated-from-English; we use natural `Chưa có ... trong nhóm này.`
