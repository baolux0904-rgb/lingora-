/**
 * controllers/profileController.js
 *
 * Profile management: update, stats, public profile, avatar.
 */

const { query } = require("../config/db");
const { sendSuccess, sendError } = require("../response");
const { decodeBase64Loose, validateImageBuffer, ValidationError } = require("../utils/mimeValidation");
const { reEncodeImage } = require("../utils/imageReencode");
const { createStorageProvider } = require("../providers/storage/storageProvider");

// ---------------------------------------------------------------------------
// POST /api/v1/users/profile — update own profile
// ---------------------------------------------------------------------------

async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, bio, location, target_band, avatar_url } = req.body;

    if (name && name.length > 50) return sendError(res, { status: 400, message: "Name max 50 characters" });
    if (bio && bio.length > 100) return sendError(res, { status: 400, message: "Bio max 100 characters" });

    const sets = [];
    const params = [userId];
    let idx = 2;

    if (name !== undefined) { sets.push(`name = $${idx}`); params.push(name); idx++; }
    if (bio !== undefined) { sets.push(`bio = $${idx}`); params.push(bio); idx++; }
    if (location !== undefined) { sets.push(`location = $${idx}`); params.push(location); idx++; }
    if (target_band !== undefined) { sets.push(`target_band = $${idx}`); params.push(target_band); idx++; }
    if (avatar_url !== undefined) { sets.push(`avatar_url = $${idx}`); params.push(avatar_url); idx++; }

    if (sets.length === 0) return sendError(res, { status: 400, message: "No fields to update" });

    sets.push("updated_at = now()");
    const result = await query(
      `UPDATE users SET ${sets.join(", ")} WHERE id = $1 RETURNING id, name, bio, location, target_band, avatar_url, username`,
      params
    );

    return sendSuccess(res, { data: result.rows[0], message: "Profile updated" });
  } catch (err) { next(err); }
}

// ---------------------------------------------------------------------------
// POST /api/v1/users/avatar — upload avatar (base64)
// ---------------------------------------------------------------------------

async function uploadAvatar(req, res, next) {
  try {
    const userId = req.user.id;
    const { image } = req.body; // data URI or raw base64

    if (!image || typeof image !== "string") {
      return sendError(res, { status: 400, message: "image (base64) is required", code: "IMAGE_REQUIRED" });
    }

    // 1. Decode base64 → Buffer (null-safe)
    const rawBuffer = decodeBase64Loose(image);
    if (!rawBuffer) {
      return sendError(res, { status: 400, message: "Invalid base64 payload.", code: "INVALID_IMAGE" });
    }

    // 2. Magic-byte validation: rejects SVG, octet-stream, polyglots-with-wrong-header.
    //    Cap raw size 1.5MB BEFORE re-encode to bound memory/CPU.
    let detected;
    try {
      detected = await validateImageBuffer(rawBuffer, { maxSize: 1.5 * 1024 * 1024 });
    } catch (err) {
      if (err instanceof ValidationError) {
        return sendError(res, { status: err.status, message: err.message, code: err.code });
      }
      throw err;
    }

    // 3. Re-encode to canonical JPEG. Strips trailing-byte polyglots, EXIF,
    //    and pixel-bombs (capped to 2048px longest side).
    const encoded = await reEncodeImage(rawBuffer, { format: "jpeg", quality: 85 });

    // 4. Upload to storage provider (R2 in prod, mock in dev). Deterministic
    //    key per user — overwrites the previous avatar in place, so no
    //    orphan-cleanup is required for re-uploads.
    const storage = createStorageProvider();
    const key = `avatars/${userId}.jpg`;
    await storage.uploadObject(key, encoded.buffer, encoded.mime);

    // 5. Persist a stable URL (R2_PUBLIC_URL or 7-day signed; mock URL in dev).
    const avatarUrl = await storage.composePublicUrl(key);
    await query(
      `UPDATE users SET avatar_url = $2, updated_at = NOW() WHERE id = $1`,
      [userId, avatarUrl],
    );

    return sendSuccess(res, {
      data: {
        avatar_url: avatarUrl,
        width: encoded.width,
        height: encoded.height,
        original_mime: detected.mime,
      },
      message: "Avatar uploaded",
    });
  } catch (err) { next(err); }
}

// ---------------------------------------------------------------------------
// GET /api/v1/users/profile/stats — full private stats
// ---------------------------------------------------------------------------

async function getProfileStats(req, res, next) {
  try {
    const userId = req.user.id;

    // Helper: catch individual query failures so one missing table/column
    // doesn't break the entire endpoint (production has only migrations 0001-0010).
    const safe = (promise) => promise.catch((err) => {
      console.error("[profileStats] query failed:", err.message);
      return { rows: [], rowCount: 0 };
    });

    // 1. User query — only select columns guaranteed by migration 0001.
    //    Optional columns (from later migrations) are fetched separately.
    const userRow = await query(
      `SELECT name, avatar_url, created_at FROM users WHERE id = $1`, [userId]
    );
    const user = userRow.rows[0];
    if (!user) {
      return sendError(res, { status: 404, message: "User not found" });
    }

    // 2. Try to fetch optional user columns added by migrations 0013-0024.
    //    If columns don't exist yet, safe() returns empty and we use defaults.
    const optionalUserRow = await safe(query(
      `SELECT username, bio, location, target_band, estimated_band, band_history, is_pro, friend_count FROM users WHERE id = $1`, [userId]
    ));
    const optUser = optionalUserRow.rows[0] || {};

    // 3. Remaining queries — all individually safe.
    const [xpRow, streakRow, badgesRow, speakingRow, writingRow, battleRow, totalUsersRow] = await Promise.all([
      safe(query(`SELECT COALESCE(SUM(delta), 0)::int AS total_xp FROM xp_ledger WHERE user_id = $1`, [userId])),
      safe(query(`SELECT current_streak, longest_streak FROM user_streaks WHERE user_id = $1`, [userId])),
      safe(query(`SELECT b.slug, b.name FROM user_badges ub JOIN badges b ON b.id = ub.badge_id WHERE ub.user_id = $1`, [userId])),
      safe(query(`SELECT COUNT(*)::int AS total, COALESCE(AVG(overall_score), 0)::int AS avg_score FROM scenario_sessions WHERE user_id = $1 AND status = 'completed'`, [userId])),
      safe(query(`SELECT COUNT(*)::int AS total, COALESCE(AVG(overall_band), 0) AS avg_band FROM writing_submissions WHERE user_id = $1 AND status = 'completed'`, [userId])),
      safe(query(`SELECT current_rank_points, current_rank_tier, wins, losses FROM battle_player_profiles WHERE user_id = $1`, [userId])),
      safe(query(`SELECT COUNT(*)::int AS total FROM users WHERE deleted_at IS NULL`, [])),
    ]);

    const totalXp = xpRow.rows[0]?.total_xp ?? 0;
    const THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];
    let level = 1;
    for (let i = THRESHOLDS.length - 1; i >= 0; i--) {
      if (totalXp >= THRESHOLDS[i]) { level = i + 1; break; }
    }

    // Percentile calculation
    let percentile = 50;
    try {
      const totalUsers = totalUsersRow.rows[0]?.total ?? 1;
      const higherXpCount = await query(`SELECT COUNT(*)::int AS count FROM xp_ledger GROUP BY user_id HAVING SUM(delta) > $1`, [totalXp]);
      percentile = Math.max(1, Math.round((1 - (higherXpCount.rowCount || 0) / totalUsers) * 100));
    } catch (err) {
      console.error("[profileStats] percentile query failed:", err.message);
    }

    const battle = battleRow.rows[0];
    const streak = streakRow.rows[0];

    return sendSuccess(res, {
      data: {
        user: {
          name: user.name,
          username: optUser.username ?? null,
          bio: optUser.bio ?? null,
          location: optUser.location ?? null,
          avatar_url: user.avatar_url,
          target_band: optUser.target_band ? Number(optUser.target_band) : null,
          estimated_band: optUser.estimated_band ? Number(optUser.estimated_band) : null,
          band_history: optUser.band_history || [],
          is_pro: optUser.is_pro ?? false,
          joined_at: user.created_at,
        },
        gamification: {
          totalXp, level,
          currentStreak: streak?.current_streak ?? 0,
          longestStreak: streak?.longest_streak ?? 0,
          badges: badgesRow.rows,
        },
        battle: {
          rank_tier: battle?.current_rank_tier ?? "iron",
          rank_points: battle?.current_rank_points ?? 0,
          wins: battle?.wins ?? 0, losses: battle?.losses ?? 0,
        },
        speaking: { totalSessions: speakingRow.rows[0]?.total ?? 0, avgScore: speakingRow.rows[0]?.avg_score ?? 0 },
        writing: { totalSubmissions: writingRow.rows[0]?.total ?? 0, avgBand: writingRow.rows[0]?.avg_band ? Number(writingRow.rows[0].avg_band) : null },
        social: { friendCount: optUser.friend_count ?? 0 },
        leaderboard: { percentile },
      },
      message: "Profile stats retrieved",
    });
  } catch (err) { next(err); }
}

// ---------------------------------------------------------------------------
// GET /api/v1/profile/:username — public profile
// ---------------------------------------------------------------------------

async function getPublicProfile(req, res, next) {
  try {
    const { username } = req.params;
    const result = await query(
      `SELECT id, name, username, bio, location, avatar_url, target_band, estimated_band, is_pro, created_at
         FROM users WHERE username = $1 AND deleted_at IS NULL`,
      [username]
    );
    const user = result.rows[0];
    if (!user) return sendError(res, { status: 404, message: "User not found" });

    const [xpRow, streakRow, badgesRow, battleRow] = await Promise.all([
      query(`SELECT COALESCE(SUM(delta), 0)::int AS total_xp FROM xp_ledger WHERE user_id = $1`, [user.id]),
      query(`SELECT current_streak FROM user_streaks WHERE user_id = $1`, [user.id]),
      query(`SELECT b.slug, b.name FROM user_badges ub JOIN badges b ON b.id = ub.badge_id WHERE ub.user_id = $1`, [user.id]),
      query(`SELECT current_rank_tier, current_rank_points, wins FROM battle_player_profiles WHERE user_id = $1`, [user.id]),
    ]);

    const totalXp = xpRow.rows[0]?.total_xp ?? 0;
    const THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];
    let level = 1;
    for (let i = THRESHOLDS.length - 1; i >= 0; i--) {
      if (totalXp >= THRESHOLDS[i]) { level = i + 1; break; }
    }

    return sendSuccess(res, {
      data: {
        name: user.name, username: user.username, bio: user.bio, location: user.location,
        avatar_url: user.avatar_url,
        target_band: user.target_band ? Number(user.target_band) : null,
        estimated_band: user.estimated_band ? Number(user.estimated_band) : null,
        is_pro: user.is_pro, joined_at: user.created_at,
        totalXp, level,
        streak: streakRow.rows[0]?.current_streak ?? 0,
        badges: badgesRow.rows,
        battle: {
          rank_tier: battleRow.rows[0]?.current_rank_tier ?? "iron",
          rank_points: battleRow.rows[0]?.current_rank_points ?? 0,
          wins: battleRow.rows[0]?.wins ?? 0,
        },
      },
      message: "Public profile",
    });
  } catch (err) { next(err); }
}

module.exports = { updateProfile, uploadAvatar, getProfileStats, getPublicProfile };
