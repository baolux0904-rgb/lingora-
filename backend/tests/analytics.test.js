/**
 * Analytics ingest tests (Wave 4.13).
 *
 * Covers PII guard + size/key caps in domain/analyticsGuard, plus
 * integration shape against POST /api/v1/analytics/track. The endpoint
 * is public — no JWT required — so these tests do not need a token.
 *
 * The DB insert path is exercised in the success cases. We don't
 * SELECT back; the `200` envelope + the lack of an error from the
 * INSERT is sufficient for "alive and writing".
 */

const request = require("supertest");
const createApp = require("../src/app");
const guard = require("../src/domain/analyticsGuard");

let app;
beforeAll(() => { app = createApp(); });

describe("domain/analyticsGuard", () => {
  describe("validateEventName", () => {
    it("accepts a normal name", () => {
      expect(guard.validateEventName("page_view").ok).toBe(true);
    });
    it("rejects empty string", () => {
      expect(guard.validateEventName("").ok).toBe(false);
    });
    it("rejects non-string", () => {
      expect(guard.validateEventName(42).ok).toBe(false);
      expect(guard.validateEventName(null).ok).toBe(false);
    });
    it("rejects > 100 chars", () => {
      const r = guard.validateEventName("x".repeat(101));
      expect(r.ok).toBe(false);
      expect(r.code).toBe("EVENT_NAME_TOO_LONG");
    });
  });

  describe("sanitiseProperties", () => {
    it("accepts empty / null", () => {
      expect(guard.sanitiseProperties(null).ok).toBe(true);
      expect(guard.sanitiseProperties({}).ok).toBe(true);
    });
    it("rejects PII keys", () => {
      for (const k of ["email", "password", "phone", "address", "full_name", "dob"]) {
        const r = guard.sanitiseProperties({ [k]: "x" });
        expect(r.ok).toBe(false);
        expect(r.code).toBe("PII_REJECTED");
      }
    });
    it("rejects > 50 keys", () => {
      const props = {};
      for (let i = 0; i < 51; i++) props[`k${i}`] = i;
      const r = guard.sanitiseProperties(props);
      expect(r.ok).toBe(false);
      expect(r.code).toBe("TOO_MANY_KEYS");
    });
    it("truncates string values > 1KB", () => {
      const long = "a".repeat(2000);
      const r = guard.sanitiseProperties({ note: long });
      expect(r.ok).toBe(true);
      expect(r.properties.note.length).toBe(1024);
    });
    it("rejects properties > 10KB serialised", () => {
      // 50 keys * ~500 bytes each (truncated 1KB strings would still fit per-key,
      // but the overall serialised total exceeds 10KB)
      const props = {};
      for (let i = 0; i < 30; i++) props[`k${i}`] = "x".repeat(500);
      const r = guard.sanitiseProperties(props);
      expect(r.ok).toBe(false);
      expect(r.code).toBe("PROPERTIES_TOO_LARGE");
    });
    it("rejects non-object", () => {
      expect(guard.sanitiseProperties("nope").ok).toBe(false);
      expect(guard.sanitiseProperties([1, 2]).ok).toBe(false);
    });
  });
});

describe("POST /api/v1/analytics/track", () => {
  it("accepts a valid anonymous event", async () => {
    const res = await request(app)
      .post("/api/v1/analytics/track")
      .send({ event: "page_view", session_id: "test-sid-1", properties: { page: "/home" } });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ok).toBe(true);
  });

  it("accepts event_name alias", async () => {
    const res = await request(app)
      .post("/api/v1/analytics/track")
      .send({ event_name: "signup_complete", session_id: "test-sid-2" });
    expect(res.status).toBe(200);
  });

  it("rejects PII keys with 400 PII_REJECTED", async () => {
    const res = await request(app)
      .post("/api/v1/analytics/track")
      .send({ event: "x", session_id: "s", properties: { email: "leak@x.com" } });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("PII_REJECTED");
  });

  it("rejects missing event_name with 400", async () => {
    const res = await request(app)
      .post("/api/v1/analytics/track")
      .send({ session_id: "s" });
    expect(res.status).toBe(400);
  });

  it("rejects oversized properties with 400", async () => {
    const props = {};
    for (let i = 0; i < 30; i++) props[`k${i}`] = "x".repeat(500);
    const res = await request(app)
      .post("/api/v1/analytics/track")
      .send({ event: "x", session_id: "s", properties: props });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("PROPERTIES_TOO_LARGE");
  });

  it("falls back to session_id='unknown' when omitted", async () => {
    // Backwards-compat with the existing FE wrapper which doesn't ship session_id.
    const res = await request(app)
      .post("/api/v1/analytics/track")
      .send({ event: "page_view" });
    expect(res.status).toBe(200);
  });
});
