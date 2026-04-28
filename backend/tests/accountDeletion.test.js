/**
 * Account deletion lifecycle tests (Wave 2.7, PDPL VN).
 *
 * Verifies the SQL contract of the soft-delete transaction without a real
 * Postgres: pg pool client is mocked, queries are inspected. The actual
 * cascade behavior (FK CASCADE, partial unique on email/username) is
 * tested by running migration 0046 against the local DB during deploy.
 *
 * Two layers:
 *   1. softDeleteUser — transaction shape + idempotency
 *   2. deleteAccount controller — confirm_text validation + JWT scope
 */

"use strict";

// ── Pool mock ───────────────────────────────────────────────────────────────

const mockClient = {
  query:   jest.fn(),
  release: jest.fn(),
};
jest.mock("../src/config/db", () => ({
  pool:  { connect: jest.fn(() => Promise.resolve(mockClient)), on: jest.fn() },
  query: jest.fn(),
}));

// ── battleService mock — pretend nothing to forfeit unless overridden ──────
jest.mock("../src/services/battleService", () => ({
  forfeitActiveMatchesForUser: jest.fn().mockResolvedValue({ forfeited: 0, queueCancelled: 0 }),
}));

// ── Other dependencies the controller pulls in ────────────────────────────
jest.mock("../src/services/emailService", () => ({
  sendAccountDeletedEmail: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../src/providers/storage/storageProvider", () => ({
  deleteObject: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../src/middleware/auth", () => ({
  verifyToken: (req, _res, next) => {
    req.user = { id: "00000000-0000-0000-0000-000000000001", role: "kid" };
    next();
  },
}));
jest.mock("../src/middleware/rateLimiters", () => ({
  accountDeletionLimiter: (_req, _res, next) => next(),
}));

const battleService = require("../src/services/battleService");
const emailService  = require("../src/services/emailService");
const storage       = require("../src/providers/storage/storageProvider");
const { softDeleteUser, ANON_USERNAME_PREFIX, PLACEHOLDER_NAME } = require("../src/domain/userLifecycle");

const USER_ID = "00000000-0000-0000-0000-000000000001";

beforeEach(() => {
  mockClient.query.mockReset();
  mockClient.release.mockReset();
  battleService.forfeitActiveMatchesForUser.mockClear();
  emailService.sendAccountDeletedEmail.mockClear();
  storage.deleteObject.mockClear();
});

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Default happy-path stub for an active user with no friends/voice notes. */
function stubHappyPath() {
  mockClient.query
    .mockResolvedValueOnce()                                // 1. BEGIN
    .mockResolvedValueOnce({ rows: [{                       // 2. SELECT user FOR UPDATE
      email: "user@example.com", name: "Alice",
      avatar_url: "https://r2.example/avatars/a.jpg",
      deleted_at: null,
    }] })
    .mockResolvedValueOnce({ rows: [] })                    // 3. SELECT voice audio_urls
    .mockResolvedValueOnce({ rowCount: 0 })                 // 4. DELETE messages
    .mockResolvedValueOnce({ rows: [] })                    // 5. SELECT friend ids
    .mockResolvedValueOnce({ rowCount: 0 })                 // 6. DELETE friendships
    // (skip friend_count UPDATE — friendIds is empty)
    .mockResolvedValueOnce({})                              // 7. DELETE friend_requests
    .mockResolvedValueOnce({})                              // 8. DELETE notifications
    .mockResolvedValueOnce({})                              // 9. DELETE accountability_pings
    .mockResolvedValueOnce({ rowCount: 0 })                 // 10. DELETE refresh_tokens
    .mockResolvedValueOnce({})                              // 11. UPDATE users (anonymize)
    .mockResolvedValueOnce();                               // 12. COMMIT
}

// ─── 1. softDeleteUser: transaction shape ──────────────────────────────────

describe("softDeleteUser — transaction integrity", () => {
  it("BEGINs, locks the user row FOR UPDATE, then COMMITs on success", async () => {
    stubHappyPath();

    const result = await softDeleteUser(USER_ID);

    expect(result.alreadyDeleted).toBe(false);
    expect(result.userSnapshot).toEqual({ email: "user@example.com", name: "Alice" });
    expect(mockClient.release).toHaveBeenCalledTimes(1);

    const calls = mockClient.query.mock.calls.map((c) => String(c[0]));
    expect(calls[0].trim()).toBe("BEGIN");
    expect(calls[1]).toMatch(/FROM\s+users[\s\S]*FOR\s+UPDATE/i);
    expect(calls[calls.length - 1].trim()).toBe("COMMIT");
  });

  it("anonymizes the row with NULL email + placeholder name + bumped password_version", async () => {
    stubHappyPath();
    await softDeleteUser(USER_ID);

    const updateCall = mockClient.query.mock.calls.find((c) => /UPDATE\s+users/i.test(String(c[0])) && /deleted_at\s*=\s*now\(\)/i.test(String(c[0])));
    expect(updateCall).toBeDefined();

    const [sql, args] = updateCall;
    expect(sql).toMatch(/email\s*=\s*NULL/);
    expect(sql).toMatch(/avatar_url\s*=\s*NULL/);
    expect(sql).toMatch(/password_hash\s*=\s*NULL/);
    expect(sql).toMatch(/password_version\s*=\s*COALESCE\(password_version,\s*0\)\s*\+\s*1/);
    expect(sql).toMatch(/qr_token\s*=\s*NULL/);

    expect(args[0]).toBe(USER_ID);
    expect(args[1]).toBe(PLACEHOLDER_NAME);
    expect(args[2]).toMatch(new RegExp(`^${ANON_USERNAME_PREFIX}[a-f0-9]{8}$`));
  });

  it("forfeits active battles via battleService BEFORE wiping rows", async () => {
    stubHappyPath();
    battleService.forfeitActiveMatchesForUser.mockResolvedValueOnce({ forfeited: 1, queueCancelled: 0 });

    const result = await softDeleteUser(USER_ID);

    expect(battleService.forfeitActiveMatchesForUser).toHaveBeenCalledWith(USER_ID, mockClient);
    expect(result.stats.forfeitedMatches).toBe(1);
  });

  it("captures voice-note R2 keys for post-commit cleanup", async () => {
    mockClient.query
      .mockResolvedValueOnce()                                            // BEGIN
      .mockResolvedValueOnce({ rows: [{ email: "u@e.com", name: "X", avatar_url: null, deleted_at: null }] }) // user lock
      .mockResolvedValueOnce({ rows: [                                    // voice audio_urls
        { audio_url: "https://r2.example/voice/abc.webm" },
        { audio_url: "https://r2.example/voice/def.webm" },
        { audio_url: "not-a-url" },
      ] })
      .mockResolvedValueOnce({ rowCount: 0 })                             // DELETE messages
      .mockResolvedValueOnce({ rows: [] })                                // friend ids
      .mockResolvedValueOnce({ rowCount: 0 })                             // DELETE friendships
      .mockResolvedValueOnce({})                                          // friend_requests
      .mockResolvedValueOnce({})                                          // notifications
      .mockResolvedValueOnce({})                                          // pings
      .mockResolvedValueOnce({ rowCount: 0 })                             // refresh_tokens
      .mockResolvedValueOnce({})                                          // UPDATE users
      .mockResolvedValueOnce();                                           // COMMIT

    const result = await softDeleteUser(USER_ID);

    expect(result.voiceNoteKeys).toEqual(["voice/abc.webm", "voice/def.webm"]);
  });

  it("decrements friend_count on remaining friends when friendships exist", async () => {
    mockClient.query
      .mockResolvedValueOnce()                                            // BEGIN
      .mockResolvedValueOnce({ rows: [{ email: "u@e.com", name: "X", avatar_url: null, deleted_at: null }] })
      .mockResolvedValueOnce({ rows: [] })                                // voice notes
      .mockResolvedValueOnce({ rowCount: 0 })                             // DELETE messages
      .mockResolvedValueOnce({ rows: [{ friend_id: "f1" }, { friend_id: "f2" }] })
      .mockResolvedValueOnce({ rowCount: 2 })                             // DELETE friendships
      .mockResolvedValueOnce({})                                          // UPDATE friend_count
      .mockResolvedValueOnce({})                                          // friend_requests
      .mockResolvedValueOnce({})                                          // notifications
      .mockResolvedValueOnce({})                                          // pings
      .mockResolvedValueOnce({ rowCount: 1 })                             // refresh_tokens
      .mockResolvedValueOnce({})                                          // UPDATE users
      .mockResolvedValueOnce();                                           // COMMIT

    const result = await softDeleteUser(USER_ID);

    expect(result.stats.friendshipsDeleted).toBe(2);

    const decCall = mockClient.query.mock.calls.find((c) =>
      /SET\s+friend_count\s*=\s*GREATEST/i.test(String(c[0])),
    );
    expect(decCall).toBeDefined();
    expect(decCall[1]).toEqual([["f1", "f2"]]);
  });

  it("rolls back on error and surfaces the original exception", async () => {
    mockClient.query
      .mockResolvedValueOnce() // BEGIN
      .mockResolvedValueOnce({ rows: [{ email: "u@e.com", name: "X", avatar_url: null, deleted_at: null }] })
      .mockResolvedValueOnce({ rows: [] }) // voice notes
      .mockRejectedValueOnce(new Error("simulated failure")) // first DELETE
      .mockResolvedValueOnce(); // ROLLBACK

    await expect(softDeleteUser(USER_ID)).rejects.toThrow(/simulated failure/);

    const lastQueries = mockClient.query.mock.calls.map((c) => String(c[0]));
    expect(lastQueries).toContain("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("idempotent — second call after delete returns alreadyDeleted=true with no writes", async () => {
    mockClient.query
      .mockResolvedValueOnce() // BEGIN
      .mockResolvedValueOnce({ rows: [{ email: null, name: PLACEHOLDER_NAME, avatar_url: null, deleted_at: new Date() }] })
      .mockResolvedValueOnce(); // ROLLBACK

    const result = await softDeleteUser(USER_ID);

    expect(result.alreadyDeleted).toBe(true);
    expect(result.userSnapshot).toBeNull();
    // Only BEGIN, SELECT, ROLLBACK fired — no anonymize UPDATE, no battle calls.
    expect(battleService.forfeitActiveMatchesForUser).not.toHaveBeenCalled();
  });

  it("surfaces 404 when user row does not exist", async () => {
    mockClient.query
      .mockResolvedValueOnce() // BEGIN
      .mockResolvedValueOnce({ rows: [] }) // user not found
      .mockResolvedValueOnce(); // ROLLBACK

    await expect(softDeleteUser(USER_ID)).rejects.toMatchObject({ status: 404 });
  });
});

// ─── 2. Controller integration ─────────────────────────────────────────────

describe("DELETE /api/v1/users/me — confirm_text gate", () => {
  // Build a thin app instance routing directly at the controller without the
  // full app.js (which loads the file-type module that's missing in CI).
  let app;
  beforeAll(() => {
    const express = require("express");
    const cookieParser = require("cookie-parser");
    const accountRoutes = require("../src/routes/accountRoutes");
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use("/api/v1/users", accountRoutes);
    app.use((err, _req, res, _next) => {
      res.status(err.status || 500).json({ success: false, message: err.message });
    });
  });

  it("rejects with 400 when confirm_text is missing", async () => {
    const request = require("supertest");
    const res = await request(app).delete("/api/v1/users/me").send({});
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("ACCOUNT_DELETE_CONFIRM_REQUIRED");
  });

  it('rejects with 400 when confirm_text is the wrong case ("xóa")', async () => {
    const request = require("supertest");
    const res = await request(app).delete("/api/v1/users/me").send({ confirm_text: "xóa" });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("ACCOUNT_DELETE_CONFIRM_REQUIRED");
  });

  it("accepts the exact string XÓA and returns 200", async () => {
    stubHappyPath();
    const request = require("supertest");
    const res = await request(app).delete("/api/v1/users/me").send({ confirm_text: "XÓA" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
