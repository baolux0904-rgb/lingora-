export const metadata = {
  title: "Chính sách cookie — Lingona",
  description:
    "Chính sách cookie Lingona — chỉ sử dụng cookie cần thiết, KHÔNG dùng third-party trackers.",
};

/**
 * Chính sách cookie — Wave 6 Sprint 3.5C-3 commit 1.
 * Vietnamese formal legal voice.
 */
export default function CookiePage() {
  return (
    <article className="space-y-8">
      <header className="mb-10 pb-6 border-b border-gray-200">
        <h1 className="font-display italic text-navy text-3xl lg:text-4xl leading-tight">
          Chính sách cookie
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          Cập nhật: 04/05/2026 · Version 1.0
        </p>
      </header>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">1. Cookie là gì</h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Cookie là các tệp dữ liệu nhỏ được trình duyệt lưu trữ trên thiết bị của Bạn
          khi truy cập một trang web. Cookie giúp trang web ghi nhớ trạng thái phiên
          đăng nhập, tùy chỉnh trải nghiệm và phân tích cách người dùng tương tác với
          dịch vụ.
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">2. Loại cookie sử dụng</h2>
        <p className="text-base text-gray-800 leading-relaxed mb-6">
          Lingona phân loại cookie thành ba nhóm:
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-navy text-lg mb-2">
              a. Cookie cần thiết (Authentication)
            </h3>
            <p className="text-base text-gray-800 leading-relaxed mb-2">
              Phục vụ việc đăng nhập và bảo vệ phiên truy cập. Bao gồm:
            </p>
            <ul className="list-disc list-outside ml-6 space-y-1 text-base text-gray-800 leading-relaxed">
              <li>JWT access token (thời hạn 15 phút) — lưu trong bộ nhớ ứng dụng.</li>
              <li>
                JWT refresh token (thời hạn 30 ngày) — lưu dưới dạng cookie httpOnly +
                Secure + SameSite=Strict, không thể truy cập từ JavaScript.
              </li>
              <li>
                password_version — bảo vệ phiên khỏi bị tái sử dụng sau khi đổi mật khẩu.
              </li>
            </ul>
            <p className="mt-2 text-sm text-gray-600">
              Cookie cần thiết <strong>KHÔNG</strong> thể tắt — nếu tắt, tài khoản sẽ
              không hoạt động.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-navy text-lg mb-2">
              b. Cookie chức năng (Functional)
            </h3>
            <p className="text-base text-gray-800 leading-relaxed mb-2">
              Lưu các tùy chỉnh giao diện của Bạn:
            </p>
            <ul className="list-disc list-outside ml-6 space-y-1 text-base text-gray-800 leading-relaxed">
              <li>Tùy chọn giao diện sáng/tối (theme).</li>
              <li>Tùy chọn ngôn ngữ hiển thị.</li>
            </ul>
            <p className="mt-2 text-sm text-gray-600">
              Có thể xóa qua cài đặt trình duyệt mà không ảnh hưởng đến chức năng cốt lõi.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-navy text-lg mb-2">
              c. Cookie phân tích (Analytics)
            </h3>
            <p className="text-base text-gray-800 leading-relaxed mb-2">
              Lingona sử dụng phân tích nội bộ ở mức ẩn danh để hiểu cách Dịch vụ được
              sử dụng và cải tiến chất lượng. Dữ liệu phân tích:
            </p>
            <ul className="list-disc list-outside ml-6 space-y-1 text-base text-gray-800 leading-relaxed">
              <li>
                <strong>KHÔNG</strong> bao gồm thông tin định danh cá nhân (PII).
              </li>
              <li>
                <strong>KHÔNG</strong> sử dụng các trình theo dõi của bên thứ ba (Google
                Analytics, Facebook Pixel, hoặc tương tự).
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">3. Quản lý cookie</h2>
        <p className="text-base text-gray-800 leading-relaxed mb-4">
          Bạn có thể quản lý cookie qua cài đặt trình duyệt:
        </p>
        <ul className="list-disc list-outside ml-6 space-y-2 text-base text-gray-800 leading-relaxed">
          <li>
            <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other
            site data.
          </li>
          <li>
            <strong>Firefox:</strong> Settings → Privacy &amp; Security → Cookies and Site
            Data.
          </li>
          <li>
            <strong>Safari:</strong> Preferences → Privacy → Manage Website Data.
          </li>
          <li>
            <strong>Edge:</strong> Settings → Cookies and site permissions.
          </li>
        </ul>
        <p className="mt-4 text-sm text-gray-600">
          Lưu ý: tắt cookie cần thiết sẽ làm tài khoản Lingona không thể đăng nhập.
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">
          4. Cookie bên thứ ba
        </h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Lingona cam kết <strong>KHÔNG</strong> đặt cookie bên thứ ba trên trang.
          Lingona <strong>KHÔNG</strong> sử dụng các nền tảng quảng cáo, theo dõi hành
          vi xuyên trang, hoặc retargeting. Toàn bộ cookie hiện diện trên Lingona đều
          do chính Lingona quản lý và có mục đích rõ ràng được nêu ở mục 2.
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">
          5. Thay đổi chính sách
        </h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Lingona có thể cập nhật Chính sách cookie này tại từng thời điểm để phản ánh
          những thay đổi về kỹ thuật hoặc quy định pháp luật. Phiên bản cập nhật sẽ có
          hiệu lực ngay khi được công bố trên trang này.
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">6. Liên hệ</h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Mọi thắc mắc về Chính sách cookie, xin liên hệ qua email:{" "}
          <a href="mailto:privacy@lingona.app" className="text-teal hover:underline">
            privacy@lingona.app
          </a>
          .
        </p>
      </section>
    </article>
  );
}
