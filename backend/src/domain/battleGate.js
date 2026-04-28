/**
 * domain/battleGate.js
 *
 * Soul §1 / Battle Arena MVP rule: a learner must complete N Reading
 * practices before entering Battle. Gates the entry sites (queue,
 * direct challenge, accept challenge) so a brand-new user is not
 * dropped into a 1v1 ranked match before they have seen the format.
 *
 * Single source of truth for the threshold. Pure data — no DB, no I/O.
 */

"use strict";

const BATTLE_PRACTICE_GATE = 5;

const BATTLE_GATE_ERROR_CODE = "BATTLE_GATE_PRACTICE_REQUIRED";

module.exports = Object.freeze({
  BATTLE_PRACTICE_GATE,
  BATTLE_GATE_ERROR_CODE,
});
