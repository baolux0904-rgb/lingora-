/**
 * Streak timezone unit tests (Wave 2 task 2.1).
 *
 * Verifies streakService computes calendar days in Asia/Ho_Chi_Minh, not UTC.
 * The DB driver is mocked so each "today_vn" can be controlled per-case —
 * we don't need a live Postgres to test the service-layer branch logic.
 *
 * Branches under test:
 *   - first ever activity      → streak = 1, changed = true
 *   - same VN day              → no change, changed = false (idempotent)
 *   - exactly +1 VN day        → streak + 1, longest updated if exceeded
 *   - gap ≥ 2 VN days          → reset to 1
 *   - getStreakSummary alive   → diffDays ≤ 1 returns currentStreak
 *   - getStreakSummary dead    → diffDays > 1 zeroes currentStreak
 */

"use strict";

jest.mock("../src/repositories/streakRepository", () => ({
  getVietnamToday: jest.fn(),
  getStreak:       jest.fn(),
  upsertStreak:    jest.fn(),
}));

const repo = require("../src/repositories/streakRepository");
const { updateStreak, getStreakSummary } = require("../src/services/streakService");

beforeEach(() => {
  repo.getVietnamToday.mockReset();
  repo.getStreak.mockReset();
  repo.upsertStreak.mockReset();
});

// ---------------------------------------------------------------------------
// updateStreak
// ---------------------------------------------------------------------------

describe("streakService.updateStreak (Asia/Ho_Chi_Minh)", () => {
  it("first-ever activity inserts streak=1 with VN today", async () => {
    repo.getVietnamToday.mockResolvedValue({ today_vn: "2026-04-27", seconds_until_midnight: 60_000 });
    repo.getStreak.mockResolvedValue(null);
    repo.upsertStreak.mockResolvedValue({
      current_streak: 1, longest_streak: 1, last_activity_at: "2026-04-27",
    });

    const result = await updateStreak("u1");

    expect(repo.upsertStreak).toHaveBeenCalledWith("u1", 1, 1, "2026-04-27");
    expect(result).toEqual({
      currentStreak: 1, longestStreak: 1, lastActivityAt: "2026-04-27", changed: true,
    });
  });

  it("same VN day → no change, changed=false (idempotent)", async () => {
    repo.getVietnamToday.mockResolvedValue({ today_vn: "2026-04-27", seconds_until_midnight: 1 });
    repo.getStreak.mockResolvedValue({
      current_streak: 5, longest_streak: 9, last_activity_at: "2026-04-27",
    });

    const result = await updateStreak("u1");

    expect(repo.upsertStreak).not.toHaveBeenCalled();
    expect(result).toEqual({
      currentStreak: 5, longestStreak: 9, lastActivityAt: "2026-04-27", changed: false,
    });
  });

  it("exactly +1 VN day → streak +1 (and longest grows if exceeded)", async () => {
    repo.getVietnamToday.mockResolvedValue({ today_vn: "2026-04-27", seconds_until_midnight: 1 });
    repo.getStreak.mockResolvedValue({
      current_streak: 9, longest_streak: 9, last_activity_at: "2026-04-26",
    });
    repo.upsertStreak.mockResolvedValue({
      current_streak: 10, longest_streak: 10, last_activity_at: "2026-04-27",
    });

    const result = await updateStreak("u1");

    expect(repo.upsertStreak).toHaveBeenCalledWith("u1", 10, 10, "2026-04-27");
    expect(result.currentStreak).toBe(10);
    expect(result.longestStreak).toBe(10);
    expect(result.changed).toBe(true);
  });

  it("gap ≥ 2 VN days → reset to 1, longest preserved", async () => {
    repo.getVietnamToday.mockResolvedValue({ today_vn: "2026-04-27", seconds_until_midnight: 1 });
    repo.getStreak.mockResolvedValue({
      current_streak: 12, longest_streak: 12, last_activity_at: "2026-04-25",
    });
    repo.upsertStreak.mockResolvedValue({
      current_streak: 1, longest_streak: 12, last_activity_at: "2026-04-27",
    });

    const result = await updateStreak("u1");

    expect(repo.upsertStreak).toHaveBeenCalledWith("u1", 1, 12, "2026-04-27");
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(12);
  });

  // Edge: VN day boundary. UTC sees 23:59 on day A and 00:01 on day A+1
  // collapse into a single day around 17:00 UTC; in VN they are clearly two
  // separate calendar days. Repository computes today_vn in SQL — so as long
  // as the service trusts that string, +1 is awarded correctly.
  it("23:59 VN day-A activity then 00:01 VN day-(A+1) activity → +1 streak", async () => {
    // First call (day A) — already covered by "first-ever" path; here we
    // verify only the SECOND call's increment, since the first commits row.
    repo.getVietnamToday.mockResolvedValue({ today_vn: "2026-04-28", seconds_until_midnight: 86_399 });
    repo.getStreak.mockResolvedValue({
      current_streak: 1, longest_streak: 1, last_activity_at: "2026-04-27",
    });
    repo.upsertStreak.mockResolvedValue({
      current_streak: 2, longest_streak: 2, last_activity_at: "2026-04-28",
    });

    const result = await updateStreak("u1");

    expect(result.currentStreak).toBe(2);
    expect(result.changed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getStreakSummary
// ---------------------------------------------------------------------------

describe("streakService.getStreakSummary (Asia/Ho_Chi_Minh)", () => {
  it("no streak row → zeros + todayVn + secondsUntilVnMidnight", async () => {
    repo.getVietnamToday.mockResolvedValue({ today_vn: "2026-04-27", seconds_until_midnight: 7200 });
    repo.getStreak.mockResolvedValue(null);

    const result = await getStreakSummary("u1");

    expect(result).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      lastActivityAt: null,
      todayVn: "2026-04-27",
      secondsUntilVnMidnight: 7200,
    });
  });

  it("alive (last_activity = today) → currentStreak preserved", async () => {
    repo.getVietnamToday.mockResolvedValue({ today_vn: "2026-04-27", seconds_until_midnight: 100 });
    repo.getStreak.mockResolvedValue({
      current_streak: 5, longest_streak: 9, last_activity_at: "2026-04-27",
    });

    const result = await getStreakSummary("u1");

    expect(result.currentStreak).toBe(5);
    expect(result.longestStreak).toBe(9);
    expect(result.lastActivityAt).toBe("2026-04-27");
    expect(result.todayVn).toBe("2026-04-27");
  });

  it("alive (last_activity = yesterday) → currentStreak preserved", async () => {
    repo.getVietnamToday.mockResolvedValue({ today_vn: "2026-04-27", seconds_until_midnight: 100 });
    repo.getStreak.mockResolvedValue({
      current_streak: 5, longest_streak: 9, last_activity_at: "2026-04-26",
    });

    const result = await getStreakSummary("u1");

    expect(result.currentStreak).toBe(5);
  });

  it("dead (gap ≥ 2 VN days) → currentStreak zeroed, longest preserved", async () => {
    repo.getVietnamToday.mockResolvedValue({ today_vn: "2026-04-27", seconds_until_midnight: 100 });
    repo.getStreak.mockResolvedValue({
      current_streak: 12, longest_streak: 12, last_activity_at: "2026-04-25",
    });

    const result = await getStreakSummary("u1");

    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(12);
    expect(result.lastActivityAt).toBe("2026-04-25");
  });
});
