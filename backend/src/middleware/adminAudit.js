/**
 * middleware/adminAudit.js — Wave 1.7
 *
 * Captures every admin write action into admin_audit_log for incident
 * response and compliance. Runs AFTER verifyToken + requireRole("admin")
 * so req.user.id is guaranteed admin.
 *
 * Insert is fire-and-forget after `res.end` fires, so a DB hiccup never
 * blocks the admin's response. Failures log to stderr only.
 *
 * Sensitive fields in req.body (password, token, secret, api_key, auth*)
 * are replaced with "<redacted>" before persisting. Long string fields
 * are truncated to 10 KB to bound row size.
 */

"use strict";

const { query } = require("../config/db");

const SENSITIVE_KEY_RE = /^(password|token|secret|api_?key|auth_|authorization)/i;
const MAX_STRING_LEN = 10_000;

/**
 * Recursively sanitize a request body for storage.
 *  - Drop sensitive keys at any nesting depth.
 *  - Truncate long strings (replace tail with "[…+N chars]").
 *  - Pass through primitives.
 */
function sanitizePayload(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizePayload);
  }
  if (value !== null && typeof value === "object" && !(value instanceof Date)) {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (SENSITIVE_KEY_RE.test(k)) {
        out[k] = "<redacted>";
        continue;
      }
      out[k] = sanitizePayload(v);
    }
    return out;
  }
  if (typeof value === "string" && value.length > MAX_STRING_LEN) {
    return `${value.slice(0, MAX_STRING_LEN)}[…+${value.length - MAX_STRING_LEN} chars]`;
  }
  return value;
}

/**
 * Derive a stable, low-cardinality action name from method + URL path.
 * Uses the last URL segment so a route like /admin/send-promo becomes
 * "send-promo".
 */
function actionFromRequest(req) {
  const path = (req.baseUrl || "") + (req.path || req.originalUrl || "");
  const lastSeg = path.split("?")[0].split("/").filter(Boolean).pop() || "unknown";
  return `${req.method} ${lastSeg}`.toLowerCase();
}

/**
 * Express middleware. Place AFTER verifyToken + requireRole("admin").
 * Records the action when the response is finalized — including 4xx/5xx —
 * so attempts that 400'd are auditable too.
 */
function auditAdminAction(req, res, next) {
  const adminUserId = req.user?.id;
  // No admin user → upstream middleware should have rejected. Just skip.
  if (!adminUserId) return next();

  const finished = false;
  res.on("finish", () => {
    if (finished) return;
    const action = actionFromRequest(req);
    const payload = sanitizePayload(req.body || {});
    const ip = req.ip || req.headers["x-forwarded-for"] || null;
    const ua = (req.headers["user-agent"] || "").slice(0, 500); // bounded

    // status 4xx/5xx → still log, but tag in payload for easier triage
    payload.__response_status = res.statusCode;

    query(
      `INSERT INTO admin_audit_log (admin_user_id, action, payload, ip, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [adminUserId, action, payload, ip, ua],
    ).catch((err) => {
      console.error(
        `[admin-audit] insert failed for action=${action} admin=${adminUserId}:`,
        err.message,
      );
    });
  });

  next();
}

module.exports = { auditAdminAction, sanitizePayload, actionFromRequest };
