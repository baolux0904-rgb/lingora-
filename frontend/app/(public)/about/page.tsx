import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Mascot from "@/components/ui/Mascot";

export const metadata = {
  title: "Về Lingona — Luyện IELTS không lạc lối",
  description:
    "Lingona là nền tảng luyện IELTS dành cho người Việt — biết bạn đang ở band mấy, sửa bài Writing và Speaking thật, đủ rẻ để bạn không phải đắn đo.",
  openGraph: {
    title: "Về Lingona — Luyện IELTS không lạc lối",
    description:
      "Lingona là nền tảng luyện IELTS dành cho người Việt — biết bạn đang ở band mấy, sửa bài Writing và Speaking thật, đủ rẻ để bạn không phải đắn đo.",
    url: "https://lingona.app/about",
    siteName: "Lingona",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Về Lingona — Luyện IELTS không lạc lối",
    description:
      "Lingona là nền tảng luyện IELTS dành cho người Việt — biết bạn đang ở band mấy, sửa bài Writing và Speaking thật, đủ rẻ để bạn không phải đắn đo.",
  },
  alternates: { canonical: "https://lingona.app/about" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Lingona",
  url: "https://lingona.app",
  description:
    "Nền tảng luyện IELTS dành cho người Việt — chẩn đoán band, AI feedback Writing/Speaking, học cùng bạn bè.",
  founder: {
    "@type": "Person",
    name: "Louis Nguyen",
  },
};

export default function AboutPage() {
  return (
    <main className="bg-cream min-h-screen text-navy">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back link */}
      <div className="max-w-[720px] mx-auto px-6 lg:px-8 pt-10 lg:pt-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-navy/70 hover:text-teal transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 rounded"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Về trang chủ
        </Link>
      </div>

      {/* ── Section 1 — Hero ───────────────────────────────────────── */}
      <section
        aria-labelledby="hero-headline"
        className="max-w-[820px] mx-auto px-6 lg:px-8 pt-16 lg:pt-24 pb-24 lg:pb-32"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-12">
          <div className="flex-1">
            <h1
              id="hero-headline"
              className="font-display italic text-[40px] sm:text-[48px] lg:text-[64px] leading-[1.1] tracking-tighter text-navy"
            >
              Bạn đã luyện IELTS bao lâu rồi — mà vẫn chưa biết mình đang ở
              band mấy?
            </h1>
            <p className="mt-8 font-sans text-lg lg:text-xl leading-relaxed text-navy/75 max-w-[480px]">
              Lingona là chỗ để bạn biết. Và để bạn không học một mình.
            </p>
          </div>
          <div className="lg:flex-shrink-0 self-start lg:self-center" aria-hidden="true">
            <Mascot size={120} mood="thinking" priority />
          </div>
        </div>
      </section>

      {/* ── Section 2 — Vấn đề thật ────────────────────────────────── */}
      <section
        aria-labelledby="section-problem"
        className="max-w-[720px] mx-auto px-6 lg:px-8 py-20 lg:py-28"
      >
        <h2
          id="section-problem"
          className="font-display italic text-[28px] sm:text-[32px] lg:text-[40px] leading-[1.15] tracking-tighter text-navy max-w-[600px]"
        >
          Học IELTS ở Việt Nam giống như đi trong sương.
        </h2>

        <div className="mt-10 lg:mt-12 max-w-[640px] space-y-7 font-sans text-[17px] lg:text-[19px] leading-[1.7] text-navy/85">
          <p>
            Bạn tải app. Bạn mua sách. Bạn save mấy chục video YouTube tiêu đề
            kiểu &ldquo;IELTS 8.0 trong 3 tháng&rdquo;. Ba tháng sau — vẫn chưa
            làm xong một đề Cambridge nào tử tế. Mở Reading ra cũng chẳng biết
            bắt đầu chỗ nào. Và câu hỏi quan trọng nhất — bạn đang ở band mấy
            — vẫn chưa có ai trả lời.
          </p>
          <p>
            Viết xong một bài Task 2 — gửi cho ai sửa? Gửi thầy thì 200-300
            nghìn một bài. Gửi app thì máy chấm theo công thức, ra một con số
            6.0 — không nói được bạn sai ở chỗ nào, sửa thế nào. Speaking còn
            nản hơn: nói vào điện thoại, không ai nghe, không ai chỉ. Mỗi lần
            luyện xong bạn lại có cùng một câu hỏi — vậy hôm nay mình giỏi
            hơn, hay vẫn thế?
          </p>
          <p>
            Không có bạn cùng luyện. Streak được năm hôm — đến hôm thứ sáu
            kẹt deadline — mất streak, rồi bỏ luôn cả tuần. Học một mình lâu
            rồi cũng chán.
          </p>
          <p>
            Một khóa IELTS offline ở trung tâm tử tế: 8 đến 15 triệu. Một app
            nước ngoài: hai mươi đô mỗi tháng, gần 500 nghìn — đến tháng thứ
            tư đã bằng nửa khóa offline. Mà tiền ăn còn phải tính từng bữa.
          </p>
        </div>
      </section>

      {/* ── Section 3 — Lingona là gì ──────────────────────────────── */}
      <section
        aria-labelledby="section-product"
        className="max-w-[720px] mx-auto px-6 lg:px-8 py-20 lg:py-28"
      >
        <h2
          id="section-product"
          className="font-display italic text-[28px] sm:text-[32px] lg:text-[40px] leading-[1.15] tracking-tighter text-navy max-w-[640px]"
        >
          Lingona là cái bản đồ — không phải thêm một app nữa.
        </h2>

        <div className="mt-10 lg:mt-12 max-w-[640px] space-y-7 font-sans text-[17px] lg:text-[19px] leading-[1.7] text-navy/85">
          <p>
            Việc đầu tiên Lingona làm là một bài chẩn đoán năm phút. Đọc một
            đoạn ngắn, nghe một đoạn ngắn, viết một đoạn ngắn, nói một câu
            vào mic. Xong — bạn biết mình đang ở band mấy. Không đoán. Không
            tự chấm. Từ con số đó, Lingona biết bắt đầu chỗ nào với bạn.
          </p>
          <p>
            Bạn viết một bài Writing — AI đọc và chỉ ra: chỗ này linking word
            chưa đúng, chỗ kia đoạn body thiếu một câu topic, ví dụ ở đoạn ba
            chưa cụ thể. Bạn nói một câu Speaking — AI nghe và nói: phát âm
            &lsquo;th&rsquo; đang thành &lsquo;t&rsquo;, câu này bạn ngập
            ngừng quá lâu ở giữa. Không phải một con số rỗng. Là câu cụ thể
            bạn đọc xong là biết phải sửa gì lần sau.
          </p>
          <p>
            Lingona có Battle — đấu Reading 1v1 với một bạn cùng rank, đề
            chia đôi, ai đúng nhiều hơn thắng. Có Friend Chat — nhắn cho bạn
            cùng học, gửi voice note thử Speaking. Có Streak. Có Achievement.
            Và có Lintopus đứng cạnh mỗi khi bạn xong một bài — thắng hay
            thua, có người ngồi cùng.
          </p>

          <div className="pt-4 flex justify-end" aria-hidden="true">
            <Mascot size={96} mood="default" />
          </div>
        </div>
      </section>

      {/* ── Section 4 — Pricing ────────────────────────────────────── */}
      <section
        aria-labelledby="section-pricing"
        className="max-w-[720px] mx-auto px-6 lg:px-8 py-20 lg:py-28"
      >
        <h2
          id="section-pricing"
          className="font-display italic text-[28px] sm:text-[32px] lg:text-[40px] leading-[1.15] tracking-tighter text-navy max-w-[600px]"
        >
          Lingona đủ rẻ để bạn không phải đắn đo.
        </h2>

        <div className="mt-10 lg:mt-12 max-w-[640px] space-y-7 font-sans text-[17px] lg:text-[19px] leading-[1.7] text-navy/85 tabular-nums">
          <p>
            Free tier của Lingona không phải bản demo bị cắt cụt. Speaking AI
            1 lần một ngày, Writing AI 1 lần một ngày — đủ cho một người
            luyện nghiêm túc. Grammar, Reading, Listening, Battle, Streak,
            Friend Chat — không giới hạn. Bạn dùng free nhiều tháng mà vẫn
            lên band được.
          </p>
          <p>
            Pro mở Speaking và Writing unlimited.{" "}
            <strong className="font-semibold text-navy">
              179 nghìn một tháng
            </strong>{" "}
            — bằng một bữa lẩu bạn rủ bạn đi.
          </p>
          <p>
            Hoặc{" "}
            <strong className="font-semibold text-navy">
              1.490 nghìn một năm
            </strong>{" "}
            — tiết kiệm khoảng 31%. Có cả gói 3 tháng (
            <strong className="font-semibold text-navy">499 nghìn</strong>) và
            gói 6 tháng (
            <strong className="font-semibold text-navy">929 nghìn</strong>)
            nếu bạn chưa muốn cam kết cả năm.{" "}
            <strong className="font-semibold text-navy">
              Ba ngày dùng thử Pro miễn phí, không cần thẻ.
            </strong>{" "}
            Nếu sau 3 ngày bạn thấy Lingona không đáng — hủy. Mình không giận.
          </p>
        </div>
      </section>

      {/* ── Section 5 — CTA ────────────────────────────────────────── */}
      <section
        aria-labelledby="section-cta"
        className="max-w-[720px] mx-auto px-6 lg:px-8 py-24 lg:py-32 text-center"
      >
        <h2
          id="section-cta"
          className="font-display italic text-[28px] sm:text-[32px] lg:text-[36px] leading-[1.15] tracking-tighter text-navy"
        >
          Năm phút để biết bạn đang ở đâu.
        </h2>
        <p className="mt-6 mx-auto max-w-[520px] font-sans text-[17px] lg:text-[19px] leading-[1.7] text-navy/85">
          Bài chẩn đoán nhanh. Sau đó Lingona vẽ cho bạn một lộ trình — từ
          chỗ bạn đang đứng, đến band bạn muốn đến.
        </p>

        <div className="mt-10 flex flex-col items-center gap-5">
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-teal text-cream font-semibold text-base shadow-colored hover:bg-teal-light transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            Làm bài chẩn đoán
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm text-navy/70 hover:text-teal transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 rounded"
          >
            Xem trước Lingona làm việc thế nào →
          </Link>
        </div>

        <div className="mt-16 flex justify-center" aria-hidden="true">
          <Mascot size={120} mood="happy" />
        </div>

        <nav
          aria-label="Liên kết phụ"
          className="mt-20 lg:mt-24 font-sans text-sm text-navy/70 flex justify-center items-center gap-3"
        >
          <Link
            href="/"
            className="hover:text-teal transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 rounded"
          >
            Trang chủ
          </Link>
          <span aria-hidden="true" className="text-navy/30">·</span>
          <Link
            href="/blog"
            className="hover:text-teal transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 rounded"
          >
            Blog
          </Link>
          <span aria-hidden="true" className="text-navy/30">·</span>
          <Link
            href="/help"
            className="hover:text-teal transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 rounded"
          >
            Trợ giúp
          </Link>
          <span aria-hidden="true" className="text-navy/30">·</span>
          <Link
            href="/legal"
            className="hover:text-teal transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 rounded"
          >
            Pháp lý
          </Link>
        </nav>
      </section>
    </main>
  );
}
