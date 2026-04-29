"use strict";

/**
 * domain/freeTrial.js
 *
 * Single source for the free-trial duration. Used by the Pro upgrade
 * controller when stamping users.trial_expires_at and by any messaging
 * surface that mentions the trial length. Kept as its own module so
 * future trial-related constants (eligibility window, max retries,
 * etc.) have an obvious home.
 */

const FREE_TRIAL_DAYS = 3;
const FREE_TRIAL_MS   = FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000;

module.exports = Object.freeze({
  FREE_TRIAL_DAYS,
  FREE_TRIAL_MS,
});
