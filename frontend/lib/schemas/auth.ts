/**
 * Auth schemas — Wave 6 Sprint 3E.
 *
 * Single source of truth for client-side auth form validation. Mirrors
 * backend Wave 2 username rules + Sprint 3B email/password rules.
 *
 * Vietnamese error messages match
 *   .claude/skills/lingona-design/05-voice/microcopy-library.md (peer voice)
 *   .claude/skills/lingona-design/09-anti-patterns/corporate-translate.md
 *     (no 'vui lòng', octopus emoji on terminal messages).
 *
 * Schemas are client-side only for now. Backend remains authoritative via
 * existing manual validation (Sprint 3B + 3D). Future iteration may share
 * schemas via a shared package if the monorepo expands.
 */

import { z } from "zod";

// ─── Field schemas ──────────────────────────────────────────────────────────

/** Username rules per Wave 2 migration 0016 + Sprint 3B regex. */
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username cần 3-30 ký tự")
  .max(30, "Username cần 3-30 ký tự")
  .regex(USERNAME_REGEX, "Username chỉ dùng chữ cái, số, dấu gạch dưới");

/** Email — RFC-lite format (matches backend EMAIL_REGEX from Sprint 3B). */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email cần điền")
  .email("Email không đúng định dạng");

/** Password — 8-char minimum (matches backend bcrypt + Wave 0-5 rules). */
export const passwordSchema = z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự");

/** Display name — 2-80 chars (matches Sprint 3B register validation). */
export const nameSchema = z
  .string()
  .trim()
  .min(2, "Tên cần ít nhất 2 ký tự")
  .max(80, "Tên tối đa 80 ký tự");

// ─── Composed schemas ───────────────────────────────────────────────────────

/** Login — login allows pre-rules-update (legacy) passwords, so the password
 *  field only checks presence here. Backend re-validates per its own rules. */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Mật khẩu cần điền"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Register — full new-account validation. */
export const registerSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  username: usernameSchema,
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;

/** Username backfill — single field, used by UsernameBackfillModal. */
export const usernameBackfillSchema = z.object({
  username: usernameSchema,
});

export type UsernameBackfillInput = z.infer<typeof usernameBackfillSchema>;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Structural shape of a zod safeParse result. Defined here rather than
 * imported from zod so the helpers stay tolerant of zod major-version
 * renames (v3 SafeParseReturnType vs v4 SafeParseResult).
 */
type SafeResult<T> =
  | { success: true; data: T }
  | { success: false; error: { issues: Array<{ path: PropertyKey[]; message: string }> } };

/**
 * Extract the first error message from a safeParse failure, or null on
 * success. Used for the single inline error string the legacy auth forms
 * currently render.
 */
export function getFirstError<T>(result: SafeResult<T>): string | null {
  if (result.success) return null;
  const issue = result.error.issues[0];
  return issue?.message || "Có lỗi rồi — thử lại nhé";
}

/**
 * Extract field-level errors as a { path: message } map. First message wins
 * per path. Returns {} on success. Reserved for future per-field UI.
 */
export function getFieldErrors<T>(result: SafeResult<T>): Record<string, string> {
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.map(String).join(".");
    if (path && !errors[path]) errors[path] = issue.message;
  }
  return errors;
}
