/**
 * Migration 0012 column-rename alignment tests (Wave 1.5).
 *
 * Migration 0012 renamed three scenario_sessions columns:
 *   coach_feedback   → feedback_summary
 *   turn_count       → total_turns
 *   word_count       → total_user_words
 *
 * The repository code drifted — SQL referenced the OLD names while the DB
 * carries the NEW ones, causing "column does not exist" 500 errors on every
 * endSession call in prod. These tests pin the SQL contract so any future
 * regression is caught at unit-test time, before it reaches production.
 *
 * Layered:
 *   1. Repository SQL strings — assert UPDATE / SELECT use the NEW column
 *      names and that the OLD names are absent (no AS aliases either).
 *   2. Service field-mapping  — getSessionDetail reads `session.feedback_summary`
 *      etc. from the row, not the old keys.
 */

"use strict";

jest.mock("../src/config/db", () => ({
  query: jest.fn(),
  pool: { connect: jest.fn() },
}));

const db = require("../src/config/db");

beforeEach(() => {
  db.query.mockReset();
});

// ---------------------------------------------------------------------------
// 1. Repository SQL contract
// ---------------------------------------------------------------------------

describe("scenarioRepository.completeSession — UPDATE uses new column names", () => {
  it("references feedback_summary / total_turns / total_user_words in the UPDATE clause", async () => {
    db.query.mockResolvedValue({
      rows: [{
        id: "sess-1",
        feedback_summary: "Good fluency",
        total_turns: 8,
        total_user_words: 142,
        status: "completed",
      }],
    });
    const repo = require("../src/repositories/scenarioRepository");

    await repo.completeSession("sess-1", {
      overallScore: 80,
      fluencyScore: 75,
      vocabularyScore: 80,
      grammarScore: 78,
      coachFeedback: "Nice work",
      turnCount: 8,
      wordCount: 142,
      durationMs: 60_000,
    });

    expect(db.query).toHaveBeenCalledTimes(1);
    const sql = db.query.mock.calls[0][0];

    // Must use NEW column names
    expect(sql).toMatch(/SET[\s\S]*\bfeedback_summary\s*=/);
    expect(sql).toMatch(/\btotal_turns\s*=/);
    expect(sql).toMatch(/\btotal_user_words\s*=/);

    // Must NOT use OLD column names anywhere in the SQL — no aliases, no
    // "AS feedback_summary" tricks. Strict word-boundary assertions catch
    // accidental partial matches.
    expect(sql).not.toMatch(/\bcoach_feedback\b/);
    expect(sql).not.toMatch(/\bturn_count\b/);
    // word_count is a generic term; for the scenario_sessions UPDATE we only
    // care that the local SET clause does not reference it.
    expect(sql).not.toMatch(/\bword_count\s*=/);

    // Param order unchanged — JS-side scores.coachFeedback still binds to $6.
    const params = db.query.mock.calls[0][1];
    expect(params[5]).toBe("Nice work");
    expect(params[6]).toBe(8);
    expect(params[7]).toBe(142);
  });
});

describe("scenarioRepository.findSessionsByUser — SELECT uses new column names", () => {
  it("selects total_turns / total_user_words directly (no pre-0012 alias)", async () => {
    db.query.mockResolvedValue({ rows: [] });
    const repo = require("../src/repositories/scenarioRepository");

    await repo.findSessionsByUser("user-1", 20);

    const sql = db.query.mock.calls[0][0];
    expect(sql).toMatch(/\bss\.total_turns\b/);
    expect(sql).toMatch(/\bss\.total_user_words\b/);

    // Must NOT use OLD column names — even with an AS alias.
    expect(sql).not.toMatch(/\bss\.turn_count\b/);
    expect(sql).not.toMatch(/\bss\.word_count\b/);
    expect(sql).not.toMatch(/\bcoach_feedback\b/);
  });
});

// ---------------------------------------------------------------------------
// 2. Service field-mapping
// ---------------------------------------------------------------------------

describe("scenarioService.getSessionDetail — reads new column names from row", () => {
  it("maps session.feedback_summary / total_turns / total_user_words → API fields", async () => {
    jest.resetModules();
    jest.doMock("../src/config/db", () => ({
      query: jest.fn(),
      pool: { connect: jest.fn() },
    }));
    jest.doMock("../src/repositories/scenarioRepository", () => ({
      findSessionById: jest.fn().mockResolvedValue({
        id: "sess-1",
        scenario_id: "sc-1",
        title: "Café Order",
        emoji: "☕",
        category: "daily",
        status: "completed",
        user_id: "user-1",
        overall_score: 80,
        fluency_score: 75,
        vocabulary_score: 80,
        grammar_score: 78,
        // NEW column names — what migration 0012 produces.
        feedback_summary: "Solid pacing, watch articles.",
        total_turns: 8,
        total_user_words: 142,
        duration_ms: 60_000,
        started_at: new Date(),
        completed_at: new Date(),
      }),
      findSessionTurns: jest.fn().mockResolvedValue([]),
    }));

    const { getSessionDetail } = require("../src/services/scenarioService");
    const result = await getSessionDetail("sess-1", "user-1");

    expect(result.coachFeedback).toBe("Solid pacing, watch articles.");
    expect(result.turnCount).toBe(8);
    expect(result.wordCount).toBe(142);
    // Negative: the service must NOT silently drop these to undefined just
    // because the row is missing the OLD keys.
    expect(result.coachFeedback).toBeDefined();
    expect(result.turnCount).toBeDefined();
    expect(result.wordCount).toBeDefined();
  });
});
