export const metadata = {
  title: "Chính sách bảo mật — Lingona",
  description:
    "Chính sách bảo mật Lingona — quy định thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của người dùng.",
};

/**
 * Chính sách bảo mật — Wave 6 Sprint 3.5C-3 commit 1.
 * Vietnamese formal legal voice.
 */
export default function PrivacyPage() {
  return (
    <article className="space-y-8">
      <header className="mb-10 pb-6 border-b border-gray-200">
        <h1 className="font-display italic text-navy text-3xl lg:text-4xl leading-tight">
          Chính sách bảo mật
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          Cập nhật: 04/05/2026 · Version 1.0
        </p>
      </header>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">1. Phạm vi áp dụng</h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Chính sách bảo mật này áp dụng đối với toàn bộ thông tin cá nhân mà Lingona
          (sau đây gọi là &quot;Chúng tôi&quot;) thu thập từ người dùng (sau đây gọi là
          &quot;Bạn&quot;) khi Bạn sử dụng nền tảng Lingona (sau đây gọi là &quot;Dịch
          vụ&quot;). Chính sách này là một phần không tách rời của{" "}
          <a href="/legal/terms" className="text-teal hover:underline">
            Điều khoản sử dụng
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">2. Thông tin thu thập</h2>
        <p className="text-base text-gray-800 leading-relaxed mb-4">
          Lingona thu thập tối thiểu những thông tin cần thiết để cung cấp Dịch vụ:
        </p>
        <ul className="list-disc list-outside ml-6 space-y-2 text-base text-gray-800 leading-relaxed">
          <li>
            <strong>Thông tin tài khoản:</strong> địa chỉ email, tên hiển thị, username,
            mật khẩu (lưu dưới dạng mã hóa bcrypt, không lưu mật khẩu nguyên bản).
          </li>
          <li>
            <strong>Thông tin đăng nhập qua bên thứ ba:</strong> nếu Bạn đăng nhập qua
            Google, Lingona nhận địa chỉ email và tên hiển thị do Google cung cấp.
          </li>
          <li>
            <strong>Dữ liệu sử dụng:</strong> tiến độ học tập, kết quả bài làm, điểm số,
            ghi âm Speaking, bài viết Writing, lịch sử Battle, thành tựu đã đạt.
          </li>
          <li>
            <strong>Dữ liệu kỹ thuật:</strong> địa chỉ IP, loại trình duyệt, hệ điều
            hành, thiết bị truy cập — phục vụ vận hành an toàn và phân tích lỗi hệ
            thống.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">3. Mục đích sử dụng</h2>
        <p className="text-base text-gray-800 leading-relaxed mb-4">
          Lingona sử dụng thông tin của Bạn nhằm các mục đích:
        </p>
        <ul className="list-disc list-outside ml-6 space-y-2 text-base text-gray-800 leading-relaxed">
          <li>Xác thực tài khoản và bảo vệ an toàn truy cập.</li>
          <li>Cung cấp, vận hành và cải tiến chất lượng Dịch vụ.</li>
          <li>Lưu trữ tiến độ học tập và cá nhân hóa trải nghiệm.</li>
          <li>Hỗ trợ kỹ thuật khi Bạn gửi yêu cầu.</li>
          <li>Tuân thủ nghĩa vụ pháp lý theo quy định của pháp luật Việt Nam.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">4. Lưu trữ và bảo mật</h2>
        <p className="text-base text-gray-800 leading-relaxed mb-4">
          Dữ liệu của Bạn được lưu trữ trên cơ sở dữ liệu PostgreSQL có mã hóa khi nghỉ
          (encryption at rest), được vận hành bởi nhà cung cấp hạ tầng đám mây có cam
          kết bảo mật. Tệp âm thanh ghi từ tính năng Speaking được lưu trên dịch vụ lưu
          trữ đối tượng có kiểm soát truy cập.
        </p>
        <p className="text-base text-gray-800 leading-relaxed">
          Lingona áp dụng các biện pháp kỹ thuật bao gồm: mã hóa mật khẩu bằng thuật
          toán bcrypt cost 12, token đăng nhập sử dụng JWT có thời hạn ngắn (15 phút) +
          refresh token httpOnly Secure SameSite=Strict, cơ chế password_version để vô
          hiệu hóa toàn bộ phiên đăng nhập khi Bạn đổi mật khẩu, và rate-limit chống
          tấn công brute-force.
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">
          5. Chia sẻ với bên thứ ba
        </h2>
        <p className="text-base text-gray-800 leading-relaxed mb-4">
          Lingona <strong>KHÔNG</strong> bán, cho thuê hoặc chia sẻ thông tin cá nhân
          của Bạn cho bất kỳ bên thứ ba nào nhằm mục đích quảng cáo hoặc thương mại.
          Lingona chỉ chia sẻ dữ liệu trong các trường hợp giới hạn sau:
        </p>
        <ul className="list-disc list-outside ml-6 space-y-2 text-base text-gray-800 leading-relaxed">
          <li>
            <strong>Nhà cung cấp hạ tầng:</strong> các đối tác cloud hosting, lưu trữ
            tệp, gửi email — chỉ ở mức cần thiết để vận hành Dịch vụ.
          </li>
          <li>
            <strong>Nhà cung cấp AI:</strong> nội dung Speaking và Writing được gửi tới
            các nhà cung cấp dịch vụ AI để chấm điểm, ở dạng ẩn danh không gắn với
            danh tính cá nhân của Bạn.
          </li>
          <li>
            <strong>Cơ quan có thẩm quyền:</strong> khi có yêu cầu hợp pháp từ cơ quan
            nhà nước theo quy định của pháp luật.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">6. Thanh toán</h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Khi tính năng thanh toán được kích hoạt, danh sách bên xử lý thanh toán và
          thông tin được chia sẻ sẽ được cập nhật chi tiết trong mục này. Lingona cam
          kết không lưu trữ thông tin thẻ ngân hàng nguyên bản trên hệ thống của mình
          — toàn bộ giao dịch sẽ được xử lý qua các nhà cung cấp dịch vụ thanh toán đạt
          chuẩn bảo mật.
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">
          7. Cookie và công nghệ tương tự
        </h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Lingona sử dụng cookie cần thiết cho việc đăng nhập và một số cookie chức năng
          cơ bản. Lingona <strong>KHÔNG</strong> sử dụng các cookie theo dõi của bên
          thứ ba (Google Analytics, Facebook Pixel hoặc tương tự). Chi tiết được trình
          bày tại{" "}
          <a href="/legal/cookie" className="text-teal hover:underline">
            Chính sách cookie
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">
          8. Quyền của người dùng
        </h2>
        <p className="text-base text-gray-800 leading-relaxed mb-4">
          Bạn có các quyền sau đối với dữ liệu cá nhân của mình:
        </p>
        <ul className="list-disc list-outside ml-6 space-y-2 text-base text-gray-800 leading-relaxed">
          <li>Quyền truy cập và xem lại dữ liệu cá nhân Lingona đang lưu trữ.</li>
          <li>Quyền chỉnh sửa hoặc cập nhật thông tin tài khoản.</li>
          <li>Quyền yêu cầu xóa toàn bộ dữ liệu cá nhân khỏi hệ thống.</li>
          <li>Quyền yêu cầu xuất dữ liệu cá nhân dưới định dạng cấu trúc (JSON).</li>
          <li>Quyền rút lại sự đồng ý xử lý dữ liệu tại bất kỳ thời điểm nào.</li>
        </ul>
        <p className="mt-4 text-base text-gray-800 leading-relaxed">
          Quy trình thực hiện chi tiết được mô tả tại{" "}
          <a href="/legal/data" className="text-teal hover:underline">
            Xử lý dữ liệu
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">
          9. Trẻ em dưới 13 tuổi
        </h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Lingona <strong>KHÔNG</strong> chủ ý thu thập dữ liệu của trẻ em dưới 13
          tuổi. Nếu Lingona phát hiện một tài khoản thuộc về người dưới 13 tuổi, tài
          khoản đó sẽ bị tạm ngưng và dữ liệu sẽ bị xóa theo quy trình. Cha mẹ hoặc
          người giám hộ phát hiện trường hợp này, xin liên hệ qua email tại mục Liên
          hệ.
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">
          10. Lưu trữ và xóa dữ liệu
        </h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Lingona lưu trữ dữ liệu của Bạn trong suốt thời gian tài khoản còn hoạt động.
          Khi Bạn yêu cầu xóa tài khoản, dữ liệu cá nhân sẽ được xóa trong vòng 30 ngày,
          ngoại trừ một số dữ liệu phải lưu trữ theo quy định pháp luật (ví dụ: chứng
          từ tài chính). Chi tiết được trình bày tại{" "}
          <a href="/legal/data" className="text-teal hover:underline">
            Xử lý dữ liệu
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">
          11. Sửa đổi chính sách
        </h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Lingona có thể sửa đổi Chính sách bảo mật này tại từng thời điểm. Phiên bản
          cập nhật sẽ có hiệu lực ngay khi được công bố trên trang này. Lingona khuyến
          khích Bạn xem lại định kỳ.
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">12. Liên hệ</h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Mọi thắc mắc về Chính sách bảo mật, xin liên hệ qua email:{" "}
          <a href="mailto:privacy@lingona.app" className="text-teal hover:underline">
            privacy@lingona.app
          </a>
          .
        </p>
      </section>
    </article>
  );
}
