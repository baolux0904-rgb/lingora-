import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Lingona — Legal",
  description: "Legal pages for Lingona and Lingona-Bot",
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a1628] text-gray-200 antialiased">
        {children}
      </body>
    </html>
  );
}
