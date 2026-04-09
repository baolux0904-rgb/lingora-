"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const STATS = [
  { value: 7.0, label: "Band trung bình đạt được", suffix: "+", isDecimal: true },
  { value: 50000, label: "Bài tập hoàn thành", suffix: "+", isDecimal: false },
  { value: 10000, label: "Học viên active", suffix: "+", isDecimal: false },
  { value: 6.8, label: "Điểm Speaking trung bình", suffix: "", isDecimal: true },
];

function CountUp({ target, duration = 2, isDecimal = false }: { target: number; duration?: number; isDecimal?: boolean }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  const display = isDecimal ? value.toFixed(1) : Math.floor(value).toLocaleString("vi-VN");
  return <span ref={ref}>{display}</span>;
}

export default function SocialProofBar() {
  return (
    <section className="relative py-16 border-y border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl sm:text-4xl font-bold text-white font-playfair">
                <CountUp target={stat.value} isDecimal={stat.isDecimal} />
                {stat.suffix}
              </p>
              <p className="mt-2 text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
