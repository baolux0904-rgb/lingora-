# Friend list — conversation sidebar + activity feed anatomy

Keywords for skill search: friend list, conversation sidebar, chat list, online indicator, unread badge, presence, voice note preview, timestamp Vietnamese, empty state, Messenger.

Pattern for the Friends page (`/friends`) chat sub-tab + adjacent surfaces (ActivityFeed, FriendsList, RequestsList, AddFriend). App-mode component, CSS-var tokens.

## Architecture context

Friends page is a 5-sub-tab social hub, not a single page. Desktop renders 2-pane: 320px ConversationSidebar (left) + active chat OR ActivityFeed OR BigEmpty (right). Mobile renders one of the 5 sub-tabs full-width.

The chat list pattern below = ConversationSidebar canon. ActivityFeed reuses the same Avatar + online-dot pattern at a smaller scale.

## Conversation list item

```tsx
<button onClick={() => onSelect(c)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
  <div className="relative">
    <Avatar name={c.friend_name} size={40} online={friendIsOnline(c.friend_id)} />
    {c.unread_count > 0 && (
      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{ background: "#00A896", color: "#fff" }}>
        {c.unread_count > 9 ? "9+" : c.unread_count}
      </span>
    )}
  </div>
  <div className="flex-1 min-w-0">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium truncate">{c.friend_name}</span>
      <span className="text-xs shrink-0 ml-2 tabular-nums">{formatRelativeTime(c.last_message_at)}</span>
    </div>
    <span className={`text-xs truncate block${c.last_type === "voice" ? " italic" : ""}`}>
      {c.last_type === "voice" ? "[Tin nhắn thoại]" : c.last_content || "Bắt đầu trò chuyện"}
    </span>
  </div>
</button>
```

| Element | Spec |
|---|---|
| Item padding | `px-4 py-3` |
| Avatar | 40px, inline `<Avatar>` component (`FriendsTab.tsx`), `online` prop drives green dot overlay |
| Online indicator | bottom-right of avatar, ~28% of avatar size, border 2px in `var(--color-bg-page)`, color `#5DCAA5` |
| Unread badge | top-right of avatar, `min-w-5 h-5`, `bg-teal` (`#00A896`) `text-white`, `text-xs font-semibold`, `"9+"` overflow above 9 |
| Name | `text-sm font-medium truncate`, color `var(--color-text)` |
| Timestamp | `text-xs tabular-nums`, color `var(--color-text-tertiary)`, top-right of item |
| Preview | `text-xs truncate block`, color `var(--color-text-tertiary)` |
| Voice note preview | `italic "[Tin nhắn thoại]"` (NOT `🎤 Voice note` — emoji ban + EN→VN) |
| Empty preview | `"Bắt đầu trò chuyện"` (NOT `"Start chatting"`) |
| Active state | `borderLeft: 3px solid #00A896` + subtle bg `rgba(0,168,150,0.06)` |
| Hover | inherits `transition-all` from parent |

## Search bar (top of sidebar)

```tsx
<div className="relative">
  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
          style={{ color: "var(--color-text-tertiary)" }} aria-hidden="true" />
  <input
    placeholder="Tìm kiếm tin nhắn..."
    className="w-full rounded-full pl-9 pr-3 py-2 text-sm focus:outline-none
      focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-1
      focus-visible:ring-offset-[var(--color-bg-card)]"
    style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)",
             color: "var(--color-text)" }}
  />
</div>
```

- Pill shape (`rounded-full`) — matches scenario-card filter chip canon
- Search icon left, `aria-hidden` (decorative; placeholder gives semantic context)
- Canonical Lingona focus-visible ring
- Tailwind `pl-9` reserves space for the absolutely-positioned icon

## Timestamp format — Vietnamese localization

Use `formatRelativeTime` from `frontend/lib/utils/time.ts`. Ladder:

| Age | Output | Example |
|---|---|---|
| < 1 minute | `vừa xong` | — |
| 1–59 min | `Np` | `5p`, `45p` |
| Today, >1 hour ago | `HH:mm` | `14:32` |
| Yesterday | `Hôm qua` | — |
| 2–6 days ago | weekday short | `T2`, `T3`, ..., `T7`, `CN` |
| ≥7 days | `DD/MM` | `12/05` |
| Future / invalid | fallback to `vừa xong` or empty string | — |

`tabular-nums` Tailwind utility applied on the timestamp `<span>` so digits align across items.

## Online indicator color — accepted exception

`#5DCAA5` (mint green) is an **accepted palette exception** for friend list contexts only. Rationale:
- Universal UX convention (Messenger, WhatsApp, Slack all use green for online)
- Softer than `#22C55E` Tailwind green-500 (which was inconsistent across files pre-normalization)
- Distinguishable from the teal CTA color `#00A896`

Normalized across all 3 callers as of this commit: `ConversationSidebar` avatar, `ActivityFeed` "active today" dot + card border, `FriendsList` `practiced_today` dot. Don't extend `#5DCAA5` to other surfaces — green outside friend-list context = drift.

`ActivityFeed` "active today" card bg uses `rgba(93,202,165,0.06)` and border `rgba(93,202,165,0.15)` — derived from the same hex.

## Unread badge

```tsx
<span
  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold"
  style={{ background: "#00A896", color: "#fff" }}
  aria-label={`${c.unread_count} tin nhắn chưa đọc`}
>
  {c.unread_count > 9 ? "9+" : c.unread_count}
</span>
```

- Teal bg + white text, NOT red (Lingona doesn't use red for non-error signals — see `band-progress.md` for the Soul §1 "no red on band scores" rule that generalizes)
- Overflow at 9 → `"9+"` (could extend to `"99+"` if conversation depth ever grows; current threshold is fine for V1)
- ARIA label localized

## Empty states — unified pattern (no split-personality)

### Right pane: 0 friends AND 0 conversations → BigEmpty

```tsx
<div className="max-w-[480px] mx-auto py-24 text-center flex flex-col items-center gap-6">
  <Mascot size={120} mood="default" />
  <h2 className="font-display italic text-[24px] sm:text-[28px]"
      style={{ color: "var(--color-text)" }}>
    Chưa có ai cả
  </h2>
  <p className="text-[15px] sm:text-[16px] max-w-[400px]"
     style={{ color: "var(--color-text-secondary)" }}>
    Mời bạn bè cùng luyện IELTS — học một mình lâu rồi cũng chán.
  </p>
  <Link href="/friends/add"
        className="px-6 py-3 rounded-full bg-teal text-cream font-semibold ...">
    Mời bạn bè
  </Link>
</div>
```

### Left sidebar: 0 conversations → compact 1-line hint

```tsx
<div className="px-6 py-10 text-center">
  <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
    Thêm bạn bè để bắt đầu
  </p>
</div>
```

**No emoji, no separate mascot in sidebar** — the mascot lives in the right-pane BigEmpty only. Avoids the pre-rebuild split-state UX where two emoji-led empty messages competed for attention.

### FriendsList tab (when user has 0 friends in the dedicated Friends list view)

```tsx
<div className="text-center py-12 flex flex-col items-center gap-2">
  <Mascot size={56} mood="thinking" />
  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
    Chưa có ai cả. Thêm bạn để bắt đầu.
  </p>
</div>
```

Smaller mascot (56px) — secondary empty state, BigEmpty is primary.

## Voice / banned-phrase compliance

- `kịch bản` → `tình huống` (corporate-translate, see `corporate-translate.md`)
- `🎤 Voice note` → `[Tin nhắn thoại]` italic — emoji removed, square brackets denote system-rendered metadata
- `Start chatting` → `Bắt đầu trò chuyện`
- `Ping` (FriendsList button) → `Nhắc nhẹ` (peer voice for casual social poke)
- `Remove this friend?` → `Bỏ kết bạn?` (native confirm dialog, styled-modal upgrade deferred)
- `Active Today` / `Practiced today` / `Not Yet Today` → `Hoạt động hôm nay` / `Đã luyện hôm nay` / `Chưa luyện hôm nay`
- Empty states: no `Chưa có bạn bè!` exclamation register, no `🐙` emoji spam — peer voice, sober

## Token system note

Friends page is **app-mode** (auth-gated, `(app)` group). CSS-var tokens:
- `--color-bg-card`, `--color-bg-secondary` — surface layers
- `--color-text`, `--color-text-secondary`, `--color-text-tertiary` — text hierarchy
- `--color-border`, `--surface-primary`, `--surface-border` — borders
- `--color-avatar-from`, `--color-avatar-to` — avatar gradient

Tailwind palette layer (semantic accents) used for:
- `bg-teal` (`#00A896`) — CTAs, active state, unread badge
- Inline `#5DCAA5` — online indicator (exception, documented above)
- `bg-amber-100 text-amber-700` — `Đang chờ` request status pill

Same hybrid pattern as `scenario-card.md` — structural surfaces via CSS vars, semantic accents via Tailwind/inline hex.

## Origin

Session 3 polish — first commit shipping the unified empty state, Vietnamese `formatRelativeTime` util, voice drift sweep across all 5 sub-tabs of FriendsTab, and online-indicator color normalization. Commit hash placeholder (matches `tailwind-grid-rows-fr-gotcha.md` and `scenario-card.md` convention). v1 — may revise after next round of UX testing on the chat list.

Deferred:
- FriendsList visual restructure to match new chat-list pattern (avatar + name + activity preview + last-seen) — separate session, would unify Friends + Conversations into one mental model.
- Styled-modal replacement for `confirm("Bỏ kết bạn?")` native browser dialog.
- Notification bell dropdown positioning fix when bell renders in AppSidebar bottom-left (clips off-screen).

## See also

- `03-components/scenario-card.md` — sibling app-mode list canon (filter chips, card anatomy, app-mode CSS-var rule)
- `03-components/mascot.md` — Lintopus sizes + moods used in empty states
- `03-components/primary-button.md` — teal pill CTA pattern reused for "Mời bạn bè"
- `05-voice/never-say-list.md` — banned phrases, peer voice canon
- `09-anti-patterns/corporate-translate.md` — `kịch bản`/`Start chatting`/`Friend request sent!` corporate translations to avoid
- `frontend/lib/utils/time.ts` — `formatRelativeTime` Vietnamese localization util (consumed here, reusable for Battle history, blog timestamps, etc.)
