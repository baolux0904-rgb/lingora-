/**
 * jobs/fullTestExpiry.js
 *
 * Sweeps `writing_full_tests` where status='in_progress' and
 * started_at < now() - FULL_TEST_EXPIRY_HOURS. Runs hourly.
 *
 * For each overdue row:
 *   - 2 submissions linked → finalize normally (weighted band, status='submitted').
 *     A user who wrote both essays in time shouldn't lose their result just
 *     because the finalize call never fired.
 *   - 0 or 1 submission  → markExpired (status='expired', submitted_at=now()).
 *
 * Pure expireOverdueRuns() is injectable for tests. scheduleExpiry()
 * registers the cron (skipped under NODE_ENV=test).
 */

"use strict";

const cron = require("node-cron");
const defaultRepo = require("../repositories/writingFullTestRepository");
const defaultService = require("../services/writingFullTestService");

const DEFAULT_EXPIRY_HOURS = 3;
// Every hour at :05 UTC — offset from the scoring-cache eviction slot.
const SCHEDULE_UTC = "5 * * * *";

function readConfig() {
  const raw = process.env.FULL_TEST_EXPIRY_HOURS;
  const parsed = Number.parseFloat(raw ?? "");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_EXPIRY_HOURS;
}

/**
 * Run one expiry pass. Returns a report for the cron logger + tests.
 *
 * @param {object} [opts]
 * @param {number} [opts.expiryHours]
 * @param {object} [opts.repo]     — injectable full-test repository
 * @param {object} [opts.service]  — injectable full-test service (for finalize)
 */
async function expireOverdueRuns(opts = {}) {
  const {
    expiryHours = DEFAULT_EXPIRY_HOURS,
    repo = defaultRepo,
    service = defaultService,
  } = opts;

  const overdue = await repo.listOverdueInProgress(expiryHours);
  let finalized = 0;
  let expired = 0;
  let failed = 0;

  for (const run of overdue) {
    const bothLinked = run.task1_submission_id && run.task2_submission_id;
    try {
      if (bothLinked) {
        await service.finalize(run.user_id, run.id);
        finalized += 1;
      } else {
        const elapsedSeconds = Math.max(
          0,
          Math.round((Date.now() - new Date(run.started_at).getTime()) / 1000)
        );
        await repo.markExpired(run.id, elapsedSeconds);
        expired += 1;
      }
    } catch (err) {
      failed += 1;
      console.error(`[fullTestExpiry] run ${run.id} failed: ${err.message}`);
    }
  }

  console.log(
    JSON.stringify({
      event: "full_test_expiry_run",
      overdue_count: overdue.length,
      finalized,
      expired,
      failed,
      expiry_hours: expiryHours,
    })
  );

  return { overdueCount: overdue.length, finalized, expired, failed };
}

function scheduleExpiry() {
  const expiryHours = readConfig();
  console.log(`[fullTestExpiry] Writing Full Test expiry scheduled (hourly; expiry_hours=${expiryHours})`);
  return cron.schedule(
    SCHEDULE_UTC,
    () => {
      expireOverdueRuns({ expiryHours }).catch((err) => {
        console.error(`[fullTestExpiry] run failed: ${err.message}`);
      });
    },
    { timezone: "UTC" }
  );
}

module.exports = { expireOverdueRuns, scheduleExpiry };
