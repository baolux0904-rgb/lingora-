# Brand mode — Lingona's default mode

Brand mode = Lingona's **default**. Active 80% of app surface. Gamified register, peer voice mềm, Lintopus presence at moments, full color palette, dual font signature.

Most pages run brand mode unless specifically marked **brand-soft** (Practice) or **ielts-authentic** (Full Test/Battle Ranked).

## When brand mode is active

| Page | Why brand mode |
|------|----------------|
| Landing | Marketing surface, full personality |
| Login + Register | Auth = brand surface (KHÔNG exam) |
| Onboarding flow | First-touch, identity-heavy |
| /home dashboard | Primary doing surface |
| Speaking entry (mode-select) | Pre-task, brand presence |
| Writing entry | Pre-task |
| Reading entry | Pre-task |
| Listening entry | Pre-task |
| **Practice in-task (Speaking/Writing/Reading/Listening)** | Doing-mode, peer companion present |
| **Result page (all skills)** | Moment, Lintopus mandatory Soul §1 |
| Battle tab home | Pre-match brand surface |
| Battle queue | Waiting state, Lintopus thinking present |
| **Battle result** | Moment, Lintopus + drama register |
| Profile main | Identity surface |
| Settings | Utility but brand styled |
| Friends list + chat | Social surface |
| Achievement detail | Earned moment |
| Pro upgrade screen | Marketing surface |
| Empty states | Lintopus + peer copy |
| Error pages (404/500) | Lintopus recovery moments |

## Visual signals

### Palette (per `01-foundations/palette.md`)

```
Page bg:        #F8F7F4 cream warm-white
Primary text:   #1B2B4B navy
Body text:      gray-700 / gray-600
CTA:            #00A896 teal solid
Hover CTA:      #00C4B0 teal-light
Accent:         #FFD700 gold (achievement, badge)
Border:         gray-200 (subtle)
Card:           cream + border-gray-200
```

### Typography (per `01-foundations/typography.md`)

```
Body:        DM Sans regular/medium/semibold
Display:     Playfair Display Italic (hero, moment, signature numbers)
Pairing:     dual-font signature
Vietnamese:  full diacritics support
```

Headlines lean toward Playfair Italic for moments. Body always DM Sans.

### Layout (per `02-layout/desktop-canvas.md`)

```
Pattern C asymmetric (45% text + 38% visual + breathing)
1440px reference, 160px gutter, 1120px max-width
12-column grid
Whitespace : content per page type table
```

### Radius (per `01-foundations/radius-language.md`)

```
Buttons:     rounded-md (12px)
Cards:       rounded-lg (16px)
Hero cards:  rounded-xl/2xl (24px)
Avatars:     rounded-full
```

Mixed scale = brand signal (NOT v0 uniform `rounded-xl`).

### Mascot

Lintopus presence at moments per `03-components/mascot.md` placement matrix:

- ✅ Landing hero, Result pages, Onboarding, Battle moments
- ❌ NOT on dashboard primary, NOT on in-task focus, NOT on Pro upgrade
- 4 mood states (default/happy/thinking/sad)
- Bubble text optional 1-line peer voice

### Voice (per `00-manifesto/personality.md`)

```
Pronoun:     mình/bạn (peer)
Particles:   nhé / đi / cùng / với mình
Tone:        warm + rigorous + companion
Em-dash:     — used as breathing pause
Microcopy:   Vietnamese-first
```

### Motion (per `06-motion/*` — pending batch 7)

```
Subtle, smooth, ease-out
NO bounce / spring / dramatic
Tap scale 0.97
Stagger reveal 80ms
```

## Brand mode component manifest

When in brand mode, components render with full brand styling:

| Component | Brand mode style |
|-----------|------------------|
| `<Mascot>` | Full color SVG, all 4 moods available |
| `<PrimaryButton>` | Teal solid `bg-teal text-cream rounded-md` |
| `<Card>` | `bg-cream border-gray-200 rounded-lg p-6` |
| `<Modal>` | Cream + Playfair Italic title + warm backdrop `bg-navy/60` |
| `<ResultCard>` | Border-left dynamic + Playfair Italic score |
| `<BattleResult>` | Drama register VICTORY/DEFEAT Playfair bold |
| `<StreakRing>` | Teal stroke + Playfair Italic center |
| `<BandProgress>` | Teal progress + Playfair numbers |
| `<Toast>` | Cream + DM Sans + warm tone |
| `<Tooltip>` | Cream + DM Sans + minimal |
| Form input | `rounded-md border-gray-300 focus:border-teal` |
| Toggle/Switch | Custom component teal active state |
| Tag/Badge | Pill `rounded-full bg-teal-50 text-teal` |
| Loading spinner | Teal accent |

## Brand mode hero pattern

Landing hero, result page, onboarding screen — Pattern C asymmetric:

```tsx
<section className="px-40 py-24 bg-cream">
  <div className="max-w-[1120px] mx-auto">
    <div className="grid grid-cols-12 gap-6 items-center">
      <div className="col-span-7">
        <h1 className="text-5xl md:text-6xl font-display italic text-navy leading-tight">
          Cùng luyện IELTS<br />với mình
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-md">
          {value_prop_vietnamese_first}
        </p>
        <button className="mt-8 px-8 py-4 bg-teal text-cream rounded-md font-semibold">
          Bắt đầu luyện
        </button>
      </div>
      <div className="col-span-5 flex justify-end">
        <Mascot size={320} mood="happy" />
      </div>
    </div>
  </div>
</section>
```

Visual checklist:
- Page bg cream warm-white ✓
- Hero text Playfair Italic ✓
- Body DM Sans ✓
- CTA teal solid + cream text ✓
- Mascot presence + happy mood ✓
- Pattern C asymmetric ✓
- Vietnamese peer voice ✓

## Brand mode dashboard pattern

```tsx
<main className="px-12 py-8 bg-cream">
  <div className="max-w-[1280px] mx-auto">
    <header className="mb-8">
      <h1 className="text-3xl font-display italic text-navy">
        Chào {username}
      </h1>
      <p className="mt-2 text-base text-gray-600">
        Hôm nay luyện gì nhé?
      </p>
    </header>
    
    {/* Streak + XP + Level row */}
    <div className="grid grid-cols-3 gap-6 mb-8">
      <StreakRing current={streak} size={120} />
      <XPCard xp={todayXP} goal={dailyGoal} />
      <LevelCard level={level} progress={levelProgress} />
    </div>
    
    {/* Skill grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <SkillCard skill="speaking" lastBand={6.5} />
      <SkillCard skill="writing" lastBand={6.0} />
      <SkillCard skill="reading" lastBand={7.0} />
      <SkillCard skill="listening" lastBand={6.5} />
    </div>
  </div>
</main>
```

KHÔNG có Lintopus dominant on dashboard (per placement matrix — implicit via achievement/streak presence, NOT explicit mascot floating).

## Brand mode form pattern

```tsx
<form className="space-y-4 max-w-md mx-auto">
  <label className="block">
    <span className="text-sm font-medium text-navy">Username</span>
    <input
      type="text"
      className="
        mt-1 block w-full
        px-4 py-2.5 rounded-md
        bg-cream border border-gray-300
        focus:border-teal focus:ring-1 focus:ring-teal
        text-base text-navy font-sans
      "
    />
  </label>
  
  <button type="submit" className="primary-button w-full">
    Cập nhật
  </button>
</form>
```

Form styling = brand canon. KHÔNG sterile native HTML.

## Brand mode result page anatomy

Per `02-layout/result-page-anatomy.md`:

```tsx
<main className="bg-cream py-12">
  <div className="max-w-[1120px] mx-auto px-12">
    {/* L1 — Big band moment */}
    <div className="grid grid-cols-12 gap-6 mb-24">
      <div className="col-span-7">
        <span className="text-6xl font-display italic text-navy">
          {band.toFixed(1)}
        </span>
        <p className="mt-4 text-xl text-gray-600">
          {skillContext}
        </p>
      </div>
      <div className="col-span-5 flex justify-end">
        <Mascot
          size={120}
          mood={getMoodFromBand(band)}
          bubble={getBandBubble(band)}
        />
      </div>
    </div>
    
    {/* L3 — Sub-skill cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-24">
      {subSkills.map(skill => <ResultCard {...skill} />)}
    </div>
    
    {/* L3 — Detailed feedback prose */}
    <DetailedFeedback feedback={detailed} />
    
    {/* Action row */}
    <div className="mt-12 flex items-center gap-6">
      <button className="primary-button">Luyện tiếp</button>
      <a href="/skill/history" className="text-teal-dark hover:underline">
        Xem lịch sử →
      </a>
    </div>
  </div>
</main>
```

## Brand mode CSS context

Brand mode = root document context (default). NO mode wrapper needed — CSS variables resolve to brand canon by default.

```tsx
// _app.tsx OR layout.tsx (root)
<html data-mode="brand">
  <body className="bg-cream text-navy font-sans">
    {children}
  </body>
</html>
```

Mode swap via `data-mode` attribute on root or section wrapper. CSS variables conditional:

```css
/* globals.css */
:root,
[data-mode="brand"] {
  --color-bg-page: #F8F7F4;       /* cream warm */
  --color-text-primary: #1B2B4B;   /* navy */
  --color-cta: #00A896;            /* teal */
  --font-body: var(--font-dm-sans);
  --font-display: var(--font-playfair);
  --radius-button: 12px;
  --radius-card: 16px;
}
```

See `04-modes/mode-switch-rules.md` for runtime swap mechanism.

## Anti-patterns brand mode

❌ Pure white page bg (`bg-white`) — use cream `#F8F7F4`
❌ Inter font sneaked in — DM Sans only for body
❌ Single-font setup (drop Playfair) — kill dual-font signature
❌ Generic SaaS template patterns (mock chat window hero, countdown banner, fake testimonial)
❌ English microcopy default — Vietnamese-first
❌ Symmetric layout default (Pattern A) — use Pattern C asymmetric
❌ Uniform `rounded-xl` everywhere — use mixed scale
❌ Lintopus on every page (over-presence) — placement matrix
❌ Cartoon physics / spring bounce / scale jiggle (anti per personality.md)
❌ Heavy shadows / glassmorphism (flat design)
❌ Native HTML toggle/select inside brand surface (use custom components)

## Audit checklist brand mode page

```
1. Page bg cream warm-white? ✓
2. Primary text navy (NOT gray-900)? ✓
3. Body DM Sans, display Playfair Italic? ✓
4. CTA teal solid (NOT gradient)? ✓
5. Asymmetric Pattern C on hero? ✓
6. Mascot present at appropriate placement? ✓
7. Vietnamese peer voice? ✓
8. Mixed radius scale (md button + lg card + xl hero)? ✓
9. NO mock chat window, NO countdown banner, NO fake stats? ✓
10. NO bounce / spring / scale jiggle? ✓
11. WS:content ratio per page type table? ✓
12. 100ft test 5-signal pass? ✓
```

## See also

- `00-manifesto/*` — full brand identity (4 file)
- `01-foundations/*` — palette + typography + space + radius
- `02-layout/*` — desktop canvas + result anatomy
- `03-components/*` — component manifest brand mode
- `04-modes/brand-soft.md` — bridge mode
- `04-modes/ielts-authentic.md` — exam mode
- `04-modes/mode-switch-rules.md` — runtime swap
