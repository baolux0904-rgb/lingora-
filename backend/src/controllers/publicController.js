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
const { sendSuccess } = require("../response");

async function getPublicLimits(_req, res) {
  // 5 min CDN cache: limits change at most a few times a year, and the
  // shape is identical for every visitor.
  res.set("Cache-Control", "public, max-age=300, s-maxage=300");
  return sendSuccess(res, { data: PUBLIC_LIMITS, message: "Public daily limits" });
}

module.exports = { getPublicLimits };
