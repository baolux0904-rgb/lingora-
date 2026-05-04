/**
 * controllers/authController.js
 *
 * HTTP layer for the four auth endpoints:
 *   POST /auth/register
 *   POST /auth/login
 *   POST /auth/refresh
 *   POST /auth/logout
 *
 * Responsibilities:
 *  - Validate and sanitise request input.
 *  - Call authService — never repositories directly.
 *  - Set / clear the httpOnly refresh-token cookie.
 *  - Return the standard { success, message, data } envelope.
 *  - Forward unexpected errors to errorMiddleware via next().
 */

const authService   = require("../services/authService");
const authRepository = require("../repositories/authRepository");
const { sendSuccess, sendError } = require("../response");
const config          = require("../config");
const { VALID_USERNAME_RE, autogenUsername } = require("../lib/usernameHelper");

// ─── Cookie helpers ───────────────────────────────────────────────────────────

const REFRESH_COOKIE_NAME = "lingora_refresh";

/**
 * Build cookie options from config.
 * maxAge is set dynamically from the token's actual expiry.
 * @param {Date} expiresAt
 * @returns {object}
 */
function refreshCookieOptions(expiresAt) {
  return {
    httpOnly: true,
    secure:   config.cookie.secure,
    sameSite: config.cookie.sameSite,
    path:     config.cookie.path,
    expires:  expiresAt,   // absolute expiry matches the DB record
  };
}

/**
 * Options to clear the refresh cookie (expire it immediately).
 * Path must match the setting cookie's path or the browser won't delete it.
 */
const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   config.cookie.secure,
  sameSite: config.cookie.sameSite,
  path:     config.cookie.path,
};

// ─── Input validation helpers ─────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Collect all validation errors in a request body.
 * Returns an array of error strings; empty array means valid.
 * @param {object} body
 * @param {string[]} required – field names that must be non-empty strings
 * @param {object}  [extra]   – additional checks { fieldName: (value) => errorString|null }
 * @returns {string[]}
 */
function validate(body, required, extra = {}) {
  const errors = [];

  for (const field of required) {
    if (!body[field] || typeof body[field] !== "string" || !body[field].trim()) {
      errors.push(`${field} is required.`);
    }
  }

  for (const [field, check] of Object.entries(extra)) {
    if (body[field]) {
      const msg = check(body[field]);
      if (msg) errors.push(msg);
    }
  }

  return errors;
}

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 *
 * Body: { email, name, username, password, role?, dob? }
 *
 * Wave 6 Sprint 3B: username added (required for new email/password signups
 * via the rebuilt Register form; OAuth signups bypass this controller and
 * auto-generate via authService.googleAuth → lib/usernameHelper).
 *
 * Returns 201 with { user, accessToken } and sets the refresh cookie.
 * Returns 400 on validation failure.
 * Returns 409 if email or username is already taken.
 */
async function register(req, res, next) {
  try {
    // Trim username before validation so a clipboard paste with surrounding
    // whitespace doesn't trip the anchored VALID_USERNAME_RE regex with a
    // confusing format error.
    if (typeof req.body.username === "string") req.body.username = req.body.username.trim();

    const { email, name, username, password, role, dob } = req.body;

    const errors = validate(
      req.body,
      ["email", "name", "username", "password"],
      {
        email: (v) => EMAIL_REGEX.test(v) ? null : "Email không đúng định dạng.",
        username: (v) =>
          VALID_USERNAME_RE.test(v)
            ? null
            : "Username chỉ dùng chữ cái, số, dấu gạch dưới (3-30 ký tự).",
        password: (v) => v.length >= 8 ? null : "Mật khẩu cần ít nhất 8 ký tự.",
        role: (v) => {
          const valid = ["kid", "teacher", "parent"];
          return valid.includes(v) ? null : `role must be one of: ${valid.join(", ")}.`;
        },
        dob: (v) => {
          const d = new Date(v);
          return isNaN(d.getTime()) ? "dob must be a valid date (YYYY-MM-DD)." : null;
        },
      }
    );

    if (errors.length) {
      const err = new Error(errors.join(" "));
      err.status = 400;
      return next(err);
    }

    const result = await authService.register({
      email:    email.trim().toLowerCase(),
      name:     name.trim(),
      username: username.trim(),
      password,
      role:     role || "kid",
      dob:      dob  || null,
    });

    res.cookie(
      REFRESH_COOKIE_NAME,
      result.refreshToken,
      refreshCookieOptions(result.refreshExpiresAt)
    );

    // Send welcome email (non-blocking — never fails the registration)
    const { sendWelcomeEmail } = require("../services/emailService");
    sendWelcomeEmail(result.user).catch(() => {});

    return sendSuccess(res, {
      status:  201,
      message: "Account created successfully.",
      data: {
        user:        result.user,
        accessToken: result.accessToken,
        // Surface the COPPA flag so the frontend can show a "check your parent's email" banner
        needsParentalConsent: result.needsParentalConsent,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/login
 *
 * Body: { email, password }
 *
 * Returns 200 with { user, accessToken } and sets the refresh cookie.
 * Returns 400 on missing fields.
 * Returns 401 on wrong credentials (generic message — no email enumeration).
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const errors = validate(req.body, ["email", "password"]);
    if (errors.length) {
      const err = new Error(errors.join(" "));
      err.status = 400;
      return next(err);
    }

    const result = await authService.login({
      email:    email.trim().toLowerCase(),
      password,
    });

    res.cookie(
      REFRESH_COOKIE_NAME,
      result.refreshToken,
      refreshCookieOptions(result.refreshExpiresAt)
    );

    return sendSuccess(res, {
      message: "Logged in successfully.",
      data: {
        user:        result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/refresh
 *
 * Reads the refresh token from the httpOnly cookie — no body required.
 *
 * Returns 200 with a new { accessToken } and rotates the refresh cookie.
 * Returns 401 if the cookie is missing, invalid, expired, or already used.
 */
async function refresh(req, res, next) {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];

    const result = await authService.refreshTokens(rawToken);

    res.cookie(
      REFRESH_COOKIE_NAME,
      result.refreshToken,
      refreshCookieOptions(result.refreshExpiresAt)
    );

    return sendSuccess(res, {
      message: "Token refreshed successfully.",
      data: {
        user:        result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/logout
 *
 * Revokes the refresh token and clears the cookie.
 * Always returns 200 — even if the cookie was already absent or expired —
 * so the frontend can safely call this on every "sign out" action.
 */
async function logout(req, res, next) {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
    await authService.logout(rawToken);

    res.clearCookie(REFRESH_COOKIE_NAME, CLEAR_COOKIE_OPTIONS);

    return sendSuccess(res, { message: "Logged out successfully." });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/change-password (authenticated)
 * Body: { current_password?: string, new_password: string }
 */
async function handleChangePassword(req, res, next) {
  try {
    const { current_password, new_password } = req.body || {};
    if (typeof new_password !== "string") {
      return sendError(res, {
        status: 400,
        message: "Thiếu mật khẩu mới",
        code: "NEW_PASSWORD_REQUIRED",
      });
    }
    const result = await authService.changePassword(
      req.user.id,
      current_password ?? null,
      new_password
    );
    return sendSuccess(res, { data: result, message: "Password updated" });
  } catch (err) {
    if (err && err.status) {
      return sendError(res, { status: err.status, message: err.message, code: err.code });
    }
    next(err);
  }
}

// ─── Wave 2.10 — Email change ─────────────────────────────────────────────────

const emailChangeService = require("../services/emailChangeService");

/**
 * POST /api/v1/auth/email-change   (verifyToken + emailChangeLimiter)
 * Body: { new_email, current_password }
 *
 * Re-auths via current_password, atomically updates users.email, bumps
 * password_version (revokes every outstanding access JWT and refresh
 * token), then fires a notification email to the OLD address with a
 * 7-day undo link.
 */
async function handleEmailChange(req, res, next) {
  try {
    const { new_email, current_password } = req.body || {};
    await emailChangeService.changeEmail(req.user.id, current_password, new_email);

    // Clear the refresh cookie — it's already revoked at the DB level,
    // but the browser still has the value. Same pattern as logout.
    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure:   config.cookie.secure,
      sameSite: config.cookie.sameSite,
      path:     config.cookie.path,
    });

    return sendSuccess(res, {
      data:    { ok: true },
      message: "Email đã được đổi. Email xác nhận đã gửi tới địa chỉ cũ.",
    });
  } catch (err) { next(err); }
}

/**
 * GET /api/v1/auth/email-change/undo?token=<JWT>
 *
 * Public route (no JWT — the URL token IS the auth). Verifies the
 * undo JWT, calls the service to revert + bump password_version,
 * fires the confirmation email.
 *
 * Returns a tiny JSON success body. The FE landing page at
 * /auth/email-change/undo handles redirecting the user to /login.
 */
async function handleEmailChangeUndo(req, res, next) {
  try {
    const token = typeof req.query.token === "string" ? req.query.token : "";
    if (!token) {
      return sendError(res, { status: 400, message: "Thiếu token.", code: "INVALID_TOKEN" });
    }
    await emailChangeService.undoEmailChange(token);

    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure:   config.cookie.secure,
      sameSite: config.cookie.sameSite,
      path:     config.cookie.path,
    });

    return sendSuccess(res, {
      data:    { ok: true },
      message: "Đã khôi phục email. Vui lòng đăng nhập lại.",
    });
  } catch (err) { next(err); }
}

// ─── Wave 6 Sprint 3D — username backfill (PATCH/POST /auth/me/...) ─────────

/**
 * PATCH /api/v1/auth/me/username
 *
 * Updates the authenticated user's username. Drives:
 *  - UsernameBackfillModal (forces NULL → first-set for legacy users)
 *  - Future settings page rename (Wave 2 30-day cooldown still pending wiring)
 *
 * Initial NULL → first-set explicitly bypasses cooldown (no prior value to
 * cool down from). Cooldown enforcement for subsequent renames will be added
 * when the settings rename flow ships.
 */
async function patchMyUsername(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, { status: 401, message: "Cần đăng nhập trước" });

    const raw = req.body?.username;
    if (typeof raw !== "string") {
      return sendError(res, { status: 400, message: "Username không hợp lệ" });
    }
    const username = raw.trim().toLowerCase();
    if (!VALID_USERNAME_RE.test(username)) {
      return sendError(res, {
        status: 400,
        message: "Username chỉ dùng chữ cái, số, dấu gạch dưới (3-30 ký tự)",
      });
    }

    // Pre-INSERT dedup. Allow no-op when the same user already owns this
    // exact username (idempotent retry safe). DB UNIQUE remains the
    // authoritative gate; 23505 below catches the race.
    const taken = await authRepository.usernameExists(username);
    if (taken) {
      const current = await authRepository.findById(userId);
      if ((current?.username ?? "").toLowerCase() !== username) {
        return sendError(res, { status: 409, message: "Username này có người dùng rồi 🐙" });
      }
    }

    let updated;
    try {
      updated = await authRepository.updateUsername(userId, username);
    } catch (dbErr) {
      if (dbErr?.code === "23505" || /unique/i.test(dbErr?.message || "")) {
        return sendError(res, { status: 409, message: "Username này có người dùng rồi 🐙" });
      }
      throw dbErr;
    }
    if (!updated) {
      return sendError(res, { status: 404, message: "Không tìm thấy tài khoản" });
    }

    return sendSuccess(res, {
      data: { username: updated.username },
      message: "Username đã lưu",
    });
  } catch (err) { next(err); }
}

/**
 * POST /api/v1/auth/me/autogen-username
 *
 * Generates a username candidate (email-prefix + 6-char base36) for the
 * "Để Lintopus chọn cho mình 🐙" button in the backfill modal. Does NOT
 * write — client confirms via PATCH above so the user can edit before
 * committing.
 */
async function postAutogenUsername(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, { status: 401, message: "Cần đăng nhập trước" });

    const user = await authRepository.findById(userId);
    if (!user) return sendError(res, { status: 404, message: "Không tìm thấy tài khoản" });

    const candidate = await autogenUsername(user.email, (u) =>
      authRepository.usernameExists(u.toLowerCase()),
    );
    return sendSuccess(res, { data: { candidate }, message: "Username candidate" });
  } catch (err) { next(err); }
}

module.exports = {
  register, login, refresh, logout, handleChangePassword,
  handleEmailChange, handleEmailChangeUndo,
  patchMyUsername, postAutogenUsername,
};
