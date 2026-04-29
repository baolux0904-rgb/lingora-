/**
 * Username change + reserved list + cooldown + redirect grace.
 * Wave 2.11 — closes Wave 2.
 *
 * Three layers tested:
 *   1. Pure validators (domain/usernameValidation, domain/usernameChange).
 *   2. Service-layer setUsernameValidated re-auths the user, runs the
 *      cooldown check, and delegates the atomic write to the repo.
 *   3. Adversarial: case-insensitive reserved match, generic 400 on
 *      collision (no enumeration leak), SQL parameterization implicit
 *      via the DB-driver mock.
 */

"use strict";

jest.mock("../src/config/db", () => {
  const fakeClient = { query: jest.fn(), release: jest.fn() };
  return {
    query: jest.fn(),
    pool:  { connect: jest.fn(() => Promise.resolve(fakeClient)), on: jest.fn() },
    __fakeClient: fakeClient,
  };
});

const db = require("../src/config/db");
const { fakeClient } = (() => {
  const f = require("../src/config/db").__fakeClient;
  return { fakeClient: f };
})();

const { validateUsername, checkReserved, RESERVED_USERNAMES, RESERVED_PREFIXES } = require("../src/domain/usernameValidation");
const { canChangeUsername, redirectExpiresAt, COOLDOWN_DAYS, REDIRECT_GRACE_DAYS } = require("../src/domain/usernameChange");

beforeEach(() => {
  db.query.mockReset();
  fakeClient.query.mockReset();
  fakeClient.release.mockReset();
});

// ────────────────────────────────────────────────────────────────────────────
// 1. validateUsername — pure
// ────────────────────────────────────────────────────────────────────────────

describe("validateUsername — format gate", () => {
  it("accepts a healthy username", () => {
    expect(validateUsername("alice").valid).toBe(true);
    expect(validateUsername("a_b_c").valid).toBe(true);
    expect(validateUsername("123abc").valid).toBe(true);   // leading digit OK
    expect(validateUsername("_lead").valid).toBe(true);    // leading underscore OK
    expect(validateUsername("trail_").valid).toBe(true);   // trailing underscore OK
    expect(validateUsername("a__b").valid).toBe(true);     // double underscore OK
    expect(validateUsername("a".repeat(30)).valid).toBe(true); // boundary
  });

  it.each([
    ["",       "TOO_SHORT"],
    ["ab",     "TOO_SHORT"],
    ["a".repeat(31), "TOO_LONG"],
    ["with space",   "INVALID_CHARS"],
    ["dot.user",     "INVALID_CHARS"],
    ["dash-user",    "INVALID_CHARS"],
    ["có_dấu",       "INVALID_CHARS"],
  ])("rejects %s with %s", (input, code) => {
    const r = validateUsername(input);
    expect(r.valid).toBe(false);
    expect(r.errorCode).toBe(code);
  });

  it("rejects non-string input", () => {
    const r = validateUsername(null);
    expect(r.valid).toBe(false);
    expect(r.errorCode).toBe("INVALID_TYPE");
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 2. Reserved list — case-insensitive exact + prefix
// ────────────────────────────────────────────────────────────────────────────

describe("checkReserved", () => {
  it.each(["admin", "ADMIN", "Admin", "aDmIn", "support", "lingona", "lingora"])(
    "blocks %s as exact reserved (case-insensitive)",
    (input) => {
      const r = checkReserved(input);
      expect(r.reserved).toBe(true);
      expect(r.kind).toBe("exact");
    },
  );

  it.each(["deleted_abc12345", "DELETED_xyz", "user_42", "User_alice", "support_team"])(
    "blocks %s as reserved prefix",
    (input) => {
      const r = checkReserved(input);
      expect(r.reserved).toBe(true);
      expect(r.kind).toBe("prefix");
    },
  );

  it("allows non-reserved usernames", () => {
    expect(checkReserved("alice").reserved).toBe(false);
    expect(checkReserved("supportive").reserved).toBe(false); // not "support_*" prefix
    expect(checkReserved("delete_me").reserved).toBe(false); // missing trailing 'd'
  });

  it("validateUsername surfaces RESERVED vs RESERVED_PREFIX codes", () => {
    expect(validateUsername("admin").errorCode).toBe("RESERVED");
    expect(validateUsername("LINGONA").errorCode).toBe("RESERVED");
    expect(validateUsername("deleted_xyz").errorCode).toBe("RESERVED_PREFIX");
    expect(validateUsername("user_42").errorCode).toBe("RESERVED_PREFIX");
    expect(validateUsername("support_team").errorCode).toBe("RESERVED_PREFIX");
  });

  it("RESERVED_USERNAMES is frozen Set, RESERVED_PREFIXES frozen Array", () => {
    expect(Object.isFrozen(RESERVED_USERNAMES)).toBe(true);
    expect(Object.isFrozen(RESERVED_PREFIXES)).toBe(true);
    // Spec's 14 + brand variants + 7 obvious extras = 22 entries minimum.
    expect(RESERVED_USERNAMES.size).toBeGreaterThanOrEqual(22);
    expect(RESERVED_PREFIXES).toEqual(["deleted_", "user_", "support_"]);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 3. canChangeUsername — cooldown
// ────────────────────────────────────────────────────────────────────────────

describe("canChangeUsername — 30-day cooldown", () => {
  const NOW = new Date("2026-05-01T00:00:00Z");

  it("first-time setter (NULL) is always allowed", () => {
    expect(canChangeUsername({ last_username_change_at: null }, NOW))
      .toEqual({ allowed: true });
    expect(canChangeUsername({}, NOW))
      .toEqual({ allowed: true });
  });

  it("just-changed → not allowed, 30 days remaining", () => {
    const lastJustNow = NOW;
    const r = canChangeUsername({ last_username_change_at: lastJustNow }, NOW);
    expect(r.allowed).toBe(false);
    expect(r.retryAfterDays).toBe(COOLDOWN_DAYS);
  });

  it("29 days ago → not allowed, 1 day remaining (rounded up)", () => {
    const last = new Date(NOW.getTime() - 29 * 86400000 - 1000);
    const r = canChangeUsername({ last_username_change_at: last }, NOW);
    expect(r.allowed).toBe(false);
    expect(r.retryAfterDays).toBe(1);
  });

  it("31 days ago → allowed", () => {
    const last = new Date(NOW.getTime() - 31 * 86400000);
    const r = canChangeUsername({ last_username_change_at: last }, NOW);
    expect(r.allowed).toBe(true);
  });

  it("exactly 30 days ago → allowed (boundary)", () => {
    const last = new Date(NOW.getTime() - 30 * 86400000);
    const r = canChangeUsername({ last_username_change_at: last }, NOW);
    expect(r.allowed).toBe(true);
  });

  it("invalid stored value (string garbage) → fail-open allowed", () => {
    const r = canChangeUsername({ last_username_change_at: "not-a-date" }, NOW);
    expect(r.allowed).toBe(true);
  });

  it("ISO string parses correctly", () => {
    const r = canChangeUsername({ last_username_change_at: "2026-04-01T00:00:00Z" }, NOW);
    expect(r.allowed).toBe(true); // 30 days exactly elapsed
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 4. redirectExpiresAt — 7 days
// ────────────────────────────────────────────────────────────────────────────

describe("redirectExpiresAt", () => {
  it("returns now() + 7 days", () => {
    const NOW = new Date("2026-05-01T00:00:00Z");
    const exp = redirectExpiresAt(NOW);
    expect(exp.getTime() - NOW.getTime()).toBe(REDIRECT_GRACE_DAYS * 86400000);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 5. service.setUsernameValidated — full flow with mocked DB
// ────────────────────────────────────────────────────────────────────────────

describe("socialService.setUsernameValidated", () => {
  const USER_ID = "00000000-0000-0000-0000-000000000001";
  const { setUsernameValidated } = require("../src/services/socialService");

  function stubLastChange(value) {
    db.query.mockResolvedValueOnce({ rows: [{ username: "old_alice", last_username_change_at: value }] });
  }

  function stubAtomicHappy({ oldUsername = "old_alice", newUsername = "new_alice" } = {}) {
    fakeClient.query
      .mockResolvedValueOnce()                                        // BEGIN
      .mockResolvedValueOnce({ rows: [{ username: oldUsername }] })   // SELECT FOR UPDATE
      .mockResolvedValueOnce({ rowCount: 0 })                         // collision active user
      .mockResolvedValueOnce({ rowCount: 0 })                         // collision redirect
      .mockResolvedValueOnce()                                        // INSERT redirect (only if oldUsername)
      .mockResolvedValueOnce({ rows: [{ username: newUsername }] })   // UPDATE
      .mockResolvedValueOnce();                                       // COMMIT
  }

  it("rejects bad format with 400 + error code from validator", async () => {
    await expect(setUsernameValidated(USER_ID, "ab"))
      .rejects.toMatchObject({ status: 400, code: "TOO_SHORT" });
    expect(db.query).not.toHaveBeenCalled();
  });

  it("rejects reserved word with 400 RESERVED", async () => {
    await expect(setUsernameValidated(USER_ID, "admin"))
      .rejects.toMatchObject({ status: 400, code: "RESERVED" });
  });

  it("rejects reserved prefix with 400 RESERVED_PREFIX", async () => {
    await expect(setUsernameValidated(USER_ID, "deleted_abcd1234"))
      .rejects.toMatchObject({ status: 400, code: "RESERVED_PREFIX" });
  });

  it("rejects 404 when user row missing or deleted", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    await expect(setUsernameValidated(USER_ID, "alice2026"))
      .rejects.toMatchObject({ status: 404 });
  });

  it("rejects with 429 + retry_after_days when cooldown active", async () => {
    const recent = new Date(Date.now() - 5 * 86400000); // 5 days ago
    stubLastChange(recent);

    await expect(setUsernameValidated(USER_ID, "alice2026"))
      .rejects.toMatchObject({
        status: 429,
        code: "USERNAME_COOLDOWN",
        data: { retry_after_days: expect.any(Number) },
      });
  });

  it("happy path: NULL last_change → atomic write fires", async () => {
    stubLastChange(null);
    stubAtomicHappy({ oldUsername: "old_alice", newUsername: "alice2026" });

    const result = await setUsernameValidated(USER_ID, "alice2026");

    expect(result.username).toBe("alice2026");
    expect(result.is_first_set).toBe(false); // had old_alice
    expect(result.redirect_expires_at).toBeInstanceOf(Date);

    // Verify atomic transaction shape
    const calls = fakeClient.query.mock.calls.map((c) => String(c[0]).slice(0, 40));
    expect(calls[0]).toBe("BEGIN");
    expect(calls[calls.length - 1]).toBe("COMMIT");
    expect(calls.some((s) => s.includes("INSERT INTO username_redirects"))).toBe(true);
  });

  it("first-time set (oldUsername is NULL) → no redirect insert", async () => {
    stubLastChange(null);
    fakeClient.query
      .mockResolvedValueOnce()                                     // BEGIN
      .mockResolvedValueOnce({ rows: [{ username: null }] })       // user has no username yet
      .mockResolvedValueOnce({ rowCount: 0 })                      // collision active
      .mockResolvedValueOnce({ rowCount: 0 })                      // collision redirect
      // NO redirect insert
      .mockResolvedValueOnce({ rows: [{ username: "alice2026" }] }) // UPDATE
      .mockResolvedValueOnce();                                    // COMMIT

    const result = await setUsernameValidated(USER_ID, "alice2026");

    expect(result.is_first_set).toBe(true);
    expect(result.redirect_expires_at).toBeNull();

    const insertCalls = fakeClient.query.mock.calls.filter((c) =>
      String(c[0]).includes("INSERT INTO username_redirects"),
    );
    expect(insertCalls).toHaveLength(0);
  });

  it("collision active user → 400 USERNAME_UNAVAILABLE generic", async () => {
    stubLastChange(null);
    fakeClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({ rows: [{ username: "old_alice" }] })
      .mockResolvedValueOnce({ rowCount: 1 })  // someone else owns it
      .mockResolvedValueOnce();                // ROLLBACK

    await expect(setUsernameValidated(USER_ID, "taken_name"))
      .rejects.toMatchObject({ status: 400, code: "USERNAME_UNAVAILABLE" });
  });

  it("collision active redirect → 400 USERNAME_UNAVAILABLE", async () => {
    stubLastChange(null);
    fakeClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({ rows: [{ username: "old_alice" }] })
      .mockResolvedValueOnce({ rowCount: 0 })  // no active user
      .mockResolvedValueOnce({ rowCount: 1 })  // active redirect
      .mockResolvedValueOnce();                // ROLLBACK

    await expect(setUsernameValidated(USER_ID, "in_grace"))
      .rejects.toMatchObject({ status: 400, code: "USERNAME_UNAVAILABLE" });
  });

  it("same-as-current → 400 USERNAME_UNCHANGED", async () => {
    stubLastChange(null);
    fakeClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({ rows: [{ username: "alice" }] })
      .mockResolvedValueOnce();                // ROLLBACK

    await expect(setUsernameValidated(USER_ID, "alice"))
      .rejects.toMatchObject({ status: 400, code: "USERNAME_UNCHANGED" });
  });
});
