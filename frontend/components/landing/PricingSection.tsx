"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const FREE_FEATURES = [
  "Speaking AI (3 lần/ngày)",
  "Writing AI (1 lần/ngày)",
  "Grammar Journey đầy đủ",
  "Reading & Listening không giới hạn",
  "Streak, XP, Leaderboard đầy đủ",
  "IELTS Battle & Rank đầy đủ",
  "Streak Shield (1 lần/tuần)",
];

const PRO_FEATURES = [
  "Tất cả tính năng Free",
  "Speaking AI không giới hạn",
  "Writing AI không giới hạn",
  "IELTS Full Mock Test không giới hạn",
  "Band score prediction + phân tích điểm yếu",
  "Lộ trình học cá nhân AI adaptive",
  "Study Rooms + AI Group Coach",
  "Streak Shield (3 lần/tuần)",
  "Priority support + early access",
];

export default function PricingSection() {
  const [yearly, setYearly] = useState(true);

  return (
    <section id="pricing" className="relative py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-white">
            Đơn giản, minh bạch
          </h2>
          <p className="mt-4 text-gray-400 text-base">
            Bắt đầu miễn phí. Nâng cấp khi bạn sẵn sàng.
          </p>

          {/* Toggle monthly / yearly */}
          <div className="mt-8 inline-flex items-center gap-3 bg-white/[0.04] rounded-full p-1 border border-white/[0.06]">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                !yearly
                  ? "bg-white/[0.1] text-white"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Hàng tháng
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                yearly
                  ? "bg-white/[0.1] text-white"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Hàng năm
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-[#00A896] to-[#00C9B1] text-white">
                -44%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* FREE */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="relative rounded-xl p-8 bg-[#0F1429]/60 border border-[#1B2B4B]"
          >
            <h3 className="text-lg font-semibold text-white">Free</h3>
            <div className="mt-4 mb-1">
              <span className="text-3xl font-bold text-white font-playfair">
                Miễn phí
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-6">Mãi mãi</p>

            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                  <svg className="w-4 h-4 mt-0.5 text-[#00A896] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="block w-full text-center py-3 rounded-md font-medium text-sm transition-all duration-200 cursor-pointer border border-white/[0.1] text-gray-300 hover:bg-white/[0.04] hover:border-white/[0.15]"
            >
              Bắt đầu miễn phí
            </Link>
          </motion.div>

          {/* PRO */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="relative rounded-xl p-8 bg-gradient-to-b from-[#00A896]/[0.08] to-[#0F1429]/60 border-2 border-[#00A896]/30 shadow-[0_0_40px_rgba(0,168,150,0.08)]"
          >
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#00A896] to-[#00C9B1] text-white">
              Phổ biến
            </span>

            <h3 className="text-lg font-semibold text-white">Pro</h3>
            <div className="mt-4 mb-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white font-playfair">
                {yearly ? "999.000đ" : "149.000đ"}
              </span>
              <span className="text-sm text-gray-400">
                {yearly ? "/năm" : "/tháng"}
              </span>
            </div>
            {yearly && (
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xs text-[#00A896] font-semibold px-2 py-0.5 rounded-full bg-[#00A896]/10 border border-[#00A896]/20">
                  Tiết kiệm 44%
                </span>
                <span className="text-xs text-gray-500 line-through">1.788.000đ</span>
              </div>
            )}
            {!yearly && <div className="mb-6" />}

            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                  <svg className="w-4 h-4 mt-0.5 text-[#00A896] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="block w-full text-center py-3 rounded-md font-medium text-sm transition-all duration-200 cursor-pointer bg-gradient-to-r from-[#00A896] to-[#00C9B1] text-white hover:opacity-90 shadow-[0_0_20px_rgba(0,168,150,0.2)]"
            >
              Sắp ra mắt — Thông báo tôi
            </Link>
          </motion.div>
        </div>

        {/* Notes */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-gray-400">
            Sinh viên giảm 20% — nhập mã <span className="text-[#00A896] font-medium">.edu</span> khi thanh toán
          </p>
          <p className="text-sm text-gray-500">
            Dùng thử 3 ngày miễn phí &bull; Không cần thẻ tín dụng
          </p>
        </div>
      </div>
    </section>
  );
}
