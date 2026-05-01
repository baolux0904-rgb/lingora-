# Mode switch rules — runtime hook + boundary enforcement

3 modes (brand / brand-soft / ielts-authentic) need runtime mechanism to swap CSS context, font family, color palette, animation rules, mascot visibility. This file defines mechanism + per-route mode mapping + transition lifecycle.

## Mode declaration mechanism

Single source of truth: `data-mode` attribute on a wrapper element near root of route layout.

```tsx
// app/layout.tsx OR per-route layout
<html data-mode={resolveModeFromPathname(pathname)}>
  <body>...</body>
</html>
```

OR scoped:

```tsx
// app/(app)/exam/[skill]/full-test/run/layout.tsx
<div data-mode="ielts-authentic" className="min-h-screen">
  {children}
</div>
```

Scoped wrapper preferred — avoids whole-page mode swap on navigation. Mode applies to wrapped subtree only.

## CSS variable override system

Mode tokens defined in `globals.css` via attribute selector:

```css
/* Default brand (root) */
:root,
[data-mode="brand"] {
  --color-bg-page: #F8F7F4;
  --color-text-primary: #1B2B4B;
  --color-text-secondary: #6B7280;
  --color-cta: #00A896;
  --color-cta-text: #F8F7F4;
  --color-border: #E5E7EB;
  --color-card: #F8F7F4;
  --color-highlight: #FFEB3B;
  
  --font-body: var(--font-dm-sans);
  --font-display: var(--font-playfair);
  --font-ui: var(--font-dm-sans);
  --font-mono: var(--font-dm-mono);
  
  --radius-button: 12px;     /* rounded-md */
  --radius-card: 16px;        /* rounded-lg */
  --radius-input: 12px;
  --radius-pill: 9999px;
  
  --transition-default: 150ms ease-out;
  --transition-card: 200ms ease-out;
  --transition-page: 300ms ease-out;
}

/* Brand-soft (Practice in-task) */
[data-mode="brand-soft"] {
  /* Same as brand for most tokens */
  /* Override only WHAT differs */
  --reduce-decoration: 1;
  --content-density: 0.75;  /* tighter */
  --transition-default: 100ms ease-out;  /* faster, less jiggle */
}

/* IELTS-authentic (Full Test, Battle Ranked) */
[data-mode="ielts-authentic"] {
  --color-bg-page: #F5EFDC;        /* Cambridge parchment */
  --color-text-primary: #1A1A1A;   /* near-black */
  --color-text-secondary: #4A4A4A;
  --color-cta: #1A1A1A;             /* black submit */
  --color-cta-text: #1A1A1A;
  --color-cta-bg: transparent;
  --color-border: #C9B79C;          /* parchment border */
  --color-card: #F5EFDC;
  --color-highlight: #FFEB3B;
  
  --font-body: Georgia, serif;
  --font-display: Georgia, serif;
  --font-ui: Arial, sans-serif;
  --font-mono: 'Courier New', monospace;
  
  --radius-button: 2px;
  --radius-card: 0;
  --radius-input: 0;
  --radius-pill: 0;
  
  --transition-default: 0s;          /* instant */
  --transition-card: 0s;
  --transition-page: 0s;
}
```

Components that USE mode tokens:

```tsx
<button
  className="rounded-[var(--radius-button)] bg-[var(--color-cta)] text-[var(--color-cta-text)]"
>
  Submit
</button>
```

OR use Tailwind class semantically and rely on CSS variable resolution:

```tsx
// Tailwind config theme extends with CSS var fallback
<button className="rounded-button bg-cta text-cta">Submit</button>
```

`tailwind.config.ts` extends:

```ts
theme: {
  extend: {
    colors: {
      cta: 'var(--color-cta)',
      'cta-text': 'var(--color-cta-text)',
      // etc.
    },
    borderRadius: {
      button: 'var(--radius-button)',
      card: 'var(--radius-card)',
    },
    fontFamily: {
      body: 'var(--font-body)',
      display: 'var(--font-display)',
      ui: 'var(--font-ui)',
    },
    transitionDuration: {
      default: 'var(--transition-default)',
    },
  },
},
```

Tailwind class semantic + CSS variable bridge = mode-aware components automatically.

## Route → mode mapping

Single source of truth: `frontend/lib/modeMap.ts`

```ts
export type DesignMode = 'brand' | 'brand-soft' | 'ielts-authentic';

export function resolveModeFromPathname(pathname: string): DesignMode {
  // ielts-authentic — Full Test in-task + Battle Ranked match
  if (
    pathname.match(/^\/exam\/[^/]+\/full-test\/.*\/run/) ||
    pathname.match(/^\/battle\/ranked\/match\/[^/]+$/)
  ) {
    return 'ielts-authentic';
  }
  
  // brand-soft — Practice in-task
  if (pathname.match(/^\/exam\/[^/]+\/practice\/.*\/run/)) {
    return 'brand-soft';
  }
  
  // brand — everything else (default)
  return 'brand';
}
```

Test cases:

```ts
expect(resolveModeFromPathname('/'))                                            // brand (landing)
expect(resolveModeFromPathname('/login'))                                       // brand (auth)
expect(resolveModeFromPathname('/home'))                                        // brand (dashboard)
expect(resolveModeFromPathname('/exam/reading'))                                // brand (entry)
expect(resolveModeFromPathname('/exam/reading/practice'))                       // brand (mode-select)
expect(resolveModeFromPathname('/exam/reading/practice/passage-1/run'))         // brand-soft
expect(resolveModeFromPathname('/exam/reading/practice/passage-1/result'))      // brand
expect(resolveModeFromPathname('/exam/reading/full-test'))                      // brand (test-select)
expect(resolveModeFromPathname('/exam/reading/full-test/test-1/run'))           // ielts-authentic
expect(resolveModeFromPathname('/exam/reading/full-test/test-1/result'))        // brand
expect(resolveModeFromPathname('/battle'))                                      // brand
expect(resolveModeFromPathname('/battle/casual/queue'))                         // brand
expect(resolveModeFromPathname('/battle/casual/match/abc'))                     // brand-soft (Casual = practice register)
expect(resolveModeFromPathname('/battle/ranked/queue'))                         // brand
expect(resolveModeFromPathname('/battle/ranked/match/abc'))                     // ielts-authentic
expect(resolveModeFromPathname('/battle/ranked/match/abc/result'))              // brand
expect(resolveModeFromPathname('/profile'))                                     // brand
expect(resolveModeFromPathname('/settings'))                                    // brand
```

Use Vitest unit test in `frontend/lib/__tests__/modeMap.test.ts` to lock these expectations.

## Layout integration

Apply mode at appropriate route layout:

```tsx
// frontend/app/(app)/exam/[skill]/full-test/[testId]/run/layout.tsx
export default function FullTestRunLayout({ children }: { children: ReactNode }) {
  return (
    <div data-mode="ielts-authentic" className="min-h-screen">
      {children}
    </div>
  );
}
```

```tsx
// frontend/app/(app)/exam/[skill]/practice/[passageId]/run/layout.tsx
export default function PracticeRunLayout({ children }: { children: ReactNode }) {
  return (
    <div data-mode="brand-soft" className="min-h-screen">
      {children}
    </div>
  );
}
```

```tsx
// frontend/app/layout.tsx (root — default brand)
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html data-mode="brand">
      <body>...</body>
    </html>
  );
}
```

Nested data-mode wins (CSS specificity). Inner mode override outer.

## React hook for mode awareness

```tsx
// frontend/lib/useMode.ts
import { usePathname } from 'next/navigation';

export function useMode(): DesignMode {
  const pathname = usePathname();
  return resolveModeFromPathname(pathname);
}

// Usage in component
function MyComponent() {
  const mode = useMode();
  
  return (
    <div>
      {mode === 'brand' && <Mascot size={120} />}
      {mode === 'ielts-authentic' && (/* no mascot, Cambridge layout */)}
    </div>
  );
}
```

Use `useMode()` for conditional rendering when mode-specific UI differs structurally (mascot present/absent, different layout, different copy language).

KHÔNG dùng `useMode()` for color/font swap — CSS variable override handles automatically.

## Transition between modes

When user navigates `/exam/reading/full-test/test-1/run` → `/exam/reading/full-test/test-1/result`:

```
Step 1: Submit button click → API /api/v1/full-test/submit
Step 2: Loading state (still in ielts-authentic mode)
Step 3: Response received → router.push('/exam/reading/full-test/test-1/result')
Step 4: New route layout renders → data-mode flips to 'brand'
Step 5: CSS variables reflow → cream warm + DM Sans + Playfair Italic
Step 6: Lintopus mounts (was absent in authentic mode)
Step 7: Result page anatomy renders (Pattern C asymmetric)
```

Visual feel: short loading state → page slides to brand mode → Lintopus appears.

KHÔNG manual mode swap with state setter. KHÔNG global mode context. Route-driven only.

## Edge cases

### User refreshes page mid-exam

```
URL: /exam/reading/full-test/test-1/run
Layout: data-mode="ielts-authentic" wrapper

Refresh → server-side render → resolveModeFromPathname returns 'ielts-authentic' → wrapper present → mode honored.
```

Server-side mode resolution = critical. Mode KHÔNG depends on client-side navigation state.

### Modal triggered from authentic mode

```
User in /exam/reading/full-test/test-1/run (ielts-authentic)
User clicks "Submit" → confirmation modal appears

Modal renders within authentic wrapper → modal inherits Cambridge styling.
```

Modal in authentic mode = Cambridge sharp:
- `rounded-none`
- Georgia text
- English UI ("Are you sure you want to submit?")
- Black submit button

Modal portal: ensure portal target is INSIDE authentic wrapper, NOT at root document body. If portaled to body, mode lost.

```tsx
// Correct — modal portals to wrapped subtree
<div data-mode="ielts-authentic">
  <ExamUI />
  {modalOpen && createPortal(<Modal />, modalContainerRef.current)}
</div>
```

### Tab/window close attempt mid-exam

Authentic mode triggers `beforeunload` warning:

```tsx
useEffect(() => {
  if (mode === 'ielts-authentic' && examInProgress) {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // browser shows native confirm
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }
}, [mode, examInProgress]);
```

Brand-soft (Practice) — KHÔNG warning (user can pause/leave freely).

## Mode-specific component behavior

Some components react to mode automatically:

```tsx
// frontend/components/ui/Mascot.tsx
export function Mascot({ size, mood, bubble }: MascotProps) {
  const mode = useMode();
  
  // ielts-authentic mode → never render
  if (mode === 'ielts-authentic') return null;
  
  // brand-soft mode → no bubble (focus mode)
  const showBubble = mode === 'brand' && bubble;
  
  return (
    <div>
      <svg>...</svg>
      {showBubble && <p>{bubble}</p>}
    </div>
  );
}
```

```tsx
// frontend/components/ui/Toast.tsx
export function Toast({ message }: { message: string }) {
  const mode = useMode();
  
  // ielts-authentic mode → never show toast (Cambridge UI = no popups)
  if (mode === 'ielts-authentic') return null;
  
  return <div className="toast">...</div>;
}
```

```tsx
// frontend/components/Layout/Sidebar.tsx
export function Sidebar() {
  const mode = useMode();
  
  // ielts-authentic mode → hide sidebar (focus mode, fullscreen exam)
  if (mode === 'ielts-authentic') return null;
  
  return <aside>...</aside>;
}
```

Component encapsulates mode behavior — page-level KHÔNG decide whether sidebar/toast/mascot renders.

## Anti-patterns

❌ Manual `useState<DesignMode>` mode setter (route-driven only)
❌ Global Context Provider for mode (CSS variable + URL is enough)
❌ Mode flag passed as prop through component tree (use hook)
❌ Mode bleed: brand component rendered inside authentic wrapper without mode check
❌ Hardcoded color in component (`text-navy`) instead of mode token (`text-[var(--color-text-primary)]`)
❌ Modal portal to document.body — loses mode wrapper context
❌ CSS specificity wars (use single `data-mode` attribute selector consistently)
❌ Mode swap mid-page-render (jarring CSS reflow)
❌ Mode declaration absent → falls back to root brand (which may be wrong for authentic page)
❌ Multiple data-mode wrappers nested (should be single per route)

## Audit checklist mode integration

```
1. resolveModeFromPathname unit tests cover all routes? ✓
2. data-mode wrapper at correct route layout level? ✓
3. CSS variable override resolves correctly per mode? ✓
4. Mode-aware components (Mascot, Toast, Sidebar) check mode? ✓
5. Modal portal target inside mode wrapper? ✓
6. beforeunload warning only in ielts-authentic? ✓
7. Server-side render honors mode (no flash of wrong mode)? ✓
8. Mode transition smooth (no jarring CSS reflow)? ✓
9. Tailwind config bridges CSS variables (mode-aware classes)? ✓
10. NO manual mode state, NO global context, NO prop drilling? ✓
```

## Implementation order Wave 6

When implementing mode system:

1. Define CSS variables in `globals.css` (3 mode blocks)
2. Bridge Tailwind classes via `tailwind.config.ts` extends
3. Build `resolveModeFromPathname` + unit tests
4. Build `useMode()` hook
5. Apply `data-mode` wrappers at route layouts
6. Refactor mode-aware components (Mascot, Toast, Sidebar) to check mode
7. Test transitions: brand → brand-soft → brand (Practice flow)
8. Test transitions: brand → ielts-authentic → brand (Full Test flow)
9. Verify modal portal mode preservation
10. Verify SSR mode resolution (no flash)

## See also

- `04-modes/brand.md` — default mode spec
- `04-modes/brand-soft.md` — Practice mode spec
- `04-modes/ielts-authentic.md` — exam mode spec
- `01-foundations/palette.md` — color tokens per mode
- `01-foundations/typography.md` — font swap per mode
- `01-foundations/radius-language.md` — radius per mode
- `10-routes/route-mode-map.md` — exhaustive route → mode table (pending batch 9)
- `03-components/mascot.md` — mode-aware mascot
- `03-components/modal-frozen.md` — modal pattern across modes
