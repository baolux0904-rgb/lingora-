"use client";

/**
 * DeleteAccountModal.tsx — 2-step account deletion confirmation.
 *
 * Step 1: warning + breakdown of what gets deleted vs anonymized.
 * Step 2: case-sensitive type-to-confirm. Submit fires DELETE /users/me.
 *
 * After success the parent screen logs the user out and redirects to /login.
 */

import { useState, useCallback, useEffect } from "react";
import { deleteMyAccount } from "@/lib/api";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void; // parent does logout + redirect
}

const REQUIRED_CONFIRMATION = "XÓA";

export default function DeleteAccountModal({ isOpen, onClose, onDeleted }: DeleteAccountModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [typed, setTyped] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state every time the modal opens.
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setTyped("");
      setError(null);
      setSubmitting(false);
    }
  }, [isOpen]);

  const exactMatch = typed === REQUIRED_CONFIRMATION;

  const handleSubmit = useCallback(async () => {
    if (!exactMatch || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await deleteMyAccount(REQUIRED_CONFIRMATION);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa tài khoản. Vui lòng thử lại.");
      setSubmitting(false);
    }
  }, [exactMatch, submitting, onDeleted]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: "var(--surface-primary)", border: "1px solid var(--surface-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {step === 1 && (
          <>
            <h2 className="text-xl font-display font-bold" style={{ color: "#EF4444" }}>
              Xóa tài khoản vĩnh viễn?
            </h2>
            <p className="text-sm" style={{ color: "var(--color-text)" }}>
              Hành động <strong>KHÔNG THỂ HOÀN TÁC</strong>.
            </p>

            <div className="rounded-lg p-3" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <p className="text-xs font-semibold mb-2" style={{ color: "#EF4444" }}>Sẽ bị xóa hoàn toàn:</p>
              <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: "var(--color-text-secondary)" }}>
                <li>Tin nhắn với bạn bè</li>
                <li>Voice notes</li>
                <li>Lời mời kết bạn</li>
                <li>Avatar và bio</li>
              </ul>
            </div>

            <div className="rounded-lg p-3" style={{ background: "rgba(0,168,150,0.06)", border: "1px solid rgba(0,168,150,0.2)" }}>
              <p className="text-xs font-semibold mb-2" style={{ color: "#00A896" }}>Sẽ được ẩn danh (giữ aggregate):</p>
              <ul className="text-xs space-y-1 ml-4 list-disc" style={{ color: "var(--color-text-secondary)" }}>
                <li>Điểm Battle</li>
                <li>XP và rank trên leaderboard</li>
                <li>Badge đã đạt</li>
              </ul>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                style={{ background: "var(--surface-secondary)", color: "var(--color-text)", border: "1px solid var(--surface-border)" }}
              >
                Hủy
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)" }}
              >
                Tôi hiểu, tiếp tục
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-display font-bold" style={{ color: "#EF4444" }}>
              Xác nhận lần cuối
            </h2>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Gõ <strong style={{ color: "var(--color-text)" }}>&quot;{REQUIRED_CONFIRMATION}&quot;</strong> (in hoa) để xác nhận:
            </p>

            <input
              type="text"
              value={typed}
              onChange={(e) => { setTyped(e.target.value); setError(null); }}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full py-3 px-4 rounded-lg text-base font-medium"
              style={{
                background: "var(--surface-secondary)",
                color: "var(--color-text)",
                border: `2px solid ${exactMatch ? "#EF4444" : "var(--surface-border)"}`,
                outline: "none",
              }}
              placeholder={REQUIRED_CONFIRMATION}
            />

            {error && (
              <p className="text-xs" style={{ color: "#EF4444" }}>{error}</p>
            )}

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setStep(1)}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
                style={{ background: "var(--surface-secondary)", color: "var(--color-text)", border: "1px solid var(--surface-border)" }}
              >
                Quay lại
              </button>
              <button
                onClick={handleSubmit}
                disabled={!exactMatch || submitting}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: exactMatch && !submitting ? "#EF4444" : "rgba(239,68,68,0.3)",
                  color: "#fff",
                }}
              >
                {submitting ? "Đang xóa..." : "Xác nhận xóa vĩnh viễn"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
