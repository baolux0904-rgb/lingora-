"use client";

import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    name: "Nguyễn Minh Anh",
    avatar: "MA",
    avatarBg: "bg-gradient-to-br from-teal-400 to-emerald-500",
    role: "Sinh viên ĐH Ngoại Thương",
    quote: "Mình đã tăng từ 5.5 lên 7.0 Speaking chỉ sau 2 tháng luyện với Lingona. AI coach giúp mình tự tin hơn rất nhiều khi nói tiếng Anh.",
    band: "7.0",
  },
  {
    name: "Trần Đức Huy",
    avatar: "DH",
    avatarBg: "bg-gradient-to-br from-blue-400 to-indigo-500",
    role: "Kỹ sư phần mềm",
    quote: "Grammar Journey giúp mình hệ thống lại toàn bộ ngữ pháp. Cách gamification khiến mình muốn học mỗi ngày, không bỏ cuộc.",
    band: "7.5",
  },
  {
    name: "Lê Thị Phương",
    avatar: "TP",
    avatarBg: "bg-gradient-to-br from-purple-400 to-pink-500",
    role: "Giáo viên tiếng Anh",
    quote: "Mình giới thiệu Lingona cho tất cả học sinh. Phản hồi AI rất chính xác, phân tích từng phoneme giúp các em sửa phát âm hiệu quả.",
    band: "8.0",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-24 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-white">
            Học viên nói gì về Lingona
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-xl border border-white/[0.06] bg-[#0F1429]/60 p-6"
            >
              {/* Quote */}
              <div className="mb-6">
                <svg className="w-8 h-8 text-[#00A896]/30 mb-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609L9.995 5.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
                </svg>
                <p className="text-sm text-gray-300 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${t.avatarBg} flex items-center justify-center text-xs font-semibold text-white flex-shrink-0`}
                >
                  {t.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{t.name}</p>
                  <p className="text-xs text-gray-400 truncate">{t.role}</p>
                </div>
                <div className="flex-shrink-0 px-2.5 py-1 rounded-md bg-[#00A896]/10 border border-[#00A896]/20">
                  <span className="text-xs font-semibold text-[#00A896]">Band {t.band}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
