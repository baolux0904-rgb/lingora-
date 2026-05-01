# Recognizable from 100 feet

The "100ft test": nếu chụp screenshot Lingona page, mở 1 second, đóng lại — user có recognize đó là **Lingona** không, KHÔNG phải Duolingo / Study4 / generic IELTS app?

Nếu KHÔNG, identity chưa lock. Nếu CÓ, 5 thứ dưới đây đang work.

## The 5 identifiers

Lingona phải có **ít nhất 4/5** signal sau visible trong mỗi screenshot critical (landing, /home, result page, Battle, Onboarding):

### 1. Lintopus mascot (COMPANION signal)

Lintopus = the unmistakable visual anchor. Không Duolingo Owl (cartoon), không stock illustration (generic), không emoji decorative.

**Critical pages MUST have Lintopus visible**:
- Landing hero
- Onboarding screens
- Result pages (Battle ✅, Reading + Writing + Speaking ❌ Wave 6 fix)
- Level-up / Rank-up overlay
- Error / 404 / 500
- Achievement unlock

**Non-critical pages**: optional or absent (Practice in-task, Settings, Profile main).

**Identity test**: che hết text, chỉ còn Lintopus shape + palette → still recognizable as Lingona? YES = pass.

### 2. Navy + Teal + Cream signature palette (WARM signal)

3 color combo recognizable:

```
Navy   #1B2B4B   — primary text, header, serious accent
Teal   #00A896   — primary action, achievement, encourage
Cream  #F7F4EC   — page background, breathing space
```

KHÔNG bright Duolingo green. KHÔNG cool Linear black-white. KHÔNG Cambridge blue (too institutional).

**Identity test**: pixel-pick 3 dominant colors từ screenshot. Nếu match navy + teal + cream (or close enough cream variants `#F8F7F4`, `#F5EFDC`) → pass.

**Drift kill** (per `09-anti-patterns/drift-kill-list.md`):
- ❌ Purple `#8B71EA` (drift Onboarding gradient — Wave 6 fix)
- ❌ Coral `#F07167` (drift, source unknown)
- ❌ Purple `#7E4EC1` (drift)
- ❌ Light teal `#2DD4BF` (NOT in tailwind.config — drift)
- ❌ `bg-emerald-500` over-use (40 hits) — replace with `bg-teal-*`
- ❌ `bg-amber-500` over-use (32 hits) — review case-by-case

### 3. DM Sans + Playfair Display dual font (WARM + RIGOROUS signal)

Two-font signature distinct:

- **DM Sans** — body text, UI labels, microcopy, button text (humanist sans, KHÔNG geometric Inter)
- **Playfair Display Italic** — display headlines, hero copy, "moment" text (serif italic accent, recognizable signature)

KHÔNG Inter alone (v0 default cold). KHÔNG single-font setup. KHÔNG monospace (developer cold). KHÔNG Feather Bold (Duolingo).

**Identity test**: zoom screenshot 200%, find any heading. Có Playfair Italic accent? Có DM Sans body? → pass.

**Caveat**: in IELTS-authentic mode (Full Test + Battle Ranked), font swap to **Georgia + Arial** (Cambridge faithful). Đây là intentional mode-switch, KHÔNG drift. See `04-modes/ielts-authentic.md`.

### 4. Em-dash rhythm + peer particles (WARVoice signal)

Vietnamese-first peer voice với 2 signature pattern:

- **Em-dash (`—`)** rhythm: `"Hết giờ — nộp bài tự động"`, `"Band 7 — vững rồi đấy"`, `"Top 10% — Lintopus tự hào lắm"`
- **Peer particle**: `nhé`, `cùng`, `với mình`, `đi`, `ha`

KHÔNG corporate "Quý khách lưu ý". KHÔNG translate-from-EN "Get Started" → "Bắt đầu" raw. KHÔNG "Don't worry" theatre.

**Identity test**: read 3 random microcopy strings. Có ≥1 em-dash? Có ≥1 peer particle? → pass.

**Codebase verified samples**:
- `"Cùng luyện IELTS với mình trên Lingona nhé!"` (share text)
- `"Hết giờ — tùy bạn quyết tiếp"` (Practice timer)
- `"Lintopus tự hào lắm! 🐙🎉"` (LevelUp)

### 5. Asymmetric desktop layout với generous breathing (RIGOROUS layout signal)

KHÔNG center-stack v0 layout. KHÔNG cramped corner-trên-trái + 80% empty (Louis call out).

**Lingona desktop signature** = **asymmetric balanced (Pattern C)**:

```
┌──────────────────────────────────────────────────────────┐
│   ←160px gutter→                                         │
│                                                          │
│   ┌───────────────────────┐    ┌──────────────┐         │
│   │  Hero text 45% width  │    │   Lintopus   │         │
│   │  Headline (Playfair)  │    │   visual     │         │
│   │  Sub copy (DM Sans)   │    │   38% width  │         │
│   │  [Primary CTA teal]   │    │   ●          │         │
│   └───────────────────────┘    └──────────────┘         │
│                                                          │
│   ←content max 1120px center→     ←160px gutter→         │
└──────────────────────────────────────────────────────────┘
```

- Content max-width 1120px center
- Side gutter ≥ 160px mỗi bên (1440px reference)
- Vertical rhythm 96/48/24px (section / sub-section / card)
- **Asymmetric balance** — text 45% bên trái-trên + visual mass 38% bên phải. KHÔNG perfect-center symmetric.
- Whitespace as confidence (≥30% of viewport intentional negative space)
- Total content cluster ~83% width = focused. Remaining 17% = gutter + breath.

**Identity test**: measure screenshot. Content cluster <60% center-stack? Hero text + visual side-by-side asymmetric? Side gutter visible? → pass.

**Anti** (Pattern A symmetric + Pattern B cramped):
- ❌ Hero image full-bleed corner-to-corner
- ❌ 3-column features grid edge-to-edge
- ❌ Center-stack: text căn giữa + button căn giữa + 3 features đều nhau (v0 default)
- ❌ Cramped form 360px-wide trong 1440px viewport (mobile-port to desktop)
- ❌ Single CTA centered with floating background pattern (v0 template)
- ❌ Text dồn góc trên-trái, 65%+ screen empty (lazy mobile-port)

**Mobile fallback** (per `02-layout/mobile-rhythm.md` pending): asymmetric collapse → single column scroll, hero text trước, Lintopus dưới (NOT side-by-side mobile).

## The 100ft test in practice

**Test 1 — Landing**:

| Signal | Present? |
|--------|----------|
| Lintopus visible? | ✅ should be hero |
| Navy + Teal + Cream palette? | ✅ |
| DM Sans + Playfair? | ✅ |
| Em-dash + peer particle in copy? | ✅ |
| Asymmetric layout, breathing space? | ✅ |

**Result**: 5/5 → pass.

**Test 2 — Reading Practice in-task**:

| Signal | Present? |
|--------|----------|
| Lintopus visible? | ❌ (intentional — Lintopus absent during task focus) |
| Navy + Teal + Cream palette? | ✅ |
| DM Sans (body) + Playfair (passage title)? | ✅ |
| Em-dash + peer particle? | ✅ (timer + question copy) |
| Layout: split 2-column passage/questions? | ✅ |

**Result**: 4/5 → pass (Lintopus intentional absence is OK, ≥4/5 passes).

**Test 3 — Reading Result page (currently)**:

| Signal | Present? |
|--------|----------|
| Lintopus visible? | ❌ Wave 6 fix mandatory |
| Navy + Teal + Cream palette? | ✅ |
| DM Sans + Playfair? | ✅ |
| Em-dash + peer particle? | ✅ |
| Asymmetric layout, breathing space? | TBD |

**Result**: 3/5 (or 4/5) → FAIL or borderline. Wave 6 fix Lintopus mandatory.

**Test 4 — Full Test in-task (IELTS-authentic mode)**:

| Signal | Present? |
|--------|----------|
| Lintopus visible? | ❌ (intentional — exam-real, no decoration) |
| Cream `#F5EFDC` + navy + yellow highlight? | ✅ (mode-specific palette) |
| Georgia + Arial? | ✅ (mode-specific font) |
| Em-dash + peer particle? | minimal (mode-specific reduce voice) |
| Reading split 2-column Cambridge-faithful? | ✅ |

**Result**: pass (mode-specific identity — IELTS-authentic mode has DIFFERENT 100ft signal: cream + Georgia + minimal voice + Cambridge layout). KHÔNG apply brand 100ft test to authentic mode — they have separate identity test.

## Mode-specific identity tests

### Brand mode 100ft test (default, gamified)

5 signals như trên (Lintopus + Navy/Teal/Cream + DM Sans/Playfair + em-dash/peer + asymmetric breathing).

### Brand-soft mode 100ft test (Practice)

4 signals:
- Cream-leaning palette (cream stronger, navy/teal lighter accent)
- DM Sans dominant (Playfair occasional)
- Lintopus optional (per-page decision)
- Em-dash + peer particle present

### IELTS-authentic mode 100ft test (Full Test + Battle Ranked)

4 signals (DIFFERENT from brand):
- Cream `#F5EFDC` + Navy + Yellow highlight `#FFEB3B`
- Georgia + Arial (Cambridge faithful)
- Cambridge-style layout (split 2-column reading, exact-width passage)
- Minimal voice (timer urgent + system messages, NOT peer voice intrusive)

## Failure modes

If a Lingona page **fails 100ft test**, root cause typically:

1. **Lintopus missing where Soul §1 mandates** — fix per `03-components/mascot.md`
2. **Drift hex hardcoded** — kill per `09-anti-patterns/drift-kill-list.md`
3. **Single-font setup** — add Playfair accent per `01-foundations/typography.md`
4. **Translate-from-EN copy** — rewrite per `05-voice/microcopy-library.md`
5. **Mobile layout port to desktop without breathing** — refactor per `02-layout/desktop-canvas.md`

## See also

- `00-manifesto/personality.md` — voice (signal 4)
- `00-manifesto/visual-vocabulary.md` — 3-word essence (warm + rigorous + companion)
- `00-manifesto/what-we-are-not.md` — boundary list
- `02-layout/desktop-canvas.md` — layout signal (signal 5)
- `01-foundations/palette.md` — color signal (signal 2)
- `01-foundations/typography.md` — font signal (signal 3)
- `03-components/mascot.md` — Lintopus signal (signal 1)
- `04-modes/*` — mode-specific identity tests
