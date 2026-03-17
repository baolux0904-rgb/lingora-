/**
 * controllers/gamificationController.js
 *
 * HTTP layer for per-user gamification data.
 * Returns XP summary, streak, and badge collection for a given user.
 */

const UUID_RE                = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const { getXpSummary }      = require('../services/xpService');
const { getStreakSummary }  = require('../services/streakService');
const { listUserBadges }    = require('../services/badgeService');
const { sendSuccess }       = require('../response');

/**
 * GET /api/v1/users/:userId/gamification
 *
 * Protected endpoint — requires a valid JWT (verifyToken applied in routes).
 * Users may only fetch their own gamification data (enforced here).
 */
async function getUserGamification(req, res, next) {
  try {
    const { userId } = req.params;

    if (!UUID_RE.test(userId)) {
      const err = new Error('Invalid userId — must be a UUID');
      err.status = 400;
      return next(err);
    }

    // Users can only read their own data.
    if (req.user.id !== userId) {
      const err = new Error('Forbidden — you may only read your own gamification data');
      err.status = 403;
      return next(err);
    }

    // Fetch XP, streak and badges in parallel — all go through the service layer.
    const [xp, streak, badges] = await Promise.all([
      getXpSummary(userId),
      getStreakSummary(userId),
      listUserBadges(userId),
    ]);

    return sendSuccess(res, {
      message: 'Gamification data',
      data:    { xp, streak, badges },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getUserGamification };
