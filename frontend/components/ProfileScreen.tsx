"use client";

/**
 * ProfileScreen.tsx — Full profile redesign with stats grid, band progression,
 * achievements, edit modal, and share card.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Flame,
  Zap,
  Swords,
  BarChart3,
  Mic,
  PenLine,
  Users,
  Target,
  MapPin,
  Award,
  type LucideIcon,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Mascot from "@/components/ui/Mascot";
import Skeleton from "@/components/ui/Skeleton";
import RankChip from "@/components/Profile/RankChip";
import { useAuthStore } from "@/lib/stores/authStore";
import { logoutUser, getProfileStats, updateProfile, uploadAvatar, updateProfileVisibility, changeUsername } from "@/lib/api";
import { formatJoinMonth } from "@/lib/utils/time";
import type { SpeakingMetricsData, GamificationData, ProfileStats, ProfileVisibility } from "@/lib/types";

const ShareCardModal = dynamic(() => import("./Social/ShareCardModal"), { ssr: false });
const AchievementsSection = dynamic(() => import("./AchievementsSection"), { ssr: false });
const DeleteAccountModal = dynamic(() => import("./Profile/DeleteAccountModal"), { ssr: false });
const ChangeEmailModal   = dynamic(() => import("./Profile/ChangeEmailModal"),   { ssr: false });

interface ProfileScreenProps {
  userId: string | null;
  metrics: SpeakingMetricsData | null;
  metricsLoading: boolean;
  gamification: GamificationData | null;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  Icon,
  value,
  label,
}: {
  Icon: LucideIcon;
  value: string | number;
  label: string;
}) {
  return (
    <div
      className="rounded-2xl p-3.5 sm:p-4 flex flex-col items-center gap-1.5 min-w-[90px] transition-all hover:scale-[1.02]"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Icon
        className="w-5 h-5"
        strokeWidth={2}
        style={{ color: "var(--color-text-tertiary)" }}
        aria-hidden="true"
      />
      <span
        className="font-display italic text-[26px] sm:text-[30px] leading-tight tabular-nums"
        style={{ color: "var(--color-text)" }}
      >
        {value}
      </span>
      <span
        className="text-[11px] sm:text-[12px] uppercase tracking-wider font-medium"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {label}
      </span>
    </div>
  );
}

/** Slot in the 8-grid for HẠNG — wraps RankChip so it visually pairs with siblings. */
function RankSlot({ tier }: { tier: string | null | undefined }) {
  return (
    <div
      className="rounded-2xl p-3.5 sm:p-4 flex flex-col items-center gap-1.5 min-w-[90px] transition-all hover:scale-[1.02]"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="h-5 flex items-center" aria-hidden="true">
        <RankChip tier={tier} />
      </div>
      <span className="font-display italic text-[15px] sm:text-[16px] mt-1" style={{ color: "var(--color-text-tertiary)" }}>
        &nbsp;
      </span>
      <span
        className="text-[11px] sm:text-[12px] uppercase tracking-wider font-medium"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        HẠNG
      </span>
    </div>
  );
}

/**
 * Split a username like "duybaonguyen3009_37x4pe" into
 * { prefix: "duybaonguyen3009", suffix: "_37x4pe" } when it matches the
 * auto-generated pattern (lowercase + underscore + 4-6 alnum). For
 * user-chosen handles (no suffix match) returns prefix only.
 */
function splitHandle(username: string): { prefix: string; suffix: string } {
  if (/^[a-z0-9_]+_[a-z0-9]{4,6}$/.test(username)) {
    const i = username.lastIndexOf("_");
    return { prefix: username.slice(0, i), suffix: username.slice(i) };
  }
  return { prefix: username, suffix: "" };
}

/**
 * UsernameSection — username-change mini-form (Wave 2.11).
 *
 * Lives inside <EditProfileModal> but is a standalone widget because
 * username change has different semantics from the rest of the profile
 * edits: it has a 30-day cooldown gate, a 7-day redirect grace, and
 * is rejected by a server-side reserved list. Bundling it into the
 * modal's bulk "Save" button would silently ignore the gate failures.
 *
 * Surface: read-only display of the current username + an inline
 * "Đổi" toggle that reveals an input + submit. Server-side errors
 * (cooldown, reserved, collision, rate limit) surface verbatim per
 * the secure-code-guardian generic-error contract.
 */
function UsernameSection({ currentUsername, onChanged }: { currentUsername: string | null; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(currentUsername ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Client-side mirror of the BE validator. Pure UX hint — server is
  // still the authority. Matches usernameValidation.js: 3-30 chars,
  // [a-zA-Z0-9_], leading-digit allowed, no underscore-position rules.
  const trimmed = draft.trim();
  const localValid =
    trimmed.length >= 3 && trimmed.length <= 30 && /^[a-zA-Z0-9_]+$/.test(trimmed);
  const unchanged = currentUsername != null && trimmed.toLowerCase() === currentUsername.toLowerCase();

  const handleSubmit = async () => {
    if (!localValid || unchanged || submitting) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await changeUsername(trimmed);
      setSuccess(`Đã đổi sang @${result.username}.${result.redirect_expires_at ? " URL cũ vẫn redirect 7 ngày." : ""}`);
      setEditing(false);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đổi username.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!editing) {
    return (
      <div
        className="flex items-center justify-between rounded-lg px-3 py-2.5"
        style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}
      >
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>Username</span>
          <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            {currentUsername ? `@${currentUsername}` : "Chưa đặt"}
          </span>
          {success && (
            <span className="text-xs mt-0.5" style={{ color: "#22C55E" }}>{success}</span>
          )}
        </div>
        <button
          onClick={() => { setEditing(true); setSuccess(null); setError(null); }}
          className="text-xs font-semibold px-3 py-1.5 rounded-md"
          style={{ background: "transparent", color: "#00A896", border: "1px solid rgba(0,168,150,0.3)" }}
        >
          {currentUsername ? "Đổi" : "Đặt"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg px-3 py-2.5"
      style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
      <span className="text-xs uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>Username mới</span>
      <input
        value={draft}
        onChange={(e) => { setDraft(e.target.value); setError(null); }}
        placeholder="username"
        maxLength={30}
        autoComplete="off"
        spellCheck={false}
        className="rounded-md px-2.5 py-2 text-sm"
        style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
      />
      <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
        URL profile: lingona.app/u/<strong style={{ color: "var(--color-text)" }}>{trimmed || "..."}</strong> · 30 ngày mới đổi được lần kế.
      </p>
      {error && <p className="text-xs" style={{ color: "#EF4444" }}>{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => { setEditing(false); setDraft(currentUsername ?? ""); setError(null); }}
          disabled={submitting}
          className="flex-1 py-2 rounded-md text-xs font-medium disabled:opacity-50"
          style={{ background: "transparent", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}
        >
          Hủy
        </button>
        <button
          onClick={handleSubmit}
          disabled={!localValid || unchanged || submitting}
          className="flex-1 py-2 rounded-md text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: localValid && !unchanged && !submitting ? "#00A896" : "rgba(0,168,150,0.3)", color: "#fff" }}
        >
          {submitting ? "Đang đổi..." : "Xác nhận"}
        </button>
      </div>
    </div>
  );
}

function EditProfileModal({ stats, onClose, onSaved }: { stats: ProfileStats; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(stats.user.name || "");
  const [bio, setBio] = useState(stats.user.bio || "");
  const [location, setLocation] = useState(stats.user.location || "");
  const [targetBand, setTargetBand] = useState(stats.user.target_band?.toString() || "6.5");
  const [visibility, setVisibility] = useState<ProfileVisibility>(stats.user.profile_visibility ?? "friends");
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const patchUser = useAuthStore((s) => s.patchUser);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upload avatar first — capture the new URL so auth store + profile stay in sync.
      let newAvatarUrl: string | undefined;
      if (avatarPreview) {
        const res = await uploadAvatar(avatarPreview);
        newAvatarUrl = res.avatar_url;
      }

      await updateProfile({ name: name.trim(), bio: bio.trim(), location: location.trim(), target_band: Number(targetBand) });

      // Persist visibility separately — it lives on its own endpoint so
      // a future refactor (e.g. moving privacy into a dedicated Settings
      // page) doesn't have to touch updateProfile.
      if (visibility !== stats.user.profile_visibility) {
        try { await updateProfileVisibility(visibility); } catch { /* silent — keep UX */ }
      }

      // Patch the auth store so Topbar, Sidebar, etc. show the new avatar immediately
      // without waiting for a full page refresh / token refresh cycle.
      patchUser({
        name: name.trim(),
        ...(newAvatarUrl ? { avatar_url: newAvatarUrl } : {}),
      });

      onSaved();
      onClose();
    } catch { /* silent */ }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-sheet flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
        style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold" style={{ color: "var(--color-text)" }}>Sửa hồ sơ</h3>
          <button onClick={onClose} className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>✕</button>
        </div>

        {/* Avatar */}
        <div className="flex justify-center">
          <button onClick={() => fileRef.current?.click()} className="relative group">
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center font-bold text-xl"
              style={{ background: "linear-gradient(135deg, var(--color-avatar-from), var(--color-avatar-to))", border: "3px solid var(--color-avatar-ring)", color: "#fff" }}>
              {avatarPreview || stats.user.avatar_url
                ? <img src={avatarPreview || stats.user.avatar_url!} alt="" className="w-full h-full object-cover" />
                : stats.user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white font-medium">Edit</div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" maxLength={50}
          className="rounded-lg px-3 py-2.5 text-sm" style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)", color: "var(--color-text)" }} />

        {/* Username change (Wave 2.11) — separate mini-form with its own cooldown gate */}
        <UsernameSection currentUsername={stats.user.username} onChanged={onSaved} />

        <div className="relative">
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio (optional)" maxLength={100} rows={2}
            className="w-full rounded-lg px-3 py-2.5 text-sm resize-none" style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)", color: "var(--color-text)" }} />
          <span className="absolute bottom-2 right-3 text-xs" style={{ color: "var(--color-text-tertiary)" }}>{bio.length}/100</span>
        </div>

        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (optional)"
          className="rounded-lg px-3 py-2.5 text-sm" style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)", color: "var(--color-text)" }} />

        <select value={targetBand} onChange={(e) => setTargetBand(e.target.value)}
          className="rounded-lg px-3 py-2.5 text-sm" style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}>
          {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0].map(b => <option key={b} value={b}>Target: Band {b.toFixed(1)}</option>)}
        </select>

        {/* Privacy (Wave 2.8) */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
            Riêng tư
          </div>
          {([
            { v: "public",  title: "Công khai", desc: "Ai cũng xem được profile" },
            { v: "friends", title: "Bạn bè",    desc: "Chỉ bạn bè xem được band, vị trí" },
            { v: "private", title: "Riêng tư",  desc: "Không ai xem được profile (chỉ tôi)" },
          ] as const).map((opt) => (
            <label key={opt.v}
              className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all"
              style={{
                background: visibility === opt.v ? "rgba(0,168,150,0.08)" : "var(--color-bg-secondary)",
                border: `1px solid ${visibility === opt.v ? "rgba(0,168,150,0.4)" : "var(--color-border)"}`,
              }}>
              <input
                type="radio"
                name="profile-visibility"
                value={opt.v}
                checked={visibility === opt.v}
                onChange={() => setVisibility(opt.v)}
                className="mt-1 cursor-pointer"
              />
              <div className="flex-1">
                <div className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{opt.title}</div>
                <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{opt.desc}</div>
              </div>
            </label>
          ))}
          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            ℹ Một số thông tin (bio, vị trí, band) luôn chỉ hiển thị với bạn bè, kể cả khi profile công khai.
          </p>
        </div>

        <div className="flex gap-2 mt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ background: "var(--color-bg-secondary)", color: "var(--color-text-secondary)" }}>Hủy</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50" style={{ background: "#00A896", color: "#fff" }}>
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ProfileScreen
// ---------------------------------------------------------------------------

export default function ProfileScreen({ userId, metrics, metricsLoading, gamification }: ProfileScreenProps) {
  const user = useAuthStore((s) => s.user);
  const isGuest = !user;
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadStats = useCallback(async () => {
    if (!user) return;
    setStatsLoading(true);
    setStatsError(false);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const result = await getProfileStats();
      clearTimeout(timeout);
      setStats(result);
    } catch {
      setStatsError(true);
    }
    setStatsLoading(false);
  }, [user]);

  useEffect(() => { loadStats(); }, [loadStats]);

  async function handleLogout() {
    setLoggingOut(true);
    await logoutUser();
    router.push("/login");
  }

  const handleCopyLink = () => {
    const username = stats?.user.username;
    if (!username) return;
    navigator.clipboard.writeText(`https://lingona.app/u/${username}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  // ---------------------------------------------------------------------------
  // Loading / Guest states
  // ---------------------------------------------------------------------------

  if (isGuest) {
    return (
      <div className="flex flex-col items-center gap-5 py-8">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: "linear-gradient(135deg, #1B2B4B, #2D4A7A)", color: "#fff", border: "3px solid #00A896" }}>K</div>
        <h2 className="text-lg font-display italic" style={{ color: "var(--color-text)" }}>Người học khách</h2>
        <Card padding="lg" className="text-center w-full" style={{ background: "rgba(0,168,150,0.06)", border: "1px solid rgba(0,168,150,0.15)" }}>
          <p className="text-base font-medium mb-1" style={{ color: "var(--color-text)" }}>Tạo tài khoản để lưu tiến độ</p>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Điểm, streak, và huy hiệu của bạn sẽ được lưu trên mọi thiết bị</p>
        </Card>
      </div>
    );
  }

  if (statsLoading) {
    return <Skeleton.Profile />;
  }

  if (statsError || !stats) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <Mascot size={80} mood="thinking" />
        <h3 className="text-base font-display italic" style={{ color: "var(--color-text)" }}>
          Không tải được hồ sơ
        </h3>
        <p className="text-sm text-center max-w-xs" style={{ color: "var(--color-text-secondary)" }}>
          Có lỗi xảy ra khi tải dữ liệu. Kiểm tra kết nối và thử lại.
        </p>
        <button
          onClick={loadStats}
          className="px-6 py-2.5 rounded-full text-sm font-semibold transition-colors duration-fast hover:bg-teal-light focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-card)]"
          style={{ background: "#00A896", color: "#fff" }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  const { user: u, gamification: g, battle, speaking, writing, social, leaderboard: lb } = stats;
  const initials = u.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const joinDate = formatJoinMonth(u.joined_at);
  const handle = u.username ? splitHandle(u.username) : null;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-5">
      {/* SECTION 1: Profile Header */}
      <header className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden flex items-center justify-center font-display italic text-3xl text-white shrink-0"
          style={{
            background: "linear-gradient(135deg, #1B2B4B, #2D4A7A)",
            border: "3px solid #00A896",
            boxShadow: "0 4px 16px rgba(27,43,75,0.3)",
          }}
        >
          {u.avatar_url ? (
            <img src={u.avatar_url} alt={u.name} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>

        <div className="flex-1 text-center sm:text-left min-w-0">
          <h1
            className="font-display italic text-[28px] sm:text-[34px] leading-tight"
            style={{ color: "var(--color-text)" }}
          >
            {u.name}
          </h1>

          {handle && (
            <p className="text-[14px] sm:text-[15px] font-medium mt-1 break-all">
              <span style={{ color: "#00A896" }}>@{handle.prefix}</span>
              {handle.suffix && (
                <span style={{ color: "var(--color-text-tertiary)" }}>{handle.suffix}</span>
              )}
            </p>
          )}

          <div
            className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 mt-3 text-[13px] sm:text-[14px]"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {u.estimated_band && (
              <span className="inline-flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                Band {u.estimated_band.toFixed(1)}
              </span>
            )}
            {u.target_band && (
              <span className="inline-flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                Mục tiêu {u.target_band.toFixed(1)}
              </span>
            )}
            {u.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                {u.location}
              </span>
            )}
            {joinDate && <span>Tham gia {joinDate}</span>}
          </div>

          {lb.percentile <= 25 && (
            <div
              className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: "rgba(0,168,150,0.12)", color: "#00A896" }}
            >
              <Award className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
              Top {lb.percentile}% Việt Nam
            </div>
          )}

          {u.bio && (
            <p
              className="text-[14px] sm:text-[15px] italic mt-3 max-w-[480px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {u.bio}
            </p>
          )}

          {/* Action buttons — pure typography, no decoration */}
          <div className="flex flex-wrap gap-2 mt-5 justify-center sm:justify-start">
            <button
              onClick={() => setShowEdit(true)}
              className="px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] hover:bg-teal-light"
              style={{ background: "#00A896", color: "#fff" }}
            >
              Sửa hồ sơ
            </button>
            {u.username && (
              <button
                onClick={handleCopyLink}
                className="px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] hover:bg-[rgba(27,43,75,0.05)]"
                style={{
                  background: "transparent",
                  color: copied ? "#00A896" : "var(--color-text)",
                  border: `1px solid ${copied ? "rgba(0,168,150,0.4)" : "rgba(27,43,75,0.2)"}`,
                }}
              >
                {copied ? "Đã sao chép" : "Sao chép link"}
              </button>
            )}
            <button
              onClick={() => setShowShareCard(true)}
              className="px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] hover:bg-[rgba(27,43,75,0.05)]"
              style={{
                background: "transparent",
                color: "var(--color-text)",
                border: "1px solid rgba(27,43,75,0.2)",
              }}
            >
              Chia sẻ
            </button>
          </div>
        </div>
      </header>

      {/* SECTION 2: Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard Icon={Flame} value={g.currentStreak} label="STREAK" />
        <StatCard Icon={Zap} value={g.totalXp.toLocaleString()} label="XP" />
        <RankSlot tier={battle.rank_tier} />
        <StatCard Icon={Swords} value={battle.wins} label="THẮNG" />
        <StatCard Icon={BarChart3} value={g.level} label="LEVEL" />
        <StatCard Icon={Mic} value={speaking.totalSessions} label="SPEAKING" />
        <StatCard Icon={PenLine} value={writing.totalSubmissions} label="WRITING" />
        <StatCard Icon={Users} value={social.friendCount} label="BẠN BÈ" />
      </div>

      {/* SECTION 3: Band Progression */}
      {u.estimated_band && u.target_band && (
        <Card padding="md">
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-secondary)" }}>Band Journey</div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-lg font-bold" style={{ color: "#8B71EA" }}>{u.estimated_band.toFixed(1)}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
              <div className="h-full rounded-full" style={{
                width: `${Math.min(((u.estimated_band - 4) / (u.target_band - 4)) * 100, 100)}%`,
                background: "linear-gradient(90deg, #8B71EA, #2DD4BF)", transition: "width 600ms ease-out",
              }} />
            </div>
            <span className="text-lg font-bold" style={{ color: "#2DD4BF" }}>{u.target_band.toFixed(1)}</span>
          </div>
          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            +{(u.target_band - u.estimated_band).toFixed(1)} bands to reach your goal
          </p>
        </Card>
      )}

      {/* SECTION 4: Achievements (full system) */}
      <AchievementsSection />

      {/* SECTION 5: Leaderboard removed Sprint 5K execute (root /leaderboard page deleted; Battle subsystem covers ranking). */}

      {/* Email change (Wave 2.10) — placed above Log out for natural account-settings ordering */}
      <button
        onClick={() => setShowEmailChange(true)}
        className="w-full py-3 rounded-full text-sm font-semibold transition-colors duration-150"
        style={{ background: "transparent", color: "var(--color-text-tertiary)", border: "1px solid var(--color-border)" }}>
        Đổi email tài khoản
      </button>

      {/* Logout */}
      <button onClick={handleLogout} disabled={loggingOut}
        className="w-full py-3 rounded-full text-sm font-semibold transition-colors duration-150"
        style={{ background: "transparent", color: "var(--color-text-tertiary)", border: "1px solid var(--color-border)", opacity: loggingOut ? 0.6 : 1 }}>
        {loggingOut ? "Logging out..." : "Log out"}
      </button>

      {/* Danger zone (Wave 2.7 — PDPL VN) */}
      <div className="rounded-lg p-4" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)" }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#EF4444" }}>
          Vùng nguy hiểm
        </div>
        <p className="text-xs mb-3" style={{ color: "var(--color-text-secondary)" }}>
          Xóa tài khoản sẽ xóa vĩnh viễn dữ liệu cá nhân. Hành động không thể hoàn tác.
        </p>
        <button
          onClick={() => setShowDelete(true)}
          className="text-xs font-semibold py-2 px-3 rounded-lg transition-all active:scale-[0.98]"
          style={{ background: "transparent", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)" }}
        >
          Xóa tài khoản
        </button>
      </div>

      {/* Modals */}
      {showEdit && stats && <EditProfileModal stats={stats} onClose={() => setShowEdit(false)} onSaved={loadStats} />}
      <ShareCardModal isOpen={showShareCard} onClose={() => setShowShareCard(false)} />
      <ChangeEmailModal
        isOpen={showEmailChange}
        currentEmail={user?.email ?? null}
        onClose={() => setShowEmailChange(false)}
        onChanged={async () => {
          // Refresh + access tokens are dead server-side. Best-effort
          // logout to clear local Zustand, then redirect with a flag
          // so /login can show a "logged out — sign in with new email"
          // banner if the future sign-in screen wants to render one.
          try { await logoutUser(); } catch { /* expected */ }
          router.push("/login?email_changed=1");
        }}
      />
      <DeleteAccountModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onDeleted={async () => {
          // Token already invalidated server-side via password_version bump.
          // Best-effort logout to clear local Zustand state, then redirect.
          try { await logoutUser(); } catch { /* token already dead — expected */ }
          router.push("/login?deleted=1");
        }}
      />
    </div>
  );
}
