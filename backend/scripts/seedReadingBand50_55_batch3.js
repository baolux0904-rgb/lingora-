/**
 * backend/scripts/seedReadingBand50_55_batch3.js
 *
 * Seeds 5 band_50_55 technology-themed reading passages + questions.
 * Uses a transaction for atomicity. Idempotent — skips existing passages.
 *
 * Usage (from backend/ directory):
 *   node scripts/seedReadingBand50_55_batch3.js
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
    id: makeUUID("band50-tech-smartphones"),
    topic: "technology",
    difficulty: "band_50_55",
    estimated_minutes: 6,
    passage_title: "Smartphones",
    passage_text: "A. Smartphones are small devices that combine many functions in one tool. People can make calls, send messages, take photos, and use the internet. These devices are used by students, workers, and older people in daily life. Because they are easy to carry, smartphones are now very common around the world.\n\nB. One major advantage of smartphones is quick access to information. Users can search for answers, read news, and watch educational videos at any time. Many students use smartphones to study, join online classes, or check homework. This makes learning more flexible and convenient.\n\nC. However, smartphones also have some negative effects. Spending too much time on them can reduce face-to-face communication. Some people may become distracted by games or social media instead of focusing on important tasks. In addition, looking at screens for long periods can affect sleep and eye health.\n\nD. To use smartphones in a healthy way, people should set limits and take breaks. Turning off notifications during study time can improve concentration. Parents and teachers can also guide young users to use smartphones responsibly. With balanced use, smartphones can be helpful tools without causing harm.",
    tags: ["technology"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What is a smartphone mainly used for?", options: { A: "Only making calls", B: "Combining many functions in one device", C: "Building machines", D: "Growing food" }, correct_answer: "B", explanation: "Paragraph A explains smartphones have many functions." },
      { order_index: 2, type: "mcq", question_text: "How do smartphones help students?", options: { A: "They replace schools completely", B: "They provide quick access to information", C: "They reduce study time to zero", D: "They stop online classes" }, correct_answer: "B", explanation: "Paragraph B explains access to information and learning tools." },
      { order_index: 3, type: "mcq", question_text: "What is one negative effect of smartphone use?", options: { A: "Improved sleep quality", B: "Better eyesight", C: "Reduced face-to-face communication", D: "Increased physical activity" }, correct_answer: "C", explanation: "Paragraph C mentions less direct communication." },
      { order_index: 4, type: "tfng", question_text: "Smartphones allow users to access information quickly.", options: null, correct_answer: "TRUE", explanation: "Paragraph B supports this idea." },
      { order_index: 5, type: "tfng", question_text: "Using smartphones always improves concentration.", options: null, correct_answer: "FALSE", explanation: "Paragraph C says they can cause distraction." },
      { order_index: 6, type: "tfng", question_text: "All schools require students to use smartphones in class.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage does not say this." },
      { order_index: 7, type: "matching", question_text: "Match paragraph C with its main idea", options: { A: "General description", B: "Benefits", C: "Negative effects", D: "Advice for use" }, correct_answer: "C", explanation: "Paragraph C focuses on problems." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Types of smartphones", B: "Usage habits", C: "Problems", D: "Guidelines for responsible use" }, correct_answer: "D", explanation: "Paragraph D gives advice." },
    ],
  },
  {
    id: makeUUID("band50-tech-online-shopping"),
    topic: "technology",
    difficulty: "band_50_55",
    estimated_minutes: 6,
    passage_title: "Online Shopping",
    passage_text: "A. Online shopping has become very popular in recent years. People can buy clothes, electronics, and food using websites or mobile apps. They do not need to visit physical stores because everything can be ordered from home. This makes shopping more convenient for many people.\n\nB. One main advantage of online shopping is the wide range of choices. Customers can compare prices and products from different sellers easily. They can also read reviews from other buyers before making a decision. This helps people choose products that match their needs.\n\nC. However, online shopping also has some disadvantages. Customers cannot see or try products before buying them. Sometimes, the product received is different from what was shown online. There may also be delays in delivery, especially during busy times.\n\nD. To shop online safely, people should use trusted websites and check product details carefully. Reading customer reviews can help avoid problems. It is also important to protect personal information when making payments. With careful use, online shopping can be both easy and safe.",
    tags: ["technology"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What is a key feature of online shopping?", options: { A: "It requires visiting stores", B: "It allows buying from home", C: "It only sells food", D: "It takes more time than normal shopping" }, correct_answer: "B", explanation: "Paragraph A states people can shop from home." },
      { order_index: 2, type: "mcq", question_text: "How do customers make better choices online?", options: { A: "By ignoring prices", B: "By reading reviews and comparing products", C: "By buying quickly", D: "By visiting many stores" }, correct_answer: "B", explanation: "Paragraph B explains this." },
      { order_index: 3, type: "mcq", question_text: "What is one problem with online shopping?", options: { A: "Products are always cheaper", B: "Customers cannot see items before buying", C: "Delivery is always fast", D: "There are no product choices" }, correct_answer: "B", explanation: "Paragraph C mentions this disadvantage." },
      { order_index: 4, type: "tfng", question_text: "Online shopping allows people to compare products easily.", options: null, correct_answer: "TRUE", explanation: "Paragraph B supports this idea." },
      { order_index: 5, type: "tfng", question_text: "Products bought online are always exactly as shown.", options: null, correct_answer: "FALSE", explanation: "Paragraph C says sometimes they are different." },
      { order_index: 6, type: "tfng", question_text: "All online stores offer free delivery.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage does not mention free delivery for all stores." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "General idea of online shopping", B: "Benefits of online shopping", C: "Problems with online shopping", D: "Safety tips" }, correct_answer: "B", explanation: "Paragraph B discusses advantages." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Shopping trends", B: "Customer problems", C: "Safe shopping practices", D: "Product variety" }, correct_answer: "C", explanation: "Paragraph D gives safety advice." },
    ],
  },
  {
    id: makeUUID("band50-tech-electric-cars"),
    topic: "technology",
    difficulty: "band_50_55",
    estimated_minutes: 6,
    passage_title: "Electric Cars",
    passage_text: "A. Electric cars are vehicles that use electricity instead of petrol or diesel. They have batteries that store energy and power the motor. In recent years, more people have become interested in electric cars because they are seen as cleaner and more modern. Many countries are encouraging their use.\n\nB. One important advantage of electric cars is that they produce no exhaust gases while driving. This helps reduce air pollution, especially in busy cities. Electric cars are also quieter than traditional cars, which can make streets less noisy. In addition, some drivers find that electric cars are cheaper to run over time.\n\nC. However, electric cars also have some challenges. Charging the battery can take longer than filling a petrol tank. In some areas, there are not enough charging stations available. Electric cars can also be more expensive to buy at the beginning, which may stop some people from choosing them.\n\nD. Governments and companies are working to improve electric car technology. More charging stations are being built, and batteries are becoming more efficient. Some governments offer financial support to buyers. With these changes, electric cars may become more common in the future.",
    tags: ["technology"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What powers electric cars?", options: { A: "Gas engines", B: "Electric batteries", C: "Solar panels only", D: "Water engines" }, correct_answer: "B", explanation: "Paragraph A states they use batteries." },
      { order_index: 2, type: "mcq", question_text: "Why are electric cars better for cities?", options: { A: "They are faster", B: "They produce no exhaust gases", C: "They are larger", D: "They use more fuel" }, correct_answer: "B", explanation: "Paragraph B explains reduced pollution." },
      { order_index: 3, type: "mcq", question_text: "What is one problem with electric cars?", options: { A: "They cannot move", B: "They are always noisy", C: "Charging takes time", D: "They use too much petrol" }, correct_answer: "C", explanation: "Paragraph C mentions charging time." },
      { order_index: 4, type: "tfng", question_text: "Electric cars help reduce air pollution.", options: null, correct_answer: "TRUE", explanation: "Paragraph B supports this." },
      { order_index: 5, type: "tfng", question_text: "Electric cars are cheaper to buy than all other cars.", options: null, correct_answer: "FALSE", explanation: "Paragraph C says they can be more expensive." },
      { order_index: 6, type: "tfng", question_text: "All countries already have many charging stations.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage does not say all countries have many stations." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Definition of electric cars", B: "Benefits of electric cars", C: "Problems with electric cars", D: "Future improvements" }, correct_answer: "B", explanation: "Paragraph B discusses advantages." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Types of vehicles", B: "Environmental issues", C: "Technological progress and support", D: "Cost comparison" }, correct_answer: "C", explanation: "Paragraph D focuses on improvements." },
    ],
  },
  {
    id: makeUUID("band50-tech-video-games"),
    topic: "technology",
    difficulty: "band_50_55",
    estimated_minutes: 6,
    passage_title: "Video Games",
    passage_text: "A. Video games are a popular form of entertainment for people of all ages. Players can use computers, consoles, or smartphones to play different types of games. Some games are simple, while others have complex stories and challenges. Many people play video games in their free time to relax and have fun.\n\nB. Video games can also have some benefits. They can improve skills such as problem-solving, quick thinking, and hand-eye coordination. Some educational games help players learn new information in an interesting way. In addition, online games allow people to communicate and play with friends from different places.\n\nC. However, playing video games too much can cause problems. Some players may spend many hours in front of a screen and have less time for study, exercise, or social activities. This can affect their health and daily routines. There is also concern that some games may include violent content, which may not be suitable for younger players.\n\nD. To enjoy video games in a healthy way, players should manage their time carefully. Setting limits on daily play can help create a better balance. Parents can guide children by choosing suitable games and encouraging other activities. With responsible use, video games can be both enjoyable and useful.",
    tags: ["technology"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What are video games mainly used for?", options: { A: "Cooking meals", B: "Entertainment and fun", C: "Building houses", D: "Growing plants" }, correct_answer: "B", explanation: "Paragraph A says they are for entertainment." },
      { order_index: 2, type: "mcq", question_text: "What is one benefit of video games?", options: { A: "They reduce thinking skills", B: "They improve problem-solving ability", C: "They stop communication", D: "They replace school lessons completely" }, correct_answer: "B", explanation: "Paragraph B mentions problem-solving skills." },
      { order_index: 3, type: "mcq", question_text: "What is one risk of playing too many video games?", options: { A: "Better health", B: "More exercise", C: "Less time for important activities", D: "Improved sleep always" }, correct_answer: "C", explanation: "Paragraph C explains this issue." },
      { order_index: 4, type: "tfng", question_text: "Video games can help improve certain skills.", options: null, correct_answer: "TRUE", explanation: "Paragraph B supports this." },
      { order_index: 5, type: "tfng", question_text: "All video games are suitable for young children.", options: null, correct_answer: "FALSE", explanation: "Paragraph C mentions some games may not be suitable." },
      { order_index: 6, type: "tfng", question_text: "Playing video games always improves school results.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage does not state this." },
      { order_index: 7, type: "matching", question_text: "Match paragraph C with its main idea", options: { A: "General description", B: "Benefits", C: "Problems of video games", D: "Advice for use" }, correct_answer: "C", explanation: "Paragraph C discusses problems." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Game types", B: "Skill development", C: "Negative effects", D: "Guidelines for balanced use" }, correct_answer: "D", explanation: "Paragraph D gives advice." },
    ],
  },
  {
    id: makeUUID("band50-tech-internet-safety"),
    topic: "technology",
    difficulty: "band_50_55",
    estimated_minutes: 6,
    passage_title: "Internet Safety",
    passage_text: "A. The internet is a useful tool for communication, learning, and entertainment. People can send emails, watch videos, and search for information quickly. However, using the internet also involves some risks. It is important for users to understand how to stay safe online.\n\nB. One common risk is sharing personal information with strangers. This includes names, addresses, phone numbers, and passwords. If this information is shared, it can be misused. For example, someone may pretend to be another person or try to access private accounts.\n\nC. Another problem is the spread of false information. Not everything on the internet is true or reliable. Some websites may provide incorrect or misleading facts. Users need to check information from trusted sources before believing or sharing it.\n\nD. To stay safe online, people should follow simple rules. They should use strong passwords and avoid clicking on unknown links. It is also helpful to update software regularly and use security tools. With careful behavior, the internet can be both useful and safe.",
    tags: ["technology"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What is the internet mainly used for?", options: { A: "Only for work", B: "Communication, learning, and entertainment", C: "Building houses", D: "Driving vehicles" }, correct_answer: "B", explanation: "Paragraph A lists these uses." },
      { order_index: 2, type: "mcq", question_text: "What is a risk of sharing personal information online?", options: { A: "Improving security", B: "Making new friends safely", C: "Information may be misused", D: "Faster internet speed" }, correct_answer: "C", explanation: "Paragraph B explains misuse of information." },
      { order_index: 3, type: "mcq", question_text: "How can users avoid false information?", options: { A: "By trusting all websites", B: "By ignoring the internet", C: "By checking trusted sources", D: "By sharing information quickly" }, correct_answer: "C", explanation: "Paragraph C states this clearly." },
      { order_index: 4, type: "tfng", question_text: "The internet has both benefits and risks.", options: null, correct_answer: "TRUE", explanation: "Paragraph A mentions usefulness and risks." },
      { order_index: 5, type: "tfng", question_text: "It is safe to share passwords with strangers online.", options: null, correct_answer: "FALSE", explanation: "Paragraph B warns against sharing personal information." },
      { order_index: 6, type: "tfng", question_text: "All websites provide accurate information.", options: null, correct_answer: "FALSE", explanation: "Paragraph C states some information is false." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Uses of the internet", B: "Risks of sharing personal information", C: "False information online", D: "Safety tips" }, correct_answer: "B", explanation: "Paragraph B focuses on personal information risks." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Internet history", B: "Online communication", C: "Problems of the internet", D: "Ways to stay safe online" }, correct_answer: "D", explanation: "Paragraph D gives safety advice." },
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
    console.log(`\n\u2705 Band 5.0-5.5 batch 3 seed completed: ${inserted} inserted, ${skipped} skipped`);
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
