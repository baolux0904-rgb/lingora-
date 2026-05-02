# JS Challenger reference — what we borrow

JavaScript Challenger (jschallenger.com) — coding practice site. Per Wave 6 audit comparison: **23/35** score. Above Lingona current (18/35), below Duolingo (34/35).

## Why reference

JS Challenger does **clean text-first layout** that respects content density. No gimmicks, no AI-template. Solid principles Lingona can borrow.

## What we borrow (3 things)

### 1. Clean text-first layout

JS Challenger landing has minimal decoration. Headline + value prop + simple example code block. NO mock chat, NO floating gradient blobs, NO fake testimonials.

Lingona equivalent:
```
Landing hero = Lintopus (visual anchor) + Vietnamese headline + value prop + CTA.
NO decoration noise.
```

Per `02-layout/desktop-canvas.md` Pattern C. JS Challenger's text-first principle aligns.

### 2. Sober color palette

JS Challenger uses minimal color: dark bg + accent yellow for syntax highlighting + white text. Restraint.

Lingona equivalent:
```
Cream + Navy + Teal CTA only. KHÔNG rainbow.
Per `01-foundations/palette.md`.
```

Restraint = signal. Both Lingona and JS Challenger achieve identity through restraint.

### 3. Practice-first content density

JS Challenger lists 100+ challenges in compact grid. User can scan + start any quickly. NO bloated card design.

Lingona equivalent:
```
Reading Practice list shows 56 passages compact format.
Battle history compact list.
Achievement gallery compact grid.
```

KHÔNG bloated decoration per `02-layout/empty-space-philosophy.md` for list pages (content-dominant).

## What we DON'T borrow (3 things)

### 1. Code editor as primary UI

JS Challenger = code-focused tool. Editor takes 70% of screen. Lingona = IELTS, NOT code. Skip code editor pattern.

### 2. Cold "developer" register

JS Challenger uses developer-direct tone (no warm peer). Lingona = peer voice "bạn cùng lớp" mềm. Per `05-voice/persona.md`.

### 3. Dark mode default

JS Challenger defaults to dark theme. Lingona = warm cream brand identity. KHÔNG dark default. Dark mode optional (user setting).

## Score breakdown — JS Challenger vs Lingona current

| Dimension | JS Challenger | Lingona current | Lingona Wave 6 target |
|-----------|---------------|-----------------|----------------------|
| Clarity of purpose | 5/5 | 3/5 | 5/5 |
| Visual restraint | 5/5 | 2/5 | 5/5 |
| Content density | 5/5 | 3/5 | 4/5 |
| Asymmetric breathing | 2/5 | 2/5 | 5/5 |
| Mascot/personality | 0/5 | 4/5 | 5/5 |
| Mobile responsiveness | 3/5 | 4/5 | 4/5 |
| Loading perceived perf | 3/5 | 3/5 | 4/5 |
| **Total** | **23/35** | **18/35** | **32/35** |

Lingona has Lintopus advantage. Wave 6 redesign closes restraint gap.

## See also

- `02-layout/desktop-canvas.md` — Pattern C asymmetric (more breathing than JS Challenger)
- `02-layout/empty-space-philosophy.md` — content density per page type
- `01-foundations/palette.md` — color restraint
- `11-references/duolingo-extract.md` — gamification reference
- `11-references/study4-extract.md` — IELTS-authentic reference
- `11-references/what-we-borrow.md` — synthesis
