/**
 * routes/scenarioRoutes.js
 *
 * Scenario speaking practice endpoints.
 * Public: list and view scenarios.
 * Protected (JWT): session management and conversation turns.
 *
 * IMPORTANT: /sessions routes are mounted BEFORE /:scenarioId
 * to prevent "sessions" from being captured as a scenarioId param.
 */

const { Router } = require("express");
const { verifyToken } = require("../middleware/auth");
const scenarioController = require("../controllers/scenarioController");

const router = Router();

// ---- Session routes (authenticated, MUST come before /:scenarioId) --------

// GET /api/v1/scenarios/sessions
router.get("/sessions", verifyToken, scenarioController.getUserSessions);

// GET /api/v1/scenarios/sessions/:sessionId
router.get("/sessions/:sessionId", verifyToken, scenarioController.getSession);

// POST /api/v1/scenarios/sessions/:sessionId/turns
router.post("/sessions/:sessionId/turns", verifyToken, scenarioController.submitTurn);

// POST /api/v1/scenarios/sessions/:sessionId/end
router.post("/sessions/:sessionId/end", verifyToken, scenarioController.endSession);

// ---- Scenario catalogue (public) -----------------------------------------

// GET /api/v1/scenarios
router.get("/", scenarioController.listScenarios);

// GET /api/v1/scenarios/:scenarioId
router.get("/:scenarioId", scenarioController.getScenario);

// ---- Start session (authenticated) ----------------------------------------

// POST /api/v1/scenarios/:scenarioId/start
router.post("/:scenarioId/start", verifyToken, scenarioController.startSession);

module.exports = router;
