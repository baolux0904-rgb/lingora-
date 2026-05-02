---
name: lingona-design
description: Lingona's distinctive design system — palette, typography, layout philosophy, Lintopus mascot rules, "bạn cùng lớp" peer voice, 3-mode system (brand / brand-soft / IELTS-authentic), motion patterns (Framer Motion + GSAP, NO Lottie/Rive Path C code-only lock), anti-AI-generated visual rules, fake-stats ban, corporate-translate kill, route-to-mode mapping, references analysis. ALWAYS load this skill when working on ANY Lingona UI task — page redesign, new component, fixing inline styles, writing microcopy, choosing colors, designing animations, anything that touches frontend/components, frontend/app, frontend/styles. Do not invent tokens, palettes, voice — they are codified here. Use alongside `senior-engineer` + `systematic-debugging` + `verification-before-completion` defaults.
---

# Lingona Design

Skill này codify Lingona's distinctive design system. KHÔNG phải tài liệu inspirational — đây là **decision rules** để mỗi UI task ship out đúng identity, KHÔNG drift, KHÔNG AI-generated.

## Why this exists

Pre-Wave-6 audit (Apr 30, 2026) found:

- 3 design system coexist trong codebase
- 2080 occurrence của `style={{}}` (phần lớn OK — bridge CSS var; nhỏ nhưng nguy hiểm — raw hex hardcoded như `#8B71EA`, `#7E4EC1`, `#F07167`, `#2DD4BF`)
- Drift: `bg-emerald-500` (40 hits) + `bg-amber-500` (32 hits) > `bg-teal-*` (3 hits) — semantic accent đang lệch BRAND
- Voice scattered across files chưa codify
- Layout pattern "cram text vô góc trên-trái, để trống 80% screen" trên desktop — anti-pattern call out by Louis
- 14-page UI audit average 4.6/10 — 10/14 page có P0 issues
- Sprint 1 bug fix CANCELLED → full rebuild Wave 6 prioritized (12 weeks, 7 sprint)

Pre-Wave-6 KHÔNG có single source of truth. Skill này chính là source.

## Core identity (one paragraph)

**Lingona** = IELTS prep app cho Vietnamese teen 16–25, đặt **Study4 IELTS authenticity** + **Duolingo gamification skeleton** + **JS Challenger sạch text-first layout** trong vỏ **Vietnamese peer voice ("bạn cùng lớp")** với **Lintopus** companion mascot. KHÔNG phải Duolingo cartoon. KHÔNG phải Study4 corporate. KHÔNG phải Linear cold. KHÔNG phải v0/Lovable AI-template.

Đọc `00-manifesto/` để hiểu sâu identity, KHÔNG bỏ qua nếu lần đầu chạm Lingona.

## Quick-start decision tree

Khi bắt đầu Lingona UI task, hỏi 4 câu:

```
1. Task touch gì?
   ├─ palette / màu sắc          → 01-foundations/palette.md
   ├─ typography                  → 01-foundations/typography.md
   ├─ spacing                     → 01-foundations/space-system.md
   ├─ radius                      → 01-foundations/radius-language.md
   ├─ layout / desktop canvas     → 02-layout/desktop-canvas.md (BẮT BUỘC nếu redesign page)
   ├─ mobile collapse             → 02-layout/mobile-rhythm.md
   ├─ whitespace ratio            → 02-layout/empty-space-philosophy.md
   ├─ visual hierarchy            → 02-layout/hierarchy-stair.md
   ├─ Result page anatomy         → 02-layout/result-page-anatomy.md
   ├─ Grid vs flow decision       → 02-layout/grid-vs-flow.md
   ├─ Lintopus placement          → 03-components/mascot.md
   ├─ Primary button (teal)       → 03-components/primary-button.md
   ├─ Card design                 → 03-components/card-language.md
   ├─ Modal (frozen Wave 2 logic) → 03-components/modal-frozen.md (REFACTOR VISUAL ONLY)
   ├─ Result card sub-skill       → 03-components/result-card.md
   ├─ Battle UI trilogy           → 03-components/battle-card.md
   ├─ Streak ring                 → 03-components/streak-ring.md
   ├─ Band progress               → 03-components/band-progress.md
   ├─ Mode decision (page)        → 04-modes/mode-switch-rules.md + 10-routes/route-mode-map.md
   ├─ Brand mode spec             → 04-modes/brand.md
   ├─ Brand-soft mode (Practice)  → 04-modes/brand-soft.md
   ├─ IELTS-authentic mode        → 04-modes/ielts-authentic.md
   ├─ Voice persona               → 05-voice/persona.md
   ├─ Em-dash + sentence rhythm   → 05-voice/tone-rhythm.md
   ├─ Lintopus bubble copy        → 05-voice/lintopus-bubble-text.md
   ├─ Microcopy library           → 05-voice/microcopy-library.md
   ├─ Battle drama register       → 05-voice/battle-drama.md
   ├─ Banned phrases check        → 05-voice/never-say-list.md
   ├─ Animation philosophy        → 06-motion/motion-philosophy.md
   ├─ Duration scale              → 06-motion/duration-language.md
   ├─ Framer Motion variants      → 06-motion/framer-variants.md
   ├─ GSAP scroll (landing only)  → 06-motion/gsap-scroll.md
   ├─ SVG path (Lintopus motion)  → 06-motion/svg-path.md
   ├─ Result reveal sequence      → 06-motion/result-reveal.md
   ├─ Performance budget          → 06-motion/perf-budget.md
   ├─ AI-template smell check     → 09-anti-patterns/ai-generated-smell.md
   ├─ Desktop layout waste check  → 09-anti-patterns/desktop-waste.md
   ├─ Drift kill (color/font/etc) → 09-anti-patterns/drift-kill-list.md
   ├─ Inline style rule           → 09-anti-patterns/inline-style-rule.md
   ├─ Fake stats ban              → 09-anti-patterns/fake-stats-ban.md
   ├─ Corporate VN translate ban  → 09-anti-patterns/corporate-translate.md
   ├─ Route → mode mapping        → 10-routes/route-mode-map.md
   └─ Reference analysis          → 11-references/* (synthesis what-we-borrow.md first)

2. Page hiện ở mode nào? (brand / brand-soft / ielts-authentic)
   → 04-modes/mode-switch-rules.md + 10-routes/route-mode-map.md

3. Có drift nào tồn tại trong file đang touch?
   → 09-anti-patterns/drift-kill-list.md (grep raw hex BAN, fix khi chạm)

4. Có signature moment nào kích hoạt? (first band, streak save, level up, error, empty)
   → 06-motion/result-reveal.md + 03-components/mascot.md (placement matrix)
```

## Critical rules quick-ref (top 10)

Nếu chỉ đọc 10 rule này, đây là 10 rule không được vi phạm:

| # | Rule | File chi tiết |
|---|------|---------------|
| 1 | **Tokens locked** — palette + type + radius đã ở `frontend/tailwind.config.ts` + `frontend/styles/globals.css`. KHÔNG invent. | `01-foundations/palette.md` |
| 2 | **Inline `style={{}}` rule** — bridge CSS var (`var(--color-*)`) OK. Raw hex BAN (e.g. `style={{ background: '#8B71EA' }}`). | `09-anti-patterns/inline-style-rule.md` |
| 3 | **Lintopus = `<Mascot>` component, KHÔNG raw `<img>`** ngoại trừ `landing/*` (LCP priority). | `03-components/mascot.md` |
| 4 | **Soul §1 lock** — Lintopus stand next to EVERY result page, win or loss (Battle/Reading/Writing/Speaking/Listening). | `03-components/result-card.md` + `02-layout/result-page-anatomy.md` |
| 5 | **Voice = "bạn cùng lớp"** peer particle (nhé/đi/cùng/với mình), em-dash rhythm, Vietnamese-first. KHÔNG corporate translate. | `05-voice/persona.md` + `05-voice/never-say-list.md` |
| 6 | **Desktop canvas rule** — Pattern C asymmetric (45% text + 38% visual + 160px gutter), max-width 1120px, 1440px reference. KHÔNG cram corner-trên-trái. | `02-layout/desktop-canvas.md` + `09-anti-patterns/desktop-waste.md` |
| 7 | **Mode boundary** — `data-mode="brand|brand-soft|ielts-authentic"` runtime swap via CSS variable override. KHÔNG hardcode mode-specific styling. | `04-modes/mode-switch-rules.md` |
| 8 | **Anti-AI-generated checklist** — 14-point check apply mọi page redesign trước khi ship. | `09-anti-patterns/ai-generated-smell.md` |
| 9 | **Path C code-only motion** — Framer Motion + GSAP + SVG path. NO Lottie / NO Rive / NO After Effects asset. | `06-motion/motion-philosophy.md` + `06-motion/perf-budget.md` |
| 10 | **No fake stats / fake testimonials / fake countdown urgency** — pre-launch honest framing only. | `09-anti-patterns/fake-stats-ban.md` |

## Directory map (Phase A COMPLETE — 51 files)

```
.claude/skills/lingona-design/
├── SKILL.md                              ← bạn đang đọc
│
├── 00-manifesto/                         [Phase A — DONE, 4 files, 896 lines]
│   ├── personality.md                    peer voice "bạn cùng lớp"
│   ├── what-we-are-not.md                NOT cartoon, NOT corporate, NOT AI-template, NOT audio character
│   ├── visual-vocabulary.md              warm + rigorous + companion (3-word essence)
│   └── recognizable-from-100ft.md        5 thứ identify Lingona screenshot
│
├── 01-foundations/                       [Phase A — DONE, 4 files, 1009 lines]
│   ├── palette.md                        canon hex + drift kill-list + Tailwind class map
│   ├── typography.md                     DM Sans + Playfair pairing playbook + Georgia/Arial swap (authentic)
│   ├── space-system.md                   8pt grid + breathing room ratios
│   └── radius-language.md                rounded-* — when sharp, when round, why
│
├── 02-layout/                            [Phase A — DONE, 6 files, 1721 lines]
│   ├── desktop-canvas.md                 Pattern C asymmetric 1440px, NOT corner-crowd
│   ├── mobile-rhythm.md                  single-column collapse + BottomNav 5-tab
│   ├── empty-space-philosophy.md         whitespace = confidence, ratio per page type
│   ├── hierarchy-stair.md                3-level visual hierarchy max
│   ├── result-page-anatomy.md            signature layout cho mọi result + Soul §1 mandatory
│   └── grid-vs-flow.md                   when grid (data), when flow (narrative)
│
├── 03-components/                        [Phase A — DONE, 8 files, 2936 lines]
│   ├── mascot.md                         Lintopus rules + 4 mood states + size matrix + placement table
│   ├── primary-button.md                 the TEAL button — voice/weight/motion/states
│   ├── card-language.md                  3 hierarchy levels + 3-zone structure + border-left rule
│   ├── modal-frozen.md                   Wave 2 modals — REFACTOR VISUAL ONLY (frozen logic)
│   ├── result-card.md                    sub-skill score card + delta + skill patterns + stagger
│   ├── battle-card.md                    queue/match/result trilogy + drama register VICTORY/DEFEAT
│   ├── streak-ring.md                    signature circular SVG element
│   └── band-progress.md                  canonical IELTS journey + validation guard
│
├── 04-modes/                             [Phase A — DONE, 4 files, 1707 lines]
│   ├── brand.md                          ~80% surface — gamified, peer voice, Lintopus, full palette
│   ├── brand-soft.md                     ~10% surface — Practice in-task bridge, Lintopus absent
│   ├── ielts-authentic.md                ~5% surface — Cambridge faithful, Georgia/Arial, sharp, English UI
│   └── mode-switch-rules.md              runtime hook + CSS var override + Tailwind bridge + transitions
│
├── 05-voice/                             [Phase A — DONE, 6 files, 1990 lines]
│   ├── persona.md                        bạn cùng lớp + pronoun lock mình/bạn + when to break peer
│   ├── tone-rhythm.md                    em-dash signature + sentence rhythm + 4 peer particles
│   ├── lintopus-bubble-text.md           bubble copy library by trigger + 50% mood-only rule
│   ├── microcopy-library.md              comprehensive VN microcopy table (button/toast/empty/etc.)
│   ├── battle-drama.md                   drama register exception VICTORY/DEFEAT/DRAW/LP/Rank
│   └── never-say-list.md                 12 categories banned phrases + corporate kill-list
│
├── 06-motion/                            [Phase A — DONE, 7 files, 2790 lines]
│   ├── motion-philosophy.md              5 core principles + when-to-animate decision tree
│   ├── duration-language.md              9-tier timing scale + per-use mapping + stagger 80ms
│   ├── framer-variants.md                Framer Motion library (12 variants + useNumberTick hook)
│   ├── gsap-scroll.md                    GSAP ScrollTrigger landing-only + 5 patterns + cleanup rules
│   ├── svg-path.md                       Lintopus subtle motion (breath/blink/wave) + line draw
│   ├── result-reveal.md                  result page choreography + Battle drama variant
│   └── perf-budget.md                    60fps mobile target + 6 perf rules + device test plan
│
├── 09-anti-patterns/                     [Phase A — DONE, 6 files, 2451 lines]
│   ├── ai-generated-smell.md             15 AI-template tells (mock chat, glassmorphism, gradient text)
│   ├── desktop-waste.md                  10 narrow-mobile-on-desktop patterns
│   ├── drift-kill-list.md                exhaustive drift catalog + pre-commit script
│   ├── inline-style-rule.md              when CSS var bridge OK, when raw inline BAN
│   ├── fake-stats-ban.md                 NO fabricated stats/testimonials/press/awards
│   └── corporate-translate.md            15 corporate VN patterns + replace catalog
│
├── 10-routes/                            [Phase A — DONE, 1 file, 379 lines]
│   └── route-mode-map.md                 every Lingona route × mode + resolveModeFromPathname + tests
│
└── 11-references/                        [Phase A — DONE, 4 files, 616 lines]
    ├── jschallenger-extract.md           layout sạch, text-first, no icon overload
    ├── duolingo-extract.md               gamification skeleton YES, cartoon NO
    ├── study4-extract.md                 IELTS authenticity YES, corporate NO
    └── what-we-borrow.md                 synthesis matrix + Lingona positioning equation

[Phase B — emerges từ page-by-page redesign Wave 6 Sprint 2-8]
├── 07-moments/                           signature emotional moments (per-moment specs)
├── 08-illustration/                      beyond Lintopus (decoration, icon, scene)
└── 12-playbooks/                         workflow recipe ("redesign a page Lingona-style")
```

**Total Phase A**: 51 files, ~16,720 lines, 9 commits across 8 batches (Apr 30 → May 2, 2026).

## Default skill activation pattern

Mỗi UI task Claude Code:

```
Activate (default trio):
  - senior-engineer
  - systematic-debugging
  - verification-before-completion

Activate (Lingona UI):
  - impeccable                  ← keystone (project fork frontend-design)
  - lingona-design              ← THIS skill (token + voice + Lintopus + 3-mode + motion + anti-patterns)

Add per task type:
  - postgres-pro                ← migration (KHÔNG cho Wave 6 frontend)
  - react-expert                ← React 18+ patterns
  - nextjs-developer            ← App Router 14
  - fixing-accessibility        ← Wave 6 a11y polish phase
  - audit                       ← Wave 6 P0–P3 polish phase
  - critique                    ← UX evaluation post-redesign
  - polish                      ← pre-ship pass
```

KHÔNG dùng cho Wave 6:
- `brand-guidelines` (Anthropic brand, không Lingona) — DELETE candidate
- `ui-skills` (npm package source, không phải skill) — DELETE candidate
- `frontend-design` global (đã shadow bởi `impeccable` project fork) — DISABLED
- `ui-ux-pro-max` (paradigm clash với lingona-design tokens) — DISABLED
- `nextjs-turbopack` (Next 16+, Lingona on Next 14) — DISABLED
- `bolder` / `overdrive` / `quieter` / `distill` (push-limits / strip-essence — không match Wave 6 build-new direction)
- `optimize` / `fixing-motion-performance` (defer Wave 7 perf)
- `fixing-metadata` (Wave 4 đã ship og-image)
- `architecture-designer` (backend pattern)

## When NOT to use lingona-design

- Backend code (Node.js/Express/Postgres) — không UI
- DB migration, schema, query — postgres-pro
- API endpoint design — không UI
- Email template (Resend) — text-only, không token apply
- Pure logic refactor không touch JSX/CSS — senior-engineer + systematic-debugging đủ
- BaoLuX agent code (separate project) — separate skill

## Failure modes (khi skill BỊ MẤT TÁC DỤNG)

Nếu Claude Code activate skill này nhưng vẫn:

1. Đề xuất `bg-emerald-500` thay vì `bg-teal-*` cho semantic accent → re-read `01-foundations/palette.md` + `09-anti-patterns/drift-kill-list.md`
2. Đề xuất raw hex inline style → re-read `09-anti-patterns/inline-style-rule.md`
3. Đề xuất English microcopy "Get Started" / "Empower your journey" → re-read `05-voice/never-say-list.md` + `09-anti-patterns/corporate-translate.md`
4. Đề xuất Lintopus chỉ ở 1 place (missing from result page) → re-read `03-components/mascot.md` (Soul §1 + placement matrix)
5. Đề xuất layout cram text vô góc trên-trái → re-read `02-layout/desktop-canvas.md` + `09-anti-patterns/desktop-waste.md`
6. Đề xuất Lottie / Rive / After Effects asset → ban (Path C code-only locked Wave 6) — re-read `06-motion/motion-philosophy.md`
7. Đề xuất "2000+ học viên" hoặc fake testimonial → re-read `09-anti-patterns/fake-stats-ban.md`
8. Đề xuất bouncy spring animation → re-read `06-motion/motion-philosophy.md` (calm > energetic)
9. Đề xuất rounded-3xl uniform khắp nơi → re-read `01-foundations/radius-language.md` (mixed scale signal)
10. Mode bleed (teal CTA inside ielts-authentic page) → re-read `04-modes/mode-switch-rules.md`

Báo Louis nếu skill content KHÔNG match codebase reality — fix skill chứ KHÔNG ignore.

## Maintenance contract

Skill này là **living document**. Update rule:

- BRAND token thay đổi → update `01-foundations/palette.md` + Tailwind config + globals.css **cùng lúc** (atomic commit)
- New signature moment phát hiện trong page-by-page work → add `07-moments/*.md` (Phase B)
- New component pattern emerge → add `03-components/*.md`
- New anti-pattern catch trong audit → add `09-anti-patterns/*.md`
- New route added → update `10-routes/route-mode-map.md` + `resolveModeFromPathname` regex + unit test

KHÔNG update skill in vacuum. Phải có **codebase evidence** (commit hash, file path, screenshot) trong mỗi update.

## Workflow lessons (Phase A meta)

Lessons learned khi build Phase A skill:

- **Markdown linkification corruption**: Inline-pasted megaprompts trong Claude.ai chat panel → markdown renderer encode `[file.md](path)` thành `[[file.md](http://file.md)](http://file.md)` → bash heredoc target có brackets/parens → glob/subshell error. **Fix**: Always download mega-prompts as `.txt` attachment, paste from raw text editor (Notepad/VSCode), KHÔNG copy từ chat preview. Heredoc `sed | bash` extraction restored.
- **Atomic commit per batch**: 1 commit per logical batch, NO branch (Louis solo, FREE_PERIOD). 9 commits across 8 batches lineage clean.
- **Pre-flight discovery mandatory**: Phase 1 check (git status + existing file count + folder absence + last commit) before Phase 2 file creation. Stops partial-batch state.
- **Verification phase mandatory**: Phase 3 file count + path list + line count sanity. Catches missing/corrupt files.
- **Push at end MANDATORY**: "Committed" ≠ pushed. Explicit `git push origin main` per batch.

## Version

**v1.0** — 2026-05-02 — Phase A COMPLETE. 51 files, ~16,720 lines. Wave 6 Sprint 1 ready.

Phase A batch lineage:
- Batch 1-3 (commit 6cb3ce1, Apr 30): manifesto + foundations + layout (14 files, 3851 lines)
- Batch 4 (a6d2f6a): components (8 files, 2936 lines)
- Batch 5 (7f614de): modes (4 files, 1707 lines)
- Batch 6 (d3e96db): voice (6 files, 1990 lines)
- Batch 7 (a9a7a01): motion (7 files, 2790 lines)
- Batch 8 (264202a): anti-patterns (6 files, 2451 lines)
- Batch 9+10 (17e9784, May 2): routes + references (5 files, 995 lines)

Phase B (07-moments / 08-illustration / 12-playbooks) emerges from Wave 6 Sprint 2-8 page-by-page work. KHÔNG ship Phase B speculatively — let real page work surface real moments.

Wave 6 12-week sprint plan (kicks off Sprint 2):
- Sprint 1: SKILL.md update + skill verification (this commit)
- Sprint 2: Landing redesign 2D
- Sprint 3: Auth flow rebuild
- Sprint 4: Onboarding rebuild
- Sprint 5: Writing flow rebuild
- Sprint 6: Speaking flow rebuild
- Sprint 7: Reading polish + back nav fix
- Sprint 8: Settings + Profile + Battle + Pricing 199k
