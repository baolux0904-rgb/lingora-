/**
 * controllers/battleController.js
 *
 * HTTP layer for IELTS Battle system.
 */

const battleService = require("../services/battleService");
const { sendSuccess, sendError } = require("../response");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function joinQueue(req, res, next) {
  try {
    const { mode } = req.body;
    if (mode && !["ranked", "unranked"].includes(mode)) {
      return sendError(res, { status: 400, message: "mode must be 'ranked' or 'unranked'" });
    }
    const result = await battleService.joinQueue(req.user.id, mode || "ranked");
    return sendSuccess(res, { data: result, status: 201, message: "Queue joined" });
  } catch (err) { next(err); }
}

async function leaveQueue(req, res, next) {
  try {
    const result = await battleService.leaveQueue(req.user.id);
    return sendSuccess(res, { data: result, message: "Left queue" });
  } catch (err) { next(err); }
}

async function getMatch(req, res, next) {
  try {
    const { matchId } = req.params;
    if (!UUID_RE.test(matchId)) return sendError(res, { status: 400, message: "Valid matchId required" });
    const result = await battleService.getMatchStatus(req.user.id, matchId);
    return sendSuccess(res, { data: result, message: "Match retrieved" });
  } catch (err) { next(err); }
}

async function submitMatch(req, res, next) {
  try {
    const { matchId } = req.params;
    if (!UUID_RE.test(matchId)) return sendError(res, { status: 400, message: "Valid matchId required" });

    const { answers, timeSeconds } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return sendError(res, { status: 400, message: "answers array is required" });
    }

    const result = await battleService.submitBattle(req.user.id, matchId, answers, timeSeconds);
    return sendSuccess(res, { data: result, message: "Submission received" });
  } catch (err) { next(err); }
}

async function getResult(req, res, next) {
  try {
    const { matchId } = req.params;
    if (!UUID_RE.test(matchId)) return sendError(res, { status: 400, message: "Valid matchId required" });
    const result = await battleService.getResult(req.user.id, matchId);
    return sendSuccess(res, { data: result, message: "Result retrieved" });
  } catch (err) { next(err); }
}

async function getProfile(req, res, next) {
  try {
    const result = await battleService.getProfile(req.user.id);
    return sendSuccess(res, { data: result, message: "Profile retrieved" });
  } catch (err) { next(err); }
}

async function getLeaderboard(req, res, next) {
  try {
    const scope = req.query.scope || "global";
    const result = await battleService.getLeaderboard(scope, req.user.id);
    return sendSuccess(res, { data: result, message: "Leaderboard retrieved" });
  } catch (err) { next(err); }
}

async function createChallenge(req, res, next) {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId || !UUID_RE.test(targetUserId)) {
      return sendError(res, { status: 400, message: "Valid targetUserId required" });
    }
    const result = await battleService.createDirectChallenge(req.user.id, targetUserId);
    return sendSuccess(res, { data: result, status: 201, message: "Challenge sent" });
  } catch (err) { next(err); }
}

async function acceptChallenge(req, res, next) {
  try {
    const { id } = req.params;
    if (!UUID_RE.test(id)) return sendError(res, { status: 400, message: "Valid challenge ID required" });
    const result = await battleService.acceptChallenge(req.user.id, id);
    return sendSuccess(res, { data: result, message: "Challenge accepted" });
  } catch (err) { next(err); }
}

async function getHome(req, res, next) {
  try {
    const result = await battleService.getHome(req.user.id);
    return sendSuccess(res, { data: result, message: "Battle home retrieved" });
  } catch (err) { next(err); }
}

async function getEligibility(req, res, next) {
  try {
    const result = await battleService.checkBattleEligibility(req.user.id);
    return sendSuccess(res, { data: result, message: "Battle eligibility" });
  } catch (err) { next(err); }
}

module.exports = {
  joinQueue, leaveQueue, getMatch, submitMatch, getResult,
  getProfile, getLeaderboard, createChallenge, acceptChallenge, getHome,
  getEligibility,
};
