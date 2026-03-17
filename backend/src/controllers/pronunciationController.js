/**
 * controllers/pronunciationController.js
 *
 * HTTP layer for pronunciation practice endpoints.
 * All routes are JWT-protected (verifyToken middleware).
 */

const mediaService = require("../services/mediaService");
const pronunciationService = require("../services/pronunciationService");
const { sendSuccess, sendError } = require("../response");

// UUID v4 pattern
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ---------------------------------------------------------------------------
// POST /api/v1/pronunciation/upload-url
// ---------------------------------------------------------------------------

/**
 * Generate a pre-signed upload URL for an audio recording.
 *
 * Body: { promptId: UUID, contentType?: string }
 * Response: { uploadUrl: string, storageKey: string }
 */
async function getUploadUrl(req, res, next) {
  try {
    const { promptId, contentType } = req.body;
    const userId = req.user.id;

    if (!promptId || !UUID_RE.test(promptId)) {
      return sendError(res, { status: 400, message: "Valid promptId (UUID) is required" });
    }

    const result = await mediaService.getUploadUrl(
      userId,
      promptId,
      contentType || "audio/webm"
    );

    return sendSuccess(res, {
      data: result,
      message: "Upload URL generated",
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// POST /api/v1/pronunciation/assess
// ---------------------------------------------------------------------------

/**
 * Run pronunciation assessment on an uploaded audio recording.
 *
 * Body: { lessonId: UUID, promptId: UUID, storageKey: string, audioDurationMs?: number }
 * Response: PronunciationResult
 */
async function assess(req, res, next) {
  try {
    const { lessonId, promptId, storageKey, audioDurationMs } = req.body;
    const userId = req.user.id;

    if (!lessonId || !UUID_RE.test(lessonId)) {
      return sendError(res, { status: 400, message: "Valid lessonId (UUID) is required" });
    }
    if (!promptId || !UUID_RE.test(promptId)) {
      return sendError(res, { status: 400, message: "Valid promptId (UUID) is required" });
    }
    if (!storageKey || typeof storageKey !== "string") {
      return sendError(res, { status: 400, message: "storageKey is required" });
    }

    const durationMs =
      audioDurationMs != null ? Math.round(Number(audioDurationMs)) : null;

    const result = await pronunciationService.assess(
      userId,
      lessonId,
      promptId,
      storageKey,
      durationMs
    );

    return sendSuccess(res, {
      data: result,
      message: "Pronunciation assessed",
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// GET /api/v1/pronunciation/history/:promptId
// ---------------------------------------------------------------------------

/**
 * Get pronunciation attempt history for a prompt.
 *
 * Response: { attempts: PronunciationAttemptResult[] }
 */
async function getHistory(req, res, next) {
  try {
    const { promptId } = req.params;
    const userId = req.user.id;

    if (!UUID_RE.test(promptId)) {
      return sendError(res, { status: 400, message: "Valid promptId (UUID) is required" });
    }

    const attempts = await pronunciationService.getAttemptsByPrompt(userId, promptId);

    return sendSuccess(res, {
      data: { attempts },
      message: "History retrieved",
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// GET /api/v1/users/:userId/pronunciation/metrics
// ---------------------------------------------------------------------------

/**
 * Get speaking metrics (score trend, totals) for a user over the last 30 days.
 * Users may only view their own metrics.
 */
async function getMetrics(req, res, next) {
  try {
    const { userId } = req.params;

    if (!UUID_RE.test(userId)) {
      return sendError(res, { status: 400, message: "Valid userId (UUID) is required" });
    }

    if (req.user.id !== userId) {
      const err = new Error("Forbidden — you may only view your own metrics");
      err.status = 403;
      throw err;
    }

    const metrics = await pronunciationService.getMetrics(userId);

    return sendSuccess(res, {
      data:    metrics,
      message: "Speaking metrics retrieved",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUploadUrl,
  assess,
  getHistory,
  getMetrics,
};
