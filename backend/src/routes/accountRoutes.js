/**
 * routes/accountRoutes.js
 *
 * Account self-management endpoints. Mounted under /api/v1/users.
 *
 *   DELETE /me — Soft-delete the authenticated user's account (Wave 2.7,
 *                PDPL VN). Body: { confirm_text: "XÓA" }.
 *
 * Future endpoints (email change, username change) will land here too —
 * see Wave 2.10 / 2.11.
 */

"use strict";

const { Router } = require("express");
const { verifyToken } = require("../middleware/auth");
const { accountDeletionLimiter } = require("../middleware/rateLimiters");
const { deleteAccount } = require("../controllers/accountController");

const router = Router();

router.delete("/me", verifyToken, accountDeletionLimiter, deleteAccount);

module.exports = router;
