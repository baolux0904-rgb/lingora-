# Mobile rhythm — single-column scroll cadence

Mobile = **secondary** for Lingona (per Wave 6 lock — desktop primary, mobile responsive secondary). But mobile UX must feel native, không port-from-desktop.

Mobile context: 30% Lingona traffic. Vietnamese student trên đường, café, quán nước, classroom break — short sessions 5-15 min.

## Reference viewport

| Device | Width | Use |
|--------|-------|-----|
| iPhone 14 Pro | 393×852 | Design reference |
| iPhone 12/13 | 390×844 | Same design (1px diff) |
| iPhone SE 3 | 375×667 | Smallest current iOS |
| Android typical | 360×800 | Smallest Android target |
| Foldable narrow | 320px | (rare — accept layout breaks) |

**Design at 390px**, ensure 360px fits. KHÔNG go below 360px.

## Single-column collapse

Desktop Pattern C asymmetric → mobile **vertical stack**:

```
Desktop 1440px:                Mobile 390px:
                               
[Hero text 45%][Lintopus 38%]  [Hero text]
                               [Lintopus]
                               
[Features 4-col]               [Feature 1]
                               [Feature 2]
                               [Feature 3]
                               [Feature 4]
                               
[CTA asymmetric]               [CTA]
```

Direction lock:
- Text BEFORE visual (Lintopus below text — text is content, visual is decoration on mobile)
- Single column always — KHÔNG 2-column on mobile (cramped, illegible)
- Order matters: hero text → primary CTA → supporting visual → secondary content → secondary CTA → footer

```jsx
// Responsive collapse
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
  <div className="lg:col-span-7">  {/* text first on mobile */}
    <h1>...</h1>
    <p>...</p>
    <button>...</button>
  </div>
  <div className="lg:col-span-5">  {/* visual second on mobile */}
    <Mascot size={240} />
  </div>
</div>
```

## Side gutter (mobile)

```
390px viewport:
├── 16px left gutter
├── 358px content
└── 16px right gutter
```

| Tailwind | px | Use |
|----------|----|----|
| `px-4` | 16px | Default mobile gutter |
| `px-6` | 24px | (rare — premium feel hero) |
| `px-2` | 8px | (rare — full-bleed image with minimal margin) |

```jsx
// Default mobile section
<section className="px-4 py-12">  {/* 16px x 48px */}
```

## Vertical rhythm (mobile)

Reduce desktop rhythm 30-40% on mobile:

| Element | Desktop | Mobile |
|---------|---------|--------|
| Section break | 96px (`mb-24`) | 64px (`mb-16`) |
| Sub-section | 48px (`mb-12`) | 32px (`mb-8`) |
| Paragraph | 24px (`mb-6`) | 24px (`mb-6`) — same |
| Inline gap | 16px (`mb-4`) | 16px — same |

```jsx
<section className="mb-16 lg:mb-24">  {/* tighter on mobile */}
  <h2 className="mb-8 lg:mb-12">{/* sub-section break */}</h2>
  ...
</section>
```

Card padding tighter:

| Element | Desktop | Mobile |
|---------|---------|--------|
| Card default | `p-6` (24px) | `p-4` (16px) |
| Card hero | `p-8` (32px) | `p-6` (24px) |
| Modal | `p-8` | `p-6` |

```jsx
<div className="p-4 lg:p-6 rounded-lg ...">
```

## Type scale mobile

Reduce headline sizes:

| Element | Desktop | Mobile |
|---------|---------|--------|
| Hero h1 | `text-6xl` | `text-4xl` |
| Page h1 | `text-5xl` | `text-3xl` |
| Section h2 | `text-3xl` | `text-2xl` |
| Sub-headline h3 | `text-xl` | `text-lg` |
| Body | `text-base` | `text-base` (same — readability lock) |
| Microcopy | `text-sm` | `text-sm` |

```jsx
<h1 className="text-4xl lg:text-6xl font-display italic">
  Cùng luyện IELTS với mình
</h1>
```

**KHÔNG reduce body text below 14px** — Vietnamese diacritics need legibility.

## Touch targets (iOS HIG + Material Design)

Minimum **44×44px** touch target for any interactive element.

| Element | Min size mobile |
|---------|-----------------|
| Primary button | 48px height (`py-3 px-6`) |
| Secondary button | 44px height (`py-2.5 px-5`) |
| Icon button | 44×44px (`w-11 h-11`) |
| Form input | 48px height (`py-3`) |
| Toggle / Switch | 44px tap area |
| BottomNav tab | 48px height (Lingona has 5-tab BottomNav) |
| Inline link | 32px+ vertical tap area (use padding `py-2`) |

```jsx
// Mobile-friendly button
<button className="px-6 py-3 min-h-[48px] rounded-md bg-teal text-cream">

// Mobile icon button
<button className="w-11 h-11 flex items-center justify-center rounded-full">
  <Icon />
</button>
```

KHÔNG ship UI element < 44×44px tap target. Audit failure khi a11y check.

## BottomNav (5-tab, codebase verified)

Lingona uses 5-tab BottomNav on mobile (Home, Practice, Battle, Social, Profile per codebase pattern).

```
┌─────────────────────────────────────┐
│                                     │
│  [content scroll]                   │
│                                     │
├─────────────────────────────────────┤
│ [🏠]  [📝]  [⚔️]  [💬]  [👤]        │  ← 5 tabs, 48px height
└─────────────────────────────────────┘
   16% 16% 16% 16% 16% (each tab 20% width)
   Equal distribution, no center FAB
```

```jsx
<nav className="fixed bottom-0 left-0 right-0 h-12 bg-cream border-t border-gray-200">
  <ul className="grid grid-cols-5 h-full">
    {tabs.map(tab => (
      <li key={tab.id} className="flex items-center justify-center">
        <button className="flex flex-col items-center gap-1 py-2 min-h-[44px]">
          <Icon />
          <span className="text-xs">{tab.label}</span>
        </button>
      </li>
    ))}
  </ul>
</nav>
```

KHÔNG dùng center FAB (Floating Action Button) — Lingona pattern là 5 equal tab. KHÔNG mix BottomNav + side drawer (chọn 1).

Content padding-bottom: `pb-16` (64px) để KHÔNG bị nav cover content.

## Mobile-specific patterns

### Sticky header (rare — chỉ practice in-task)

```jsx
<header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-gray-200">
  <div className="px-4 py-3 flex items-center justify-between min-h-[48px]">
    {/* timer + back button */}
  </div>
</header>
```

### Pull-to-refresh

KHÔNG implement custom PTR — use browser default (`overscroll-behavior: contain` to prevent over-scroll bounce nếu cần). Native iOS/Android PTR cảm nhận khác nhau, tránh.

### Swipe gestures

Limit:
- ✅ Friend chat: swipe-back to friend list (iOS native)
- ✅ Carousel onboarding: horizontal swipe (Framer Motion drag)
- ❌ Swipe-delete (Mail style) — Lingona không có pattern này
- ❌ Bottom sheet drag (iOS style) — over-engineer cho launch v1

### Modal mobile pattern

Full-screen modal preferred over center modal on mobile (touch-friendly, no peek):

```jsx
<div className="fixed inset-0 z-50 bg-cream lg:bg-black/50 lg:p-4">
  <div className="h-full lg:h-auto lg:max-w-md lg:mx-auto lg:my-12 lg:rounded-lg bg-cream lg:bg-cream p-4 lg:p-6">
    {/* mobile = full-screen, desktop = centered card */}
  </div>
</div>
```

## Anti-patterns mobile

- ❌ 2-column layout below 768px (cramped)
- ❌ Hover-only interactions (no touch fallback)
- ❌ `position: fixed` everything (covers content, breaks scroll)
- ❌ Tap targets < 44×44px
- ❌ Body text < 14px
- ❌ Headings same desktop size (overflow viewport)
- ❌ Side gutter > 32px (waste mobile width)
- ❌ Multiple modals stacked (mobile only handle 1)
- ❌ Right-edge swipe = navigation conflict iOS
- ❌ Custom keyboard handling (use native input types: `type="email"` `type="tel"`)

## Audit checklist mobile

```
Open Chrome DevTools, set device iPhone 14 Pro 393×852:

1. Side gutter exactly 16px? ✓
2. Body text ≥ 14px? ✓
3. Hero h1 fits 1-2 lines no overflow? ✓
4. All buttons ≥ 44×44px tap target? ✓
5. BottomNav 48px height, 5 tabs equal? ✓
6. Content has pb-16 to clear BottomNav? ✓
7. No horizontal scroll (overflow-x: hidden enforced)? ✓
8. Sticky header (if any) ≤ 48px height? ✓
9. Modal = full-screen on mobile? ✓ (if any)
10. Asymmetric Pattern C collapsed to single column? ✓

Resize 360px → still works? ✓
Resize 768px → tablet breakpoint kicks in? ✓
```

## See also

- `02-layout/desktop-canvas.md` — desktop primary
- `02-layout/empty-space-philosophy.md` — whitespace philosophy
- `02-layout/hierarchy-stair.md` — 3-level hierarchy
- `01-foundations/space-system.md` — spacing scale
- `01-foundations/typography.md` — type scale mobile reduction
