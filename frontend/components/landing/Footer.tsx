"use client";

import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Tính năng", href: "#features" },
  { label: "Bảng giá", href: "#pricing" },
  { label: "Blog", href: "#" },
  { label: "Liên hệ", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo + tagline */}
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" fill="url(#footer-grad)" />
              <ellipse cx="12" cy="13" rx="2.5" ry="3" fill="white" />
              <ellipse cx="20" cy="13" rx="2.5" ry="3" fill="white" />
              <circle cx="12" cy="13.5" r="1.2" fill="#1B2B4B" />
              <circle cx="20" cy="13.5" r="1.2" fill="#1B2B4B" />
              <path d="M11 20c0 0 2 2.5 5 2.5s5-2.5 5-2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="footer-grad" x1="2" y1="2" x2="30" y2="30">
                  <stop stopColor="#00A896" />
                  <stop offset="1" stopColor="#1B2B4B" />
                </linearGradient>
              </defs>
            </svg>
            <div>
              <span className="font-playfair text-base font-semibold text-white">
                Lingona
              </span>
              <p className="text-xs text-gray-500">AI-powered IELTS coach</p>
            </div>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Socials */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-gray-500 hover:text-white transition-colors duration-200 cursor-pointer"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-white transition-colors duration-200 cursor-pointer"
              aria-label="TikTok"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.19 8.19 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.14z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/[0.04] text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Lingona. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
