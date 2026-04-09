"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

const NAV_LINKS = [
  { label: "Tính năng", href: "#features" },
  { label: "Cách hoạt động", href: "#how-it-works" },
  { label: "Bảng giá", href: "#pricing" },
];

export default function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 rounded-lg ${
          scrolled
            ? "bg-[#0A0F1E]/80 dark:bg-[#0A0F1E]/80 backdrop-blur-xl shadow-lg border border-white/[0.06]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
              <Image src="/mascot.svg" alt="Lintopus" width={36} height={36} />
              <span className="font-playfair text-xl font-bold text-white">
                Lingona
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-md text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
                aria-label="Chuyển đổi giao diện"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </button>
              <Link
                href="/login"
                className="text-sm text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 cursor-pointer"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium px-5 py-2.5 rounded-md bg-gradient-to-r from-[#00A896] to-[#00C9B1] text-white hover:opacity-90 transition-opacity duration-200 cursor-pointer"
              >
                Bắt đầu miễn phí
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white cursor-pointer"
              aria-label="Menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {mobileOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-24 z-50 md:hidden bg-[#0F1429]/95 backdrop-blur-xl rounded-lg border border-white/[0.06] p-6 shadow-xl"
          >
            <div className="flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-base text-gray-300 hover:text-white transition-colors duration-200 py-2 cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
              <hr className="border-white/[0.06]" />
              <div className="flex items-center justify-between">
                <Link
                  href="/login"
                  className="text-sm text-gray-300 hover:text-white cursor-pointer"
                >
                  Đăng nhập
                </Link>
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-md text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
                  aria-label="Chuyển đổi giao diện"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                </button>
              </div>
              <Link
                href="/register"
                className="text-center text-sm font-medium px-5 py-3 rounded-md bg-gradient-to-r from-[#00A896] to-[#00C9B1] text-white cursor-pointer"
              >
                Bắt đầu miễn phí
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

