/**
 * routes/profileRoutes.js
 *
 * User profile endpoints: update, avatar, stats, public view.
 */

const { Router } = require("express");
const { verifyToken } = require("../middleware/auth");
const { avatarUploadLimiters } = require("../middleware/rateLimiters");
const c = require("../controllers/profileController");

const router = Router();

// Private (auth required)
router.post("/users/profile", verifyToken, c.updateProfile);
router.post("/users/avatar", verifyToken, ...avatarUploadLimiters, c.uploadAvatar);
router.get("/users/profile/stats", verifyToken, c.getProfileStats);

// Public
router.get("/profile/:username", c.getPublicProfile);

module.exports = router;
