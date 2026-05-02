# Study4 reference — what we borrow (IELTS authenticity)

Study4 (study4.com) — Vietnamese IELTS prep platform. Per Wave 6 audit: **18/35** score (same as Lingona current). Target audience overlap: Vietnamese IELTS learners.

## Why reference

Study4 nails **IELTS exam authenticity feel** — Cambridge-style content, recognizable to Vietnamese learners who've taken IELTS courses. Lingona's `ielts-authentic` mode borrows this register.

NHƯNG Study4 also has anti-patterns (corporate Vietnamese voice, cluttered UI, ads). Lingona must NOT borrow those.

## What we borrow (3 things)

### 1. Cambridge-faithful exam UI (in IELTS-authentic mode)

Study4 mimics Cambridge IELTS computer-delivered test interface: Georgia/Arial fonts, parchment-cream bg, sharp rectangular answer cells, English neutral UI.

Lingona's IELTS-authentic mode:
```
- bg #F5EFDC parchment cream
- text #1A1A1A near-black
- font Georgia (passage) + Arial (UI)
- rounded-none answer cells
- English neutral microcopy (Submit / Flag / Bookmark)
- no teal, no Lintopus, no animations
```

Per `04-modes/ielts-authentic.md`. Study4's exam feel = reference.

### 2. IELTS-specific content density

Study4 displays Cambridge-style Reading passage (long text, dense paragraphs A/B/C/D labeled) + question grid (multiple types: MCQ/TFNG/Matching/Heading) — high content density per page.

Lingona equivalent:
```
- Reading Full Test page: 50/50 split (passage left + questions right)
- Cambridge paragraph labeling
- Multiple question types per passage
- Compact answer fields
```

Per `02-layout/grid-vs-flow.md` (Reading uses 50/50 grid).

### 3. Vietnamese audience IELTS framing

Study4 speaks to Vietnamese IELTS learners specifically. Mentions Cambridge 14, Cam 17, Test 1/2/3/4 conventions Vietnamese learners recognize.

Lingona equivalent:
```
- Reference Cambridge tests (10/11/12/14 verified in codebase)
- Test structure: Practice + Full Test (Vietnamese learner expectation)
- Speaking parts 1/2/3, Writing Task 1/2 (Cambridge convention)
- Listening Section 1/2/3/4
```

Vietnamese IELTS learners trust Cambridge content. Lingona authenticates by using same.

## What we DON'T borrow (5 things)

### 1. Corporate Vietnamese voice

Study4 uses corporate VN: "Quý khách / Vui lòng / Trân trọng cảm ơn".

Per `09-anti-patterns/corporate-translate.md`:

```
❌ "Vui lòng đăng nhập để có thể truy cập"
✅ "Đăng nhập nhé"

❌ "Quý khách đã đạt..."
✅ "Bạn đã đạt..."
```

Lingona = peer voice mềm. KHÔNG corporate.

### 2. Cluttered dashboard with ads

Study4 dashboard: ads banners + multiple promo blocks + many feature widgets simultaneously. Visual noise.

Per `02-layout/empty-space-philosophy.md`:

```
Lingona dashboard = clean 3-row stats + 4-col skill grid.
NO ads, NO promo banners, NO clutter.
```

Restraint = signal.

### 3. Free tier cluttered with watermarks/CTAs

Study4 free tier shows watermarks, "Unlock with Premium" buttons constantly, popup upgrade prompts.

Per `00-manifesto/personality.md`:

```
Lingona free tier = honest functional access.
Pro upgrade discoverable via Settings, NOT pop-up spam.
NO watermarks on free user content.
NO interrupting prompts.
```

Per `05-voice/never-say-list.md#9` (manipulation/dark patterns). NO FOMO upsell.

### 4. Generic SaaS landing template

Study4 landing has typical SaaS patterns: feature card grid + "Trusted by" + testimonial carousel + pricing table generic style.

Per `09-anti-patterns/ai-generated-smell.md`:

```
❌ Generic feature card grid (Fast/Smart/Secure pillars)
❌ "Trusted by 10,000+ students"
❌ Testimonial carousel

✅ Pattern C asymmetric hero with Lintopus
✅ Specific feature claims (NOT vague pillars)
✅ Honest pre-launch framing (no fake stats)
```

### 5. Cold UI — no peer companion

Study4 UI is functional but cold. No mascot, no peer voice, no warmth. User feels they're using a "test prep tool", not learning with a companion.

Lingona advantage:
```
✅ Lintopus mascot present at moments
✅ Peer voice mềm (bạn cùng lớp)
✅ Warm cream palette (NOT corporate gray)
✅ Em-dash signature breathing
```

Per `00-manifesto/visual-vocabulary.md` warm + rigorous + companion. Study4 has rigorous, lacks warm + companion.

## Score breakdown — Study4 vs Lingona Wave 6

| Dimension | Study4 | Lingona current | Lingona Wave 6 target |
|-----------|--------|-----------------|----------------------|
| IELTS authenticity | 5/5 | 3/5 | 5/5 |
| Content density (exam pages) | 4/5 | 3/5 | 4/5 |
| Vietnamese audience fit | 4/5 | 4/5 | 5/5 |
| Visual restraint | 2/5 | 2/5 | 5/5 |
| Mascot/personality | 0/5 | 4/5 | 5/5 |
| Voice (peer vs corporate) | 1/5 | 5/5 | 5/5 |
| Dashboard clarity | 2/5 | 3/5 | 5/5 |
| **Total** | **18/35** | **18/35** | **34/35** |

Lingona Wave 6 target: borrow Study4 IELTS authenticity + own peer voice + Lintopus + restraint + clean dashboard = strongest combination.

## Mode-specific borrowing

Study4 reference applies **only to ielts-authentic mode**:

```
Brand mode:        DO NOT borrow Study4 (Lingona = peer voice + Lintopus, opposite)
Brand-soft mode:   PARTIAL borrow (content density during exam in-task)
ielts-authentic:   FULL borrow (Cambridge feel)
```

Authentic mode = Lingona's "Study4 territory" with Cambridge faithful UX.

## See also

- `00-manifesto/visual-vocabulary.md` — warm + rigorous + companion (Study4 has rigorous, lacks warm + companion)
- `04-modes/ielts-authentic.md` — Cambridge mode specification
- `01-foundations/typography.md` — Georgia/Arial swap in authentic
- `01-foundations/palette.md` — parchment cream override in authentic
- `01-foundations/radius-language.md` — sharp Cambridge in authentic
- `02-layout/grid-vs-flow.md` — Reading 50/50 split
- `09-anti-patterns/corporate-translate.md` — anti corporate VN voice
- `09-anti-patterns/ai-generated-smell.md` — anti generic SaaS
- `11-references/jschallenger-extract.md` — sober content density
- `11-references/duolingo-extract.md` — gamification reference
- `11-references/what-we-borrow.md` — synthesis
