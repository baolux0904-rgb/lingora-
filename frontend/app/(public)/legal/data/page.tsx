export const metadata = {
  title: "Xử lý dữ liệu — Lingona",
  description:
    "Xử lý dữ liệu Lingona — quyền truy cập, chỉnh sửa, xóa và xuất dữ liệu cá nhân.",
};

/**
 * Xử lý dữ liệu — Wave 6 Sprint 3.5C-3 commit 1.
 * Vietnamese formal legal voice. Consolidates content for the legacy
 * /data-deletion route (commit 2 will redirect that path here).
 */
export default function DataPage() {
  return (
    <article className="space-y-8">
      <header className="mb-10 pb-6 border-b border-gray-200">
        <h1 className="font-display italic text-navy text-3xl lg:text-4xl leading-tight">
          Xử lý dữ liệu
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          Cập nhật: 04/05/2026 · Version 1.0
        </p>
      </header>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">1. Phạm vi</h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Tài liệu này quy định chi tiết các quyền của Bạn đối với dữ liệu cá nhân
          được Lingona xử lý, cùng quy trình thực hiện các yêu cầu liên quan đến dữ
          liệu. Tài liệu này bổ sung và làm rõ các nội dung tại{" "}
          <a href="/legal/privacy" className="text-teal hover:underline">
            Chính sách bảo mật
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">
          2. Quyền của người dùng
        </h2>
        <p className="text-base text-gray-800 leading-relaxed mb-4">
          Bạn có toàn quyền kiểm soát dữ liệu cá nhân của mình:
        </p>
        <ul className="list-disc list-outside ml-6 space-y-2 text-base text-gray-800 leading-relaxed">
          <li>
            <strong>Truy cập:</strong> xem toàn bộ thông tin tài khoản và tiến độ học
            tập tại trang Settings.
          </li>
          <li>
            <strong>Chỉnh sửa:</strong> cập nhật tên hiển thị, mật khẩu, ảnh đại diện
            tại trang Settings.
          </li>
          <li>
            <strong>Xóa:</strong> yêu cầu xóa toàn bộ dữ liệu cá nhân khỏi hệ thống
            (chi tiết tại mục 3).
          </li>
          <li>
            <strong>Xuất dữ liệu:</strong> yêu cầu nhận bản sao dữ liệu cá nhân dưới
            định dạng JSON có cấu trúc (chi tiết tại mục 7).
          </li>
          <li>
            <strong>Rút lại sự đồng ý:</strong> hủy quyền cho Lingona xử lý dữ liệu
            tại bất kỳ thời điểm nào, đồng nghĩa với việc chấm dứt sử dụng Dịch vụ.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">
          3. Quy trình xóa tài khoản
        </h2>
        <p className="text-base text-gray-800 leading-relaxed mb-4">
          Lingona cung cấp hai cách để Bạn yêu cầu xóa tài khoản:
        </p>
        <ul className="list-disc list-outside ml-6 space-y-2 text-base text-gray-800 leading-relaxed">
          <li>
            <strong>Trong ứng dụng:</strong> vào{" "}
            <span className="font-mono text-sm">Settings → Tài khoản → Xóa tài khoản</span>{" "}
            và làm theo hướng dẫn xác nhận.
          </li>
          <li>
            <strong>Qua email:</strong> gửi email đến{" "}
            <a href="mailto:privacy@lingona.app" className="text-teal hover:underline">
              privacy@lingona.app
            </a>{" "}
            kèm địa chỉ email tài khoản và yêu cầu rõ ràng &quot;Xóa tài khoản
            Lingona&quot;.
          </li>
        </ul>
        <p className="mt-4 text-base text-gray-800 leading-relaxed">
          Yêu cầu xóa tài khoản không thể hoàn tác. Trước khi gửi yêu cầu, Bạn nên cân
          nhắc xuất dữ liệu nếu cần lưu lại tiến độ học tập (mục 7).
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">
          4. Dữ liệu được xóa
        </h2>
        <p className="text-base text-gray-800 leading-relaxed mb-4">
          Khi tài khoản bị xóa, các dữ liệu sau đây sẽ được loại bỏ khỏi hệ thống:
        </p>
        <ul className="list-disc list-outside ml-6 space-y-2 text-base text-gray-800 leading-relaxed">
          <li>Bản ghi tài khoản (email, tên, username, mật khẩu mã hóa).</li>
          <li>Phiên đăng nhập đang hoạt động (logout toàn cầu).</li>
          <li>Tiến độ học tập, kết quả bài làm, điểm số.</li>
          <li>Ghi âm Speaking và bài viết Writing đã lưu.</li>
          <li>Lịch sử Battle, thành tựu (achievement), chuỗi streak.</li>
          <li>Kết nối xã hội, lời mời bạn bè, lịch sử trò chuyện.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">
          5. Dữ liệu không bị xóa
        </h2>
        <p className="text-base text-gray-800 leading-relaxed mb-4">
          Theo quy định của pháp luật Việt Nam, một số loại dữ liệu phải được lưu trữ
          tối thiểu trong thời hạn nhất định:
        </p>
        <ul className="list-disc list-outside ml-6 space-y-2 text-base text-gray-800 leading-relaxed">
          <li>
            Chứng từ tài chính liên quan đến giao dịch thanh toán: lưu trữ 5 năm theo
            luật kế toán.
          </li>
          <li>
            Nhật ký kỹ thuật phục vụ điều tra sự cố bảo mật: lưu trữ tối đa 1 năm
            dưới dạng ẩn danh, không gắn với danh tính cá nhân của Bạn.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">
          6. Thời gian xử lý
        </h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Yêu cầu xóa tài khoản hợp lệ sẽ được xử lý trong vòng tối đa{" "}
          <strong>30 ngày</strong> kể từ ngày Lingona xác nhận tiếp nhận. Trong khoảng
          thời gian này, tài khoản sẽ bị tạm ngưng — Bạn không thể đăng nhập, dữ liệu
          không hiển thị công khai.
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">7. Xuất dữ liệu</h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Để yêu cầu xuất bản sao dữ liệu cá nhân, xin gửi email đến{" "}
          <a href="mailto:privacy@lingona.app" className="text-teal hover:underline">
            privacy@lingona.app
          </a>{" "}
          với tiêu đề &quot;Xuất dữ liệu cá nhân&quot;. Lingona sẽ cung cấp bản sao
          dưới định dạng JSON có cấu trúc trong vòng 30 ngày kể từ ngày tiếp nhận yêu
          cầu hợp lệ.
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">8. Liên hệ</h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Mọi thắc mắc về xử lý dữ liệu, xin liên hệ qua email:{" "}
          <a href="mailto:privacy@lingona.app" className="text-teal hover:underline">
            privacy@lingona.app
          </a>
          .
        </p>
      </section>
    </article>
  );
}
