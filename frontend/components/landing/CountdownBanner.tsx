"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const DEADLINE = new Date("2026-07-09T00:00:00");

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

export default function CountdownBanner() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 91, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = DEADLINE.getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const boxes = [
    { value: timeLeft.days, label: "Ng\u00e0y" },
    { value: timeLeft.hours, label: "Gi\u1edd" },
    { value: timeLeft.minutes, label: "Ph\u00fat" },
    { value: timeLeft.seconds, label: "Gi\u00e2y" },
  ];

  return (
    <div
      style={{ background: "linear-gradient(135deg, #00A896, #007A6E)" }}
      className="w-full px-6 py-5 md:px-16"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left */}
        <div className="text-center md:text-left">
          <p className="text-white/80 text-sm uppercase tracking-wider mb-1">
            {"\u01AF\u01B0 \u0111\u00e3i ra m\u1eaft \u0111\u1eb7c bi\u1ec7t"}
          </p>
          <p className="text-white font-bold text-lg md:text-xl mb-3">
            Speaking &amp; Writing AI{" "}
            <span className="underline">{`mi\u1ec5n ph\u00ed ho\u00e0n to\u00e0n`}</span>{" "}
            trong
          </p>
          <a
            href="/register"
            className="inline-block bg-white text-[#007A6E] font-semibold px-5 py-2 rounded-full text-sm hover:scale-105 transition-transform cursor-pointer"
          >
            {"T\u1ea1o t\u00e0i kho\u1ea3n mi\u1ec5n ph\u00ed \u2192"}
          </a>
        </div>

        {/* Right — countdown */}
        <div className="flex gap-3">
          {boxes.map(({ value, label }) => (
            <div
              key={label}
              className="flex flex-col items-center bg-black/20 rounded-xl px-3 py-3 min-w-[60px]"
            >
              <motion.span
                key={value}
                animate={{ opacity: [0, 1], y: [-8, 0] }}
                transition={{ duration: 0.2 }}
                className="text-white font-bold text-3xl leading-none"
              >
                {String(value).padStart(2, "0")}
              </motion.span>
              <span className="text-white/70 text-xs uppercase mt-1">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
