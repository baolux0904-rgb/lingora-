/**
 * routes/authRoutes.js
 *
 * Mounted at /api/v1/auth in app.js.
 *
 * Rate limiting is applied here (not at the app level) so the stricter
 * limit only affects auth endpoints, not the rest of the API.
 *
 *   POST /api/v1/auth/register
 *   POST /api/v1/auth/login
 *   POST /api/v1/auth/refresh
 *   POST /api/v1/auth/logout
 */

const { Router }    = require("express");
const rateLimit     = require("express-rate-limit");
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

const router = Router();

// ─── Rate limiter ─────────────────────────────────────────────────────────────
// 10 requests per 15-minute window per IP.
// Brute-force attacks on /login and /register hit this limit first.
const authLimiter = rateLimit({
  windowMs:          15 * 60 * 1000, // 15 minutes
  max:               10,
  standardHeaders:   true,           // Return rate limit info in RateLimit-* headers
  legacyHeaders:     false,
  // Wave 6 Sprint 3B — translated per lingona-design/05-voice/microcopy-library.md
  // + 09-anti-patterns/corporate-translate.md (peer voice, no 'vui lòng').
  message: {
    success: false,
    message: "Quá nhiều lần thử — đợi 15 phút rồi thử lại 🐙",
  },
});

router.use(authLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────

/** Create a new account */
router.post("/register", authController.register);

/** Log in with email + password */
router.post("/login",    authController.login);

/**
 * Silently exchange a refresh cookie for a new access token.
 * No body needed — reads the httpOnly cookie automatically.
 */
router.post("/refresh",  authController.refresh);

/** Revoke the refresh token and clear the cookie */
router.post("/logout",   authController.logout);

/** Change password (authenticated). Handles both SSO-only users setting
 *  initial pass and existing-pass users rotating. */
router.post("/change-password", verifyToken, authController.handleChangePassword);

// ─── Wave 6 Sprint 3D — username backfill (NULL → first-set + autogen) ──────
// 10 req/min/IP — modest throttle on the hybrid pick UX (manual + autogen
// taps both endpoints). Public availability check uses a separate limiter
// in publicRoutes.js so the backfill flow can't starve it (or vice versa).
const usernameUpdateLimiter = rateLimit({
  windowMs:        60 * 1000,
  max:             10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: "Quá nhiều lần thử — đợi tí 🐙",
  },
});

/** PATCH — set / update authenticated user's username. Backfill modal +
 *  future settings rename both call this. */
router.patch("/me/username", verifyToken, usernameUpdateLimiter, authController.patchMyUsername);

/** POST — generate a username candidate from the user's email prefix.
 *  Client previews + can edit before confirming via PATCH above. */
router.post("/me/autogen-username", verifyToken, usernameUpdateLimiter, authController.postAutogenUsername);

// ─── Wave 2.10 — Email change ────────────────────────────────────────────────

const { emailChangeLimiter } = require("../middleware/rateLimiters");

/** POST — re-auth + atomic email update + revoke + notification + 7d undo. */
router.post("/email-change", verifyToken, emailChangeLimiter, authController.handleEmailChange);

/** GET — single-use undo via signed JWT (no auth header — token IS auth). */
router.get("/email-change/undo", authController.handleEmailChangeUndo);

// ─── Google OAuth ────────────────────────────────────────────────────────────

const { passport } = require("../config/passport");
const authService = require("../services/authService");
const config = require("../config");

const REFRESH_COOKIE_NAME = "lingora_refresh";

/**
 * GET /api/v1/auth/google — redirect to Google consent screen.
 * Only registered if GOOGLE_CLIENT_ID is set.
 */
if (process.env.GOOGLE_CLIENT_ID) {
  router.get("/google", passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  }));

  /**
   * GET /api/v1/auth/google/callback — handle Google redirect.
   * Issues JWT + refresh cookie, then redirects to frontend callback page.
   */
  router.get("/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login?error=google_failed" }),
    async (req, res, next) => {
      try {
        const profile = req.user;
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName || "User";
        const googleId = profile.id;
        const avatarUrl = profile.photos?.[0]?.value || null;

        if (!email) {
          return res.redirect("/login?error=no_email");
        }

        const result = await authService.googleAuth({ googleId, email, name, avatarUrl });

        // Set refresh cookie (same as login)
        res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
          httpOnly: true,
          secure: config.cookie.secure,
          sameSite: config.cookie.sameSite,
          path: config.cookie.path,
          expires: result.refreshExpiresAt,
        });

        // Redirect to frontend callback with access token in URL.
        // Wave 6 Sprint 3B — append ?new=1 for first-time signups so the
        // callback page (and downstream /home) can show the Lintopus
        // happy greeting card. Returning users get the unmarked URL and
        // skip the greeting (industry-standard signal pattern, used by
        // GitHub/Linear/Notion/Vercel/Figma/Stripe/Airbnb).
        const frontendUrl = process.env.FRONTEND_URL || "https://lingona.app";
        const newParam = result.isNewUser ? "&new=1" : "";
        const callbackUrl = `${frontendUrl}/auth/google/callback?token=${encodeURIComponent(result.accessToken)}&user=${encodeURIComponent(JSON.stringify(result.user))}${newParam}`;
        res.redirect(callbackUrl);
      } catch (err) {
        next(err);
      }
    }
  );
}

module.exports = router;
