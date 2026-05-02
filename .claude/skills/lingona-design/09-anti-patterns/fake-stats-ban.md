# Fake stats ban — no fabricated social proof

Fabricated stats, testimonials, press mentions, user counts = banned.

Lingona launches 09/07/2026 with 7 prod test users (real number, FREE_PERIOD active). Pre-launch landing currently shows fake stats per audit. Wave 6 mandate: **remove ALL fake numbers**.

## What counts as "fake"

| Stat type | Fake | Real |
|-----------|------|------|
| User count | "2000+ học viên đang dùng" (no users) | Skip stat OR "{real_count} beta tester" |
| Avg band | "Trung bình band 7.5" (no data) | Skip |
| Satisfaction % | "98% học viên hài lòng" (no survey) | Skip |
| Revenue claim | "Top 3 IELTS app Vietnam" (unverified) | Skip |
| Testimonial | "Sarah, designer at Google" (stock photo) | Skip |
| Press mention | "Featured on TechCrunch" (not featured) | Skip |
| Award | "Best EdTech 2025" (no award) | Skip |
| Certification | "ISO certified" (not certified) | Skip |
| Countdown urgency | "23:59:42 left for 50% off" (resets) | Real launch date 09/07/2026 |

If number/claim isn't backed by real data → DELETE.

## Wave 6 audit findings

Landing page (Wave 6 audit Image 0) currently displays:

```
"2000+ học viên đang luyện cùng Lintopus"
"Trung bình band 7.0"
"Hơn 500 bài viết được chấm hôm nay"
"Top 3 IELTS app Vietnam"
```

ALL FAKE. Wave 6 mandate: remove all 4. Replace with honest pre-launch positioning.

## What to use instead — honest pre-launch

Lingona is in pre-launch phase. Honest framing:

### Option A — Skip social proof entirely

```tsx
// Just headline + value prop + CTA
<section>
  <h1 className="text-5xl font-display italic">Cùng luyện IELTS với mình</h1>
  <p className="mt-6 text-lg">{value_prop}</p>
  <button className="mt-8 primary-button-large">Bắt đầu luyện</button>
</section>
```

Most landing pages don't need social proof. Strong product position is enough.

### Option B — Honest pre-launch counter

```tsx
<p className="text-sm text-gray-600">
  Lingona đang trong giai đoạn beta. {realBetaCount} người đang dùng.
  Ra mắt chính thức 09/07/2026.
</p>
```

Honest = build trust. Number small but real > fake big number.

### Option C — Founder note (post-launch)

After launch, when real numbers exist:

```tsx
<p className="text-sm text-gray-600">
  Hơn {realLaunchCount} học viên đã đăng ký Lingona kể từ ra mắt 7/2026.
</p>
```

Real > fake. Specific date > vague claim.

### Option D — Specific feature claim (always allowed)

Specific functional claims are NOT social proof:

```tsx
✅ "Speaking AI chấm theo 4 tiêu chí IELTS"
✅ "Writing chấm 3x multi-sampling để giảm noise"
✅ "Battle 1v1 async với 56 passages có sẵn"
✅ "Cambridge Test 14 audio chuẩn IELTS thi thật"
```

Functional facts about product = always OK. Different from "1000+ users said so" claim.

## Testimonial rules

### Allowed: real beta tester quotes

```tsx
{realTestimonials.map(t => (
  <blockquote key={t.id} className="...">
    <p>"{t.quote}"</p>
    <footer className="mt-3 flex items-center gap-3">
      {t.realPhotoUrl && (
        <img src={t.realPhotoUrl} alt={t.realName} className="w-10 h-10 rounded-full" />
      )}
      <div>
        <p className="text-sm font-medium">{t.realName}</p>
        <p className="text-xs text-gray-500">{t.realContext}</p>
      </div>
    </footer>
  </blockquote>
))}
```

Requirements:
- ✅ Real beta tester (Lingona DB user)
- ✅ Real quote (with permission)
- ✅ Real photo (uploaded by user, with permission)
- ✅ Real name + context

If any of 4 missing → don't use.

### Banned: stock photo + fabricated quote

```tsx
// ❌ BANNED
<blockquote>
  <img src="/stock-asian-woman.jpg" />
  <p>"Lingona changed my life!"</p>
  <footer>— Sarah, Designer at Google</footer>
</blockquote>
```

Stock photo + made-up quote = fraud. Even if intent is "placeholder for design", DON'T ship.

For design mockup:
```tsx
{/* TODO: Real testimonial when beta tester provides */}
<div className="bg-gray-100 p-6 italic text-gray-500 rounded-lg">
  Testimonial section placeholder — populate with real beta tester quotes
</div>
```

Visible TODO > shipped fake.

## Stats display rules

### Stats with REAL data sources

Real beta data over time can support stats:

```tsx
// ✅ OK — pulled from real DB
const stats = await getRealStats();

<section>
  <stat>
    <span>{stats.totalSubmissions.toLocaleString('vi-VN')}</span>
    <p>bài đã chấm tính đến nay</p>
  </stat>
  <stat>
    <span>{stats.activeBetaUsers}</span>
    <p>người đang dùng beta</p>
  </stat>
</section>
```

Pull from real DB. Update from real source. Show "0" if 0 — KHÔNG fudge.

### Stats with NO data → skip section

If nothing real → don't add stat section just to fill space.

```tsx
// ❌ Don't render to fill design
<section>
  <stat>
    <span>0</span>
    <p>students</p>
  </stat>
</section>

// ✅ Just skip section entirely
{stats.totalSubmissions > 100 && (
  <SocialProofSection stats={stats} />
)}
```

Conditional render. Show only when meaningful threshold reached.

## Press mention rules

### Allowed: real press

If Lingona is featured by VnExpress, Tinhte, ZNews, etc. with real article URL:

```tsx
<section>
  <p className="text-sm text-gray-500 uppercase">Featured on</p>
  <div className="flex items-center gap-6 mt-4">
    {realPressMentions.map(p => (
      <a key={p.id} href={p.url} target="_blank">
        <img src={p.logoUrl} alt={p.outletName} />
      </a>
    ))}
  </div>
</section>
```

Each logo links to real article. Verifiable.

### Banned: "As Seen On" without backing

```tsx
// ❌ BANNED
<section>
  <p>As seen on</p>
  <img src="/techcrunch.svg" />
  <img src="/forbes.svg" />
</section>
```

If not actually featured → fraud. Skip section.

## Award / certification rules

### Allowed: real awards

Government / industry award with verifiable certificate:

- "Vietnam Sao Khue 2027" (if won)
- "IDP authorized partner" (if partnership exists)

→ With verifiable URL/certificate.

### Banned: made up

- "Best EdTech 2025" (made up category)
- "ISO certified" (not certified)
- "Cambridge approved" (not approved)
- "5-star rated" (no rating system source)

If not real → DELETE.

## Countdown / urgency rules

### Allowed: real launch countdown

```tsx
const launchDate = new Date('2026-07-09');
const daysUntilLaunch = differenceInDays(launchDate, new Date());

<p className="text-sm text-gray-600">
  Lingona ra mắt chính thức trong {daysUntilLaunch} ngày
</p>
```

Real date. Counts down to actual event.

### Banned: fake urgency

```tsx
// ❌ BANNED — resets every visit
<div className="bg-red-500 text-white">
  🔥 KHUYẾN MÃI HẾT TRONG 23:59:42!
</div>
```

→ Manipulation per `05-voice/never-say-list.md#9` + `09-anti-patterns/ai-generated-smell.md#2`.

## User count rules

### Allowed: real count from DB

```tsx
const realUserCount = await db.users.count();

{realUserCount > 100 && (
  <p>Đã có {realUserCount.toLocaleString('vi-VN')} người dùng</p>
)}
```

Real count from production DB. Honest threshold.

### Banned: fake hardcoded count

```tsx
// ❌ BANNED
<p>Đã có 2,000+ người dùng</p>

// ❌ BANNED — vague "over X" claims when real is 7
<p>Hơn 500 học viên</p>
```

If real number embarrassing small → SKIP STAT entirely. Don't fudge.

## Detection grep — fake stats

```bash
# Hunt fake numbers in landing
grep -rEn "[0-9]{3,}\+\s*(học viên|người|users|students)" frontend/components/landing/
grep -rEn "[0-9]+%\s*(hài lòng|satisfaction)" frontend/
grep -rEn "Top\s*[0-9]" frontend/  # "Top 3 app"
grep -rEn "[0-9]+,?[0-9]+\+" frontend/components/landing/  # "2,000+", "10000+"

# Hunt countdown urgency
grep -rEn "khuyến mãi|sale|giảm giá|chỉ còn" frontend/components/landing/
grep -rn "countdown" frontend/components/landing/

# Hunt testimonials
grep -rn "testimonial" frontend/components/landing/
grep -rn "Sarah\|John\|Michael\|stock-photo" frontend/  # common stock names

# Hunt press
grep -rEn "as seen on|featured on|trusted by" frontend/  # case-insensitive needed
grep -rEn "techcrunch|forbes|harvard|MIT" frontend/components/landing/

# Hunt awards
grep -rEn "best.*2025|2026 award|certified|approved by" frontend/components/landing/
```

Hits = check authenticity. If fake → DELETE.

## Wave 6 cleanup tasks

Per audit Image 0 (Landing):

1. Delete "2000+ học viên" claim → skip section
2. Delete "Trung bình band 7.0" claim → skip
3. Delete "500 bài viết được chấm hôm nay" → skip
4. Delete "Top 3 IELTS app Vietnam" → skip
5. Delete countdown banner urgency
6. Replace with honest pre-launch framing OR skip social proof entirely
7. Add real launch date "Ra mắt 09/07/2026" if want a CTA-driving date

## Commitment

Lingona = honest product. Trust earned through:
1. Specific feature claims (functional, verifiable)
2. Real user count when available (post-launch)
3. Real testimonials with permission (post-launch)
4. Transparent pricing (per Lingona principle)
5. Honest band journey (validation rules per `03-components/band-progress.md`)

KHÔNG fudge. KHÔNG fabricate. KHÔNG manipulate.

## Audit checklist fake stats

```
1. NO fabricated user count (e.g., "2000+ học viên")? ✓
2. NO fabricated avg band ("trung bình band 7.5")? ✓
3. NO fabricated satisfaction % ("98% hài lòng")? ✓
4. NO fabricated ranking ("Top 3 in Vietnam")? ✓
5. NO stock photo testimonials? ✓
6. NO fake quote with stock name? ✓
7. NO "As Seen On" without real press? ✓
8. NO made-up awards? ✓
9. NO unverified certifications? ✓
10. NO fake countdown urgency banner? ✓
11. Pre-commit grep for fake stats clean? ✓
12. All numbers in landing tied to real DB query OR factual claim? ✓
```

## See also

- `00-manifesto/personality.md` — honest voice
- `05-voice/never-say-list.md#9` — manipulation/dark patterns
- `09-anti-patterns/ai-generated-smell.md` — Trusted by + As Seen On
- `09-anti-patterns/corporate-translate.md` — corporate fake-credibility tells
