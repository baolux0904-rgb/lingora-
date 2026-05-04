export const metadata = {
  title: "Điều khoản sử dụng — Lingona",
  description:
    "Điều khoản sử dụng Lingona — quy định trách nhiệm, quyền sử dụng dịch vụ và nội dung do người dùng tạo.",
};

/**
 * Điều khoản sử dụng — Wave 6 Sprint 3.5C-3 commit 1.
 * Vietnamese formal legal voice (peer-voice exception per persona.md doc).
 */
export default function TermsPage() {
  return (
    <article className="space-y-8">
      <header className="mb-10 pb-6 border-b border-gray-200">
        <h1 className="font-display italic text-navy text-3xl lg:text-4xl leading-tight">
          Điều khoản sử dụng
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          Cập nhật: 04/05/2026 · Version 1.0
        </p>
      </header>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">1. Chấp nhận điều khoản</h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Bằng việc truy cập hoặc sử dụng nền tảng Lingona (sau đây gọi là &quot;Dịch vụ&quot;),
          người dùng (sau đây gọi là &quot;Bạn&quot;) đồng ý chịu sự ràng buộc của các Điều
          khoản sử dụng này. Nếu Bạn không đồng ý với bất kỳ điều khoản nào, Bạn không
          được phép sử dụng Dịch vụ.
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">2. Mô tả dịch vụ</h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Lingona là nền tảng luyện thi IELTS dành cho người Việt, cung cấp các tính năng
          chấm điểm AI cho Speaking và Writing, thư viện đề Reading, đề Listening, hệ
          thống Battle 1v1, hệ thống thành tựu (achievement), và các tính năng học tập
          khác. Lingona được vận hành bởi cá nhân/tổ chức được nêu tại mục Liên hệ.
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">3. Tài khoản người dùng</h2>
        <p className="text-base text-gray-800 leading-relaxed mb-4">
          Để sử dụng đầy đủ Dịch vụ, Bạn cần đăng ký tài khoản. Bạn đồng ý:
        </p>
        <ul className="list-disc list-outside ml-6 space-y-2 text-base text-gray-800 leading-relaxed">
          <li>Cung cấp thông tin chính xác, đầy đủ và cập nhật khi đăng ký.</li>
          <li>Bảo mật mật khẩu và thông tin đăng nhập, không chia sẻ tài khoản với người khác.</li>
          <li>Chịu trách nhiệm về mọi hoạt động xảy ra dưới tài khoản của Bạn.</li>
          <li>Thông báo cho Lingona ngay khi phát hiện việc sử dụng tài khoản trái phép.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">4. Quy định độ tuổi</h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Dịch vụ dành cho người dùng từ đủ 13 tuổi trở lên. Người dùng dưới 18 tuổi cần
          có sự đồng ý của cha mẹ hoặc người giám hộ trước khi sử dụng. Lingona có quyền
          yêu cầu xác minh độ tuổi và từ chối cung cấp Dịch vụ nếu phát hiện vi phạm.
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">5. Hành vi cấm</h2>
        <p className="text-base text-gray-800 leading-relaxed mb-4">
          Khi sử dụng Dịch vụ, Bạn cam kết không thực hiện các hành vi sau:
        </p>
        <ul className="list-disc list-outside ml-6 space-y-2 text-base text-gray-800 leading-relaxed">
          <li>
            Phát tán nội dung vi phạm pháp luật Việt Nam, kích động bạo lực, phân biệt
            đối xử, hoặc xâm phạm quyền của người khác.
          </li>
          <li>
            Cố ý gây gián đoạn hoặc làm tổn hại đến hệ thống, máy chủ, hoặc mạng kết nối
            với Dịch vụ.
          </li>
          <li>
            Sử dụng các công cụ tự động (bot, scraper) để truy cập Dịch vụ ngoài phạm vi
            cho phép.
          </li>
          <li>Thu thập dữ liệu của người dùng khác mà không có sự đồng ý.</li>
          <li>Mạo danh người khác hoặc cung cấp thông tin giả mạo.</li>
          <li>
            Sử dụng Dịch vụ cho mục đích thương mại trái phép, bao gồm việc bán lại tài
            khoản hoặc nội dung.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">6. Quyền sở hữu trí tuệ</h2>
        <p className="text-base text-gray-800 leading-relaxed mb-4">
          Toàn bộ nội dung, phần mềm, thiết kế, mã nguồn, hình ảnh, văn bản và các yếu tố
          khác cấu thành Dịch vụ là tài sản của Lingona hoặc được Lingona cấp phép sử
          dụng, được bảo hộ bởi luật sở hữu trí tuệ của Việt Nam và các điều ước quốc tế.
        </p>
        <p className="text-base text-gray-800 leading-relaxed">
          Đối với nội dung do Bạn tạo ra trong quá trình sử dụng Dịch vụ (bài viết
          Writing, ghi âm Speaking, v.v.), Bạn vẫn giữ quyền sở hữu, đồng thời cấp cho
          Lingona giấy phép không độc quyền, miễn phí, có hiệu lực toàn cầu để xử lý, lưu
          trữ và hiển thị nội dung đó nhằm mục đích cung cấp và cải thiện Dịch vụ.
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">
          7. Phí dịch vụ và thanh toán
        </h2>
        <p className="text-base text-gray-800 leading-relaxed mb-4">
          Lingona cung cấp gói Free (miễn phí) và các gói Pro (có phí). Mức phí, kỳ hạn
          và quyền lợi cụ thể được công bố tại trang Pricing và có thể được điều chỉnh
          tại từng thời điểm.
        </p>
        <p className="text-base text-gray-800 leading-relaxed">
          Việc thanh toán được xử lý qua các nhà cung cấp dịch vụ thanh toán bên thứ ba.
          Bạn đồng ý chịu trách nhiệm về tính chính xác của thông tin thanh toán cung
          cấp. Chi tiết về hoàn tiền được quy định tại{" "}
          <a href="/legal/refund" className="text-teal hover:underline">
            Chính sách hoàn tiền
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">8. Giới hạn trách nhiệm</h2>
        <p className="text-base text-gray-800 leading-relaxed mb-4">
          Lingona cung cấp Dịch vụ trên cơ sở &quot;nguyên trạng&quot; và &quot;sẵn
          có&quot;. Lingona không cam kết rằng Dịch vụ sẽ luôn hoạt động không gián
          đoạn, không có lỗi, hoặc đáp ứng mọi yêu cầu cụ thể của Bạn.
        </p>
        <p className="text-base text-gray-800 leading-relaxed">
          Trong phạm vi pháp luật cho phép, Lingona không chịu trách nhiệm đối với các
          thiệt hại gián tiếp, ngẫu nhiên, đặc biệt hoặc hậu quả phát sinh từ việc sử
          dụng hoặc không thể sử dụng Dịch vụ. Tổng trách nhiệm của Lingona đối với mọi
          yêu cầu phát sinh từ Điều khoản này không vượt quá tổng số tiền Bạn đã thanh
          toán cho Lingona trong 12 tháng gần nhất.
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">9. Chấm dứt</h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Lingona có quyền tạm ngưng hoặc chấm dứt tài khoản của Bạn nếu phát hiện vi
          phạm Điều khoản này. Bạn có thể yêu cầu xóa tài khoản và dữ liệu cá nhân theo
          quy trình tại{" "}
          <a href="/legal/data" className="text-teal hover:underline">
            Xử lý dữ liệu
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">10. Sửa đổi điều khoản</h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Lingona có thể sửa đổi Điều khoản này tại từng thời điểm. Phiên bản cập nhật
          sẽ có hiệu lực ngay khi được công bố trên trang này. Việc Bạn tiếp tục sử dụng
          Dịch vụ sau ngày cập nhật được xem là chấp nhận các thay đổi.
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">
          11. Luật áp dụng và giải quyết tranh chấp
        </h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Điều khoản này được điều chỉnh bởi pháp luật nước Cộng hòa Xã hội Chủ nghĩa
          Việt Nam. Mọi tranh chấp phát sinh sẽ được ưu tiên giải quyết bằng thương
          lượng; nếu không đạt được thỏa thuận, vụ việc sẽ được giải quyết tại Tòa án có
          thẩm quyền tại Việt Nam.
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">12. Liên hệ</h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Mọi thắc mắc về Điều khoản sử dụng, xin liên hệ qua email:{" "}
          <a href="mailto:legal@lingona.app" className="text-teal hover:underline">
            legal@lingona.app
          </a>
          .
        </p>
        <p className="mt-3 text-sm text-gray-600">
          Thông tin pháp lý đầy đủ về đơn vị vận hành sẽ được cập nhật khi Lingona chính
          thức ra mắt.
        </p>
      </section>
    </article>
  );
}
