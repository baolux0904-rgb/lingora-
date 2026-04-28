/**
 * Pro upgrade endpoint blocking tests (Wave 1.6).
 *
 * Pre-Wave-1.6: POST /users/upgrade flipped users.is_pro = true with no
 * payment validation. Anyone could become Pro by calling the endpoint.
 *
 * Post-Wave-1.6: 503 PRO_UPGRADE_NOT_AVAILABLE for every caller until
 * MoMo integration ships. The legitimate /start-trial flow is
 * unaffected (separate endpoint, separate handler).
 *
 * These tests pin the behavior so a future regression would surface
 * before redeploy.
 */

"use strict";

jest.mock("../src/config/db", () => ({
  query: jest.fn(),
}));

const db = require("../src/config/db");
const proController = require("../src/controllers/proController");

beforeEach(() => {
  db.query.mockReset();
});

function makeReqRes(userId = "u1", role = "kid") {
  const req = { user: { id: userId, role }, ip: "1.2.3.4" };
  const res = {
    statusCode: 0,
    headers: {},
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
  return { req, res };
}

describe("proController.upgradePlaceholder — blocked pending MoMo", () => {
  it("returns 503 PRO_UPGRADE_NOT_AVAILABLE for a free user", async () => {
    const { req, res } = makeReqRes("u-free", "kid");
    const next = jest.fn();
    await proController.upgradePlaceholder(req, res, next);

    expect(res.statusCode).toBe(503);
    expect(res.body).toMatchObject({
      success: false,
      code: "PRO_UPGRADE_NOT_AVAILABLE",
    });
    expect(res.body.message).toMatch(/sắp ra mắt/i);
    // Critical: must NOT have run any UPDATE on users.
    expect(db.query).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 503 even for users already marked is_pro (idempotent block)", async () => {
    const { req, res } = makeReqRes("u-pro", "kid");
    const next = jest.fn();
    await proController.upgradePlaceholder(req, res, next);

    expect(res.statusCode).toBe(503);
    expect(res.body.code).toBe("PRO_UPGRADE_NOT_AVAILABLE");
    expect(db.query).not.toHaveBeenCalled();
  });

  it("returns 503 for admin role too — admin grant must use a separate path", async () => {
    const { req, res } = makeReqRes("u-admin", "admin");
    const next = jest.fn();
    await proController.upgradePlaceholder(req, res, next);

    expect(res.statusCode).toBe(503);
    expect(res.body.code).toBe("PRO_UPGRADE_NOT_AVAILABLE");
    expect(db.query).not.toHaveBeenCalled();
  });

  it("never executes a SQL UPDATE on users.is_pro from this handler", async () => {
    // Trip-wire test: even with anything mocked, the handler must not
    // emit an UPDATE statement. Catches accidental restoration of the
    // placeholder body in future PRs.
    const { req, res } = makeReqRes();
    await proController.upgradePlaceholder(req, res, jest.fn());
    const sqlCalls = db.query.mock.calls.map((c) => String(c[0])).join(" ");
    expect(sqlCalls).not.toMatch(/UPDATE\s+users[\s\S]*is_pro\s*=\s*true/i);
  });
});

describe("proController.startTrial — legitimate path UNCHANGED (regression)", () => {
  it("starts a 3-day trial when user is eligible", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ is_pro: false, trial_expires_at: null }] }) // SELECT
      .mockResolvedValueOnce({ rows: [] }); // UPDATE

    const { req, res } = makeReqRes("u-trial");
    res.status = function (code) { this.statusCode = code; return this; };
    res.json   = function (body) { this.body = body; return this; };
    const next = jest.fn();
    await proController.startTrial(req, res, next);

    expect(db.query).toHaveBeenCalledTimes(2);
    // Confirm trial path STILL writes the trial_expires_at column.
    const updateCall = db.query.mock.calls[1];
    expect(updateCall[0]).toMatch(/UPDATE\s+users\s+SET\s+trial_expires_at/i);
    // It must NOT touch is_pro — only trial_expires_at.
    expect(updateCall[0]).not.toMatch(/is_pro\s*=/i);
  });
});
