# Drift kill list — color/font/radius drift catalog

Every hex code, font, radius value used outside Lingona canon = **drift**. Wave 6 audit identified ~40 drift instances across codebase. This file = exhaustive list to grep + remove.

Per `01-foundations/palette.md` + `01-foundations/typography.md` + `01-foundations/radius-language.md` — single source of truth. Anything outside = drift.

## 1. Color drift kill list

### Banned hex codes (audit findings)

| ❌ Drift hex | Where found | Replace with |
|-------------|-------------|--------------|
| `#8B71EA` | Earlier purple accent (mascot bubble?) | `var(--color-teal)` `#00A896` |
| `#7E4EC1` | Earlier gradient | `var(--color-teal)` |
| `#F07167` | Earlier "warmth" coral | `var(--color-warning)` if warning context, else palette |
| `#2DD4BF` | Wrong teal shade | `var(--color-teal)` `#00A896` exact |
| `#FFFFFF` (pure white) | Various card bg | `var(--color-cream)` `#F8F7F4` |
| `#FFF` (3-digit white) | Various | `var(--color-cream)` |
| `#000000` (pure black) | Text occasionally | `var(--color-navy)` `#1B2B4B` |
| `#000` (3-digit black) | Text | `var(--color-navy)` |
| `#3B82F6` | Tailwind default blue | `var(--color-teal)` |
| `#EF4444` | Tailwind default red | `var(--color-error)` (custom) |
| `#10B981` | Tailwind default emerald | `var(--color-teal)` |
| `#F59E0B` | Tailwind default amber | `var(--color-warning)` (custom) |
| `#8B5CF6` | Tailwind default violet | (no replace — not Lingona) |
| `#EC4899` | Tailwind default pink | (no replace) |

### Banned Tailwind classes

| ❌ Class | Use instead |
|---------|-------------|
| `bg-white` | `bg-cream` |
| `text-black` | `text-navy` |
| `bg-blue-500` (any blue) | `bg-teal` |
| `text-blue-500` | `text-teal` |
| `bg-emerald-500` | `bg-teal` |
| `bg-violet-500` | (delete — not Lingona) |
| `bg-pink-500` | (delete) |
| `bg-amber-500` | `bg-warning` |
| `border-blue-500` | `border-teal` |
| `text-gray-900` | `text-navy` (most cases) |
| `bg-gray-900` | `bg-navy` |
| `bg-gradient-to-r from-blue to-purple` | (delete — solid only) |

### Detection grep — color drift

```bash
# Hunt drift hex codes
grep -rn "#8B71EA\|#7E4EC1\|#F07167\|#2DD4BF" frontend/

# Hunt Tailwind drift classes
grep -rn "bg-white\b\|text-white\b" frontend/components frontend/app
grep -rn "bg-blue-\|text-blue-\|border-blue-" frontend/components frontend/app
grep -rn "bg-emerald-\|text-emerald-\|border-emerald-" frontend/
grep -rn "bg-violet-\|bg-pink-\|bg-purple-\|bg-rose-" frontend/

# Hunt gradient anti
grep -rn "bg-gradient-to-" frontend/components frontend/app
grep -rn "from-.*via-.*to-" frontend/  # multi-stop gradient

# Hunt pure hex codes (any drift)
grep -rEn "#[0-9A-Fa-f]{6}" frontend/components/ frontend/app/ | grep -vE "(F8F7F4|1B2B4B|00A896|00C4B0|FFD700|F5EFDC|1A1A1A|C9B79C|FFEB3B)"
# Output = lines with hex NOT in canon → drift
```

Greps output = list of files needing palette correction.

## 2. Font drift kill list

### Banned fonts

| ❌ Drift font | Where | Replace with |
|--------------|-------|--------------|
| `Inter` (default if applied) | Various | `DM Sans` (`var(--font-body)`) |
| `Roboto` | Tailwind default | `DM Sans` |
| `system-ui` | CSS reset | `DM Sans` (var fallback OK) |
| `sans-serif` (alone) | Headlines | `DM Sans` (body) or `Playfair Italic` (display) |
| `Times New Roman` | Default browser | `Playfair Italic` (display) or `Georgia` (ielts-authentic only) |
| `Arial` (in brand mode) | Default browser | `DM Sans` |
| `Helvetica` | Default | `DM Sans` |
| `Courier New` (in brand mode) | Default | `JetBrains Mono` or `DM Mono` (if mono needed) |

### Banned Tailwind font classes

| ❌ Class | Use instead |
|---------|-------------|
| `font-sans` (default Tailwind) | `font-body` (Lingona DM Sans) |
| `font-serif` (default) | `font-display` (Playfair Italic) — except ielts-authentic where Georgia OK |
| `font-mono` (default) | `font-mono-lingona` (specific mono) |

### Detection grep — font drift

```bash
# Hunt explicit font-family
grep -rn "font-family.*Inter\|font-family.*Roboto" frontend/
grep -rn "font-family.*Times\|font-family.*Helvetica" frontend/

# Hunt class drift
grep -rn "font-sans\b" frontend/components frontend/app  # may need replace
grep -rn "font-serif\b" frontend/components frontend/app  # check context

# Verify font import
cat frontend/app/layout.tsx | grep -i "font\|Playfair\|DM_Sans"
# Should import via next/font Playfair_Display + DM_Sans
```

### Tailwind config (correct setup)

```ts
// tailwind.config.ts
import { Playfair_Display, DM_Sans } from 'next/font/google';

const dmSans = DM_Sans({ subsets: ['latin', 'vietnamese'], variable: '--font-dm-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], style: ['italic'], variable: '--font-playfair' });

theme: {
  extend: {
    fontFamily: {
      body: 'var(--font-dm-sans)',
      display: 'var(--font-playfair)',
      sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],  // override Tailwind default
      serif: ['Georgia', 'serif'],  // for ielts-authentic
    },
  },
},
```

Mode-aware via `var(--font-body)` / `var(--font-display)` per mode override.

## 3. Radius drift kill list

### Banned radius values

| ❌ Drift radius | Where | Replace with |
|----------------|-------|--------------|
| `rounded` (default 4px) | Various (Tailwind shorthand) | `rounded-md` (12px) for buttons |
| `rounded-sm` (2px) | Used everywhere | `rounded-md` (12px) brand mode / OK in ielts-authentic |
| `rounded-3xl` (24px+) | Sometimes too soft | `rounded-xl` or `rounded-2xl` per context |
| `rounded-[7px]` | Custom arbitrary | `rounded-md` snap to scale |
| `rounded-[13px]` | Custom arbitrary | `rounded-md` |
| `rounded-l-md rounded-r-none` | Asymmetric | (review case-by-case — sometimes OK) |
| `rounded-full` on buttons (oval) | Buttons | `rounded-md` (pills are different) |

### Lingona radius scale (canon per `01-foundations/radius-language.md`)

```
rounded-none  → 0      (sharp Cambridge ielts-authentic)
rounded-sm    → 2px    (sharp Cambridge OR partial border accent)
rounded-md    → 12px   (button default brand)
rounded-lg    → 16px   (card default brand)
rounded-xl    → 24px   (hero card / pricing)
rounded-2xl   → 32px   (overlay / level-up modal)
rounded-full  → 9999px (pill / avatar)
```

### Detection grep — radius drift

```bash
# Hunt arbitrary radius
grep -rEn "rounded-\[[0-9]+px\]" frontend/

# Hunt rounded-3xl (over-soft)
grep -rn "rounded-3xl" frontend/

# Hunt default rounded (4px Tailwind shorthand)
grep -rEn "\brounded\b(?!-)" frontend/

# Hunt asymmetric radius
grep -rn "rounded-l-\|rounded-r-\|rounded-t-\|rounded-b-" frontend/
```

## 4. Shadow drift kill list

| ❌ Drift shadow | Replace with |
|----------------|--------------|
| `shadow-2xl` everywhere | `shadow-sm` for cards, `shadow-md` for hero, `shadow-lg` modals only |
| `shadow-xl` on routine cards | `shadow-sm` |
| `drop-shadow-*` filters | (skip — not Lingona) |
| Heavy `shadow-[...]` arbitrary | snap to Tailwind scale |

### Lingona shadow scale

```
shadow-none  → no shadow
shadow-sm    → very subtle (default cards)
shadow-md    → noticeable (hover cards, hero cards)
shadow-lg    → prominent (modals)
shadow-xl    → too heavy (avoid)
shadow-2xl   → glassmorphism territory (banned)
```

### Detection grep — shadow drift

```bash
grep -rn "shadow-2xl\|shadow-xl" frontend/components frontend/app
grep -rn "drop-shadow-" frontend/
grep -rn "shadow-\[" frontend/  # arbitrary shadows
```

## 5. Animation drift kill list

| ❌ Drift animation | Replace with |
|-------------------|--------------|
| `animate-bounce` | (delete — bouncy spring anti per `06-motion/`) |
| `animate-pulse` (on non-skeleton) | (delete — only OK on skeleton loaders) |
| `animate-ping` | (delete — not Lingona) |
| `animate-spin` (non-spinner) | (delete — only OK on actual spinner) |
| `transition-all duration-700+` | `duration-fast` / `duration-medium` per scale |
| `ease-bounce` / `cubic-bezier` random | `ease-out` default |

### Detection grep — animation drift

```bash
grep -rn "animate-bounce\|animate-ping" frontend/
grep -rn "animate-pulse" frontend/  # check context — only skeleton OK
grep -rn "transition-all duration-[789][0-9][0-9]" frontend/  # too slow
grep -rn "cubic-bezier" frontend/  # arbitrary easing
```

## 6. Border drift kill list

| ❌ Drift border | Replace with |
|----------------|--------------|
| `border-2` everywhere | `border` (1px) default — `border-2` only highlighted state |
| `border-4` | (skip — too heavy) |
| `border-dashed` | (skip — not Lingona) |
| `border-dotted` | (skip) |
| `border-blue-500` | `border-teal` |
| `border-gray-100` (invisible) | `border-gray-200` minimum |

## 7. Spacing drift kill list

| ❌ Drift spacing | Replace with |
|-----------------|--------------|
| `p-5` / `p-7` (off-scale) | `p-4` / `p-6` / `p-8` (Tailwind 8pt scale) |
| `gap-5` / `gap-7` | `gap-4` / `gap-6` / `gap-8` |
| `space-y-5` / `space-y-7` | `space-y-4` / `space-y-6` / `space-y-8` |
| `m-3.5` (half steps) | `m-3` / `m-4` |
| Arbitrary `p-[18px]` | snap to scale |

### Detection grep — spacing drift

```bash
grep -rEn "\b(p|m|gap|space)-[357]\b" frontend/components frontend/app
grep -rEn "\b(p|m|gap)-\[[0-9]+px\]" frontend/  # arbitrary
```

## 8. Z-index drift kill list

| ❌ Drift z-index | Replace with |
|-----------------|--------------|
| `z-50` everywhere | Use scale per use case |
| `z-[9999]` | (avoid arbitrary) |
| `z-[100]` | (avoid arbitrary) |

### Lingona z-index scale

```ts
// frontend/lib/zIndex.ts OR tailwind.config
zIndex: {
  base: 0,
  dropdown: 10,
  sticky: 20,
  banner: 30,
  modal-backdrop: 40,
  modal: 50,
  toast: 60,
  tooltip: 70,
  max: 100,
}
```

Use semantic z-index. Anything > 100 = bug.

## 9. Imported library drift

| ❌ Drift library | Why anti |
|------------------|----------|
| `react-icons/fa` (Font Awesome) | `lucide-react` already locked |
| `react-icons/md` (Material) | Same |
| `@heroicons/react` | `lucide-react` chosen |
| `framer-motion@10` (when latest is current) | Use latest stable |
| `lottie-react` | Path C lock — code-only animation |
| `rive-react` | Same |
| `@formkit/auto-animate` | Use Framer Motion variants |
| `react-spring` | Use Framer Motion |

### Detection grep — library drift

```bash
grep "react-icons" frontend/package.json
grep "@heroicons" frontend/package.json
grep "lottie" frontend/package.json
grep "rive" frontend/package.json
grep "react-spring" frontend/package.json
grep "@formkit/auto-animate" frontend/package.json
```

If any present → uninstall.

## 10. CSS-in-JS / inline drift

Per `09-anti-patterns/inline-style-rule.md` (next file):

| ❌ Drift | Replace with |
|---------|--------------|
| `style={{ background: '#00A896' }}` | `className="bg-teal"` |
| `style={{ borderRadius: '12px' }}` | `className="rounded-md"` |
| Inline color hex | CSS variable `var(--color-teal)` |

## Wave 6 cleanup workflow

When refactoring a file, run drift greps first:

```bash
# 1. Color
grep -rEn "#[0-9A-Fa-f]{6}" path/to/component.tsx | grep -vE "F8F7F4|1B2B4B|00A896|..."

# 2. Tailwind drift
grep -En "bg-white\b|bg-blue-|text-blue-" path/to/component.tsx

# 3. Radius
grep -En "rounded-3xl|rounded-\[" path/to/component.tsx

# 4. Shadow
grep -n "shadow-xl\|shadow-2xl" path/to/component.tsx

# 5. Animation
grep -n "animate-bounce\|cubic-bezier" path/to/component.tsx

# 6. Spacing
grep -En "\b(p|m|gap)-(5|7)\b" path/to/component.tsx
```

Each hit = drift to fix per replace column.

## Detection script (run before commit)

`scripts/check-drift.sh`:

```bash
#!/bin/bash
set -e

echo "=== Color drift check ==="
DRIFT_HEX=$(grep -rEn "#[0-9A-Fa-f]{6}" frontend/components frontend/app 2>/dev/null \
  | grep -vE "F8F7F4|1B2B4B|00A896|00C4B0|FFD700|F5EFDC|1A1A1A|C9B79C|FFEB3B|EF4444|F59E0B" || true)

if [ -n "$DRIFT_HEX" ]; then
  echo "❌ DRIFT HEX FOUND:"
  echo "$DRIFT_HEX"
  exit 1
fi

echo "=== Banned class check ==="
DRIFT_CLASS=$(grep -rEn "(bg-white|bg-blue-|bg-emerald-|bg-violet-|bg-pink-|text-blue-)" \
  frontend/components frontend/app 2>/dev/null || true)

if [ -n "$DRIFT_CLASS" ]; then
  echo "❌ DRIFT CLASS FOUND:"
  echo "$DRIFT_CLASS"
  exit 1
fi

echo "=== Anti-library check ==="
if grep -q "lottie\|rive\|@heroicons" frontend/package.json; then
  echo "❌ Banned library installed"
  exit 1
fi

echo "✅ No drift detected"
```

Run pre-commit (Husky hook) OR manual before push.

## Audit checklist drift kill

```
1. NO drift hex (only canon colors)? ✓
2. NO bg-white, bg-blue-*, bg-emerald-*? ✓
3. NO Inter/Roboto font (DM Sans + Playfair only)? ✓
4. NO rounded-3xl or arbitrary rounded-[Xpx]? ✓
5. NO shadow-2xl on routine cards (shadow-sm default)? ✓
6. NO animate-bounce, animate-ping? ✓
7. NO arbitrary cubic-bezier easing? ✓
8. NO p-5, p-7 (use 8pt scale)? ✓
9. NO arbitrary z-[9999]? ✓
10. NO lottie/rive/heroicons (Path C + lucide-react locked)? ✓
11. Pre-commit drift script passing? ✓
12. Wave 6 audit drift instances all closed? ✓
```

## See also

- `01-foundations/palette.md` — color canon
- `01-foundations/typography.md` — font canon
- `01-foundations/radius-language.md` — radius canon
- `01-foundations/space-system.md` — 8pt spacing scale
- `09-anti-patterns/ai-generated-smell.md` — gradient + glassmorphism
- `09-anti-patterns/inline-style-rule.md` — when CSS var bridge OK
- `06-motion/duration-language.md` — duration scale (NOT random)
- `06-motion/motion-philosophy.md` — anti-bounce / anti-spring
