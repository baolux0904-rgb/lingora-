/**
 * Answer-key leak tests (Wave 1, Task 1.2).
 *
 * Verifies that pre-submit client responses for Reading + Battle DO NOT
 * include `correct_answer`, `explanation`, `acceptable_answers`, or any
 * nested `correct_*` keys (e.g. options.correct_mapping,
 * blanks[].correct_answers). Server-side scoring paths must still see
 * the full row so scoring continues to work.
 *
 * Two layers:
 *   1. Pure helper — sanitizeQuestionsForExam input/output shape.
 *   2. Repository — getPassageWithQuestions vs getPassageWithQuestionsFor*
 *      verifies the wrapper strips while the raw fn preserves.
 *   3. Service — scoreSubmission still computes correct counts using the
 *      raw repo path (sanity that the safe variant did not rewire scoring).
 */

"use strict";

// ---------------------------------------------------------------------------
// 1. Pure helper
// ---------------------------------------------------------------------------

const { sanitizeQuestionsForExam, isSensitiveKey } = require("../src/utils/sanitize");

describe("sanitizeQuestionsForExam — pure helper", () => {
  it("strips top-level correct_answer + explanation + acceptable_answers", () => {
    const input = [{
      id: "q1",
      order_index: 1,
      type: "mcq",
      question_text: "What did the author say?",
      options: ["A", "B", "C"],
      correct_answer: "B",
      explanation: "Refer to paragraph 2.",
      acceptable_answers: ["b", "B."],
    }];
    const out = sanitizeQuestionsForExam(input);
    expect(out[0]).not.toHaveProperty("correct_answer");
    expect(out[0]).not.toHaveProperty("explanation");
    expect(out[0]).not.toHaveProperty("acceptable_answers");
    // Non-sensitive fields preserved.
    expect(out[0]).toMatchObject({
      id: "q1", order_index: 1, type: "mcq",
      question_text: "What did the author say?",
      options: ["A", "B", "C"],
    });
  });

  it("strips nested options.correct_mapping (matching question types)", () => {
    const input = [{
      id: "q2",
      type: "matching_headings",
      options: {
        headings: ["i", "ii", "iii"],
        paragraphs: ["A", "B"],
        correct_mapping: { A: "i", B: "iii" },
      },
    }];
    const out = sanitizeQuestionsForExam(input);
    expect(out[0].options).not.toHaveProperty("correct_mapping");
    expect(out[0].options).toMatchObject({
      headings: ["i", "ii", "iii"],
      paragraphs: ["A", "B"],
    });
  });

  it("strips nested blanks[].correct_answers (sentence/summary completion)", () => {
    const input = [{
      id: "q3",
      type: "sentence_completion",
      blanks: [
        { id: 1, max_words: 2, correct_answers: ["climate change", "global warming"] },
        { id: 2, max_words: 1, correct_answers: ["forest"] },
      ],
    }];
    const out = sanitizeQuestionsForExam(input);
    expect(out[0].blanks[0]).not.toHaveProperty("correct_answers");
    expect(out[0].blanks[1]).not.toHaveProperty("correct_answers");
    expect(out[0].blanks[0]).toMatchObject({ id: 1, max_words: 2 });
    expect(out[0].blanks[1]).toMatchObject({ id: 2, max_words: 1 });
  });

  it("does NOT mutate the input array or rows", () => {
    const input = [{ id: "q1", correct_answer: "B", explanation: "x" }];
    const inputClone = JSON.parse(JSON.stringify(input));
    sanitizeQuestionsForExam(input);
    expect(input).toEqual(inputClone);
    expect(input[0]).toHaveProperty("correct_answer", "B");
    expect(input[0]).toHaveProperty("explanation", "x");
  });

  it("returns [] for non-array inputs (defensive)", () => {
    expect(sanitizeQuestionsForExam(null)).toEqual([]);
    expect(sanitizeQuestionsForExam(undefined)).toEqual([]);
    expect(sanitizeQuestionsForExam({})).toEqual([]);
  });

  it("preserves Date and primitive values without mutation", () => {
    const d = new Date("2026-04-26T00:00:00Z");
    const input = [{
      id: "q4", created_at: d, display_order: 5,
      correct_answer: "X",
    }];
    const out = sanitizeQuestionsForExam(input);
    expect(out[0].created_at).toBe(d); // Date passed through (not deep-copied)
    expect(out[0].display_order).toBe(5);
    expect(out[0]).not.toHaveProperty("correct_answer");
  });

  it("isSensitiveKey matches correct_*, explanation, acceptable_answers (case-insensitive prefix)", () => {
    expect(isSensitiveKey("correct_answer")).toBe(true);
    expect(isSensitiveKey("correct_mapping")).toBe(true);
    expect(isSensitiveKey("correct_answers")).toBe(true);
    expect(isSensitiveKey("Correct_Answer")).toBe(true);
    expect(isSensitiveKey("explanation")).toBe(true);
    expect(isSensitiveKey("acceptable_answers")).toBe(true);
    // Negative cases:
    expect(isSensitiveKey("user_answer")).toBe(false);
    expect(isSensitiveKey("question_text")).toBe(false);
    expect(isSensitiveKey("incorrect_answer")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 2. Repository: ForExam / ForBattle wrappers strip; raw preserves
// ---------------------------------------------------------------------------

jest.mock("../src/config/db", () => ({
  query: jest.fn(),
  pool: {},
}));

// readingScoring is required at the top of readingRepository — keep real impl.

const { query } = require("../src/config/db");
const readingRepo = require("../src/repositories/readingRepository");
const battleRepo = require("../src/repositories/battleRepository");

describe("readingRepository wrappers", () => {
  beforeEach(() => { query.mockReset(); });

  it("getPassageWithQuestions returns raw rows (server-side use)", async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: "p1", topic: "art" }] })
      .mockResolvedValueOnce({ rows: [{
        id: "q1", correct_answer: "B", explanation: "see para 2",
        options: { correct_mapping: { A: "i" } },
      }] });

    const data = await readingRepo.getPassageWithQuestions("p1");
    expect(data.questions[0]).toHaveProperty("correct_answer", "B");
    expect(data.questions[0]).toHaveProperty("explanation");
    expect(data.questions[0].options).toHaveProperty("correct_mapping");
  });

  it("getPassageWithQuestionsForExam strips answer keys", async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: "p1", topic: "art" }] })
      .mockResolvedValueOnce({ rows: [{
        id: "q1", correct_answer: "B", explanation: "see para 2",
        options: { correct_mapping: { A: "i" } },
        acceptable_answers: ["b"],
      }] });

    const data = await readingRepo.getPassageWithQuestionsForExam("p1");
    expect(data.questions[0]).not.toHaveProperty("correct_answer");
    expect(data.questions[0]).not.toHaveProperty("explanation");
    expect(data.questions[0]).not.toHaveProperty("acceptable_answers");
    expect(data.questions[0].options).not.toHaveProperty("correct_mapping");
    // Non-sensitive fields preserved.
    expect(data.questions[0]).toHaveProperty("id", "q1");
    expect(data.passage).toHaveProperty("id", "p1");
  });
});

describe("battleRepository wrappers", () => {
  beforeEach(() => { query.mockReset(); });

  it("getPassageWithQuestions returns raw rows for server-side scoring", async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: "p1" }] })
      .mockResolvedValueOnce({ rows: [{ id: "q1", correct_answer: "C", explanation: "y" }] });

    const data = await battleRepo.getPassageWithQuestions("p1");
    expect(data.questions[0].correct_answer).toBe("C");
    expect(data.questions[0].explanation).toBe("y");
  });

  it("getPassageWithQuestionsForBattle strips answer keys (Battle pre-submit payload)", async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: "p1" }] })
      .mockResolvedValueOnce({ rows: [{
        id: "q1", correct_answer: "C", explanation: "y",
        options: { items: ["x"], correct_mapping: { 1: "x" } },
      }] });

    const data = await battleRepo.getPassageWithQuestionsForBattle("p1");
    expect(data.questions[0]).not.toHaveProperty("correct_answer");
    expect(data.questions[0]).not.toHaveProperty("explanation");
    expect(data.questions[0].options).toEqual({ items: ["x"] });
  });
});
