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
      colors: {
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
      fontFamily: {
        sora: ["Sora", "sans-serif"],
        sans: ["DM Sans", "sans-serif"],
      },
      borderColor: {
        DEFAULT: "rgba(255,255,255,0.06)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        "glow-primary": "0 0 20px rgba(124,92,252,0.2)",
        "glow-accent": "0 0 20px rgba(56,189,248,0.2)",
        "card": "0 2px 12px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        "card-hover": "0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
        "card-lg": "0 12px 32px rgba(0,0,0,0.15)",
      },
      keyframes: {
        fadeSlideUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 6px rgba(124,92,252,0.4)" },
          "50%": { boxShadow: "0 0 14px rgba(124,92,252,0.7)" },
        },
        progressFill: {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress-target)" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeSlideUp: "fadeSlideUp 0.45s ease both",
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
        countUp: "countUp 0.5s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
