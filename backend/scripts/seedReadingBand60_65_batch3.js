/**
 * backend/scripts/seedReadingBand60_65_batch3.js
 *
 * Seeds 3 band_60_65 reading passages (health + society) + questions.
 * Uses a transaction for atomicity. Idempotent — skips existing passages.
 *
 * Usage (from backend/ directory):
 *   node scripts/seedReadingBand60_65_batch3.js
 */

"use strict";

const path = require("path");
const crypto = require("crypto");

const BACKEND_DIR = path.resolve(__dirname, "..");
require("dotenv").config({ path: path.join(BACKEND_DIR, ".env"), override: true });

const { pool } = require(path.join(BACKEND_DIR, "src", "config", "db.js"));

function makeUUID(key) {
  const hash = crypto.createHash("md5").update(key).digest("hex");
  return [hash.slice(0,8), hash.slice(8,12), hash.slice(12,16), hash.slice(16,20), hash.slice(20,32)].join("-");
}

const PASSAGES = [
  {
    id: makeUUID("band60-health-nutrition-research"),
    topic: "health",
    difficulty: "band_60_65",
    estimated_minutes: 7,
    passage_title: "Evolving Insights in Nutrition Research",
    passage_text: "A. Nutrition research has changed significantly over the past few decades, moving beyond simple calorie counting to a more complex understanding of how food affects the body. Scientists now study not only nutrients but also how different diets interact with individual biology. As a result, general dietary advice is increasingly being questioned.\n\nB. One area of focus is the role of macronutrients, such as carbohydrates, proteins, and fats. While earlier research often labeled certain nutrients as entirely beneficial or harmful, newer studies suggest that their effects depend on context. For instance, the source and quality of carbohydrates can influence their impact on health.\n\nC. Another important development is the study of the gut microbiome, the community of microorganisms living in the digestive system. Research indicates that diet can influence this ecosystem, which in turn affects digestion, immunity, and even mental health. However, scientists are still exploring how these relationships work in detail.\n\nD. Despite growing knowledge, nutrition research faces challenges. Results from different studies can sometimes appear contradictory, leading to confusion among the public. Experts suggest that this may be due to differences in research methods and individual variation. Therefore, personalized nutrition may become more important in the future.",
    tags: ["health"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What can be inferred about modern nutrition research?", options: { A: "It focuses only on calorie intake", B: "It recognizes the complexity of diet and individual differences", C: "It has completely replaced traditional methods", D: "It ignores biological factors" }, correct_answer: "B", explanation: "Paragraph A highlights a more complex, individualized approach." },
      { order_index: 2, type: "mcq", question_text: "Why are earlier views on nutrients being reconsidered?", options: { A: "They were based on incorrect measurements", B: "They ignored the role of vitamins", C: "They did not consider context and quality", D: "They focused too much on exercise" }, correct_answer: "C", explanation: "Paragraph B explains that effects depend on context and source." },
      { order_index: 3, type: "mcq", question_text: "What does the passage suggest about research on the gut microbiome?", options: { A: "It is fully understood", B: "It has no link to diet", C: "It shows promising but incomplete findings", D: "It is no longer being studied" }, correct_answer: "C", explanation: "Paragraph C states research is ongoing and not fully understood." },
      { order_index: 4, type: "tfng", question_text: "Modern nutrition research considers individual biological differences.", options: null, correct_answer: "TRUE", explanation: "Paragraph A mentions interaction with individual biology." },
      { order_index: 5, type: "tfng", question_text: "All studies in nutrition research produce the same conclusions.", options: null, correct_answer: "FALSE", explanation: "Paragraph D states results can be contradictory." },
      { order_index: 6, type: "tfng", question_text: "The gut microbiome only affects digestion.", options: null, correct_answer: "FALSE", explanation: "Paragraph C mentions immunity and mental health as well." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Changing understanding of nutrients", B: "Role of microorganisms", C: "Public confusion", D: "Historical background" }, correct_answer: "A", explanation: "Paragraph B discusses re-evaluation of macronutrients." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Scientific agreement", B: "Challenges and future direction", C: "Dietary guidelines", D: "Laboratory methods" }, correct_answer: "B", explanation: "Paragraph D discusses contradictions and personalization." },
    ],
  },
  {
    id: makeUUID("band60-health-exercise-motivation"),
    topic: "health",
    difficulty: "band_60_65",
    estimated_minutes: 7,
    passage_title: "The Psychology Behind Exercise Motivation",
    passage_text: "A. Exercise psychology explores the mental factors that influence physical activity. While many people understand the health benefits of exercise, maintaining a consistent routine can be challenging. Researchers suggest that motivation, habits, and emotional responses all play important roles in determining whether individuals stay active.\n\nB. One key concept in exercise psychology is intrinsic motivation, which refers to engaging in activity for personal satisfaction rather than external rewards. Individuals who enjoy exercise are more likely to continue over time. In contrast, those who rely only on external goals, such as appearance or social approval, may lose motivation more easily.\n\nC. Another factor is the role of habit formation. When exercise becomes part of a regular routine, it requires less conscious effort. However, building such habits can take time and consistency. Interruptions, such as busy schedules or lack of immediate results, can make it difficult for individuals to maintain their routines.\n\nD. To address these challenges, experts recommend setting realistic goals and focusing on gradual progress. Social support, such as exercising with friends or joining groups, can also increase motivation. Ultimately, understanding psychological factors may help individuals develop more sustainable exercise behaviors.",
    tags: ["health"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What can be inferred about exercise habits?", options: { A: "They are easy to maintain once started", B: "They depend only on physical ability", C: "They are influenced by psychological factors", D: "They are unrelated to motivation" }, correct_answer: "C", explanation: "The passage emphasizes mental factors like motivation and habits." },
      { order_index: 2, type: "mcq", question_text: "Why is intrinsic motivation important?", options: { A: "It ensures immediate physical results", B: "It supports long-term consistency", C: "It depends on external rewards", D: "It reduces enjoyment of exercise" }, correct_answer: "B", explanation: "Paragraph B states intrinsic motivation helps sustain exercise." },
      { order_index: 3, type: "mcq", question_text: "What challenge is associated with habit formation?", options: { A: "It requires no effort", B: "It happens instantly", C: "It takes time and consistency", D: "It only applies to professional athletes" }, correct_answer: "C", explanation: "Paragraph C explains habits take time to build." },
      { order_index: 4, type: "tfng", question_text: "Enjoying exercise can increase the likelihood of continuing it.", options: null, correct_answer: "TRUE", explanation: "Paragraph B supports this idea." },
      { order_index: 5, type: "tfng", question_text: "External rewards are always more effective than intrinsic motivation.", options: null, correct_answer: "FALSE", explanation: "Paragraph B suggests intrinsic motivation is more sustainable." },
      { order_index: 6, type: "tfng", question_text: "All individuals form exercise habits at the same speed.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage does not compare speeds between individuals." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Types of motivation", B: "Physical health benefits", C: "Scientific methods", D: "Social influence" }, correct_answer: "A", explanation: "Paragraph B discusses intrinsic vs external motivation." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Barriers to exercise", B: "Strategies to improve motivation", C: "Historical trends", D: "Biological factors" }, correct_answer: "B", explanation: "Paragraph D focuses on solutions and strategies." },
    ],
  },
  {
    id: makeUUID("band60-soc-urbanization"),
    topic: "society",
    difficulty: "band_60_65",
    estimated_minutes: 7,
    passage_title: "The Impact of Urbanization on Modern Society",
    passage_text: "A. Urbanization, the process by which populations move from rural areas to cities, has accelerated in recent decades. This shift is often driven by the search for better employment opportunities, education, and access to services. While urban growth can support economic development, it also creates new social and environmental challenges.\n\nB. One major effect of urbanization is the pressure it places on infrastructure. As cities expand, housing, transportation, and public services must keep up with growing populations. In some cases, rapid development leads to overcrowding and inadequate living conditions, particularly in lower-income areas.\n\nC. Urbanization also influences social relationships and lifestyles. City residents may experience greater diversity and access to cultural activities, but they can also face increased stress and reduced community interaction. The fast pace of urban life may weaken traditional social bonds that were stronger in rural environments.\n\nD. To manage these effects, governments are investing in sustainable urban planning. This includes improving public transport, creating green spaces, and developing policies to reduce inequality. However, achieving balanced urban growth remains a complex task, requiring coordination between economic, social, and environmental priorities.",
    tags: ["society"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What can be inferred about urbanization?", options: { A: "It only has positive effects on society", B: "It is driven mainly by environmental concerns", C: "It brings both opportunities and challenges", D: "It reduces the need for infrastructure" }, correct_answer: "C", explanation: "The passage discusses both benefits and challenges." },
      { order_index: 2, type: "mcq", question_text: "Why can rapid urban growth create problems?", options: { A: "It reduces population size", B: "It puts pressure on housing and services", C: "It improves living conditions for everyone", D: "It eliminates transportation needs" }, correct_answer: "B", explanation: "Paragraph B mentions infrastructure pressure." },
      { order_index: 3, type: "mcq", question_text: "How does urban life affect social relationships?", options: { A: "It always strengthens community bonds", B: "It has no effect on lifestyle", C: "It may reduce traditional social connections", D: "It eliminates cultural diversity" }, correct_answer: "C", explanation: "Paragraph C discusses weaker social bonds." },
      { order_index: 4, type: "tfng", question_text: "People often move to cities for better opportunities.", options: null, correct_answer: "TRUE", explanation: "Paragraph A mentions jobs and education." },
      { order_index: 5, type: "tfng", question_text: "Urbanization always improves living conditions.", options: null, correct_answer: "FALSE", explanation: "Paragraph B mentions overcrowding and poor conditions." },
      { order_index: 6, type: "tfng", question_text: "All cities have solved issues related to urban growth.", options: null, correct_answer: "FALSE", explanation: "Paragraph D states challenges remain." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Infrastructure challenges", B: "Social benefits", C: "Environmental causes", D: "Historical trends" }, correct_answer: "A", explanation: "Paragraph B focuses on infrastructure pressure." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Cultural diversity", B: "Solutions and planning strategies", C: "Economic decline", D: "Population decrease" }, correct_answer: "B", explanation: "Paragraph D discusses urban planning solutions." },
    ],
  },
];

async function seed() {
  const client = await pool.connect();
  let inserted = 0;
  let skipped = 0;

  try {
    await client.query("BEGIN");

    for (const p of PASSAGES) {
      const existing = await client.query("SELECT id FROM reading_passages WHERE id = $1", [p.id]);
      if (existing.rowCount > 0) {
        console.log(`\u23ED  "${p.passage_title}" already exists \u2014 skipping`);
        skipped++;
        continue;
      }

      await client.query(
        `INSERT INTO reading_passages (id, topic, difficulty, estimated_minutes, passage_title, passage_text, tags, created_by, review_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [p.id, p.topic, p.difficulty, p.estimated_minutes, p.passage_title, p.passage_text, p.tags, p.created_by, p.review_status]
      );

      for (const q of p.questions) {
        await client.query(
          `INSERT INTO reading_questions (passage_id, order_index, type, question_text, options, correct_answer, explanation)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [p.id, q.order_index, q.type, q.question_text, q.options ? JSON.stringify(q.options) : null, q.correct_answer, q.explanation]
        );
      }

      console.log(`\u2714  Inserted "${p.passage_title}" (${p.questions.length} questions)`);
      inserted++;
    }

    await client.query("COMMIT");
    console.log(`\n\u2705 Band 6.0-6.5 batch 3 seed completed: ${inserted} inserted, ${skipped} skipped`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("\n\u2716  Seed failed \u2014 rolled back:", err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

seed()
  .then(() => pool.end())
  .catch((err) => { console.error("Fatal:", err.message); pool.end(); process.exit(1); });
