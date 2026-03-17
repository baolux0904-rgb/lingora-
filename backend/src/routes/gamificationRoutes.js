/**
 * routes/gamificationRoutes.js
 *
 * Gamification endpoints (XP, streaks, badges) for individual users.
 */

const { Router }              = require('express');
const { getUserGamification } = require('../controllers/gamificationController');
const { getMetrics }          = require('../controllers/pronunciationController');
const { verifyToken }         = require('../middleware/auth');

const router = Router();

// GET /api/v1/users/:userId/gamification
router.get('/:userId/gamification', verifyToken, getUserGamification);

// GET /api/v1/users/:userId/pronunciation/metrics
router.get('/:userId/pronunciation/metrics', verifyToken, getMetrics);

module.exports = router;
