"use client";

import { IconMic } from "./Icons";

interface StartSpeakingCardProps {
  onStart: () => void;
}

export default function StartSpeakingCard({ onStart }: StartSpeakingCardProps) {
  return (
    <div
      className="relative rounded-2xl p-7 flex flex-col items-center text-center gap-5 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, var(--color-primary) 0%, #5B3FBF 50%, #3B2D8F 100%)",
        minHeight: "270px",
      }}
    >
      {/* Subtle glow circle */}
      <div
        className="absolute top-[-40px] right-[-40px] w-[200px] h-[200px] rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, var(--color-accent), transparent)" }}
      />
      <div
        className="absolute bottom-[-30px] left-[-30px] w-[120px] h-[120px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #fff, transparent)" }}
      />

      {/* Lingona Logo Mark */}
      <div className="relative z-10 mt-2">
        <div
          className="w-20 h-20 rounded-[22px] flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Soundwave-inspired logo mark */}
            <rect x="6" y="16" width="4" height="12" rx="2" fill="white" opacity="0.7"/>
            <rect x="13" y="10" width="4" height="24" rx="2" fill="white" opacity="0.85"/>
            <rect x="20" y="6" width="4" height="32" rx="2" fill="white"/>
            <rect x="27" y="10" width="4" height="24" rx="2" fill="white" opacity="0.85"/>
            <rect x="34" y="16" width="4" height="12" rx="2" fill="white" opacity="0.7"/>
          </svg>
        </div>
      </div>

      {/* Text */}
      <div className="relative z-10">
        <h2 className="font-sora font-bold text-[22px] text-white leading-tight">
          Ready to speak?
        </h2>
        <p className="text-white/60 text-[15px] mt-1.5">
          Practice English with your AI coach
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={onStart}
        className="relative z-10 flex items-center gap-2.5 px-8 py-3.5 rounded-full font-sora font-semibold text-[15px] transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
        style={{
          backgroundColor: "white",
          color: "var(--color-primary)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}
      >
        <IconMic size={18} />
        Start Speaking
      </button>
    </div>
  );
}
