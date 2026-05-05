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

// Wave 6 Sprint 4E.1 — defer is the new "Để sau" path. Distinct from
// /skip semantically: defer = "I'll do it later" (banner shows on
// /home, gate stays open); skip = legacy "I never want this" (banner
// hidden, gate treated as completed). Frontend swap from skip → defer
// happens Sprint 4E.2.
router.post("/onboarding/defer", verifyToken, c.defer);

module.exports = router;
