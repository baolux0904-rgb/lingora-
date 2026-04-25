/**
 * schemas/testData.js
 *
 * JSDoc typedefs + manual validator for the intermediate JSON the
 * seed pipeline builds before writing to R2 + DB.
 *
 * No runtime schema lib (no Zod / Joi) — matches codebase convention.
 */

"use strict";

/**
 * @typedef {Object} TestData
 * @property {number} cambridgeBook  - 1..14
 * @property {number} testNumber      - 1..4
 * @property {'practice' | 'exam'} mode
 * @property {number} totalDurationSeconds
 * @property {PartData[]} parts       - exactly 4 entries, ordered 1..4
 */

/**
 * @typedef {Object} PartData
 * @property {number} partNumber      - 1..4
 * @property {string} topic
 * @property {string} description
 * @property {string} audioLocalPath
 * @property {number} audioDurationSeconds
 * @property {string} transcript
 * @property {QuestionGroupData[]} questionGroups
 */

/**
 * @typedef {Object} QuestionGroupData
 * @property {string} questionType
 * @property {string} instructions
 * @property {number} displayOrder
 * @property {Object} metadata
 * @property {QuestionData[]} questions
 */

/**
 * @typedef {Object} QuestionData
 * @property {number} questionNumber
 * @property {string|null} questionText
 * @property {string} correctAnswer
 * @property {string[]} acceptableAnswers
 * @property {string|null} transcriptQuote
 * @property {number|null} audioSegmentStartSeconds
 * @property {number|null} audioSegmentEndSeconds
 * @property {number} displayOrder
 */

const ALLOWED_TYPES = new Set([
  "form_completion",
  "note_completion",
  "sentence_completion",
  "multiple_choice",
  "multiple_choice_multi",
  "matching",
  "map_labelling",
  "plan_diagram_labelling",
  "short_answer",
  "flow_chart_completion",
]);

const LETTER_RE = /^[A-Z](?:\s*,\s*[A-Z])*$/;

/**
 * Validate a TestData object. Returns { valid, errors }.
 *
 * @param {TestData} data
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateTestData(data) {
  const errors = [];
  const push = (m) => errors.push(m);

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["data is not an object"] };
  }
  if (typeof data.cambridgeBook !== "number" || data.cambridgeBook < 1 || data.cambridgeBook > 14) {
    push(`cambridgeBook must be 1..14 (got ${data.cambridgeBook})`);
  }
  if (typeof data.testNumber !== "number" || data.testNumber < 1 || data.testNumber > 4) {
    push(`testNumber must be 1..4 (got ${data.testNumber})`);
  }
  if (data.mode !== "practice" && data.mode !== "exam") {
    push(`mode must be 'practice' or 'exam' (got ${data.mode})`);
  }
  if (!Array.isArray(data.parts) || data.parts.length !== 4) {
    push(`parts must be an array of exactly 4 (got ${data.parts?.length})`);
    return { valid: false, errors };
  }

  const seenPartNumbers = new Set();
  const seenQuestionNumbers = [];
  const allowedQTypesPerGroup = [];

  for (const [pi, part] of data.parts.entries()) {
    const pref = `parts[${pi}]`;
    if (typeof part.partNumber !== "number" || part.partNumber < 1 || part.partNumber > 4) {
      push(`${pref}.partNumber must be 1..4 (got ${part.partNumber})`);
    }
    if (seenPartNumbers.has(part.partNumber)) push(`${pref}.partNumber duplicate (${part.partNumber})`);
    seenPartNumbers.add(part.partNumber);

    if (typeof part.transcript !== "string") {
      push(`${pref}.transcript must be a string (may be empty if sourced separately)`);
    }
    if (typeof part.audioDurationSeconds !== "number" || part.audioDurationSeconds < 1) {
      push(`${pref}.audioDurationSeconds must be > 0`);
    }
    if (!Array.isArray(part.questionGroups) || part.questionGroups.length === 0) {
      push(`${pref}.questionGroups must be a non-empty array`);
      continue;
    }

    for (const [gi, group] of part.questionGroups.entries()) {
      const gref = `${pref}.questionGroups[${gi}]`;
      if (!ALLOWED_TYPES.has(group.questionType)) {
        push(`${gref}.questionType invalid: ${group.questionType}`);
      }
      if (typeof group.instructions !== "string" || group.instructions.trim() === "") {
        push(`${gref}.instructions missing`);
      }
      if (typeof group.metadata !== "object" || group.metadata === null) {
        push(`${gref}.metadata must be an object`);
      } else {
        if (group.questionType === "map_labelling" || group.questionType === "plan_diagram_labelling") {
          const md = group.metadata;
          const hasKey = typeof md.mapImageKey === "string" && md.mapImageKey.length > 0;
          const needs = md.needsManualMapImage === true;
          if (!hasKey && !needs) {
            push(`${gref}.metadata for ${group.questionType} must set mapImageKey OR needsManualMapImage:true`);
          }
        }
        if (group.questionType === "matching") {
          if (!Array.isArray(group.metadata.options) || group.metadata.options.length === 0) {
            push(`${gref}.metadata.options must be a non-empty array for matching`);
          }
        }
      }
      if (!Array.isArray(group.questions) || group.questions.length === 0) {
        push(`${gref}.questions must be a non-empty array`);
        continue;
      }
      for (const [qi, q] of group.questions.entries()) {
        const qref = `${gref}.questions[${qi}]`;
        if (typeof q.questionNumber !== "number") {
          push(`${qref}.questionNumber must be a number`);
        } else {
          seenQuestionNumbers.push(q.questionNumber);
          allowedQTypesPerGroup.push({ qNum: q.questionNumber, type: group.questionType, answer: q.correctAnswer });
        }
        if (typeof q.correctAnswer !== "string" || q.correctAnswer.trim() === "") {
          push(`${qref}.correctAnswer must be a non-empty string`);
        }
        if (!Array.isArray(q.acceptableAnswers)) {
          push(`${qref}.acceptableAnswers must be an array`);
        }
      }
    }
  }

  // Question numbers contiguous 1..40
  const sorted = [...seenQuestionNumbers].sort((a, b) => a - b);
  if (sorted.length !== 40) {
    push(`expected 40 questions total, got ${sorted.length}`);
  } else {
    for (let i = 0; i < 40; i++) {
      if (sorted[i] !== i + 1) {
        push(`question numbers not contiguous 1..40 — at index ${i} expected ${i + 1}, got ${sorted[i]}`);
        break;
      }
    }
  }

  // MCQ answer letter-shape check
  for (const { qNum, type, answer } of allowedQTypesPerGroup) {
    if (type === "multiple_choice" || type === "multiple_choice_multi") {
      if (typeof answer === "string" && !LETTER_RE.test(answer.replace(/\s+/g, ""))) {
        push(`Q${qNum} (${type}) correctAnswer must be a letter or comma-separated letters (got "${answer}")`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validateTestData, ALLOWED_TYPES };
