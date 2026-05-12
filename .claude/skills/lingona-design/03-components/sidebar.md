# Sidebar — collapsible desktop rail + mobile overlay

Keywords for skill search: sidebar, collapse, mobile menu, hamburger, drawer, overlay, tooltip, keyboard shortcut, SSR hydration, localStorage, viewport-aware dropdown.

Canon for the `(app)` group sidebar: two render modes (desktop-rail + mobile-overlay), context-driven state, SSR-safe localStorage hydration, keyboard shortcut, custom CSS-only tooltip, viewport-aware NotificationBell dropdown.

## State architecture

```
SidebarProvider (frontend/contexts/SidebarContext.tsx)
   │
   ├── collapsed (bool) — desktop icon-only, persisted to localStorage
   │     key "lingona.sidebar.collapsed"
   ├── mobileOpen (bool) — mobile overlay visibility, transient
   ├── toggleCollapsed()
   └── setMobileOpen(bool)
        │
        ├── AppShell (consumes collapsed → main marginLeft)
        ├── AppSidebar mode="desktop-rail"   (consumes collapsed)
        ├── AppSidebar mode="mobile-overlay" (forces expanded view)
        └── Topbar  (consumes setMobileOpen → hamburger button)
```

Provider mount: inside `(app)/layout.tsx`, nested between `PresenceProvider` and the `Suspense` boundary. NOT in root layout — sidebar state is scoped to authenticated app shell.

## SSR-safe two-step hydration

```tsx
// Two-step pattern — start false on first render (matches server), then
// rehydrate from localStorage in useEffect. Brief flash for users who
// saved "collapsed = true" is acceptable; the alternative (reading
// localStorage in useState initializer) creates hydration mismatch.
const [collapsed, setCollapsed] = useState(false);

useEffect(() => {
  try {
    const stored = window.localStorage.getItem("lingona.sidebar.collapsed");
    if (stored === "true") setCollapsed(true);
  } catch { /* private mode / quota — keep default */ }
}, []);

useEffect(() => {
  try {
    window.localStorage.setItem("lingona.sidebar.collapsed", String(collapsed));
  } catch { /* ignore */ }
}, [collapsed]);
```

**Critical: every `localStorage` access wrapped in try/catch.** Safari private mode + Chrome incognito + over-quota all throw, and the throw kills React's render if uncaught.

## Keyboard shortcut with input-focus guard

```ts
function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable) return true;
  return false;
}

useEffect(() => {
  function onKeydown(e: KeyboardEvent) {
    if (!(e.metaKey || e.ctrlKey)) return;
    if (e.key.toLowerCase() !== "b" || e.shiftKey || e.altKey) return;
    if (isTypingTarget(e.target)) return;
    e.preventDefault();
    toggleCollapsed();
  }
  window.addEventListener("keydown", onKeydown);
  return () => window.removeEventListener("keydown", onKeydown);
}, [toggleCollapsed]);
```

**Why the guard matters**: future rich-text editors (Writing essay composer, blog editor) will use `cmd+B` for bold. Without the guard, the sidebar steals every Bold press. Rule applies to any future global shortcut.

## Two render modes (single component)

```tsx
type SidebarMode = "desktop-rail" | "mobile-overlay";

<AppSidebar mode="desktop-rail" ... />   // fixed left, collapsible
<AppSidebar mode="mobile-overlay" ... /> // overlay, always expanded, has X button
```

**95% of nav DOM identical between modes.** Differences:
- Desktop-rail: `hidden lg:flex fixed`, width via CSS var (`--sidebar-width` / `--sidebar-width-collapsed`), toggle button on edge
- Mobile-overlay: `fixed w-72 z-50 shadow-xl`, close X button in header, no collapse logic
- Mobile-overlay clicks dismiss the overlay (`setMobileOpen(false)` after navigation)
- Collapsed visuals (icon-only, hidden footer, no group expansion) apply ONLY to desktop-rail when `collapsed === true`

**TypeScript narrowing trap**: when computing `isCollapsed = mode === "desktop-rail" && collapsed`, TS narrows the rest of the function's `mode` references to `"desktop-rail"`. Subsequent `mode === "mobile-overlay"` checks fail compile. **Workaround**: derive `const isMobileOverlay: boolean = mode === "mobile-overlay"` with explicit `: boolean` annotation, use the derived boolean everywhere. TS won't narrow through annotated booleans.

## Collapsed mode rules

When `isCollapsed === true`:

1. **Footer hidden** — streak/rank/XP bar block entirely removed. Identity stats reappear when expanded. Rationale: in 72px width, these are unreadable; user wants nav-only.
2. **Nested group expansion disabled** — top-level items with `children` ignore the inline disclosure chevron. Clicking the icon navigates straight to the parent route (`/exam`, `/learn`). Children unreachable without expanding sidebar first. Rationale: no horizontal space to render child labels; stacking child icons vertically clutters.
3. **Quick links hidden** — "Tiến độ Writing" link removed (no icon-only fallback worth rendering).
4. **Utility row stays visible** — Bell, ThemeToggle, Settings, Avatar render as icon column. Bell dropdown opens upward when in lower half of viewport (see Bell positioning below).
5. **Tooltips required** — each nav item shows its label in a tooltip on hover/focus.

## Custom CSS-only tooltip pattern

```tsx
<div className="group/nav-item relative">
  <button className="...">
    <Icon size={20} />
    {!isCollapsed && <span>{label}</span>}
  </button>

  {isCollapsed && (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2
        px-2.5 py-1.5 rounded text-xs font-medium whitespace-nowrap
        opacity-0 group-hover/nav-item:opacity-100 group-focus-within/nav-item:opacity-100
        transition-opacity duration-fast shadow-md"
      style={{
        background: "var(--color-text)",
        color: "var(--color-bg-card)",
        zIndex: 60,
      }}
    >
      {label}
    </span>
  )}
</div>
```

| Rule | Why |
|---|---|
| `group/nav-item` named group | Multiple nav items on the page — unnamed groups fight each other |
| `group-hover/...` AND `group-focus-within/...` | Keyboard users see tooltip when item is focused via Tab |
| `pointer-events-none` | Tooltip can't capture clicks |
| `z-index: 60` (inline `style`) | Higher than dropdown (50), lower than mobile overlay/backdrop |
| `whitespace-nowrap` | Tooltip never wraps |
| Native `title` rejected | Browser-controlled delay (slow), can't style, inconsistent across OS |
| Floating UI / Popper rejected | New dep, kb-level gzip cost, not justified for static tooltips |

**z-index hierarchy** (top to bottom):
- Mobile overlay backdrop: 40
- Sidebar (desktop-rail): 40
- Sidebar (mobile-overlay): 50
- NotificationBell dropdown: 50
- Tooltip: 60 (must escape overflow-clip parents)
- Toggle button: 50 (sits on edge of sidebar at z-50 — same layer as parent is fine since absolute-positioned child stacks above parent content)

## Toggle button (Notion-style edge button)

```tsx
<button
  onClick={toggleCollapsed}
  aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
  className="absolute -right-3 top-20 w-6 h-6 rounded-full ..."
>
  {collapsed ? <ChevronRight ... /> : <ChevronLeft ... />}
</button>
```

- Positioned `-right-3` (overlapping sidebar's right edge into the content area by 12px)
- Visible always, hover shows hint background
- `aria-label` flips per state — screen readers announce the action that will happen, not the current state
- Hidden in `mobile-overlay` mode (no collapse there)

## Mobile overlay anatomy

```tsx
{!hideNav && !isDesktop && mobileOpen && (
  <>
    <div
      className="fixed inset-0 z-40 bg-black/40"
      onClick={() => setMobileOpen(false)}
      aria-hidden="true"
    />
    <AppSidebar mode="mobile-overlay" ... />
  </>
)}
```

- Backdrop at `z-40` captures clicks → dismiss
- Sidebar at `z-50` sits above backdrop, fixed left, `w-72` (288px)
- Close X button in sidebar header (Lucide `X`, `aria-label="Đóng menu"`)
- Escape key listener (in `SidebarContext` provider) closes overlay
- Hamburger button in Topbar (`Menu` Lucide icon, `aria-label="Mở menu"`) opens overlay

## Content margin reflow

```tsx
<main
  style={{
    marginLeft: !hideNav && isDesktop
      ? (collapsed ? "var(--sidebar-width-collapsed)" : "var(--sidebar-width)")
      : 0,
    transition: "margin-left 200ms ease-out",
  }}
  className="motion-reduce:transition-none"
>
```

CSS variables:
- `--sidebar-width: 240px` (expanded)
- `--sidebar-width-collapsed: 72px` (icon-only)

200ms ease-out matches `duration-fast` (150ms is slightly snappier but margin-shift feels better with a hair more time). `motion-reduce:transition-none` for accessibility.

## NotificationBell viewport-aware dropdown

Bell appears in two places: AppSidebar bottom-left utility row AND Topbar (mobile/tablet). The same dropdown class `absolute right-0 top-12` clipped off-screen when bell was in lower-half viewport (Session 1 backlog item).

```tsx
function handleToggle() {
  if (!isOpen && bellRef.current) {
    const rect = bellRef.current.getBoundingClientRect();
    setOpenUpward(rect.top > window.innerHeight / 2);
  }
  setIsOpen(!isOpen);
}

// Dropdown class
className={`absolute right-0 w-80 ... ${openUpward ? "bottom-12" : "top-12"}`}
```

- Computed ONCE per open via `getBoundingClientRect()` — no IntersectionObserver, no continuous tracking
- Topbar bell is always in upper half → `openUpward` stays false → existing downward behavior
- AppSidebar bell is in bottom-left → `openUpward` becomes true → dropdown opens upward
- Edge case (viewport too small for either direction): dropdown opens downward + internal scroll inside the `max-h-96` constraint

**Reusable for future popovers**: extract `useViewportPosition(elementRef)` hook if a 3rd consumer appears.

## Voice / a11y (Vietnamese aria-labels)

| Element | aria-label |
|---|---|
| Toggle button (collapsed state) | "Mở rộng sidebar" |
| Toggle button (expanded state) | "Thu gọn sidebar" |
| Mobile hamburger | "Mở menu" |
| Mobile overlay close X | "Đóng menu" |
| NotificationBell | "Thông báo" |
| Settings gear | "Cài đặt" |
| Avatar button | "Hồ sơ" |

All buttons use canonical Lingona focus-visible ring (`focus-visible:ring-2 focus-visible:ring-teal/40` + offset).

## Token system note

Sidebar uses dedicated CSS vars (`--sidebar-bg`, `--sidebar-border`, `--sidebar-item-hover`, `--sidebar-item-active-bg`, `--sidebar-active-indicator`, `--sidebar-xp-track`, `--sidebar-xp-fill`) — separate from the app-mode CSS vars used by Profile/Friends/Scenarios cards. The sidebar is a chrome surface (always present) and has its own theming variables to allow dark mode + accent customization without touching content surfaces.

Width tokens (`--sidebar-width`, `--sidebar-width-collapsed`) are global because `AppShell` reads them for content reflow.

## Hydration safety verification

Verified via:
1. `npm run build` exit 0 — no SSR/SSG errors
2. Dev mode page load with localStorage `lingona.sidebar.collapsed = "false"` — no console warnings
3. Dev mode page load with localStorage value `"true"` — brief flash of expanded (acceptable per documented trade-off), then collapses on hydration
4. Toggle works, persists across reload

## Origin

Session 6 (final session in planned series) — first commit shipping:
- `SidebarContext` + `SidebarProvider` + `useSidebar` hook
- Desktop sidebar collapse with localStorage persistence
- Mobile overlay drawer with hamburger button in Topbar
- Custom CSS-only tooltips on collapsed nav items
- cmd/ctrl+B keyboard shortcut with input-focus guard
- NotificationBell viewport-aware dropdown positioning
- Two-step SSR-safe hydration pattern
- `--sidebar-width-collapsed: 72px` CSS var

Commit hash placeholder. v1 — may revise after first round of user-traffic data on collapse adoption.

## See also

- `03-components/scenario-card.md` — app-mode CSS-var token rule (sibling chrome layer)
- `03-components/friend-list.md` — palette exception precedent (`#5DCAA5` online indicator)
- `03-components/profile-stats.md` — Lucide icon canon (ChevronLeft/Right/Menu/X from same library)
- `03-components/achievement-badge.md` — overlay/badge layering reference
- `09-anti-patterns/tailwind-grid-rows-fr-gotcha.md` — pattern reference for CSS variable transitions
