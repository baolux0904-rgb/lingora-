/**
 * domain/profileVisibility.js — pure-function tests (Wave 2.8).
 *
 * Two layers:
 *   1. shouldServeProfile(visibility, viewerRelation)
 *   2. filterProfileFields(profile, viewerRelation)
 *
 * Together they implement the locked Wave 2.8 matrix:
 *
 *   viewer\visibility  | public          | friends    | private
 *   -------------------+-----------------+------------+--------
 *   self               | full            | full       | full
 *   friend             | full            | full       | full
 *   stranger           | always-tier     | 404        | 404
 *   unauth             | always-tier     | 404        | 404
 */

"use strict";

const {
  VISIBILITIES,
  VIEWER_RELATIONS,
  ALWAYS_FIELDS,
  FRIENDS_ONLY_FIELDS,
  shouldServeProfile,
  filterProfileFields,
} = require("../../src/domain/profileVisibility");

const FULL_PROFILE = Object.freeze({
  name: "Alice",
  username: "alice",
  avatar_url: "https://r2.example/a.jpg",
  is_pro: false,
  totalXp: 1234,
  level: 5,
  streak: 7,
  badges: [{ slug: "first_lesson", name: "First Lesson" }],
  battle: { rank_tier: "silver", rank_points: 100, wins: 3 },
  bio: "secret bio",
  location: "Hanoi",
  estimated_band: 6.5,
  target_band: 7.5,
  joined_at: "2025-01-01T00:00:00Z",
});

// ────────────────────────────────────────────────────────────────────────────
// shouldServeProfile — the 3×4 matrix
// ────────────────────────────────────────────────────────────────────────────

describe("shouldServeProfile — Wave 2.8 visibility matrix", () => {
  // Self & friend always see the profile, regardless of visibility.
  it.each(VISIBILITIES)("self always sees [%s]", (v) => {
    expect(shouldServeProfile(v, "self")).toBe(true);
  });

  it.each(VISIBILITIES)("friend always sees [%s]", (v) => {
    expect(shouldServeProfile(v, "friend")).toBe(true);
  });

  // Stranger / unauth: only public mode serves; friends + private 404.
  it("stranger sees public", () => {
    expect(shouldServeProfile("public", "stranger")).toBe(true);
  });
  it("stranger does NOT see friends mode (404)", () => {
    expect(shouldServeProfile("friends", "stranger")).toBe(false);
  });
  it("stranger does NOT see private mode (404)", () => {
    expect(shouldServeProfile("private", "stranger")).toBe(false);
  });

  it("unauth sees public", () => {
    expect(shouldServeProfile("public", "unauth")).toBe(true);
  });
  it("unauth does NOT see friends mode (404)", () => {
    expect(shouldServeProfile("friends", "unauth")).toBe(false);
  });
  it("unauth does NOT see private mode (404)", () => {
    expect(shouldServeProfile("private", "unauth")).toBe(false);
  });

  // Adversarial / malformed input → fail closed (404).
  it.each([
    ["bogus visibility", "world", "self"],
    ["bogus relation", "public", "ghost"],
    ["both bogus", "x", "y"],
    ["null visibility", null, "self"],
    ["null relation", "public", null],
  ])("rejects %s (fail closed)", (_label, v, r) => {
    expect(shouldServeProfile(v, r)).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// filterProfileFields — projection layer
// ────────────────────────────────────────────────────────────────────────────

describe("filterProfileFields — friends-only projection", () => {
  it("self sees every field", () => {
    const out = filterProfileFields(FULL_PROFILE, "self");
    for (const f of [...ALWAYS_FIELDS, ...FRIENDS_ONLY_FIELDS]) {
      expect(out).toHaveProperty(f);
    }
  });

  it("friend sees every field", () => {
    const out = filterProfileFields(FULL_PROFILE, "friend");
    expect(out.bio).toBe("secret bio");
    expect(out.location).toBe("Hanoi");
    expect(out.estimated_band).toBe(6.5);
    expect(out.joined_at).toBe("2025-01-01T00:00:00Z");
  });

  it.each(["stranger", "unauth"])("[%s] strips ALL friends-only fields", (rel) => {
    const out = filterProfileFields(FULL_PROFILE, rel);

    // Always-tier kept
    expect(out.username).toBe("alice");
    expect(out.totalXp).toBe(1234);
    expect(out.battle).toEqual({ rank_tier: "silver", rank_points: 100, wins: 3 });

    // Friends-only stripped
    for (const f of FRIENDS_ONLY_FIELDS) {
      expect(out).not.toHaveProperty(f);
    }
  });

  it("returns a fresh object — does not mutate the input", () => {
    const original = { ...FULL_PROFILE };
    filterProfileFields(FULL_PROFILE, "stranger");
    expect(FULL_PROFILE).toEqual(original); // unchanged
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Integration check — decision matrix end-to-end
// ────────────────────────────────────────────────────────────────────────────

describe("End-to-end matrix: gate → filter", () => {
  function evalView(visibility, viewerRelation) {
    if (!shouldServeProfile(visibility, viewerRelation)) return null;
    return filterProfileFields(FULL_PROFILE, viewerRelation);
  }

  it("(public, stranger) → always-tier only", () => {
    const out = evalView("public", "stranger");
    expect(out).not.toBeNull();
    expect(out).not.toHaveProperty("estimated_band");
    expect(out.username).toBe("alice");
  });

  it("(friends, stranger) → null (404)", () => {
    expect(evalView("friends", "stranger")).toBeNull();
  });

  it("(private, stranger) → null (404)", () => {
    expect(evalView("private", "stranger")).toBeNull();
  });

  it("(friends, friend) → full profile", () => {
    const out = evalView("friends", "friend");
    expect(out.estimated_band).toBe(6.5);
    expect(out.location).toBe("Hanoi");
  });

  it("(private, self) → full profile", () => {
    const out = evalView("private", "self");
    expect(out.bio).toBe("secret bio");
  });

  it("(public, friend) → full profile (friends bypass tier filter)", () => {
    const out = evalView("public", "friend");
    expect(out.estimated_band).toBe(6.5);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Constants are frozen
// ────────────────────────────────────────────────────────────────────────────

describe("module constants are deeply frozen", () => {
  it("VISIBILITIES, VIEWER_RELATIONS, ALWAYS_FIELDS, FRIENDS_ONLY_FIELDS", () => {
    expect(Object.isFrozen(VISIBILITIES)).toBe(true);
    expect(Object.isFrozen(VIEWER_RELATIONS)).toBe(true);
    expect(Object.isFrozen(ALWAYS_FIELDS)).toBe(true);
    expect(Object.isFrozen(FRIENDS_ONLY_FIELDS)).toBe(true);
  });
});
