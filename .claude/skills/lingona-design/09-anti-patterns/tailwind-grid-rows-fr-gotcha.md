# Tailwind `grid-rows-[Nfr]` gotcha — height-animate accordion silently fails

Keywords for skill search: accordion, disclosure, collapsible, FAQ, grid-rows, grid-template-rows, fr unit, height animation, Tailwind arbitrary value.

## The trap

Để animate height của một collapsible / accordion / disclosure smoothly mà KHÔNG cần JS measure, GPU-friendly pattern là dùng CSS grid với `grid-template-rows: 0fr → 1fr` + `overflow-hidden` trên child. Bản năng đầu tiên là viết Tailwind utility:

```tsx
// ❌ BROKEN — accordion stays collapsed forever
<div
  className={`grid transition-[grid-template-rows] duration-300 ${
    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
  }`}
>
  <div className="overflow-hidden">{children}</div>
</div>
```

Looks correct. Compiles. No warning. `aria-expanded` flips. Chevron rotates. Content height stays `0px`.

## Why it fails

Tailwind's `grid-rows-*` utility CHỈ accept integer track counts (`grid-rows-1` ... `grid-rows-12`). Khi viết arbitrary value `grid-rows-[1fr]`, Tailwind treat nó như invalid input — KHÔNG generate class, KHÔNG map sang `grid-template-rows: 1fr`. Silent fail: no console warn, no build error. Computed style stays `grid-template-rows: 0px`.

Đây là Tailwind's design choice (utility scoped to track count), không phải bug — và sẽ KHÔNG được fix upstream.

## The fix

Bypass Tailwind cho `grid-template-rows` value — dùng inline `style` cho property duy nhất này. `transition-[grid-template-rows]` utility vẫn dùng Tailwind bình thường (transition property name là hợp lệ).

```tsx
// ✅ WORKS — inline style cho grid-template-rows only
<div
  className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
  style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
>
  <div className="overflow-hidden">
    <div className="px-5 pb-5">{children}</div>
  </div>
</div>
```

Đây là edge case hợp lệ của `09-anti-patterns/inline-style-rule.md` — inline style OK khi bridge một dynamic value mà Tailwind utility không support.

## When to apply

Bất kỳ component nào height-animate từ collapsed → expanded mà KHÔNG biết content height trước:

- FAQ accordion (`/help`)
- Disclosure / `<details>` replacement
- Expandable card
- Sidebar drawer height-grow
- Inline "Read more" expansion

GPU-friendly hơn `height: auto` + JS measure. Smoother hơn `max-height: 9999px` workaround (`max-height` transition luôn jank vì browser animate to a fixed pixel target).

## Required adjacent rules

- **`overflow-hidden` on inner wrapper is MANDATORY.** Không có nó, content overflow ra ngoài grid track khi `gridTemplateRows: 0fr`.
- **`prefers-reduced-motion`**: thêm `motion-reduce:transition-none` để respect user preference.
- **ARIA**: button có `aria-expanded` + `aria-controls`; panel có `role="region"` + `aria-labelledby`. Pattern này thuần CSS — KHÔNG ảnh hưởng a11y semantics.

## Origin

Lần đầu phát hiện và fix trong Help page implementation — Wave 6 Sprint 5, commit `d064a03` (May 2026). `FaqItem.tsx` ban đầu dùng `grid-rows-[1fr]` Tailwind class, panel computed `grid-template-rows: 0px` mặc dù class string render đúng. Switch sang inline `style` fixed transition immediately.

## See also

- `09-anti-patterns/inline-style-rule.md` — khi inline style OK (CSS var bridge, dynamic value); pattern này thuộc dynamic-value bucket.
- `06-motion/duration-language.md` — 300ms ease-out là duration token canonical cho accordion expand.
