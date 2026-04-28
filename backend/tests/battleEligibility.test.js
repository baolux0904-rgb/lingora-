/**
 * Battle 5-practice gate (Wave 2.5).
 *
 * Verifies:
 *   1. checkBattleEligibility counts xp_ledger rows where reason =
 *      'reading_practice_complete' (and ONLY that reason).
 *   2. The threshold is the locked BATTLE_PRACTICE_GATE constant.
 *   3. joinQueue / createDirectChallenge / acceptChallenge all reject
 *      with status=403 and code='BATTLE_GATE_PRACTICE_REQUIRED' when a
 *      user is below the gate, before touching any matchmaking state.
 *   4. Above the gate, the existing flow proceeds (queue/challenge ok).
 */

"use strict";

jest.mock("../src/config/db", () => ({ query: jest.fn() }));

jest.mock("../src/repositories/battleRepository", () => ({
  getOrCreatePlayerProfile: jest.fn(),
  getCurrentSeason:         jest.fn(),
  findQueuedMatch:          jest.fn(),
  addParticipant:           jest.fn(),
  updateMatchStatus:        jest.fn(),
  getMatchById:             jest.fn(),
  getPassageWithQuestionsForBattle: jest.fn(),
  getPassageForUser:        jest.fn(),
  createMatch:              jest.fn(),
  cancelQueuedMatchForUser: jest.fn(),
}));

jest.mock("../src/repositories/socialRepository", () => ({
  getUserById:        jest.fn(),
  createNotification: jest.fn(),
}));

const { query } = require("../src/config/db");
const repo      = require("../src/repositories/battleRepository");
const battleService = require("../src/services/battleService");
const { BATTLE_PRACTICE_GATE, BATTLE_GATE_ERROR_CODE } = require("../src/domain/battleGate");

const USER_ID   = "00000000-0000-0000-0000-000000000001";
const TARGET_ID = "00000000-0000-0000-0000-000000000002";
const MATCH_ID  = "00000000-0000-0000-0000-0000000000aa";

beforeEach(() => {
  query.mockReset();
  for (const fn of Object.values(repo)) fn.mockReset?.();
});

// Helper — first DB call is always the eligibility COUNT.
function stubEligibility(completed) {
  query.mockResolvedValueOnce({ rows: [{ completed }] });
}

// ---------------------------------------------------------------------------
// checkBattleEligibility — count semantics
// ---------------------------------------------------------------------------

describe("checkBattleEligibility", () => {
  it("counts rows where reason = 'reading_practice_complete' (and only those)", async () => {
    stubEligibility(3);

    const r = await battleService.checkBattleEligibility(USER_ID);

    expect(r).toEqual({ eligible: false, completed: 3, required: BATTLE_PRACTICE_GATE });

    const [sql, args] = query.mock.calls[0];
    expect(sql).toMatch(/SELECT\s+COUNT\(\*\)::int\s+AS\s+completed/i);
    expect(sql).toMatch(/FROM\s+xp_ledger/i);
    expect(sql).toMatch(/reason\s*=\s*'reading_practice_complete'/i);
    expect(args).toEqual([USER_ID]);
  });

  it("eligible=false at exactly required-1 (4)", async () => {
    stubEligibility(4);
    const r = await battleService.checkBattleEligibility(USER_ID);
    expect(r.eligible).toBe(false);
    expect(r.completed).toBe(4);
  });

  it("eligible=true at exactly required (5)", async () => {
    stubEligibility(5);
    const r = await battleService.checkBattleEligibility(USER_ID);
    expect(r.eligible).toBe(true);
    expect(r.completed).toBe(5);
  });

  it("eligible=true above required (10)", async () => {
    stubEligibility(10);
    const r = await battleService.checkBattleEligibility(USER_ID);
    expect(r.eligible).toBe(true);
  });

  it("returns 0 when COUNT returns no row (defensive)", async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const r = await battleService.checkBattleEligibility(USER_ID);
    expect(r).toEqual({ eligible: false, completed: 0, required: BATTLE_PRACTICE_GATE });
  });

  it("threshold is the constant from domain/battleGate.js (locked at 5)", () => {
    expect(BATTLE_PRACTICE_GATE).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// Entry-site enforcement
// ---------------------------------------------------------------------------

describe("joinQueue — gate", () => {
  it("rejects with 403 + code when user is below the gate", async () => {
    stubEligibility(2);

    await expect(battleService.joinQueue(USER_ID, "ranked"))
      .rejects.toMatchObject({
        status: 403,
        code:   BATTLE_GATE_ERROR_CODE,
        data:   { completed: 2, required: 5 },
      });

    // No matchmaking state was touched.
    expect(repo.getOrCreatePlayerProfile).not.toHaveBeenCalled();
  });

  it("proceeds normally above the gate", async () => {
    stubEligibility(5);
    repo.getOrCreatePlayerProfile.mockResolvedValueOnce({
      current_rank_tier: "iron", current_rank_points: 0,
    });
    repo.getCurrentSeason.mockResolvedValueOnce({ id: "s1" });
    // No active match.
    query.mockResolvedValueOnce({ rows: [] });
    repo.findQueuedMatch.mockResolvedValueOnce(null);
    repo.getPassageForUser.mockResolvedValueOnce("passage-1");
    repo.createMatch.mockResolvedValueOnce({ id: "m1" });

    const result = await battleService.joinQueue(USER_ID, "ranked");

    expect(result.status).toBe("queued");
    expect(repo.createMatch).toHaveBeenCalled();
  });
});

describe("createDirectChallenge — gate", () => {
  it("rejects with 403 + code below the gate", async () => {
    // self-check passes (different ids), then eligibility query fires.
    stubEligibility(0);

    await expect(battleService.createDirectChallenge(USER_ID, TARGET_ID))
      .rejects.toMatchObject({ status: 403, code: BATTLE_GATE_ERROR_CODE });

    expect(repo.createMatch).not.toHaveBeenCalled();
  });
});

describe("acceptChallenge — gate", () => {
  it("rejects with 403 + code below the gate (match exists, queued)", async () => {
    repo.getMatchById.mockResolvedValueOnce({ id: MATCH_ID, status: "queued" });
    stubEligibility(1);

    await expect(battleService.acceptChallenge(USER_ID, MATCH_ID))
      .rejects.toMatchObject({ status: 403, code: BATTLE_GATE_ERROR_CODE });

    expect(repo.addParticipant).not.toHaveBeenCalled();
  });
});
