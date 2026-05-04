export const metadata = {
  title: "Chính sách hoàn tiền — Lingona",
  description:
    "Chính sách hoàn tiền Lingona — 7 ngày không điều kiện cho mọi gói Pro.",
};

/**
 * Chính sách hoàn tiền — Wave 6 Sprint 3.5C-3 commit 1.
 * Vietnamese formal legal voice. 7-day unconditional refund policy.
 */
export default function RefundPage() {
  return (
    <article className="space-y-8">
      <header className="mb-10 pb-6 border-b border-gray-200">
        <h1 className="font-display italic text-navy text-3xl lg:text-4xl leading-tight">
          Chính sách hoàn tiền
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          Cập nhật: 04/05/2026 · Version 1.0
        </p>
      </header>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">1. Chính sách chung</h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Lingona áp dụng chính sách hoàn tiền <strong>7 ngày không điều kiện</strong>{" "}
          cho mọi gói Pro. Trong vòng 7 ngày kể từ ngày thanh toán, Bạn có thể yêu cầu
          hoàn tiền 100% mà không cần nêu lý do. Chính sách này thể hiện cam kết của
          Lingona với chất lượng sản phẩm — nếu Dịch vụ không đáp ứng kỳ vọng của Bạn,
          Bạn không cần phải trả tiền.
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">2. Điều kiện hoàn tiền</h2>
        <p className="text-base text-gray-800 leading-relaxed mb-4">
          Yêu cầu hoàn tiền hợp lệ khi thỏa mãn các điều kiện sau:
        </p>
        <ul className="list-disc list-outside ml-6 space-y-2 text-base text-gray-800 leading-relaxed">
          <li>
            Yêu cầu được gửi trong vòng 7 ngày kể từ ngày thanh toán (tính theo dấu
            thời gian giao dịch).
          </li>
          <li>
            Áp dụng cho tất cả các gói Pro: 1 tháng, 3 tháng, 6 tháng, 12 tháng. Gói
            Free không áp dụng vì không phát sinh chi phí.
          </li>
          <li>
            Tài khoản không thuộc trường hợp ngoại lệ nêu tại mục 6 (đã bị tạm ngưng do
            vi phạm Điều khoản).
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">3. Quy trình yêu cầu</h2>
        <p className="text-base text-gray-800 leading-relaxed mb-4">
          Để yêu cầu hoàn tiền, xin gửi email đến{" "}
          <a href="mailto:refund@lingona.app" className="text-teal hover:underline">
            refund@lingona.app
          </a>{" "}
          với các thông tin sau:
        </p>
        <ul className="list-disc list-outside ml-6 space-y-2 text-base text-gray-800 leading-relaxed">
          <li>Địa chỉ email tài khoản Lingona đã thanh toán.</li>
          <li>Mã giao dịch hoặc biên lai thanh toán.</li>
          <li>Gói đã mua (1 tháng / 3 tháng / 6 tháng / 12 tháng).</li>
          <li>Ngày thanh toán.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">4. Thời gian xử lý</h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Lingona xác nhận tiếp nhận yêu cầu trong vòng 24 giờ làm việc. Sau khi xác
          minh thông tin hợp lệ, Lingona sẽ thực hiện hoàn tiền trong{" "}
          <strong>3-5 ngày làm việc</strong>. Tài khoản Pro sẽ được chuyển về trạng
          thái Free ngay khi yêu cầu được duyệt.
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">
          5. Hình thức hoàn tiền
        </h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Tiền hoàn lại được chuyển theo phương thức thanh toán Bạn đã sử dụng cho giao
          dịch ban đầu. Trong một số trường hợp do hạn chế kỹ thuật của bên xử lý
          thanh toán, Lingona có thể đề xuất phương thức thay thế (ví dụ: chuyển khoản
          ngân hàng) sau khi trao đổi cụ thể với Bạn.
        </p>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">
          6. Trường hợp ngoại lệ
        </h2>
        <p className="text-base text-gray-800 leading-relaxed mb-4">
          Lingona có quyền từ chối yêu cầu hoàn tiền trong các trường hợp sau:
        </p>
        <ul className="list-disc list-outside ml-6 space-y-2 text-base text-gray-800 leading-relaxed">
          <li>
            Yêu cầu được gửi sau 7 ngày kể từ ngày thanh toán.
          </li>
          <li>
            Tài khoản đã bị tạm ngưng hoặc chấm dứt do vi phạm{" "}
            <a href="/legal/terms" className="text-teal hover:underline">
              Điều khoản sử dụng
            </a>
            .
          </li>
          <li>
            Có dấu hiệu lạm dụng chính sách (ví dụ: liên tục đăng ký rồi yêu cầu hoàn
            tiền với cùng phương thức thanh toán).
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display italic text-navy text-2xl mb-4">7. Liên hệ</h2>
        <p className="text-base text-gray-800 leading-relaxed">
          Mọi thắc mắc về hoàn tiền, xin liên hệ qua email:{" "}
          <a href="mailto:refund@lingona.app" className="text-teal hover:underline">
            refund@lingona.app
          </a>
          .
        </p>
      </section>
    </article>
  );
}
