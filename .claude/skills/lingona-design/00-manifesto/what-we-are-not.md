# What we are NOT

Lingona's identity is **defined as much by exclusion as by inclusion**. Đây là 6 thứ Lingona KHÔNG PHẢI. Mỗi thứ tham chiếu real product/pattern + lý do reject.

Khi redesign page, hỏi: "Page này có vibe giống 1 trong 6 anti dưới không?" — nếu CÓ, dừng lại, refactor.

---

## 1. NOT Duolingo cartoon

**What Duolingo does** (per Jan 2025 critique published):

- Bouncy character physics (Owl Duo bounce, dance, celebrate)
- Up to 13 icons per screen — overcrowding
- Every element same rounded shape → "everything looks like button, no clear CTA hierarchy"
- Passive-aggressive owl notifications ("It's been a while...")
- Bright neon-green primary, cartoon illustration in basic shapes (circle/square/triangle)
- Crown system → milestone redesign (controversial)

**Why Lingona rejects**:

- Lingona target = Vietnamese teen 16–25, **đã lớn**, đang chuẩn bị thi thật. Cartoon physics infantilize.
- IELTS = serious certification. Cambridge brand đứng sau. Bouncy mascot phá credibility.
- Vietnamese cultural context: học sinh cấp 3 + sinh viên KHÔNG cần cute mascot — cần peer companion.
- Icon overload → cognitive load. Lingona target = sạch, text-first.

**What Lingona BORROWS from Duolingo (per `11-references/duolingo-extract.md`)**:

- ✅ Gamification skeleton: streak / XP / leaderboard / battle / level
- ✅ Spaced repetition baked into path
- ✅ Brand attribute "Can-do" + "Inclusive" + "Quirky" (Lingona pick 3 of 5 Duolingo attributes)
- ❌ Cartoon physics
- ❌ Owl passive-aggressive
- ❌ 13 icons per screen
- ❌ Same rounded shape for everything

**Test**: nếu Lintopus "dance" hoặc "wave arms wildly" → fail. Lintopus = quiet companion, KHÔNG hyperactive cartoon.

---

## 2. NOT Linear cold

**What Linear does**:

- Sharp typography, monospace heavy
- Minimal chrome, dark-mode-first aesthetic
- Keyboard-driven navigation
- Calm, professional, productivity-app vibe
- Inter font (geometric sans)
- Gradient text occasional (`bg-clip-text`)

**Why Lingona rejects**:

- Lingona = warm peer voice. Linear = cold professional voice. Disconnect.
- Linear target = developer/PM. Lingona target = teen. Different emotional register.
- Linear vibe = "ship fast, no fluff". Lingona vibe = "leo Band cùng nhau, có Lintopus đi cùng".
- Vietnamese teen need warmth, không productivity-app sterile.

**What Lingona BORROWS from Linear**:

- ✅ Sharp typography hierarchy
- ✅ Whitespace as confidence (Linear uses lots of space)
- ✅ Calm, không over-decorate
- ❌ Cold tone
- ❌ Monospace dominance
- ❌ Keyboard-only UX (Lingona mobile + tap-driven)

**Test**: nếu page Lingona feel "developer dashboard" → fail. Phải có warmth signal — Lintopus, peer copy, navy-teal warmth, illustration touch.

---

## 3. NOT Study4 corporate sterile

**What Study4 does** (Vietnamese IELTS competitor, 1.5M users):

- "Giao diện sát kỳ thi thực" — exam-authentic UI promise (✅ Lingona đồng ý)
- BUT vibe corporate Vietnamese: "đột phá", "tiên tiến", "uy tín"
- Course catalog overflow: Combo IELTS / Combo Practical / TOEIC / HSK / TOPIK / SAT / THPT — chưa filter
- Stock photo testimonials với name + role
- Press release tone: "STUDY4 mang đến bước tiến mới..."
- KHÔNG có streak, KHÔNG có gamification, KHÔNG có sticky engagement
- Reading split 2-column (✅ Lingona đã có pattern same)

**Why Lingona rejects**:

- Vietnamese teen 16–25 đã quen corporate Vietnamese — boring, không sticky.
- Press release tone = không peer voice.
- Course catalog overflow = decision paralysis.
- KHÔNG gamification = retention chết.

**What Lingona BORROWS from Study4**:

- ✅ IELTS exam-authentic mode (Lingona §6 brand-authentic palette)
- ✅ Reading split 2-column (Lingona đã có)
- ✅ Detailed stats per test (correct/incorrect, time, common error type) → Lingona BandProgressCard expand
- ✅ Skill granular (Reading-only, Writing-only courses) → Lingona Practice Mode đã có
- ❌ Corporate Vietnamese tone
- ❌ Course catalog overflow
- ❌ Stock photo testimonials
- ❌ Press release prose

**Test**: nếu microcopy có từ "đột phá", "tiên tiến", "vượt trội", "uy tín", "chất lượng cao" → fail. peer voice không xài corporate adjective.

---

## 4. NOT v0 / Lovable / AI-template

**What AI-generated SaaS templates do** (v0.dev, Lovable, Bolt.new default output):

- Generic SaaS gradient hero (purple→pink, blue→teal random angle)
- Symmetric centered layout (hero center, 3-column features, CTA center)
- Floating glassmorphism cards everywhere
- Lorem-ipsum-feel copy ("Empower your X journey", "Unlock your potential")
- Default shadcn/ui chưa modify (recognizable across hundreds of apps)
- Border-radius `rounded-xl` everywhere uniform
- Gradient text everywhere (`bg-clip-text text-transparent`)
- Marketing-speak buttons ("Get Started Free", "Start Your Journey")
- Stock illustration packs unmodified (unDraw default purple)
- Emoji-as-decoration (🚀✨🎯 random)

**Why Lingona rejects** (this is THE Wave 6 hard requirement from Louis):

- AI-template = **invisible**. User scroll qua, KHÔNG nhớ Lingona.
- Vietnamese teen recognize AI-template trong 2 seconds (đã thấy hàng trăm landing kiểu này).
- Brand differentiation = 0. Lingona stand out KHÔNG nhờ tech, nhờ identity.

**12-point anti-AI-generated checklist** (codify đầy đủ ở `09-anti-patterns/ai-generated-smell.md`):

1. ❌ Generic SaaS gradient hero
2. ❌ Symmetric centered layout (hero center + 3-col features + CTA center)
3. ❌ Floating glassmorphism cards everywhere
4. ❌ Lorem-ipsum-feel copy
5. ❌ Default shadcn/ui chưa modify
6. ❌ `rounded-xl` everywhere uniform
7. ❌ Gradient text everywhere
8. ❌ Marketing-speak buttons EN
9. ❌ Stock illustration unmodified
10. ❌ Emoji-as-decoration
11. ❌ Center-aligned hero with single CTA
12. ❌ System font stack default

**What Lingona DOES instead**:

- ✅ Asymmetric layout (hero left-leaning, content right-balanced)
- ✅ Lintopus mascot custom (NOT stock)
- ✅ Vietnamese-first peer copy ("Cùng luyện IELTS")
- ✅ Mixed radius scale (rounded-sm/md/lg/xl/2xl/full purposeful, KHÔNG uniform)
- ✅ Solid color blocks > gradient
- ✅ DM Sans + Playfair Display dual font (signature, KHÔNG default)
- ✅ Em-dash punctuation rhythm
- ✅ 🐙 strategic, KHÔNG random

**Test**: open landing/page, hỏi "Could this pass as v0 default output?" — nếu YES, fail.

---

## 5. NOT IELTS exam-prep boring

**What traditional IELTS prep apps do** (IELTS.org official prep, British Council prep, IDP prep):

- Sterile exam interface — Cambridge Blue + grey + white
- No gamification (boring)
- Heavy text content, no visual hierarchy
- Form-heavy onboarding (full name + DOB + nationality + passport... before any value)
- Static practice tests, no feedback
- Desktop-only (these apps not optimized mobile)

**Why Lingona rejects**:

- Vietnamese teen 16–25 use mobile/laptop daily — official prep feel ancient
- KHÔNG gamification = không sticky daily habit
- Sterile = không build emotional connection
- Heavy text = cognitive load, abandon rate cao

**What Lingona DOES instead**:

- ✅ IELTS-authentic mode (`04-modes/ielts-authentic.md`) **chỉ trong Full Test + Battle Ranked** (Cambridge cream + Georgia + navy + minimal yellow highlight)
- ✅ Brand mode (navy + teal + DM Sans) cho practice, dashboard, social — gamified, warm
- ✅ Brand-soft mode (cream wash) cho Practice — bridge between gamified and authentic
- ✅ Streak/XP/Battle visible everywhere
- ✅ Lintopus companion + peer voice

**Rule**: Lingona = **gamified daily practice** + **exam-authentic when it matters** (full test, ranked battle). Mode-switching is intentional. KHÔNG gamification trong full test (phá tinh thần thi). KHÔNG exam-sterile trong daily practice (phá retention).

---

## 6. NOT Notion / Slack / productivity apps

**What productivity apps do**:

- Database-feel UI (rows + columns + filters)
- Toggle-heavy settings
- Collaboration features primary (mentions, threads, multi-cursor)
- Empty state often database-themed ("Add your first row")
- Color = functional (folder colors, tag colors), không emotional

**Why Lingona rejects**:

- Lingona target = solo learner, KHÔNG team collaboration
- Lingona = emotional product (motivation, streak, anxiety pre-exam) — KHÔNG productivity utility
- Lingona social = friend chat + leaderboard (light social), KHÔNG Slack-replacement

**What Lingona BORROWS from productivity apps**:

- ✅ Notification panel (NotificationBell socket-driven — Wave 4 ship)
- ✅ Friend chat 1:1 (Socket.IO, light Messenger-feel — không Slack-thread)
- ❌ Database UI
- ❌ Multi-cursor / collab
- ❌ Tag-heavy filtering

---

---

## 7. NOT audio character / voice agent

**What audio character apps do** (Siri, Alexa, Google Assistant, Duolingo voice mode):

- TTS / synthesized character voice
- Voice acting / recorded character lines
- Audio "personality" with branded voice actor
- Push-to-talk / wake-word interaction

**Why Lingona rejects**:

- Lingona = **silent app**. UI text-driven, KHÔNG audio character.
- Vietnamese teen 16–25 use Lingona ở classroom / café / quán nước — KHÔNG bật loa nghe character speak.
- TTS Vietnamese chất lượng còn thấp pre-launch — risk cringe.
- Lintopus = visual mascot, KHÔNG voice agent. Lintopus "speaks" trong skill doc nghĩa là **bubble text/microcopy** (chữ trên màn hình), KHÔNG audio.

**What Lingona DOES with audio**:

- ✅ Sound effects (ding.mp3 cho achievement, codebase đã có `frontend/public/sounds/`) — short cues
- ✅ Listening exercise audio (Cambridge listening test recordings) — exam content, không character voice
- ✅ Speaking AI evaluation playback (user's own recording) — feedback content
- ❌ Lintopus voice acting
- ❌ TTS narration
- ❌ Wake-word / voice commands
- ❌ Branded character voice (Siri-style)

**Test**: nếu mockup có "play voice intro" / "Lintopus says..." audio button → fail. Lintopus = visual + bubble text only.

---

## Boundary test

Trước khi ship page mới, run boundary test:

| Question | Pass | Fail |
|----------|------|------|
| Does Lintopus dance/wave/cartoon? | NO movement extreme | YES → fail (Duolingo cartoon) |
| Does the page feel "developer productivity tool"? | NO warmth absent | YES → fail (Linear cold) |
| Does microcopy use "đột phá", "tiên tiến", "uy tín"? | NO | YES → fail (Study4 corporate) |
| Could this pass as v0/Lovable default output? | NO | YES → fail (AI-template) |
| Is gamification visible (streak/XP/battle/level)? | YES (except IELTS-authentic full test) | NO → fail (exam-prep boring) |
| Is the UI "database-feel" or "form-heavy"? | NO | YES → fail (productivity app) |
| Does Lintopus have audio voice / TTS / play button? | NO (visual + bubble text only) | YES → fail (audio character) |

Pass all 7 → ship.
Fail 1+ → refactor.

## See also

- `00-manifesto/personality.md` — M persona (the warmth answer)
- `00-manifesto/visual-vocabulary.md` — 3-word essence (warm + rigorous + companion)
- `00-manifesto/recognizable-from-100ft.md` — identity test
- `09-anti-patterns/ai-generated-smell.md` — full 12-point checklist with code examples
- `11-references/duolingo-extract.md` — what to borrow from Duolingo
- `11-references/study4-extract.md` — what to borrow from Study4
- `11-references/jschallenger-extract.md` — what to borrow from JS Challenger
