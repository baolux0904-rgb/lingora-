---
name: lingona-design
description: Lingona's distinctive design system — palette, typography, layout philosophy, Lintopus mascot rules, "bạn cùng lớp" peer voice, dual-mode (brand / brand-soft / IELTS-authentic), motion patterns (Framer Motion + GSAP, no AE/Lottie/Rive), and anti-AI-generated visual rules. ALWAYS load this skill when working on ANY Lingona UI task — page redesign, new component, fixing inline styles, writing microcopy, choosing colors, designing animations, or anything that touches frontend/components, frontend/app, frontend/styles. Do not invent tokens, palettes, or voice — they are codified here. Use alongside `impeccable` (generic distinctive UI craft) and `senior-engineer` + `verification-before-completion`.
---

# Lingona Design

Skill này codify Lingona's distinctive design system. KHÔNG phải tài liệu inspirational — đây là **decision rules** để mỗi UI task ship out đúng identity, KHÔNG drift, KHÔNG AI-generated.

## Why this exists

Pre-Wave-6 audit (Apr 29, 2026) found:

- 3 design system coexist trong codebase
- 2080 occurrence của `style={{}}` (phần lớn OK — bridge CSS var; nhỏ nhưng nguy hiểm — raw hex hardcoded như `#8B71EA`, `#7E4EC1`, `#F07167`, `#2DD4BF`)
- Drift: `bg-emerald-500` (40 hits) + `bg-amber-500` (32 hits) > `bg-teal-*` (3 hits) — semantic accent đang lệch BRAND
- Voice scattered across files chưa codify
- Layout pattern "cram text vô góc trên-trái, để trống 80% screen" trên desktop — anti-pattern call out by Louis

Pre-Wave-6 KHÔNG có single source of truth. Skill này chính là source.

## Core identity (one paragraph)

**Lingona** = IELTS prep app cho Vietnamese teen 16–25, đặt **Study4 IELTS authenticity** + **Duolingo gamification skeleton** + **JS Challenger sạch text-first layout** trong vỏ **Vietnamese peer voice ("bạn cùng lớp")** với **Lintopus** companion mascot. KHÔNG phải Duolingo cartoon. KHÔNG phải Study4 corporate. KHÔNG phải Linear cold. KHÔNG phải v0/Lovable AI-template.

Đọc `00-manifesto/` để hiểu sâu identity, KHÔNG bỏ qua nếu lần đầu chạm Lingona.

## Quick-start decision tree

Khi bắt đầu Lingona UI task, hỏi 4 câu:

```
1. Task touch component nào?
   ├─ palette / màu sắc          → 01-foundations/palette.md
   ├─ typography                  → 01-foundations/typography.md
   ├─ spacing / radius            → 01-foundations/space-system.md + radius-language.md
   ├─ layout / desktop canvas     → 02-layout/* (BẮT BUỘC nếu redesign page)
   ├─ Lintopus placement          → 03-components/mascot.md
   ├─ Result page (Battle/        → 03-components/result-card.md
      Reading/Writing/Speaking)     + 02-layout/result-page-anatomy.md
   ├─ Battle UI                   → 03-components/battle-card.md
   ├─ Modal (DeleteAccount/       → 03-components/modal-frozen.md (REFACTOR VISUAL ONLY)
      ChangeEmail/Username)
   ├─ Microcopy / error / empty   → 05-voice/microcopy-library.md
   ├─ Animation / transition      → 06-motion/*
   ├─ Routing decision (page mode) → 04-modes/* + 10-routes/route-mode-map.md
   └─ Anything else               → 09-anti-patterns/* (verify KHÔNG vi phạm rule cứng)

2. Page hiện ở mode nào? (brand / brand-soft / IELTS-authentic)
   → 04-modes/mode-switch-rules.md + 10-routes/route-mode-map.md

3. Có drift nào tồn tại trong file đang touch?
   → 09-anti-patterns/drift-kill-list.md (grep raw hex BAN, fix khi chạm)

4. Có signature moment nào kích hoạt? (first band, streak save, level up, error, empty)
   → 07-moments/* (Phase B — chưa ship hết, default tới 03-components/)
```

## Critical rules quick-ref (top 8)

Nếu chỉ đọc 8 rule này, đây là 8 rule không được vi phạm:

| # | Rule | File chi tiết |
|---|------|---------------|
| 1 | **Tokens locked** — palette + type + radius đã ở `frontend/tailwind.config.ts` + `frontend/styles/globals.css`. KHÔNG invent. | `01-foundations/palette.md` |
| 2 | **Inline `style={{}}` rule** — bridge CSS var (`var(--color-*)`) OK. Raw hex BAN (e.g. `style={{ background: '#8B71EA' }}`). | `09-anti-patterns/inline-style-rule.md` |
| 3 | **Lintopus = `<Mascot>` component, KHÔNG raw `<img>`** ngoại trừ `landing/*` (LCP priority). | `03-components/mascot.md` |
| 4 | **Soul §1 lock** — Lintopus stand next to EVERY result page, win or loss (Battle/Reading/Writing/Speaking). | `03-components/result-card.md` |
| 5 | **Voice = "bạn cùng lớp"** peer particle (nhé/cùng/mình), em-dash rhythm, Vietnamese-first. KHÔNG corporate translate. | `05-voice/persona.md` + `05-voice/never-say-list.md` |
| 6 | **Desktop canvas rule** — content max-width 1120px center, side gutter ≥ 160px, vertical rhythm 96/48/24px. KHÔNG cram corner-trên-trái. | `02-layout/desktop-canvas.md` |
| 7 | **Mode boundary** — `/(app)/exam/{reading,writing,speaking,listening}` runtime switch theo `EXAM_UX[mode]`. KHÔNG hardcode mode. | `04-modes/mode-switch-rules.md` |
| 8 | **Anti-AI-generated checklist** apply mọi page redesign trước khi ship (12-point check). | `09-anti-patterns/ai-generated-smell.md` |

## Directory map (V2 phased — Phase A shipped, Phase B emerges from page-by-page work)

```
.claude/skills/lingona-design/
├── SKILL.md                              ← bạn đang đọc
│
├── 00-manifesto/                         [Phase A — DONE]
│   ├── personality.md                    peer voice "bạn cùng lớp"
│   ├── what-we-are-not.md                NOT cartoon, NOT corporate, NOT AI-template
│   ├── visual-vocabulary.md              warm + rigorous + companion (3-word essence)
│   └── recognizable-from-100ft.md        5 thứ identify Lingona screenshot
│
├── 01-foundations/                       [Phase A — pending batch 2]
│   ├── palette.md                        canon hex + drift kill-list + Tailwind class map
│   ├── typography.md                     DM Sans + Playfair pairing playbook
│   ├── space-system.md                   8pt grid + breathing room ratios
│   └── radius-language.md                rounded-* — when sharp, when round, why
│
├── 02-layout/                            [Phase A — pending batch 3]
│   ├── desktop-canvas.md                 use 1440px properly, NOT corner-crowd
│   ├── mobile-rhythm.md                  single-column scroll cadence
│   ├── empty-space-philosophy.md         whitespace = confidence
│   ├── hierarchy-stair.md                3-level visual hierarchy max
│   ├── result-page-anatomy.md            signature layout cho mọi result
│   └── grid-vs-flow.md                   when grid, when free flow
│
├── 03-components/                        [Phase A — pending batch 4]
│   ├── mascot.md                         Lintopus rules + mood map + size system
│   ├── primary-button.md                 the BLUE button — voice/weight/motion
│   ├── card-language.md                  how cards breathe + nest
│   ├── modal-frozen.md                   Wave 2 modals — REFACTOR VISUAL ONLY
│   ├── result-card.md                    band + feedback + Lintopus
│   ├── battle-card.md                    queue/match/result trilogy
│   ├── streak-ring.md                    signature element
│   └── band-progress.md                  canonical progress viz
│
├── 04-modes/                             [Phase A — pending batch 5]
│   ├── brand.md                          navy + teal + DM Sans — playful confident
│   ├── brand-soft.md                     cream wash — Practice mode
│   ├── ielts-authentic.md                Cambridge-real — Full Test / Battle Ranked
│   └── mode-switch-rules.md              transition rules + EXAM_UX[mode] hook
│
├── 05-voice/                             [Phase A — pending batch 6]
│   ├── persona.md                        peer voice "bạn cùng lớp"
│   ├── tone-rhythm.md                    em-dash + peer particles
│   ├── lintopus-speaks.md                khi Lintopus có voice, khi M có voice
│   ├── microcopy-library.md              loading/empty/error/success template
│   ├── battle-drama.md                   VICTORY/DEFEAT — earned không generic
│   └── never-say-list.md                 corporate translate ban
│
├── 06-motion/                            [Phase A — pending batch 7]
│   ├── motion-philosophy.md              why move + when DON'T
│   ├── duration-language.md              fast/normal/slow + meaning per use
│   ├── framer-variants.md                page transition / hover / tap / stagger
│   ├── gsap-scroll.md                    landing-only scroll choreography
│   ├── svg-path.md                       Lintopus arm wave / blink / bounce
│   ├── result-reveal.md                  signature: result page coming alive
│   └── perf-budget.md                    60fps lock, NO layout thrash
│
├── 09-anti-patterns/                     [Phase A — pending batch 8]
│   ├── ai-generated-smell.md             12-point checklist
│   ├── desktop-waste.md                  corner-crowd ban
│   ├── drift-kill-list.md                #8B71EA + #7E4EC1 + #F07167 + #2DD4BF + emerald/amber over-use
│   ├── inline-style-rule.md              CSS var bridge OK, raw hex BAN
│   ├── fake-stats-ban.md                 "1,234 Online" without DB
│   └── corporate-translate.md            "Empower your journey" never
│
├── 10-routes/                            [Phase A — pending batch 9]
│   └── route-mode-map.md                 every route × mode classification
│
└── 11-references/                        [Phase A — pending batch 10]
    ├── jschallenger-extract.md           layout sạch, text-first, no icon overload
    ├── duolingo-extract.md               gamification skeleton YES, cartoon NO
    ├── study4-extract.md                 IELTS authenticity YES, corporate NO
    └── what-we-borrow-from-each.md       synthesis matrix

[Phase B — emerges từ page-by-page redesign Wave 6]
├── 07-moments/                           signature emotional moments
├── 08-illustration/                      beyond Lintopus (decoration, icon, scene)
└── 12-playbooks/                         workflow recipe ("redesign a page Lingona-style")
```

## Default skill activation pattern

Mỗi UI task Claude Code:

```
Activate (default trio):
  - senior-engineer
  - systematic-debugging
  - verification-before-completion

Activate (Lingona UI):
  - impeccable                  ← keystone (project fork frontend-design)
  - lingona-design              ← THIS skill (token + voice + Lintopus + dual-mode)

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
- `frontend-design` global (đã shadow bởi `impeccable` project fork) — DISABLE
- `ui-ux-pro-max` (paradigm clash với lingona-design tokens) — DISABLE
- `nextjs-turbopack` (Next 16+, Lingona on Next 14) — DISABLE
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

## Failure modes (khi skill BỊ MẤT TÁC DỤNG)

Nếu Claude Code activate skill này nhưng vẫn:

1. Đề xuất `bg-emerald-500` thay vì `bg-teal-*` cho semantic accent → re-read `01-foundations/palette.md`
2. Đề xuất raw hex inline style → re-read `09-anti-patterns/inline-style-rule.md`
3. Đề xuất English microcopy "Get Started" / "Empower your journey" → re-read `05-voice/never-say-list.md`
4. Đề xuất Lintopus chỉ ở 1 place → re-read `03-components/mascot.md` (Soul §1)
5. Đề xuất layout cram text vô góc trên-trái → re-read `02-layout/desktop-canvas.md`
6. Đề xuất Lottie / Rive / After Effects asset → ban (Path C code-only locked Wave 6)

Báo Louis nếu skill content KHÔNG match codebase reality — fix skill chứ KHÔNG ignore.

## Maintenance contract

Skill này là **living document**. Update rule:

- BRAND token thay đổi → update `01-foundations/palette.md` + Tailwind config + globals.css **cùng lúc** (atomic commit)
- New signature moment phát hiện trong page-by-page work → add `07-moments/*.md`
- New component pattern emerge → add `03-components/*.md`
- New anti-pattern catch trong audit → add `09-anti-patterns/*.md`

KHÔNG update skill in vacuum. Phải có **codebase evidence** (commit hash, file path, screenshot) trong mỗi update.

## Version

**v1.0** — 2026-04-30 — Wave 6 Phase 0 ship. Phase A batch 1 (manifesto). Phase A batch 2-10 pending. Phase B (moments / illustration / playbooks) emerges từ Wave 6 page-by-page work.
