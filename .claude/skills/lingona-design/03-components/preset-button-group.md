# Preset button group — chip-style enum picker

`PresetButtonGroup` is the canonical pattern for selecting from a small
discrete enum (2–5 options) inside a form. Shipped Sprint 4D inside
the onboarding optional section; reused in Sprint 5+ for Pro-feature
intensity / duration / streak-target pickers.

## When to use

- The choice space is a **closed enum** with 2–5 named values.
- Each option has a short Vietnamese label (≤ 25 chars).
- The user picks **exactly one** at a time (radio semantics).

## When NOT to use

- > 5 options → use BandGrid (4-col layout) or a select.
- Free-text input → use `<input type="text">` + zod validation.
- Boolean toggle without a label per side → use a checkbox or switch.
- Multi-select → use a checkbox group, not this component.

## Canonical signature

```tsx
import PresetButtonGroup, { type PresetOption } from "@/components/Onboarding/PresetButtonGroup";

type StudyHoursBucket = "3-5h" | "6-10h" | "10h+";
const OPTIONS: PresetOption<StudyHoursBucket>[] = [
  { value: "3-5h", label: "3-5 giờ" },
  { value: "6-10h", label: "6-10 giờ" },
  { value: "10h+", label: "Trên 10 giờ" },
];

<PresetButtonGroup<StudyHoursBucket>
  label="Bạn học bao nhiêu giờ mỗi tuần?"
  options={OPTIONS}
  value={studyHours}
  onChange={setStudyHours}
/>
```

Generic `<T extends string>` — TypeScript infers from the `options`
array's value union. Explicit instantiation only needed when the
value union must be wider than what `options` declares.

## Visual states (cream context only)

| State | Classes |
|-------|---------|
| Default | `bg-cream-warm border border-gray-200 text-navy` |
| Hover | `hover:border-teal hover:bg-cream` |
| Selected | `bg-teal/10 border-teal text-teal ring-1 ring-teal` |
| Focus-visible | `ring-2 ring-teal-light ring-offset-2 ring-offset-cream` |

Layout: `flex flex-wrap gap-2`. Min tap target 40px (px-4 py-2 +
text-sm = 40px). Single mode (cream) — add a `mode='dark'` prop if a
dark consumer surfaces.

## Voice

Caller provides `label` and per-option `label`. Both follow the
`05-voice/persona.md` peer voice rules:

- Lowercase `mình` / `bạn` if the question references the user.
- No `nhé` particle.
- No banned jargon (see `09-anti-patterns/jargon-ban.md`).

Built-in fallback `aria-label = "Chọn một"` when caller omits.

## Anti-patterns

- ❌ `rounded-full` on chips — pill is reserved for tag-style actions
  like "+ Mời bạn" per `03-components/primary-button.md`. PresetButtonGroup
  uses `rounded-md`.
- ❌ Concatenating dynamic class strings (`bg-${color}-100`) — Tailwind
  JIT can't see them. Use explicit conditional class strings.
- ❌ More than 5 options — use BandGrid 4-col layout instead.
- ❌ Skipping the `<fieldset>`/`<legend>` wrapper — screen readers lose
  the question context.

## See also

- `03-components/band-grid.md` — when option count exceeds 5
- `03-components/card-language.md` — chip = compact card pattern
- `03-components/primary-button.md` — radius rules + tap micro-interaction
- `06-motion/framer-variants.md` — `tapScale` import location
- `frontend/components/Onboarding/PresetButtonGroup.tsx` — canonical impl
