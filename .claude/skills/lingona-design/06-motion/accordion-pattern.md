# Accordion expand / collapse — height 0 ↔ auto

The canonical pattern for collapsible sections in Lingona. Shipped
Sprint 4D for the onboarding `OptionalSection` and the variant lives
in `frontend/lib/motionVariants.ts` as `accordionExpand`.

## Pattern

```tsx
import { motion, AnimatePresence } from "framer-motion";
import { accordionExpand } from "@/lib/motionVariants";

<AnimatePresence initial={false}>
  {expanded && (
    <motion.div
      key="content"
      variants={accordionExpand}
      initial="collapsed"
      animate="expanded"
      exit="collapsed"
      className="overflow-hidden"   // mandatory — see below
    >
      {content}
    </motion.div>
  )}
</AnimatePresence>
```

`overflow-hidden` on the parent is **mandatory**. Without it, framer's
height-auto measure phase paints the children at full size for one
frame before settling, producing a visible content flash.

## Why height 0 ↔ auto, not the alternatives

| Approach | Verdict |
|----------|---------|
| `height: 0 ↔ auto` (this pattern) | ✅ Smooth, content-aware, framer handles measurement |
| `scaleY(0) ↔ scaleY(1)` | ❌ Compresses content visually mid-transition (text squishes) |
| `max-height: 0 ↔ <large>` | ❌ Timing depends on actual height (faster collapse for short content), brittle |
| `display: none ↔ block` | ❌ No animation possible, instant snap |
| `visibility: hidden ↔ visible` | ❌ Layout still occupies space when hidden |

## Canonical timings

`accordionExpand` from motionVariants.ts:

- Height: 300ms ease-out-expo `[0.16, 1, 0.3, 1]`
- Opacity: 200ms ease-out-expo (slight overlap so the content isn't
  visible before its container has any height)

Don't override these per-consumer. If you genuinely need different
timing (e.g. a 1000-line content block needs slower expand), document
the override in a per-component variant in the same file.

## Reduced motion

Wrap with `useReducedMotion()`:

```tsx
const reduce = useReducedMotion();
return (
  <motion.div
    variants={reduce ? undefined : accordionExpand}
    initial={reduce ? false : "collapsed"}
    animate={reduce ? false : (expanded ? "expanded" : "collapsed")}
    style={reduce ? { display: expanded ? "block" : "none" } : undefined}
  >
    ...
  </motion.div>
);
```

For `prefers-reduced-motion: reduce` users, fall back to `display:
none ↔ block` — instant snap is acceptable when motion is opted out.

## Trigger button pattern

The toggle that controls the accordion sits **outside** the
`AnimatePresence`. It carries `aria-expanded` + `aria-controls`
attributes pointing at the content's `id`:

```tsx
<button
  aria-expanded={expanded}
  aria-controls="optional-section-content"
  onClick={onToggle}
>
  {expanded ? "Thu gọn" : "Xem thêm"}
  <motion.span
    animate={{ rotate: expanded ? 180 : 0 }}
    transition={{ duration: 0.2, ease: easeOutExpo }}
  >
    <ChevronDown />
  </motion.span>
</button>
```

ChevronDown rotation: 200ms ease-out-expo — tighter than the height
transition so the icon settles slightly before the content does, which
reads as "I caused the content to appear" rather than racing it.

## Anti-patterns

- ❌ Forgetting `overflow-hidden` on the motion wrapper (content
  flash on first measure)
- ❌ Animating `max-height` to a hardcoded large value (timing breaks
  for taller-than-expected content)
- ❌ Different timings across consumers for the "same" accordion
  pattern (drift; pull from `accordionExpand` always)
- ❌ Skipping `useReducedMotion` (a11y miss)
- ❌ Running the rotation chevron in the same transition block as the
  height (the icon should settle slightly before the content)

## See also

- `frontend/lib/motionVariants.ts` — `accordionExpand` source
- `frontend/components/Onboarding/OptionalSection.tsx` — canonical consumer
- `06-motion/framer-variants.md` — variant library overview
- `06-motion/motion-philosophy.md` — when to animate
