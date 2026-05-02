# Desktop waste — narrow mobile content on wide canvas

When desktop renders content sized like mobile (e.g., 600px content centered in 1440px viewport), 800px+ pixels are wasted whitespace. Desktop = different canvas, must use it.

Per `02-layout/desktop-canvas.md` — Lingona's reference is 1440px with 1120px max-width content + 160px gutter + Pattern C asymmetric. KHÔNG center 600px content in 1440px window.

## 1. Centered narrow column

**Anti**: Content max-width 640px (md screens) used on 1440px viewport. Content stuck center, sides empty.

```tsx
// ❌ Mobile-style narrow on desktop
<div className="max-w-2xl mx-auto px-6">
  {/* 1440 - 672 = 768px wasted */}
  <h1>Welcome</h1>
  <p>...</p>
  <button>Get Started</button>
</div>
```

Visual on 1440px:
```
[400px empty]  [content 640px]  [400px empty]
```

Why anti:
- Wasted pixels (800px effectively unused)
- Mobile-first that didn't get desktop treatment
- Looks like blog post, not product

✅ Desktop pattern: use full canvas with asymmetric layout (Pattern C):

```tsx
<section className="px-40 py-24">
  <div className="max-w-[1120px] mx-auto">
    <div className="grid grid-cols-12 gap-6 items-center">
      <div className="col-span-7">
        <h1 className="text-5xl font-display italic">Welcome</h1>
        <p className="mt-6 text-lg max-w-md">...</p>
        <button className="mt-8 primary-button-large">Bắt đầu luyện</button>
      </div>
      <div className="col-span-5 flex justify-end">
        <Mascot size={320} mood="happy" />
      </div>
    </div>
  </div>
</section>
```

Visual on 1440px:
```
[160px gutter]  [text 45%]  [breath]  [visual 38%]  [160px gutter]
```

Pattern C uses canvas. Each section has visual interest across width.

## 2. Centered narrow form

**Anti**: Multi-step form (e.g., onboarding) shown as 480px wide column centered.

```tsx
// ❌ Mobile-style form on desktop
<div className="max-w-md mx-auto py-12">
  <h2>Bạn đang ở Band IELTS nào?</h2>
  <select>...</select>
  <button>Continue</button>
</div>
```

Visual on 1440px:
```
[480px empty]  [form 480px]  [480px empty]
```

✅ Desktop multi-step pattern: side-by-side layout (form left, visual right):

```tsx
<div className="grid grid-cols-12 gap-6 max-w-[1120px] mx-auto py-12">
  <div className="col-span-6 lg:col-span-7">
    <StepIndicator current={2} total={5} />
    <h2 className="text-3xl font-display italic mt-8">
      Bạn đang ở Band IELTS nào?
    </h2>
    
    <div className="mt-8 grid grid-cols-3 gap-3">
      {bands.map(band => (
        <button key={band} className="band-pill">{band}</button>
      ))}
    </div>
    
    <button className="mt-12 primary-button">Tiếp tục</button>
  </div>
  
  <div className="col-span-6 lg:col-span-5 flex justify-end">
    <Mascot size={240} mood="thinking" bubble="Bạn chọn theo cảm tính cũng OK" />
  </div>
</div>
```

Pattern C: form left + Lintopus right. Uses canvas. Lintopus warm presence.

## 3. Single column dashboard

**Anti**: Dashboard widgets stacked single column even on desktop.

```tsx
// ❌ Mobile-style stack on desktop
<main className="max-w-md mx-auto py-8 space-y-4">
  <StreakCard />
  <XPCard />
  <LevelCard />
  <SkillCard skill="speaking" />
  <SkillCard skill="writing" />
  <SkillCard skill="reading" />
  <SkillCard skill="listening" />
</main>
```

Visual on 1440px: 480px column, infinite scroll. 960px wasted.

✅ Desktop dashboard pattern: grid layout that uses width:

```tsx
<main className="px-12 py-8">
  <div className="max-w-[1280px] mx-auto">
    <header className="mb-8">
      <h1 className="text-3xl font-display italic">
        Chào {username}
      </h1>
    </header>
    
    {/* Top row — 3 stat widgets */}
    <div className="grid grid-cols-3 gap-6 mb-8">
      <StreakCard />
      <XPCard />
      <LevelCard />
    </div>
    
    {/* Skill grid — 4 skills 2x2 or 4-col */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <SkillCard skill="speaking" />
      <SkillCard skill="writing" />
      <SkillCard skill="reading" />
      <SkillCard skill="listening" />
    </div>
  </div>
</main>
```

Width used. User sees hierarchy at glance, no scroll for above-fold content.

## 4. Padding scaled wrong

**Anti**: Mobile padding `px-4` used on desktop (too tight against edge).

```tsx
// ❌ Mobile padding everywhere
<section className="px-4 py-8">
  <h1>Hello</h1>
</section>
```

Why anti: 16px from edge looks cramped on 1440px desktop.

✅ Responsive padding scale:

```tsx
<section className="px-6 lg:px-12 xl:px-40 py-8 lg:py-16">
  <h1>Hello</h1>
</section>
```

Or use container with horizontal padding inside max-width wrapper:

```tsx
<div className="max-w-[1120px] mx-auto px-6 lg:px-0">
  {/* content uses full max-width on desktop */}
</div>
```

Mobile: padding compensates for narrow viewport. Desktop: max-width centers + minimal/no horizontal padding.

## 5. Modal max-width too wide on desktop

**Anti**: Modal `max-w-7xl` (1280px) sounds OK but defeats focus purpose.

```tsx
// ❌ Modal too wide
<Modal className="max-w-7xl">
  <ChangeEmailForm />
</Modal>
```

Modal on 1440px: 1280px wide modal. User loses focus context.

✅ Modal sizing per `03-components/modal-frozen.md`:

| Use | max-width |
|-----|-----------|
| Confirm action | `max-w-sm` (384px) |
| Form input | `max-w-md` (448px) default |
| Multi-step form | `max-w-lg` (512px) |
| Pro upgrade | `max-w-xl` (576px) |
| Friend chat invite | `max-w-2xl` (672px) max |

Modal stays focused. Background dimmed. KHÔNG full-canvas modal except mobile.

## 6. Image / chart at full container width

**Anti**: Stretching small image/chart to fill 1120px container width.

```tsx
// ❌ Chart 200px tall stretched to 1120px wide
<Chart className="w-full" data={smallDataset} />
```

Chart designed for 600x400 → stretched to 1120px → looks weird, axis labels sparse.

✅ Constrain chart to readable size + give layout context:

```tsx
<div className="grid grid-cols-12 gap-6">
  <div className="col-span-7">
    <h3 className="text-xl font-display italic">Tiến độ Writing</h3>
    <p className="mt-2 text-sm text-gray-600">
      Band cải thiện qua 12 lần luyện gần nhất
    </p>
  </div>
  <div className="col-span-5">
    <Chart data={data} className="w-full max-w-[400px]" />
  </div>
</div>
```

Chart sized to fit data. Surrounding context fills width.

## 7. Nav bar too sparse

**Anti**: Top nav with single logo left + single button right, vast empty middle.

```tsx
// ❌ Sparse nav
<nav className="flex items-center justify-between px-12 py-4">
  <Logo />
  <button>Login</button>
</nav>
```

Visual: 1300px empty space between logo and button.

✅ Functional nav with menu items:

```tsx
<nav className="flex items-center justify-between px-12 py-4 border-b border-gray-200">
  <div className="flex items-center gap-8">
    <Logo />
    <div className="flex items-center gap-6">
      <a href="/about" className="text-sm text-gray-700 hover:text-navy">Về Lingona</a>
      <a href="/pricing" className="text-sm text-gray-700 hover:text-navy">Pricing</a>
      <a href="/blog" className="text-sm text-gray-700 hover:text-navy">Blog</a>
    </div>
  </div>
  
  <div className="flex items-center gap-3">
    <a href="/login" className="text-sm text-gray-700">Đăng nhập</a>
    <a href="/register" className="primary-button-sm">Đăng ký</a>
  </div>
</nav>
```

Nav becomes functional + uses width.

## 8. Footer single column

**Anti**: Footer dumps single column copyright + 3 links.

```tsx
// ❌ Sparse footer
<footer className="py-12 text-center">
  <Logo size={48} />
  <p className="mt-4 text-sm text-gray-500">
    © 2026 Lingona. All rights reserved.
  </p>
</footer>
```

✅ Multi-column footer with sections:

```tsx
<footer className="bg-cream border-t border-gray-200 py-16 px-12">
  <div className="max-w-[1120px] mx-auto">
    <div className="grid grid-cols-12 gap-6 mb-12">
      <div className="col-span-4">
        <Logo size={48} />
        <p className="mt-4 text-sm text-gray-600 max-w-xs">
          Cùng luyện IELTS từ Band 5.0 đến 7.5+ với phản hồi cụ thể
        </p>
      </div>
      
      <div className="col-span-2 col-start-6">
        <h4 className="text-sm font-semibold text-navy">Sản phẩm</h4>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li><a href="/pricing">Pricing</a></li>
          <li><a href="/features">Features</a></li>
          <li><a href="/changelog">Changelog</a></li>
        </ul>
      </div>
      
      <div className="col-span-2">
        <h4 className="text-sm font-semibold text-navy">Tài nguyên</h4>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li><a href="/blog">Blog</a></li>
          <li><a href="/help">Hướng dẫn</a></li>
          <li><a href="/faq">FAQ</a></li>
        </ul>
      </div>
      
      <div className="col-span-2">
        <h4 className="text-sm font-semibold text-navy">Pháp lý</h4>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li><a href="/terms">Điều khoản</a></li>
          <li><a href="/privacy">Bảo mật</a></li>
          <li><a href="/refund">Hoàn tiền</a></li>
        </ul>
      </div>
    </div>
    
    <div className="border-t border-gray-200 pt-6 flex items-center justify-between text-xs text-gray-500">
      <p>© 2026 [HKD name]. Mọi quyền được bảo lưu.</p>
      <p>Made in Vietnam 🇻🇳</p>
    </div>
  </div>
</footer>
```

Multi-column gives footer substance + uses width.

## 9. CTA full-width button on desktop

**Anti**: Button stretched to full container width on desktop (looks like mobile).

```tsx
// ❌ Full-width CTA on desktop
<button className="w-full primary-button-large">
  Bắt đầu luyện
</button>
```

On 1120px container: 1120px wide button. Mobile pattern misapplied.

✅ Button width responsive:

```tsx
<button className="w-full lg:w-auto px-8 py-4 primary-button-large">
  Bắt đầu luyện
</button>
```

Mobile: full-width (44px touch target requires width). Desktop: auto-width (content-fit).

## 10. Form input full-container width

**Anti**: Input field stretched 1120px wide.

```tsx
// ❌ Mile-long input
<input type="text" className="w-full px-4 py-2 ..." />
```

Long input = readable issue (eye sweep too wide).

✅ Constrain input width:

```tsx
<input type="text" className="w-full max-w-md px-4 py-2 ..." />
```

Or layout in grid where input occupies sensible col-span:

```tsx
<div className="grid grid-cols-12 gap-6">
  <input className="col-span-6 px-4 py-2 ..." />
  <button className="col-span-3 primary-button">Submit</button>
  <div className="col-span-3" />  {/* empty for breathing */}
</div>
```

Input width matches content type (email = ~md, sentence answer = ~lg, paragraph = full but heightened).

## When narrow column IS OK on desktop

Some content benefits from narrow column even on desktop:

| Content | Width | Why |
|---------|-------|-----|
| Long-form blog/article body | `max-w-prose` (~65ch / 600-700px) | Readability |
| Privacy policy / Terms | `max-w-2xl` | Readability |
| Single confirm modal | `max-w-md` | Focus |
| Multi-step form (single step) | `max-w-lg` | Focus |
| Verification OTP entry | `max-w-sm` | Focus |

Narrow column for **focused reading or single-action**. NOT for landing/dashboard/result pages.

## Detection grep

Check landing/dashboard/result for:

```bash
# Hunt narrow column anti-patterns
grep -rn "max-w-md\|max-w-2xl\|max-w-lg" frontend/app/(public)/ frontend/components/landing/
grep -rn "max-w-md mx-auto" frontend/app/(app)/home/ frontend/app/(app)/dashboard/

# Look for centered wrappers
grep -rn "container mx-auto" frontend/components/landing/  # may indicate generic
grep -rn "max-w-7xl mx-auto" frontend/components/landing/  # may indicate template

# Confirm Pattern C
grep -rn "grid-cols-12" frontend/app/(public)/  # Pattern C uses 12-col grid
grep -rn "col-span-7\|col-span-5" frontend/app/(public)/
```

## Audit checklist desktop waste

```
1. Hero uses Pattern C asymmetric (12-col grid, 7+5)? ✓
2. Dashboard uses grid 3-col stat row + 4-col skill grid? ✓
3. Multi-step form uses side-by-side (form + visual)? ✓
4. Padding scales responsive (px-4 mobile → px-12 lg → px-40 xl)? ✓
5. Modal max-w sized per use (sm/md/lg/xl/2xl)? ✓
6. Charts constrained to readable size? ✓
7. Nav has menu items + logo + CTAs (functional)? ✓
8. Footer multi-column with sections? ✓
9. CTA button width auto on desktop (NOT w-full)? ✓
10. Form input constrained (NOT w-full)? ✓
11. Narrow column ONLY for blog/article/legal/modal? ✓
12. Visual layout uses 80%+ canvas (NOT centered narrow)? ✓
```

## See also

- `02-layout/desktop-canvas.md` — Pattern C 1440px reference
- `02-layout/grid-vs-flow.md` — when grid vs flow
- `02-layout/empty-space-philosophy.md` — WS:content ratio per page type
- `02-layout/mobile-rhythm.md` — mobile single-col collapse rules
- `09-anti-patterns/ai-generated-smell.md` — generic SaaS template
- `03-components/modal-frozen.md` — modal sizing
- `03-components/primary-button.md` — button width responsive
