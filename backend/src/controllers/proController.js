/**
 * controllers/proController.js
 *
 * Pro subscription status, trial start, and placeholder payment.
 */

const { query } = require("../config/db");
const { sendSuccess, sendError } = require("../response");
const { getLimit } = require("../domain/limits");
const { FREE_TRIAL_DAYS, FREE_TRIAL_MS } = require("../domain/freeTrial");

// Limits come from domain/limits.js so the value advertised here can never
// drift from what gets enforced. Pre-Wave 2.4 these were `const = 3` and
// `const = 1`, while the actual gate enforced 1 + 1.
const FREE_SPEAKING_LIMIT = getLimit("free", "speaking").perDay;
const FREE_WRITING_LIMIT  = getLimit("free", "writing").perDay;

async function getProStatus(req, res, next) {
  try {
    const userId = req.user.id;

    const [userRow, speakingRow, writingRow] = await Promise.all([
      query(`SELECT is_pro, trial_expires_at FROM users WHERE id = $1`, [userId]),
      query(
        `SELECT COUNT(*)::int AS count FROM scenario_sessions
          WHERE user_id = $1 AND started_at >= CURRENT_DATE`,
        [userId]
      ),
      query(
        `SELECT writing_count FROM writing_usage
          WHERE user_id = $1 AND date = CURRENT_DATE`,
        [userId]
      ),
    ]);

    const user = userRow.rows[0];
    if (!user) return sendError(res, { status: 404, message: "User not found" });

    // Check if trial is still active
    const trialActive = user.trial_expires_at && new Date(user.trial_expires_at) > new Date();
    const isPro = user.is_pro === true || trialActive;

    return sendSuccess(res, {
      data: {
        is_pro: isPro,
        is_trial: trialActive && !user.is_pro,
        trial_expires_at: user.trial_expires_at,
        daily_limits: {
          speaking_used: speakingRow.rows[0]?.count ?? 0,
          speaking_limit: isPro ? null : FREE_SPEAKING_LIMIT,
          writing_used: writingRow.rows[0]?.writing_count ?? 0,
          writing_limit: isPro ? null : FREE_WRITING_LIMIT,
        },
      },
      message: "Pro status retrieved",
    });
  } catch (err) { next(err); }
}

async function startTrial(req, res, next) {
  try {
    const userId = req.user.id;

    // Check if user already had a trial or is pro
    const userRow = await query(`SELECT is_pro, trial_expires_at FROM users WHERE id = $1`, [userId]);
    const user = userRow.rows[0];

    if (user.is_pro) return sendError(res, { status: 409, message: "Already a Pro user" });
    if (user.trial_expires_at) return sendError(res, { status: 409, message: "Trial already used" });

    const trialEnd = new Date(Date.now() + FREE_TRIAL_MS);
    await query(
      `UPDATE users SET trial_expires_at = $2, updated_at = now() WHERE id = $1`,
      [userId, trialEnd]
    );

    return sendSuccess(res, {
      data: { trial_expires_at: trialEnd.toISOString(), is_pro: true, is_trial: true },
      status: 201,
      message: `Trial started — ${FREE_TRIAL_DAYS} days free`,
    });
  } catch (err) { next(err); }
}

/**
 * upgradePlaceholder — DISABLED until MoMo integration ships.
 *
 * Pre-Wave-1.6 this endpoint flipped users.is_pro = true with no payment
 * verification — anyone could become Pro by POSTing to /users/upgrade.
 * That was a placeholder waiting on MoMo. We close the window now (with
 * the launch deadline approaching) by returning 503; the legitimate
 * 3-day trial via /start-trial is unaffected.
 *
 * When MoMo lands (Wave 2 / pre-launch), replace this body with the
 * real flow: validate MoMo confirmation → INSERT payment_orders row
 * → UPDATE users.is_pro + subscription_expires_at.
 *
 * Closes 1 P0 (Audit Batch 1): proController upgrade bypass.
 */
async function upgradePlaceholder(req, res, next) {
  try {
    const userId = req.user?.id;
    console.warn(
      `[pro-upgrade] attempt blocked user=${userId || "unknown"} ip=${req.ip || "unknown"}`,
    );
    return sendError(res, {
      status: 503,
      message: "Tính năng nâng cấp Pro sắp ra mắt. Vui lòng quay lại sau khi tích hợp thanh toán hoàn tất.",
      code: "PRO_UPGRADE_NOT_AVAILABLE",
    });
  } catch (err) { next(err); }
}

async function getDailyLimits(req, res, next) {
  try {
    const { getDailyLimits: fetchLimits } = require("../services/limitService");
    const limits = await fetchLimits(req.user.id);
    return sendSuccess(res, { data: limits, message: "Daily limits retrieved" });
  } catch (err) { next(err); }
}

async function getAchievements(req, res, next) {
  try {
    const { getAchievementsData } = require("../services/badgeService");
    const data = await getAchievementsData(req.user.id);
    return sendSuccess(res, { data, message: "Achievements retrieved" });
  } catch (err) { next(err); }
}

module.exports = { getProStatus, startTrial, upgradePlaceholder, getDailyLimits, getAchievements };
