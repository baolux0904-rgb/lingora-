"use client";

/**
 * FriendsTab.tsx — Modernized social hub.
 *
 * Desktop (>=768px): persistent left panel (conversation list 320px) + right panel
 *   (active chat, or friend activity feed when no chat selected).
 * Mobile: sub-tab toggle (Chat, Friends, Requests, Add, Rooms) — same as before.
 *
 * All existing Socket.IO / API functionality preserved.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import Mascot from "@/components/ui/Mascot";
import { usePresence } from "@/contexts/PresenceContext";
import { formatRelativeTime } from "@/lib/utils/time";
import {
  getFriends,
  removeFriend,
  getIncomingRequests,
  getOutgoingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  sendPing,
  getSocialProfile,
  setSocialUsername,
  getQrToken,
  getChatConversations,
} from "@/lib/api";
import type { Friend, FriendRequest, SocialProfile, Conversation } from "@/lib/types";
import Skeleton from "@/components/ui/Skeleton";

import dynamic from "next/dynamic";
const StudyRoomTab = dynamic(() => import("./StudyRoomTab"), { ssr: false });
const ChatTab = dynamic(() => import("./ChatTab"), { ssr: false });

type SubTab = "chat" | "friends" | "requests" | "add" | "rooms";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Avatar({ name, size = 40, online }: { name: string; size?: number; online?: boolean }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="rounded-full w-full h-full flex items-center justify-center font-semibold text-xs"
        style={{ background: "linear-gradient(135deg, var(--color-avatar-from), var(--color-avatar-to))", color: "#fff" }}>
        {initials}
      </div>
      {online && (
        <span
          aria-hidden
          className="absolute rounded-full"
          style={{
            width: Math.max(9, Math.round(size * 0.28)),
            height: Math.max(9, Math.round(size * 0.28)),
            bottom: 0,
            right: 0,
            background: "#5DCAA5",
            border: "2px solid var(--color-bg-page)",
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Activity Feed (right panel when no chat selected — desktop only)
// ---------------------------------------------------------------------------

function BigEmpty() {
  return (
    <div className="max-w-[480px] mx-auto py-24 text-center flex flex-col items-center gap-6">
      <Mascot size={120} mood="default" />
      <h2
        className="font-display italic text-[24px] sm:text-[28px] leading-tight"
        style={{ color: "var(--color-text)" }}
      >
        Chưa có ai cả
      </h2>
      <p
        className="text-[15px] sm:text-[16px] max-w-[400px] leading-relaxed"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Mời bạn bè cùng luyện IELTS — học một mình lâu rồi cũng chán.
      </p>
      <Link
        href="/friends/add"
        className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-teal text-cream font-semibold text-sm shadow-colored hover:bg-teal-light transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-card)]"
      >
        Mời bạn bè
      </Link>
    </div>
  );
}

function ActivityFeed({ friends }: { friends: Friend[] }) {
  const activeFriends = friends.filter(f => f.practiced_today);
  const inactiveFriends = friends.filter(f => !f.practiced_today);

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 shrink-0" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Hoạt động bạn bè</h3>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>Xem ai đang học hôm nay</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="flex flex-col gap-4">
          {/* Active today */}
          {activeFriends.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5"
                style={{ color: "var(--color-text-tertiary)" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "#5DCAA5" }} />
                Hoạt động hôm nay ({activeFriends.length})
              </div>
              <div className="flex flex-col gap-2">
                {activeFriends.map(f => (
                  <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "rgba(93,202,165,0.06)", border: "1px solid rgba(93,202,165,0.15)" }}>
                    <div className="relative">
                      <Avatar name={f.name} size={36} />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                        style={{ background: "#5DCAA5", borderColor: "var(--color-bg-card)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>{f.name}</div>
                      <div className="text-xs" style={{ color: "#5DCAA5" }}>Đã luyện hôm nay</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inactive — nudge */}
          {inactiveFriends.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5"
                style={{ color: "var(--color-text-tertiary)" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-text-tertiary)" }} />
                Chưa luyện hôm nay ({inactiveFriends.length})
              </div>
              <div className="flex flex-col gap-2">
                {inactiveFriends.map(f => (
                  <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "var(--surface-primary)", border: "1px solid var(--surface-border)" }}>
                    <Avatar name={f.name} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>{f.name}</div>
                      {f.username && <div className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>@{f.username}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Desktop Conversation Sidebar (left 320px panel)
// ---------------------------------------------------------------------------

function ConversationSidebar({ conversations, activeId, onSelect, loading, subTab, onSubTabChange }: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (c: Conversation) => void;
  loading: boolean;
  subTab: SubTab;
  onSubTabChange: (t: SubTab) => void;
}) {
  const [search, setSearch] = useState("");
  // PR9 — presence map for the green dot overlay.
  const { isOnline: friendIsOnline } = usePresence();

  const filtered = search.trim()
    ? conversations.filter((c) => c.friend_name.toLowerCase().includes(search.toLowerCase()) || c.friend_username?.toLowerCase().includes(search.toLowerCase()))
    : conversations;

  return (
    <div className="flex flex-col h-full">
      {/* PR7.1 — horizontal sub-tab bar removed; FriendsShell kebab menu replaces it. */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        {subTab === "chat" && (
          <div className="relative">
            <Search
              aria-hidden="true"
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-text-tertiary)" }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm tin nhắn..."
              className="w-full rounded-full pl-9 pr-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bg-card)]"
              style={{
                background: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
              }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {subTab !== "chat" ? (
          <div className="px-4 py-2">
            {subTab === "friends" && <FriendsList />}
            {subTab === "requests" && <RequestsList />}
            {subTab === "add" && <AddFriend />}
            {subTab === "rooms" && <StudyRoomTab />}
          </div>
        ) : loading ? (
          <div className="px-4"><Skeleton.List count={4} /></div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
              {search
                ? "Không tìm thấy"
                : "Thêm bạn bè để bắt đầu"}
            </p>
          </div>
        ) : (
          filtered.map((c) => (
            <button key={c.friend_id} onClick={() => onSelect(c)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all cursor-pointer"
              style={{
                background: activeId === c.friend_id ? "rgba(0,168,150,0.06)" : "transparent",
                borderLeft: activeId === c.friend_id ? "3px solid #00A896" : "3px solid transparent",
              }}>
              <div className="relative">
                <Avatar name={c.friend_name} size={40} online={friendIsOnline(c.friend_id)} />
                {c.unread_count > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{ background: "#00A896", color: "#fff" }}>{c.unread_count > 9 ? "9+" : c.unread_count}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>{c.friend_name}</span>
                  <span className="text-xs shrink-0 ml-2 tabular-nums" style={{ color: "var(--color-text-tertiary)" }}>
                    {c.last_message_at ? formatRelativeTime(c.last_message_at) : ""}
                  </span>
                </div>
                <span
                  className={`text-xs truncate block${c.last_type === "voice" ? " italic" : ""}`}
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {c.last_type === "voice"
                    ? "[Tin nhắn thoại]"
                    : c.last_content?.slice(0, 35) || "Bắt đầu trò chuyện"}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}


// ---------------------------------------------------------------------------
// Friends List (kept intact)
// ---------------------------------------------------------------------------

function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinging, setPinging] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFriends();
      setFriends(data.friends);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePing = async (friendId: string) => {
    setPinging(friendId);
    try {
      await sendPing({ receiverUserId: friendId, messageTemplateKey: "havent_practiced_today" });
    } catch { /* silent */ }
    setPinging(null);
  };

  const handleRemove = async (friendId: string) => {
    if (!confirm("Bỏ kết bạn?")) return;
    try {
      await removeFriend(friendId);
      setFriends((prev) => prev.filter((f) => f.id !== friendId));
    } catch { /* silent */ }
  };

  if (loading) return <Skeleton.List count={4} />;

  if (friends.length === 0) {
    return (
      <div className="text-center py-12 flex flex-col items-center gap-2">
        <Mascot size={56} mood="thinking" />
        <p className="text-sm mt-2" style={{ color: "var(--color-text-secondary)" }}>
          Chưa có ai cả. Thêm bạn để bắt đầu.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {friends.map((f) => (
        <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg"
          style={{ background: "var(--surface-primary)", border: "1px solid var(--surface-border)" }}>
          <div className="relative">
            <Avatar name={f.name} size={40} />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
              style={{ background: f.practiced_today ? "#5DCAA5" : "#9CA3AF", borderColor: "var(--color-bg-card)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>{f.name}</div>
            {f.username && <div className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>@{f.username}</div>}
          </div>
          {!f.practiced_today && (
            <button onClick={() => handlePing(f.id)} disabled={pinging === f.id}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              style={{ background: "rgba(245,158,11,0.10)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.2)" }}>
              {pinging === f.id ? "..." : "Nhắc nhẹ"}
            </button>
          )}
          <button onClick={() => handleRemove(f.id)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs cursor-pointer"
            style={{ color: "var(--color-text-tertiary)" }} title="Bỏ kết bạn">
            ···
          </button>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Requests (kept intact)
// ---------------------------------------------------------------------------

function RequestsList() {
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [inc, out] = await Promise.all([getIncomingRequests(), getOutgoingRequests()]);
      setIncoming(inc.requests);
      setOutgoing(out.requests);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAccept = async (id: string) => {
    try { await acceptFriendRequest(id); setIncoming((prev) => prev.filter((r) => r.id !== id)); } catch { /* silent */ }
  };
  const handleReject = async (id: string) => {
    try { await rejectFriendRequest(id); setIncoming((prev) => prev.filter((r) => r.id !== id)); } catch { /* silent */ }
  };
  const handleCancel = async (id: string) => {
    try { await cancelFriendRequest(id); setOutgoing((prev) => prev.filter((r) => r.id !== id)); } catch { /* silent */ }
  };

  if (loading) return <Skeleton.List count={3} />;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-tertiary)" }}>
          Lời mời đến ({incoming.length})
        </div>
        {incoming.length === 0 ? (
          <p className="text-sm py-3" style={{ color: "var(--color-text-secondary)" }}>Chưa có lời mời nào</p>
        ) : (
          <div className="flex flex-col gap-2">
            {incoming.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: "var(--surface-primary)", border: "1px solid var(--surface-border)" }}>
                <Avatar name={r.sender_name || "?"} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>{r.sender_name}</div>
                </div>
                <button onClick={() => handleAccept(r.id)} className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer"
                  style={{ background: "#00A896", color: "#fff" }}>Đồng ý</button>
                <button onClick={() => handleReject(r.id)} className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer"
                  style={{ background: "var(--color-bg-secondary)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}>Từ chối</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-tertiary)" }}>
          Đã gửi ({outgoing.length})
        </div>
        {outgoing.length === 0 ? (
          <p className="text-sm py-3" style={{ color: "var(--color-text-secondary)" }}>Chưa gửi lời mời nào</p>
        ) : (
          <div className="flex flex-col gap-2">
            {outgoing.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: "var(--surface-primary)", border: "1px solid var(--surface-border)" }}>
                <Avatar name={r.receiver_name || "?"} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>{r.receiver_name}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}>Đang chờ</span>
                <button onClick={() => handleCancel(r.id)} className="text-xs font-medium cursor-pointer" style={{ color: "var(--color-text-tertiary)" }}>Hủy</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Friend (kept intact)
// ---------------------------------------------------------------------------

function AddFriend() {
  const [searchUsername, setSearchUsername] = useState("");
  const [qrInput, setQrInput] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  useEffect(() => { getSocialProfile().then(setProfile).catch(() => {}); }, []);

  useEffect(() => {
    if (!profile?.qrToken) {
      getQrToken().then((data) => { setProfile((p) => p ? { ...p, qrToken: data.qrToken } : p); }).catch(() => {});
    }
  }, [profile?.qrToken]);

  useEffect(() => {
    if (!profile?.qrToken) return;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(profile.qrToken!, { width: 200, margin: 2, color: { dark: "#1B2B4B", light: "#ffffff" } })
        .then(setQrDataUrl).catch(() => {});
    });
  }, [profile?.qrToken]);

  const handleSearchAdd = async () => {
    if (!searchUsername.trim()) return;
    setSending(true); setMessage(null);
    try { await sendFriendRequest({ username: searchUsername.trim() }); setMessage({ text: "Đã gửi lời mời!", ok: true }); setSearchUsername(""); }
    catch (err) { setMessage({ text: err instanceof Error ? err.message : "Thất bại", ok: false }); }
    setSending(false);
  };

  const handleQrAdd = async () => {
    if (!qrInput.trim()) return;
    setSending(true); setMessage(null);
    try { await sendFriendRequest({ qrToken: qrInput.trim() }); setMessage({ text: "Đã gửi lời mời!", ok: true }); setQrInput(""); }
    catch (err) { setMessage({ text: err instanceof Error ? err.message : "Thất bại", ok: false }); }
    setSending(false);
  };

  const handleSetUsername = async () => {
    if (!newUsername.trim()) return;
    try { await setSocialUsername(newUsername.trim()); setProfile((p) => p ? { ...p, username: newUsername.trim() } : p); setEditingUsername(false); }
    catch (err) { setMessage({ text: err instanceof Error ? err.message : "Thất bại", ok: false }); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg p-4" style={{ background: "var(--surface-primary)", border: "1px solid var(--surface-border)" }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-tertiary)" }}>Username của bạn</div>
        {editingUsername ? (
          <div className="flex gap-2">
            <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="3-20 ký tự, chữ/số/_"
              className="flex-1 rounded-lg px-3 py-2 text-sm"
              style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)", color: "var(--color-text)" }} />
            <button onClick={handleSetUsername} className="px-3 py-2 rounded-lg text-xs font-medium cursor-pointer" style={{ background: "#00A896", color: "#fff" }}>Lưu</button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{profile?.username ? `@${profile.username}` : "Chưa đặt"}</span>
            <button onClick={() => { setEditingUsername(true); setNewUsername(profile?.username || ""); }} className="text-xs font-medium cursor-pointer" style={{ color: "#00A896" }}>
              {profile?.username ? "Sửa" : "Đặt username"}
            </button>
          </div>
        )}
      </div>

      <div className="rounded-lg p-4" style={{ background: "var(--surface-primary)", border: "1px solid var(--surface-border)" }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-tertiary)" }}>Tìm theo username</div>
        <div className="flex gap-2">
          <input value={searchUsername} onChange={(e) => setSearchUsername(e.target.value)} placeholder="Nhập username..."
            className="flex-1 rounded-lg px-3 py-2 text-sm"
            style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
            onKeyDown={(e) => e.key === "Enter" && handleSearchAdd()} />
          <button onClick={handleSearchAdd} disabled={sending || !searchUsername.trim()}
            className="px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer" style={{ background: "#00A896", color: "#fff" }}>Thêm</button>
        </div>
      </div>

      <div className="rounded-lg p-4" style={{ background: "var(--surface-primary)", border: "1px solid var(--surface-border)" }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-tertiary)" }}>Mã QR của bạn</div>
        {qrDataUrl ? (
          <div className="flex justify-center mb-3">
            <img src={qrDataUrl} alt="Mã QR của bạn" className="w-40 h-40 rounded-lg" style={{ background: "#fff" }} />
          </div>
        ) : (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }} />
          </div>
        )}
        <p className="text-xs text-center mb-3" style={{ color: "var(--color-text-secondary)" }}>Chia sẻ mã QR với bạn bè</p>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2 mt-4" style={{ color: "var(--color-text-tertiary)" }}>Nhập mã QR của bạn bè</div>
        <div className="flex gap-2">
          <input value={qrInput} onChange={(e) => setQrInput(e.target.value)} placeholder="Dán mã QR..."
            className="flex-1 rounded-lg px-3 py-2 text-sm"
            style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)", color: "var(--color-text)" }} />
          <button onClick={handleQrAdd} disabled={sending || !qrInput.trim()}
            className="px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer" style={{ background: "#00A896", color: "#fff" }}>Thêm</button>
        </div>
      </div>

      {message && (
        <div className="rounded-lg px-4 py-3 text-sm text-center"
          style={{ background: message.ok ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", color: message.ok ? "#22C55E" : "#EF4444",
            border: `1px solid ${message.ok ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}` }}>
          {message.text}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main FriendsTab
// ---------------------------------------------------------------------------

interface FriendsTabProps {
  /** PR7.1 — initial sub-tab controlled by route. Defaults to "chat" for back-compat. */
  activeSubTab?: SubTab;
}

export default function FriendsTab({ activeSubTab }: FriendsTabProps = {}) {
  const [subTab, setSubTab] = useState<SubTab>(activeSubTab ?? "chat");
  useEffect(() => {
    if (activeSubTab && activeSubTab !== subTab) setSubTab(activeSubTab);
    // Only sync when route-driven prop changes. Local clicks still update state freely.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convLoading, setConvLoading] = useState(true);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  // Load conversations
  const loadConversations = useCallback(async () => {
    setConvLoading(true);
    try { const data = await getChatConversations(); setConversations(data.conversations); } catch { /* silent */ }
    setConvLoading(false);
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Poll conversations
  useEffect(() => {
    const poll = setInterval(async () => {
      try { const data = await getChatConversations(); setConversations(data.conversations); } catch { /* silent */ }
    }, 10000);
    return () => clearInterval(poll);
  }, []);

  // Load friends for activity feed
  useEffect(() => {
    getFriends().then(data => setFriends(data.friends)).catch(() => {});
  }, []);

  const activeId = activeConversation?.friend_id ?? null;

  // ---------------------------------------------------------------------------
  // Mobile layout — sub-tab toggle (same as before)
  // ---------------------------------------------------------------------------

  const mobileLayout = (
    <div className="md:hidden flex flex-col gap-5">
      {/* PR7.1 — mobile horizontal tab bar removed; kebab menu in FriendsShell replaces it. */}
      {subTab === "chat" && <ChatTab />}
      {subTab === "friends" && <FriendsList />}
      {subTab === "requests" && <RequestsList />}
      {subTab === "add" && <AddFriend />}
      {subTab === "rooms" && <StudyRoomTab />}
    </div>
  );

  // ---------------------------------------------------------------------------
  // Desktop layout — persistent left panel + right panel
  // ---------------------------------------------------------------------------

  const desktopLayout = (
    <div className="hidden md:flex rounded-2xl overflow-hidden"
      style={{ height: "calc(100vh - 140px)", minHeight: 500, background: "var(--surface-primary)", border: "1px solid var(--surface-border)" }}>
      {/* Left panel — 320px conversation sidebar */}
      <div className="w-[320px] shrink-0 flex flex-col" style={{ borderRight: "1px solid var(--color-border)" }}>
        <ConversationSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={(c) => { setActiveConversation(c); setSubTab("chat"); }}
          loading={convLoading}
          subTab={subTab}
          onSubTabChange={(t) => { setSubTab(t); if (t !== "chat") setActiveConversation(null); }}
        />
      </div>

      {/* Right panel — chat, activity feed, or unified empty state */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConversation && subTab === "chat" ? (
          <ChatTab externalConversation={activeConversation} onBack={() => setActiveConversation(null)} />
        ) : friends.length === 0 && conversations.length === 0 && subTab === "chat" ? (
          <BigEmpty />
        ) : (
          <ActivityFeed friends={friends} />
        )}
      </div>
    </div>
  );

  return (
    <>
      {mobileLayout}
      {desktopLayout}
    </>
  );
}
