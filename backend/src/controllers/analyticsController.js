"use strict";

/**
 * controllers/analyticsController.js
 *
 * Thin HTTP layer over analyticsRepository. The real work — PII
 * rejection, size caps, key limits — lives in domain/analyticsGuard.
 *
 * Auth: optionalAuth populates req.user when a JWT is present;
 * anonymous tracking is supported and is the default.
 */

const { sendSuccess, sendError } = require("../response");
const guard = require("../domain/analyticsGuard");
const analyticsRepo = require("../repositories/analyticsRepository");

async function track(req, res, next) {
  try {
    const body = req.body ?? {};

    // event_name may arrive as `event` (the FE wrapper sends `event`).
    // Accept both so we don't break the existing client contract.
    const rawEventName = body.event_name ?? body.event;
    const nameCheck = guard.validateEventName(rawEventName);
    if (!nameCheck.ok) {
      return sendError(res, { status: 400, message: nameCheck.message, code: nameCheck.code });
    }

    // session_id is required. The FE wrapper currently doesn't send one
    // (Wave 1.x), so fall back to a stable per-request placeholder. The
    // FE should be updated to ship a real session_id; until then anon
    // tracking still works without dropping events.
    const rawSessionId = body.session_id ?? body.sessionId ?? "unknown";
    const sidCheck = guard.validateSessionId(rawSessionId);
    if (!sidCheck.ok) {
      return sendError(res, { status: 400, message: sidCheck.message, code: sidCheck.code });
    }

    const propsCheck = guard.sanitiseProperties(body.properties);
    if (!propsCheck.ok) {
      return sendError(res, { status: 400, message: propsCheck.message, code: propsCheck.code });
    }

    await analyticsRepo.insertEvent({
      event_name: nameCheck.value,
      properties: propsCheck.properties,
      user_id: req.user?.id ?? null,
      session_id: sidCheck.value,
    });

    // Fire-and-forget contract: no event id returned, just an ack.
    return sendSuccess(res, { data: { ok: true }, message: "Tracked" });
  } catch (err) {
    next(err);
  }
}

module.exports = { track };
