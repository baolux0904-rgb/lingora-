/**
 * lib/extractionPrompt.js
 *
 * Editable prompt templates for the Claude PDF parser.
 * Kept separate so prompt iteration doesn't require touching the parser.
 */

"use strict";

/**
 * Prompt for the FIRST PASS — locate page ranges for the requested test.
 * Cambridge IELTS books are large (~150–250 pages); we narrow before extraction.
 *
 * @param {number} testNumber
 */
function pageLocatorPrompt(testNumber) {
  return `You are looking at the table of contents and structure of a Cambridge IELTS book PDF.

Identify the page ranges for Test ${testNumber}'s LISTENING content only:

1. Question pages — the printed question booklet pages for "Test ${testNumber}" Listening section (Parts 1-4).
2. Audioscript / transcript pages — the back-of-book "Audioscripts" or "Tapescripts" section, specifically the entry labelled "Test ${testNumber}".
3. Answer key pages — the back-of-book "Listening and Reading Answer Keys" or similar, specifically the listening answers for "Test ${testNumber}".

Return ONLY a JSON object, no markdown, no commentary:

{
  "questionPages":   [startPage, endPage],
  "scriptPages":     [startPage, endPage],
  "answerPages":     [startPage, endPage]
}

Page numbers are 1-indexed PDF page numbers (not the printed page numbers in the book).
If you cannot locate one of the sections, set its value to null instead of an array.`;
}

/**
 * Main extraction prompt. Used after the PDF has been sliced to the
 * relevant pages.
 *
 * @param {number} cambridgeBook
 * @param {number} testNumber
 * @param {'practice'|'exam'} mode
 */
function extractionPrompt(cambridgeBook, testNumber, mode) {
  return `You are extracting structured data from Cambridge IELTS ${cambridgeBook}, Test ${testNumber} Listening section. Mode: ${mode}.

The provided PDF pages contain: the questions for Test ${testNumber}'s Listening, the audio scripts (transcripts) for that test's Parts 1-4, and the answer key.

Extract a JSON object matching this exact schema:

{
  "parts": [
    {
      "partNumber": 1,
      "topic": "<short topic name, e.g. 'Booking accommodation'>",
      "description": "<one sentence describing the audio scenario, e.g. 'A man phones a holiday rental agent to enquire about a cottage.'>",
      "transcript": "",
      "questionGroups": [
        {
          "questionType": "<one of: form_completion | note_completion | sentence_completion | multiple_choice | multiple_choice_multi | matching | map_labelling | plan_diagram_labelling | short_answer | flow_chart_completion>",
          "instructions": "<full instructions text shown above the question range, e.g. 'Questions 1–5: Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.'>",
          "displayOrder": 1,
          "metadata": { /* shape depends on questionType — see below */ },
          "questions": [
            {
              "questionNumber": 1,
              "questionText": "<question text, OR null if the question is implicit (e.g. just a blank in a form/note)>",
              "correctAnswer": "<canonical answer from the answer key, e.g. 'Davies' or 'B' or '12.50'>",
              "acceptableAnswers": ["<correctAnswer>", "<any alternates from the answer key separated by '/' or 'OR'>"],
              "transcriptQuote": "<short paraphrase (max 15 words) of where the answer appears in the audio, e.g. 'after the man asks about parking'; do NOT quote verbatim>",
              "displayOrder": 1
            }
          ]
        }
      ]
    }
  ]
}

Metadata shapes by questionType:

- form_completion / note_completion:
    {
      "title": "<form/note title, e.g. 'Holiday Cottage Booking Form'>",
      "rows": [
        { "label": "Name:",         "questionNumber": 1   },
        { "label": "Address line:", "questionNumber": 2   },
        { "label": "(no blank)",    "questionNumber": null }
      ]
    }

- multiple_choice (single-answer A/B/C):
    {
      "letters": ["A", "B", "C"],
      "optionsPerQuestion": [
        { "questionNumber": 6, "options": [ {"letter": "A", "text": "..."}, {"letter": "B", "text": "..."}, {"letter": "C", "text": "..."} ] }
      ]
    }

- multiple_choice_multi (pick exactly 2 letters from longer list):
    {
      "letters": ["A","B","C","D","E"],
      "pickCount": 2,
      "optionsPerQuestion": [...]
    }
    correctAnswer for these is comma-separated, e.g. "B,D"

- matching (one shared box of options reused across the question range):
    {
      "options": [
        { "letter": "A", "text": "Eiffel Tower" },
        { "letter": "B", "text": "Notre Dame" }
      ],
      "reuse": "unique" | "reusable"
    }

- map_labelling / plan_diagram_labelling:
    {
      "letters": ["A","B","C","D","E","F","G"],
      "needsManualMapImage": true,
      "mapDescription": "<brief description of what the map shows so a human can identify which page to crop, e.g. 'Floor plan of community library, with rooms labelled A-G'>"
    }
    (Set needsManualMapImage to true unconditionally — the map image will be cropped from the PDF separately.)

- short_answer / sentence_completion:
    {
      "wordLimit": "<verbatim word-limit phrase from instructions, e.g. 'NO MORE THAN TWO WORDS AND/OR A NUMBER'>"
    }

- flow_chart_completion:
    {
      "title": "<flow chart title>",
      "boxes": [
        { "label": "Step 1: ...",  "questionNumber": null },
        { "label": "Step 2: ___",  "questionNumber": 11   }
      ]
    }

Hard rules:
- Set "transcript" to an empty string "" — full transcripts are sourced separately.
- For "transcriptQuote", give a SHORT paraphrase (max 15 words) describing where in the audio the answer occurs. Do not quote verbatim.
- The values you copy verbatim are limited to: question text, instructions text, MCQ option text, and the correctAnswer/acceptableAnswers from the answer key. Everything else may be paraphrased or omitted.
- If the answer key shows alternates separated by "/" or "OR", split them into acceptableAnswers (always include correctAnswer as the first element).
- For MCQ correctAnswer: a single uppercase letter (e.g. "B") for multiple_choice; comma-separated letters (e.g. "B,D") for multiple_choice_multi.
- displayOrder is 1-indexed sequential within its parent.
- questionNumber is the printed Cambridge question number (1..40 across the test).
- Total questions across all 4 parts must equal exactly 40.

Return ONLY valid JSON, no markdown fences, no commentary.`;
}

module.exports = { extractionPrompt, pageLocatorPrompt };
