import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import AuthProvider from "@/providers/AuthProvider";
import SplashScreen from "@/components/SplashScreen";

// Wave 6 Sprint 3.5E: explicit weight + style arrays. Pre-Sprint-3.5E only
// the default 400 loaded, which left every font-semibold / font-bold in the
// codebase relying on browser-synthesized faux-bold — muddy on Vietnamese
// diacritics (ă/â/ê/ô/ơ/ư/đ). See lingona-design/09-anti-patterns/
// faux-bold-ban.md for the rationale.
const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lingona.app"),
  title: {
    default: "Lingona — Luyện IELTS Speaking & Writing AI",
    template: "%s | Lingona",
  },
  description:
    "Luyện thi IELTS online với AI. Chấm Speaking, Writing theo chuẩn IELTS. Luyện tập mọi lúc, mọi nơi. Mục tiêu band 6.5, 7.0, 7.5+.",
  keywords: [
    "luyện IELTS", "IELTS speaking AI", "luyện thi IELTS online",
    "IELTS writing AI", "luyện speaking IELTS", "band 6.5",
    "học IELTS online", "luyện thi IELTS", "IELTS Vietnam",
  ],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://lingona.app",
    siteName: "Lingona",
    title: "Lingona — Luyện IELTS Speaking & Writing AI",
    description: "Luyện thi IELTS online với AI. Chấm Speaking, Writing theo chuẩn IELTS. Mục tiêu band 6.5+.",
    // Image auto-injected by frontend/app/opengraph-image.tsx (Next 14 file convention).
  },
  twitter: {
    card: "summary_large_image",
    title: "Lingona — Luyện IELTS Speaking & Writing AI",
    description: "Luyện thi IELTS online với AI. Mục tiêu band 6.5+.",
    // Image auto-injected by frontend/app/opengraph-image.tsx (Next 14 file convention).
  },
  alternates: {
    canonical: "https://lingona.app",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lingona",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/lingora-logo.png", type: "image/png" },
    ],
    apple: "/lingora-logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0F1E",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      data-mode="brand"
      suppressHydrationWarning
      className={`${playfair.variable} ${dmSans.variable}`}
    >
      {/* Wave 6 Sprint 2B: data-mode="brand" wires the 3-mode CSS variable system
          (per .claude/skills/lingona-design/04-modes/mode-switch-rules.md).
          Body className kept minimal — section-level bg-cream applied per Hero/landing
          components. Existing (app) pages unaffected: next-themes .dark class is
          orthogonal to data-mode and will be migrated in Sprint 8. */}
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark">
          <AuthProvider>
            <SplashScreen />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
