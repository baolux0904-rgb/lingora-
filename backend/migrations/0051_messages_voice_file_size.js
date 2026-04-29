/* eslint-disable camelcase */

/**
 * Migration 0051 — Voice message file size column (Wave 4.12).
 *
 * Adds messages.voice_file_size_bytes (BIGINT, NULL) so the voice-note
 * upload path can persist the actual byte size of the uploaded blob.
 * Drives the daily voice quota check (50 MB/day for free users) without
 * round-tripping to R2 to inspect object size on every send.
 *
 * NULL semantics:
 *   - Existing rows (pre-migration voice notes uploaded during Wave 1.4)
 *     stay NULL. The quota query SUMs and treats NULL as 0, so legacy
 *     usage is forgiven once — acceptable; there are 7 prod users and
 *     voice-note count is small enough that backfilling from R2 head
 *     requests is more risk than it's worth.
 *   - Text messages also stay NULL — they are not bound by voice quota.
 *
 * Lessons baked in:
 *   - No README in this directory (lesson 2.10 hotfix 3).
 *   - No inner-quote string defaults (lesson 0047 — moot here, no
 *     defaults).
 *   - No now()/non-IMMUTABLE in index predicates (lesson 0049 — moot
 *     here, no partial indexes).
 *   - Kept narrow: BIGINT covers any plausible audio blob (max int4 is
 *     ~2 GB; we cap at 5 MB but BIGINT future-proofs the column).
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns("messages", {
    voice_file_size_bytes: { type: "bigint" },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns("messages", ["voice_file_size_bytes"]);
};
