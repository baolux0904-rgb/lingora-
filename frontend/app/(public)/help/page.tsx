import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Mascot from "@/components/ui/Mascot";
import FaqItem from "./FaqItem";

export const metadata = {
  title: "Trợ giúp Lingona — Câu hỏi thường gặp",
  description:
    "Câu hỏi thường gặp về Lingona — tài khoản, các kỹ năng IELTS, gói Pro, hoàn tiền, và cách liên hệ với mình.",
  openGraph: {
    title: "Trợ giúp Lingona — Câu hỏi thường gặp",
    description:
      "Câu hỏi thường gặp về Lingona — tài khoản, các kỹ năng IELTS, gói Pro, hoàn tiền, và cách liên hệ với mình.",
    url: "https://lingona.app/help",
    siteName: "Lingona",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trợ giúp Lingona — Câu hỏi thường gặp",
    description:
      "Câu hỏi thường gặp về Lingona — tài khoản, các kỹ năng IELTS, gói Pro, hoàn tiền, và cách liên hệ với mình.",
  },
  alternates: { canonical: "https://lingona.app/help" },
};

type Qa = { q: string; a: string };
type Category = { id: string; title: string; intro: string; items: Qa[] };

const categories: Category[] = [
  {
    id: "account",
    title: "Tài khoản & Đăng nhập",
    intro:
      "Mọi thứ liên quan đến tài khoản — đăng nhập, mật khẩu, email, xoá tài khoản.",
    items: [
      {
        q: "Mình quên mật khẩu, làm sao đăng nhập lại?",
        a: "Vào trang đăng nhập, bấm “Quên mật khẩu”. Nhập email bạn đã đăng ký — mình gửi link reset cho bạn trong vòng 1–2 phút. Nếu không thấy email, kiểm tra mục Spam hoặc Promotions trước.",
      },
      {
        q: "Mình đăng nhập bằng Google được không?",
        a: "Được. Ở trang đăng nhập hoặc đăng ký, bấm “Tiếp tục với Google” — không cần tạo mật khẩu riêng. Nếu bạn đã có tài khoản với email trùng Google, hai cái sẽ tự gộp khi bạn đăng nhập Google lần đầu.",
      },
      {
        q: "Mình muốn đổi email tài khoản, có được không?",
        a: "Hiện tại đổi email phải làm thủ công — nhắn cho mình qua baolux0904@gmail.com với email cũ và email mới, mình đổi giúp trong 24–48 tiếng. Tính năng tự đổi email trong Settings sẽ có sau launch.",
      },
      {
        q: "Mình muốn xoá tài khoản, làm thế nào?",
        a: "Hiện tại xoá tài khoản phải làm thủ công — nhắn cho mình qua baolux0904@gmail.com với email tài khoản của bạn, mình xoá vĩnh viễn trong vòng 24–48 tiếng. Tính năng tự xoá trong Settings sẽ có trong các bản update tới.",
      },
    ],
  },
  {
    id: "ielts",
    title: "IELTS Features",
    intro:
      "Cách các tính năng luyện IELTS của Lingona hoạt động — chẩn đoán, AI chấm bài, Battle, Streak, Listening.",
    items: [
      {
        q: "Bài chẩn đoán band hoạt động thế nào? Có chính xác không?",
        a: "Bài chẩn đoán mất khoảng 5 phút — bạn đọc một đoạn ngắn, nghe một đoạn, viết một đoạn ngắn, và nói một câu vào mic. Lingona chấm cả bốn kỹ năng theo rubric IELTS rồi đưa ra một band tổng quát. Không phải band chính thức như đi thi thật — nhưng đủ để biết bạn đang ở đâu và bắt đầu luyện từ đâu.",
      },
      {
        q: "AI chấm Writing với Speaking có đáng tin không?",
        a: "AI của Lingona chấm theo đúng bốn tiêu chí IELTS (Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy cho Writing; Fluency, Lexical, Grammar, Pronunciation cho Speaking) và đưa ra feedback cụ thể từng câu — không phải một con số rỗng. Mình calibrate AI với sample essays và speaking đã được chấm theo rubric Cambridge/IDP/British Council, để band Lingona đưa ra bám sát cách examiner thật chấm. AI không thay thế được thầy/cô review trước khi thi thật, nhất là khi bạn đã ở band 7.0+. Coi feedback của Lingona như một bạn cùng học giỏi hơn — đủ để biết sai chỗ nào, nhưng vẫn nên có người thật xem lại trước ngày thi.",
      },
      {
        q: "Free tier giới hạn Speaking với Writing 1 lần/ngày — reset lúc mấy giờ?",
        a: "Reset lúc 0:00 giờ Việt Nam (GMT+7) mỗi ngày. Bạn dùng Speaking AI lúc 23:00 và Writing AI lúc 23:30 thì đúng 30 phút sau là có thêm một lượt mới của mỗi loại. Grammar, Reading, Listening, Battle và các tính năng khác không có giới hạn.",
      },
      {
        q: "Battle 1v1 là gì? Mình đấu với ai?",
        a: "Battle là đấu Reading 1v1 với một bạn cùng rank. Hệ thống chia đôi đề, hai bên có cùng thời gian, ai trả lời đúng nhiều hơn thì thắng. Trận đấu async — bạn không cần online cùng lúc đối thủ, có 2 tiếng để hoàn thành phần của mình. Hệ thống ghép trận trong vài phút khi có người chờ cùng rank.",
      },
      {
        q: "Mình bị mất streak vì kẹt một hôm, có cứu được không?",
        a: "Streak bị mất là mất — Lingona không có streak freeze giả tạo. Nhưng streak chỉ là cách tạo động lực, không phải mục tiêu. Hôm nay bạn quay lại luyện thêm một bài là streak bắt đầu từ 1 lại — không sao cả.",
      },
      {
        q: "Listening có audio Cambridge thật không?",
        a: "Audio của Lingona là audio luyện tập theo đúng format và độ khó của Cambridge IELTS — giọng đọc, tốc độ, chủ đề, kiểu câu hỏi đều bám sát đề thật. Mình không dùng audio gốc Cambridge vì lý do bản quyền. Nếu bạn muốn luyện đúng đề Cambridge sách số, tải sách gốc về và đối chiếu là cách tốt nhất.",
      },
    ],
  },
  {
    id: "pro",
    title: "Pro & Thanh toán",
    intro:
      "Pro tier chính thức mở vào 9/7/2026. Hiện tại bạn dùng được 3 ngày trial miễn phí để thử trước.",
    items: [
      {
        q: "Pro có gì khác Free?",
        a: "Free tier: Speaking AI 1 lần/ngày, Writing AI 1 lần/ngày. Grammar, Reading, Listening, Battle, Streak, Friend Chat — không giới hạn. Pro mở khoá Speaking và Writing AI không giới hạn. Pro tier chính thức mở vào 9/7/2026. Hiện tại bạn dùng được 3 ngày trial miễn phí để thử.",
      },
      {
        q: "Giá Pro chi tiết bao nhiêu?",
        a: "Bốn gói:\n1. 179.000₫ / tháng\n2. 499.000₫ / 3 tháng\n3. 929.000₫ / 6 tháng\n4. 1.490.000₫ / năm — tiết kiệm khoảng 31% so với trả từng tháng\n\nGiá chính thức áp dụng khi Lingona mở Pro tier vào 9/7/2026.",
      },
      {
        q: "Free trial 3 ngày có cần thẻ tín dụng không?",
        a: "Không. Ba ngày trial hoàn toàn miễn phí, không cần nhập thẻ. Khi Pro tier mở chính thức (9/7/2026), bạn quyết định có muốn tiếp tục không — không có auto-charge.",
      },
      {
        q: "Thanh toán bằng phương thức gì?",
        a: "Khi Pro tier mở vào 9/7/2026, Lingona sẽ hỗ trợ MoMo trước tiên. Các phương thức khác (thẻ tín dụng, chuyển khoản ngân hàng) sẽ thêm dần sau.",
      },
    ],
  },
  {
    id: "refund",
    title: "Hoàn tiền",
    intro: "Chính sách hoàn tiền của Lingona — đơn giản, không gài bẫy.",
    items: [
      {
        q: "Chính sách hoàn tiền của Lingona là gì?",
        a: "7 ngày không điều kiện, hoàn 100%, không cần lý do. Áp dụng cho mọi gói Pro khi paid tier mở (9/7/2026). Free tier không áp dụng vì không phát sinh chi phí.",
      },
      {
        q: "Điều kiện cụ thể để được hoàn tiền là gì?",
        a: "Bạn gửi yêu cầu trong vòng 7 ngày kể từ ngày thanh toán, tài khoản không bị tạm ngưng do vi phạm Điều khoản, và không có dấu hiệu lạm dụng chính sách (đăng ký rồi xin hoàn tiền liên tục).",
      },
      {
        q: "Hoàn tiền mất bao lâu?",
        a: "Mình xác nhận tiếp nhận yêu cầu trong 24 giờ làm việc. Sau khi xác minh thông tin, tiền về tài khoản bạn trong 3–5 ngày làm việc, theo đúng phương thức thanh toán ban đầu. Gửi yêu cầu qua baolux0904@gmail.com với mã giao dịch + email tài khoản.\n\n[Xem chi tiết chính sách hoàn tiền →](/legal/refund)",
      },
    ],
  },
  {
    id: "contact",
    title: "Liên hệ",
    intro: "Cách liên hệ với mình khi cần hỗ trợ.",
    items: [
      {
        q: "Mình tìm không thấy câu trả lời ở đây, liên hệ ai?",
        a: "Nhắn cho mình qua email baolux0904@gmail.com hoặc Facebook Messenger (link ở cuối trang này). Mình đọc mọi tin nhắn — trả lời trong 24 đến 48 tiếng. Câu hỏi về hoàn tiền cụ thể thì ghi rõ trong email — kèm mã giao dịch và email tài khoản — để mình xử lý nhanh hơn.",
      },
      {
        q: "Lingona có hỗ trợ qua điện thoại hoặc live chat không?",
        a: "Hiện tại chưa có — Lingona đang là một-người-một-laptop, nên mình chỉ trả lời qua email và Messenger. Khi đội ngũ lớn hơn mình sẽ mở thêm kênh hỗ trợ. Trong lúc này, Messenger là cách phản hồi nhanh nhất.",
      },
    ],
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: categories.flatMap((c) =>
    c.items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.a
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
          .replace(/\s+/g, " ")
          .trim(),
      },
    }))
  ),
};

const MAILTO =
  "mailto:baolux0904@gmail.com?subject=H%E1%BB%97%20tr%E1%BB%A3%20Lingona";
const MESSENGER =
  "https://www.facebook.com/profile.php?id=61586420259772";

export default function HelpPage() {
  return (
    <main className="bg-cream min-h-screen text-navy">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section
        aria-labelledby="help-hero"
        className="max-w-[720px] mx-auto px-6 lg:px-8 pt-12 lg:pt-20 pb-16 lg:pb-24"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-8">
          <div className="flex-1">
            <h1
              id="help-hero"
              className="font-display italic text-[32px] sm:text-[40px] lg:text-[44px] leading-[1.1] tracking-tighter text-navy"
            >
              Bạn đang mắc ở đâu? Mình giúp.
            </h1>
            <p className="mt-6 font-sans text-base lg:text-lg leading-relaxed text-navy/70 max-w-[520px]">
              Tài khoản, các kỹ năng IELTS, Pro, hoàn tiền — tất cả ở đây.
              Không thấy câu trả lời? Nhắn cho mình.
            </p>
          </div>
          <div className="sm:flex-shrink-0 self-start sm:self-center" aria-hidden="true">
            <Mascot size={72} mood="default" priority />
          </div>
        </div>
      </section>

      {/* ── Categories ─────────────────────────────────────────────── */}
      {categories.map((cat) => (
        <section
          key={cat.id}
          aria-labelledby={`cat-${cat.id}`}
          className="max-w-[720px] mx-auto px-6 lg:px-8 py-14 lg:py-20"
        >
          <h2
            id={`cat-${cat.id}`}
            className="font-display italic text-[26px] sm:text-[28px] lg:text-[32px] leading-[1.15] tracking-tighter text-navy"
          >
            {cat.title}
          </h2>
          <p className="mt-3 font-sans text-[15px] lg:text-base text-navy/70 max-w-[600px]">
            {cat.intro}
          </p>

          <ul className="mt-8 space-y-3">
            {cat.items.map((it, idx) => (
              <li key={`${cat.id}-${idx}`}>
                <FaqItem id={`${cat.id}-${idx}`} question={it.q} answer={it.a} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* ── Contact ────────────────────────────────────────────────── */}
      <section
        aria-labelledby="help-contact"
        className="max-w-[720px] mx-auto px-6 lg:px-8 py-24 lg:py-28 text-center"
      >
        <h2
          id="help-contact"
          className="font-display italic text-[26px] sm:text-[28px] lg:text-[32px] leading-[1.15] tracking-tighter text-navy"
        >
          Vẫn không thấy câu trả lời?
        </h2>
        <p className="mt-6 mx-auto max-w-[560px] font-sans text-[17px] lg:text-[18px] leading-[1.7] text-navy/70">
          Nhắn cho mình. Mình đọc mọi tin nhắn — trả lời trong 24 đến 48 tiếng.
          Email cho câu hỏi dài, Messenger cho câu hỏi nhanh.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={MAILTO}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-teal text-cream font-semibold text-base shadow-colored hover:bg-teal-light transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            Gửi email cho Lingona
          </a>
          <a
            href={MESSENGER}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-navy/30 text-navy font-semibold text-base hover:border-teal hover:text-teal transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            Nhắn Messenger
          </a>
        </div>

        <div className="mt-16 flex justify-center" aria-hidden="true">
          <Mascot size={96} mood="happy" />
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
            href="/about"
            className="hover:text-teal transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 rounded"
          >
            Về Lingona
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
