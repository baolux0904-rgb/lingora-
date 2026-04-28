/**
 * domain/profileVisibility.js
 *
 * Pure-function field filtering + gate for the public profile endpoint
 * (Wave 2.8, GET /api/v1/profile/:username).
 *
 * Two layers:
 *
 *   1. shouldServeProfile(visibility, viewerRelation) — boolean. False
 *      means the endpoint MUST 404. Same response as a non-existent
 *      username, so visibility=private cannot be used as a username
 *      enumeration oracle.
 *
 *   2. filterProfileFields(profile, viewerRelation) — projects the
 *      always-tier vs friends-only fields. Friends-only fields are
 *      stripped for stranger/unauth viewers REGARDLESS of visibility
 *      (so a public profile still hides bio/location/band from random
 *      visitors). Self/friend always see the full record.
 *
 * Threat model assumed by the caller:
 *   - viewerRelation MUST be derived from authenticated viewer.id +
 *     a server-side isFriend() check. NEVER from query string, body
 *     field, header, or cookie alone.
 *   - Anonymized (deleted_at IS NOT NULL) profiles MUST be filtered
 *     out before this module is called — repository layer responsibility.
 */

"use strict";

/** @typedef {'public'|'friends'|'private'} Visibility */
/** @typedef {'self'|'friend'|'stranger'|'unauth'} ViewerRelation */

const VISIBILITIES = Object.freeze(["public", "friends", "private"]);
const VIEWER_RELATIONS = Object.freeze(["self", "friend", "stranger", "unauth"]);

/**
 * Always-shown identity tier — gamification, public handle, level. No PII.
 * Used to keep field-projection logic in one place.
 */
const ALWAYS_FIELDS = Object.freeze([
  "username", "name", "avatar_url", "is_pro",
  "totalXp", "level", "streak", "badges", "battle",
]);

/**
 * Friends-only tier — sensitive personal info. Hidden from
 * stranger/unauth viewers no matter what visibility is set to.
 */
const FRIENDS_ONLY_FIELDS = Object.freeze([
  "bio", "location",
  "estimated_band", "target_band",
  "joined_at",
]);

/**
 * Decide whether the endpoint should respond at all.
 *
 * @param {Visibility} visibility
 * @param {ViewerRelation} viewerRelation
 * @returns {boolean} true → serve a (possibly filtered) profile; false → 404
 */
function shouldServeProfile(visibility, viewerRelation) {
  if (!VISIBILITIES.includes(visibility)) return false;
  if (!VIEWER_RELATIONS.includes(viewerRelation)) return false;

  if (viewerRelation === "self") return true;
  if (viewerRelation === "friend") return true;

  // stranger or unauth
  return visibility === "public";
}

/**
 * Project a profile object based on viewer relation.
 *
 * Self and friends see the full record (FRIENDS_ONLY_FIELDS preserved).
 * Strangers/unauth see only ALWAYS_FIELDS — even on a public profile.
 *
 * The caller must already have decided shouldServeProfile() returned
 * true; if it didn't, this function should not be called (caller 404s).
 *
 * @param {object} profile - raw profile object from the controller
 * @param {ViewerRelation} viewerRelation
 * @returns {object}
 */
function filterProfileFields(profile, viewerRelation) {
  if (viewerRelation === "self" || viewerRelation === "friend") {
    return { ...profile };
  }

  // stranger / unauth → strip friends-only fields.
  const filtered = {};
  for (const key of Object.keys(profile)) {
    if (FRIENDS_ONLY_FIELDS.includes(key)) continue;
    filtered[key] = profile[key];
  }
  return filtered;
}

module.exports = Object.freeze({
  VISIBILITIES,
  VIEWER_RELATIONS,
  ALWAYS_FIELDS,
  FRIENDS_ONLY_FIELDS,
  shouldServeProfile,
  filterProfileFields,
});
