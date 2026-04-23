/**
 * Unit tests for the Writing Full Test hourly expiry sweep.
 * Pure expireOverdueRuns({ repo, service }) — fakes injected so the
 * test never touches Postgres or the real service layer.
 */

"use strict";

const { expireOverdueRuns } = require("../../src/jobs/fullTestExpiry");

function fakeRepo(rows) {
  const calls = { markExpired: [], listed: false };
  return {
    calls,
    async listOverdueInProgress() {
      calls.listed = true;
      return rows;
    },
    async markExpired(id, elapsed) {
      calls.markExpired.push({ id, elapsed });
      return { id, status: "expired" };
    },
  };
}

function fakeService() {
  const calls = { finalize: [] };
  return {
    calls,
    async finalize(userId, runId) {
      calls.finalize.push({ userId, runId });
      return { id: runId, status: "submitted" };
    },
  };
}

describe("expireOverdueRuns", () => {
  it("0-task run → markExpired, no finalize", async () => {
    const repo = fakeRepo([
      {
        id: "r-0",
        user_id: "u-1",
        task1_submission_id: null,
        task2_submission_id: null,
        started_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
    ]);
    const svc = fakeService();
    const res = await expireOverdueRuns({ repo, service: svc, expiryHours: 3 });
    expect(res).toMatchObject({ overdueCount: 1, finalized: 0, expired: 1, failed: 0 });
    expect(repo.calls.markExpired).toHaveLength(1);
    expect(svc.calls.finalize).toHaveLength(0);
  });

  it("1-task partial run → markExpired (not finalized)", async () => {
    const repo = fakeRepo([
      {
        id: "r-1",
        user_id: "u-1",
        task1_submission_id: "sub-a",
        task2_submission_id: null,
        started_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
    ]);
    const svc = fakeService();
    const res = await expireOverdueRuns({ repo, service: svc, expiryHours: 3 });
    expect(res.expired).toBe(1);
    expect(res.finalized).toBe(0);
    expect(repo.calls.markExpired[0].id).toBe("r-1");
  });

  it("2-task fully-ready run → finalize, not markExpired", async () => {
    const repo = fakeRepo([
      {
        id: "r-2",
        user_id: "u-7",
        task1_submission_id: "sub-a",
        task2_submission_id: "sub-b",
        started_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
    ]);
    const svc = fakeService();
    const res = await expireOverdueRuns({ repo, service: svc, expiryHours: 3 });
    expect(res.finalized).toBe(1);
    expect(res.expired).toBe(0);
    expect(svc.calls.finalize).toEqual([{ userId: "u-7", runId: "r-2" }]);
    expect(repo.calls.markExpired).toHaveLength(0);
  });

  it("mixed batch + service failure is counted but doesn't break the sweep", async () => {
    const repo = fakeRepo([
      { id: "r-ok", user_id: "u", task1_submission_id: "a", task2_submission_id: "b", started_at: new Date(0).toISOString() },
      { id: "r-bad", user_id: "u", task1_submission_id: null, task2_submission_id: null, started_at: new Date(0).toISOString() },
    ]);
    const svc = fakeService();
    // Force the second markExpired to blow up so we verify the loop continues
    const brokenRepo = {
      ...repo,
      markExpired: jest.fn().mockRejectedValueOnce(new Error("db hiccup")),
    };
    const res = await expireOverdueRuns({ repo: brokenRepo, service: svc, expiryHours: 3 });
    expect(res.overdueCount).toBe(2);
    expect(res.finalized).toBe(1);
    expect(res.failed).toBe(1);
  });
});
