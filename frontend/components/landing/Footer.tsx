import Link from "next/link";

/**
 * Footer — Wave 6 Sprint 2E rebuild.
 *
 * Per .claude/skills/lingona-design:
 * - 02-layout/desktop-canvas.md: 4-col multi-section layout (12-col grid)
 * - 09-anti-patterns/desktop-waste.md#8: NOT sparse single-column footer
 * - 04-modes/brand.md: cream-warm bg + navy text + border-top gray-200
 * - 05-voice/persona.md: Vietnamese peer voice + 'Made in Vietnam 🇻🇳'
 *
 * 4 columns: Brand info / Sản phẩm / Tài nguyên / Pháp lý.
 * Legal links (/terms, /privacy, /refund) point to routes not yet built;
 * pages defer to post-launch when legal text drafted.
 */
export default function Footer() {
  return (
    <footer className="bg-cream-warm border-t border-gray-200 py-16 lg:py-20 px-6 lg:px-12 xl:px-20">
      <div className="max-w-[1120px] mx-auto">
        {/* Top — 4-col grid desktop, 2-col mobile */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-12 mb-12">
          {/* Brand info — col-span-4 desktop */}
          <div className="col-span-2 md:col-span-4">
            <Link
              href="/"
              className="inline-block font-display italic text-navy text-2xl hover:text-teal transition-colors duration-150"
            >
              Lingona
            </Link>
            <p className="mt-4 text-sm text-gray-700 leading-relaxed max-w-xs">
              Cùng luyện IELTS từ Band 5.0 đến 7.5+ — phản hồi cụ thể, không
              cảm tính.
            </p>
            <p className="mt-4 text-xs text-gray-500">Made in Vietnam 🇻🇳</p>
          </div>

          {/* Sản phẩm — col-span-3, starts col 6 */}
          <div className="md:col-span-3 md:col-start-6">
            <h4 className="text-sm font-semibold text-navy mb-3">Sản phẩm</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <Link
                  href="/#features"
                  className="hover:text-teal transition-colors duration-150"
                >
                  Tính năng
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="hover:text-teal transition-colors duration-150"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="hover:text-teal transition-colors duration-150"
                >
                  Cách hoạt động
                </Link>
              </li>
            </ul>
          </div>

          {/* Tài nguyên — col-span-2 */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold text-navy mb-3">Tài nguyên</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <Link
                  href="/about"
                  className="hover:text-teal transition-colors duration-150"
                >
                  Về Lingona
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-teal transition-colors duration-150"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="hover:text-teal transition-colors duration-150"
                >
                  Help
                </Link>
              </li>
              <li>
                <a
                  href="https://facebook.com/lingona.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal transition-colors duration-150"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>

          {/* Pháp lý — col-span-3 */}
          <div className="md:col-span-3">
            <h4 className="text-sm font-semibold text-navy mb-3">Pháp lý</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <Link
                  href="/terms"
                  className="hover:text-teal transition-colors duration-150"
                >
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-teal transition-colors duration-150"
                >
                  Bảo mật
                </Link>
              </li>
              <li>
                <Link
                  href="/refund"
                  className="hover:text-teal transition-colors duration-150"
                >
                  Hoàn tiền
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@lingona.app"
                  className="hover:text-teal transition-colors duration-150"
                >
                  hello@lingona.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-500">
          <p>© 2026 Lingona. Mọi quyền được bảo lưu.</p>
          <p>Lingona ra mắt chính thức 09/07/2026.</p>
        </div>
      </div>
    </footer>
  );
}
