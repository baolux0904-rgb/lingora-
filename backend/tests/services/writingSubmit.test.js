/**
 * Unit tests for writingService.submitEssay — covers the new
 * writing_question_id link path introduced by migration 0033.
 *
 * Mocks all side effects (repos, analyzer, streak/xp/badge services,
 * limit service, user band update) so the test isolates the link
 * behavior: does the submission carry the FK, and does the attempt
 * get its submission_id upserted?
 */

jest.mock("../../src/repositories/writingRepository", () => ({
  createSubmission: jest.fn(),
  incrementUsageCount: jest.fn().mockResolvedValue(undefined),
  findTodaySubmission: jest.fn().mockResolvedValue(null),
  getTodayUsageCount: jest.fn().mockResolvedValue(0),
  updateSubmissionResult: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../src/repositories/writingQuestionsRepository", () => ({
  upsertAttempt: jest.fn().mockResolvedValue(undefined),
}));

// The analyzer runs inside a fire-and-forget IIFE. Make it reject so we don't
// wait on a real OpenAI call — the test doesn't care about scoring output.
jest.mock("../../src/providers/ai/writingAnalyzer", () => ({
  analyzeEssay: jest.fn().mockRejectedValue(new Error("mocked — test doesn't await")),
}));

jest.mock("../../src/services/limitService", () => ({
  checkWritingLimit: jest.fn().mockResolvedValue({ allowed: true, used: 0, limit: 1 }),
}));

jest.mock("../../src/services/streakService", () => ({
  updateStreak: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../../src/services/xpService", () => ({
  awardXp: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../../src/repositories/userRepository", () => ({
  updateUserBand: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../../src/services/studyRoomService", () => ({
  onUserCompletedActivity: jest.fn().mockResolvedValue(undefined),
}));

const writingRepo = require("../../src/repositories/writingRepository");
const writingQuestionsRepo = require("../../src/repositories/writingQuestionsRepository");
const { submitEssay } = require("../../src/services/writingService");

const USER_ID = "00000000-0000-0000-0000-000000000001";
const QUESTION_ID = "00000000-0000-0000-0000-0000000000aa";
const SUBMISSION_ID = "00000000-0000-0000-0000-000000000042";

const VALID_ESSAY_TASK2 = Array.from({ length: 260 }, (_, i) => `word${i}`).join(" ");

beforeEach(() => {
  writingRepo.createSubmission.mockReset();
  writingRepo.createSubmission.mockResolvedValue({
    id: SUBMISSION_ID,
    status: "pending",
  });
  writingQuestionsRepo.upsertAttempt.mockClear();
  writingRepo.findTodaySubmission.mockResolvedValue(null);
});

describe("writingService.submitEssay — question link", () => {
  it("persists writingQuestionId on the submission and upserts the attempt", async () => {
    const res = await submitEssay(USER_ID, "kid", true, {
      taskType: "task2",
      questionText: "Some Task 2 question",
      essayText: VALID_ESSAY_TASK2,
      writingQuestionId: QUESTION_ID,
    });

    expect(res).toEqual({ submissionId: SUBMISSION_ID, status: "pending" });

    expect(writingRepo.createSubmission).toHaveBeenCalledWith(
      USER_ID, "task2", "Some Task 2 question", VALID_ESSAY_TASK2, expect.any(Number), QUESTION_ID
    );

    expect(writingQuestionsRepo.upsertAttempt).toHaveBeenCalledWith(
      USER_ID, QUESTION_ID, SUBMISSION_ID
    );
  });

  it("legacy path: omitting writingQuestionId still works and skips the attempt upsert", async () => {
    await submitEssay(USER_ID, "kid", true, {
      taskType: "task2",
      questionText: "Paste-your-own question",
      essayText: VALID_ESSAY_TASK2,
    });

    // createSubmission called with the 6th param as null
    expect(writingRepo.createSubmission).toHaveBeenCalledWith(
      USER_ID, "task2", "Paste-your-own question", VALID_ESSAY_TASK2, expect.any(Number), null
    );

    expect(writingQuestionsRepo.upsertAttempt).not.toHaveBeenCalled();
  });

  it("attempt upsert failure does not break the submit response", async () => {
    writingQuestionsRepo.upsertAttempt.mockRejectedValueOnce(new Error("transient DB hiccup"));

    const res = await submitEssay(USER_ID, "kid", true, {
      taskType: "task2",
      questionText: "Some Task 2 question",
      essayText: VALID_ESSAY_TASK2,
      writingQuestionId: QUESTION_ID,
    });

    expect(res.submissionId).toBe(SUBMISSION_ID);
    expect(writingQuestionsRepo.upsertAttempt).toHaveBeenCalledTimes(1);
  });

  it("idempotency: returning existing same-day submission skips both writes", async () => {
    writingRepo.findTodaySubmission.mockResolvedValueOnce({ id: "existing-id", status: "completed" });

    const res = await submitEssay(USER_ID, "kid", true, {
      taskType: "task2",
      questionText: "Some Task 2 question",
      essayText: VALID_ESSAY_TASK2,
      writingQuestionId: QUESTION_ID,
    });

    expect(res).toEqual({ submissionId: "existing-id", status: "completed" });
    expect(writingRepo.createSubmission).not.toHaveBeenCalled();
    expect(writingQuestionsRepo.upsertAttempt).not.toHaveBeenCalled();
  });
});
