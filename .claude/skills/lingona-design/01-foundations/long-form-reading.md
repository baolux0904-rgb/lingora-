# Long-form reading — typography scale for sustained prose

Keywords for skill search: long-form, prose, blog, article, reading scale, body typography, line-height, paragraph spacing, MDX, editorial.

## When to apply

Bất kỳ page nào có sustained reading body >500 words: blog posts (`/blog/[slug]`), full-length essays, future guide pages. KHÔNG dùng cho utility pages (Help FAQ, About sections, Settings) — utility content dùng canonical scale từ `typography.md` (line-height 1.6-1.7, paragraph spacing tighter).

Long-form reading khác utility ở 3 thing:
1. Reader đọc liên tục nhiều phút thay vì scan.
2. Eye saccade rhythm cần line measure ~70-80 ký tự (ideal CPL).
3. Paragraph break là cue cho nhịp suy nghĩ, không phải để separate sections.

## The scale (canonical for `<article>` body)

| Element | Mobile | Desktop | Why |
|---|---|---|---|
| Body | DM Sans 16-17px | DM Sans 17-18px | Đủ to để không phải squint. Vẫn fit Vietnamese diacritics. |
| Line-height | 1.75 | 1.75 | Long-form needs more breathing than utility's 1.6. Tested with Vietnamese accents (ă, ằ, ỗ) — không bị crowd. |
| Paragraph spacing | `mb-6` (24px) | `mb-6` (24px) | Cue cho nhịp suy nghĩ. Quá tight → wall of text. Quá loose → flow đứt. |
| H2 | Playfair italic 28px | Playfair italic 32px | `mt-12 mb-4` — generous space-above for section break, tight space-below to keep body close. |
| H3 | Playfair italic 22px | Playfair italic 24px | `mt-8 mb-3` — same ratio nhỏ hơn. |
| Body container max-w | `max-w-[720px]` | `max-w-[720px]` | ~70-80 CPL ideal saccade. Rộng hơn About's 640 editorial; hẹp hơn Help's utility. |

## Component tokens

| Element | Tailwind | Notes |
|---|---|---|
| Blockquote | `border-l-4 border-navy/10 pl-6 my-8 italic text-navy/70` | KHÔNG dùng quote marks; left border đủ visual cue. |
| Inline code | `bg-navy/5 text-navy px-1.5 py-0.5 rounded text-[0.9em] font-mono` | Subtle, KHÔNG dùng cream-warm (clash với body bg). |
| Code block | `bg-navy text-cream rounded-lg p-4 my-6 overflow-x-auto` | Dark navy for contrast. Mobile overflow-x-auto MANDATORY. |
| Lists | `list-disc/list-decimal pl-6 my-4 [&>li]:mb-2` | Preserve marker; pl-6 cho hang indent. |
| Links | `text-teal underline underline-offset-2 hover:text-navy` | Teal là semantic accent (link, CTA). |
| Table | `border-collapse my-6 w-full` + `border-navy/10` cells + `bg-cream-warm` header + mobile wrapper `overflow-x-auto` | Mobile wrapper NON-OPTIONAL. |
| Image | `rounded-lg my-8 w-full` | `<figcaption>` `text-[14px] text-navy/50 text-center mt-3`. |

Implementation: hand-rolled via Tailwind arbitrary group selectors trong `<article>` wrapper (`[&>p]:mb-6`, `[&>h2]:...`). Reference: `frontend/app/(public)/blog/[slug]/page.tsx`.

## What NOT to use

- **`@tailwindcss/typography` plugin** — forces parallel scale (prose-base, prose-lg) drift khỏi Lingona canon. Plugin uses its own opinionated defaults cho blockquote, code, lists — sẽ conflict với mode tokens. Hand-rolled wins.
- **Bất kỳ third-party reading typography library** — same drift risk.
- **Inline arbitrary line-height values** outside the canonical 1.75. Nếu cần override cho callout/aside, dùng named utility hoặc add to này scale.

## Origin

Established Phase A của blog scaffold — commit `[Phase A push hash]` (May 2026). Scale này là v1 — có thể revise sau Phase B (3 articles ship) nếu reading test reveal vấn đề (line quá rộng trên large display, paragraph spacing không đủ cue, etc.). Same disclaimer pattern as `09-anti-patterns/tailwind-grid-rows-fr-gotcha.md`.

## See also

- `01-foundations/typography.md` — canonical scale cho utility/UI text.
- `02-layout/empty-space-philosophy.md` — whitespace ratio cho reading pages.
- `09-anti-patterns/corporate-translate.md` — voice for long-form copy.
- `09-anti-patterns/fake-stats-ban.md` — honest claims trong technical/comparative posts.
