/**
 * routes/onboardingRoutes.js
 */

const { Router } = require("express");
const { verifyToken } = require("../middleware/auth");
const c = require("../controllers/onboardingController");

const router = Router();

router.get("/onboarding/status", verifyToken, c.getStatus);
router.post("/onboarding/complete", verifyToken, c.complete);
router.post("/onboarding/skip", verifyToken, c.skip);

module.exports = router;
