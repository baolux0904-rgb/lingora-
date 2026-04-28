/**
 * routes/profileRoutes.js
 *
 * User profile endpoints: update, avatar, stats, public view.
 */

const { Router } = require("express");
const { verifyToken, optionalAuth } = require("../middleware/auth");
const { avatarUploadLimiters } = require("../middleware/rateLimiters");
const c = require("../controllers/profileController");

const router = Router();

// Private (auth required)
router.post("/users/profile", verifyToken, c.updateProfile);
router.post("/users/avatar", verifyToken, ...avatarUploadLimiters, c.uploadAvatar);
router.get("/users/profile/stats", verifyToken, c.getProfileStats);
// Wave 2.8: visibility toggle
router.patch("/users/me/visibility", verifyToken, c.updateVisibility);

// Public — optionalAuth identifies friend/self viewers without forcing
// login. Anonymous visitors fall through with req.user = null.
router.get("/profile/:username", optionalAuth, c.getPublicProfile);

module.exports = router;
