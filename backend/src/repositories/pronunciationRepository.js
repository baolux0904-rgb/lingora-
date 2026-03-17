/**
 * pronunciationRepository.js
 *
 * SQL queries for the pronunciation_attempts table.
 */

const { query } = require("../config/db");

/**
 * Insert a pronunciation attempt row.
 *
 * @param {object} data
 * @param {string} data.userId
 * @param {string} data.speakingPromptId
 * @param {string} data.lessonId
 * @param {string} data.audioStorageKey
 * @param {number|null} data.audioDurationMs
 * @param {number} data.overallScore
 * @param {number} data.accuracyScore
 * @param {number} data.fluencyScore
 * @param {number} data.completenessScore
 * @param {number} data.pronunciationScore
 * @param {Array} data.phonemeDetails
 * @param {Array} data.wordDetails
 * @returns {Promise<object>} the inserted row
 */
async function insertAttempt(data) {
  const result = await query(
    `INSERT INTO pronunciation_attempts
       (user_id, speaking_prompt_id, lesson_id, audio_storage_key,
        audio_duration_ms, overall_score, accuracy_score, fluency_score,
        completeness_score, pronunciation_score, phoneme_details, word_details)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      data.userId,
      data.speakingPromptId,
      data.lessonId,
      data.audioStorageKey,
      data.audioDurationMs ?? null,
      data.overallScore,
      data.accuracyScore,
      data.fluencyScore,
      data.completenessScore,
      data.pronunciationScore,
      JSON.stringify(data.phonemeDetails),
      JSON.stringify(data.wordDetails),
    ]
  );
  return result.rows[0];
}

/**
 * Get the best attempt (highest overall_score) per speaking_prompt for a user+lesson.
 * Used to compute average speaking score for lesson completion.
 *
 * @param {string} userId
 * @param {string} lessonId
 * @returns {Promise<object[]>}
 */
async function findBestByLessonAndUser(userId, lessonId) {
  const result = await query(
    `SELECT DISTINCT ON (speaking_prompt_id)
       id, user_id, speaking_prompt_id, lesson_id,
       overall_score, accuracy_score, fluency_score,
       completeness_score, pronunciation_score,
       word_details, phoneme_details, created_at
     FROM pronunciation_attempts
     WHERE user_id = $1 AND lesson_id = $2
     ORDER BY speaking_prompt_id, overall_score DESC, created_at DESC`,
    [userId, lessonId]
  );
  return result.rows;
}

/**
 * Get all attempts for a user+prompt, newest first.
 *
 * @param {string} userId
 * @param {string} promptId
 * @returns {Promise<object[]>}
 */
async function findByUserAndPrompt(userId, promptId) {
  const result = await query(
    `SELECT id, user_id, speaking_prompt_id, lesson_id,
       audio_storage_key, audio_duration_ms,
       overall_score, accuracy_score, fluency_score,
       completeness_score, pronunciation_score,
       word_details, phoneme_details, created_at
     FROM pronunciation_attempts
     WHERE user_id = $1 AND speaking_prompt_id = $2
     ORDER BY created_at DESC`,
    [userId, promptId]
  );
  return result.rows;
}

/**
 * Get speaking metrics for a user over the last N days.
 * Returns daily aggregates (date, avg score, attempt count) + overall summary.
 *
 * @param {string} userId
 * @param {number} [days=30] – look-back window
 * @returns {Promise<object[]>} rows: { date, avg_score, attempt_count }
 */
async function getMetricsByUser(userId, days = 30) {
  const result = await query(
    `SELECT
       DATE(created_at AT TIME ZONE 'UTC') AS date,
       ROUND(AVG(overall_score)::numeric, 1)::float AS avg_score,
       COUNT(*)::int                                  AS attempt_count
     FROM pronunciation_attempts
     WHERE user_id = $1
       AND created_at >= NOW() - ($2 || ' days')::INTERVAL
     GROUP BY DATE(created_at AT TIME ZONE 'UTC')
     ORDER BY date ASC`,
    [userId, days]
  );
  return result.rows;
}

/**
 * Get the most recent overall score for a user (latest single attempt).
 *
 * @param {string} userId
 * @returns {Promise<number|null>}
 */
async function getLatestScore(userId) {
  const result = await query(
    `SELECT overall_score
     FROM pronunciation_attempts
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );
  return result.rows[0]?.overall_score ?? null;
}

module.exports = {
  insertAttempt,
  findBestByLessonAndUser,
  findByUserAndPrompt,
  getMetricsByUser,
  getLatestScore,
};
