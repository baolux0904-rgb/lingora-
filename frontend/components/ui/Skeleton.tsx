"use client";

/**
 * Skeleton — Lingona Design System
 * Animated placeholder for loading states.
 *
 * Usage:
 *   <Skeleton className="h-4 w-32" />
 *   <Skeleton.Card />
 *   <Skeleton.List count={3} />
 *   <Skeleton.Text lines={3} />
 *   <Skeleton.RankCard />
 *   <Skeleton.PassageScreen />
 */

import React from "react";

// ---------------------------------------------------------------------------
// Base skeleton
// ---------------------------------------------------------------------------

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

const roundedMap = { sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg", xl: "rounded-xl", full: "rounded-full" };

function SkeletonBase({ width = "100%", height = 16, rounded = "md", className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse ${roundedMap[rounded]} ${className}`}
      style={{ width, height, background: "var(--color-border)" }}
    />
  );
}

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase key={i} height={14} width={i === lines - 1 ? "75%" : "100%"} />
      ))}
    </div>
  );
}

function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg p-4 flex flex-col gap-3 ${className}`}
      style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}>
      <div className="flex items-center gap-3">
        <SkeletonBase width={40} height={40} rounded="full" />
        <div className="flex-1 flex flex-col gap-2">
          <SkeletonBase width="60%" height={14} />
          <SkeletonBase width="40%" height={12} />
        </div>
      </div>
      <SkeletonBase width="100%" height={12} />
      <SkeletonBase width="80%" height={12} />
    </div>
  );
}

function SkeletonList({ count = 3, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

function SkeletonRankCard() {
  return (
    <div className="rounded-xl p-5 flex flex-col items-center gap-3"
      style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <SkeletonBase width={48} height={48} rounded="full" />
      <SkeletonBase width={80} height={24} rounded="lg" />
      <SkeletonBase width={120} height={14} />
      <div className="flex gap-6 mt-1">
        <SkeletonBase width={40} height={14} />
        <SkeletonBase width={40} height={14} />
        <SkeletonBase width={40} height={14} />
      </div>
    </div>
  );
}

function SkeletonLeaderboard() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg"
          style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}>
          <SkeletonBase width={24} height={14} />
          <SkeletonBase width={32} height={32} rounded="full" />
          <div className="flex-1 flex flex-col gap-1.5">
            <SkeletonBase width="50%" height={14} />
            <SkeletonBase width="30%" height={10} />
          </div>
          <SkeletonBase width={48} height={16} />
        </div>
      ))}
    </div>
  );
}

function SkeletonProfile() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <SkeletonBase width={80} height={80} rounded="full" />
        <div className="flex-1 flex flex-col gap-2">
          <SkeletonBase width="40%" height={18} />
          <SkeletonBase width="60%" height={14} />
        </div>
      </div>
      <SkeletonCard />
      <SkeletonCard />
      <div className="rounded-lg p-4 flex flex-col gap-2" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}>
        <SkeletonBase width="30%" height={12} />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => <SkeletonBase key={i} height={32} rounded="lg" />)}
        </div>
      </div>
    </div>
  );
}

function SkeletonExamCards() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg p-5 flex items-start gap-4"
          style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderLeft: "4px solid var(--color-border)" }}>
          <SkeletonBase width={56} height={56} rounded="lg" />
          <div className="flex-1 flex flex-col gap-2">
            <SkeletonBase width="50%" height={16} />
            <SkeletonBase width="80%" height={12} />
            <div className="flex gap-2 mt-1">
              <SkeletonBase width={60} height={20} rounded="full" />
              <SkeletonBase width={60} height={20} rounded="full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonPassageScreen() {
  return (
    <div className="flex-1 flex" style={{ background: "var(--color-bg)" }}>
      <div className="flex-1 p-5">
        <SkeletonBase width="60%" height={20} className="mb-4" />
        <SkeletonText lines={8} />
      </div>
      <div className="hidden md:block w-[45%] p-5" style={{ borderLeft: "1px solid var(--color-border)" }}>
        <SkeletonBase width="40%" height={16} className="mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-4 p-3 rounded-lg" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}>
            <SkeletonBase width="80%" height={14} className="mb-3" />
            <div className="flex flex-col gap-2">
              <SkeletonBase height={36} rounded="lg" />
              <SkeletonBase height={36} rounded="lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonDashboard() {
  return (
    <div className="flex flex-col gap-8">
      {/* StartSpeakingCard placeholder */}
      <div className="rounded-xl p-5" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}>
        <SkeletonBase width="50%" height={20} className="mb-2" />
        <SkeletonBase width="70%" height={14} className="mb-4" />
        <SkeletonBase width={140} height={40} rounded="xl" />
      </div>
      {/* BandProgress placeholder */}
      <SkeletonRankCard />
      {/* Scenarios */}
      <div className="flex flex-col gap-3">
        <SkeletonBase width={100} height={12} className="mb-1" />
        {[1, 2].map((i) => (
          <div key={i} className="rounded-lg p-4 flex gap-3" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}>
            <SkeletonBase width={48} height={48} rounded="lg" />
            <div className="flex-1 flex flex-col gap-2">
              <SkeletonBase width="60%" height={14} />
              <SkeletonBase width="40%" height={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

const Skeleton = Object.assign(SkeletonBase, {
  Text: SkeletonText,
  Card: SkeletonCard,
  List: SkeletonList,
  RankCard: SkeletonRankCard,
  Leaderboard: SkeletonLeaderboard,
  Profile: SkeletonProfile,
  ExamCards: SkeletonExamCards,
  PassageScreen: SkeletonPassageScreen,
  Dashboard: SkeletonDashboard,
});

export default Skeleton;
