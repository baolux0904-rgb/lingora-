"use strict";

/**
 * routes/analyticsRoutes.js
 *
 * POST /api/v1/analytics/track — public ingest endpoint for the FE
 * analytics wrapper. optionalAuth lets a logged-in user be stamped on
 * the row; anonymous tracking is the default.
 *
 * Rate limit: 100 events / IP / minute. Caps anonymous abuse without
 * starving an honest single-page session, which fires far below this
 * ceiling under normal use.
 */

const express = require("express");
const rateLimit = require("express-rate-limit");
const { optionalAuth } = require("../middleware/auth");
const analyticsController = require("../controllers/analyticsController");

const router = express.Router();

const trackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many analytics events. Slow down.", code: "RATE_LIMIT" },
});

router.post("/track", trackLimiter, optionalAuth, analyticsController.track);

module.exports = router;
