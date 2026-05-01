# Battle card — queue, match, result

Battle = Lingona's gamification flagship. Codebase verified Soul §1 implemented in `BattleResult.tsx`. Visual signature uses **drama register** — Playfair Italic + ALL CAPS English (VICTORY/DEFEAT/DRAW) + bigger type than rest of app.

Battle has 3 distinct card states: **Queue** / **Match in-progress** / **Result**. Each has specific layout pattern.

## Drama register rules (Battle-only)

Most of Lingona = Vietnamese peer voice mềm. Battle = drama register sharper:

| Element | Brand mode | Battle drama |
|---------|-----------|--------------|
| Result label | "Bạn đạt Band 7.0" | `VICTORY` / `DEFEAT` / `DRAW` (English ALL CAPS) |
| Font | DM Sans + Playfair Italic | Playfair Italic dominant + bold weight |
| Type size | text-3xl/4xl | text-5xl/6xl/7xl |
| Color accent | teal | teal/error/gray strong contrast |
| Animation | subtle | reveal stagger more pronounced |
| Sound? | NO | NO (Lintopus = silent app) |

Drama register = **Battle exclusive**. KHÔNG apply VICTORY/DEFEAT pattern to Reading/Writing/Speaking/Listening result.

## 1. Battle queue card (waiting opponent)

```tsx
<div className="
  bg-cream border border-gray-200 rounded-xl
  p-8
  flex flex-col items-center text-center
  max-w-md mx-auto
">
  <Mascot size={100} mood="thinking" />
  
  <h2 className="mt-6 text-2xl font-display italic text-navy">
    Đang tìm đối thủ...
  </h2>
  
  <div className="mt-6">
    <div className="text-5xl font-display italic text-navy tabular-nums">
      {formatTime(elapsed)}
    </div>
    <p className="mt-2 text-sm text-gray-600">
      Trung bình {avgQueueSeconds}s
    </p>
  </div>
  
  <div className="mt-6 w-full">
    <button onClick={handleCancel} className="secondary-button w-full">
      Hủy tìm trận
    </button>
  </div>
  
  <div className="mt-4 text-xs text-gray-500">
    Rank: {rank} · {leaguePoints} LP
  </div>
</div>
```

| Element | Value |
|---------|-------|
| Mascot | 100px, mood `thinking` (alert curious) |
| Headline | "Đang tìm đối thủ..." (`text-2xl font-display italic`) |
| Timer | `text-5xl font-display italic tabular-nums` |
| Cancel button | full-width secondary |
| Rank context | bottom small text |

KHÔNG show opponent details until match found (suspense). KHÔNG progress bar (queue time variable).

### Queue states

| State | Visual |
|-------|--------|
| Searching | mascot `thinking` + timer counting up |
| Match found | mascot `happy` + opponent username flash + `text-2xl` count down "3, 2, 1..." |
| Cancelled | redirect back to Battle tab home |
| Timeout (>60s) | mascot `default` + message "Không tìm thấy. Thử lại?" + retry button |

## 2. Battle match in-progress card

Battle in-progress = focus mode. NO Lintopus (per `03-components/mascot.md` placement matrix). Layout 6/6 split — your side left + opponent side right.

```tsx
<div className="grid grid-cols-2 gap-6">
  {/* YOUR SIDE */}
  <div className="bg-cream border-2 border-teal rounded-lg p-6">
    <header className="flex items-center justify-between mb-4">
      <div>
        <p className="text-sm text-gray-600">Bạn</p>
        <p className="text-lg font-display italic text-navy">{username}</p>
      </div>
      <div className="text-right">
        <div className="text-3xl font-display italic text-teal">
          {yourScore}
        </div>
        <p className="text-xs text-gray-500">điểm</p>
      </div>
    </header>
    
    <div className="space-y-3">
      {questions.map((q, i) => (
        <QuestionRow
          key={q.id}
          question={q}
          answered={yourAnswers[i] != null}
          correct={isCorrect(yourAnswers[i], q)}
        />
      ))}
    </div>
  </div>
  
  {/* OPPONENT SIDE */}
  <div className="bg-cream border border-gray-200 rounded-lg p-6 opacity-90">
    <header className="flex items-center justify-between mb-4">
      <div>
        <p className="text-sm text-gray-600">Đối thủ</p>
        <p className="text-lg font-display italic text-navy">{opponent.username}</p>
      </div>
      <div className="text-right">
        <div className="text-3xl font-display italic text-gray-700">
          {oppScore}
        </div>
        <p className="text-xs text-gray-500">điểm</p>
      </div>
    </header>
    
    <div className="space-y-3">
      {questions.map((q, i) => (
        <QuestionRow
          key={q.id}
          question={q}
          answered={oppAnswers[i] != null}
          correct={null}  /* hide opponent correctness until reveal */
          masked
        />
      ))}
    </div>
  </div>
</div>
```

Your side highlighted (`border-2 border-teal`). Opponent side neutral (`border-gray-200` + `opacity-90` slight de-emphasis).

Question row pattern:

```tsx
<div className="flex items-center gap-3 p-3 rounded-md bg-cream">
  <span className="text-sm font-mono text-gray-500 w-6">
    {i + 1}.
  </span>
  
  {answered ? (
    correct ? (
      <Check className="w-5 h-5 text-teal" />
    ) : (
      <X className="w-5 h-5 text-error" />
    )
  ) : (
    <Loader className="w-5 h-5 text-gray-400 animate-pulse" />
  )}
  
  <span className="flex-1 text-sm text-navy truncate">
    {masked ? '...' : q.label}
  </span>
}
</div>
```

Real-time sync via Socket.IO (codebase). Opponent answer state revealed live but answer content masked until match end.

## 3. Battle result card (Soul §1 verified)

```tsx
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
  {/* LEFT — Big result moment */}
  <div className="lg:col-span-7">
    <div className="text-7xl font-display italic font-bold text-navy uppercase tracking-tight">
      {result === 'victory' ? 'VICTORY' : result === 'defeat' ? 'DEFEAT' : 'DRAW'}
    </div>
    <div className="mt-4 text-2xl text-gray-600">
      {yourScore} : {oppScore}
    </div>
    <p className="mt-2 text-base text-gray-700">
      Đối thủ: {opponent.username}
    </p>
  </div>
  
  {/* RIGHT — Lintopus */}
  <div className="lg:col-span-5 flex flex-col items-center lg:items-end gap-3">
    <Mascot
      size={120}
      mood={getMoodFromBattleResult(result)}
      bubble={getBattleBubble(result)}
    />
  </div>
</div>

{/* Stats below — sub-skill cards */}
<div className="mt-12 grid grid-cols-2 gap-4">
  <ResultCard
    label="Bạn"
    score={yourScore}
    maxScore={10}
    highlight={result === 'victory'}
  />
  <ResultCard
    label="Đối thủ"
    score={oppScore}
    maxScore={10}
    highlight={result === 'defeat'}
  />
</div>

{/* LP change */}
<div className="mt-6 flex items-center justify-center gap-4">
  <div className="text-center">
    <p className="text-xs text-gray-500">Rank</p>
    <p className="text-lg font-display italic text-navy">{rank}</p>
  </div>
  <div className="text-center">
    <p className="text-xs text-gray-500">LP</p>
    <p className={`text-2xl font-display italic ${lpDelta > 0 ? 'text-teal' : 'text-error'}`}>
      {lpDelta > 0 ? '+' : ''}{lpDelta}
    </p>
  </div>
  <div className="text-center">
    <p className="text-xs text-gray-500">Streak</p>
    <p className="text-lg font-display italic text-navy">{winStreak}W</p>
  </div>
</div>

{/* Action row */}
<div className="mt-8 flex items-center justify-center gap-6">
  <button className="primary-button-large font-display italic">
    Đấu nữa
  </button>
  <a href="/battle/history" className="text-base text-teal-dark hover:underline">
    Xem lịch sử →
  </a>
</div>
```

### VICTORY card

- Mascot mood `happy` + bubble "Top form đấy"
- LP change `+22 LP` teal
- Win streak counter highlighted
- Primary CTA "Đấu nữa"

### DEFEAT card

- Mascot mood `default` (KHÔNG `sad` — drama not earned per `03-components/mascot.md`) + bubble "Lintopus đợi bạn ở vòng tiếp theo"
- LP change `-15 LP` error color (factual, KHÔNG dramatize)
- Win streak reset to 0 if was on streak
- Primary CTA "Luyện lại" (recovery focus, NOT "Đấu nữa" pushy)

### DRAW card

- Mascot mood `thinking` + no bubble
- LP change `+0 LP` neutral
- Primary CTA "Đấu nữa"

## VICTORY/DEFEAT/DRAW typography

Font + size + weight rules:

```css
/* Victory/Defeat/Draw heading */
.battle-result-heading {
  font-family: var(--font-display);  /* Playfair */
  font-style: italic;
  font-weight: 700;  /* bold — Battle exception, normally Lingona uses 500-600 */
  text-transform: uppercase;
  letter-spacing: -0.02em;  /* tracking-tight */
  font-size: 7xl;  /* 72-96px responsive */
  line-height: 1;
  color: var(--color-navy);
}
```

Why English ALL CAPS:
- IELTS Speaking/Reading exam itself = English context
- VICTORY/DEFEAT recognizable globally (game register)
- Vietnamese teen 16-25 fluent English consumption (gaming, social)
- "CHIẾN THẮNG" / "THẤT BẠI" Vietnamese = clunky, not gamified register

KHÔNG translate VICTORY/DEFEAT to VN. Lock English ALL CAPS for Battle drama register.

## Battle gate (not-met state)

Battle requires user to complete 5 practice sessions before queue access (per codebase). Gate state:

```tsx
<div className="bg-cream border border-gray-200 rounded-xl p-8 text-center">
  <Mascot size={100} mood="default" />
  
  <h2 className="mt-6 text-2xl font-display italic text-navy">
    Sắp sẵn sàng vào trận
  </h2>
  
  <p className="mt-3 text-base text-gray-700 max-w-md mx-auto">
    Hoàn thành {requiredSessions} bài luyện để mở khóa Battle.
  </p>
  
  <div className="mt-6 max-w-xs mx-auto">
    <div className="text-sm text-gray-600 mb-2 flex items-center justify-between">
      <span>Tiến độ</span>
      <span>{completedSessions} / {requiredSessions}</span>
    </div>
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-teal transition-all duration-500"
        style={{ width: `${(completedSessions / requiredSessions) * 100}%` }}
      />
    </div>
  </div>
  
  <button className="mt-8 primary-button">
    Luyện 1 bài
  </button>
</div>
```

Voice rule:
- ✅ "Sắp sẵn sàng vào trận"
- ✅ "Hoàn thành 5 bài luyện để mở khóa"
- ❌ "You need to complete 5 sessions" (English)
- ❌ "Vui lòng hoàn thành 5 bài" (corporate VN)

## Rank tier system

Per codebase: Iron → Bronze → Silver → Gold → Platinum → Diamond → Master → Challenger

Rank badge inline:

```tsx
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-{tier}-50 border border-{tier}-200">
  <RankIcon tier={rank} className="w-4 h-4" />
  <span className="text-sm font-medium text-{tier}-700">
    {rank} {division}
  </span>
</div>
```

Tier colors (visual differentiation):

| Tier | Color accent |
|------|--------------|
| Iron | gray |
| Bronze | amber dark |
| Silver | gray-400 metallic |
| Gold | gold `#FFD700` |
| Platinum | teal-light |
| Diamond | teal |
| Master | navy + teal accent |
| Challenger | navy + gold accent |

Higher tier = brighter/distinct color. Lower tier = muted.

## Battle history list item

```tsx
<div className="bg-cream border border-gray-200 rounded-md p-4 flex items-center gap-4 hover:border-teal transition-colors">
  <div
    className="w-12 h-12 rounded-md flex items-center justify-center text-xl font-display italic font-bold"
    style={{
      background: result === 'victory' ? 'var(--color-teal-50)' : 'var(--color-gray-100)',
      color: result === 'victory' ? 'var(--color-teal)' : 'var(--color-gray-700)',
    }}
  >
    {result === 'victory' ? 'W' : result === 'defeat' ? 'L' : 'D'}
  </div>
  
  <div className="flex-1 min-w-0">
    <p className="text-sm font-medium text-navy">
      vs {opponent.username}
    </p>
    <p className="text-xs text-gray-500">
      {formatRelative(timestamp)} · {yourScore} - {oppScore}
    </p>
  </div>
  
  <div className="text-right">
    <p className={`text-sm font-medium ${lpDelta > 0 ? 'text-teal' : 'text-error'}`}>
      {lpDelta > 0 ? '+' : ''}{lpDelta} LP
    </p>
  </div>
</div>
```

W/L/D badge left, opponent + time middle, LP delta right. Compact list pattern.

## Anti-patterns

❌ "VICTORY" rendered with rainbow gradient (gimmicky AI-template)
❌ Confetti emoji 🎉🎊✨ spam (over-celebrate)
❌ Battle Result missing Lintopus (Soul §1 violation)
❌ DEFEAT mascot mood `sad` (drama not earned — use `default`)
❌ "GREAT JOB!" English copy outside VICTORY/DEFEAT/DRAW (translate)
❌ Background gradient `from-teal to-purple` (palette canon only)
❌ Match in-progress with Lintopus visible (focus mode anti)
❌ Queue without timer (user lost feedback)
❌ Translate VICTORY → "CHIẾN THẮNG" (KHÔNG locked English)
❌ Sub-skill cards more than 2 in Battle result (Battle = 2-side, not 4-criteria)
❌ Battle history list with avatar 64px (too prominent — keep 48px)
❌ LP delta without sign (`+22` good, `22` ambiguous)

## Audit checklist

```
1. Queue card has Lintopus thinking + timer? ✓
2. Match in-progress NO Lintopus (focus mode)? ✓
3. Match split 2-column (your left + opponent right)? ✓
4. Result page Lintopus mood-aware (Soul §1)? ✓
5. VICTORY/DEFEAT/DRAW English ALL CAPS Playfair Italic bold? ✓
6. LP delta has sign + color (teal/error)? ✓
7. Drama register text-7xl on result? ✓
8. Defeat mascot `default` (NOT `sad`)? ✓
9. Battle gate shows progress + Lintopus default? ✓
10. NO sound, NO TTS (silent app)? ✓
```

## Codebase reference

- `frontend/components/Battle/BattleResult.tsx` — Soul §1 implementation verified
- `frontend/components/Battle/BattleQueue.tsx` (Wave 6 redesign target)
- `frontend/components/Battle/BattleMatch.tsx` (Wave 6 redesign target)
- `frontend/lib/battleSocket.ts` — Socket.IO real-time sync (frozen logic)

## See also

- `03-components/mascot.md` — Lintopus mood from battle result
- `03-components/result-card.md` — sub-skill 2-card variant
- `03-components/primary-button.md` — Battle drama button (Playfair Italic bold)
- `02-layout/result-page-anatomy.md` — canonical layout
- `01-foundations/typography.md` — Playfair Italic bold = Battle exception
- `00-manifesto/personality.md` — voice rules + drama register exception
- `06-motion/result-reveal.md` — Battle stagger reveal (pending)
