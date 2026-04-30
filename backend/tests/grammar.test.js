/**
 * Grammar progress tests (Wave 5.4.5).
 *
 * Two layers:
 *   1. domain — pure XP-tier helpers in grammarService (computeLessonXp,
 *      computeExamXp). No mocks needed.
 *   2. integration — controller path through service via supertest with
 *      mocked DB + auth + xpService, mirroring the onboardingSelfReport
 *      pattern. We verify:
 *        - ownership (userId always from req.user, never body)
 *        - input validation (score range, types)
 *        - xp_ledger emit invocation shape (reason + ref_id contract)
 *        - replay safety (awardXp returning awarded:false → row
 *          xp_earned increment is 0)
 *        - bulk backfill skip-existing semantics
 */

"use strict";

jest.mock("../src/config/db", () => ({ query: jest.fn() }));
jest.mock("../src/middleware/auth", () => ({
  verifyToken: (req, _res, next) => {
    req.user = { id: "00000000-0000-0000-0000-000000000001", role: "kid", is_pro: false };
    next();
  },
}));
jest.mock("../src/services/xpService", () => ({
  awardXp: jest.fn(),
}));

const request = require("supertest");
const express = require("express");
const { query } = require("../src/config/db");
const { awardXp } = require("../src/services/xpService");
const grammarRoutes = require("../src/routes/grammarRoutes");
const grammarService = require("../src/services/grammarService");

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/grammar", grammarRoutes);
  app.use((err, _req, res, _next) => {
    res.status(err.status || 500).json({ success: false, message: err.message });
  });
  return app;
}

const USER_ID = "00000000-0000-0000-0000-000000000001";

beforeEach(() => {
  query.mockReset();
  awardXp.mockReset();
  // Default: awardXp accepts the grant.
  awardXp.mockResolvedValue({ awarded: true, delta: 0, ledgerId: "ledger-1" });
});

// ───────────────────────────────────────────────────────────── Domain

describe("grammarService — XP tier helpers", () => {
  it("lesson XP = 10 below perfect", () => {
    expect(grammarService.computeLessonXp(0)).toBe(10);
    expect(grammarService.computeLessonXp(80)).toBe(10);
    expect(grammarService.computeLessonXp(99)).toBe(10);
  });
  it("lesson XP = 15 at perfect (10 + 5 bonus)", () => {
    expect(grammarService.computeLessonXp(100)).toBe(15);
  });
  it("exam XP = 0 when not passed", () => {
    expect(grammarService.computeExamXp("present", false)).toBe(0);
  });
  it("unit exam XP = 20 when passed", () => {
    expect(grammarService.computeExamXp("present", true)).toBe(20);
  });
  it("final exam XP = 50 when passed", () => {
    expect(grammarService.computeExamXp("final", true)).toBe(50);
  });
});

// ──────────────────────────────────────────────────────── POST /lesson

describe("POST /api/v1/grammar/progress/lesson", () => {
  function mockUpsertReturnsInserted() {
    query.mockResolvedValueOnce({
      rows: [{
        id: "row-1", user_id: USER_ID, type: "lesson", item_id: "tense-present-1",
        score: 80, passed: null, xp_earned: 10,
        completed_at: new Date(), created_at: new Date(), updated_at: new Date(),
        inserted: true,
      }],
    });
  }

  it("rejects missing lessonId with 400", async () => {
    const res = await request(buildApp())
      .post("/api/v1/grammar/progress/lesson").send({ score: 80 });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_LESSON_ID");
  });

  it("rejects out-of-range score with 400", async () => {
    const res = await request(buildApp())
      .post("/api/v1/grammar/progress/lesson").send({ lessonId: "x", score: 150 });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_SCORE");
  });

  it("emits awardXp with reason='grammar_lesson_complete' and ref_id='lesson:<id>'", async () => {
    mockUpsertReturnsInserted();
    const res = await request(buildApp())
      .post("/api/v1/grammar/progress/lesson")
      .send({ lessonId: "tense-present-1", score: 80 });
    expect(res.status).toBe(200);
    expect(awardXp).toHaveBeenCalledTimes(1);
    expect(awardXp).toHaveBeenCalledWith(USER_ID, 10, "grammar_lesson_complete", "lesson:tense-present-1");
  });

  it("emits 15 XP at perfect score", async () => {
    mockUpsertReturnsInserted();
    await request(buildApp())
      .post("/api/v1/grammar/progress/lesson")
      .send({ lessonId: "x", score: 100 });
    expect(awardXp).toHaveBeenCalledWith(USER_ID, 15, "grammar_lesson_complete", "lesson:x");
  });

  it("on replay (awarded=false) records xp_earned=0 in the upsert", async () => {
    awardXp.mockResolvedValueOnce({ awarded: false, delta: 0, ledgerId: null });
    mockUpsertReturnsInserted();
    await request(buildApp())
      .post("/api/v1/grammar/progress/lesson")
      .send({ lessonId: "x", score: 100 });
    // The upsert is the single query call. Last argument is the values array.
    const upsertArgs = query.mock.calls[0][1];
    // Position 5 = xpEarned (0-indexed: userId, type, itemId, score, passed, xpEarned)
    expect(upsertArgs[5]).toBe(0);
  });
});

// ────────────────────────────────────────────────────────── POST /exam

describe("POST /api/v1/grammar/progress/exam", () => {
  function mockExamUpsert() {
    query.mockResolvedValueOnce({
      rows: [{
        id: "row-2", user_id: USER_ID, type: "exam", item_id: "topic-passive-voice",
        score: 80, passed: true, xp_earned: 20,
        completed_at: new Date(), created_at: new Date(), updated_at: new Date(),
        inserted: true,
      }],
    });
  }

  it("rejects non-boolean passed with 400", async () => {
    const res = await request(buildApp())
      .post("/api/v1/grammar/progress/exam")
      .send({ unitId: "x", score: 80, passed: "yes" });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_PASSED");
  });

  it("does NOT call awardXp when passed=false (no XP for failed exam)", async () => {
    mockExamUpsert();
    await request(buildApp())
      .post("/api/v1/grammar/progress/exam")
      .send({ unitId: "topic-passive-voice", score: 50, passed: false });
    expect(awardXp).not.toHaveBeenCalled();
  });

  it("emits 20 XP for unit exam when passed", async () => {
    mockExamUpsert();
    await request(buildApp())
      .post("/api/v1/grammar/progress/exam")
      .send({ unitId: "topic-passive-voice", score: 80, passed: true });
    expect(awardXp).toHaveBeenCalledWith(USER_ID, 20, "grammar_exam_complete", "exam:topic-passive-voice");
  });

  it("emits 50 XP for final exam when passed", async () => {
    mockExamUpsert();
    await request(buildApp())
      .post("/api/v1/grammar/progress/exam")
      .send({ unitId: "final", score: 90, passed: true });
    expect(awardXp).toHaveBeenCalledWith(USER_ID, 50, "grammar_exam_complete", "exam:final");
  });
});

// ──────────────────────────────────────────────────── GET /progress

describe("GET /api/v1/grammar/progress", () => {
  it("returns the user's progress in the FE-shape (lessonResults/examResults/totalXp)", async () => {
    query.mockResolvedValueOnce({
      rows: [
        { type: "lesson", item_id: "L1", score: 90, passed: null, xp_earned: 10, completed_at: new Date("2026-01-01") },
        { type: "exam",   item_id: "E1", score: 80, passed: true, xp_earned: 20, completed_at: new Date("2026-01-02") },
      ],
    });
    const res = await request(buildApp()).get("/api/v1/grammar/progress");
    expect(res.status).toBe(200);
    expect(res.body.data.lessonResults).toHaveProperty("L1");
    expect(res.body.data.examResults).toHaveProperty("E1");
    expect(res.body.data.examResults.E1.passed).toBe(true);
    expect(res.body.data.totalXp).toBe(30);
  });
});

// ──────────────────────────────────────────────────────── POST /backfill

describe("POST /api/v1/grammar/backfill", () => {
  it("rejects non-object lessonResults with 400", async () => {
    const res = await request(buildApp())
      .post("/api/v1/grammar/backfill").send({ lessonResults: [1, 2, 3] });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_LESSON_RESULTS");
  });

  it("skips entries that already exist (idempotent rerun)", async () => {
    // findOne returns existing row → skipped.
    query.mockResolvedValueOnce({ rows: [{ id: "existing-1" }] }); // findOne lesson L1
    // Final getProgress call after writes — empty result is fine.
    query.mockResolvedValueOnce({ rows: [] });

    const res = await request(buildApp())
      .post("/api/v1/grammar/backfill")
      .send({ lessonResults: { L1: { score: 80 } }, examResults: {}, totalXp: 0 });
    expect(res.status).toBe(200);
    expect(res.body.data.skippedCount).toBe(1);
    expect(res.body.data.importedCount).toBe(0);
    // No xp_ledger emit on a skip.
    expect(awardXp).not.toHaveBeenCalled();
  });

  it("imports new entries and emits xp_ledger for each", async () => {
    // findOne lesson L1 → null → import path → upsert → ...
    query.mockResolvedValueOnce({ rows: [] }); // findOne lesson L1 — none
    query.mockResolvedValueOnce({                  // upsert L1
      rows: [{ id: "row-L1", inserted: true, type: "lesson", item_id: "L1", score: 80, xp_earned: 10, completed_at: new Date() }],
    });
    // findOne exam E1 → null → import path → upsert
    query.mockResolvedValueOnce({ rows: [] }); // findOne exam E1 — none
    query.mockResolvedValueOnce({                  // upsert E1
      rows: [{ id: "row-E1", inserted: true, type: "exam", item_id: "E1", score: 80, passed: true, xp_earned: 20, completed_at: new Date() }],
    });
    // Final getProgress
    query.mockResolvedValueOnce({
      rows: [
        { type: "lesson", item_id: "L1", score: 80, xp_earned: 10, completed_at: new Date() },
        { type: "exam",   item_id: "E1", score: 80, passed: true, xp_earned: 20, completed_at: new Date() },
      ],
    });

    const res = await request(buildApp())
      .post("/api/v1/grammar/backfill")
      .send({
        lessonResults: { L1: { score: 80 } },
        examResults:   { E1: { score: 80, passed: true } },
        totalXp: 30,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.importedCount).toBe(2);
    expect(res.body.data.skippedCount).toBe(0);
    // One emit per imported entry — replay safety still relies on
    // xp_ledger UNIQUE (covered separately in xpService tests).
    expect(awardXp).toHaveBeenCalledTimes(2);
  });
});
