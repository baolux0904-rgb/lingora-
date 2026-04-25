/**
 * lib/seedDb.js
 *
 * Insert one parsed test into the listening_* tables. Idempotent on
 * (cambridge_book, test_number, mode). One BEGIN/COMMIT transaction.
 *
 * Uses query() from backend/src/config/db.js directly — this is one-shot
 * tooling, no service layer.
 */

"use strict";

const { query, pool } = require("../../../src/config/db");

/**
 * @param {import("../schemas/testData").TestData} testData
 * @param {{ audioKeys: object, mapKeys: Record<string,string> }} keys
 * @returns {Promise<{ testId: string|null, partIds: string[], questionGroupCount: number, questionCount: number, skipped: boolean }>}
 */
async function seedTest(testData, keys) {
  const { cambridgeBook, testNumber, mode, totalDurationSeconds, parts } = testData;

  // Idempotency check
  const existing = await query(
    `SELECT id FROM listening_tests WHERE cambridge_book = $1 AND test_number = $2 AND mode = $3`,
    [cambridgeBook, testNumber, mode]
  );
  if (existing.rows[0]) {
    console.log(`  [db] SKIP — listening_tests row exists (id=${existing.rows[0].id})`);
    return {
      testId: existing.rows[0].id,
      partIds: [],
      questionGroupCount: 0,
      questionCount: 0,
      skipped: true,
    };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. listening_tests
    const tRes = await client.query(
      `INSERT INTO listening_tests (cambridge_book, test_number, mode, total_duration_seconds)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [cambridgeBook, testNumber, mode, totalDurationSeconds || 0]
    );
    const testId = tRes.rows[0].id;
    const partIds = [];
    let questionGroupCount = 0;
    let questionCount = 0;

    // 2. listening_parts (4 rows)
    for (const part of parts) {
      const audioKey = keys.audioKeys[`part${part.partNumber}`];
      if (!audioKey) throw new Error(`missing R2 audioKey for part ${part.partNumber}`);

      const pRes = await client.query(
        `INSERT INTO listening_parts
           (test_id, part_number, topic, description, audio_url, audio_duration_seconds, transcript)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          testId,
          part.partNumber,
          part.topic || null,
          part.description || null,
          audioKey,
          part.audioDurationSeconds,
          part.transcript,
        ]
      );
      const partId = pRes.rows[0].id;
      partIds.push(partId);

      // 3. listening_question_groups
      for (const group of part.questionGroups) {
        // attach map key into metadata if present
        const mapKey = keys.mapKeys[`part${part.partNumber}`];
        const metadata =
          mapKey &&
          (group.questionType === "map_labelling" || group.questionType === "plan_diagram_labelling")
            ? { ...group.metadata, mapImageKey: mapKey }
            : group.metadata;

        const gRes = await client.query(
          `INSERT INTO listening_question_groups
             (part_id, question_type, instructions, display_order, metadata)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [
            partId,
            group.questionType,
            group.instructions,
            group.displayOrder,
            JSON.stringify(metadata || {}),
          ]
        );
        const groupId = gRes.rows[0].id;
        questionGroupCount++;

        // 4. listening_questions
        for (const q of group.questions) {
          await client.query(
            `INSERT INTO listening_questions
               (group_id, question_number, question_text, correct_answer, acceptable_answers,
                transcript_quote, audio_segment_start_seconds, audio_segment_end_seconds, display_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              groupId,
              q.questionNumber,
              q.questionText,
              q.correctAnswer,
              Array.isArray(q.acceptableAnswers) ? q.acceptableAnswers : [],
              q.transcriptQuote || null,
              q.audioSegmentStartSeconds ?? null,
              q.audioSegmentEndSeconds ?? null,
              q.displayOrder,
            ]
          );
          questionCount++;
        }
      }
    }

    await client.query("COMMIT");
    return { testId, partIds, questionGroupCount, questionCount, skipped: false };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { seedTest };
