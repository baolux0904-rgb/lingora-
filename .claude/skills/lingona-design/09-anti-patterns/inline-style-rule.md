# Inline style rule — when CSS var bridge OK, when raw inline BAN

`style={{ ... }}` props in React = inline CSS. Most cases banned (drift escape hatch). Some cases OK (CSS variable bridge for dynamic values).

## Default rule: NO inline style

```tsx
// ❌ BANNED — raw hex inline
<div style={{ background: '#00A896', color: '#F8F7F4' }}>
  ...
</div>

// ✅ OK — Tailwind class
<div className="bg-teal text-cream">
  ...
</div>
```

Why:
1. Bypasses palette canon (drift)
2. Hard to maintain (search-replace nightmare)
3. KHÔNG mode-aware (CSS variables won't override)
4. Specificity issues
5. Forces re-render on prop change

Use Tailwind class system. CSS variable resolution + mode override = automatic.

## Exception 1: Dynamic value from data

When color/value depends on runtime data (NOT static design choice):

```tsx
// ✅ OK — dynamic color from score
<div
  className="rounded-none border border-gray-200 p-6"
  style={{ borderLeft: `4px solid ${getColorByScore(skill.score)}` }}
>
```

`getColorByScore` returns CSS variable string:

```ts
// frontend/lib/resultColor.ts
export function getColorByScore(score: number): string {
  if (score >= 7.0) return 'var(--color-teal)';
  if (score >= 5.5) return 'var(--color-teal-light)';
  if (score >= 4.0) return 'var(--color-warning)';
  return 'var(--color-error)';
}
```

Inline style references `var(--color-teal)` → mode-aware. KHÔNG hardcode `#00A896`.

```tsx
// ✅ OK — CSS variable bridge (mode-aware)
<div style={{ borderLeft: `4px solid ${getColorByScore(score)}` }} />

// ❌ BANNED — raw hex (drift escape, not mode-aware)
<div style={{ borderLeft: `4px solid ${score >= 7 ? '#00A896' : '#F59E0B'}` }} />
```

Rule: dynamic style MUST resolve to CSS variable, NOT raw hex.

## Exception 2: Dynamic dimension from prop

Component sized by prop (e.g., `<Mascot size={120} />`):

```tsx
// ✅ OK — dynamic px from prop
<svg style={{ width: size, height: size }} viewBox="0 0 200 200">
```

Tailwind doesn't support arbitrary px from runtime variable cleanly. Inline style here is acceptable.

KHÔNG do this for static sizes:

```tsx
// ❌ Anti — static size should use Tailwind class
<svg style={{ width: 120, height: 120 }} />

// ✅ OK — Tailwind for static
<svg className="w-[120px] h-[120px]" />
// OR Tailwind sizing scale
<svg className="w-32 h-32" />
```

## Exception 3: Dynamic transform (animation interpolation)

Framer Motion or animation library outputs interpolated values:

```tsx
// ✅ OK — Framer Motion controls inline style
<motion.div animate={{ x: 100, opacity: 0.5 }}>
  ...
</motion.div>
```

Framer abstracts inline style. Direct `style={{...}}` from animation lib is fine.

```tsx
// ✅ OK — interpolation result
const [progress, setProgress] = useState(0);

<div
  className="h-2 bg-gray-200 rounded-full overflow-hidden"
>
  <div
    className="h-full bg-teal transition-all duration-500"
    style={{ width: `${progress * 100}%` }}  // dynamic from state
  />
</div>
```

Width from runtime state = inline style OK.

## Exception 4: Style from CSS variable computed value

Reading CSS variable in JS for conditional logic:

```tsx
const color = getComputedStyle(document.documentElement)
  .getPropertyValue('--color-teal');
```

Rare. Usually solved via mode-aware Tailwind class. Use if absolutely needed.

## Banned inline style patterns

### Pattern 1: Raw hex inline

```tsx
// ❌ BANNED
<div style={{ background: '#00A896' }}>
<div style={{ color: '#1B2B4B' }}>
<div style={{ borderColor: '#FF0000' }}>
```

→ Drift kill list per `09-anti-patterns/drift-kill-list.md`.

### Pattern 2: Inline padding/margin numeric

```tsx
// ❌ BANNED — should use Tailwind scale
<div style={{ padding: '24px' }}>
<div style={{ margin: '16px' }}>
<div style={{ paddingLeft: '24px', paddingRight: '24px' }}>
```

✅ Replace:
```tsx
<div className="p-6">           // 24px
<div className="m-4">            // 16px  
<div className="px-6">           // 24px L+R
```

### Pattern 3: Inline font properties

```tsx
// ❌ BANNED
<p style={{ fontFamily: 'DM Sans', fontSize: '16px', fontWeight: 600 }}>
```

✅ Replace:
```tsx
<p className="font-body text-base font-semibold">
```

### Pattern 4: Inline display / flexbox

```tsx
// ❌ BANNED
<div style={{ display: 'flex', justifyContent: 'space-between' }}>
```

✅ Replace:
```tsx
<div className="flex items-center justify-between">
```

### Pattern 5: Inline transition

```tsx
// ❌ BANNED
<div style={{ transition: 'all 0.3s ease' }}>
```

✅ Replace:
```tsx
<div className="transition-all duration-medium ease-out">
```

### Pattern 6: Inline border-radius

```tsx
// ❌ BANNED
<div style={{ borderRadius: '12px' }}>
```

✅ Replace:
```tsx
<div className="rounded-md">
```

### Pattern 7: Inline gradient

```tsx
// ❌ DOUBLE BANNED — gradient + inline
<div style={{ background: 'linear-gradient(to right, #00A896, #F8F7F4)' }}>
```

→ No gradients in Lingona (per palette canon). Solid colors only.

## Allowed inline style patterns (recap)

```tsx
// ✅ Dynamic CSS variable from helper
<div style={{ borderLeft: `4px solid ${getColorByScore(score)}` }} />

// ✅ Dynamic dimension from prop
<svg style={{ width: size, height: size }} />

// ✅ Animation interpolation (Framer Motion abstracts)
<motion.div animate={{ x: 100 }} />

// ✅ Progress bar width from state
<div style={{ width: `${progress}%` }} />

// ✅ Custom CSS variable inline (rare — for component instance customization)
<div style={{ '--card-tint': customTint }} className="bg-[var(--card-tint)]">
```

## Tailwind arbitrary class alternative

For dynamic-feel values that don't fit standard scale:

```tsx
// Acceptable — Tailwind arbitrary class (not inline style)
<div className={`w-[${dynamicWidth}px]`}>
```

NOTE: Tailwind arbitrary classes with template literals don't always work (PurgeCSS doesn't see them). Safer:

```tsx
// ✅ Safer — inline style with var() reference
<div style={{ width: `${width}px` }}>

// ✅ OR safelist arbitrary in tailwind.config
// safelist: ['w-[120px]', 'w-[240px]', 'w-[320px]']
```

For Lingona: prefer **inline style ONLY for dynamic from data**. Tailwind class for static design choices.

## Component author guidance

When building a component:

1. **Static visual choices** (button color, card padding, headline font) → **Tailwind class only**

2. **Dynamic from prop** (size, color from score) → **inline style OK**, but:
   - Color values resolve to `var(--color-*)` (NOT raw hex)
   - Dimension values from prop variable (NOT magic numbers)

3. **State-driven animation** → use Framer Motion (it handles inline style)

4. **Mode swap behavior** → CSS variable resolution at root via `data-mode` attribute (never set color in component)

## Detection grep

```bash
# Hunt inline style with raw hex
grep -rEn "style=\{[^}]*#[0-9A-Fa-f]{6}" frontend/

# Hunt inline style with px values (suspicious)
grep -rEn "style=\{[^}]*[0-9]+px" frontend/

# Hunt inline padding/margin
grep -rEn "style=\{[^}]*padding|style=\{[^}]*margin" frontend/

# Hunt inline display/flex
grep -rEn "style=\{[^}]*display:|justifyContent" frontend/
```

Each hit = review:
- If dynamic from data via CSS var → OK
- If static design choice → refactor to Tailwind class

## Safelist for inline style

When Wave 6 codebase grep finds inline styles, audit per category:

| Category | Action |
|----------|--------|
| Dynamic from data + CSS var | ✅ Keep |
| Dynamic from prop (size, dimension) | ✅ Keep |
| Animation interpolation | ✅ Keep |
| Progress bar width state | ✅ Keep |
| Static color/padding/margin | ❌ Refactor to Tailwind |
| Static border-radius | ❌ Refactor |
| Inline gradient | ❌ Delete entirely |
| Inline font-family | ❌ Refactor to font-body / font-display |

## Mode boundary preservation

Inline style with raw hex breaks mode boundary:

```tsx
// ❌ Brand mode + ielts-authentic mode both render this
<div style={{ background: '#00A896' }}>
  Submit
</div>
```

`#00A896` doesn't change between modes. Result: teal CTA visible inside ielts-authentic mode (where teal is banned per `04-modes/ielts-authentic.md`).

✅ Mode-aware:
```tsx
<div className="bg-cta">  // var(--color-cta)
  Submit
</div>
```

`bg-cta` resolves to `var(--color-cta)` → in brand mode = teal `#00A896` → in ielts-authentic mode = black `#1A1A1A`.

Inline raw hex = mode bleed bug. Tailwind + CSS variable = mode-aware.

## Tailwind config bridge for mode-aware classes

Setup in `tailwind.config.ts`:

```ts
theme: {
  extend: {
    colors: {
      // Static brand canon
      cream: '#F8F7F4',
      navy: '#1B2B4B',
      teal: '#00A896',
      'teal-light': '#00C4B0',
      gold: '#FFD700',
      
      // Mode-aware tokens (resolve via CSS variable)
      cta: 'var(--color-cta)',
      'cta-text': 'var(--color-cta-text)',
      'bg-page': 'var(--color-bg-page)',
      'text-primary': 'var(--color-text-primary)',
      border: 'var(--color-border)',
      // ... per CSS var
    },
  },
},
```

Component imports:
```tsx
<button className="bg-cta text-cta-text rounded-button">
```

Mode swap → CSS variable changes → button visual changes automatically. NO inline style needed.

## Audit checklist inline style

```
1. Inline style ONLY for dynamic from data (color from score, dimension from prop)? ✓
2. Dynamic color values resolve to var(--color-*) NOT raw hex? ✓
3. Static design choices use Tailwind class? ✓
4. NO raw hex inline (`#XXXXXX`)? ✓
5. NO inline padding/margin numeric? ✓
6. NO inline font-family? ✓
7. NO inline gradient? ✓
8. NO inline transition? ✓
9. Mode-aware tokens via CSS variable bridge in Tailwind config? ✓
10. Pre-commit grep for raw hex inline → 0 hits? ✓
```

## See also

- `01-foundations/palette.md` — color canon + CSS variable system
- `04-modes/mode-switch-rules.md` — CSS var override per mode
- `09-anti-patterns/drift-kill-list.md` — what counts as drift
- `09-anti-patterns/ai-generated-smell.md` — anti-gradient
- `03-components/result-card.md` — example of dynamic borderLeft via CSS var
- `03-components/mascot.md` — example of dynamic size from prop
