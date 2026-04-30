"use strict";

/**
 * controllers/grammarController.js
 *
 * Thin HTTP layer over grammarService. All endpoints require auth
 * (verifyToken in routes); userId is always derived from req.user.id
 * — never from the request body, even on backfill.
 *
 * Validation is shallow on purpose: item_id is an opaque FE-defined
 * string and we accept any non-empty string. Score is bounded by the
 * DB CHECK constraint (0..100) — the controller validates the type
 * and range to give a friendlier 400 instead of a 500 from a DB
 * violation.
 */

const grammarService = require("../services/grammarService");
const { sendSuccess, sendError } = require("../response");

function isValidScore(score) {
  return typeof score === "number" && Number.isFinite(score) && score >= 0 && score <= 100;
}

function isNonEmptyString(s) {
  return typeof s === "string" && s.trim().length > 0;
}

async function getProgress(req, res, next) {
  try {
    const data = await grammarService.getProgress(req.user.id);
    return sendSuccess(res, { data, message: "Grammar progress retrieved" });
  } catch (err) { next(err); }
}

async function recordLesson(req, res, next) {
  try {
    const { lessonId, score } = req.body ?? {};
    if (!isNonEmptyString(lessonId)) {
      return sendError(res, { status: 400, message: "lessonId required", code: "INVALID_LESSON_ID" });
    }
    if (!isValidScore(score)) {
      return sendError(res, { status: 400, message: "score must be 0..100", code: "INVALID_SCORE" });
    }
    const result = await grammarService.recordLessonComplete(req.user.id, lessonId.trim(), Math.round(score));
    return sendSuccess(res, { data: result, message: "Lesson progress recorded" });
  } catch (err) { next(err); }
}

async function recordExam(req, res, next) {
  try {
    const { unitId, score, passed } = req.body ?? {};
    if (!isNonEmptyString(unitId)) {
      return sendError(res, { status: 400, message: "unitId required", code: "INVALID_UNIT_ID" });
    }
    if (!isValidScore(score)) {
      return sendError(res, { status: 400, message: "score must be 0..100", code: "INVALID_SCORE" });
    }
    if (typeof passed !== "boolean") {
      return sendError(res, { status: 400, message: "passed must be boolean", code: "INVALID_PASSED" });
    }
    const result = await grammarService.recordExamComplete(req.user.id, unitId.trim(), Math.round(score), passed);
    return sendSuccess(res, { data: result, message: "Exam progress recorded" });
  } catch (err) { next(err); }
}

async function backfill(req, res, next) {
  try {
    const { lessonResults, examResults, totalXp } = req.body ?? {};
    if (lessonResults != null && (typeof lessonResults !== "object" || Array.isArray(lessonResults))) {
      return sendError(res, { status: 400, message: "lessonResults must be an object", code: "INVALID_LESSON_RESULTS" });
    }
    if (examResults != null && (typeof examResults !== "object" || Array.isArray(examResults))) {
      return sendError(res, { status: 400, message: "examResults must be an object", code: "INVALID_EXAM_RESULTS" });
    }
    const result = await grammarService.importBulk(req.user.id, { lessonResults, examResults, totalXp });
    return sendSuccess(res, { data: result, message: "Grammar backfill complete" });
  } catch (err) { next(err); }
}

module.exports = { getProgress, recordLesson, recordExam, backfill };
