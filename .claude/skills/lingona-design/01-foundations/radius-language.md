# Radius language — when sharp, when round, when pill

Lingona's radius scale is **already locked** in `tailwind.config.ts`. KHÔNG arbitrary `rounded-[Npx]`. Different radii encode different meaning.

## Canon scale

| Tailwind class | Radius | Use |
|----------------|--------|-----|
| `rounded-none` | 0 | Sharp edge — exam UI Cambridge style, table borders |
| `rounded-sm` | 8px | Very subtle round — table cell, inline tag |
| `rounded-md` | 12px | **Default for most UI** — buttons, input, small card |
| `rounded-lg` | 16px | Card, modal, hero card |
| `rounded-xl` | 24px | Large hero card, prominent CTA card |
| `rounded-2xl` | (large) | Landing hero card, "moment" card |
| `rounded-full` | 9999px | Avatar, mascot container, pill button, badge |

**Codebase frequency** (Apr 30 grep, no arbitrary radius drift):
- `rounded-full` 1405 ★ (heavy avatar/badge usage)
- `rounded-lg` 1106 ★ (card default)
- `rounded-xl` 647
- `rounded-md` 250 (under-used — should be DEFAULT for buttons)
- `rounded-2xl` 204
- `rounded-sm` 34

**Drift status**: ZERO arbitrary `rounded-[Npx]` — clean ✅. Maintain.

## When sharp (rounded-none / rounded-sm)

Sharp edges signal **seriousness, exam-real, official document feel**.

- ✅ IELTS-authentic mode (Full Test, Battle Ranked) — Cambridge UI uses sharp/minimal radius
- ✅ Table cells, data rows
- ✅ Borders + dividers (visible borders inside large cards)
- ✅ Inline tag in dense data display
- ❌ Buttons — too cold
- ❌ Cards on dashboard — too austere

```jsx
// IELTS-authentic full test answer field
<input className="border border-navy rounded-none px-3 py-2 font-serif" />

// Data table cell
<td className="border-b border-gray-200 rounded-none p-3">
```

## When round-medium (rounded-md, 12px)

**Default for most interactive elements** — buttons, inputs, small cards.

- ✅ Primary button
- ✅ Secondary button
- ✅ Form input (text, textarea, select)
- ✅ Small card (sidebar item, notification toast)
- ✅ Inline pill (tag, status indicator)
- ✅ Toast notification
- ✅ Tooltip
- ❌ Hero card / landing card — too small radius
- ❌ Avatar — should be full

```jsx
// Default button
<button className="rounded-md px-4 py-2 bg-teal text-cream font-medium">
  Submit
</button>

// Form input
<input className="rounded-md border border-gray-300 px-4 py-2.5" />

// Toast
<div className="rounded-md bg-navy text-cream p-3 shadow-lg">
```

## When round-large (rounded-lg, 16px)

**Standard card radius** — content card, modal, group container.

- ✅ Content card (BandProgressCard, feature card)
- ✅ Modal default
- ✅ Result feedback card
- ✅ Battle queue card
- ✅ Achievement badge container

```jsx
// Standard card
<div className="rounded-lg bg-cream border border-gray-200 p-6 shadow-sm">

// Modal
<div className="rounded-lg bg-cream p-6 max-w-md mx-auto">
```

## When round-XL/2XL (rounded-xl / rounded-2xl, 24px)

**Hero / "moment" card** — Landing hero card, Result page hero, Level-up overlay, Pro upgrade tier card.

- ✅ Landing hero CTA card
- ✅ Pro upgrade tier card (4 tiers, prominent)
- ✅ Result page band display card (band number signature card)
- ✅ Level-up / Achievement unlock overlay
- ❌ Default card — too prominent, signal moment when isn't

```jsx
// Pro upgrade tier
<div className="rounded-2xl bg-cream border-2 border-teal p-8">
  <h3 className="text-3xl font-display italic">Năm</h3>
  <p className="text-5xl font-display italic">1.490k</p>
</div>

// Result band display
<div className="rounded-xl bg-cream p-8">
  <span className="text-6xl font-display italic">7.0</span>
</div>
```

## When pill / full (rounded-full)

**Avatar, mascot container, badge, pill button** — anything circular by intent.

- ✅ Avatar (user profile photo, friend list)
- ✅ Mascot container (Lintopus circular wrapper)
- ✅ Achievement badge
- ✅ Streak ring (circular SVG, container full)
- ✅ Pill button (compact tag-style action)
- ✅ Notification dot (Friend chat unread, NotificationBell)
- ✅ Inline status dot (online indicator)

```jsx
// Avatar
<div className="rounded-full w-12 h-12 bg-teal flex items-center justify-center">

// Lintopus container
<div className="rounded-full w-32 h-32 bg-cream flex items-center justify-center">
  <Mascot size={100} mood="happy" />
</div>

// Pill button
<button className="rounded-full bg-teal-light px-4 py-1 text-sm">
  + Mời bạn
</button>

// Badge
<div className="rounded-full bg-gold px-3 py-1 text-xs font-bold">Pro</div>
```

## Mode-specific radius

### Brand mode (default)

Mixed scale — `rounded-md` buttons, `rounded-lg` cards, `rounded-xl/2xl` hero, `rounded-full` avatar/mascot.

### Brand-soft mode (Practice)

Same as brand — Practice = Cambridge-adjacent but not pure exam, mixed scale OK.

### IELTS-authentic mode (Full Test, Battle Ranked)

**Sharp / minimal radius** — Cambridge UI faithful.

- `rounded-none` table cells, answer fields, passage container
- `rounded-sm` (8px) only for absolute necessity (small UI element where sharp = harsh)
- ❌ NO `rounded-lg/xl/2xl` in exam UI
- ❌ NO `rounded-full` except timer dot (single accent)

```jsx
// IELTS Full Test answer cell
<td className="border border-navy rounded-none p-2 font-serif">

// IELTS submit button (sharp Cambridge style)
<button className="rounded-sm border border-navy bg-cream px-6 py-2 font-serif">
  Submit
</button>
```

## Anti-patterns

### ❌ Uniform rounded-xl everywhere (v0 default)

v0 / Lovable default uses `rounded-xl` for **everything** — buttons, cards, inputs, modals same radius. Reads as **"AI-template"**.

```jsx
// ❌ AI-generated smell
<button className="rounded-xl ...">
<input className="rounded-xl ...">
<div className="rounded-xl ...">  // card
<div className="rounded-xl ...">  // modal
```

Lingona = **mixed scale** — buttons `rounded-md`, cards `rounded-lg`, hero `rounded-xl/2xl`. Variation is the signal.

### ❌ Rounded corners on single-sided borders

```jsx
// ❌ rounded but only border-left → corners look wrong
<div className="rounded-lg border-l-4 border-teal">

// ✅ Sharp when partial border
<div className="rounded-none border-l-4 border-teal">

// ✅ Or full border
<div className="rounded-lg border border-teal">
```

### ❌ Overly aggressive radius (rounded-full on text card)

```jsx
// ❌ Looks like a pill swallowing text
<div className="rounded-full p-6">
  <p>This text card has too much radius...</p>
</div>

// ✅ Card with reasonable radius
<div className="rounded-lg p-6">
  <p>...</p>
</div>
```

### ❌ Mixing radius within same component

```jsx
// ❌ Inconsistent
<div className="rounded-lg">
  <header className="rounded-md ...">  {/* mismatch */}
  <button className="rounded-full ...">  {/* random */}
</div>

// ✅ Consistent — outer shape locked, inner inherits or matches
<div className="rounded-lg overflow-hidden">
  <header className="...">  {/* clipped by overflow-hidden */}
  <button className="rounded-md ...">  {/* OK — button has its own scale */}
</div>
```

## Component-mapped radius (canonical)

Single-source-of-truth table. Reference này khi build component:

| Component | Radius | Rationale |
|-----------|--------|-----------|
| Primary button | `rounded-md` | Default interactive |
| Secondary button | `rounded-md` | Match primary |
| Pill button (action chip) | `rounded-full` | Compact, action-as-tag |
| Form input (text) | `rounded-md` | Match button |
| Form input (textarea) | `rounded-md` | Match input |
| Form select | `rounded-md` | Match input |
| Toggle (switch UI) | `rounded-full` | Pill body + circle thumb |
| Checkbox | `rounded-sm` | Small, near-square |
| Radio | `rounded-full` | Always circular |
| Card (default) | `rounded-lg` | Standard breath |
| Card (hero/moment) | `rounded-xl` or `rounded-2xl` | Prominence signal |
| Modal | `rounded-lg` | Card-default same |
| Toast | `rounded-md` | Compact, transient |
| Tooltip | `rounded-md` | Compact |
| Badge | `rounded-full` | Pill |
| Avatar | `rounded-full` | Always circular |
| Mascot container | `rounded-full` | Match avatar pattern |
| Streak ring | `rounded-full` | Circular SVG |
| Progress bar | `rounded-full` | Pill bar |
| Tag / chip (inline) | `rounded-full` | Pill |
| Image (in card) | `rounded-md` | Subtle, inside card |
| Image (hero standalone) | `rounded-lg` | Match card scale |
| Table cell | `rounded-none` | Sharp grid |
| IELTS exam container | `rounded-none` | Cambridge sharp |
| IELTS answer field | `rounded-none` | Cambridge sharp |
| IELTS submit (mode-locked) | `rounded-sm` | Cambridge minimal |

## Audit checklist

```
1. grep arbitrary radius:
   grep -E "rounded-\[" src/<file>.tsx
   → Should be 0

2. Component radius match canonical table?
   - Buttons → rounded-md ✓
   - Cards → rounded-lg ✓
   - Hero cards → rounded-xl/2xl ✓
   - Avatars/mascot → rounded-full ✓

3. Mode boundary check:
   - IELTS-authentic page → rounded-none / rounded-sm only
   - KHÔNG mixed scale rounded-xl trong full test

4. Border + radius pair:
   - border-l-N partial → rounded-none required
   - border-full all sides → rounded-* OK
```

## See also

- `01-foundations/palette.md` — color system
- `01-foundations/typography.md` — type scale
- `01-foundations/space-system.md` — spacing rhythm
- `04-modes/ielts-authentic.md` — Cambridge sharp radius mode (pending)
- `09-anti-patterns/ai-generated-smell.md` — uniform rounded-xl anti (pending)
