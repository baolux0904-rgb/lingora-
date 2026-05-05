/**
 * controllers/onboardingController.js
 *
 * Onboarding flow: status check, complete, skip.
 */

const { query } = require("../config/db");
const { sendSuccess, sendError } = require("../response");
const { isValidBand } = require("../domain/ielts");

// Self-report floor: a learner who genuinely has no IELTS exposure should
// pick "Chưa biết" (null) rather than 0.0–2.5. Anchoring the floor at 3.0
// keeps the dropdown short and aligned with band descriptors that exist
// for the level (band 3 = "extremely limited user").
const SELF_REPORT_MIN_BAND = 3.0;
const SELF_REPORT_MAX_BAND = 9.0;

// Wave 6 Sprint 4E.1 — bucket value allowlists for the 3 optional
// onboarding fields shipped Sprint 4D. Mirror the migration-0057
// CHECK constraints exactly so we surface a friendly 400 before the
// DB rejects with a constraint error.
const VALID_EXAM_DATE_BUCKETS = ["1m", "2-3m", "4-6m", "no_plan"];
const VALID_STUDY_HOURS_BUCKETS = ["3-5h", "6-10h", "10h+"];
const VALID_EXAM_TYPES = ["academic", "general"];

/**
 * Reads an optional bucket field from req.body. Returns:
 *   - undefined if the key is absent (legacy client — leave column untouched)
 *   - null if explicit null (clear the field)
 *   - the value if it matches the allowlist
 * Throws a 400-tagged Error on any other shape.
 */
function parseBucket(raw, fieldName, allowlist) {
  if (raw === undefined) return undefined;
  if (raw === null) return null;
  if (typeof raw !== "string" || !allowlist.includes(raw)) {
    const err = new Error(
      `${fieldName} must be null or one of: ${allowlist.join(", ")}.`,
    );
    err.status = 400;
    throw err;
  }
  return raw;
}

/**
 * Accepts the self-reported IELTS band from the onboarding dropdown.
 * Returns:
 *   - undefined when the field is absent (older client, ignore)
 *   - null when the user picked "Chưa biết"
 *   - a half-band number in [3.0, 9.0]
 * Throws a 400 on any other shape.
 */
function parseSelfReportedBand(raw) {
  if (raw === undefined) return undefined;        // legacy client — leave column untouched
  if (raw === null)      return null;             // explicit "Chưa biết" — set NULL
  const num = Number(raw);
  if (!isValidBand(num) || num < SELF_REPORT_MIN_BAND || num > SELF_REPORT_MAX_BAND) {
    const err = new Error(
      `self_reported_band must be null or a half-band between ${SELF_REPORT_MIN_BAND} and ${SELF_REPORT_MAX_BAND}.`,
    );
    err.status = 400;
    throw err;
  }
  return num;
}

async function getStatus(req, res, next) {
  try {
    // Wave 6 Sprint 4E.1 — extended response carries the deferred
    // marker so the /home banner (Sprint 4E.2) can decide whether to
    // prompt resumption. has_deferred_onboarding is a derived boolean
    // from the migration-0057 onboarding_deferred_at column;
    // deferred_at is the raw ISO timestamp for analytics.
    const result = await query(
      `SELECT has_completed_onboarding, target_band, onboarding_skipped,
              onboarding_deferred_at
         FROM users
        WHERE id = $1`,
      [req.user.id]
    );
    const user = result.rows[0];
    const deferredAt = user?.onboarding_deferred_at ?? null;
    return sendSuccess(res, {
      data: {
        has_completed_onboarding: user?.has_completed_onboarding ?? false,
        target_band: user?.target_band ? Number(user.target_band) : null,
        onboarding_skipped: user?.onboarding_skipped ?? false,
        has_deferred_onboarding: deferredAt !== null,
        deferred_at: deferredAt
          ? (deferredAt instanceof Date ? deferredAt.toISOString() : deferredAt)
          : null,
      },
      message: "Onboarding status",
    });
  } catch (err) { next(err); }
}

async function complete(req, res, next) {
  try {
    const { target_band } = req.body;
    let selfBand;
    try {
      selfBand = parseSelfReportedBand(req.body.self_reported_band);
    } catch (e) {
      return sendError(res, { status: 400, message: e.message });
    }

    // Wave 6 Sprint 4E.1 — optional personalisation fields shipped
    // Sprint 4D. Backwards-compat: the 4D frontend send the body key
    // `exam_date` (not `exam_date_bucket`); accept either to keep the
    // already-deployed client working. The 4E.2 frontend will
    // canonicalise to the column-matching name, at which point the
    // legacy alias can be dropped.
    let examDateBucket, studyHoursPerWeek, examType;
    try {
      examDateBucket = parseBucket(
        req.body.exam_date_bucket ?? req.body.exam_date,
        "exam_date_bucket",
        VALID_EXAM_DATE_BUCKETS,
      );
      studyHoursPerWeek = parseBucket(
        req.body.study_hours_per_week,
        "study_hours_per_week",
        VALID_STUDY_HOURS_BUCKETS,
      );
      examType = parseBucket(
        req.body.exam_type,
        "exam_type",
        VALID_EXAM_TYPES,
      );
    } catch (e) {
      return sendError(res, { status: 400, message: e.message });
    }

    // estimated_band is updated only when the client sent the key. This
    // protects the 7 prod users who completed onboarding before this
    // field existed: their stored band is left alone. New clients always
    // send the field (null = "Chưa biết", else the chosen half-band).
    //
    // The 3 optional bucket fields follow the same partial-update
    // pattern: if the key is absent (undefined), we don't touch the
    // column. If null, we explicitly clear it. Otherwise persist.
    // Built dynamically so a legacy client that sends only the band
    // pair still gets a clean UPDATE.
    const setClauses = [
      "has_completed_onboarding = true",
      "target_band              = $2",
      "onboarding_skipped       = false",
      "updated_at               = now()",
    ];
    const params = [req.user.id, target_band ?? null];

    if (selfBand !== undefined) {
      params.push(selfBand);
      setClauses.push(`estimated_band = $${params.length}`);
    }
    if (examDateBucket !== undefined) {
      params.push(examDateBucket);
      setClauses.push(`exam_date_bucket = $${params.length}`);
    }
    if (studyHoursPerWeek !== undefined) {
      params.push(studyHoursPerWeek);
      setClauses.push(`study_hours_per_week = $${params.length}`);
    }
    if (examType !== undefined) {
      params.push(examType);
      setClauses.push(`exam_type = $${params.length}`);
    }

    await query(
      `UPDATE users SET ${setClauses.join(", ")} WHERE id = $1`,
      params,
    );
    return sendSuccess(res, { message: "Onboarding completed" });
  } catch (err) { next(err); }
}

async function skip(req, res, next) {
  try {
    await query(
      `UPDATE users SET has_completed_onboarding = true, onboarding_skipped = true, updated_at = now() WHERE id = $1`,
      [req.user.id]
    );
    return sendSuccess(res, { message: "Onboarding skipped" });
  } catch (err) { next(err); }
}

/**
 * POST /api/v1/users/onboarding/defer (Wave 6 Sprint 4E.1).
 *
 * Sets onboarding_deferred_at to now() WITHOUT flipping
 * has_completed_onboarding or onboarding_skipped. The /home banner
 * (Sprint 4E.2) reads has_deferred_onboarding from /onboarding/status
 * to decide whether to prompt resumption.
 *
 * Idempotent: repeat calls preserve the original defer timestamp so
 * "first defer" analytics stay accurate. The WHERE clause restricts
 * the UPDATE to rows where onboarding_deferred_at IS NULL — second
 * call is a 0-row no-op, still returns 200.
 */
async function defer(req, res, next) {
  try {
    await query(
      `UPDATE users
          SET onboarding_deferred_at = now(),
              updated_at             = now()
        WHERE id = $1
          AND onboarding_deferred_at IS NULL`,
      [req.user.id],
    );
    return sendSuccess(res, { message: "Onboarding deferred" });
  } catch (err) { next(err); }
}

module.exports = { getStatus, complete, skip, defer };
