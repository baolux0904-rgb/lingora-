# Dark mode hardcode audit

## Summary

| Metric | Count |
|---|---|
| Unique hex colors in `frontend/components` + `frontend/app` + `frontend/contexts` | 107 |
| `rgba()` occurrences | 851 |
| Files containing `rgba(...)` | 101 |
| Files with `linear-gradient` / `radial-gradient` | 52 |
| Tailwind `bg-[#...]` arbitrary-value usage | 37+ |

Scope of PR4a: **10 targeted fixes** + canonical CSS vars for PR5 consumption. The remaining ~100+ files are documented as technical debt (post-launch) — sweeping them in one PR would explode the regression matrix.

Dark mode toggling (via `next-themes` swapping `.dark` on `<html>` + CSS var swap in `globals.css`) is **wiring-correct**. The issues are at the application level: components bypass the var system with inline `style={{ backgroundColor: "rgba(255,255,255,0.03)" }}` patterns that assume a dark page background.

---

## Fixed in PR4a (10 targets)

### Pre-existing bypass (research doc findings)

| # | Path | Before | After |
|---|---|---|---|
| 1 | `frontend/components/AppSidebar.tsx` avatar gradient | `linear-gradient(135deg, #1B2B4B, #2D4A7A)` hardcoded | `var(--color-avatar-from/to)` |
| 2 | `frontend/components/ThemeToggle.tsx:22` | `backgroundColor: "var(--color-primary-soft)"` — semantic mismatch (near-black in light vs teal in dark) | `var(--color-icon-muted)` |
| 3 | `globals.css` `.dark { --sidebar-bg: rgba(255,255,255,0.03) }` | near-transparent — fails when ancestor `.bg-deep-gradient` is absent (WritingTab/ReadingTab overlays) | solid `#0A1426` |

### Visual audit findings

| # | Path | Issue | Fix |
|---|---|---|---|
| B1 | `frontend/components/ProfileScreen.tsx:100` avatar wrapper | `border: "3px solid #00A896"` too hard in dark | `var(--color-avatar-ring)` — dim alpha in dark |
| B2 | `frontend/components/ProfileScreen.tsx:300,307` Band Journey numbers | hardcoded `#8B71EA` / `#2DD4BF` for estimated/target band | **DEFERRED**: investigating — tokens don't exist yet, values read as contrastful in dark; flagging for post-launch |
| B3 | `frontend/components/Social/FriendsTab.tsx:161-162` SubTab pills | Active uses `var(--color-accent)` solid teal + white. In dark mode teal `#00C4B0` on dark navy = too bright | Add `--color-tab-active-bg` / `--color-tab-active-text`: light solid, dark subtle tint |
| B4 | `globals.css` `.dark { --dash-card-border / --dash-hero-border / --dash-stat-border: rgba(255,255,255,0.06) }` → Home cards in `HomeDashboard.tsx` | Border alpha 0.06 invisible on dark navy page | Bump to `rgba(255,255,255,0.14)` — still subtle, enough to define card |
| B5 | `frontend/components/Battle/BattleTab.tsx:137,155,275` rank card + Find Match glow | Ring + box-shadow — read as acceptable post-review; `137` alpha `25` ≈15%, `155` alpha `20` ≈12%; `275` CTA button is bold-by-design | **AUDITED, NO CODE CHANGE**: current intensities are reasonable; document + revisit if Louis still finds them too loud after PR4a lands |
| B7 | `frontend/components/AppSidebar.tsx` group render | Both groups (IELTS Exam + Learn) rendered via the generic loop added in PR3; both use `backgroundColor: "transparent"` per identical code path | **ALREADY CONSISTENT** (PR3 generalised the group render); no change needed |

---

## Deferred — technical debt (post-launch)

### Category B — bypass to clean up later

**Dark-bg hex variants (16 shades discovered across codebase):**
```
#0B0F1E  #0A0F1E  #070A14  #020617  #0A1325  #0F172A
#0F1429  #141830  #0a0e1a  #0a1628  #0c0f1a  #0F2544
#1E293B  #111c32  #0F1E33  #162740
```
Action: consolidate to `var(--color-bg-page)` / `var(--color-bg-surface)` in a dedicated sweep PR.

**Navy brand variants inline (`#213358`, `#2D4A7A`, `#1B2B4B`, etc.):**
Used for card gradients, borders, avatars outside the avatar-gradient fix above. Should become `--color-navy-*` tokens.

**`rgba(255,255,255,0.0x)` subtle-tint pattern across 101 files:**
Pattern assumes dark page bg. In light mode this reads as "barely visible" tint. Primary offender in PR2/PR3 screen wrappers and many cards.

**Effect-on-transparent rgba:**
851 rgba() include legitimate shadows/glows/overlays. Not all are bugs — needs per-occurrence review.

### Category A — intentional (keep hardcode)

- `#00A896`, `#00C4B0`, `#00C9B1`, `#007A6E` — Lingona brand teal family
- `RANK_CONFIG` colors: Iron `#9CA3AF`, Bronze `#CD7F32`, Silver `#C0C0C0`, Gold `#FFD700`, Platinum `#00CED1`/`#00FFFF`, Diamond `#B9A0E8`/`#B9F2FF`, Challenger `#FF6B35`/`#FF4500`/`#FF4500`
- `#1877F2` Facebook brand
- Status semantic: `#22C55E`/`#10B981`/`#16A34A` (success), `#EF4444` (error), `#F59E0B` (warning, amber) — should consolidate to 1 var each if usage > 3, but hardcode-per-file is acceptable short-term
- White `#FFFFFF` / black `#000000` on solid-brand backgrounds (buttons, Facebook chip)

---

## Canonical tokens established in PR4a

New CSS vars added to `globals.css` (used by PR5 Mode Selection + available for PR4b sweep):

```
--color-bg-page          --color-bg-surface
--color-bg-navy          --color-bg-teal-surface
--color-text-primary     --color-text-secondary     --color-text-muted
--color-teal             --color-teal-accent        --color-teal-meta
--color-amber
--color-border           --color-border-teal
--color-sidebar-bg (alias to existing --sidebar-bg, dark value tightened)
--color-avatar-from      --color-avatar-to          --color-avatar-ring
--color-icon-muted
--color-tab-active-bg    --color-tab-active-text
```

Old vars (`--color-bg`, `--color-text`, `--color-primary-soft`, `--dash-*`, `--sidebar-*`) left in place to avoid rename breakage. PR4b/post-launch sweep will migrate usages.
