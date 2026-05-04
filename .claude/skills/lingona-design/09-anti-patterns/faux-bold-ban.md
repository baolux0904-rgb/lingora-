# Faux-bold ban

**Faux-bold** = the browser synthesises a bold appearance by smearing extra
pixels on a regular-weight glyph when the real bold weight isn't loaded.
Symptoms on a Vietnamese product like Lingona:

- Diacritics (`ă / â / ê / ô / ơ / ư / đ`) look muddy / smeared
- Letter spacing slightly off, especially around accent marks
- Subtly less crisp than properly-loaded bold; reads as "off" without
  the user being able to name why

## Rule

Every weight used in the UI must be explicitly loaded via
`next/font/google` in `frontend/app/layout.tsx`.

If a component uses `font-semibold` (600) or `font-bold` (700), the font
family must include those weights in its `weight: [...]` array. If the
weight isn't loaded, swap to a loaded weight or extend the loadout —
never let the browser fake it.

See `01-foundations/typography.md#font-weight-loadout-wave-6-sprint-35e`
for the current canonical loadout.

## Why

Vietnamese audience reads text with diacritics on every line. Muddy
faux-bold on `ă/â/ê/ô/ơ/ư/đ` characters reduces readability. Lingona is
an educational product where readability is core to user value — every
percentage point of diacritic crispness matters across thousands of
sentences.

## Detection

1. Browser DevTools → Network tab → filter `font/`
2. Open the page in question, observe which weights actually load
3. If the page CSS uses `font-semibold` (600) or `font-bold` (700) but
   only the 400 file loaded → faux-bold confirmed
4. Inspect the suspect element → Computed styles → check
   `font-synthesis-weight` (Chrome / Firefox both honour this)

## Fix

Add the missing weight to the `next/font/google` config in
`frontend/app/layout.tsx`:

```ts
const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],   // explicit weights
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});
```

Re-build (`next build`) and re-check the Network tab — the new weight
file should appear in the request list.

## Wave 6 Sprint 3.5E context

Pre-Sprint-3.5E: only the default weight 400 was loaded for both
DM Sans and Playfair Display. Anywhere the codebase used
`font-semibold` / `font-bold` (a lot of CTA + headline + label code) the
browser was synthesising bold — quietly degraded readability across
the entire app.

Sprint 3.5E commit (Mascot SVG + 240px + fonts + voice scrub + skill
update) expanded the loadout to:

- DM Sans: `400 / 500 / 600 / 700` + `normal + italic`
- Playfair Display: `400 / 700` + `normal + italic`

Result: every weight class used in UI now has a corresponding cut from
the actual font family. Vietnamese diacritics look as crisp as the
designer intended.

## See also

- `01-foundations/typography.md` — full font loadout + per-weight usage
  guidance
- `frontend/app/layout.tsx` — canonical implementation
