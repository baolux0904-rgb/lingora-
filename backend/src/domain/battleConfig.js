"use strict";

/**
 * domain/battleConfig.js
 *
 * Single source for battle-system constants that the service + repo
 * layers reference. Pure data — no DB, no I/O.
 *
 * Co-located with the existing PRACTICE_GATE in domain/battleGate.js;
 * re-exported here so consumers can import everything battle-related
 * from one module. battleGate.js stays as-is to keep its dedicated
 * error-code surface intact.
 */

const { BATTLE_PRACTICE_GATE } = require("./battleGate");

/**
 * SUBMISSION_DEADLINE_MINUTES
 *
 * Per-match window from "match active" → submission must arrive.
 * Past this point, expireOverdueMatches() forfeits the late side.
 * 30 min keeps the async ranked loop tight enough that an opponent
 * isn't left waiting an evening for an answer.
 */
const SUBMISSION_DEADLINE_MINUTES = 30;

/**
 * RANK_TIERS
 *
 * Point-threshold ladder. tierFromPoints() walks the array from the
 * top (highest minPoints first) so the first match wins. Keep ordered
 * ASC by minPoints — readers and tests rely on that order.
 *
 * The top tier's range is open-ended; callers must not iterate to a
 * fixed maxPoints.
 */
const RANK_TIERS = Object.freeze([
  Object.freeze({ name: "iron",       minPoints: 0 }),
  Object.freeze({ name: "bronze",     minPoints: 200 }),
  Object.freeze({ name: "silver",     minPoints: 400 }),
  Object.freeze({ name: "gold",       minPoints: 700 }),
  Object.freeze({ name: "platinum",   minPoints: 1000 }),
  Object.freeze({ name: "diamond",    minPoints: 1400 }),
  Object.freeze({ name: "challenger", minPoints: 1800 }),
]);

module.exports = Object.freeze({
  SUBMISSION_DEADLINE_MINUTES,
  RANK_TIERS,
  PRACTICE_GATE: BATTLE_PRACTICE_GATE,
});
