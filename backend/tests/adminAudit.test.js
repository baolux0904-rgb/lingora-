/**
 * Admin endpoint hardening tests (Wave 1.7).
 *
 * Three layers:
 *   1. emailService HTML escape — payload <script>...</script> → escaped
 *      in the rendered HTML body that we hand to Resend.
 *   2. adminAudit middleware    — sanitizePayload redacts sensitive keys
 *      and truncates long strings; action name is derived from method
 *      + last URL segment.
 *   3. Audit insert on finish   — adminAudit fires the INSERT after
 *      res.end for write actions (validated via mock query).
 */

"use strict";

jest.mock("../src/config/db", () => ({
  query: jest.fn(),
  pool: { connect: jest.fn() },
}));

const db = require("../src/config/db");

beforeEach(() => {
  db.query.mockReset();
});

// ---------------------------------------------------------------------------
// 1. emailService HTML escape
// ---------------------------------------------------------------------------

describe("emailService — HTML escape on user/admin input", () => {
  // Mock Resend so we can capture the rendered HTML before "send".
  let captured;
  beforeEach(() => {
    captured = [];
    process.env.RESEND_API_KEY = "test_key";
    jest.resetModules();
    jest.doMock("resend", () => ({
      Resend: function () {
        return {
          emails: {
            send: async (payload) => {
              captured.push(payload);
              return { id: "stub" };
            },
          },
        };
      },
    }));
    jest.doMock("../src/config/db", () => ({ query: jest.fn(), pool: { connect: jest.fn() } }));
  });

  it("escapes <script> in user.name when sending welcome email", async () => {
    const { sendWelcomeEmail } = require("../src/services/emailService");
    await sendWelcomeEmail({
      email: "x@y.com",
      name: '<script>alert("xss")</script>Mallory',
    });
    expect(captured.length).toBe(1);
    expect(captured[0].html).not.toMatch(/<script>alert/);
    expect(captured[0].html).toMatch(/&lt;script&gt;/);
    // Subject must not contain CRLF or raw < either (header injection).
    expect(captured[0].subject).not.toMatch(/[\r\n<>]/);
  });

  it("escapes discountCode + percent in promo email", async () => {
    const { sendPromoEmail } = require("../src/services/emailService");
    await sendPromoEmail(
      { email: "x@y.com", name: "Alice" },
      '"><img src=x onerror=alert(1)>',  // malicious code
      30,
    );
    expect(captured.length).toBe(1);
    expect(captured[0].html).not.toMatch(/<img\s+src=x\s+onerror/i);
    expect(captured[0].html).toMatch(/&lt;img/);
    // Discount percent renders as plain number (defensive coercion).
    expect(captured[0].html).toMatch(/30%/);
  });

  it("coerces non-numeric discountPercent to empty string (defensive)", async () => {
    const { sendPromoEmail } = require("../src/services/emailService");
    await sendPromoEmail({ email: "x@y.com", name: "Alice" }, "PROMO", "<script>");
    expect(captured.length).toBe(1);
    // Empty render — no XSS leaked through the percent slot.
    expect(captured[0].html).not.toMatch(/<script>/);
  });

  it("escapes featureName + description in announcement email", async () => {
    const { sendFeatureAnnouncementEmail } = require("../src/services/emailService");
    await sendFeatureAnnouncementEmail(
      [{ email: "u1@x", name: "Bob" }],
      "<b>BoldName</b>",
      "<svg onload=alert(1)>",
    );
    expect(captured.length).toBe(1);
    expect(captured[0].html).not.toMatch(/<svg\s+onload/);
    expect(captured[0].html).toMatch(/&lt;svg/);
    expect(captured[0].html).toMatch(/&lt;b&gt;BoldName&lt;\/b&gt;/);
  });
});

// ---------------------------------------------------------------------------
// 2. adminAudit middleware — sanitize + action derivation
// ---------------------------------------------------------------------------

describe("adminAudit middleware", () => {
  // Re-require fresh; isolate from email mock.
  let sanitizePayload, actionFromRequest, auditAdminAction;
  beforeEach(() => {
    jest.resetModules();
    jest.doMock("../src/config/db", () => ({ query: jest.fn(), pool: { connect: jest.fn() } }));
    const m = require("../src/middleware/adminAudit");
    sanitizePayload = m.sanitizePayload;
    actionFromRequest = m.actionFromRequest;
    auditAdminAction = m.auditAdminAction;
  });

  it("sanitizePayload redacts password / token / secret / api_key keys", () => {
    const out = sanitizePayload({
      email: "u@x",
      password: "hunter2",
      api_key: "sk-abc",
      authorization: "Bearer xyz",
      token: "jwt-bla",
      nested: { secret: "deep", harmless: 42 },
    });
    expect(out).toEqual({
      email: "u@x",
      password: "<redacted>",
      api_key: "<redacted>",
      authorization: "<redacted>",
      token: "<redacted>",
      nested: { secret: "<redacted>", harmless: 42 },
    });
  });

  it("sanitizePayload truncates long strings", () => {
    const longString = "a".repeat(15_000);
    const out = sanitizePayload({ blob: longString });
    expect(out.blob.length).toBeLessThan(15_000);
    expect(out.blob).toMatch(/\[…\+5000 chars\]$/);
  });

  it("actionFromRequest derives method + last URL segment", () => {
    expect(actionFromRequest({ method: "POST", baseUrl: "/api/v1/admin", path: "/send-promo" }))
      .toBe("post send-promo");
    // Last segment wins — /users/abc → "abc". For target-id capture use
    // payload.__resource fields if needed in future revisions.
    expect(actionFromRequest({ method: "DELETE", baseUrl: "/api/v1/admin", originalUrl: "/users/abc" }))
      .toBe("delete abc");
  });

  it("INSERTs into admin_audit_log when response finishes (write path)", async () => {
    jest.resetModules();
    const dbMock = { query: jest.fn().mockResolvedValue({ rowCount: 1 }), pool: { connect: jest.fn() } };
    jest.doMock("../src/config/db", () => dbMock);
    const { auditAdminAction: amw } = require("../src/middleware/adminAudit");

    const finishHandlers = [];
    const req = {
      user: { id: "admin-1" },
      method: "POST",
      baseUrl: "/api/v1/admin",
      path: "/send-promo",
      body: { discountCode: "WELCOME10", discountPercent: 10, password: "leaked" },
      ip: "1.2.3.4",
      headers: { "user-agent": "TestAgent/1.0" },
    };
    const res = {
      statusCode: 200,
      on(event, cb) { if (event === "finish") finishHandlers.push(cb); },
    };
    const next = jest.fn();
    amw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(dbMock.query).not.toHaveBeenCalled(); // hasn't fired yet — waits for finish

    // Simulate Express completing the response.
    finishHandlers.forEach((cb) => cb());
    // Wait a microtask for the .catch chain to attach.
    await new Promise((r) => setImmediate(r));

    expect(dbMock.query).toHaveBeenCalledTimes(1);
    const [sql, params] = dbMock.query.mock.calls[0];
    expect(sql).toMatch(/INSERT INTO admin_audit_log/i);
    expect(params[0]).toBe("admin-1");
    expect(params[1]).toBe("post send-promo");
    // Sanitized payload — password redacted, response status appended.
    expect(params[2]).toMatchObject({
      discountCode: "WELCOME10",
      discountPercent: 10,
      password: "<redacted>",
      __response_status: 200,
    });
    expect(params[3]).toBe("1.2.3.4");
    expect(params[4]).toBe("TestAgent/1.0");
  });

  it("never blocks the response when DB insert fails", async () => {
    jest.resetModules();
    const dbMock = { query: jest.fn().mockRejectedValue(new Error("DB down")), pool: { connect: jest.fn() } };
    jest.doMock("../src/config/db", () => dbMock);
    const { auditAdminAction: amw } = require("../src/middleware/adminAudit");

    const finishHandlers = [];
    const req = {
      user: { id: "admin-1" },
      method: "POST",
      baseUrl: "/api/v1/admin",
      path: "/send-promo",
      body: {},
      ip: "1.2.3.4",
      headers: {},
    };
    const res = { statusCode: 200, on(e, cb) { if (e === "finish") finishHandlers.push(cb); } };
    const next = jest.fn();
    amw(req, res, next);

    // Trigger finish — the .catch should swallow the error.
    finishHandlers.forEach((cb) => cb());
    await new Promise((r) => setImmediate(r));

    // No throw escaped.
    expect(next).toHaveBeenCalledWith(); // bare next() — no error
  });
});
