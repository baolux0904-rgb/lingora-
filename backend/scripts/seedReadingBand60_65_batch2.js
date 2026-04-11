/**
 * backend/scripts/seedReadingBand60_65_batch2.js
 *
 * Seeds 5 band_60_65 reading passages (business + health) + questions.
 * Uses a transaction for atomicity. Idempotent — skips existing passages.
 *
 * Usage (from backend/ directory):
 *   node scripts/seedReadingBand60_65_batch2.js
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
    id: makeUUID("band60-biz-supply-chains"),
    topic: "business",
    difficulty: "band_60_65",
    estimated_minutes: 7,
    passage_title: "The Complexity of Global Supply Chains",
    passage_text: "A. Global supply chains have become an essential part of modern business, allowing companies to produce goods efficiently by sourcing materials and labor from different countries. This system has reduced production costs and increased product availability worldwide. However, it has also made businesses more dependent on international connections.\n\nB. One advantage of global supply chains is specialization. Different regions focus on producing specific components based on their expertise and resources. While this improves efficiency, it also means that disruptions in one area can affect production across multiple countries. As a result, even a small delay can lead to significant consequences.\n\nC. Recent events, such as pandemics and political conflicts, have exposed the vulnerability of these systems. When transportation networks are interrupted, companies may struggle to maintain their operations. This has led some businesses to reconsider their strategies, including shifting production closer to their main markets.\n\nD. Despite these challenges, global supply chains remain important for economic growth. Companies are now exploring ways to make them more resilient, such as diversifying suppliers and using advanced technology for better planning. The future of global trade will likely depend on balancing efficiency with flexibility.",
    tags: ["business"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What can be inferred about global supply chains?", options: { A: "They eliminate all business risks", B: "They create both benefits and vulnerabilities", C: "They are no longer widely used", D: "They only benefit small companies" }, correct_answer: "B", explanation: "The passage highlights both efficiency and vulnerability." },
      { order_index: 2, type: "mcq", question_text: "Why can a disruption in one region affect multiple countries?", options: { A: "Countries produce identical goods", B: "Supply chains depend on interconnected processes", C: "Transportation is unnecessary", D: "Companies avoid international trade" }, correct_answer: "B", explanation: "Paragraph B explains interconnected specialization." },
      { order_index: 3, type: "mcq", question_text: "Why are some companies changing their supply chain strategies?", options: { A: "To increase dependence on distant suppliers", B: "To avoid all international trade", C: "To reduce the impact of disruptions", D: "To lower product quality" }, correct_answer: "C", explanation: "Paragraph C suggests companies want more stability." },
      { order_index: 4, type: "tfng", question_text: "Global supply chains help reduce production costs.", options: null, correct_answer: "TRUE", explanation: "Paragraph A states this clearly." },
      { order_index: 5, type: "tfng", question_text: "All regions produce the same types of goods in supply chains.", options: null, correct_answer: "FALSE", explanation: "Paragraph B explains specialization." },
      { order_index: 6, type: "tfng", question_text: "Most companies have completely abandoned global supply chains.", options: null, correct_answer: "FALSE", explanation: "Paragraph D says they remain important." },
      { order_index: 7, type: "matching", question_text: "Match paragraph C with its main idea", options: { A: "Advantages of specialization", B: "Impact of disruptions", C: "Historical development", D: "Technological innovation" }, correct_answer: "B", explanation: "Paragraph C discusses disruptions and responses." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Future improvements and strategies", B: "Causes of failure", C: "Environmental effects", D: "Labor issues" }, correct_answer: "A", explanation: "Paragraph D focuses on resilience and future strategies." },
    ],
  },
  {
    id: makeUUID("band60-biz-remote-work"),
    topic: "business",
    difficulty: "band_60_65",
    estimated_minutes: 7,
    passage_title: "The Rise of Remote Work",
    passage_text: "A. Remote work has become increasingly common, especially with the development of digital communication tools. Many companies now allow employees to work from home or other locations, rather than requiring them to be in a traditional office. This shift has changed how businesses operate and how employees manage their daily routines.\n\nB. One major advantage of remote work is flexibility. Employees can organize their schedules more freely, which can improve work-life balance. However, this flexibility also requires strong self-discipline, as workers must manage their own time without direct supervision.\n\nC. Despite its benefits, remote work presents challenges for communication and collaboration. Without face-to-face interaction, misunderstandings can occur more easily. Some companies have responded by investing in digital tools and organizing regular virtual meetings to maintain team connections.\n\nD. As remote work continues to evolve, many organizations are adopting hybrid models, combining office and remote work. This approach aims to balance flexibility with the need for in-person collaboration. The long-term success of remote work will depend on how effectively companies address both its advantages and limitations.",
    tags: ["business"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What can be inferred about remote work?", options: { A: "It completely replaces office work", B: "It requires no management skills", C: "It offers benefits but also creates new challenges", D: "It is only used in small companies" }, correct_answer: "C", explanation: "The passage highlights both flexibility and communication issues." },
      { order_index: 2, type: "mcq", question_text: "Why is self-discipline important in remote work?", options: { A: "Because employees have more supervision", B: "Because workers must manage their own schedules", C: "Because companies provide strict rules", D: "Because remote work reduces tasks" }, correct_answer: "B", explanation: "Paragraph B states workers must manage time independently." },
      { order_index: 3, type: "mcq", question_text: "Why are companies investing in digital tools?", options: { A: "To eliminate remote work", B: "To improve communication and teamwork", C: "To reduce employee flexibility", D: "To increase office space" }, correct_answer: "B", explanation: "Paragraph C discusses communication challenges." },
      { order_index: 4, type: "tfng", question_text: "Remote work has increased due to technology.", options: null, correct_answer: "TRUE", explanation: "Paragraph A mentions digital tools enabling remote work." },
      { order_index: 5, type: "tfng", question_text: "Remote work always improves communication.", options: null, correct_answer: "FALSE", explanation: "Paragraph C shows communication challenges." },
      { order_index: 6, type: "tfng", question_text: "All companies have adopted hybrid work models.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage says many, not all." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Benefits and personal responsibility", B: "Technological development", C: "Communication problems", D: "Historical trends" }, correct_answer: "A", explanation: "Paragraph B focuses on flexibility and discipline." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Future work models", B: "Employee salaries", C: "Office design", D: "Global trade" }, correct_answer: "A", explanation: "Paragraph D discusses hybrid work and future trends." },
    ],
  },
  {
    id: makeUUID("band60-biz-consumer-decisions"),
    topic: "business",
    difficulty: "band_60_65",
    estimated_minutes: 7,
    passage_title: "Understanding Consumer Decision-Making",
    passage_text: "A. Consumer psychology examines how individuals make decisions about what to buy and why. While many people believe their choices are rational, research shows that emotions and external influences often play a significant role. Businesses use this knowledge to design marketing strategies that attract attention and influence behavior.\n\nB. One important factor affecting consumer decisions is perception. The way a product is presented, including its packaging and branding, can shape how people evaluate its quality. For example, higher prices are sometimes associated with better value, even when there is little difference between products.\n\nC. Social influence also plays a key role in consumer behavior. People are more likely to purchase items that are popular or recommended by others. Online reviews, social media, and influencer marketing have increased the impact of these social factors, making them a powerful tool for businesses.\n\nD. However, not all consumers respond in the same way. Personal preferences, cultural background, and past experiences can affect decision-making. As a result, companies must consider a variety of factors when targeting different groups. Understanding these complexities allows businesses to create more effective marketing strategies.",
    tags: ["business"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What can be inferred about consumer decisions?", options: { A: "They are always based on logic", B: "They are influenced by multiple psychological factors", C: "They are independent of marketing strategies", D: "They are the same for all individuals" }, correct_answer: "B", explanation: "The passage highlights emotional and social influences." },
      { order_index: 2, type: "mcq", question_text: "Why might a higher price affect consumer perception?", options: { A: "It guarantees better quality", B: "It reduces product demand", C: "It creates an impression of higher value", D: "It makes products less attractive" }, correct_answer: "C", explanation: "Paragraph B suggests price influences perceived value." },
      { order_index: 3, type: "mcq", question_text: "How has technology influenced consumer behavior?", options: { A: "It has reduced social influence", B: "It has eliminated advertising", C: "It has strengthened the impact of recommendations", D: "It has made products more expensive" }, correct_answer: "C", explanation: "Paragraph C mentions social media and online reviews." },
      { order_index: 4, type: "tfng", question_text: "Emotions can influence purchasing decisions.", options: null, correct_answer: "TRUE", explanation: "Paragraph A states this clearly." },
      { order_index: 5, type: "tfng", question_text: "All consumers react similarly to marketing strategies.", options: null, correct_answer: "FALSE", explanation: "Paragraph D states differences among consumers." },
      { order_index: 6, type: "tfng", question_text: "Consumer psychology is only studied by scientists, not businesses.", options: null, correct_answer: "FALSE", explanation: "Businesses use this knowledge for marketing." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Role of perception in decisions", B: "Social influence", C: "Cultural differences", D: "Emotional factors" }, correct_answer: "A", explanation: "Paragraph B discusses perception and pricing." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Technological impact", B: "Individual differences in behavior", C: "Marketing costs", D: "Product design" }, correct_answer: "B", explanation: "Paragraph D focuses on variation among consumers." },
    ],
  },
  {
    id: makeUUID("band60-health-mental-health"),
    topic: "health",
    difficulty: "band_60_65",
    estimated_minutes: 7,
    passage_title: "The Growing Importance of Mental Health Awareness",
    passage_text: "A. Mental health awareness has gained significant attention in recent years, as societies begin to recognize the importance of psychological well-being. In the past, mental health issues were often misunderstood or ignored, leading to stigma and limited support for those affected. Today, increased public discussion has encouraged more people to seek help and share their experiences.\n\nB. One key factor in improving mental health awareness is education. Schools, workplaces, and public campaigns now aim to inform individuals about common conditions such as anxiety and depression. By increasing understanding, these efforts help reduce negative stereotypes and promote early intervention.\n\nC. Despite these improvements, barriers still exist. Many individuals hesitate to seek professional help due to fear of judgment or lack of access to services. In some regions, mental health resources remain limited, making it difficult for people to receive proper care.\n\nD. To address these challenges, governments and organizations are investing in mental health programs and digital support tools. Online counseling and mobile applications have made services more accessible. However, experts emphasize that long-term progress depends on continued awareness and societal acceptance.",
    tags: ["health"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What can be inferred about past attitudes toward mental health?", options: { A: "They were highly supportive", B: "They were often negative or uninformed", C: "They focused only on physical health", D: "They encouraged open discussion" }, correct_answer: "B", explanation: "Paragraph A suggests misunderstanding and stigma." },
      { order_index: 2, type: "mcq", question_text: "Why is education important for mental health awareness?", options: { A: "It replaces professional treatment", B: "It increases misunderstanding", C: "It helps reduce stigma and promote early support", D: "It limits access to services" }, correct_answer: "C", explanation: "Paragraph B highlights awareness and early intervention." },
      { order_index: 3, type: "mcq", question_text: "What is a major challenge in improving mental health care?", options: { A: "Too many available services", B: "Lack of interest in education", C: "Barriers such as stigma and limited access", D: "Overuse of digital tools" }, correct_answer: "C", explanation: "Paragraph C mentions fear and limited resources." },
      { order_index: 4, type: "tfng", question_text: "Mental health issues were widely discussed in the past.", options: null, correct_answer: "FALSE", explanation: "Paragraph A states they were often ignored." },
      { order_index: 5, type: "tfng", question_text: "Public campaigns can help improve understanding of mental health.", options: null, correct_answer: "TRUE", explanation: "Paragraph B supports this idea." },
      { order_index: 6, type: "tfng", question_text: "Online counseling has completely replaced traditional therapy.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage mentions increased access, not replacement." },
      { order_index: 7, type: "matching", question_text: "Match paragraph C with its main idea", options: { A: "Benefits of education", B: "Remaining challenges", C: "Technological solutions", D: "Historical attitudes" }, correct_answer: "B", explanation: "Paragraph C discusses barriers and challenges." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Future strategies and solutions", B: "Causes of mental illness", C: "Personal experiences", D: "Scientific research methods" }, correct_answer: "A", explanation: "Paragraph D focuses on solutions and future progress." },
    ],
  },
  {
    id: makeUUID("band60-health-sleep-science"),
    topic: "health",
    difficulty: "band_60_65",
    estimated_minutes: 7,
    passage_title: "The Science of Sleep and Its Impact on Health",
    passage_text: "A. Sleep plays a vital role in maintaining both physical and mental health. Scientists have discovered that sleep is not simply a passive state, but an active process during which the body repairs itself and the brain processes information. Despite its importance, many people do not get enough quality sleep due to modern lifestyles.\n\nB. One key aspect of sleep science is the study of sleep cycles. During the night, individuals move through different stages, including light sleep, deep sleep, and rapid eye movement (REM) sleep. Each stage serves a specific function, such as physical recovery or memory consolidation. Disruptions to these cycles can reduce the overall benefits of sleep.\n\nC. Research has shown that lack of sleep can negatively affect concentration, mood, and long-term health. For example, individuals who consistently sleep less than recommended may face a higher risk of developing conditions such as heart disease. However, the exact relationship between sleep and health outcomes is still being studied.\n\nD. To improve sleep quality, experts recommend maintaining a regular sleep schedule and reducing exposure to screens before bedtime. While these strategies are widely suggested, their effectiveness may vary between individuals. Understanding personal sleep patterns is therefore essential for achieving better rest.",
    tags: ["health"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What can be inferred about sleep?", options: { A: "It is a simple and inactive process", B: "It involves important biological functions", C: "It is not necessary for mental health", D: "It only affects physical health" }, correct_answer: "B", explanation: "Paragraph A describes sleep as an active process." },
      { order_index: 2, type: "mcq", question_text: "Why are sleep cycles important?", options: { A: "They determine how long a person sleeps", B: "They prevent people from waking up", C: "They allow different recovery processes to occur", D: "They reduce the need for deep sleep" }, correct_answer: "C", explanation: "Paragraph B explains different stages have specific functions." },
      { order_index: 3, type: "mcq", question_text: "What does the passage suggest about sleep research?", options: { A: "All effects of sleep are fully understood", B: "There is no link between sleep and health", C: "Some relationships are still unclear", D: "Sleep has no long-term impact" }, correct_answer: "C", explanation: "Paragraph C says research is ongoing." },
      { order_index: 4, type: "tfng", question_text: "Sleep helps the body recover and the brain process information.", options: null, correct_answer: "TRUE", explanation: "Paragraph A clearly states this." },
      { order_index: 5, type: "tfng", question_text: "All people experience sleep cycles in the same way.", options: null, correct_answer: "NOT GIVEN", explanation: "No comparison between individuals is given." },
      { order_index: 6, type: "tfng", question_text: "Lack of sleep can affect a person's mood.", options: null, correct_answer: "TRUE", explanation: "Paragraph C mentions effects on mood." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Stages and functions of sleep", B: "Health risks of sleep loss", C: "Historical research", D: "Lifestyle factors" }, correct_answer: "A", explanation: "Paragraph B explains sleep cycles and stages." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Scientific uncertainty", B: "Ways to improve sleep", C: "Biological processes", D: "Sleep disorders" }, correct_answer: "B", explanation: "Paragraph D discusses improving sleep quality." },
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
    console.log(`\n\u2705 Band 6.0-6.5 batch 2 seed completed: ${inserted} inserted, ${skipped} skipped`);
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
