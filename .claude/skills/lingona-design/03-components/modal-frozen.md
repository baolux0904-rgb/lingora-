# Modal & frozen-logic components — visual rebuild only

Some Lingona components are **frozen logic** — Wave 2 worked on these (UsernameSection, ChangeEmailModal, DeleteAccountModal, etc.). Logic LOCKED. Wave 6 redesign = **visual only**, no behavior change.

Per Wave 6 mandate from Louis: rebuild visual, KHÔNG break working logic.

## Modal canonical pattern

Lingona modals follow a single visual pattern:

```tsx
// Modal wrapper (full-screen overlay)
<div
  className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm"
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  {/* Modal card */}
  <div className="bg-cream border border-gray-200 rounded-lg p-6 sm:p-8 max-w-md w-full shadow-lg">
    <header className="flex items-start justify-between mb-4">
      <h2 id="modal-title" className="text-2xl font-display italic text-navy">
        {title}
      </h2>
      <button
        onClick={onClose}
        className="p-1 -mr-1 rounded-md hover:bg-gray-100 text-gray-500"
        aria-label="Đóng"
      >
        <X className="w-5 h-5" />
      </button>
    </header>

    <div className="space-y-4">
      {/* modal body */}
    </div>

    <footer className="mt-6 flex items-center justify-end gap-3">
      <button onClick={onClose} className="secondary-button">
        Hủy
      </button>
      <button onClick={onConfirm} className="primary-button">
        Xác nhận
      </button>
    </footer>
  </div>
</div>
```

| Aspect | Value |
|--------|-------|
| Backdrop | `bg-navy/60 backdrop-blur-sm` (60% navy + subtle blur) |
| Z-index | `z-modal` (defined in Tailwind config) |
| Modal card bg | `bg-cream` |
| Modal card border | `border border-gray-200` |
| Modal card radius | `rounded-lg` (16px) |
| Modal card padding | `p-6 sm:p-8` (24px mobile / 32px desktop) |
| Modal card max-width | `max-w-md` (448px) default |
| Modal card shadow | `shadow-lg` (more prominent than card) |
| Title font | `font-display italic` (Playfair) |
| Close button | `<X />` icon top-right, `aria-label="Đóng"` |

## Modal mobile vs desktop

```tsx
// Mobile (390px) → full-screen modal
// Desktop (1440px) → centered card

<div className="fixed inset-0 z-modal lg:p-4 bg-navy/60">
  <div className="
    h-full w-full bg-cream
    lg:h-auto lg:max-w-md lg:mx-auto lg:my-12 lg:rounded-lg
    p-4 lg:p-8
  ">
    {/* mobile = full-screen, desktop = centered card */}
  </div>
</div>
```

KHÔNG show desktop modal style on mobile (cramped, peek anti). Full-screen mobile = standard pattern.

## Modal sizes

| Size | Max-width | Use case |
|------|-----------|----------|
| **sm** | `max-w-sm` (384px) | Confirm action (delete confirm, simple Y/N) |
| **md** (default) | `max-w-md` (448px) | Form input modal (change email, edit bio) |
| **lg** | `max-w-lg` (512px) | Multi-step modal (change password) |
| **xl** | `max-w-xl` (576px) | Pro upgrade modal, achievement detail |
| **2xl** | `max-w-2xl` (672px) | Friend chat invite, complex content |

KHÔNG > `max-w-2xl` modal — too wide, defeats focus purpose. Use full page route instead.

## Modal animation

Per `06-motion/framer-variants.md` (pending):

```tsx
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence>
  {isOpen && (
    <>
      {/* Backdrop fade */}
      <motion.div
        className="fixed inset-0 z-modal-backdrop bg-navy/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Modal slide-up + fade */}
      <motion.div
        className="fixed inset-0 z-modal flex items-center justify-center p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {/* modal content */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

KHÔNG bounce / scale-in / dramatic entrance. Subtle fade + slide-up only.

## Frozen-logic components — visual rebuild rules

These components have **working backend logic** (verified Wave 2). Wave 6 = **visual swap only**, KHÔNG modify:

### UsernameSection

**Frozen behavior**:
- Username uniqueness check (debounced 500ms)
- Inline validation (min 3 char, max 30 char, alphanumeric + underscore)
- Submit → API call `/api/v1/me/username` → DB update + cache invalidation
- Success → toast "Đã cập nhật username"
- Error 409 conflict → inline error "Username đã có người dùng"

**Visual rebuild scope**:
- Card container `bg-cream border-gray-200 rounded-lg p-6`
- Heading `text-xl font-display italic`
- Input field — see Form input pattern below
- Submit button — primary teal
- Error inline text `text-sm text-error mt-2`
- Success toast — separate component

```tsx
<div className="bg-cream border border-gray-200 rounded-lg p-6">
  <h3 className="text-xl font-display italic text-navy mb-4">Username</h3>
  <p className="text-sm text-gray-600 mb-4">
    Username dùng cho profile public và Battle leaderboard.
  </p>
  
  <div className="space-y-3">
    <label className="block">
      <span className="text-sm font-medium text-navy">Username mới</span>
      <input
        type="text"
        value={username}
        onChange={handleChange}
        className="
          mt-1 block w-full
          px-4 py-2.5
          rounded-md
          bg-cream border border-gray-300
          focus:border-teal focus:ring-1 focus:ring-teal
          text-base font-sans
        "
        placeholder="duybao0904"
      />
      {error && (
        <p className="mt-2 text-sm text-error">{error}</p>
      )}
    </label>
    
    <button
      type="submit"
      onClick={handleSubmit}
      disabled={!isValid || isPending}
      className="primary-button"
    >
      {isPending ? 'Đang lưu...' : 'Cập nhật'}
    </button>
  </div>
</div>
```

KHÔNG modify validation logic, debounce timing, API endpoint, error codes. Visual swap only.

### ChangeEmailModal

**Frozen behavior**:
- Multi-step: confirm password → enter new email → verify OTP → success
- Each step has own state (zustand or local)
- API endpoints fixed `/api/v1/me/email/*`
- 6-digit OTP input
- 60-second resend cooldown

**Visual rebuild scope**:
- Modal pattern per canonical above
- Step indicator (1/3 → 2/3 → 3/3)
- OTP input with 6 cells (custom component)
- Resend button with countdown timer

```tsx
<Modal title="Đổi email" onClose={handleClose}>
  <StepIndicator current={step} total={3} />
  
  {step === 1 && <ConfirmPasswordStep onNext={...} />}
  {step === 2 && <EnterNewEmailStep onNext={...} />}
  {step === 3 && <VerifyOtpStep onComplete={...} />}
</Modal>
```

OTP input visual:

```tsx
<div className="flex items-center justify-center gap-2">
  {[0, 1, 2, 3, 4, 5].map(i => (
    <input
      key={i}
      type="text"
      maxLength={1}
      value={otp[i] || ''}
      onChange={e => handleOtpChange(i, e.target.value)}
      className="
        w-12 h-14
        text-center text-2xl font-display italic
        rounded-md border border-gray-300
        focus:border-teal focus:ring-2 focus:ring-teal-light
        bg-cream
      "
    />
  ))}
</div>
```

Single source for OTP component. KHÔNG re-build OTP per modal usage.

### DeleteAccountModal

**Frozen behavior**:
- Type confirmation: user must type "XÓA" exactly to enable confirm button
- Cascade delete preview (X conversations, Y battles, Z friends, W achievements lost)
- 7-day soft delete grace period (DB flag)
- Final API call → logout + redirect /

**Visual rebuild scope**:
- Modal pattern, **`max-w-lg`** size (more content)
- Danger semantic accent (red border-left + warning icon top)
- Cascade preview list
- Type-to-confirm input
- Disabled confirm button until exact match

```tsx
<Modal title="Xóa tài khoản" size="lg">
  <div className="border-l-4 border-error rounded-none pl-4 mb-6">
    <div className="flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-navy">Hành động không thể hoàn tác</p>
        <p className="text-sm text-gray-600 mt-1">
          Sau 7 ngày, dữ liệu sẽ bị xóa vĩnh viễn.
        </p>
      </div>
    </div>
  </div>
  
  <div className="space-y-2 mb-6">
    <p className="text-sm font-medium text-navy">Sẽ mất:</p>
    <ul className="space-y-1 text-sm text-gray-700">
      <li>• {stats.conversations} cuộc hội thoại Speaking</li>
      <li>• {stats.battles} trận Battle</li>
      <li>• {stats.friends} kết nối bạn bè</li>
      <li>• {stats.achievements} thành tựu</li>
      <li>• {stats.streakDays} ngày streak</li>
    </ul>
  </div>
  
  <div className="space-y-2">
    <label className="block text-sm font-medium text-navy">
      Gõ <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">XÓA</code> để xác nhận
    </label>
    <input
      type="text"
      value={confirmText}
      onChange={e => setConfirmText(e.target.value)}
      className="form-input"
      placeholder="XÓA"
    />
  </div>
  
  <footer className="mt-6 flex items-center justify-end gap-3">
    <button onClick={onClose} className="secondary-button">Hủy</button>
    <button
      onClick={onConfirm}
      disabled={confirmText !== 'XÓA'}
      className="px-6 py-3 rounded-md bg-error text-cream font-semibold disabled:opacity-50"
    >
      Xóa tài khoản
    </button>
  </footer>
</Modal>
```

KHÔNG modify confirm string ("XÓA" — Vietnamese all-caps lock). KHÔNG modify cascade query. KHÔNG modify 7-day grace period. KHÔNG modify final logout flow.

### ChangePasswordModal

**Frozen behavior**:
- 3-step: current password → new password (with strength meter) → confirm new password
- Min 8 char + must match + strength score >=2
- API `/api/v1/me/password`
- All sessions invalidated after change (forced re-login on other devices)

**Visual rebuild scope**:
- Modal `max-w-md`
- Step indicator
- Password strength meter (0-4 bars, semantic colors)
- Show/hide toggle (eye icon)

### NotificationToggleSection

**Frozen behavior**:
- 4 toggles: Streak reminder, Push notifications, Battle invite, Email newsletter
- Each toggle → API call `/api/v1/me/notifications/{type}` PATCH

**Visual rebuild scope**:
- Replace native `<input type="checkbox">` with custom `Toggle` component
- Native HTML toggle = sterile (per audit Image 7)

```tsx
// frontend/components/ui/Toggle.tsx
<button
  role="switch"
  aria-checked={checked}
  onClick={onChange}
  className={`
    relative inline-flex h-6 w-11 items-center rounded-full
    transition-colors duration-200
    ${checked ? 'bg-teal' : 'bg-gray-300'}
  `}
>
  <span
    className={`
      inline-block h-5 w-5 transform rounded-full bg-cream
      transition-transform duration-200
      ${checked ? 'translate-x-5' : 'translate-x-0.5'}
    `}
  />
</button>
```

Single canonical Toggle component. Use across notifications, appearance settings, future settings.

## Form input pattern (canonical)

Used inside modals + standalone forms:

```tsx
<label className="block">
  <span className="text-sm font-medium text-navy">{label}</span>
  <input
    type="text"
    value={value}
    onChange={onChange}
    className="
      mt-1 block w-full
      px-4 py-2.5
      rounded-md
      bg-cream
      border border-gray-300
      focus:border-teal focus:ring-1 focus:ring-teal focus:outline-none
      text-base font-sans text-navy
      placeholder:text-gray-400
      disabled:opacity-50 disabled:cursor-not-allowed
    "
    placeholder={placeholder}
  />
  {helperText && (
    <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
  )}
  {error && (
    <p className="mt-1.5 text-sm text-error">{error}</p>
  )}
</label>
```

| Aspect | Value |
|--------|-------|
| Padding | `px-4 py-2.5` (16px / 10px) |
| Height | 44px (mobile a11y) |
| Background | `bg-cream` |
| Border default | `border-gray-300` |
| Border focus | `border-teal` + `ring-1 ring-teal` |
| Radius | `rounded-md` (12px, match button) |
| Text | `text-base text-navy` |
| Placeholder | `placeholder:text-gray-400` |

KHÔNG dùng native browser styling. KHÔNG `focus:ring-2 ring-blue-500` (default Tailwind blue — phá BRAND).

## Anti-patterns

❌ Backdrop pure black `bg-black/50` — use `bg-navy/60` (Lingona warm)
❌ Backdrop no blur — use `backdrop-blur-sm` for depth
❌ Modal max-width `max-w-7xl` (too wide, lose focus purpose)
❌ Modal padding `p-12` excessive — use `p-6 sm:p-8`
❌ Multiple modals open simultaneously (single-modal rule)
❌ Modal with bouncy spring entrance (sober fade + slide-up only)
❌ Native HTML toggle/checkbox/select inside modal (sterile per audit Image 6/7)
❌ Modal title uses `font-sans` (use `font-display italic` for moment)
❌ Close X button missing or hidden (a11y fail)
❌ Confirm/Cancel button order reversed (Cancel left, Confirm right — Vietnamese reading flow)
❌ Modify frozen logic (validation rules, API endpoints, debounce timing)
❌ Custom OTP input per modal (use single Toast/OTP component)

## Modal a11y checklist

```
1. role="dialog" + aria-modal="true"? ✓
2. aria-labelledby points to title? ✓
3. Focus trap within modal (Tab cycles inside)? ✓
4. Escape key closes modal? ✓
5. Click backdrop closes modal? ✓ (configurable)
6. Focus returns to trigger element after close? ✓
7. Screen reader announces modal open? ✓
8. Close button aria-label="Đóng"? ✓
9. Title heading level appropriate (usually h2)? ✓
10. Tab order logical (top-to-bottom)? ✓
```

## Audit checklist visual rebuild

```
Touching frozen-logic component?

1. Backend API endpoint UNCHANGED? ✓
2. Validation logic UNCHANGED? ✓
3. State machine UNCHANGED? ✓
4. Error codes UNCHANGED? ✓
5. Visual classes match canon (bg-cream, rounded-lg, etc.)? ✓
6. Native HTML elements replaced with custom components (Toggle, etc.)? ✓
7. Vietnamese microcopy applied? ✓
8. Modal animation per spec (fade + slide-up subtle)? ✓
```

## See also

- `01-foundations/palette.md` — bg-cream + border-gray-200
- `01-foundations/typography.md` — font-display italic for modal title
- `03-components/primary-button.md` — primary/secondary button pattern
- `03-components/card-language.md` — card pattern (modal = card variant)
- `06-motion/framer-variants.md` — modal motion (pending)
- `00-manifesto/personality.md` — voice rules modal copy
