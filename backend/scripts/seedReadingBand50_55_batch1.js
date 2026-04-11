/**
 * backend/scripts/seedReadingBand50_55_batch1.js
 *
 * Seeds 5 band_50_55 environment-themed reading passages + questions.
 * Uses a transaction for atomicity. Idempotent — skips existing passages.
 *
 * Usage (from backend/ directory):
 *   node scripts/seedReadingBand50_55_batch1.js
 */

"use strict";

const path = require("path");
const crypto = require("crypto");

// ── Bootstrap ─────────────────────────────────────────────────
const BACKEND_DIR = path.resolve(__dirname, "..");
require("dotenv").config({ path: path.join(BACKEND_DIR, ".env"), override: true });

const { pool } = require(path.join(BACKEND_DIR, "src", "config", "db.js"));

// ── Generate deterministic UUIDs from readable keys ───────────
function makeUUID(key) {
  const hash = crypto.createHash("md5").update(key).digest("hex");
  return [
    hash.slice(0, 8), hash.slice(8, 12), hash.slice(12, 16),
    hash.slice(16, 20), hash.slice(20, 32),
  ].join("-");
}

// ── Seed data ─────────────────────────────────────────────────

const PASSAGES = [
  {
    id: makeUUID("band50-env-recycling"),
    topic: "environment",
    difficulty: "band_50_55",
    estimated_minutes: 6,
    passage_title: "Recycling at Home",
    passage_text: "A. Recycling is a simple way to protect the environment. Many people recycle paper, plastic, and glass at home. These materials can be used again to make new products. This helps reduce waste in landfills.\n\nB. In many cities, recycling bins are placed near homes. People can separate their waste into different bins. For example, paper goes in one bin and plastic in another. This makes it easier for workers to collect and process the waste.\n\nC. Recycling also saves energy. Making products from recycled materials uses less energy than using new materials. For example, recycled aluminum uses much less energy than new aluminum.\n\nD. However, not everyone recycles. Some people think it takes too much time. Others do not know how to recycle correctly. Education and clear instructions can help more people recycle.",
    tags: ["environment"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What materials do people recycle at home?", options: { A: "Food and water", B: "Paper, plastic, and glass", C: "Clothes and shoes", D: "Wood and metal" }, correct_answer: "B", explanation: "Paragraph A states paper, plastic, and glass." },
      { order_index: 2, type: "mcq", question_text: "Why do cities provide recycling bins?", options: { A: "To save money", B: "To decorate streets", C: "To help separate waste", D: "To reduce traffic" }, correct_answer: "C", explanation: "Paragraph B says bins help separate waste." },
      { order_index: 3, type: "mcq", question_text: "What is a benefit of recycling aluminum?", options: { A: "It costs more", B: "It uses less energy", C: "It is heavier", D: "It is harder" }, correct_answer: "B", explanation: "Paragraph C explains less energy is used." },
      { order_index: 4, type: "tfng", question_text: "Recycling reduces waste in landfills.", options: null, correct_answer: "TRUE", explanation: "Paragraph A states this." },
      { order_index: 5, type: "tfng", question_text: "All people recycle regularly.", options: null, correct_answer: "FALSE", explanation: "Paragraph D says not everyone recycles." },
      { order_index: 6, type: "tfng", question_text: "Recycling always saves money.", options: null, correct_answer: "NOT GIVEN", explanation: "No information about money." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Energy saving", B: "Recycling process at home", C: "Benefits of recycling", D: "Problems with recycling" }, correct_answer: "B", explanation: "Paragraph B explains sorting bins." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Energy saving", B: "Recycling process", C: "Benefits", D: "Problems" }, correct_answer: "D", explanation: "Paragraph D shows problems." },
    ],
  },
  {
    id: makeUUID("band50-env-clean-water"),
    topic: "environment",
    difficulty: "band_50_55",
    estimated_minutes: 6,
    passage_title: "Clean Water",
    passage_text: "A. Clean water is essential for everyday life. People need it for drinking, cooking, and cleaning. Without safe water, people can become ill from bacteria and other harmful substances. Many diseases in the world are linked to unsafe water sources.\n\nB. In some regions, especially in rural areas, people do not have clean water near their homes. They may need to walk for hours to collect water from rivers or wells. This water is not always safe to use. As a result, families spend a lot of time collecting water instead of working or studying.\n\nC. To solve this problem, governments and aid organizations build systems to provide clean water. These include pipes, wells, and water treatment plants. Clean water systems help reduce illness and improve quality of life. Children can go to school more often when they do not need to collect water.\n\nD. Individuals can also play a role in protecting water. Simple actions like turning off the tap while brushing teeth can save water. People should also avoid polluting rivers and lakes. By using water carefully, everyone can help keep it clean and available for the future.",
    tags: ["environment"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "Why is clean water important for people?", options: { A: "It helps people travel faster", B: "It supports daily activities and health", C: "It makes food taste better only", D: "It is mainly used for farming" }, correct_answer: "B", explanation: "Paragraph A explains that clean water is needed for daily life and health." },
      { order_index: 2, type: "mcq", question_text: "What is a major challenge for people in some rural areas?", options: { A: "They have too many water sources", B: "They must pay high prices for water", C: "They need to travel far to get water", D: "They cannot use wells at all" }, correct_answer: "C", explanation: "Paragraph B states people walk long distances to collect water." },
      { order_index: 3, type: "mcq", question_text: "What is one benefit of building water systems?", options: { A: "People use more water than before", B: "Water becomes cheaper for cities only", C: "Children can attend school more often", D: "Farmers stop using rivers" }, correct_answer: "C", explanation: "Paragraph C explains children can go to school more often." },
      { order_index: 4, type: "tfng", question_text: "Unsafe water can lead to health problems.", options: null, correct_answer: "TRUE", explanation: "Paragraph A states dirty water can cause illness." },
      { order_index: 5, type: "tfng", question_text: "All rural communities have easy access to clean water.", options: null, correct_answer: "FALSE", explanation: "Paragraph B explains many rural areas lack access." },
      { order_index: 6, type: "tfng", question_text: "Water systems are only built in large cities.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage does not limit systems to cities only." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Importance of water for health", B: "Difficulties in accessing clean water", C: "Solutions to water problems", D: "Ways individuals can save water" }, correct_answer: "B", explanation: "Paragraph B discusses challenges in access." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Importance of water", B: "Access issues", C: "Infrastructure solutions", D: "Personal responsibility for water use" }, correct_answer: "D", explanation: "Paragraph D focuses on individual actions." },
    ],
  },
  {
    id: makeUUID("band50-env-air-pollution"),
    topic: "environment",
    difficulty: "band_50_55",
    estimated_minutes: 6,
    passage_title: "Air Pollution",
    passage_text: "A. Air pollution is a serious problem in many parts of the world. It happens when harmful gases and small particles enter the air. These pollutants often come from cars, factories, and burning fuels. Breathing polluted air can damage people\u2019s lungs and cause health problems over time.\n\nB. In large cities, air pollution is usually worse because there are many vehicles and industries. Traffic produces a lot of exhaust fumes, especially during busy hours. In some places, the air looks grey or dirty, and people may find it hard to breathe. Children and older people are more affected by poor air quality.\n\nC. Governments try to reduce air pollution by making new rules. For example, they may limit the number of cars or support public transport. Some countries also encourage the use of clean energy, such as wind and solar power. These actions can help lower the amount of pollution in the air.\n\nD. Individuals can also help improve air quality. People can walk, cycle, or use buses instead of driving cars. Planting trees is another useful action because trees can clean the air. By making small changes in daily life, everyone can help reduce air pollution.",
    tags: ["environment"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What is a main cause of air pollution?", options: { A: "Clean water systems", B: "Car exhaust and factories", C: "Planting trees", D: "Recycling paper" }, correct_answer: "B", explanation: "Paragraph A mentions cars and factories as sources." },
      { order_index: 2, type: "mcq", question_text: "Why is air pollution often worse in cities?", options: { A: "There are fewer people", B: "There is more natural land", C: "There are many vehicles and industries", D: "There is more rain" }, correct_answer: "C", explanation: "Paragraph B explains cities have more vehicles and industries." },
      { order_index: 3, type: "mcq", question_text: "What is one government action to reduce air pollution?", options: { A: "Building more roads", B: "Limiting cars and supporting public transport", C: "Cutting down trees", D: "Increasing factory production" }, correct_answer: "B", explanation: "Paragraph C states this clearly." },
      { order_index: 4, type: "tfng", question_text: "Air pollution can affect human health.", options: null, correct_answer: "TRUE", explanation: "Paragraph A says it damages lungs and causes problems." },
      { order_index: 5, type: "tfng", question_text: "Air pollution is usually lower in big cities than in small towns.", options: null, correct_answer: "FALSE", explanation: "Paragraph B says it is worse in cities." },
      { order_index: 6, type: "tfng", question_text: "All countries use only solar energy to solve air pollution.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage does not say all countries use only solar energy." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Causes of pollution", B: "Effects in cities", C: "Government solutions", D: "Individual actions" }, correct_answer: "B", explanation: "Paragraph B describes city conditions." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Causes", B: "City effects", C: "Government role", D: "Personal actions" }, correct_answer: "D", explanation: "Paragraph D focuses on individuals." },
    ],
  },
  {
    id: makeUUID("band50-env-plastic-waste"),
    topic: "environment",
    difficulty: "band_50_55",
    estimated_minutes: 6,
    passage_title: "Plastic Waste",
    passage_text: "A. Plastic waste is a growing problem around the world. Plastic is cheap, light, and useful, so people use it every day. It is often used for bags, bottles, and food packaging. However, plastic does not break down easily, so it stays in the environment for many years.\n\nB. Much of the plastic waste ends up in rivers and oceans. This can harm animals that live in the water. Fish, birds, and turtles may eat small pieces of plastic by mistake. As a result, they can become sick or even die. Plastic waste also makes the environment look dirty and unattractive.\n\nC. Many governments are trying to reduce plastic waste. Some countries have banned plastic bags or added extra charges for using them. Others encourage recycling and the use of reusable products. These steps can help reduce the amount of plastic that people throw away.\n\nD. Individuals can also make a difference in their daily lives. People can bring their own bags when shopping and avoid single-use plastics. Using reusable bottles and containers is another good habit. By making small changes, people can help reduce plastic waste and protect the environment.",
    tags: ["environment"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "Why is plastic widely used?", options: { A: "It is expensive and heavy", B: "It is cheap and useful", C: "It is easy to break", D: "It is only used in factories" }, correct_answer: "B", explanation: "Paragraph A explains plastic is cheap and useful." },
      { order_index: 2, type: "mcq", question_text: "What happens when animals eat plastic?", options: { A: "They grow faster", B: "They become stronger", C: "They may become sick or die", D: "They can digest it easily" }, correct_answer: "C", explanation: "Paragraph B explains animals get sick or die." },
      { order_index: 3, type: "mcq", question_text: "What is one way governments reduce plastic waste?", options: { A: "Building more factories", B: "Lowering prices of plastic", C: "Banning plastic bags", D: "Using more packaging" }, correct_answer: "C", explanation: "Paragraph C mentions banning plastic bags." },
      { order_index: 4, type: "tfng", question_text: "Plastic remains in the environment for a long time.", options: null, correct_answer: "TRUE", explanation: "Paragraph A states it does not break down easily." },
      { order_index: 5, type: "tfng", question_text: "All animals can safely eat plastic.", options: null, correct_answer: "FALSE", explanation: "Paragraph B says it harms animals." },
      { order_index: 6, type: "tfng", question_text: "Plastic waste only affects land areas.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage does not say it only affects land." },
      { order_index: 7, type: "matching", question_text: "Match paragraph C with its main idea", options: { A: "Problems of plastic", B: "Government actions", C: "Effects on animals", D: "Personal habits" }, correct_answer: "B", explanation: "Paragraph C focuses on government solutions." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Causes of plastic use", B: "Environmental damage", C: "Government role", D: "Individual solutions" }, correct_answer: "D", explanation: "Paragraph D is about personal actions." },
    ],
  },
  {
    id: makeUUID("band50-env-green-energy"),
    topic: "environment",
    difficulty: "band_50_55",
    estimated_minutes: 6,
    passage_title: "Green Energy",
    passage_text: "A. Green energy comes from natural sources that do not run out quickly. These sources include sunlight, wind, and water. Unlike fossil fuels, green energy produces little or no pollution. Many countries are interested in using more green energy to protect the environment.\n\nB. Solar power is one of the most common types of green energy. Solar panels are placed on roofs or open land to collect sunlight. The panels change sunlight into electricity that can be used in homes and buildings. However, solar power depends on the weather and works best on sunny days.\n\nC. Wind energy is another important source. Large wind turbines are built in open areas or near the sea. When the wind blows, the turbines turn and create electricity. Wind energy is clean, but some people think turbines can be noisy and affect the view of the landscape.\n\nD. Governments and individuals are working together to increase the use of green energy. Governments may give support to companies that build green energy projects. People can also install solar panels at home or choose electricity from clean sources. These actions can help reduce pollution and create a cleaner future.",
    tags: ["environment"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What is green energy?", options: { A: "Energy from fossil fuels", B: "Energy that causes a lot of pollution", C: "Energy from natural and renewable sources", D: "Energy used only in factories" }, correct_answer: "C", explanation: "Paragraph A defines green energy as coming from natural sources." },
      { order_index: 2, type: "mcq", question_text: "What is a limitation of solar power?", options: { A: "It is very expensive to build", B: "It depends on weather conditions", C: "It produces harmful gases", D: "It cannot be used in homes" }, correct_answer: "B", explanation: "Paragraph B says it works best on sunny days." },
      { order_index: 3, type: "mcq", question_text: "What is a concern about wind turbines?", options: { A: "They use too much water", B: "They cannot produce electricity", C: "They may be noisy and affect views", D: "They only work at night" }, correct_answer: "C", explanation: "Paragraph C mentions noise and visual impact." },
      { order_index: 4, type: "tfng", question_text: "Green energy produces less pollution than fossil fuels.", options: null, correct_answer: "TRUE", explanation: "Paragraph A states this clearly." },
      { order_index: 5, type: "tfng", question_text: "Solar panels can generate electricity at night.", options: null, correct_answer: "FALSE", explanation: "Paragraph B implies they need sunlight." },
      { order_index: 6, type: "tfng", question_text: "All countries use only green energy today.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage does not say all countries only use green energy." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Definition of green energy", B: "Solar energy explanation", C: "Wind energy explanation", D: "Support for green energy" }, correct_answer: "B", explanation: "Paragraph B focuses on solar power." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Types of energy", B: "Problems with energy", C: "Actions to increase green energy", D: "Energy production process" }, correct_answer: "C", explanation: "Paragraph D discusses actions by governments and individuals." },
    ],
  },
];

// ── Seed function ─────────────────────────────────────────────

async function seed() {
  const client = await pool.connect();
  let inserted = 0;
  let skipped = 0;

  try {
    await client.query("BEGIN");

    for (const p of PASSAGES) {
      // Idempotent check
      const existing = await client.query(
        "SELECT id FROM reading_passages WHERE id = $1",
        [p.id]
      );
      if (existing.rowCount > 0) {
        console.log(`\u23ED  "${p.passage_title}" already exists \u2014 skipping`);
        skipped++;
        continue;
      }

      // Insert passage
      await client.query(
        `INSERT INTO reading_passages (id, topic, difficulty, estimated_minutes, passage_title, passage_text, tags, created_by, review_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [p.id, p.topic, p.difficulty, p.estimated_minutes, p.passage_title, p.passage_text, p.tags, p.created_by, p.review_status]
      );

      // Insert questions
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
    console.log(`\n\u2705 Band 5.0-5.5 batch 1 seed completed: ${inserted} inserted, ${skipped} skipped`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("\n\u2716  Seed failed \u2014 rolled back:", err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

// ── Run ───────────────────────────────────────────────────────

seed()
  .then(() => pool.end())
  .catch((err) => {
    console.error("Fatal:", err.message);
    pool.end();
    process.exit(1);
  });
