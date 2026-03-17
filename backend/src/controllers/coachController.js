/**
 * controllers/coachController.js
 *
 * HTTP layer for the AI Study Coach endpoints.
 * Validates input, delegates to coachService, and formats responses.
 */

const UUID_RE                     = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const { sendSuccess }             = require('../response');
const { getFocusRecommendations } = require('../services/coachService');

// ---------------------------------------------------------------------------
// GET /api/v1/users/:userId/coach/focus
// ---------------------------------------------------------------------------

/**
 * Returns 0–2 prioritised focus recommendations for the authenticated user.
 *
 * Security: userId from the URL is validated against the JWT (req.user.id).
 * A user can only request their own recommendations.
 */
async function getFocus(req, res, next) {
  try {
    const { userId } = req.params;

    if (!UUID_RE.test(userId)) {
      const err = new Error('Invalid userId — must be a UUID');
      err.status = 400;
      return next(err);
    }

    if (req.user.id !== userId) {
      const err = new Error('Forbidden — you may only read your own focus data');
      err.status = 403;
      return next(err);
    }

    const recommendations = await getFocusRecommendations(userId);

    return sendSuccess(res, {
      message: "Today's focus",
      data:    { recommendations },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getFocus };
