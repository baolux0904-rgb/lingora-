# Personality — peer voice, "bạn cùng lớp"

Lingona's voice = **the way Lingona talks to user via text on screen**. KHÔNG audio, KHÔNG TTS, KHÔNG voice acting — pure microcopy + speech bubble UI.

This file codifies voice rules. KHÔNG có "persona name" cho voice. Lintopus là MASCOT (visual + occasional bubble text), không phải narrator. Voice rules apply globally — mọi text Lingona say with user follow patterns dưới.

## Persona archetype

Imagine giọng nói trong app như: **bạn cùng lớp đang luyện IELTS cùng user**.

- 19 tuổi, người Việt
- Đang luyện IELTS cùng user (target Band 7+, chưa thi xong)
- Đã thi mock test vài lần, biết feel áp lực
- KHÔNG phải native English speaker
- Tone: equal, ngang hàng, share struggle
- KHÔNG là thầy cô (authority), KHÔNG là examiner (cold), KHÔNG là marketing center (sell), KHÔNG là Owl Duo (cartoon)

Không thiêng liêng. Có thể sai, có thể không biết, có thể "Mình cũng từng kẹt chỗ này".

Voice signature: **share, không direct**.

## Why "bạn cùng lớp" (KHÔNG upperclassman, KHÔNG thầy cô)

Vietnamese teen 16–25 (Lingona target) đã quen mệt mỏi với:

- Authority voice từ thầy cô: "Em phải luyện thêm linking words"
- Marketing voice từ trung tâm IELTS: "Cam kết Band 7 sau 3 tháng!"
- Translate voice từ AI/SaaS: "Empower your IELTS journey"
- Patronizing voice từ apps cũ: "Đừng buồn nhé, lần sau sẽ tốt hơn 💪"

Lingona voice = **đối lập 4 cái trên**. Không claim authority. Không sell. Không translate. Không patronize.

## Voice rules (binding)

### Pronoun lock — toàn app

| Setting | Lingona xưng | Gọi user |
|---------|--------------|----------|
| Battle / casual / social | **mình** | **bạn** |
| Result / feedback | **mình** | **bạn** |
| Onboarding | **mình** | **bạn** |
| Friend chat / share text | **mình** | **bạn** |
| Settings / legal | (không xưng, impersonal) | **bạn** |

**Rule cứng**: chỉ "mình/bạn" toàn app. KHÔNG "tao/mày" bất cứ đâu (drop hoàn toàn). KHÔNG "em/anh-chị" (authority). KHÔNG "quý khách" (corporate).

Sometimes có thể bỏ pronoun nếu câu ngắn:
- ✅ "Band 7 — vững rồi đấy" (no pronoun, neutral, OK)
- ✅ "Bạn đạt Band 7 — ngon đấy" (pronoun + warm)
- ✅ "Cùng luyện IELTS với mình nhé" (pronoun + invitation)

### Particle (peer-warm)

| Particle | Use | Avoid |
|----------|-----|-------|
| **nhé** | soft directive: "luyện thêm nhé" | KHÔNG bỏ trống ("luyện thêm" raw cứng) |
| **đi** | peer-encourage: "submit đi" | KHÔNG dùng "Hãy submit" (corporate) |
| **ha / ha bạn** | warm confirm: "Hết giờ rồi ha" | KHÔNG dùng "Quý khách lưu ý" |
| **cùng** / **với mình** | invitation: "Cùng luyện IELTS với mình" | KHÔNG "Hãy đăng ký để..." |
| **đấy** / **đấy nhé** | gentle highlight: "Band 7 ngon đấy" | KHÔNG "Wow! Amazing!" |

### Em-dash rhythm

Em-dash (`—`, KHÔNG hyphen `-`) là **signature punctuation** của Lingona. Đặt 2 phrase ngang hàng KHÔNG cần subordinate clause.

✅ Examples từ codebase:

- `"Hết giờ — nộp bài tự động"` (Full Test)
- `"Hết giờ — tùy bạn quyết tiếp"` (Practice)
- `"Top {n}% — Lintopus tự hào lắm"` (Rank promo)
- `"Band 7 — vững rồi đấy"` (Result)

❌ Avoid:

- `"Hết giờ. Nộp bài tự động."` (full stop = curt)
- `"Hết giờ - nộp bài tự động"` (hyphen `-` = wrong char)
- `"Hết giờ, nộp bài tự động"` (comma = run-on)
- `"Hết giờ! Nộp bài!"` (! = panic)

### Praise tone

| Situation | ✅ Voice | ❌ Anti |
|-----------|---------|--------|
| User win Band 7+ | `"Band 7.0 — ngon đấy"` / `"Band 7.5 — vững rồi"` | `"Tuyệt vời! 🎉"` / `"Bạn đã làm rất tốt!"` |
| User win Band 6.0–6.5 | `"Band 6.5 — đang gần Band 7"` | `"Cố gắng lên!"` / `"Bạn đang tiến bộ"` |
| User win Battle | `"VICTORY"` (English ALL CAPS — codebase locked) | `"Chiến thắng!"` / `"Bạn đã thắng!"` |
| User unlock achievement | `"Lintopus tự hào lắm! 🐙🎉"` (Lintopus bubble text) | `"Achievement Unlocked!"` |

**Rule**: praise được earn, không generic. Band 5.5 KHÔNG praise — chỉ acknowledge.

### Critique tone

| Situation | ✅ Voice | ❌ Anti |
|-----------|---------|--------|
| Band 5.0–5.5 | `"Band 5.5 lần này. Coherence chưa ổn — luyện linking words thêm"` | `"Đừng buồn nhé!"` / `"Cố gắng hơn lần sau"` |
| Band <5.0 | `"Band {n}. Đừng nản — Lintopus đợi bạn ở vòng tiếp theo"` (Lintopus bubble enters) | `"Bạn cần cải thiện đáng kể"` (sterile) |
| Battle DEFEAT | `"DEFEAT"` + Lintopus mood="default" visual | `"Bạn đã thua"` / `"Better luck next time!"` |
| Streak break | `"Streak {n} đã đứt. Bắt đầu lại từ ngày 1"` (factual, không drama) | `"Ôi không! Streak của bạn đã mất 😱"` |

**Rule**: thẳng thắn nhưng KHÔNG khinh. Specific (skill nào yếu) hơn vague (cải thiện). Lintopus xuất hiện ở moment thấp để companion visual + 1 dòng bubble text, KHÔNG cheer-up giả tạo.

### Loading / waiting

| ✅ | ❌ |
|---|---|
| `"Đang nộp..."` | `"Vui lòng chờ..."` |
| `"Đang gửi..."` | `"Hệ thống đang xử lý"` |
| `"Đang lưu..."` | `"Loading, please wait"` |

**Rule**: present continuous + 3 chấm. KHÔNG corporate "Vui lòng chờ".

### Empty state

| Situation | ✅ Voice | ❌ Anti |
|-----------|---------|--------|
| Friend list trống | `"Chưa có bạn nào. Mời bạn qua link nhé"` | `"Không có dữ liệu"` |
| Battle history trống | `"Chưa đấu trận nào. Vào Battle tab để bắt đầu"` | `"You have no matches yet"` |
| Chat trống | `"Chưa có tin nhắn nào! Nhắn cho bạn bè nhé 🐙"` (codebase verified) | `"Empty conversation"` |

**Rule**: empty = warm prompt to action, KHÔNG passive "no data".

### Error

| Situation | ✅ Voice | ❌ Anti |
|-----------|---------|--------|
| Network error | `"Không tải được. Thử lại sau nhé"` | `"Đã xảy ra lỗi. Vui lòng thử lại"` |
| 500 / unexpected | `"Đừng lo, Lintopus đang sửa! Bạn thử tải lại trang nhé 🐙"` (codebase verified — Lintopus bubble text) | `"Internal server error"` |
| Validation | `"Email chưa đúng format"` | `"Invalid email"` |
| Action fail | `"Không thể đổi email. Thử lại sau"` (codebase verified) | `"Operation failed"` |

**Rule**: error = direct, no apology theatre. Big errors = Lintopus bubble appears.

## Lintopus = visual mascot + bubble text/microcopy ONLY

**CRITICAL CLARIFICATION**: When skill doc says *"Lintopus speaks"*, it means **chữ hiện trên màn hình** (microcopy with "Lintopus" name + 🐙 emoji, OR speech bubble UI element next to Lintopus mascot).

```
✅ Lintopus = visual SVG mascot in UI
✅ Lintopus = text microcopy with "Lintopus" name reference
✅ Lintopus = optional speech bubble UI element (rendered text inside SVG/HTML bubble)

❌ Lintopus ≠ audio voice (NO TTS)
❌ Lintopus ≠ voice acting (NO recorded character voice)
❌ Lintopus ≠ Siri / Alexa / Duo voice agent
```

Lingona = **silent app**. Có sound effect (ding.mp3 cho achievement, codebase đã có `frontend/public/sounds/`), nhưng KHÔNG character voice.

### Lintopus bubble text scope

Lintopus xuất hiện như **visual mascot + 1 dòng text** ở 4 moment loại:

1. **High emotion win** — level up, rank promotion, achievement unlock → Lintopus visual + text "Lintopus tự hào lắm! 🐙🎉"
2. **Stuck / loss / wait** — Battle gate not-met, error boundary, low band — Lintopus visual mood="default"/"sad" + 1 dòng text companion
3. **Onboarding intro** — Lintopus visual + text "Cho Lintopus biết bạn đang ở đâu nhé"
4. **Empty state warmth** — sometimes Lintopus 🐙 emoji at end of empty-state copy: "Chưa có tin nhắn nào! 🐙"

Lintopus **không có dòng dài**. KHÔNG dùng Lintopus như narrator. Mỗi moment Lintopus xuất hiện = max 1 câu, max 80 chars.

✅ Lintopus bubble text valid:
- `"Lintopus tự hào lắm! 🐙🎉"` (10 words)
- `"Lintopus đợi bạn ở đây nha"` (6 words)
- `"Đừng lo, Lintopus đang sửa! 🐙"` (6 words)

❌ Lintopus bubble text fail:
- `"Hi! I'm Lintopus and I'm here to help you on your IELTS journey! Let's get started together!"` (over-narrative, AI-generated smell)
- `"Lintopus muốn chia sẻ với bạn rằng... [3 dòng paragraph]"` (Lintopus không monologue)

Detail rule: see `05-voice/lintopus-speaks.md` (pending batch — file đó nên rename `lintopus-bubble-text.md` để clearer).

## What Lingona never says

(Sẽ codify đầy đủ ở `05-voice/never-say-list.md`. 5 ví dụ critical:)

1. ❌ "Empower your IELTS journey" (corporate translate)
2. ❌ "Don't worry, you'll get it next time!" (fake comfort EN)
3. ❌ "Đừng buồn nhé, lần sau sẽ tốt hơn" (fake comfort VN)
4. ❌ "AMAZING WORK!!! 🎉🎉🎉" (over-celebrate AI)
5. ❌ "Quý khách lưu ý..." (corporate Vietnamese)

## Codebase grounding

Voice rules trên KHÔNG vacuum — đã verify từ Claude Code grep audit (Apr 30, 2026):

- ✅ `"Cùng luyện IELTS với mình trên Lingona nhé!"` (share text — peer + cùng + mình + nhé)
- ✅ `"Lintopus tự hào lắm! {n} XP 🐙🎉"` (LevelUpOverlay)
- ✅ `"Top {n}% — Lintopus tự hào lắm! 🐙🎉"` (RankPromotionOverlay)
- ✅ `"Hết giờ — nộp bài tự động"` (Full Test timer)
- ✅ `"Hết giờ — tùy bạn quyết tiếp"` (Practice timer)
- ✅ `"Đừng lo, Lintopus đang sửa! Bạn thử tải lại trang nhé 🐙"` (error.tsx)
- ✅ `"Hoàn thành {n} lượt Reading practice trước khi vào Battle. Lintopus sẽ đợi bạn ở đây."` (BattleTab gate)
- ✅ `"Chưa có tin nhắn nào! Nhắn cho bạn bè nhé 🐙"` (chat empty)
- ✅ `"Cho Lintopus biết bạn đang ở đâu nhé"` (Onboarding)

Codebase ALREADY 80% match peer voice rules. Skill này LOCK pattern + extend cho gap (Reading/Writing Result missing Lintopus, etc.).

## Tone calibration matrix

| Page type | Register | Lintopus visual + bubble | Em-dash freq |
|-----------|----------|-------------------------|--------------|
| Landing (public) | peer warm | YES (hero + final CTA) | high |
| Onboarding | peer welcome | YES (multi-screen) | medium |
| Home dashboard | peer informative | NO (Lintopus implicit via achievements) | medium |
| Speaking/Writing/Reading practice in-task | minimal interruption | NO during task | low |
| Result (any) | peer + Lintopus mandatory | YES (Soul §1) | high |
| Battle queue/match | drama register (VICTORY/DEFEAT EN caps) | YES (BattleResult) | medium |
| Profile/Settings | neutral, leaning formal | NO | low |
| Settings legal (Privacy/Terms) | impersonal, formal | NO | none |
| Error / 500 / 404 | Lintopus bubble appears | YES mandatory | medium |
| Empty state | peer prompt-to-action | sometimes 🐙 emoji | low |

## Test: "Would Lingona say this?"

Trước khi ship microcopy mới, hỏi:

1. **Có generic translate-from-English smell?** ("Get Started" → "Bắt đầu" raw — fail)
2. **Có authority voice không cần thiết?** ("Em phải làm" — fail)
3. **Có patronize?** ("Đừng buồn nhé!" — fail)
4. **Có drama không earn?** ("Tuyệt vời!" cho Band 5.5 — fail)
5. **Có em-dash đúng character (`—` không phải `-`)?** (low priority nhưng signature)
6. **Có particle peer-warm (nhé/đi/cùng)?** (không bắt buộc nhưng add warmth)
7. **Pronoun là "mình/bạn"?** (KHÔNG "tao/mày", KHÔNG "em/anh-chị", KHÔNG "quý khách")

Nếu pass 7 câu → ship. Nếu fail 1+ → rewrite.

## See also

- `00-manifesto/what-we-are-not.md` — boundary list (NOT cartoon, NOT corporate, NOT AI-template, NOT audio character)
- `00-manifesto/visual-vocabulary.md` — 3-word essence map to visual
- `05-voice/tone-rhythm.md` — em-dash + particle deep dive (pending)
- `05-voice/lintopus-speaks.md` — Lintopus bubble text scope (pending)
- `05-voice/never-say-list.md` — full ban list (pending)
- `05-voice/microcopy-library.md` — template for loading/empty/error/success (pending)
