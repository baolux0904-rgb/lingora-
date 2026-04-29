"use strict";

/**
 * repositories/analyticsRepository.js
 *
 * Insert path for self-host analytics (Wave 4.13). Reads are deferred
 * to a future admin endpoint — keep this module write-only for now.
 */

const { query } = require("../config/db");

/**
 * Insert one event row.
 *
 * @param {object}  event
 * @param {string}  event.event_name
 * @param {object}  event.properties   already-sanitised
 * @param {string|null} event.user_id  null for anonymous tracking
 * @param {string}  event.session_id
 * @returns {Promise<void>}
 */
async function insertEvent({ event_name, properties, user_id, session_id }) {
  await query(
    `INSERT INTO analytics_events (event_name, properties, user_id, session_id)
     VALUES ($1, $2::jsonb, $3, $4)`,
    [event_name, JSON.stringify(properties ?? {}), user_id ?? null, session_id]
  );
}

module.exports = { insertEvent };
