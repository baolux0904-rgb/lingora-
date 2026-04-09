import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import AuthProvider from "@/providers/AuthProvider";
import SplashScreen from "@/components/SplashScreen";

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lingona — Luyện IELTS với AI Coach",
  description:
    "Lingona giúp bạn cải thiện Speaking, Grammar và Writing với phản hồi AI real-time. Không cần gia sư. Học mọi lúc, mọi nơi.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/lingora-logo.png", type: "image/png" },
    ],
    apple: "/lingora-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${playfair.variable} ${dmSans.variable}`}
    >
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
