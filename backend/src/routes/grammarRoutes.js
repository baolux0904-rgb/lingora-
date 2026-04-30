"use strict";

/**
 * routes/grammarRoutes.js
 *
 * Mounted at /api/v1/grammar. All endpoints require a valid JWT;
 * userId is taken from req.user.id, never the body.
 */

const express = require("express");
const { verifyToken } = require("../middleware/auth");
const grammarController = require("../controllers/grammarController");

const router = express.Router();

router.get("/progress",                verifyToken, grammarController.getProgress);
router.post("/progress/lesson",        verifyToken, grammarController.recordLesson);
router.post("/progress/exam",          verifyToken, grammarController.recordExam);
router.post("/backfill",               verifyToken, grammarController.backfill);

module.exports = router;
