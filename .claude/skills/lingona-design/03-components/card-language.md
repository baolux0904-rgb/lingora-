# Card language — how cards breathe and nest

Cards = primary content container in Lingona. Used for: feature card, lesson card, result feedback card, badge tile, friend item, settings row, modal.

## Canonical card

```tsx
<div className="
  bg-cream
  border border-gray-200
  rounded-lg
  p-6
  shadow-sm
">
  {/* card content */}
</div>
```

| Aspect | Value |
|--------|-------|
| Background | `bg-cream` `#F8F7F4` (warm-white, NOT pure white) |
| Border | `border border-gray-200` 1px subtle |
| Radius | `rounded-lg` (16px) — see `01-foundations/radius-language.md` |
| Padding | `p-6` (24px) default |
| Shadow | `shadow-sm` very subtle warm tint, NOT `shadow-xl` |

KHÔNG raw `style={{ background: 'var(--color-bg-card)' }}` — use Tailwind `bg-cream`. Bridge CSS var only when dynamic theming required (per `09-anti-patterns/inline-style-rule.md`).

## Card hierarchy levels

3 card sizes per content prominence:

### Tight card — sidebar, list row

```tsx
<div className="bg-cream border border-gray-200 rounded-md p-3">
  {/* compact list item */}
</div>
```

| Use | Padding | Radius |
|-----|---------|--------|
| Sidebar nav item | `p-3` (12px) | `rounded-md` (12px) |
| Notification toast | `p-3` | `rounded-md` |
| Friend list row | `p-3` | `rounded-md` |
| Inline tag | `px-3 py-1` | `rounded-full` (pill) |

### Default card — content card, feature card

```tsx
<div className="bg-cream border border-gray-200 rounded-lg p-6 shadow-sm">
  {/* standard card */}
</div>
```

| Use | Padding | Radius |
|-----|---------|--------|
| Feature card landing | `p-6` (24px) | `rounded-lg` (16px) |
| Lesson card grid | `p-6` | `rounded-lg` |
| BandProgressCard | `p-6` | `rounded-lg` |
| Settings section card | `p-6` | `rounded-lg` |
| Modal default | `p-6` | `rounded-lg` |

### Hero card — moment card, prominent

```tsx
<div className="bg-cream border-2 border-teal rounded-xl p-8 shadow-md">
  {/* hero / moment card */}
</div>
```

| Use | Padding | Radius |
|-----|---------|--------|
| Pricing tier (Pro highlighted) | `p-8` (32px) | `rounded-xl` (24px) |
| Result page band display | `p-8` | `rounded-xl` |
| Level-up overlay card | `p-8` | `rounded-2xl` |
| Landing hero CTA card | `p-8 lg:p-10` | `rounded-2xl` |
| Achievement unlock card | `p-8` | `rounded-2xl` |

**Rule**: 1 hero card per viewport screen max. KHÔNG multiple hero cards (kills hierarchy stair).

## Card-internal structure

3-zone pattern: header / body / footer.

```tsx
<div className="bg-cream border border-gray-200 rounded-lg overflow-hidden">
  {/* Header — optional */}
  <header className="px-6 pt-6 pb-3">
    <h3 className="text-lg font-semibold text-navy">{title}</h3>
    <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
  </header>

  {/* Body — main content */}
  <div className="px-6 py-3">
    {children}
  </div>

  {/* Footer — optional CTA */}
  <footer className="px-6 pb-6 pt-3 flex items-center justify-between">
    <span className="text-xs text-gray-500">{meta}</span>
    <button className="primary-button">CTA</button>
  </footer>
</div>
```

Padding strategy:
- `overflow-hidden` parent → child padding controls spacing
- KHÔNG nested `p-6` in header + body + footer (cumulative padding = bloat)
- Use `px-6 py-3` per zone for compact, `px-6 py-4` for breathing

## Card with left accent (border-left)

```tsx
<div className="
  bg-cream
  border border-gray-200
  border-l-4 border-l-teal
  rounded-none  /* sharp because border partial */
  p-6
">
  {/* feedback card with skill color accent */}
</div>
```

**Rule cứng**: `border-l-4` accent → MUST `rounded-none` (per `01-foundations/radius-language.md`). Rounded corners + partial border = visual error.

Accent color per skill (per Result page anatomy):
- Coherence: `border-l-teal`
- Vocabulary: `border-l-teal`
- Grammar: `border-l-amber` (warning if score <6)
- Pronunciation: `border-l-teal`
- Custom dynamic: `border-left: 4px solid ${getColorByScore(score)}`

```tsx
<div
  className="rounded-none border border-gray-200 p-6"
  style={{ borderLeft: `4px solid ${getColorByScore(skill.score)}` }}
>
  <span className="text-sm text-gray-600">{skill.label}</span>
  <span className="text-3xl font-display italic text-navy mt-2">{skill.score}</span>
</div>
```

## Card grid (multiple cards in a row)

Per `02-layout/grid-vs-flow.md` — grid for comparable items.

```tsx
// Default 3-column grid, 24px gap, mobile collapse
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card />
  <Card />
  <Card />
</div>
```

Standard gap = `gap-6` (24px). KHÔNG random gap (kill rhythm).

Card height — 2 strategies:

### Strategy A — auto-fit (variable height OK)

```tsx
<div className="grid grid-cols-3 gap-6">
  {cards.map(c => <Card key={c.id} {...c} />)}
</div>
```

Cards có thể khác height. Acceptable nếu content variation natural.

### Strategy B — uniform height

```tsx
<div className="grid grid-cols-3 gap-6 auto-rows-fr">
  {cards.map(c => <Card key={c.id} {...c} />)}
</div>
```

`auto-rows-fr` — all cards in row stretch to tallest. Use when visual symmetry matters (pricing tiers, feature comparison).

## Card hover state (interactive cards)

```tsx
<div className="
  bg-cream border border-gray-200 rounded-lg p-6 shadow-sm
  hover:border-teal hover:shadow-md
  transition-all duration-150
  cursor-pointer
">
  {/* clickable card */}
</div>
```

| State | Visual |
|-------|--------|
| Default | `border-gray-200` + `shadow-sm` |
| Hover | `border-teal` + `shadow-md` (subtle lift) |
| Active | `border-teal-dark` + `shadow-sm` |
| Focus | `ring-2 ring-teal-light ring-offset-2` |

KHÔNG scale transform on hover (jiggle anti). Border + shadow shift only.

KHÔNG translate-y-1 lift effect (gimmicky). Border color shift = enough signal.

## Card patterns by use case

### Feature card (Landing)

```tsx
<div className="bg-cream border border-gray-200 rounded-lg p-6 hover:border-teal transition-colors">
  <div className="w-12 h-12 rounded-md bg-teal-50 flex items-center justify-center mb-4">
    <Icon className="w-6 h-6 text-teal" />
  </div>
  <h3 className="text-xl font-display italic text-navy mb-2">{feature.title}</h3>
  <p className="text-base text-gray-700 leading-relaxed">{feature.desc}</p>
</div>
```

3-zone: icon block / headline / body. KHÔNG add CTA inside feature card (CTA at section bottom).

### Pricing tier card (Most popular highlighted)

```tsx
<div className="
  bg-cream
  border-2 border-teal  /* highlight if 'Most popular' */
  rounded-xl p-8
  relative
">
  {isMostPopular && (
    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
      <span className="px-3 py-1 bg-teal text-cream text-xs font-semibold rounded-full">
        Tiết kiệm nhất
      </span>
    </div>
  )}
  <h3 className="text-2xl font-display italic text-navy">{tier.name}</h3>
  <p className="text-5xl font-display italic text-navy mt-4">{tier.price}</p>
  <p className="text-sm text-gray-600 mt-1">/ {tier.period}</p>
  
  <ul className="mt-6 space-y-2">
    {tier.features.map(f => (
      <li key={f} className="flex items-start gap-2 text-sm">
        <Check className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
        <span>{f}</span>
      </li>
    ))}
  </ul>
  
  <button className="mt-8 w-full primary-button">{tier.cta}</button>
</div>
```

Highlighted tier: `border-2 border-teal` (2px is intentional exception — highlighted = stronger border). Other tiers: `border border-gray-200` 1px.

### Result feedback card (sub-skill)

Per `02-layout/result-page-anatomy.md`:

```tsx
<div
  className="rounded-none border border-gray-200 p-6"
  style={{ borderLeft: `4px solid ${getColorByScore(skill.score)}` }}
>
  <div className="text-sm text-gray-600">{skill.label}</div>
  <div className="text-3xl font-display italic text-navy mt-2">{skill.score}</div>
  {skill.delta && (
    <div className="text-xs text-teal mt-1">
      {skill.delta > 0 ? '+' : ''}{skill.delta} so với lần trước
    </div>
  )}
</div>
```

### Friend list card

```tsx
<div className="bg-cream border border-gray-200 rounded-md p-3 flex items-center gap-3 hover:border-teal transition-colors">
  <Avatar user={friend} size={40} />
  <div className="flex-1 min-w-0">
    <p className="text-sm font-medium text-navy truncate">{friend.username}</p>
    <p className="text-xs text-gray-500">Lv {friend.level} · {friend.streak} day streak</p>
  </div>
  <button className="px-3 py-1 rounded-full bg-teal-50 text-teal text-xs font-medium hover:bg-teal-100">
    Chat
  </button>
</div>
```

Tight card (`p-3`), avatar left + content middle + action right pattern.

### Settings row card

```tsx
<div className="bg-cream border border-gray-200 rounded-md p-4 flex items-center justify-between">
  <div>
    <p className="text-base font-medium text-navy">{setting.label}</p>
    <p className="text-sm text-gray-600 mt-1">{setting.desc}</p>
  </div>
  <button className="text-teal hover:text-teal-dark text-sm font-medium">
    Chỉnh sửa
  </button>
</div>
```

Settings card pattern: label + desc left, action right. KHÔNG full button (link-style action).

## Card on dark surface (rare)

If card appears on dark navy surface:

```tsx
<div className="bg-navy text-cream p-12">
  {/* dark surface */}
  <div className="bg-navy-light border border-navy-dark rounded-lg p-6">
    {/* card on dark — invert palette */}
    <h3 className="text-cream font-display italic">{title}</h3>
    <p className="text-gray-300 text-sm mt-2">{body}</p>
  </div>
</div>
```

Dark surface uses `bg-navy-light` for card (slight elevation), `border-navy-dark` for definition. Text inverts to `cream` and `gray-300`.

## Anti-patterns

❌ Card background pure `bg-white` — use `bg-cream` warm-white
❌ Card border `border-gray-100` invisible — use `border-gray-200` minimum
❌ Heavy shadow `shadow-2xl` floating glassmorphism (AI-template smell)
❌ Multiple radii within same card (`rounded-lg` outer + `rounded-md` inner = visual error if not intentional)
❌ Card padding random (`p-5`, `p-7` arbitrary) — use scale `p-3/4/6/8`
❌ Hover scale transform (jiggle)
❌ Border-left accent + rounded corners (visual error per radius rule)
❌ 8+ child elements crammed in card (cluttered, see `02-layout/empty-space-philosophy.md`)
❌ Gradient card background (`bg-gradient-to-r from-teal to-blue`) — solid only
❌ Card covering full viewport without breathing gutter
❌ Multiple hero cards same view (1 hero per viewport screen)

## Audit checklist

```
1. Card bg-cream (NOT pure white)? ✓
2. Card border 1px subtle? ✓
3. Card padding from scale (3/4/6/8)? ✓
4. Card radius from scale (md/lg/xl)? ✓
5. Border-left accent → rounded-none? ✓
6. Hover state border-color shift only (NO scale)? ✓
7. 1 hero card per viewport max? ✓
8. Cards on grid use gap-6 (24px)? ✓
9. Card-internal hierarchy follows 3-tier (header/body/footer)? ✓
10. NO gradient, NO heavy shadow, NO glassmorphism? ✓
```

## See also

- `01-foundations/palette.md` — bg-cream, border-gray-200 canon
- `01-foundations/radius-language.md` — rounded-md/lg/xl/2xl per use
- `01-foundations/space-system.md` — padding scale 3/4/6/8
- `02-layout/empty-space-philosophy.md` — card density
- `02-layout/result-page-anatomy.md` — feedback card pattern
- `02-layout/grid-vs-flow.md` — when card grid vs flow
- `09-anti-patterns/inline-style-rule.md` — CSS var bridge OK, raw hex BAN
