/**
 * routes/publicRoutes.js
 *
 * Unauthenticated endpoints. Add cautiously — anything here is reachable
 * by unauthenticated visitors and should never expose user data.
 */

"use strict";

const { Router } = require("express");
const publicController = require("../controllers/publicController");

const router = Router();

// GET /api/v1/public/limits
router.get("/limits", publicController.getPublicLimits);

module.exports = router;
