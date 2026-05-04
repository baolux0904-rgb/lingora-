/**
 * controllers/publicController.js
 *
 * Public, unauthenticated endpoints. Mounted at /api/v1/public.
 * Currently exposes:
 *   - GET /api/v1/public/limits — feeds the landing PricingSection so the
 *     "X lần/ngày" copy is sourced from domain/limits.js, never hardcoded.
 *
 * Anything added here MUST stay safe to serve without a session: no PII,
 * no per-user data, no internal config (env vars, secrets, table names).
 */

"use strict";

const { PUBLIC_LIMITS } = require("../domain/limits");
const { sendSuccess, sendError } = require("../response");
const waitlistRepository = require("../repositories/waitlistRepository");
const authRepository = require("../repositories/authRepository");
const { sendWaitlistConfirmation } = require("../services/emailService");
const { VALID_USERNAME_RE } = require("../lib/usernameHelper");

async function getPublicLimits(_req, res) {
  // 5 min CDN cache: limits change at most a few times a year, and the
  // shape is identical for every visitor.
  res.set("Cache-Control", "public, max-age=300, s-maxage=300");
  return sendSuccess(res, { data: PUBLIC_LIMITS, message: "Public daily limits" });
}

// ─── Username availability (Wave 6 Sprint 3B) ────────────────────────────────

/**
 * GET /api/v1/public/username-availability?username=<name>
 *
 * Real-time availability check for the Register form. Public — no auth
 * required. Rate-limited at the route layer (30 req/min per IP) to soften
 * username enumeration. Usernames are public (visible on /u/[username]
 * profile pages) so leakage risk is bounded; throttle is comfort more
 * than security.
 *
 * Always returns 200; the body's `available` field is the gate.
 *   { available: true }                            — ok to use
 *   { available: false, reason: 'invalid' }        — format violation
 *   { available: false, reason: 'taken' }          — already in users table
 */
async function getUsernameAvailability(req, res, next) {
  try {
    const raw = (req.query.username || "").toString().trim();
    const lower = raw.toLowerCase();

    // Format check first — avoids a DB hit for obviously-bad input
    if (!VALID_USERNAME_RE.test(raw)) {
      return sendSuccess(res, {
        data: { available: false, reason: "invalid" },
        message: "Username format invalid",
      });
    }

    const taken = await authRepository.usernameExists(lower);
    if (taken) {
      return sendSuccess(res, {
        data: { available: false, reason: "taken" },
        message: "Username taken",
      });
    }

    return sendSuccess(res, {
      data: { available: true },
      message: "Username available",
    });
  } catch (err) {
    next(err);
  }
}

// ─── Waitlist (Wave 6 Sprint 2D) ─────────────────────────────────────────────

const ALLOWED_TIERS = ["free", "pro", "pro_annual"];
const ALLOWED_GOAL_BANDS = ["5.5", "6.0", "6.5", "7.0", "7.5+", "unsure"];
const EDU_REGEX = /\.edu(\.[a-z]{2,3})?$/i;
// Pragmatic email shape — same surface area as register flow, not RFC 5322
// strict (which would reject many legitimate addresses). Backend is one
// validation layer; the modal HTML5 type=email + the auto-confirm email
// double-check liveness.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/v1/public/waitlist
 *
 * Pre-launch landing-page waitlist signup. Public — no auth required by
 * design (landing visitor has no session yet).
 *
 * Body: { email, name, interested_tier, goal_band? }
 *
 * Returns 201 on success, 409 on duplicate email, 400 on validation,
 * 500 on server error. Confirmation email sent fire-and-forget; email
 * failure is logged but does not bubble back to the user — their signup
 * is durably persisted regardless.
 */
async function postWaitlist(req, res, next) {
  try {
    const { email, name, interested_tier, goal_band } = req.body || {};

    // ── Validation ──────────────────────────────────────────────────────────
    if (!email || typeof email !== "string") {
      return sendError(res, { status: 400, message: "Email không hợp lệ", code: "INVALID_EMAIL" });
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 254) {
      return sendError(res, { status: 400, message: "Email không đúng định dạng", code: "INVALID_EMAIL" });
    }

    if (!name || typeof name !== "string") {
      return sendError(res, { status: 400, message: "Tên không hợp lệ", code: "INVALID_NAME" });
    }
    const cleanName = name.trim();
    if (cleanName.length < 2 || cleanName.length > 80) {
      return sendError(res, { status: 400, message: "Tên cần 2-80 ký tự", code: "INVALID_NAME" });
    }

    if (!interested_tier || !ALLOWED_TIERS.includes(interested_tier)) {
      return sendError(res, { status: 400, message: "Tier không hợp lệ", code: "INVALID_TIER" });
    }

    const cleanGoalBand =
      goal_band && ALLOWED_GOAL_BANDS.includes(goal_band) ? goal_band : null;

    const isStudent = EDU_REGEX.test(cleanEmail);

    // X-Forwarded-For may be a comma-separated chain when behind multiple
    // proxies; first hop is the real client. Express's req.ip already
    // honors trust proxy when configured.
    const xff = req.headers["x-forwarded-for"];
    const ipAddress =
      (typeof xff === "string" ? xff.split(",")[0].trim() : null) || req.ip || null;
    const userAgent = req.headers["user-agent"] || null;

    // ── Insert ──────────────────────────────────────────────────────────────
    let row;
    try {
      row = await waitlistRepository.insertWaitlist({
        email: cleanEmail,
        name: cleanName,
        interestedTier: interested_tier,
        goalBand: cleanGoalBand,
        isStudent,
        ipAddress,
        userAgent,
      });
    } catch (dbErr) {
      // 23505 = unique_violation — email already on waitlist
      if (dbErr && dbErr.code === "23505") {
        return sendError(res, {
          status: 409,
          message: "Email này đã đăng ký waitlist rồi 🐙",
          code: "WAITLIST_DUPLICATE",
        });
      }
      throw dbErr;
    }

    // ── Confirmation email (fire-and-forget) ────────────────────────────────
    sendWaitlistConfirmation({
      to: cleanEmail,
      name: cleanName,
      interestedTier: interested_tier,
      isStudent: row.is_student,
    }).catch((err) => console.error("[waitlist] email send failed:", err && err.message));

    return sendSuccess(res, {
      status: 201,
      data: { id: row.id, is_student: row.is_student },
      message: row.is_student
        ? "Đã ghi nhận! Mình thấy email .edu — bạn được giảm 20% Pro khi launch 🐙"
        : "Đã ghi nhận! Mình sẽ email bạn ngay khi mở đăng ký Pro 🐙",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getPublicLimits, postWaitlist, getUsernameAvailability };
