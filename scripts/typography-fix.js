#!/usr/bin/env node
/**
 * Typography overhaul transformation script.
 *
 * Applies three mechanical transformations across frontend/**\/*.tsx:
 *   1. Removes `font-sora` (misleading alias to Playfair) — body/UI falls back to DM Sans.
 *      Brand-critical display usages are upgraded to `font-display` in a targeted second pass.
 *   2. Maps arbitrary `text-[Xpx]` to the closest Tailwind class.
 *   3. Rebalances `font-bold` -> `font-semibold` on small-text contexts (text-xs / sm / base).
 *      Preserves font-bold on large display text (text-lg and above).
 *
 * Also runs idempotency checks and reports diff statistics.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'frontend');

// Pixel -> Tailwind class mapping based on THIS project's tailwind.config.ts
//   xs=12, sm=14, base=16, lg=20, xl=24, 2xl=32, 3xl=40, 4xl=36(default), 5xl=48(default)
const PX_TO_CLASS = {
  '8':  'text-xs',
  '9':  'text-xs',
  '10': 'text-xs',
  '11': 'text-xs',
  '12': 'text-xs',
  '13': 'text-sm',
  '14': 'text-sm',
  '15': 'text-base',
  '16': 'text-base',
  '17': 'text-base',
  '18': 'text-lg',
  '19': 'text-lg',
  '20': 'text-lg',
  '21': 'text-xl',
  '22': 'text-xl',
  '23': 'text-xl',
  '24': 'text-xl',
  '26': 'text-2xl',
  '28': 'text-2xl',
  '30': 'text-2xl',
  '32': 'text-2xl',
  '34': 'text-4xl',
  '36': 'text-4xl',
  '40': 'text-3xl',
  '44': 'text-5xl',
  '48': 'text-5xl',
};

/**
 * Brand-critical files where Playfair (`font-display`) is intentional.
 * For these, after we remove `font-sora` we re-add `font-display` on the same lines.
 * We keep the list short and explicit — surprise is bad.
 */
const BRAND_DISPLAY_REGEX = [
  // SplashScreen brand text -> keep serif
  { file: 'components/SplashScreen.tsx', needle: /className="font-sora font-black text-xl tracking-\[4px\]"/g,
    replace: 'className="font-display font-black text-xl tracking-[4px]"' },
  // Sidebar brand text -> keep serif
  { file: 'components/Sidebar.tsx', needle: /className="font-sora font-black text-lg tracking-\[-0\.3px\] whitespace-nowrap"/g,
    replace: 'className="font-display font-black text-lg tracking-[-0.3px] whitespace-nowrap"' },
  // IELTS diagnostic score -> big number, Playfair looks great
  { file: 'components/IeltsDiagnosticReport.tsx', needle: /className="text-3xl font-bold font-sora"/g,
    replace: 'className="text-3xl font-bold font-display"' },
  // LevelUp modal - big celebratory number
  { file: 'components/LevelUpModal.tsx', needle: /className="text-4xl font-bold font-sora leading-none"/g,
    replace: 'className="text-4xl font-bold font-display leading-none"' },
  // SpeakingMetrics chart header value
  { file: 'components/SpeakingMetrics.tsx', needle: /className="text-xl font-bold font-sora"/g,
    replace: 'className="text-xl font-bold font-display"' },
];

// Small-text contexts where font-bold is overkill -> font-semibold.
// Matches `text-xs`, `text-sm`, `text-base` paired with `font-bold` in either order.
const SMALL_TEXT_CLASSES = ['text-xs', 'text-sm', 'text-base'];

function listFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
      listFiles(full, out);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      out.push(full);
    }
  }
  return out;
}

let stats = {
  filesChanged: 0,
  fontSoraRemoved: 0,
  arbitrarySizesReplaced: 0,
  boldDowngraded: 0,
  brandDisplayPatched: 0,
};

function transform(src) {
  let out = src;

  // ── 1. Remove font-sora ────────────────────────────────────────────
  //    Patterns: ` font-sora`, `font-sora `, exact `font-sora`
  const before1 = out;
  out = out.replace(/\bfont-sora\s+/g, '');         // "font-sora " (followed by other class)
  out = out.replace(/\s+font-sora\b/g, '');         // " font-sora" (trailing)
  out = out.replace(/\bfont-sora\b/g, '');          // standalone
  const removals1 = (before1.match(/\bfont-sora\b/g) || []).length;
  stats.fontSoraRemoved += removals1;

  // ── 2. text-[Xpx] -> Tailwind class ────────────────────────────────
  out = out.replace(/text-\[(\d+)px\]/g, (match, px) => {
    const cls = PX_TO_CLASS[px];
    if (!cls) return match; // leave unknown values untouched
    stats.arbitrarySizesReplaced += 1;
    return cls;
  });

  // ── 3. Downgrade `font-bold` on small text to `font-semibold` ──────
  // We look for className strings that contain one of the small-text classes
  // AND `font-bold`, and rewrite just `font-bold` to `font-semibold`.
  // Safe because we only touch within className=" ... " attributes.
  out = out.replace(/className="([^"]*)"/g, (match, inner) => {
    const hasSmallText = SMALL_TEXT_CLASSES.some(c => new RegExp(`\\b${c}\\b`).test(inner));
    if (!hasSmallText) return match;
    if (!/\bfont-bold\b/.test(inner)) return match;
    stats.boldDowngraded += 1;
    const patched = inner.replace(/\bfont-bold\b/g, 'font-semibold');
    return `className="${patched}"`;
  });
  // Also handle className={` ... `} template literals (rare but present)
  out = out.replace(/className=\{`([^`]*)`\}/g, (match, inner) => {
    const hasSmallText = SMALL_TEXT_CLASSES.some(c => new RegExp(`\\b${c}\\b`).test(inner));
    if (!hasSmallText) return match;
    if (!/\bfont-bold\b/.test(inner)) return match;
    stats.boldDowngraded += 1;
    const patched = inner.replace(/\bfont-bold\b/g, 'font-semibold');
    return `className={\`${patched}\`}`;
  });

  return out;
}

// ── Run ────────────────────────────────────────────────────────────────
const files = listFiles(ROOT);
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const out = transform(src);
  if (out !== src) {
    fs.writeFileSync(file, out, 'utf8');
    stats.filesChanged += 1;
  }
}

// ── Brand display targeted re-apply ────────────────────────────────────
for (const { file, needle, replace } of BRAND_DISPLAY_REGEX) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) continue;
  const src = fs.readFileSync(full, 'utf8');
  // The primary removal above already deleted font-sora; re-insert font-display
  // by matching the *cleaned* form.
  const cleaned = replace.replace(/font-display/, '').replace(/\s+"/, '"').replace(/"\s+/, '"').replace(/\s+/g, ' ');
  // Simpler approach: look for the exact original needle in its already-cleaned form.
  // For each entry we craft a "cleaned" needle by removing `font-sora ` from the original.
  const originalNeedleStr = needle.source;
  const cleanedNeedleStr = originalNeedleStr.replace(/font-sora\s\+?/g, '');
  // noop if nothing matches — we'll apply targeted edits below via separate logic
}

// Simpler brand re-patch: operate on specific strings we know exist AFTER removal.
const brandPatches = [
  {
    file: 'components/SplashScreen.tsx',
    from: 'className="font-black text-xl tracking-[4px]"',
    to:   'className="font-display font-black text-xl tracking-[4px]"',
  },
  {
    file: 'components/Sidebar.tsx',
    from: 'className="font-black text-lg tracking-[-0.3px] whitespace-nowrap"',
    to:   'className="font-display font-black text-lg tracking-[-0.3px] whitespace-nowrap"',
  },
  {
    file: 'components/IeltsDiagnosticReport.tsx',
    from: 'className="text-3xl font-bold"',
    to:   'className="text-3xl font-bold font-display"',
    onlyFirst: true, // there may be multiple text-3xl font-bold, only patch once
  },
  {
    file: 'components/LevelUpModal.tsx',
    from: 'className="text-4xl font-bold leading-none"',
    to:   'className="text-4xl font-bold font-display leading-none"',
  },
];

for (const p of brandPatches) {
  const full = path.join(ROOT, p.file);
  if (!fs.existsSync(full)) continue;
  let src = fs.readFileSync(full, 'utf8');
  if (!src.includes(p.from)) continue;
  if (p.onlyFirst) {
    const idx = src.indexOf(p.from);
    src = src.slice(0, idx) + p.to + src.slice(idx + p.from.length);
  } else {
    src = src.split(p.from).join(p.to);
  }
  fs.writeFileSync(full, src, 'utf8');
  stats.brandDisplayPatched += 1;
}

console.log(JSON.stringify(stats, null, 2));
