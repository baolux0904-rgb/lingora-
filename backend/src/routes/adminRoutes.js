/**
 * routes/adminRoutes.js — Admin-only endpoints.
 *
 * Mounted at /api/v1/admin in app.js.
 * All routes require verifyToken + requireRole("admin").
 */

const { Router } = require("express");
const { verifyToken, requireRole } = require("../middleware/auth");
const { adminWriteLimiters } = require("../middleware/rateLimiters");
const { auditAdminAction } = require("../middleware/adminAudit");
const { sendSuccess, sendError } = require("../response");
const { query } = require("../config/db");
const { sendPromoEmail, sendFeatureAnnouncementEmail } = require("../services/emailService");

const router = Router();

router.use(verifyToken);
router.use(requireRole("admin"));
// Wave 1.7: every admin action is rate-limited (compromise = mass-spam
// vector reaching every user) and audited (compliance + reversibility).
router.use(...adminWriteLimiters);
router.use(auditAdminAction);

/**
 * POST /api/v1/admin/send-promo
 *
 * Body: { userIds?: string[], all?: boolean, discountPercent: number, discountCode: string }
 */
router.post("/send-promo", async (req, res, next) => {
  try {
    const { userIds, all, discountPercent, discountCode } = req.body;

    if (!discountCode || !discountPercent) {
      return sendError(res, { status: 400, message: "discountCode and discountPercent are required." });
    }

    let users;
    if (all) {
      const result = await query(`SELECT id, email, name FROM users WHERE deleted_at IS NULL AND email IS NOT NULL`);
      users = result.rows;
    } else if (userIds && userIds.length > 0) {
      const result = await query(`SELECT id, email, name FROM users WHERE id = ANY($1) AND deleted_at IS NULL`, [userIds]);
      users = result.rows;
    } else {
      return sendError(res, { status: 400, message: "Provide userIds array or set all: true." });
    }

    // Send emails in background (non-blocking)
    let sentCount = 0;
    for (const user of users) {
      await sendPromoEmail(user, discountCode, discountPercent);
      sentCount++;
    }

    return sendSuccess(res, {
      data: { sentCount, totalUsers: users.length },
      message: `Promo emails sent to ${sentCount} users.`,
    });
  } catch (err) { next(err); }
});

/**
 * POST /api/v1/admin/send-announcement
 *
 * Body: { featureName: string, description: string, userIds?: string[], all?: boolean }
 */
router.post("/send-announcement", async (req, res, next) => {
  try {
    const { featureName, description, userIds, all } = req.body;

    if (!featureName || !description) {
      return sendError(res, { status: 400, message: "featureName and description are required." });
    }

    let users;
    if (all) {
      const result = await query(`SELECT id, email, name FROM users WHERE deleted_at IS NULL AND email IS NOT NULL`);
      users = result.rows;
    } else if (userIds && userIds.length > 0) {
      const result = await query(`SELECT id, email, name FROM users WHERE id = ANY($1) AND deleted_at IS NULL`, [userIds]);
      users = result.rows;
    } else {
      return sendError(res, { status: 400, message: "Provide userIds array or set all: true." });
    }

    await sendFeatureAnnouncementEmail(users, featureName, description);

    return sendSuccess(res, {
      data: { totalUsers: users.length },
      message: `Announcement sent to ${users.length} users.`,
    });
  } catch (err) { next(err); }
});

module.exports = router;
