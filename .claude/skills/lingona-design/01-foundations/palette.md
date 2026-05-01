# Palette — canon, drift kill-list, dual-mode

Lingona's color system is **already codified** in `frontend/tailwind.config.ts` + `frontend/styles/globals.css`. KHÔNG invent. KHÔNG add hex outside this file.

Anything new color request → flag Louis trước khi add. Drift detection trong audit là P0 issue.

## Canon palette (locked, codebase-verified)

### Core 3 (signature 100ft test)

| Token | Hex | Tailwind class | CSS var | Use |
|-------|-----|----------------|---------|-----|
| **Navy** | `#1B2B4B` | `bg-navy` / `text-navy` | `--color-navy` | Primary text, header, serious accent |
| **Teal** | `#00A896` | `bg-teal` / `text-teal` | `--color-teal` | Primary action, achievement, encourage |
| **Cream** | `#F8F7F4` | `bg-cream` / page bg | `--color-bg-page` | Brand mode page background |

### Navy ramp

| Token | Hex | Tailwind class | Use |
|-------|-----|----------------|-----|
| `navy-50` | (light tint) | `bg-navy-50` | Light surface, hover state |
| `navy-100` | (light tint) | `bg-navy-100` | Card hover, selected light |
| `navy-200` | (light tint) | `bg-navy-200` | Border emphasized |
| `navy.light` | `#2D4A7A` | `bg-navy-light` / `text-navy-light` | Secondary navy text, hover |
| **`navy.DEFAULT`** | `#1B2B4B` | `bg-navy` / `text-navy` | Primary text, primary navy |
| `navy.dark` | `#0F1429` | `bg-navy-dark` | Hover-pressed, deep emphasis |
| `navy-900` | (deepest) | `bg-navy-900` | Rare — only for max contrast |

### Teal ramp

| Token | Hex | Tailwind class | Use |
|-------|-----|----------------|-----|
| `teal-50` | (light tint) | `bg-teal-50` | Light teal surface (success state hint) |
| **`teal.DEFAULT`** | `#00A896` | `bg-teal` / `text-teal` | Primary CTA, achievement accent |
| `teal.light` | `#00C4B0` | `bg-teal-light` / `text-teal-light` | Hover state, lighter accent |
| `teal.dark` | (deeper) | `bg-teal-dark` | Pressed state, darker accent |

### Cream variants (mode-specific)

| Token | Hex | Mode | Use |
|-------|-----|------|-----|
| **brand cream** | `#F8F7F4` | Brand mode | Page background dashboard, profile, social |
| **IELTS cream** | `#F5EFDC` | IELTS-authentic mode | Full Test, Battle Ranked page bg |

KHÔNG mix: `#F5EFDC` chỉ dùng trong IELTS-authentic. Brand mode dùng `#F8F7F4`. Mode-switch boundary cứng.

### Semantic colors (codebase-verified)

| Token | Hex | Tailwind class | Use |
|-------|-----|----------------|-----|
| **success** | `#22C55E` | `text-success` / `bg-success` | Achievement, correct answer, win state |
| **warning** | `#F59E0B` | `text-warning` / `bg-warning` | Caution, low band warning, time running out |
| **error** | `#EF4444` | `text-error` / `bg-error` | Validation error, failure state |
| **info** | (defined) | `text-info` / `bg-info` | Neutral notice |

### Special accent

| Token | Hex | Tailwind class | Use |
|-------|-----|----------------|-----|
| **gold** | `#FFD700` | `bg-yellow-400` (or custom) | Badge tier (gold), achievement unlock peak |
| **yellow highlight** | `#FFEB3B` | (custom) | IELTS-authentic mode answer highlight (Cambridge faithful) |

### Gray ramp (full Tailwind default)

`gray-50`, `gray-100`, `gray-200`, `gray-300`, `gray-400`, `gray-500`, `gray-600`, `gray-700`, `gray-800`, `gray-900`.

**Usage cap**:
- `text-gray-300/400/500` dominate codebase (192 + 172 + 81 = 445 hits) — text muted hierarchy 3-level (`gray-700` body, `gray-500` secondary, `gray-400` tertiary).
- KHÔNG dùng `text-gray-900` (use `text-navy` thay vì — navy là primary text canonical).
- KHÔNG dùng pure `bg-white` (use `bg-cream` `#F8F7F4` warm-white).

## CSS variable map (`globals.css`)

Pattern: bridge CSS var thay raw hex trong inline style.

| CSS var | Resolves to | Use |
|---------|-------------|-----|
| `--color-bg-page` | `#F8F7F4` | Page background brand mode |
| `--color-bg-primary` | white-ish | Card primary surface |
| `--color-bg-secondary` | tinted | Card secondary surface, hover state |
| `--color-bg-card` | (defined) | Card surface (used for `style={{ background: 'var(--color-bg-card)' }}` bridge) |
| `--color-text-primary` | `#1A1A1A` near-black | Primary text body |
| `--color-text-secondary` | gray-500 ish | Secondary text |
| `--color-text-tertiary` | gray-400 ish | Tertiary hint text |
| `--color-border` | (defined) | Default border |
| `--color-border-strong` | (defined) | Emphasized border |
| `--color-navy` / `--color-teal` / `--color-cream` | as canon | Brand color via CSS var |
| `--ielts-bg` | `#F5EFDC` | IELTS-authentic page bg |
| `--ielts-text` | navy | IELTS-authentic body text |
| `--ielts-highlight` | `#FFEB3B` | IELTS-authentic answer highlight |

**Usage rule**: prefer CSS var > Tailwind class > raw hex.

```jsx
// ✅ OK — CSS var bridge for theme-able surface
<div style={{ background: "var(--color-bg-card)", borderLeft: `4px solid ${dynamicColor}` }}>

// ✅ OK — Tailwind class
<div className="bg-cream text-navy border border-gray-200">

// ❌ BAN — raw hex inline
<div style={{ background: "#1B2B4B", color: "#F8F7F4" }}>
// Reason: bypass theme system, breaks dark mode (if added), un-grep-able.

// ❌ BAN — raw hex Tailwind arbitrary
<div className="bg-[#1B2B4B] text-[#F8F7F4]">
// Same reason. Use bg-navy text-cream instead.
```

## Drift kill-list

Direct from Claude Code grep audit (Apr 30, 2026). These hex are **NOT in tailwind.config**, are **NOT canon**, must be **REPLACED when touched**:

| Drift hex | Hits | Source | Replacement |
|-----------|------|--------|-------------|
| `#8B71EA` | 15 | OnboardingFlow gradient | `var(--color-teal)` solid OR `bg-teal` solid block (no gradient) |
| `#7E4EC1` | 8 | OnboardingFlow gradient pair | (drop, not replaceable — gradient itself is anti) |
| `#F07167` | 8 | unknown source | `var(--color-teal)` if accent, `var(--color-error)` if error state |
| `#2DD4BF` | 18 | "teal-400" not in config | `var(--color-teal)` `#00A896` or `--color-teal-light` `#00C4B0` |
| `bg-emerald-500` | 40 | semantic accent over-use | `bg-teal` for achievement / encourage; `bg-success` only for explicit success state |
| `bg-amber-500` | 32 | semantic accent over-use | review case-by-case — `bg-warning` if warning, else `bg-teal-light` if accent |

**When you encounter drift**: fix on contact. Atomic commit: "refactor(palette): replace drift hex {X} with canon token in {file}". Do NOT batch all drift fixes in one mega-commit (too large to review).

**When you must add new color**: STOP. Flag Louis. Do not commit. Drift detection is canonical contract.

## Mode-specific palette

### Brand mode (default)

```
Page bg:        #F8F7F4 cream
Primary text:   #1B2B4B navy
Secondary text: gray-500 / gray-600
CTA:            #00A896 teal solid
Hover CTA:      #00C4B0 teal-light
Achievement:    #00A896 teal OR gold #FFD700
Border:         var(--color-border) subtle
Card:           var(--color-bg-card) white-ish
```

### Brand-soft mode (Practice — bridge gamified ↔ exam)

```
Page bg:        #F8F7F4 cream (slightly more visible than brand)
Primary text:   #1B2B4B navy
CTA:            #00A896 teal (lighter usage — Practice less intrusive)
Decoration:     muted, less mascot than brand mode
```

### IELTS-authentic mode (Full Test + Battle Ranked)

```
Page bg:        #F5EFDC cream Cambridge (warm parchment)
Primary text:   #1B2B4B navy (or near-black #1A1A1A)
Body font:      Georgia (NOT DM Sans — see typography.md)
Highlight:      #FFEB3B yellow (answer marking Cambridge style)
Border:         minimal — Cambridge UI uses thin border-bottom only
CTA:            small, neutral — exam tools (submit, flag, bookmark) not encourage
NO Lintopus:    presence absent during exam (return in result page only)
NO gradient:    flat surfaces only
NO motion:      static UI (timer ticks only)
```

Mode boundary CỨNG — see `04-modes/mode-switch-rules.md` for runtime hook.

## Color usage anti-patterns

❌ Generic SaaS gradient hero (`from-blue-500 to-purple-500`) — see `09-anti-patterns/ai-generated-smell.md`
❌ Gradient text (`bg-clip-text text-transparent`) anywhere — solid color only
❌ `bg-emerald-500` for achievement — use `bg-teal` (semantic-correct + brand-correct)
❌ `bg-amber-500` decorative — use `bg-warning` if warning, else `bg-teal-light` accent
❌ Pure `bg-white` page — use `bg-cream` warm-white
❌ `text-gray-900` for primary — use `text-navy`
❌ Multiple teals in same view (`#00A896` + `#2DD4BF` + `bg-emerald-500`) — pick 1, lock
❌ Color-as-decoration (color used to "make page interesting") — color encodes meaning only

## Color usage green flags (codebase verified)

✅ `tailwind.config.ts` defines navy/teal/cream + semantic + extension — single source
✅ `globals.css` defines CSS var system + IELTS-* block dual mode infra
✅ Custom keyframes use canon colors (fadeSlideUp, pulseGlow, etc.)
✅ Z-index scale defined (`z-base..z-splash` 0..80) — KHÔNG random `z-50/z-100/z-9999`
✅ Result components use CSS-var bridging (`var(--color-bg-secondary)`, `var(--color-border)`)
✅ Mascot component standalone — KHÔNG hardcode color in Mascot.tsx

## Audit checklist (apply trước khi ship page)

```
1. grep hex literal trong file đang touch:
   grep -E '#[0-9a-fA-F]{3,8}' src/<file>.tsx
   → Each hit must be canon (in tailwind.config) OR CSS var bridge.

2. grep raw inline style:
   grep -E "style=\\{\\{" src/<file>.tsx
   → Each hit must use var(--color-*), KHÔNG raw hex.

3. grep emerald/amber Tailwind:
   grep -E "(bg|text)-(emerald|amber)-" src/<file>.tsx
   → Replace per drift kill-list table above.

4. Mode boundary check:
   - Page in /(app)/exam/* → mode runtime via EXAM_UX[mode]
   - KHÔNG hardcode brand-soft palette into Full Test path

5. Dark mode test (future):
   - All text via `--color-text-*`, KHÔNG raw `color: black`
   - All bg via `--color-bg-*`, KHÔNG raw `background: white`
```

## See also

- `01-foundations/typography.md` — DM Sans + Playfair pairing (display font system)
- `01-foundations/space-system.md` — spacing rhythm
- `01-foundations/radius-language.md` — radius scale
- `04-modes/mode-switch-rules.md` — runtime mode hook
- `09-anti-patterns/drift-kill-list.md` — full drift table with file paths
- `09-anti-patterns/inline-style-rule.md` — CSS var bridge OK, raw hex BAN
- `00-manifesto/recognizable-from-100ft.md#2` — palette signal #2 in 100ft test
