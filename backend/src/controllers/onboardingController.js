/**
 * controllers/onboardingController.js
 *
 * Onboarding flow: status check, complete, skip.
 */

const { query } = require("../config/db");
const { sendSuccess } = require("../response");

async function getStatus(req, res, next) {
  try {
    const result = await query(
      `SELECT has_completed_onboarding, target_band, onboarding_skipped FROM users WHERE id = $1`,
      [req.user.id]
    );
    const user = result.rows[0];
    return sendSuccess(res, {
      data: {
        has_completed_onboarding: user?.has_completed_onboarding ?? false,
        target_band: user?.target_band ? Number(user.target_band) : null,
        onboarding_skipped: user?.onboarding_skipped ?? false,
      },
      message: "Onboarding status",
    });
  } catch (err) { next(err); }
}

async function complete(req, res, next) {
  try {
    const { target_band } = req.body;
    await query(
      `UPDATE users SET has_completed_onboarding = true, target_band = $2, onboarding_skipped = false, updated_at = now() WHERE id = $1`,
      [req.user.id, target_band || null]
    );
    return sendSuccess(res, { message: "Onboarding completed" });
  } catch (err) { next(err); }
}

async function skip(req, res, next) {
  try {
    await query(
      `UPDATE users SET has_completed_onboarding = true, onboarding_skipped = true, updated_at = now() WHERE id = $1`,
      [req.user.id]
    );
    return sendSuccess(res, { message: "Onboarding skipped" });
  } catch (err) { next(err); }
}

module.exports = { getStatus, complete, skip };
