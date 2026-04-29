/**
 * Integration tests — GET /api/v1/profile/:username + PATCH visibility
 * (Wave 2.8). Adversarial-safe: no client-supplied "viewer" claim is
 * trusted (query param, body, header).
 *
 * DB driver mocked. The lifecycle of the controller (resolve viewer
 * relation → gate → filter) is exercised through supertest.
 */

"use strict";

jest.mock("../src/config/db", () => ({ query: jest.fn() }));

// Avatar upload imports `file-type` v16 (CJS), which is missing in this
// dev install (Wave 1 R2 task). Stub the modules profileController pulls
// for avatar handling so the route file can load without that dep.
jest.mock("../src/utils/mimeValidation", () => ({
  decodeBase64Loose:    jest.fn(),
  validateImageBuffer:  jest.fn(),
  ValidationError:      class extends Error {},
}));
jest.mock("../src/utils/imageReencode", () => ({ reEncodeImage: jest.fn() }));
jest.mock("../src/providers/storage/storageProvider", () => ({
  createStorageProvider: jest.fn(() => ({ uploadObject: jest.fn() })),
}));

// optionalAuth: real implementation (we feed a real Bearer token via
// jwt.sign with the dev fallback secret). Tests against verifyToken
// for the PATCH endpoint use the same.

const { query } = require("../src/config/db");
const jwt = require("jsonwebtoken");
const config = require("../src/config");

const ALICE_ID = "00000000-0000-0000-0000-000000000aaa";
const BOB_ID   = "00000000-0000-0000-0000-000000000bbb";
const CAR_ID   = "00000000-0000-0000-0000-000000000ccc";

function signToken(userId, role = "kid") {
  // Mirrors authService payload — sub + role + name. No `pv` claim so
  // the verifyToken grace branch lets the token through without a DB
  // password_version lookup.
  return jwt.sign(
    { sub: userId, role, name: "T" },
    config.jwt.accessSecret,
    { expiresIn: "5m" },
  );
}

function buildApp() {
  const express = require("express");
  const app = express();
  app.use(express.json());
  app.use("/api/v1", require("../src/routes/profileRoutes"));
  app.use((err, _req, res, _next) => {
    res.status(err.status || 500).json({ success: false, message: err.message, code: err.code });
  });
  return app;
}

function stubAliceLookup(visibility) {
  // The first query in getPublicProfile is the user lookup. Subsequent
  // queries (xp, streak, badges, battle) are only executed when the gate
  // passes. We chain mockResolvedValueOnce so each test controls the
  // lookup row + the side-table rows separately.
  query.mockReset();
  query.mockResolvedValueOnce({ rows: [{
    id: ALICE_ID,
    name: "Alice",
    username: "alice",
    bio: "secret",
    location: "Hanoi",
    avatar_url: null,
    target_band: 7.5,
    estimated_band: 6.5,
    is_pro: false,
    created_at: "2025-01-01T00:00:00Z",
    profile_visibility: visibility,
  }] });
}

function stubSideTables() {
  // xp, streak, badges, battle (in that order, all run inside Promise.all).
  query
    .mockResolvedValueOnce({ rows: [{ total_xp: 1234 }] })
    .mockResolvedValueOnce({ rows: [{ current_streak: 7 }] })
    .mockResolvedValueOnce({ rows: [] })
    .mockResolvedValueOnce({ rows: [{ current_rank_tier: "silver", current_rank_points: 100, wins: 3 }] });
}

function stubFriendCheck(rowCount) {
  // socialRepository.isFriend issues SELECT 1 FROM friendships ...
  query.mockResolvedValueOnce({ rowCount });
}

// ────────────────────────────────────────────────────────────────────────────
// GET /api/v1/profile/:username
// ────────────────────────────────────────────────────────────────────────────

describe("GET /profile/:username — visibility matrix", () => {
  let request;
  beforeAll(() => { request = require("supertest"); });

  it("404 when username does not exist (no info leak)", async () => {
    query.mockReset();
    query.mockResolvedValueOnce({ rows: [] }); // primary user lookup → none
    query.mockResolvedValueOnce({ rows: [] }); // Wave 2.11: redirect-grace fallback → none

    const res = await request(buildApp()).get("/api/v1/profile/ghost");
    expect(res.status).toBe(404);
  });

  it("(public, unauth) → 200 with always-tier only (no friends-only fields)", async () => {
    stubAliceLookup("public");
    stubSideTables();

    const res = await request(buildApp()).get("/api/v1/profile/alice");

    expect(res.status).toBe(200);
    expect(res.body.data.username).toBe("alice");
    expect(res.body.data.totalXp).toBe(1234);
    // Friends-only stripped
    expect(res.body.data).not.toHaveProperty("bio");
    expect(res.body.data).not.toHaveProperty("location");
    expect(res.body.data).not.toHaveProperty("estimated_band");
    expect(res.body.data).not.toHaveProperty("target_band");
    expect(res.body.data).not.toHaveProperty("joined_at");
  });

  it("(friends, unauth) → 404 (does not leak existence)", async () => {
    stubAliceLookup("friends");

    const res = await request(buildApp()).get("/api/v1/profile/alice");
    expect(res.status).toBe(404);
  });

  it("(private, unauth) → 404", async () => {
    stubAliceLookup("private");

    const res = await request(buildApp()).get("/api/v1/profile/alice");
    expect(res.status).toBe(404);
  });

  it("(friends, friend) → 200 with full profile", async () => {
    stubAliceLookup("friends");
    stubFriendCheck(1);
    stubSideTables();

    const token = signToken(BOB_ID);
    const res = await request(buildApp())
      .get("/api/v1/profile/alice")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.bio).toBe("secret");
    expect(res.body.data.location).toBe("Hanoi");
    expect(res.body.data.estimated_band).toBe(6.5);
  });

  it("(private, self) → 200 with full profile (no friend check needed)", async () => {
    stubAliceLookup("private");
    // No friend check — self detected by id match.
    stubSideTables();

    const token = signToken(ALICE_ID);
    const res = await request(buildApp())
      .get("/api/v1/profile/alice")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.bio).toBe("secret");
  });

  it("(friends, stranger) → 404 even when authenticated", async () => {
    stubAliceLookup("friends");
    stubFriendCheck(0);

    const token = signToken(CAR_ID);
    const res = await request(buildApp())
      .get("/api/v1/profile/alice")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Adversarial — query / body / header spoof
// ────────────────────────────────────────────────────────────────────────────

describe("GET /profile/:username — adversarial inputs ignored", () => {
  let request;
  beforeAll(() => { request = require("supertest"); });

  it('query param ?viewer=friend is IGNORED (still 404 on friends mode)', async () => {
    stubAliceLookup("friends");

    const res = await request(buildApp()).get("/api/v1/profile/alice?viewer=friend&isFriend=1");
    expect(res.status).toBe(404);
  });

  it("body { isFriend: true } is IGNORED (still 404 on friends mode)", async () => {
    stubAliceLookup("friends");

    const res = await request(buildApp())
      .get("/api/v1/profile/alice")
      .send({ isFriend: true, viewer: "friend" }); // body on GET — defensive.
    expect(res.status).toBe(404);
  });

  it("forged Authorization header → optionalAuth falls back to unauth (still 404 on friends mode)", async () => {
    stubAliceLookup("friends");

    const res = await request(buildApp())
      .get("/api/v1/profile/alice")
      .set("Authorization", "Bearer not.a.real.jwt");

    expect(res.status).toBe(404);
  });

  it("expired Authorization header → unauth fallback (still 404 on friends mode)", async () => {
    stubAliceLookup("friends");

    const expired = jwt.sign(
      { sub: BOB_ID, role: "kid", name: "B" },
      config.jwt.accessSecret,
      { expiresIn: "-1s" },
    );

    const res = await request(buildApp())
      .get("/api/v1/profile/alice")
      .set("Authorization", `Bearer ${expired}`);

    expect(res.status).toBe(404);
  });

  it("header X-Viewer-Id (custom) is IGNORED — server resolves relation only from req.user", async () => {
    stubAliceLookup("friends");

    const res = await request(buildApp())
      .get("/api/v1/profile/alice")
      .set("X-Viewer-Id", ALICE_ID)
      .set("X-User-Id", ALICE_ID);

    expect(res.status).toBe(404);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// PATCH /users/me/visibility
// ────────────────────────────────────────────────────────────────────────────

describe("PATCH /users/me/visibility — enum gate + auth", () => {
  let request;
  beforeAll(() => { request = require("supertest"); });

  it("401 when unauthenticated", async () => {
    const res = await request(buildApp())
      .patch("/api/v1/users/me/visibility")
      .send({ visibility: "public" });

    expect(res.status).toBe(401);
  });

  it("400 on invalid enum value", async () => {
    query.mockReset();
    const token = signToken(ALICE_ID);
    const res = await request(buildApp())
      .patch("/api/v1/users/me/visibility")
      .set("Authorization", `Bearer ${token}`)
      .send({ visibility: "world" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_VISIBILITY");
    expect(query).not.toHaveBeenCalled();
  });

  it("400 on missing visibility field", async () => {
    const token = signToken(ALICE_ID);
    const res = await request(buildApp())
      .patch("/api/v1/users/me/visibility")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it.each(["public", "friends", "private"])("200 on valid enum [%s]", async (v) => {
    query.mockReset();
    query.mockResolvedValueOnce({ rowCount: 1 });

    const token = signToken(ALICE_ID);
    const res = await request(buildApp())
      .patch("/api/v1/users/me/visibility")
      .set("Authorization", `Bearer ${token}`)
      .send({ visibility: v });

    expect(res.status).toBe(200);
    expect(res.body.data.visibility).toBe(v);

    const [sql, args] = query.mock.calls[0];
    expect(sql).toMatch(/UPDATE\s+users\s+SET\s+profile_visibility\s*=\s*\$2/i);
    expect(args).toEqual([ALICE_ID, v]);
  });
});
