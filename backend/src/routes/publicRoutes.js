/**
 * routes/publicRoutes.js
 *
 * Unauthenticated endpoints. Add cautiously — anything here is reachable
 * by unauthenticated visitors and should never expose user data.
 */

"use strict";

const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const publicController = require("../controllers/publicController");

const router = Router();

// GET /api/v1/public/limits
router.get("/limits", publicController.getPublicLimits);

// POST /api/v1/public/waitlist (Wave 6 Sprint 2D — landing waitlist signup)
router.post("/waitlist", publicController.postWaitlist);

// Wave 6 Sprint 3B — username availability live check (Register form).
// Throttled per IP to soften enumeration. Usernames are public anyway
// (visible on /u/[username] profiles) so this limit is comfort, not security.
const usernameAvailLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 30,             // 30 req per IP per min — comfortable for typing-debounced UX
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Quá nhiều lần kiểm tra — đợi tí nhé 🐙",
  },
});

// GET /api/v1/public/username-availability?username=<name>
router.get("/username-availability", usernameAvailLimiter, publicController.getUsernameAvailability);

module.exports = router;
