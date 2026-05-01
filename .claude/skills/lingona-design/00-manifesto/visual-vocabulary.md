# Visual vocabulary — 3-word essence

Lingona's visual identity reduces to **3 words**. Mỗi visual decision (color, type, layout, motion, illustration) phải trả lời **3 word này, không thiếu, không thừa**.

```
WARM         +    RIGOROUS     +    COMPANION
(peer voice)      (exam-real)        (Lintopus + Soul §1)
```

KHÔNG phải 5 word. KHÔNG phải 7. **3 word lock**. Mọi attribute khác (playful, modern, accessible, professional...) là **derivative** của 3 word này — không tự đứng riêng.

---

## WARM

### Definition

Lingona feel "có người ở trong đó". KHÔNG sterile, KHÔNG corporate, KHÔNG database-tool. peer voice + Lintopus presence + warm color palette + handwritten-feel touch.

### Visual translation

| Element | WARM = |
|---------|--------|
| **Palette** | Cream `#F7F4EC` background (warm off-white, KHÔNG cool blue-tinted white). Teal `#00A896` (slightly green-leaning, KHÔNG cyan-cold). Navy `#1B2B4B` (slight purple undertone, KHÔNG industrial gray-navy). |
| **Typography** | DM Sans (geometric BUT humanist proportion). Playfair Display Italic accents (display moment for headers). KHÔNG Inter (too geometric, cold). KHÔNG monospace (developer cold). |
| **Radius** | Mixed scale — `rounded-md` (8px) cho most, `rounded-2xl` (24px) cho hero card, `rounded-full` cho avatar/Lintopus container. KHÔNG uniform `rounded-xl` (v0 default cold). |
| **Spacing** | Generous — 96px section, 48px sub-section, 24px card. KHÔNG cramped 8/16/24 grid only (productivity-app feel). |
| **Voice** | "nhé / cùng / với mình" peer particles. Em-dash rhythm. Lintopus name dropped in stuck/error states. |
| **Color usage** | Solid blocks > gradient. Color signal emotion (teal = encourage, navy = serious, cream = breathing space). KHOG color-as-decoration. |
| **Shadows** | Soft, low-contrast. `shadow-md` warm tint, KHÔNG hard `shadow-xl` industrial. |
| **Illustration** | Lintopus custom hand-feel SVG. KHÔNG stock unDraw geometric. Optional decorative SVG with hand-drawn imperfection. |

### WARM red flags

❌ Background `#FFFFFF` pure white (cool, sterile) — use `#F7F4EC` cream
❌ Tailwind default `gray-*` text everywhere (cool gray) — use `slate-*` or warm-gray custom
❌ Inter / Geist / system-ui font stack (cool geometric) — use DM Sans
❌ "Quý khách lưu ý" Vietnamese formal — use peer voice
❌ Database table UI for content list — use card with breathing room
❌ Gradient `from-blue-500 to-purple-500` SaaS template — use solid teal/navy block

### WARM green flags (codebase verified)

✅ `globals.css`: `--color-bg-page: #F8F7F4` (warm-white, ✅ correct direction)
✅ `tailwind.config.ts`: `cream` palette defined
✅ `Lintopus` SVG hand-feel custom — `frontend/public/mascot.svg`
✅ Voice: `"Cùng luyện IELTS với mình trên Lingona nhé!"` — peer + cùng + nhé

---

## RIGOROUS

### Definition

Lingona feel "biết IELTS thật là gì". KHÔNG vague encouragement, KHÔNG fake band, KHÔNG generic placeholder. Real Cambridge passages. Real exam UI when needed. Real band feedback. Real time pressure.

### Visual translation

| Element | RIGOROUS = |
|---------|-----------|
| **Mode separation** | Practice mode = warm/gamified. **Full Test mode = IELTS-authentic** (cream `#F5EFDC` + Georgia + navy + yellow highlight #FFEB3B — Cambridge faithful). Battle Ranked = IELTS-authentic. KHÔNG mix gamified vào full test. |
| **Typography in exam** | Georgia serif (Cambridge official), Arial fallback. KHÔNG DM Sans trong full test (gamified font phá thi-thật feel). |
| **Layout in exam** | Reading split 2-column (passage left, questions right) — exact Cambridge UI mimic. Word count + timer prominent. KHÔNG decoration trong exam. |
| **Stats** | Real percentile / band number / time-spent. KHÔNG fake "1,234 Online", KHÔNG "12s queue average". (Codebase audit Apr 26-27 found these — Wave 2.5 fixed.) |
| **Feedback** | Specific. "Coherence chưa ổn — luyện linking words" KHÔNG "Bạn cần cải thiện". Skill-name + suggested action. |
| **Band display** | Number prominent, decimal precision (Band 6.5 không "Band 6+"). Color-mapped (Band 5.0–5.5 amber, 6.0–6.5 teal, 7.0+ navy/gold). |
| **Timer** | `Date.now()` diff (Wave 4 fairness fix). Visible countdown. KHÔNG ease-out animation (cause anxiety wrong). |
| **Reading passage** | Cambridge sách 10–14 verified content. Real questions. Real answer keys. (No AI-generated passages outside dev fixtures.) |

### RIGOROUS red flags

❌ Fake stats hardcoded — "1,234 Online", "~12s queue", "28 days left"
❌ `Math.random() * 4 + 4` band estimate (Wave 2.6 fixed)
❌ Generic feedback "You did great!" cho Band 5.0 — fake earned
❌ Gamified font (DM Sans) trong full test mode
❌ Decoration (Lintopus pulse, gradient bg) trong full test
❌ Vague time pressure (no countdown visible) trong full test

### RIGOROUS green flags

✅ `globals.css`: `--ielts-*` token block defined (cream + Georgia + yellow highlight)
✅ Reading passages 56 seeded từ Cambridge sách verified
✅ Wave 4 timer fix Date.now() diff (anti-cheat)
✅ EMA per-skill band estimate (Wave 2.2) — replace last-write-wins
✅ Writing FullTest content theft idempotency fix (Wave 2.3)

---

## COMPANION

### Definition

Lingona feel "không cô đơn". User KHÔNG đi 1 mình. Lintopus ở result. Friend chat ở chat. Battle ở Battle. Streak ở dashboard. Peer voice mọi nơi text.

Soul §1 lock từ codebase: *"Stand next to every result, win or loss"*. Lintopus = silent visual companion + occasional bubble text/microcopy, KHÔNG cheerleader, KHÔNG audio voice.

**Critical clarification**: "Lintopus presence" = **visual SVG mascot in UI** + **optional 1-line bubble text/microcopy**. NO audio, NO TTS, NO voice acting. (See `00-manifesto/what-we-are-not.md#7` for full audio anti-pattern.)

### Visual translation

| Element | COMPANION = |
|---------|------------|
| **Lintopus presence** | EVERY result page (Battle ✅ done, Reading ❌ Wave 6 fix, Writing ❌ Wave 6 fix, Speaking ❌ verify). Onboarding ✅. Level-up ✅. Rank-up ✅. Battle gate ✅. Error ✅. Landing ✅. |
| **Mascot placement** | Next to outcome (left/right of band number, KHÔNG floating overlay). Size scales with emotion: 100px result, 200px level-up overlay, 320px landing hero. |
| **Mascot mood** | "default" (neutral), "happy" (Band 7+/win), "thinking" (Band 5.5–6.5), "sad" (Band <5.0/loss/error). Stored in `data-mood` attr — visual variant pending implementation. |
| **Friend presence** | Friend chat + Friend list always 1 nav-tap away. Notifications real-time (Socket.IO push, Wave 4). |
| **Battle presence** | Battle tab in BottomNav (5 tabs total). Practice + Battle complementary, KHÔNG conflict. |
| **Streak visibility** | Streak count visible top of dashboard. Streak break = "Streak {n} đứt. Bắt đầu lại" — không drama, không alone. |
| **Empty state** | Always prompt-to-action + warm. "Chưa có bạn nào. Mời bạn qua link nhé" KHÔNG "No friends found". |
| **Error state** | Lintopus enters. "Đừng lo, Lintopus đang sửa! 🐙" KHÔNG "Internal server error". |

### COMPANION red flags

❌ Result page WITHOUT Lintopus (Reading/Writing currently — Wave 6 fix mandatory)
❌ Empty state = "No data" / "Empty" — không prompt, không warm
❌ Error 500 = stack trace dump — không Lintopus, không recovery action
❌ Lintopus on EVERY page (over-presence — pages dashboard không cần Lintopus visually, achievement implicit)
❌ Lintopus speak on routine action (over-narrative — Lintopus silent except 3 moment categories)

### COMPANION green flags

✅ `frontend/components/ui/Mascot.tsx` component exists, props: size + mood + className
✅ BattleResult: `<Mascot mood={isWinner?"happy":"default"}>` Soul §1 verified
✅ LevelUpOverlay + RankPromotionOverlay use Lintopus
✅ Error boundary `app/error.tsx`: Lintopus speaks recovery copy
✅ BattleTab gate not-met: "Lintopus sẽ đợi bạn ở đây"
✅ Friend chat empty: "Chưa có tin nhắn nào! 🐙"

---

## The 3-word test

Trước khi ship visual decision, hỏi 3 câu:

1. **WARM** — Page này có "có người ở trong đó" feel không? Có peer voice, warm palette, breathing room?
2. **RIGOROUS** — Page này respect IELTS as serious cert? Real content, real feedback, real time?
3. **COMPANION** — User cảm thấy không cô đơn? Lintopus / Friend / Battle / Streak signal có 1 đứa cùng đi?

Pass 3 → ship.
Fail 1+ → identify which word missing, refactor.

## Word combination test

Mỗi page priority MUST hit specific combination:

| Page type | WARM | RIGOROUS | COMPANION |
|-----------|------|----------|-----------|
| Landing | ★★★ | ★ | ★★ |
| Onboarding | ★★★ | ★ | ★★ |
| /home dashboard | ★★ | ★ | ★★★ |
| Practice (Speaking/Writing/Reading/Listening) | ★★ | ★★ | ★ (Voice only, no Lintopus) |
| Full Test mode | ★ | ★★★ | ★ (Voice minimal, Lintopus in result only) |
| Battle in-progress | ★ | ★★ | ★★ (drama register) |
| Battle Result | ★★ | ★★ | ★★★ (Lintopus mandatory Soul §1) |
| Reading/Writing/Speaking Result | ★★ | ★★★ | ★★★ (band number prominent + Lintopus + feedback specific) |
| Friend Chat | ★★★ | — | ★★★ |
| Profile/Settings | ★★ | ★ | ★ |
| Error page | ★ | — | ★★★ (Lintopus speaks) |
| Achievement unlock overlay | ★★★ | — | ★★★ (Lintopus tự hào) |

★★★ = mandatory presence
★★ = strong presence
★ = light presence
— = absent (intentional)

## Anti-pattern: word inflation

KHÔNG add 4th word. Đã có người đề xuất "playful", "accessible", "modern", "professional" — REJECT all.

- "Playful" — covered bởi WARM (peer voice + Lintopus warmth)
- "Accessible" — codified separately ở `09-anti-patterns/` + `fixing-accessibility` skill (a11y rule không đứng riêng identity)
- "Modern" — empty word, KHÔNG specific
- "Professional" — covered bởi RIGOROUS (exam-real respect)

3 word lock. Nếu cần 4 word để describe = identity chưa rõ. Refactor.

## See also

- `00-manifesto/personality.md` — peer voice = WARVoice translation
- `00-manifesto/what-we-are-not.md` — anti-references
- `00-manifesto/recognizable-from-100ft.md` — identity test
- `01-foundations/palette.md` — WARM color codification
- `04-modes/ielts-authentic.md` — RIGOROUS mode codification
- `03-components/mascot.md` — COMPANION (Lintopus) codification
