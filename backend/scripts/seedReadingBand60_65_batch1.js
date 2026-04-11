/**
 * backend/scripts/seedReadingBand60_65_batch1.js
 *
 * Seeds 5 band_60_65 reading passages (science + business) + questions.
 * Uses a transaction for atomicity. Idempotent — skips existing passages.
 *
 * Usage (from backend/ directory):
 *   node scripts/seedReadingBand60_65_batch1.js
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
    id: makeUUID("band60-sci-space-exploration"),
    topic: "science",
    difficulty: "band_60_65",
    estimated_minutes: 7,
    passage_title: "The New Age of Space Exploration",
    passage_text: "A. In recent decades, space exploration has shifted from being dominated by governments to involving private companies. This transition has increased competition and reduced costs, making space more accessible than before. As a result, missions that once seemed impossible are now considered achievable within a shorter timeframe.\n\nB. Private companies have introduced reusable rockets, which significantly lower the cost of launching equipment into space. By recovering and reusing rocket components, these firms can conduct more frequent missions. This innovation has also encouraged collaboration between public agencies and private organizations.\n\nC. However, this rapid development raises concerns about space debris. With more satellites being launched, the risk of collisions increases. Scientists warn that without proper regulation, debris could damage functioning satellites and limit future exploration.\n\nD. Despite these challenges, many experts believe that private investment will accelerate scientific discovery. From Mars missions to space tourism, the possibilities continue to expand. The future of space exploration may depend on balancing innovation with responsibility.",
    tags: ["science"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What is the main impact of private companies entering space exploration?", options: { A: "Reduced government funding", B: "Increased accessibility and competition", C: "Less interest in space missions", D: "Higher costs of exploration" }, correct_answer: "B", explanation: "Private companies increased competition and reduced costs." },
      { order_index: 2, type: "mcq", question_text: "Why are reusable rockets important?", options: { A: "They increase space debris", B: "They reduce mission frequency", C: "They lower costs and allow more launches", D: "They replace satellites" }, correct_answer: "C", explanation: "Reusable rockets lower cost and allow frequent missions." },
      { order_index: 3, type: "mcq", question_text: "What concern do scientists have about increased satellite launches?", options: { A: "Lack of funding", B: "Technological failure", C: "Risk of collisions", D: "Limited interest" }, correct_answer: "C", explanation: "More satellites increase collision risk." },
      { order_index: 4, type: "tfng", question_text: "Private companies have made space exploration cheaper.", options: null, correct_answer: "TRUE", explanation: "Stated in paragraph A and B." },
      { order_index: 5, type: "tfng", question_text: "Reusable rockets increase the cost of missions.", options: null, correct_answer: "FALSE", explanation: "They reduce cost." },
      { order_index: 6, type: "tfng", question_text: "All countries support private space companies.", options: null, correct_answer: "NOT GIVEN", explanation: "Not mentioned." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Future possibilities", B: "Cost-saving innovation", C: "Environmental concerns", D: "Historical development" }, correct_answer: "B", explanation: "Paragraph B focuses on reusable rockets." },
      { order_index: 8, type: "matching", question_text: "Match paragraph C with its main idea", options: { A: "Risk of space debris", B: "Economic benefits", C: "Tourism opportunities", D: "Government role" }, correct_answer: "A", explanation: "Paragraph C discusses debris risks." },
    ],
  },
  {
    id: makeUUID("band60-sci-deep-ocean"),
    topic: "science",
    difficulty: "band_60_65",
    estimated_minutes: 7,
    passage_title: "Exploring the Deep Ocean",
    passage_text: "A. The deep ocean remains one of the least explored regions on Earth. Despite covering most of the planet, it is difficult to study due to extreme pressure and darkness. Scientists rely on advanced technology to investigate these remote areas.\n\nB. Submersibles and remote-operated vehicles allow researchers to collect samples and observe marine life. These tools can reach depths that humans cannot survive. As a result, scientists have discovered unique species adapted to harsh conditions.\n\nC. Many of these organisms rely on chemical energy instead of sunlight. This challenges traditional ideas about life on Earth and suggests that life could exist in similar environments on other planets.\n\nD. However, deep-sea exploration is expensive and time-consuming. Funding limitations often restrict research opportunities. Nevertheless, continued study may lead to important scientific breakthroughs.",
    tags: ["science"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "Why is the deep ocean difficult to explore?", options: { A: "Lack of interest", B: "Extreme conditions", C: "Limited technology", D: "Too shallow" }, correct_answer: "B", explanation: "Pressure and darkness are challenges." },
      { order_index: 2, type: "mcq", question_text: "What do remote-operated vehicles allow scientists to do?", options: { A: "Replace humans permanently", B: "Study surface water", C: "Explore deep areas safely", D: "Increase ocean temperature" }, correct_answer: "C", explanation: "They reach depths humans cannot." },
      { order_index: 3, type: "mcq", question_text: "What does deep-sea life suggest about other planets?", options: { A: "Life cannot exist elsewhere", B: "Life needs sunlight", C: "Life may exist in harsh environments", D: "Oceans are unique to Earth" }, correct_answer: "C", explanation: "Chemical-based life suggests possibility." },
      { order_index: 4, type: "tfng", question_text: "Most of the ocean has been explored.", options: null, correct_answer: "FALSE", explanation: "It is largely unexplored." },
      { order_index: 5, type: "tfng", question_text: "Deep-sea organisms depend on sunlight.", options: null, correct_answer: "FALSE", explanation: "They use chemical energy." },
      { order_index: 6, type: "tfng", question_text: "Deep-sea exploration is increasing rapidly worldwide.", options: null, correct_answer: "NOT GIVEN", explanation: "No global trend mentioned." },
      { order_index: 7, type: "matching", question_text: "Match paragraph C with its main idea", options: { A: "New theories about life", B: "Technological limits", C: "Economic costs", D: "Ocean geography" }, correct_answer: "A", explanation: "Discusses new understanding of life." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Financial challenges", B: "Biological diversity", C: "Technological progress", D: "Exploration history" }, correct_answer: "A", explanation: "Focus on cost and funding." },
    ],
  },
  {
    id: makeUUID("band60-sci-genetic-engineering"),
    topic: "science",
    difficulty: "band_60_65",
    estimated_minutes: 7,
    passage_title: "The Expanding Role of Genetic Engineering",
    passage_text: "A. Genetic engineering has developed rapidly in recent years, allowing scientists to modify the DNA of living organisms with increasing precision. Originally limited to basic experiments, this technology is now applied in agriculture, medicine, and environmental science. While its potential benefits are significant, the long-term consequences are still being debated.\n\nB. In agriculture, genetically modified crops are designed to resist pests and tolerate harsh environmental conditions. This can lead to higher productivity and reduced reliance on chemical pesticides. However, some critics argue that such crops may negatively affect biodiversity by replacing traditional plant varieties.\n\nC. In the field of medicine, genetic engineering offers new approaches to treating diseases. Techniques such as gene editing can potentially correct genetic disorders at their source. Despite these advances, ethical concerns remain, particularly regarding the possibility of altering human embryos, which could have unpredictable effects on future generations.\n\nD. As genetic engineering becomes more accessible, governments and international organizations are working to establish regulations. These rules aim to balance innovation with safety, ensuring that the technology is used responsibly. The challenge lies in creating policies that keep pace with rapid scientific progress without limiting beneficial discoveries.",
    tags: ["science"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What can be inferred about the development of genetic engineering?", options: { A: "It has remained limited to laboratory research", B: "It is advancing faster than regulations can fully control", C: "It is no longer controversial", D: "It is only used in agriculture" }, correct_answer: "B", explanation: "Paragraph D implies regulations struggle to keep up with rapid progress." },
      { order_index: 2, type: "mcq", question_text: "Why do some critics oppose genetically modified crops?", options: { A: "They are too expensive to produce", B: "They reduce the need for farming", C: "They may harm ecological diversity", D: "They cannot survive harsh climates" }, correct_answer: "C", explanation: "Paragraph B suggests concern about loss of biodiversity." },
      { order_index: 3, type: "mcq", question_text: "What is a key ethical concern mentioned in the passage?", options: { A: "The cost of medical treatments", B: "The use of pesticides", C: "The impact of altering human genes", D: "The speed of crop growth" }, correct_answer: "C", explanation: "Paragraph C highlights ethical concerns about editing human embryos." },
      { order_index: 4, type: "tfng", question_text: "Genetic engineering is used in several different fields today.", options: null, correct_answer: "TRUE", explanation: "Paragraph A mentions agriculture, medicine, and environmental science." },
      { order_index: 5, type: "tfng", question_text: "All genetically modified crops improve biodiversity.", options: null, correct_answer: "FALSE", explanation: "Paragraph B states they may reduce biodiversity." },
      { order_index: 6, type: "tfng", question_text: "Gene editing has already eliminated most genetic diseases.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage mentions potential, not actual elimination." },
      { order_index: 7, type: "matching", question_text: "Match paragraph C with its main idea", options: { A: "Ethical challenges in medical use", B: "Agricultural benefits", C: "Historical development", D: "Government policies" }, correct_answer: "A", explanation: "Paragraph C focuses on medical applications and ethics." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Scientific discoveries", B: "Regulation and control", C: "Environmental risks", D: "Technological limitations" }, correct_answer: "B", explanation: "Paragraph D discusses regulations and policy challenges." },
    ],
  },
  {
    id: makeUUID("band60-sci-climate-patterns"),
    topic: "science",
    difficulty: "band_60_65",
    estimated_minutes: 7,
    passage_title: "Understanding Climate Change Patterns",
    passage_text: "A. Climate science has become increasingly important as global temperatures continue to rise. Scientists study long-term patterns in weather to understand how the Earth\u2019s climate is changing. While short-term variations are natural, recent trends suggest a more consistent warming that cannot be explained by natural causes alone.\n\nB. One major factor contributing to climate change is the increase in greenhouse gases, such as carbon dioxide, in the atmosphere. These gases trap heat, preventing it from escaping into space. Human activities, particularly the burning of fossil fuels, have significantly increased the concentration of these gases over the past century.\n\nC. The effects of climate change are already visible in many parts of the world. Rising sea levels threaten coastal areas, while extreme weather events, including heatwaves and storms, are becoming more frequent. However, the impact is not uniform, as some regions experience more severe changes than others.\n\nD. To address climate change, scientists and policymakers are exploring various solutions, including renewable energy and carbon reduction strategies. Although progress has been made, international cooperation remains essential. The difficulty lies in balancing economic growth with environmental protection, which often leads to disagreements among countries.",
    tags: ["science"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What can be inferred about recent climate trends?", options: { A: "They are entirely natural fluctuations", B: "They are consistent with long-term cooling", C: "They cannot be fully explained by natural factors", D: "They have no clear pattern" }, correct_answer: "C", explanation: "Paragraph A implies recent warming is not due only to natural causes." },
      { order_index: 2, type: "mcq", question_text: "Why are greenhouse gases significant in climate change?", options: { A: "They reduce global temperatures", B: "They trap heat in the atmosphere", C: "They increase rainfall directly", D: "They create oxygen" }, correct_answer: "B", explanation: "Paragraph B explains that greenhouse gases trap heat." },
      { order_index: 3, type: "mcq", question_text: "What does the passage suggest about the global impact of climate change?", options: { A: "All regions are affected equally", B: "Only coastal areas are affected", C: "Impacts vary depending on location", D: "It only affects developing countries" }, correct_answer: "C", explanation: "Paragraph C states impacts are not uniform." },
      { order_index: 4, type: "tfng", question_text: "Human activity has increased greenhouse gas levels.", options: null, correct_answer: "TRUE", explanation: "Paragraph B clearly states this." },
      { order_index: 5, type: "tfng", question_text: "Climate change only affects weather in the short term.", options: null, correct_answer: "FALSE", explanation: "The passage discusses long-term climate patterns." },
      { order_index: 6, type: "tfng", question_text: "All countries agree on how to solve climate change.", options: null, correct_answer: "FALSE", explanation: "Paragraph D mentions disagreements." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Effects of climate change", B: "Causes of climate change", C: "Solutions and policies", D: "Scientific methods" }, correct_answer: "B", explanation: "Paragraph B focuses on greenhouse gases as a cause." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Regional differences", B: "Historical trends", C: "Challenges in solving climate change", D: "Natural processes" }, correct_answer: "C", explanation: "Paragraph D discusses solutions and difficulties." },
    ],
  },
  {
    id: makeUUID("band60-biz-startup-culture"),
    topic: "business",
    difficulty: "band_60_65",
    estimated_minutes: 7,
    passage_title: "The Realities of Startup Culture",
    passage_text: "A. Startup culture is often associated with innovation, flexibility, and rapid growth. Many young professionals are attracted to startups because they promise exciting opportunities and the chance to make a meaningful impact. However, the reality of working in a startup can be more complex than the popular image suggests.\n\nB. One defining feature of startups is the fast-paced working environment. Employees are usually expected to take on multiple roles and adapt quickly to changing priorities. While this can provide valuable experience, it can also lead to long working hours and increased stress, particularly when resources are limited.\n\nC. Another important aspect of startup culture is the strong emphasis on risk-taking. Founders and employees often invest significant time and effort without guaranteed success. Although some startups achieve rapid growth and financial success, many fail within the first few years, highlighting the uncertain nature of this sector.\n\nD. Despite these challenges, startup culture continues to attract talent worldwide. Many individuals value the opportunity to develop new skills and work in a creative environment. The key to sustaining this culture lies in balancing ambition with realistic expectations, ensuring that both innovation and employee well-being are considered.",
    tags: ["business"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What can be inferred about people's perception of startups?", options: { A: "They are generally seen as stable workplaces", B: "They are often viewed more positively than the reality", C: "They are considered outdated business models", D: "They are only suitable for experienced workers" }, correct_answer: "B", explanation: "Paragraph A contrasts the attractive image with a more complex reality." },
      { order_index: 2, type: "mcq", question_text: "Why might startup employees experience stress?", options: { A: "They have limited responsibilities", B: "They receive too much financial support", C: "They must handle multiple roles under pressure", D: "They work fewer hours than expected" }, correct_answer: "C", explanation: "Paragraph B explains that multiple roles and long hours increase stress." },
      { order_index: 3, type: "mcq", question_text: "What does the passage suggest about startup success?", options: { A: "Most startups become successful quickly", B: "Failure is a common outcome", C: "Success is guaranteed with effort", D: "Startups rarely grow beyond small businesses" }, correct_answer: "B", explanation: "Paragraph C states many startups fail within a few years." },
      { order_index: 4, type: "tfng", question_text: "Startup jobs often require employees to be flexible.", options: null, correct_answer: "TRUE", explanation: "Paragraph B mentions adapting quickly to changes." },
      { order_index: 5, type: "tfng", question_text: "All startups provide stable long-term employment.", options: null, correct_answer: "FALSE", explanation: "Paragraph C highlights uncertainty and failure rates." },
      { order_index: 6, type: "tfng", question_text: "Startups always offer higher salaries than large companies.", options: null, correct_answer: "NOT GIVEN", explanation: "Salary comparisons are not mentioned." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Work environment challenges", B: "Financial success stories", C: "Public perception", D: "Government support" }, correct_answer: "A", explanation: "Paragraph B focuses on fast pace and stress." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Causes of failure", B: "Future sustainability of startups", C: "Historical development", D: "Technological innovation" }, correct_answer: "B", explanation: "Paragraph D discusses balancing growth and well-being." },
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
    console.log(`\n\u2705 Band 6.0-6.5 batch 1 seed completed: ${inserted} inserted, ${skipped} skipped`);
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
