/**
 * domain/limits.js unit tests (Wave 2.4).
 */

"use strict";

const {
  LIMITS,
  PUBLIC_LIMITS,
  VALID_PLANS,
  VALID_SKILLS,
  getLimit,
  isUnlimited,
} = require("../../src/domain/limits");

describe("domain/limits — locked values (1/1, 5 skills, 2 plans)", () => {
  it("free Speaking and Writing are 1/day; reading/grammar/listening unmetered", () => {
    expect(LIMITS.free.speaking.perDay).toBe(1);
    expect(LIMITS.free.writing.perDay).toBe(1);
    expect(LIMITS.free.grammar.perDay).toBeNull();
    expect(LIMITS.free.reading.perDay).toBeNull();
    expect(LIMITS.free.listening.perDay).toBeNull();
  });

  it("pro is unlimited across all 5 skills", () => {
    for (const skill of VALID_SKILLS) {
      expect(LIMITS.pro[skill].perDay).toBeNull();
    }
  });
});

describe("getLimit / isUnlimited", () => {
  it("returns the limit object for a known (plan, skill) pair", () => {
    expect(getLimit("free", "speaking")).toEqual({ perDay: 1 });
    expect(getLimit("pro", "writing")).toEqual({ perDay: null });
  });

  it("returns null for unknown plan or skill", () => {
    expect(getLimit("enterprise", "speaking")).toBeNull();
    expect(getLimit("free", "dancing")).toBeNull();
    expect(getLimit(undefined, undefined)).toBeNull();
  });

  it("isUnlimited true for null perDay, false for finite quotas", () => {
    expect(isUnlimited("free", "speaking")).toBe(false);
    expect(isUnlimited("free", "reading")).toBe(true);
    expect(isUnlimited("pro", "speaking")).toBe(true);
    expect(isUnlimited("garbage", "speaking")).toBe(true); // unknown → null limit → "unlimited" by default
  });
});

describe("PUBLIC_LIMITS surface (consumed by /public/limits and FE fallback)", () => {
  it("exposes free + pro for the four advertised skills, NOT listening", () => {
    expect(Object.keys(PUBLIC_LIMITS.free).sort()).toEqual(["grammar", "reading", "speaking", "writing"]);
    expect(Object.keys(PUBLIC_LIMITS.pro).sort()).toEqual(["grammar", "reading", "speaking", "writing"]);
    expect(PUBLIC_LIMITS.free).not.toHaveProperty("listening");
    expect(PUBLIC_LIMITS.pro).not.toHaveProperty("listening");
  });

  it("flat shape matches LIMITS.*.perDay for each advertised skill", () => {
    for (const skill of ["speaking", "writing", "grammar", "reading"]) {
      expect(PUBLIC_LIMITS.free[skill]).toBe(LIMITS.free[skill].perDay);
      expect(PUBLIC_LIMITS.pro[skill]).toBe(LIMITS.pro[skill].perDay);
    }
  });
});

describe("constants are deeply frozen — no runtime mutation", () => {
  it("LIMITS, PUBLIC_LIMITS, VALID_PLANS, VALID_SKILLS are frozen", () => {
    expect(Object.isFrozen(LIMITS)).toBe(true);
    expect(Object.isFrozen(LIMITS.free)).toBe(true);
    expect(Object.isFrozen(LIMITS.free.speaking)).toBe(true);
    expect(Object.isFrozen(PUBLIC_LIMITS)).toBe(true);
    expect(Object.isFrozen(PUBLIC_LIMITS.free)).toBe(true);
    expect(Object.isFrozen(VALID_PLANS)).toBe(true);
    expect(Object.isFrozen(VALID_SKILLS)).toBe(true);
  });

  it("attempted mutation does not change the value (in non-strict caller)", () => {
    // Object.freeze fails silently in non-strict mode — assert by comparison.
    const before = LIMITS.free.speaking.perDay;
    try { LIMITS.free.speaking.perDay = 999; } catch { /* strict-mode TypeError ok */ }
    expect(LIMITS.free.speaking.perDay).toBe(before);
  });
});
