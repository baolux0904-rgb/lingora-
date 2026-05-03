"use strict";

/**
 * repositories/waitlistRepository.js
 *
 * SQL for the waitlist table (migration 0056).
 *
 * Single mutation: insertWaitlist(). UNIQUE constraint on email surfaces
 * as Postgres error code 23505 — the controller distinguishes that from
 * other errors and returns 409 Conflict to the client.
 */

const { query } = require("../config/db");

/**
 * Insert a new waitlist entry. Throws on UNIQUE violation (caller checks
 * err.code === '23505' to surface 409).
 *
 * @param {Object}  params
 * @param {string}  params.email             — already lowercased + trimmed
 * @param {string}  params.name              — already trimmed, length-checked
 * @param {string}  params.interestedTier    — 'free' | 'pro' | 'pro_annual'
 * @param {string|null} params.goalBand      — '5.5' | '6.0' | '6.5' | '7.0' | '7.5+' | 'unsure' | null
 * @param {boolean} params.isStudent
 * @param {string|null} params.ipAddress
 * @param {string|null} params.userAgent
 * @returns {Promise<{ id: string, is_student: boolean, created_at: Date }>}
 */
async function insertWaitlist({
  email,
  name,
  interestedTier,
  goalBand,
  isStudent,
  ipAddress,
  userAgent,
}) {
  const result = await query(
    `INSERT INTO waitlist
       (email, name, interested_tier, goal_band, is_student, source, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, 'landing', $6, $7)
     RETURNING id, is_student, created_at`,
    [email, name, interestedTier, goalBand, isStudent, ipAddress, userAgent]
  );
  return result.rows[0];
}

module.exports = {
  insertWaitlist,
};
