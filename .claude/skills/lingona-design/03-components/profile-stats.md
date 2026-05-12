# Profile stats — 8-grid + RankChip + action buttons

Keywords for skill search: profile, stats grid, rank chip, action buttons, identity card, handle split-tone, Lucide stat icons, tabular-nums, app-mode.

Canon for the `/profile` page identity surface: 8-stat grid, rank chip, action buttons, handle suffix split-tone, header anatomy. App-mode component (auth-gated), CSS-var token system.

## 8-stat grid

Two columns mobile, four columns desktop, gap-3/4.

```tsx
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
  <StatCard Icon={Flame}     value={g.currentStreak}        label="STREAK" />
  <StatCard Icon={Zap}       value={g.totalXp.toLocaleString()} label="XP" />
  <RankSlot tier={battle.rank_tier} />
  <StatCard Icon={Swords}    value={battle.wins}            label="THẮNG" />
  <StatCard Icon={BarChart3} value={g.level}                label="LEVEL" />
  <StatCard Icon={Mic}       value={speaking.totalSessions} label="SPEAKING" />
  <StatCard Icon={PenLine}   value={writing.totalSubmissions} label="WRITING" />
  <StatCard Icon={Users}     value={social.friendCount}     label="BẠN BÈ" />
</div>
```

### StatCard anatomy

| Layer | Spec |
|---|---|
| Container | `rounded-2xl p-3.5 sm:p-4 flex flex-col items-center gap-1.5`, `min-w-[90px]`, hover `scale-[1.02]` |
| Background | inline `rgba(255,255,255,0.03)` + 1px border `rgba(255,255,255,0.06)` (intentionally near-invisible — the number dominates) |
| Icon | Lucide stroke 2, `w-5 h-5`, color `var(--color-text-tertiary)` — quiet |
| Value | Playfair italic, `text-[26px] sm:text-[30px]`, `tabular-nums`, color `var(--color-text)` |
| Label | uppercase `text-[11px] sm:text-[12px]`, `tracking-wider`, `font-medium`, color `var(--color-text-tertiary)` |

### Lucide icon map (canonical)

| Label | Lucide icon | Rationale |
|---|---|---|
| STREAK | `Flame` | universal streak metaphor |
| XP | `Zap` | energy/charge |
| THẮNG | `Swords` | combat outcome |
| LEVEL | `BarChart3` | progression chart |
| SPEAKING | `Mic` | literal speak |
| WRITING | `PenLine` | cleaner than `Pen` |
| BẠN BÈ | `Users` | plural people |

HẠNG slot does NOT use StatCard — it uses `<RankSlot>` wrapping `<RankChip>` (see below). Rank value is textual; Playfair italic for numbers reads awkwardly on `Iron`/`Bronze`/etc.

### Tabular-nums rule

`tabular-nums` on the value `<span>` so digits align across the 8 grid cells. Critical for stats like `1,234` next to `12` next to `5` — without `tabular-nums`, kerning shifts column alignment by 2-3px.

## RankChip

Pure-palette chip — no per-tier color deviation. Tier progression signal carried by tier name + icon, not background color. Documented decision: **rank chip rejects multi-color palette deviation** (rationale: 7 tier bgs would be the loudest deviation in the app; achievement rarity earns multi-color more because the moments are rarer).

```tsx
// frontend/components/Profile/RankChip.tsx
import { Shield, Award, Medal, Star, Gem, Diamond, Crown } from "lucide-react";
import { RANK_CONFIG, type RankName } from "@/lib/domain/battleConfig";

const TIER_ICON: Record<RankName, LucideIcon> = {
  iron: Shield, bronze: Award, silver: Medal, gold: Star,
  platinum: Gem, diamond: Diamond, challenger: Crown,
};

<span
  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
  style={{ background: "rgba(27, 43, 75, 0.08)", color: "var(--color-text)" }}
  aria-label={`Hạng ${label}`}
>
  <Icon className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
  <span>{label}</span>
</span>
```

### Why we deviate from `RANK_CONFIG.emoji`

`frontend/lib/domain/battleConfig.ts` ships `RANK_CONFIG` with emoji visuals (🪨 🥉 🥈 🥇 💎 💠 👑) for the Battle screens (`BattleTab`, leaderboards). Profile uses Lucide icons in its `TIER_ICON` for editorial consistency with the 8-stat grid Lucide icons. Both maps coexist by design:
- `RANK_CONFIG` = cross-component canon for **label** (display name)
- `TIER_ICON` = Profile-scope visual canon (Lucide, editorial)
- BattleTab + Leaderboard still consume `RANK_CONFIG.emoji` — they intentionally have a more gaming-RPG visual register

Defensive normalization in `RankChip` strips legacy `'iron'` quote-padding (residue from migration 0019/0053 — fixed by 0058) and lowercases input. Unknown tier → fallback to `iron`.

## Action buttons (pure typography)

**Rule: zero decoration.** No icons, no emojis, no gradients. Success state = text change, not icon flip.

```tsx
<div className="flex flex-wrap gap-2 mt-5 justify-center sm:justify-start">
  <button onClick={() => setShowEdit(true)}
    className="px-5 py-2.5 rounded-full text-sm font-medium ..."
    style={{ background: "#00A896", color: "#fff" }}>
    Sửa hồ sơ
  </button>
  <button onClick={handleCopyLink}
    className="px-5 py-2.5 rounded-full text-sm font-medium ..."
    style={{ background: "transparent", color: "var(--color-text)",
             border: "1px solid rgba(27,43,75,0.2)" }}>
    {copied ? "Đã sao chép" : "Sao chép link"}
  </button>
  <button onClick={() => setShowShareCard(true)}
    className="px-5 py-2.5 rounded-full text-sm font-medium ..."
    style={{ background: "transparent", color: "var(--color-text)",
             border: "1px solid rgba(27,43,75,0.2)" }}>
    Chia sẻ
  </button>
</div>
```

| Button | Style | Notes |
|---|---|---|
| Primary (Sửa hồ sơ) | solid `#00A896` teal | the only filled button |
| Secondary (Sao chép link, Chia sẻ) | transparent + 1px `rgba(27,43,75,0.2)` navy border | outlined |
| Active/success | text change only (`copied ? "Đã sao chép" : "Sao chép link"`) | auto-reset after 2s |
| All | `rounded-full px-5 py-2.5`, canonical focus ring `ring-teal/40` + `ring-offset-2` |

**Rationale documented**: action buttons reject decoration — pure typography signals editorial discipline; success state is text change, not icon flip. Earlier iteration had `🔥` / `🔗` / `🎯` decorative emojis — those are removed in this canon.

## Handle suffix split-tone

For auto-generated handles (`prefix_4to6chars` pattern), render prefix in teal and suffix in tertiary.

```ts
function splitHandle(username: string): { prefix: string; suffix: string } {
  if (/^[a-z0-9_]+_[a-z0-9]{4,6}$/.test(username)) {
    const i = username.lastIndexOf("_");
    return { prefix: username.slice(0, i), suffix: username.slice(i) };
  }
  return { prefix: username, suffix: "" };
}
```

```tsx
<p className="text-[14px] sm:text-[15px] font-medium mt-1 break-all">
  <span style={{ color: "#00A896" }}>@{handle.prefix}</span>
  {handle.suffix && (
    <span style={{ color: "var(--color-text-tertiary)" }}>{handle.suffix}</span>
  )}
</p>
```

- Detection regex requires exact pattern (lowercase prefix + `_` + 4-6 alnum). User-chosen handles like `louis_nguyen` (no random suffix) won't match → full teal opacity.
- `break-all` on the `<p>` lets long auto-handles wrap gracefully on mobile.

## Header meta row

Lucide icons for Band / Mục tiêu / location, all stroke 2 at `w-3.5 h-3.5`, color `var(--color-text-tertiary)`:

```tsx
{u.estimated_band && (
  <span className="inline-flex items-center gap-1.5">
    <BarChart3 className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
    Band {u.estimated_band.toFixed(1)}
  </span>
)}
{u.target_band && (
  <span className="inline-flex items-center gap-1.5">
    <Target className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
    Mục tiêu {u.target_band.toFixed(1)}
  </span>
)}
{u.location && (
  <span className="inline-flex items-center gap-1.5">
    <MapPin className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
    {u.location}
  </span>
)}
{joinDate && <span>Tham gia {joinDate}</span>}
```

- Replaces prior `📊` / `🎯` / `📍` emoji. Consistent with stat-grid Lucide canon.
- Join date format `tháng N/YYYY` via `formatJoinMonth` util in `frontend/lib/utils/time.ts`. NOT `toLocaleDateString("vi-VN", ...)` — that produced `"thg 5, 2026"` which reads broken.

## Top % Việt Nam badge

```tsx
{lb.percentile <= 25 && (
  <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full text-xs font-semibold"
       style={{ background: "rgba(0,168,150,0.12)", color: "#00A896" }}>
    <Award className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
    Top {lb.percentile}% Việt Nam
  </div>
)}
```

Lucide `Award` replaces `🏅`. Localization `in Vietnam` → `Việt Nam`. Same chip color as primary teal accent (subtle wash + full-opacity text). Shown only when user is in top quartile.

## Avatar

`128px` desktop (`w-32 h-32`), `112px` mobile (`w-28 h-28`). Gradient bg navy-to-navy-light, 3px teal border, soft shadow. Initials fallback in Playfair italic when no `avatar_url`.

```tsx
<div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden flex items-center justify-center font-display italic text-3xl text-white shrink-0"
  style={{ background: "linear-gradient(135deg, #1B2B4B, #2D4A7A)",
           border: "3px solid #00A896",
           boxShadow: "0 4px 16px rgba(27,43,75,0.3)" }}>
  {u.avatar_url ? <img src={u.avatar_url} alt={u.name} ... /> : initials}
</div>
```

## Guest / error states

Error state uses `<Mascot size={80} mood="thinking" />` — NOT `😕` + `🐙` emoji combo. Recovery copy: "Có lỗi xảy ra khi tải dữ liệu. Kiểm tra kết nối và thử lại."

Guest state initial: `K` (Khách) replacing `G` (Guest). Title: `Người học khách`. Body: `Tạo tài khoản để lưu tiến độ` + `Điểm, streak, và huy hiệu của bạn sẽ được lưu trên mọi thiết bị`.

## Token system note

App-mode CSS-var pattern per `scenario-card.md` canon:
- Surfaces: `var(--color-bg-card)`, `var(--color-border)`, `var(--color-bg)`
- Text: `var(--color-text)`, `var(--color-text-secondary)`, `var(--color-text-tertiary)`

Tailwind palette layer (semantic):
- `#00A896` teal — CTAs, active state, primary button
- `rgba(27,43,75,*)` navy washes — outlined button borders, rank chip bg
- `var(--color-text-tertiary)` — icon color (quiet)

## Origin

Session 4 polish. First commit shipping:
- Lucide icon map for 8-stat grid (replacing 8 emojis)
- Pure-palette RankChip + `Profile/RankChip.tsx` component
- Handle suffix split-tone with regex detection
- Pure-typography action buttons (zero decoration)
- `formatJoinMonth` util in `frontend/lib/utils/time.ts`
- Header restructure + Lucide meta icons + Award badge

Commit hash placeholder (matches `scenario-card.md` / `friend-list.md` convention). v1 — may revise after a 2nd consumer adopts the StatCard pattern.

## See also

- `03-components/scenario-card.md` — sibling app-mode list canon (filter chips, card anatomy, app-mode CSS-var rule)
- `03-components/friend-list.md` — handle/avatar pattern + accepted palette exceptions
- `03-components/achievement-badge.md` — rarity tier color exception (multi-color earned only)
- `03-components/mascot.md` — error state mascot mood reference
- `05-voice/never-say-list.md` — peer voice, banned phrases
- `frontend/lib/utils/time.ts` — `formatJoinMonth`, `formatRelativeTime`
- `frontend/lib/domain/battleConfig.ts` — RANK_CONFIG canonical labels (Profile uses Lucide TIER_ICON parallel map for visuals)
