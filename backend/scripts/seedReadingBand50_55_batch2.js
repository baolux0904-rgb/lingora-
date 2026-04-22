/**
 * backend/scripts/seedReadingBand50_55_batch2.js
 *
 * Seeds 5 band_50_55 society-themed reading passages + questions.
 * Uses a transaction for atomicity. Idempotent — skips existing passages.
 *
 * Usage (from backend/ directory):
 *   node scripts/seedReadingBand50_55_batch2.js
 */

"use strict";

const path = require("path");
const crypto = require("crypto");

const BACKEND_DIR = path.resolve(__dirname, "..");
require("dotenv").config({ path: path.join(BACKEND_DIR, ".env"), override: false });

const { pool } = require(path.join(BACKEND_DIR, "src", "config", "db.js"));

function makeUUID(key) {
  const hash = crypto.createHash("md5").update(key).digest("hex");
  return [hash.slice(0,8), hash.slice(8,12), hash.slice(12,16), hash.slice(16,20), hash.slice(20,32)].join("-");
}

const PASSAGES = [
  {
    id: makeUUID("band50-soc-school-uniforms"),
    topic: "society",
    difficulty: "band_50_55",
    estimated_minutes: 6,
    passage_title: "School Uniforms",
    passage_text: "A. School uniforms are common in many countries around the world. Students wear the same clothes every day when they go to school. These uniforms often include a shirt, trousers or a skirt, and sometimes a jacket. Schools choose uniforms to create a sense of order and unity among students.\n\nB. One advantage of school uniforms is that they reduce differences between students. When everyone wears the same clothes, it is harder to see who is rich or poor. This can help students feel more equal and less worried about fashion. As a result, they may focus more on their studies instead of their appearance.\n\nC. However, some students do not like wearing uniforms. They feel that uniforms limit their freedom to express their personal style. Teenagers, in particular, often want to choose their own clothes. In addition, buying uniforms can be expensive for some families, especially if schools require special items.\n\nD. Many schools try to find a balance between rules and freedom. Some allow students to wear casual clothes on certain days. Others give students small choices, such as different colors or styles. In this way, schools can keep the benefits of uniforms while also respecting students\u2019 preferences.",
    tags: ["society"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "Why do schools require uniforms?", options: { A: "To make students spend more money", B: "To create unity and order", C: "To follow fashion trends", D: "To help students exercise more" }, correct_answer: "B", explanation: "Paragraph A explains uniforms create unity and order." },
      { order_index: 2, type: "mcq", question_text: "What is one benefit of school uniforms?", options: { A: "Students can show their style more easily", B: "Students feel more equal", C: "Students have more clothing choices", D: "Students do less homework" }, correct_answer: "B", explanation: "Paragraph B says uniforms reduce differences." },
      { order_index: 3, type: "mcq", question_text: "Why do some students dislike uniforms?", options: { A: "They are too comfortable", B: "They improve school results", C: "They limit personal expression", D: "They are only worn on weekends" }, correct_answer: "C", explanation: "Paragraph C mentions limited personal style." },
      { order_index: 4, type: "tfng", question_text: "Uniforms can help reduce visible social differences among students.", options: null, correct_answer: "TRUE", explanation: "Paragraph B supports this idea." },
      { order_index: 5, type: "tfng", question_text: "All students enjoy wearing school uniforms.", options: null, correct_answer: "FALSE", explanation: "Paragraph C says some students dislike them." },
      { order_index: 6, type: "tfng", question_text: "Uniforms are always cheaper than regular clothes.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage does not compare overall cost clearly." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Reasons for uniforms", B: "Benefits of uniforms", C: "Problems with uniforms", D: "Balanced solutions" }, correct_answer: "B", explanation: "Paragraph B discusses benefits." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "History of uniforms", B: "Advantages", C: "Student complaints", D: "Compromise between rules and freedom" }, correct_answer: "D", explanation: "Paragraph D focuses on balance." },
    ],
  },
  {
    id: makeUUID("band50-soc-public-transport"),
    topic: "society",
    difficulty: "band_50_55",
    estimated_minutes: 6,
    passage_title: "Public Transport",
    passage_text: "A. Public transport is an important part of life in many cities. It includes buses, trains, and subways that carry people from one place to another. Many people use public transport to go to work, school, or other daily activities. It is often cheaper than owning and using a private car.\n\nB. One advantage of public transport is that it helps reduce traffic on the roads. When more people use buses or trains, there are fewer cars on the streets. This can make travel faster and less stressful for everyone. It can also reduce the number of accidents in busy areas.\n\nC. Public transport is also better for the environment. Buses and trains can carry many passengers at the same time, so they use less fuel per person. This helps lower air pollution and protect the environment. However, some systems are old or crowded, which can make the journey uncomfortable.\n\nD. Many governments are working to improve public transport systems. They invest in new vehicles, better stations, and faster services. Some cities also offer discounts to encourage people to use public transport. These improvements can make public transport more convenient and attractive to users.",
    tags: ["society"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What is public transport mainly used for?", options: { A: "Selling goods", B: "Carrying people", C: "Building roads", D: "Producing energy" }, correct_answer: "B", explanation: "Paragraph A explains it carries people." },
      { order_index: 2, type: "mcq", question_text: "How does public transport reduce traffic?", options: { A: "By increasing the number of cars", B: "By making roads wider", C: "By moving many people in one vehicle", D: "By closing streets" }, correct_answer: "C", explanation: "Paragraph B explains fewer cars are needed." },
      { order_index: 3, type: "mcq", question_text: "What is one problem with public transport?", options: { A: "It is always empty", B: "It cannot travel long distances", C: "It can be crowded and uncomfortable", D: "It uses no fuel" }, correct_answer: "C", explanation: "Paragraph C mentions crowding." },
      { order_index: 4, type: "tfng", question_text: "Public transport can help reduce road accidents.", options: null, correct_answer: "TRUE", explanation: "Paragraph B suggests fewer cars reduce accidents." },
      { order_index: 5, type: "tfng", question_text: "All public transport systems are modern and comfortable.", options: null, correct_answer: "FALSE", explanation: "Paragraph C says some are old or crowded." },
      { order_index: 6, type: "tfng", question_text: "Public transport is free in most cities.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage does not say it is free." },
      { order_index: 7, type: "matching", question_text: "Match paragraph C with its main idea", options: { A: "Definition of transport", B: "Traffic reduction", C: "Environmental impact and problems", D: "Government improvements" }, correct_answer: "C", explanation: "Paragraph C discusses environment and issues." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Types of transport", B: "Benefits", C: "User experiences", D: "Efforts to improve systems" }, correct_answer: "D", explanation: "Paragraph D focuses on improvements." },
    ],
  },
  {
    id: makeUUID("band50-soc-social-media"),
    topic: "society",
    difficulty: "band_50_55",
    estimated_minutes: 6,
    passage_title: "Social Media Use",
    passage_text: "A. Social media is widely used by people of all ages today. Platforms such as messaging apps and photo-sharing sites allow users to communicate and share information quickly. Many people use social media to keep in touch with friends and family. It has become an important part of daily life for students and workers.\n\nB. One advantage of social media is that it makes communication faster and easier. People can send messages, photos, and videos in seconds. It is also useful for learning, as users can find information and join online groups. For example, students can follow educational pages and discuss topics with others.\n\nC. However, there are also some problems with social media use. Spending too much time online can reduce time for study or exercise. Some users may also feel stressed when they compare themselves to others. In addition, not all information on social media is true, which can cause confusion.\n\nD. To use social media in a healthy way, people should manage their time and be careful about what they read and share. Setting limits on daily use can help users stay balanced. It is also important to check information before believing it. With careful use, social media can be a helpful tool.",
    tags: ["society"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What is a main use of social media?", options: { A: "Building houses", B: "Communicating with others", C: "Driving vehicles", D: "Growing food" }, correct_answer: "B", explanation: "Paragraph A explains communication is a main use." },
      { order_index: 2, type: "mcq", question_text: "How can social media help students?", options: { A: "By reducing homework", B: "By providing learning resources and discussions", C: "By replacing teachers completely", D: "By stopping online communication" }, correct_answer: "B", explanation: "Paragraph B mentions learning and discussion groups." },
      { order_index: 3, type: "mcq", question_text: "What is one problem of social media use?", options: { A: "It improves physical health", B: "It reduces communication speed", C: "It may cause stress and waste time", D: "It prevents people from sharing ideas" }, correct_answer: "C", explanation: "Paragraph C explains stress and time issues." },
      { order_index: 4, type: "tfng", question_text: "Social media allows people to send messages quickly.", options: null, correct_answer: "TRUE", explanation: "Paragraph B states this clearly." },
      { order_index: 5, type: "tfng", question_text: "All information on social media is reliable.", options: null, correct_answer: "FALSE", explanation: "Paragraph C says some information is not true." },
      { order_index: 6, type: "tfng", question_text: "Using social media always improves school performance.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage does not claim this." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "General use of social media", B: "Benefits of social media", C: "Problems of social media", D: "Advice for users" }, correct_answer: "B", explanation: "Paragraph B focuses on advantages." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Types of media", B: "Negative effects", C: "Guidelines for safe use", D: "History of social media" }, correct_answer: "C", explanation: "Paragraph D gives advice." },
    ],
  },
  {
    id: makeUUID("band50-soc-healthy-eating"),
    topic: "society",
    difficulty: "band_50_55",
    estimated_minutes: 6,
    passage_title: "Healthy Eating",
    passage_text: "A. Healthy eating means choosing foods that support the body and mind. A balanced diet usually includes fruits, vegetables, grains, protein, and some dairy. These foods provide important nutrients such as vitamins and minerals. Eating well can help people feel more energetic and stay healthy over time.\n\nB. Many people today eat a lot of fast food and processed snacks. These foods are often high in sugar, salt, and fat. Eating too much of them can lead to health problems such as weight gain and heart disease. In contrast, fresh foods are usually lower in harmful ingredients and better for the body.\n\nC. Healthy eating also involves regular meal times and portion control. Eating at the same time each day can help the body work properly. It is also important not to eat too much in one meal. Drinking enough water is another key part of a healthy diet.\n\nD. Schools and families can help people develop healthy eating habits. Schools may teach students about nutrition and offer healthy meals. At home, parents can prepare balanced meals and encourage good choices. With support and knowledge, people can build better eating habits for life.",
    tags: ["society"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What does a balanced diet include?", options: { A: "Only meat and dairy", B: "Only fruits and vegetables", C: "Different types of food groups", D: "Only processed snacks" }, correct_answer: "C", explanation: "Paragraph A lists different food groups." },
      { order_index: 2, type: "mcq", question_text: "Why is fast food often unhealthy?", options: { A: "It contains too much water", B: "It is high in sugar, salt, and fat", C: "It is difficult to cook", D: "It has too many vitamins" }, correct_answer: "B", explanation: "Paragraph B explains this clearly." },
      { order_index: 3, type: "mcq", question_text: "What is one good habit for healthy eating?", options: { A: "Skipping meals", B: "Eating at regular times", C: "Only drinking soft drinks", D: "Eating large portions always" }, correct_answer: "B", explanation: "Paragraph C mentions regular meal times." },
      { order_index: 4, type: "tfng", question_text: "Healthy eating can improve energy levels.", options: null, correct_answer: "TRUE", explanation: "Paragraph A says it helps people feel more energetic." },
      { order_index: 5, type: "tfng", question_text: "Processed foods are always healthier than fresh foods.", options: null, correct_answer: "FALSE", explanation: "Paragraph B says fresh foods are better." },
      { order_index: 6, type: "tfng", question_text: "All schools provide free healthy meals to students.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage does not say all schools provide free meals." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Definition of healthy eating", B: "Problems with unhealthy food", C: "Eating habits", D: "Support from schools and families" }, correct_answer: "B", explanation: "Paragraph B discusses unhealthy food issues." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Types of food", B: "Health benefits", C: "Role of education and family", D: "Daily eating routine" }, correct_answer: "C", explanation: "Paragraph D focuses on support systems." },
    ],
  },
  {
    id: makeUUID("band50-soc-city-parks"),
    topic: "society",
    difficulty: "band_50_55",
    estimated_minutes: 6,
    passage_title: "City Parks",
    passage_text: "A. City parks are green spaces in urban areas where people can relax and enjoy nature. They often have trees, grass, and walking paths. Many parks also include playgrounds, sports areas, and small lakes. These spaces give people a break from busy city life.\n\nB. One important benefit of city parks is that they support physical health. People can walk, run, or play sports in the open air. Regular activity in parks can help reduce stress and improve fitness. Families often visit parks together, which also strengthens relationships.\n\nC. City parks are also good for the environment. Trees and plants in parks help clean the air and provide shade. They can reduce noise from traffic and make cities cooler in hot weather. In addition, parks provide a home for birds and small animals.\n\nD. However, parks need proper care to stay clean and safe. Local governments must maintain the grass, repair equipment, and keep the area free of litter. Visitors also have a responsibility to protect parks by following rules and not damaging plants. With good care, city parks can benefit everyone.",
    tags: ["society"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What can people do in city parks?", options: { A: "Build houses", B: "Relax and enjoy nature", C: "Drive cars quickly", D: "Work in factories" }, correct_answer: "B", explanation: "Paragraph A explains parks are for relaxation and nature." },
      { order_index: 2, type: "mcq", question_text: "How do parks help physical health?", options: { A: "By providing indoor games", B: "By offering places for exercise", C: "By reducing school time", D: "By increasing traffic" }, correct_answer: "B", explanation: "Paragraph B says people can exercise in parks." },
      { order_index: 3, type: "mcq", question_text: "What is one environmental benefit of parks?", options: { A: "They increase pollution", B: "They produce more noise", C: "They help clean the air", D: "They remove animals" }, correct_answer: "C", explanation: "Paragraph C states plants help clean the air." },
      { order_index: 4, type: "tfng", question_text: "City parks can help people reduce stress.", options: null, correct_answer: "TRUE", explanation: "Paragraph B mentions stress reduction." },
      { order_index: 5, type: "tfng", question_text: "City parks make cities hotter in summer.", options: null, correct_answer: "FALSE", explanation: "Paragraph C says they make cities cooler." },
      { order_index: 6, type: "tfng", question_text: "All parks include lakes and animals.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage does not say all parks have these features." },
      { order_index: 7, type: "matching", question_text: "Match paragraph C with its main idea", options: { A: "Activities in parks", B: "Health benefits", C: "Environmental benefits", D: "Maintenance responsibilities" }, correct_answer: "C", explanation: "Paragraph C focuses on environmental effects." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Park design", B: "Visitor activities", C: "Environmental role", D: "Care and responsibility" }, correct_answer: "D", explanation: "Paragraph D discusses maintenance and responsibility." },
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
    console.log(`\n\u2705 Band 5.0-5.5 batch 2 seed completed: ${inserted} inserted, ${skipped} skipped`);
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
