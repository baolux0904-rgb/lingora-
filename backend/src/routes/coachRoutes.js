/**
 * routes/coachRoutes.js
 *
 * AI Study Coach endpoints.
 * Mounted at /api/v1/users in app.js (alongside gamificationRoutes).
 */

const { Router }    = require('express');
const { getFocus }  = require('../controllers/coachController');
const { verifyToken } = require('../middleware/auth');

const router = Router();

// GET /api/v1/users/:userId/coach/focus
router.get('/:userId/coach/focus', verifyToken, getFocus);

module.exports = router;
