import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ── Typography Scale ─────────────────────────────────────────
         Body sizes use leading-relaxed (1.625) for Vietnamese diacritics.
         Headings use leading-tight (1.1–1.25) + tight tracking.
         Small caps / labels use slightly open tracking.                */
      fontSize: {
        xs:      ["0.75rem",  { lineHeight: "1.5",   letterSpacing: "0.01em" }], // 12px — caption
        sm:      ["0.875rem", { lineHeight: "1.55",  letterSpacing: "0"      }], // 14px — small
        base:    ["1rem",     { lineHeight: "1.65",  letterSpacing: "0"      }], // 16px — body
        lg:      ["1.25rem",  { lineHeight: "1.4",   letterSpacing: "-0.005em" }], // 20px — H3 / card title
        xl:      ["1.5rem",   { lineHeight: "1.25",  letterSpacing: "-0.01em"  }], // 24px — H2
        "2xl":   ["2rem",     { lineHeight: "1.15",  letterSpacing: "-0.015em" }], // 32px — H1 (app)
        "3xl":   ["2.5rem",   { lineHeight: "1.1",   letterSpacing: "-0.02em"  }], // 40px — Display sm
        "4xl":   ["3rem",     { lineHeight: "1.1",   letterSpacing: "-0.02em"  }], // 48px — Display
        "5xl":   ["3.5rem",   { lineHeight: "1.05",  letterSpacing: "-0.025em" }], // 56px — Hero
      },

      /* ── Spacing — 4px grid ─────────────────────────────────────── */
      spacing: {
        "4.5": "1.125rem",
      },

      colors: {
        /* Brand — Lingona canon */
        cream: {
          DEFAULT: "#F8F7F4",  // page bg warm-white
          warm:    "#FAF8F2",  // hero/card subtle variant
          soft:    "#F0EFEC",  // input/secondary surface
        },
        navy: {
          DEFAULT: "#1B2B4B",
          light:   "#2D4A7A",
          dark:    "#0F1E33",
          50:      "#E8EDF5",
          100:     "#D1DBE8",
          200:     "#A3B7D1",
          900:     "#0A1325",
        },
        teal: {
          DEFAULT: "#00A896",
          light:   "#00C4B0",
          dark:    "#007A6E",
          50:      "#E6F7F5",
        },
        gold:      "#FFD700",  // accent (achievement/badge moments)
        parchment: "#F5EFDC",  // ielts-authentic mode bg (Cambridge faithful)
        /* Neutral */
        gray: {
          50:  "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
        /* Semantic */
        success: "#22C55E",
        warning: "#F59E0B",
        error:   "#EF4444",
        /* Legacy compat */
        bg: {
          DEFAULT: "#0B0F1E",
          2: "#111631",
          3: "#161B3A",
        },
        accent: {
          cyan: "#38BDF8",
          blue: "#3B82F6",
        },
        primary: "#E6EDF3",
        secondary: "#8B92AB",
      },

      letterSpacing: {
        tighter:  "-0.03em",  // display serif headings
        tight:    "-0.01em",  // sans headings (xl+)
        normal:   "0",        // body text
        label:    "0.04em",   // badges, small labels
        upper:    "0.08em",   // uppercase text, section headers
        widest:   "0.12em",   // all-caps decorative (splash, ranks)
      },

      maxWidth: {
        prose: "65ch",        // readable text measure
      },

      fontFamily: {
        // DM Sans (body / UI) — loaded via next/font/google in app/layout.tsx
        sans:     ["var(--font-dm-sans)", "DM Sans", "system-ui", "sans-serif"],
        body:     ["var(--font-dm-sans)", "DM Sans", "system-ui", "sans-serif"],  // Lingona canon alias
        // Playfair Display (hero / large display headings only)
        display:  ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        playfair: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        // Georgia (ielts-authentic mode body + heading)
        serif:    ["Georgia", "Cambria", "Times New Roman", "serif"],
      },

      borderColor: {
        DEFAULT: "rgba(255,255,255,0.06)",
      },

      /* ── Z-index scale ─────────────────────────────────────────── */
      zIndex: {
        base:     '0',
        raised:   '10',
        nav:      '30',
        sticky:   '40',
        modal:    '50',
        sheet:    '60',
        overlay:  '70',
        splash:   '80',
      },

      borderRadius: {
        sm:     "8px",
        md:     "12px",
        lg:     "16px",
        xl:     "24px",
        full:   "9999px",
        // Lingona canon aliases per 01-foundations/radius-language.md
        button: "12px",   // primary/secondary buttons
        card:   "16px",   // default card
        hero:   "24px",   // hero card / pricing tier
      },

      boxShadow: {
        sm:        "0 1px 3px rgba(0,0,0,0.08)",
        md:        "0 4px 12px rgba(0,0,0,0.10)",
        lg:        "0 8px 24px rgba(0,0,0,0.12)",
        xl:        "0 16px 48px rgba(0,0,0,0.16)",
        colored:   "0 4px 16px rgba(0,168,150,0.25)",
        "glow-primary": "0 0 20px rgba(0,168,150,0.2)",
        "glow-accent":  "0 0 20px rgba(0,168,150,0.15)",
      },

      transitionDuration: {
        fast:   "150ms",
        normal: "250ms",
        slow:   "400ms",
      },

      keyframes: {
        fadeSlideUp: {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 6px rgba(0,168,150,0.4)" },
          "50%":      { boxShadow: "0 0 14px rgba(0,168,150,0.7)" },
        },
        progressFill: {
          "0%":   { width: "0%" },
          "100%": { width: "var(--progress-target)" },
        },
        countUp: {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        subtlePulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%":      { transform: "scale(1.05)" },
        },
        slideIndicator: {
          "0%":   { transform: "translateX(var(--indicator-from))" },
          "100%": { transform: "translateX(var(--indicator-to))" },
        },
      },

      animation: {
        fadeSlideUp:  "fadeSlideUp 0.3s ease-out both",
        pulseGlow:    "pulseGlow 2s ease-in-out infinite",
        countUp:      "countUp 0.5s ease both",
        subtlePulse:  "subtlePulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
