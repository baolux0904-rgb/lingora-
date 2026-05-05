# Band grid — IELTS half-band picker

`BandGrid` is the radio-button grid for IELTS half-band selection. It
replaces the native `<select>` + `<option>` pattern in the onboarding
modal (shipped Sprint 4B) and is the only sanctioned UI for picking
a band value across the app.

## Pattern

```
┌─────┬─────┬─────┬─────┐
│ 4.0 │ 4.5 │ 5.0 │ 5.5 │
├─────┼─────┼─────┼─────┤
│ 6.0 │ 6.5 │ 7.0 │ 7.5 │
├─────┼─────┼─────┼─────┤
│ 8.0 │ 8.5 │ 9.0 │  ?  │  ← optional escape cell
└─────┴─────┴─────┴─────┘
```

11 cells covering 4.0 → 9.0 in 0.5 increments. Below 4.0, the user
picks the optional 12th "Chưa biết band hiện tại" escape cell — see
`showUnknownEscape` prop.

## Signature

```tsx
<BandGrid
  value={currentBand}             // number | null
  onChange={setCurrentBand}        // (n: number | null) => void
  showUnknownEscape={true}         // boolean — escape cell on/off
  mode="cream"                     // 'dark' | 'cream' (default 'dark')
  ariaLabel="Band IELTS hiện tại"
/>
```

`value` and the `onChange` argument are `number | null` — `null` only
fires when `showUnknownEscape={true}` and the user picks the escape
cell. Caller distinguishes "Chưa biết" intent from "user hasn't
touched yet" via an external touched flag (see OnboardingFlow.tsx
`currentTouched` for the canonical pattern).

## When to use which prop

| Surface | `showUnknownEscape` | `mode` |
|---------|---------------------|--------|
| Current-band picker (onboarding step 1) | `true` | `'cream'` |
| Target-band picker (onboarding step 2) | `false` (always have an aspiration) | `'cream'` |
| Pre-Sprint-4C dark onboarding (legacy) | `true` | `'dark'` |
| Settings band edit (post-launch) | `false` (settings = explicit edit, no escape) | `'cream'` |

## a11y

- Wrapper `role="radiogroup"` + caller-provided `aria-label`.
- Each cell `role="radio"` + `aria-checked` + `aria-label="Band 6.5"`.
- Selected cell carries `tabIndex={0}`; others `-1`. When nothing is
  selected, the first cell becomes the entry point (standard radio
  group keyboard pattern).
- Browser handles arrow-key focus movement once tabIndex is wired
  correctly.

## Visual states

### Cream mode (default Sprint 4C+)

| State | Classes |
|-------|---------|
| Default | `bg-cream-warm border-gray-200 text-navy` |
| Hover | `hover:border-teal` |
| Selected | `bg-teal/10 border-teal text-teal ring-1 ring-teal` |
| Focus-visible | `ring-teal-light ring-offset-cream` |
| Escape cell | `border-2 border-dashed border-gray-300 text-gray-600` (default), teal when selected |

### Dark mode (legacy pre-Sprint-4C)

| State | Classes |
|-------|---------|
| Default | `bg-white/5 border-white/10 text-white/80` |
| Hover | `hover:border-white/30 hover:bg-white/10` |
| Selected | `bg-teal/15 border-teal text-teal ring-1 ring-teal` |
| Focus-visible | `ring-teal-light ring-offset-navy` |

Mode is a Tailwind static-class concern, not a runtime theme — both
class sets ship in the bundle. Adding more modes requires extending
the `cellClasses()` and `unknownCellClasses()` switches.

## Cell layout

- 4-column grid (`grid grid-cols-4 gap-2 sm:gap-3`).
- Square aspect ratio (`aspect-square`).
- Min height 64px (mobile tap target).
- Numeric cells: `font-display italic text-2xl` (matches the band
  display register elsewhere in the app).
- Escape cell: `HelpCircle` icon + 2-line text "Chưa biết / band".

## Anti-patterns

- ❌ Native `<select>` for band picking — readability suffers
  for diacritics, dropdown UI is too noisy for the 11-option case.
- ❌ Surfacing options below 4.0 in the grid — backend allows
  `[3.0, 9.0]` for legacy data, but the UI caps at 4.0 to avoid
  paralysis. Users with stored values 3.0/3.5 keep their data; they
  just can't re-pick it from the grid.
- ❌ Adding "7.5+" cap label — every half-band is a distinct cell.
- ❌ Disabling the escape cell when `showUnknownEscape={true}` — the
  whole point is letting the user opt out of pretending to know.

## See also

- `frontend/components/Onboarding/BandGrid.tsx` — canonical impl
- `02-layout/onboarding-modal.md` — modal context BandGrid sits in
- `03-components/preset-button-group.md` — chip-style picker for ≤ 5 options
- `09-anti-patterns/inline-style-rule.md` — explicit class strings only
