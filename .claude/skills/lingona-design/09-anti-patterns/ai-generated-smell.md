# AI-generated smell — template tells to kill

Patterns that signal "AI generated this landing page" or "v0 / shadcn template applied". Lingona = real product with character. KHÔNG generic SaaS.

Per Wave 6 audit (Landing 4/10): Lingona's landing currently exhibits multiple AI-template smells. Wave 6 redesign mandate: kill ALL signals from this list.

## 1. The Mock Chat Window

**Smell**: Hero section shows fake AI chat conversation. Pre-written messages "User: Help me with IELTS" → "AI: Of course! Let me help..."

```tsx
// ❌ AI-template smell — the dreaded mock chat
<div className="rounded-xl border bg-white shadow-2xl p-6 max-w-md">
  <div className="space-y-3">
    <div className="bg-gray-100 rounded-lg p-3">
      <p className="text-sm">Hi! How can I help with IELTS?</p>
    </div>
    <div className="bg-blue-500 text-white rounded-lg p-3 ml-12">
      <p className="text-sm">I want to improve my Speaking</p>
    </div>
    <div className="bg-gray-100 rounded-lg p-3">
      <p className="text-sm">Great! Let's start with...</p>
    </div>
  </div>
</div>
```

Why anti:
- Generic AI startup template (every AI tool from 2023 used this)
- Fake conversation = doesn't represent actual product
- User's first impression = "another ChatGPT wrapper"
- KHÔNG show Lingona's actual character (Lintopus, peer voice, IELTS focus)

✅ Replace with: real mascot (Lintopus 320px) + Vietnamese headline + actual CTA. Per `02-layout/desktop-canvas.md` Pattern C asymmetric.

## 2. Generic SaaS countdown banner

**Smell**: "🔥 LIMITED OFFER — 24h LEFT — 50% OFF" sticky banner top of page.

```tsx
// ❌ AI-template smell
<div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 text-center">
  <p className="text-sm font-bold">
    🔥 ƯU ĐÃI LAUNCH! Chỉ còn 23:59:42 — Giảm 50% gói Pro!
  </p>
</div>
```

Why anti:
- Manipulative urgency (per `05-voice/never-say-list.md#9` — manipulation/dark patterns)
- Generic SaaS marketing template
- Fake countdown (resets every visit)
- Lingona = honest paywall, KHÔNG manipulation

✅ Replace with: actual launch date countdown (09/07/2026) bottom of page, factual not aggressive:

```tsx
<div className="text-center text-sm text-gray-600 py-4">
  Lingona ra mắt chính thức 09/07/2026 — đăng ký sớm để giữ chỗ
</div>
```

## 3. Generic feature card grid (icon + title + 1-line)

**Smell**: 3-column grid of feature cards each with icon + title + 1 generic sentence.

```tsx
// ❌ Generic SaaS feature grid
<div className="grid grid-cols-3 gap-6">
  <div className="text-center">
    <Icon className="w-12 h-12 mx-auto" />
    <h3>Fast</h3>
    <p>Get instant feedback in seconds</p>
  </div>
  <div className="text-center">
    <Icon className="w-12 h-12 mx-auto" />
    <h3>Smart</h3>
    <p>AI-powered learning experience</p>
  </div>
  <div className="text-center">
    <Icon className="w-12 h-12 mx-auto" />
    <h3>Secure</h3>
    <p>Your data is safe with us</p>
  </div>
</div>
```

Why anti:
- "Fast / Smart / Secure" = stock startup pillars
- Icons centered + 1-line copy = template
- KHÔNG specific to IELTS or Lingona
- KHÔNG character

✅ Replace with: specific Lingona value props + Pattern C asymmetric layout + specific copy:

```tsx
<section className="grid grid-cols-12 gap-6 py-24">
  <div className="col-span-7">
    <h2 className="text-4xl font-display italic">
      Phản hồi cụ thể — không chung chung
    </h2>
    <p className="mt-6 text-lg text-gray-700 max-w-md">
      Mình chấm Writing theo 4 tiêu chí IELTS với 3 lần multi-sampling
      để giảm noise. Bạn nhận được điểm + lý do từng tiêu chí.
    </p>
  </div>
  <div className="col-span-5">
    <ResultCardPreview />
  </div>
</section>
```

Specific feature, specific number (3 lần multi-sampling), Vietnamese voice, asymmetric.

## 4. The "Trusted by..." logo wall

**Smell**: Section "Trusted by 2000+ students worldwide" with company logos.

```tsx
// ❌ AI-template smell
<section className="py-16 text-center">
  <p className="text-sm text-gray-500 uppercase">Trusted by students from</p>
  <div className="grid grid-cols-6 gap-8 mt-6 opacity-60">
    <img src="/harvard.svg" />
    <img src="/mit.svg" />
    {/* ... fake or unrelated logos */}
  </div>
</section>
```

Why anti:
- Fake credibility (per `09-anti-patterns/fake-stats-ban.md`)
- Vietnamese students don't validate by Harvard logo
- Generic startup template (every AI startup has this section)

✅ Replace with: skip entirely OR use specific real social proof when available:

```tsx
{/* Real beta testers count when launch */}
<p className="text-sm text-gray-600">
  {realBetaCount} người đang dùng Lingona ở giai đoạn beta
</p>
```

Honest > fake.

## 5. Floating glassmorphism cards

**Smell**: Cards with `backdrop-blur-md bg-white/30 border border-white/40 shadow-2xl` floating.

```tsx
// ❌ AI-template smell — glassmorphism overuse
<div className="
  backdrop-blur-md
  bg-white/30
  border border-white/40
  rounded-2xl
  shadow-2xl
  p-8
">
  Feature card
</div>
```

Why anti:
- 2021-2023 design fad
- Hard to read content (transparency reduces contrast)
- Trendy not timeless
- Phá Lingona warm cream palette

✅ Replace with: solid cream cards per `03-components/card-language.md`:

```tsx
<div className="bg-cream border border-gray-200 rounded-lg p-6 shadow-sm">
  Feature card
</div>
```

Subtle shadow, solid bg, defined border.

## 6. Gradient text everywhere

**Smell**: Headlines with `bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent`.

```tsx
// ❌ AI-template smell
<h1 className="
  text-5xl font-bold
  bg-gradient-to-r
  from-blue-500 via-purple-500 to-pink-500
  bg-clip-text
  text-transparent
">
  Revolutionize Your IELTS Journey
</h1>
```

Why anti:
- Generic AI/Web3 startup vibe
- Color outside palette canon (per `01-foundations/palette.md` — drift kill list)
- Reduces readability
- Doesn't fit Lingona warm/rigorous identity

✅ Replace with: solid navy + Playfair Italic per `01-foundations/typography.md`:

```tsx
<h1 className="text-5xl font-display italic text-navy">
  Cùng luyện IELTS với mình
</h1>
```

Italic = signature. Solid color = authority.

## 7. Floating gradient blobs background

**Smell**: Hero bg has 3-4 large blurred gradient blobs floating, animated.

```tsx
// ❌ AI-template smell
<div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 opacity-30 blur-3xl rounded-full" />
<div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500 opacity-30 blur-3xl rounded-full" />
<div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 opacity-30 blur-3xl rounded-full" />
```

Why anti:
- v0 / shadcn template default
- Ambient noise without meaning
- Performance hit (large blur)
- Visual noise

✅ Replace with: cream solid bg + Lintopus mascot as visual anchor.

## 8. The Generic Hero Phrase

**Smell**: H1 copy that's been written 10000 times before.

| ❌ Generic | ✅ Lingona |
|-----------|-----------|
| "Revolutionize your IELTS prep" | "Cùng luyện IELTS với mình" |
| "Master IELTS with AI" | "Mình giúp bạn từ Band 5.0 đến 7.5+" |
| "Take your IELTS to the next level" | "Phản hồi cụ thể — không cảm tính" |
| "Unlock your IELTS potential" | (skip — banned cliché) |
| "The future of IELTS prep" | (skip — banned cliché) |
| "AI-powered IELTS coach" | (skip — generic AI marketing) |

Per `05-voice/never-say-list.md#4` AI-template smell list. Search this file when writing landing copy.

## 9. Stats animated on scroll (when fake)

**Smell**: "Join 10,000+ learners 🚀 Average score: 7.5 ⭐ 99% satisfaction"

When stats are made up → anti. When stats are real → OK.

```tsx
// ❌ Fake stats anti
<section className="grid grid-cols-3 text-center">
  <div>
    <span className="text-5xl font-bold">10,000+</span>
    <p>Learners</p>
  </div>
  <div>
    <span className="text-5xl font-bold">7.5</span>
    <p>Avg Band</p>
  </div>
  <div>
    <span className="text-5xl font-bold">99%</span>
    <p>Satisfaction</p>
  </div>
</section>
```

Lingona pre-launch: NO stats. Real beta count when launches → use specific real number. Per `09-anti-patterns/fake-stats-ban.md`.

## 10. "As Seen On" press logos

**Smell**: Strip of news outlet logos (TechCrunch, Forbes, etc.) when product hasn't been featured.

Lingona has not been featured. Don't add logos. When real press → use real.

## 11. Founder photo + quote section

**Smell**: "Meet our founder" big photo + inspirational quote about "transforming education".

```tsx
// ❌ AI-template smell
<section className="text-center py-24">
  <img src="/founder.jpg" className="w-32 h-32 rounded-full mx-auto" />
  <blockquote className="mt-6 text-2xl italic max-w-2xl mx-auto">
    "We believe in transforming the way people learn languages."
  </blockquote>
  <p className="mt-2 font-semibold">— Founder Name, CEO</p>
</section>
```

Why anti:
- Self-important
- Inspirational quote = cliché
- Doesn't add value (unless founder story is genuinely interesting)

Lingona founder Louis = solo founder Vietnamese student. **Could be authentic** with right framing — but skip for v1 launch. Add later if becomes part of brand story.

## 12. Pricing tier with arbitrary "Most Popular" Sticker

**Smell**: 3 pricing tiers, middle one has "Most Popular ⭐" badge with rainbow gradient.

```tsx
// ❌ Anti — gradient + crown emoji
<div className="rounded-2xl border-2 bg-gradient-to-br from-yellow-300 to-orange-400 ...">
  <div className="absolute -top-4 left-1/2 ...">
    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full">
      ⭐ Most Popular
    </span>
  </div>
</div>
```

Why anti:
- Gradient (palette violation)
- Emoji decoration
- "Most Popular" = sales psychology cliché

✅ Replace with: subtle solid teal border highlight + factual VN copy per `03-components/card-language.md`:

```tsx
<div className="bg-cream border-2 border-teal rounded-xl p-8 relative">
  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
    <span className="px-3 py-1 bg-teal text-cream text-xs font-semibold rounded-full">
      Tiết kiệm nhất
    </span>
  </div>
  {/* tier content */}
</div>
```

"Tiết kiệm nhất" = factual claim about price (not psychology).

## 13. Rotating testimonial carousel with stock photos

**Smell**: Auto-rotating carousel, fake testimonials with stock photos labeled "Sarah, Designer at Google".

```tsx
// ❌ Fake testimonials with stock photos
<div className="carousel">
  <div className="testimonial">
    <img src="/stock-asian-woman.jpg" />
    <p>"Lingona changed my life!"</p>
    <span>— Sarah, Engineer at Microsoft</span>
  </div>
</div>
```

Why anti:
- Fake testimonial fraud
- Stock photo = generic
- KHÔNG real proof

Lingona pre-launch: skip testimonial section. When real beta tester quotes available + permission → use with real photo + real name.

## 14. Animated typewriter text reveal

**Smell**: Hero headline reveals letter by letter with blinking cursor.

```tsx
// ❌ Anti per `06-motion/motion-philosophy.md`
"Cùng luyện IELTS với mình|"  // typewriter effect
```

Why anti:
- Slow (user waits to read)
- Cliché
- Hurts LCP web vital
- Animation without earned moment

✅ Static headline + reveal Lintopus and CTA via stagger.

## 15. "Try for free" + "No credit card required" stack

**Smell**: 2 stacked CTAs "Try Free" / "No CC required" / "Cancel anytime".

```tsx
// ❌ SaaS template stack
<div className="text-center">
  <button className="primary-button-large">Try Free for 14 Days</button>
  <p className="text-sm text-gray-500 mt-2">No credit card required</p>
  <p className="text-xs text-gray-400">Cancel anytime</p>
</div>
```

Why anti:
- Generic SaaS
- "No CC required" = SaaS template phrase
- Hierarchy noise

✅ Replace with single direct CTA + 1 line context if needed:

```tsx
<button className="primary-button-large">Bắt đầu luyện</button>
<p className="text-sm text-gray-600 mt-3">Free tier không cần thẻ</p>
```

Direct, specific, Vietnamese.

## Detection grep checklist

Before commit, grep landing for these tells:

```bash
# In frontend/app/(public)/page.tsx + components/landing/
grep -n "trusted by" frontend/components/landing/*
grep -n "Trusted by" frontend/components/landing/*
grep -n "revolutionize" frontend/components/landing/*
grep -n "transform your" frontend/components/landing/*
grep -n "the future of" frontend/components/landing/*
grep -n "AI-powered" frontend/components/landing/*
grep -n "next level" frontend/components/landing/*
grep -n "as seen on" frontend/components/landing/*
grep -n "backdrop-blur" frontend/components/landing/*
grep -n "from-.*-via-.*-to-" frontend/components/landing/*  # gradient text
grep -n "blur-3xl" frontend/components/landing/*  # blur blobs
grep -n "Most Popular" frontend/components/landing/*  # may need VN swap
grep -n "10,000+\|99%\|10000+" frontend/components/landing/*  # fake stats
```

If any hit → review + likely replace per this guide.

## Audit checklist AI smell

```
1. NO mock chat window in hero? ✓
2. NO countdown banner with fake urgency? ✓
3. NO "Trusted by" logo wall (unless real)? ✓
4. NO glassmorphism cards (backdrop-blur on cards)? ✓
5. NO gradient text (`bg-clip-text`)? ✓
6. NO floating gradient blobs background? ✓
7. NO generic hero phrases ("Revolutionize", "Transform")? ✓
8. NO fake stats / "Join 10,000+"? ✓
9. NO "As Seen On" press logos (unless real)? ✓
10. NO founder photo + inspirational quote (skip v1)? ✓
11. NO rainbow "Most Popular" badge? ✓
12. NO fake testimonials with stock photos? ✓
13. NO typewriter text animation? ✓
14. NO "No credit card required" SaaS stack? ✓
```

## See also

- `00-manifesto/what-we-are-not.md` — anti-positions
- `01-foundations/palette.md` — drift kill list (no gradient text colors)
- `02-layout/desktop-canvas.md` — Pattern C asymmetric (vs symmetric template)
- `03-components/card-language.md` — solid card vs glassmorphism
- `05-voice/never-say-list.md#4` — AI-template phrase kill-list
- `09-anti-patterns/fake-stats-ban.md` — fake testimonials/stats
- `09-anti-patterns/drift-kill-list.md` — color drift catalog
- `09-anti-patterns/corporate-translate.md` — corporate VN tells
- `06-motion/motion-philosophy.md` — anti-typewriter reveal
- `11-references/v0-template-extract.md` — what NOT to copy from v0 (pending)
