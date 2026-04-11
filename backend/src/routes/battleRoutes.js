/**
 * routes/battleRoutes.js
 *
 * IELTS Battle system endpoints. All routes require JWT authentication.
 */

const { Router } = require("express");
const { verifyToken } = require("../middleware/auth");
const c = require("../controllers/battleController");

const router = Router();

// Queue
router.post("/queue/join", verifyToken, c.joinQueue);
router.post("/queue/leave", verifyToken, c.leaveQueue);

// Matches
router.get("/matches/:matchId", verifyToken, c.getMatch);
router.post("/matches/:matchId/submit", verifyToken, c.submitMatch);
router.get("/matches/:matchId/result", verifyToken, c.getResult);

// Profile + Leaderboard
router.get("/profile/me", verifyToken, c.getProfile);
router.get("/leaderboard", verifyToken, c.getLeaderboard);

// Direct challenges
router.post("/challenges", verifyToken, c.createChallenge);
router.post("/challenges/:id/accept", verifyToken, c.acceptChallenge);

// Home (profile + recent + leaderboard preview)
router.get("/home", verifyToken, c.getHome);

module.exports = router;
