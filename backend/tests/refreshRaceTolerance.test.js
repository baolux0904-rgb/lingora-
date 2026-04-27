/**
 * Multi-tab refresh race tolerance tests (Wave 1.5b Fix 1).
 *
 * Pre-existing reuse-detection logic in authService.refreshTokens killed
 * the entire token family on ms-window race when two browser tabs of the
 * same user refreshed simultaneously. This test pins the new behavior:
 *
 *   - Normal active refresh                  → 200, new token pair (unchanged)
 *   - Revoked < 5s ago + successor in family → 200, take over chain (NEW)
 *   - Revoked < 5s ago + no successor        → 401, family revoke (existing)
 *   - Revoked >= 5s ago                      → 401, family revoke (existing)
 *   - Revoked + family already dead          → 401, no-op revoke
 */

"use strict";

jest.mock("../src/config/db", () => ({
  query: jest.fn(),
  pool: { connect: jest.fn() },
}));

jest.mock("../src/repositories/authRepository", () => ({
  findActiveRefreshToken: jest.fn(),
  findAnyRefreshToken: jest.fn(),
  revokeRefreshToken: jest.fn(),
  revokeRefreshTokenFamily: jest.fn(),
  findActiveTokenInFamily: jest.fn(),
  revokeRefreshTokenById: jest.fn(),
  findById: jest.fn(),
  storeRefreshToken: jest.fn(),
}));

process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "test-access-secret-1234567890-1234567890-1234567890";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test-refresh-secret-1234567890-1234567890-1234567890";

const repo = require("../src/repositories/authRepository");
const { refreshTokens } = require("../src/services/authService");

beforeEach(() => {
  Object.values(repo).forEach((fn) => fn.mockReset && fn.mockReset());
});

describe("refreshTokens — normal active path (regression check)", () => {
  it("rotates an active token and returns a new pair", async () => {
    repo.findActiveRefreshToken.mockResolvedValue({
      id: "rt-active",
      user_id: "u1",
      family: "fam-1",
      expires_at: new Date(Date.now() + 30 * 86400_000),
    });
    repo.findById.mockResolvedValue({
      id: "u1", email: "u@x", name: "U", role: "kid",
      password_hash: "hash", password_version: 1, created_at: new Date(),
    });

    const result = await refreshTokens("raw-token-1");

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.id).toBe("u1");

    expect(repo.revokeRefreshToken).toHaveBeenCalledTimes(1);
    expect(repo.storeRefreshToken).toHaveBeenCalledTimes(1);
    // Race-tolerance helpers must NOT fire on normal path.
    expect(repo.findActiveTokenInFamily).not.toHaveBeenCalled();
    expect(repo.revokeRefreshTokenFamily).not.toHaveBeenCalled();
  });
});

describe("refreshTokens — multi-tab race tolerance (Wave 1.5b)", () => {
  it("tolerates revoked < 5s ago when family has an active successor", async () => {
    repo.findActiveRefreshToken.mockResolvedValue(undefined); // not active
    repo.findAnyRefreshToken.mockResolvedValue({
      id: "rt-old",
      user_id: "u1",
      family: "fam-1",
      revoked_at: new Date(Date.now() - 800), // 800ms ago — well within grace
    });
    repo.findActiveTokenInFamily.mockResolvedValue({
      id: "rt-successor",
      user_id: "u1",
      family: "fam-1",
    });
    repo.findById.mockResolvedValue({
      id: "u1", email: "u@x", name: "U", role: "kid",
      password_hash: "hash", password_version: 1, created_at: new Date(),
    });

    const result = await refreshTokens("raw-token-old");

    // Race tolerated → new tokens issued, family preserved
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(repo.revokeRefreshTokenFamily).not.toHaveBeenCalled();
    // Successor is revoked + new pair stored in same family
    expect(repo.revokeRefreshTokenById).toHaveBeenCalledWith("rt-successor");
    expect(repo.storeRefreshToken).toHaveBeenCalledTimes(1);
    expect(repo.storeRefreshToken.mock.calls[0][0].family).toBe("fam-1");
  });

  it("REVOKES family when revoked >= 5s ago (real reuse attack window)", async () => {
    repo.findActiveRefreshToken.mockResolvedValue(undefined);
    repo.findAnyRefreshToken.mockResolvedValue({
      id: "rt-old",
      user_id: "u1",
      family: "fam-1",
      revoked_at: new Date(Date.now() - 7000), // 7s ago — outside grace
    });

    await expect(refreshTokens("raw-stale")).rejects.toMatchObject({ status: 401 });

    expect(repo.revokeRefreshTokenFamily).toHaveBeenCalledWith("fam-1");
    expect(repo.findActiveTokenInFamily).not.toHaveBeenCalled();
    expect(repo.revokeRefreshTokenById).not.toHaveBeenCalled();
  });

  it("REVOKES family when within grace but no active successor (race already lost)", async () => {
    repo.findActiveRefreshToken.mockResolvedValue(undefined);
    repo.findAnyRefreshToken.mockResolvedValue({
      id: "rt-old",
      user_id: "u1",
      family: "fam-dead",
      revoked_at: new Date(Date.now() - 1000), // 1s ago
    });
    repo.findActiveTokenInFamily.mockResolvedValue(undefined); // family already dead

    await expect(refreshTokens("raw-no-successor")).rejects.toMatchObject({ status: 401 });

    expect(repo.revokeRefreshTokenFamily).toHaveBeenCalledWith("fam-dead");
    expect(repo.revokeRefreshTokenById).not.toHaveBeenCalled();
  });

  it("rejects with 401 when token is unknown to the DB (no row at all)", async () => {
    repo.findActiveRefreshToken.mockResolvedValue(undefined);
    repo.findAnyRefreshToken.mockResolvedValue(undefined);

    await expect(refreshTokens("raw-bogus")).rejects.toMatchObject({ status: 401 });
    expect(repo.revokeRefreshTokenFamily).not.toHaveBeenCalled();
    expect(repo.findActiveTokenInFamily).not.toHaveBeenCalled();
  });
});
