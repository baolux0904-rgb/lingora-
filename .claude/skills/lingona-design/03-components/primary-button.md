# Primary button — the teal button

The primary CTA in Lingona = **teal solid button**. Single canonical pattern. KHÔNG variation random per page.

## Canonical primary button

```tsx
<button className="
  px-6 py-3
  rounded-md
  bg-teal text-cream
  font-sans font-semibold text-base
  hover:bg-teal-light
  active:bg-teal-dark
  transition-colors duration-150
  disabled:opacity-50 disabled:cursor-not-allowed
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream
">
  Bắt đầu luyện
</button>
```

| Aspect | Value |
|--------|-------|
| Background default | `bg-teal` `#00A896` |
| Background hover | `bg-teal-light` `#00C4B0` |
| Background active (pressed) | `bg-teal-dark` |
| Background disabled | same + opacity-50 |
| Text color | `text-cream` `#F8F7F4` (NOT pure white — cream warm) |
| Text weight | `font-semibold` (600) |
| Text size | `text-base` (16px) default |
| Padding | `px-6 py-3` (24px / 12px) default |
| Radius | `rounded-md` (12px) — see `01-foundations/radius-language.md` |
| Min height (mobile a11y) | 48px (auto via py-3 = 12+24+12 = 48px) |
| Focus ring | 2px teal-light + 2px offset cream |
| Transition | `transition-colors duration-150` |

## Size variants

| Size | Tailwind | Use case |
|------|----------|----------|
| **xs** | `px-3 py-1.5 text-sm` (height 32px) | Inline action chip — KHÔNG primary CTA |
| **sm** | `px-4 py-2 text-sm` (height 36px) | Secondary action (KHÔNG primary CTA) |
| **md** (default) | `px-6 py-3 text-base` (height 48px) | Standard primary CTA |
| **lg** | `px-8 py-4 text-lg` (height 56px) | Hero CTA, landing primary |
| **xl** | `px-10 py-5 text-xl` (height 64px) | Landing hero KHÔNG dùng — too aggressive |

```tsx
// Standard CTA
<button className="px-6 py-3 ...">Bắt đầu luyện</button>

// Hero landing
<button className="px-8 py-4 text-lg ...">Cùng luyện IELTS với mình</button>
```

KHÔNG mix sizes within same view (1 primary CTA per viewport, secondary buttons match `md` or `sm`).

## Voice rules — button text

Per `00-manifesto/personality.md`:

| Context | ✅ VN peer voice | ❌ Anti |
|---------|------------------|---------|
| Start primary action | `"Bắt đầu luyện"` | `"Get Started"` / `"Start"` |
| Submit form | `"Lưu"` / `"Cập nhật"` | `"Save"` / `"Update"` |
| Continue | `"Tiếp tục"` | `"Continue"` / `"Next"` |
| Submit answer | `"Nộp bài"` | `"Submit"` |
| Submit speaking | `"Nộp bài ⚔️"` (codebase verified) | `"Submit answer"` |
| Try again | `"Luyện tiếp"` | `"Try Again"` |
| View history | `"Xem lịch sử"` (codebase) | `"View History"` |
| Skip | `"Bỏ qua"` (codebase) | `"Skip"` |
| Cancel | `"Hủy"` | `"Cancel"` |
| Confirm delete | `"XÓA"` (codebase mandatory typed confirm) | `"Delete"` |
| Pro upgrade | `"Nâng cấp lên Pro"` | `"Upgrade to Pro"` |
| Login | `"Đăng nhập"` | `"Sign in"` |
| Register | `"Đăng ký"` | `"Sign up"` |
| Battle queue | `"Vào trận"` / `"Tìm đối thủ"` | `"Find Match"` |

**Rule cứng**: Button text Vietnamese-first. KHÔNG English unless intentional drama (`VICTORY` / `DEFEAT` Battle result — codebase locked).

## Button arrow / icon

Optional inline arrow for forward-direction actions:

```tsx
// ✅ Forward action (Continue, Next, Start)
<button className="...">
  Bắt đầu luyện <span aria-hidden="true">→</span>
</button>

// ✅ With arrow component
<button className="flex items-center gap-2">
  Tiếp tục
  <ArrowRight className="w-4 h-4" />
</button>
```

Arrow rules:
- ✅ Forward action: arrow right `→`
- ✅ Back action: arrow left `←`
- ❌ Random arrow direction
- ❌ Arrow on submit/save/cancel (no spatial meaning)
- ❌ Multiple icons + arrow (cluttered)

## States

### Default

```tsx
<button className="bg-teal text-cream ...">Bắt đầu luyện</button>
```

### Hover

`hover:bg-teal-light` — subtle lighten, NOT scale transform (no jiggle).

### Active (pressed)

`active:bg-teal-dark` — slight darken on click.

### Focus (keyboard nav)

```tsx
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-teal-light
focus-visible:ring-offset-2
focus-visible:ring-offset-cream
```

Use `focus-visible` not `focus` — only show ring on keyboard nav, not mouse click.

### Loading

```tsx
<button disabled className="...">
  <Spinner className="w-4 h-4 mr-2 animate-spin" />
  Đang nộp...
</button>
```

Voice rule for loading text:
- ✅ `"Đang nộp..."` (present continuous + 3 dots)
- ✅ `"Đang gửi..."`
- ✅ `"Đang lưu..."`
- ❌ `"Loading..."` (English)
- ❌ `"Vui lòng chờ..."` (corporate VN)

### Disabled

```tsx
<button
  disabled
  className="bg-teal text-cream disabled:opacity-50 disabled:cursor-not-allowed"
>
  Bắt đầu luyện
</button>
```

KHÔNG gray out background — keep teal but reduce opacity. Visual continuity.

### Success (post-action)

NO success state on button itself — use toast `"Đã lưu"` notification instead.

### Error (post-action)

NO error state on button — use inline error text below button:

```tsx
<button>...</button>
{error && (
  <p className="mt-2 text-sm text-error">{error}</p>
)}
```

## Secondary button (NOT primary teal)

For secondary actions next to primary:

```tsx
<button className="
  px-6 py-3
  rounded-md
  bg-transparent
  border border-navy-light
  text-navy
  font-sans font-medium text-base
  hover:bg-navy-50
  active:bg-navy-100
  transition-colors duration-150
">
  Hủy
</button>
```

| Aspect | Secondary |
|--------|-----------|
| Background | transparent |
| Border | `border-navy-light` 1px |
| Text | `text-navy` |
| Weight | `font-medium` (500) — lighter than primary |
| Hover | `bg-navy-50` subtle wash |

KHÔNG dùng secondary button as primary CTA. Pair primary + secondary in 60:40 visual weight ratio.

## Pill / chip button (compact action)

For inline tag-like actions (e.g., "+ Mời bạn", filter chips):

```tsx
<button className="
  px-4 py-1.5
  rounded-full
  bg-teal-light text-cream
  text-sm font-medium
  hover:bg-teal
  transition-colors
">
  + Mời bạn
</button>
```

Pill = `rounded-full`. Not the same as primary CTA — used for compact tag-style actions.

## Button motion (Framer Motion variants)

Per `06-motion/framer-variants.md` (pending):

```tsx
import { motion } from 'framer-motion';

<motion.button
  whileTap={{ scale: 0.97 }}
  transition={{ duration: 0.15 }}
  className="..."
>
  Bắt đầu luyện
</motion.button>
```

Tap micro-interaction: scale 0.97 on press. NOT bounce, NOT scale 1.1 grow.

KHÔNG hover scale (annoying on mouse-heavy desktop usage). Only tap-scale on press.

## Asymmetric button placement (Pattern C alignment)

Per `02-layout/desktop-canvas.md` Pattern C:

```tsx
// Hero section asymmetric (text 45% left, visual 38% right)
<div className="grid grid-cols-12 gap-6">
  <div className="col-span-7">
    <h1 className="text-5xl font-display italic">...</h1>
    <p className="mt-6 text-lg">...</p>
    <button className="mt-8 px-8 py-4 ...">Bắt đầu luyện</button>
    {/* Button left-aligned, NOT centered */}
  </div>
  <div className="col-span-5 flex justify-end">
    <Mascot size={320} mood="happy" />
  </div>
</div>
```

Button alignment within asymmetric layout = **left-aligned** (matches text block). KHÔNG center button on desktop hero.

Mobile: button full-width or 80% width centered:

```tsx
<button className="w-full lg:w-auto px-6 py-3 ...">
  Bắt đầu luyện
</button>
```

## Button group (multiple buttons in a row)

```tsx
// Primary + secondary side-by-side
<div className="flex items-center gap-3">
  <button className="primary-classes">Lưu</button>
  <button className="secondary-classes">Hủy</button>
</div>

// Primary alone
<button className="primary-classes">Bắt đầu luyện</button>

// Toggle group (mode switch — 2 mutually exclusive options)
<div className="inline-flex rounded-md border border-gray-200 p-1 bg-cream">
  <button className="px-4 py-2 rounded-sm bg-teal text-cream">Practice</button>
  <button className="px-4 py-2 rounded-sm text-navy hover:bg-navy-50">Full Test</button>
</div>
```

Toggle group: 1 active state visual highlighted, others neutral. Active = teal background; inactive = transparent + navy text.

## Mode-specific button

### Brand mode (default)

Primary teal button per spec above.

### Brand-soft mode (Practice)

Same teal button, slight adjustment:
- Padding tighter `px-5 py-2.5` (Practice = doing-mode, less ceremony)

### IELTS-authentic mode (Full Test, Battle Ranked)

**Sharp edges**, neutral palette:

```tsx
<button className="
  px-6 py-2
  rounded-sm  /* sharp Cambridge */
  border border-navy
  bg-cream text-navy
  font-serif text-sm
  hover:bg-navy-50
">
  Submit
</button>
```

Cambridge faithful: `rounded-sm`, `font-serif` (Georgia), `bg-cream` neutral, `border-navy` sharp. KHÔNG teal solid in exam mode (gamified feel — phá thi-thật).

## Battle drama button — VICTORY / DEFEAT register

Battle result CTA:

```tsx
// VICTORY context — celebrate but earned
<button className="
  px-8 py-4 text-lg
  rounded-md
  bg-teal text-cream
  font-display italic font-bold
">
  Đấu nữa
</button>

// DEFEAT context — recovery focus
<button className="
  px-8 py-4 text-lg
  rounded-md
  bg-transparent border border-teal
  text-teal
  font-display italic font-bold
">
  Luyện lại
</button>
```

Battle button uses `font-display italic` (Playfair) for drama register. Other pages use `font-sans` DM Sans.

## Anti-patterns

❌ Gradient button (`bg-gradient-to-r from-teal to-blue`) — solid only
❌ Multiple primary buttons same view (CTA hierarchy lost)
❌ Center-aligned primary button on desktop hero (use Pattern C asymmetric)
❌ English microcopy (`"Get Started"`, `"Submit"`)
❌ Button > xl size on landing (visual aggression)
❌ Button < 32px height (a11y fail mobile)
❌ Hover scale animation (jiggle anti)
❌ Box-shadow heavy (`shadow-xl`, `shadow-2xl`) — flat design
❌ Border-radius `rounded-xl` for primary CTA (use `rounded-md`)
❌ Custom hex color outside palette canon
❌ Inline `style={{ background: '#00A896' }}` (use `bg-teal` Tailwind class)

## Audit checklist

```
1. Primary button uses bg-teal? ✓
2. Text bg-cream NOT pure white? ✓
3. Min height 48px (mobile)? ✓
4. Focus-visible ring present? ✓
5. Vietnamese microcopy? ✓
6. Tap motion scale 0.97 only? ✓
7. NO gradient, NO heavy shadow? ✓
8. NO hover scale? ✓
9. Asymmetric placement on hero (left-aligned)? ✓
10. 1 primary CTA per viewport? ✓
```

## Codebase pattern verified

`frontend/components/Battle/BattleResult.tsx` + `frontend/components/landing/HeroSection.tsx` — primary button pattern partially implemented. Wave 6 audit will identify drift instances.

## See also

- `01-foundations/palette.md` — teal canon
- `01-foundations/typography.md` — DM Sans + Playfair (Battle drama)
- `01-foundations/radius-language.md` — rounded-md primary
- `02-layout/desktop-canvas.md` — asymmetric Pattern C button placement
- `06-motion/framer-variants.md` — tap scale variant (pending)
- `00-manifesto/personality.md` — voice rules button text
- `04-modes/ielts-authentic.md` — sharp button in exam mode (pending)
