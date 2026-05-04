# Jargon ban

**Jargon** = developer / vendor / model-naming language that exposes
implementation detail to end users. Vietnamese IELTS learners aged
18–25 do not know — and should not have to know — what Whisper or
GPT-4o-mini is. Surfacing those names in product copy reads as either
"AI buzzword soup" (untrustworthy) or "we don't know who our user is"
(corporate).

## Rule

End-user-facing copy on the landing page, dashboard, result screens,
modals, error messages, and email content **must NOT** name the
underlying provider, model, or technique. The single allowed brand for
AI work is **Lintopus AI** — the mascot is the surface, the
implementation is invisible.

Developer-facing surfaces (JSDoc, code comments, commit messages,
internal docs, admin dashboards, Sentry events, log lines, this skill
module itself) **may** use technical terms freely. The split is who is
reading, not the file extension.

## Banned in end-user copy

| ❌ Banned term | ✅ Lingona equivalent |
|----------------|----------------------|
| Whisper | Lintopus AI nghe phát âm |
| GPT-4o-mini / GPT-4 / OpenAI | Lintopus AI |
| LLM / large language model | Lintopus AI |
| LLM scoring / model scoring | Lintopus AI chấm bài |
| Multi-sampling / 3x sampling | 3 lần chấm độc lập |
| Median (as scoring term) | Trung vị (allowed) — or just "kết quả ổn định hơn" |
| Token / prompt / inference / API call | (drop entirely) |
| Azure Speech / phoneme analysis | Lintopus AI nghe phát âm |
| Embedding / vector / RAG | (drop entirely) |
| Webhook / endpoint / payload | (drop entirely) |
| Rate limit / quota exceeded | "Hết lượt hôm nay" (microcopy-library) |

The list is open — when in doubt, ask "would a Vietnamese 18-year-old
prepping for IELTS know this word?" If no, replace it.

## Allowed in end-user copy

These survive translation because the IELTS audience already meets them
in textbooks, official material, or universal product UI:

- IELTS criterion names — `Fluency`, `Lexical Resource`, `Grammatical Range`,
  `Pronunciation`, `Task Achievement`, `Coherence and Cohesion`
- IELTS question types — `Multiple Choice`, `True / False / Not Given`,
  `Matching`, `Heading`, `Summary completion`
- Test-format names — `Practice mode`, `Full Test mode`, `Battle Ranked`
- Score language — `band`, `band cuối`, `Cambridge IELTS format`
- Generic product nouns — `email`, `account`, `subscription`, `waitlist`

These are domain vocabulary, not implementation jargon.

## Where developer language IS allowed

Use technical terms freely in:

- JSDoc / TypeScript types
- Code comments (single-line + block)
- Commit messages + PR descriptions
- `docs/` markdown, `.claude/skills/` markdown (including this file)
- Sentry breadcrumbs, structured log payloads
- Internal admin dashboards (post-launch)
- Backend error `code` strings (`INVALID_TIER`, `WAITLIST_DUPLICATE`)
  — the string is for engineers; the user-visible `message` field is
  the one that gets the peer voice + jargon scrub.

## Why

1. **Trust** — Naming the model in marketing copy reads as
   "ChatGPT wrapper". The audience has seen 50 such products in 2025;
   surfacing the dependency is an admission of low product depth.
2. **Brand cohesion** — Lintopus is the mascot, the voice, the visual,
   and the AI surface. Fragmenting that into "OpenAI says…" /
   "Whisper detected…" splits the persona.
3. **Future-proofing** — Provider abstraction in `backend/src/providers/`
   is designed to swap models. End-user copy referencing a specific
   model becomes a lie the moment provider swaps. Branded copy survives.
4. **Audience fit** — A Vietnamese 18-year-old does not parse "GPT-4o-mini
   chấm 3 lần độc lập, lấy median band score". They parse "Lintopus AI
   chấm 3 lần để giảm sai số". Same engineering. Different surface.

## Wave 6 Sprint 3.6 context

Production round-2 verification surfaced 3 jargon hits on the landing
page that survived Sprints 2C → 3.5E:

1. Speaking body: `Whisper transcribe + LLM scoring` → `Lintopus AI nghe
   phát âm + chấm 4 tiêu chí IELTS chính thức`
2. Writing body: `GPT-4o-mini chấm 3 lần độc lập, lấy median band score`
   → `Lintopus AI chấm 3 lần để giảm sai số — kết quả band ổn định hơn`
3. Writing visual labels: `3X MULTI-SAMPLING` → `3 LẦN CHẤM ĐỘC LẬP`,
   `Median = band Final` → `Trung vị = band cuối`

Louis verbatim: "người dùng sẽ không hiểu gpt call rồi này nọ là gì ??
hãy ghi lintopus AI chấm bài". Decision locked the rule into the skill
system so future copy passes through this filter pre-ship.

## Detection workflow

Before shipping any landing-page, modal, dashboard, or email copy:

1. Grep the touched files for the banned terms above
   (`Whisper|GPT|LLM|multi-sampling|median|OpenAI|Azure Speech`).
2. Any hit in JSX text, alt text, aria-label, button label, error
   message, headline, body copy, or visual placeholder label = block.
3. Hits inside JSDoc / `/* */` / `//` comments = OK, ship.
4. If unsure whether a term counts as "domain vocabulary" or "jargon",
   default to replacing it — peer voice survives the loss; the user
   doesn't lose anything.

## See also

- `05-voice/persona.md` — peer voice + when to break it
- `05-voice/microcopy-library.md` — VN microcopy table
- `05-voice/never-say-list.md` — hard-banned phrases (corporate / cheer)
- `09-anti-patterns/corporate-translate.md` — `vui lòng` / `quý khách` ban
- `09-anti-patterns/ai-generated-smell.md` — gradient / glow / dark ban
- `frontend/components/landing/FeaturesSection.tsx` — canonical scrubbed
  Speaking + Writing copy (Sprint 3.6 ship)
