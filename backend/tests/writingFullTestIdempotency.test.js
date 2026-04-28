/**
 * Writing Full Test idempotency / content-theft fix (Wave 2.3, migration 0045).
 *
 * The bug: a Practice essay submitted in the morning could be returned
 * verbatim as the result of an unrelated Full Test essay later the same
 * day, because the day-level idempotency slot was keyed on
 * (user_id, task_type, day) without distinguishing the entry mode.
 *
 * Fix verified here:
 *   1. submitEssay propagates `source` through to repo lookup AND insert.
 *   2. Practice and Full Test on the same day with the same content
 *      produce two separate submissions.
 *   3. Practice double-submit (same source, same day) still hits the
 *      idempotency cache and returns the existing submission.
 *   4. The Full Test path (writingFullTestService.submitTask) calls into
 *      submitEssay with `source: "full_test"`.
 *   5. submitEssay rejects an unknown source — defends the CHECK
 *      constraint at the service layer.
 */

"use strict";

jest.mock("../src/repositories/writingRepository", () => ({
  createSubmission:        jest.fn(),
  findTodaySubmission:     jest.fn(),
  incrementUsageCount:     jest.fn().mockResolvedValue(undefined),
  getTodayUsageCount:      jest.fn().mockResolvedValue(0),
  updateSubmissionResult:  jest.fn().mockResolvedValue(undefined),
  getSubmissionById:       jest.fn(),
}));

jest.mock("../src/repositories/writingFullTestRepository", () => ({
  getRunById:     jest.fn(),
  linkSubmission: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../src/repositories/writingQuestionsRepository", () => ({
  upsertAttempt: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../src/providers/ai/writingAnalyzer", () => ({
  analyzeEssay: jest.fn().mockRejectedValue(new Error("mocked — fire-and-forget")),
}));

jest.mock("../src/services/limitService", () => ({
  checkWritingLimit: jest.fn().mockResolvedValue({ allowed: true, used: 0, limit: 1 }),
}));

jest.mock("../src/services/streakService", () => ({ updateStreak: jest.fn().mockResolvedValue(undefined) }));
jest.mock("../src/services/xpService",     () => ({ awardXp:      jest.fn().mockResolvedValue({ awarded: false }) }));
jest.mock("../src/repositories/userRepository", () => ({ updateUserBand: jest.fn().mockResolvedValue(undefined) }));
jest.mock("../src/services/studyRoomService",   () => ({ onUserCompletedActivity: jest.fn().mockResolvedValue(undefined) }));

const writingRepo     = require("../src/repositories/writingRepository");
const fullTestRepo    = require("../src/repositories/writingFullTestRepository");
const writingService  = require("../src/services/writingService");
const fullTestService = require("../src/services/writingFullTestService");

const USER_ID  = "00000000-0000-0000-0000-000000000001";
const RUN_ID   = "00000000-0000-0000-0000-000000000099";
const VALID_ESSAY = Array.from({ length: 260 }, (_, i) => `word${i}`).join(" ");

beforeEach(() => {
  writingRepo.createSubmission.mockReset();
  writingRepo.findTodaySubmission.mockReset();
  fullTestRepo.getRunById.mockReset();
  fullTestRepo.linkSubmission.mockClear();

  writingRepo.findTodaySubmission.mockResolvedValue(null);
  writingRepo.createSubmission.mockResolvedValue({ id: "new-sub", status: "pending" });
});

// ---------------------------------------------------------------------------
// Repo argument propagation
// ---------------------------------------------------------------------------

describe("writingService.submitEssay — source propagation", () => {
  it("default source is 'practice' (no caller-supplied value)", async () => {
    await writingService.submitEssay(USER_ID, "kid", true, {
      taskType: "task2", questionText: "Q", essayText: VALID_ESSAY,
    });

    expect(writingRepo.findTodaySubmission).toHaveBeenCalledWith(USER_ID, "task2", "practice");
    expect(writingRepo.createSubmission).toHaveBeenCalledWith(
      USER_ID, "task2", "Q", VALID_ESSAY, expect.any(Number), null, "practice",
    );
  });

  it("explicit source='full_test' is forwarded to BOTH lookup and insert", async () => {
    await writingService.submitEssay(USER_ID, "kid", true, {
      taskType: "task1", questionText: "Q1", essayText: VALID_ESSAY, source: "full_test",
    });

    expect(writingRepo.findTodaySubmission).toHaveBeenCalledWith(USER_ID, "task1", "full_test");
    expect(writingRepo.createSubmission).toHaveBeenCalledWith(
      USER_ID, "task1", "Q1", VALID_ESSAY, expect.any(Number), null, "full_test",
    );
  });

  it("rejects unknown source values (defends CHECK constraint at service layer)", async () => {
    await expect(writingService.submitEssay(USER_ID, "kid", true, {
      taskType: "task2", questionText: "Q", essayText: VALID_ESSAY, source: "exam",
    })).rejects.toThrow(/Invalid source/);

    expect(writingRepo.createSubmission).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// The actual content-theft scenario
// ---------------------------------------------------------------------------

describe("Practice + Full Test cohabitation on the same calendar day", () => {
  it("Full Test submission ignores an existing Practice submission of the same task today", async () => {
    // findTodaySubmission for ('task1', 'practice')  → returns the Practice row
    // findTodaySubmission for ('task1', 'full_test') → returns null (no Full Test yet)
    writingRepo.findTodaySubmission.mockImplementation((_userId, _taskType, source) =>
      Promise.resolve(source === "practice"
        ? { id: "practice-morning-id", status: "completed" }
        : null),
    );
    writingRepo.createSubmission.mockResolvedValueOnce({ id: "fulltest-afternoon-id", status: "pending" });

    const result = await writingService.submitEssay(USER_ID, "kid", true, {
      taskType: "task1",
      questionText: "Full test prompt",
      essayText: VALID_ESSAY,
      source: "full_test",
    });

    expect(result.submissionId).toBe("fulltest-afternoon-id");
    expect(result.status).toBe("pending");
    expect(writingRepo.findTodaySubmission).toHaveBeenCalledWith(USER_ID, "task1", "full_test");
    expect(writingRepo.createSubmission).toHaveBeenCalledTimes(1);
  });

  it("Practice double-submit on the same day still returns the cached row (source-scoped idempotency intact)", async () => {
    writingRepo.findTodaySubmission.mockResolvedValueOnce({ id: "practice-cached", status: "completed" });

    const result = await writingService.submitEssay(USER_ID, "kid", true, {
      taskType: "task1", questionText: "Q", essayText: VALID_ESSAY, // default practice
    });

    expect(result).toEqual({ submissionId: "practice-cached", status: "completed" });
    expect(writingRepo.createSubmission).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Full Test path enforces source='full_test'
// ---------------------------------------------------------------------------

describe("writingFullTestService.submitTask → writingService.submitEssay", () => {
  it("passes source='full_test' through to submitEssay", async () => {
    fullTestRepo.getRunById
      .mockResolvedValueOnce({
        id: RUN_ID, user_id: USER_ID, status: "in_progress",
        task1_submission_id: null, task2_submission_id: null,
      })
      .mockResolvedValueOnce({
        id: RUN_ID, user_id: USER_ID, status: "in_progress",
        task1_submission_id: "new-sub", task2_submission_id: null,
      });

    writingRepo.createSubmission.mockResolvedValueOnce({ id: "new-sub", status: "pending" });

    await fullTestService.submitTask(USER_ID, RUN_ID, {
      taskType:    "task1",
      questionText: "Full Test Task 1 prompt",
      essayText:    VALID_ESSAY,
      role:         "kid",
      isPro:        true,
    });

    // Confirm the source argument made it all the way to the repo lookup AND insert.
    expect(writingRepo.findTodaySubmission).toHaveBeenCalledWith(USER_ID, "task1", "full_test");
    expect(writingRepo.createSubmission).toHaveBeenCalledWith(
      USER_ID, "task1", "Full Test Task 1 prompt", VALID_ESSAY, expect.any(Number), null, "full_test",
    );
  });
});
