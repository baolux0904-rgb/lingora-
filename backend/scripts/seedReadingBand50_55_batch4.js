/**
 * backend/scripts/seedReadingBand50_55_batch4.js
 *
 * Seeds 5 band_50_55 history-themed reading passages + questions.
 * Uses a transaction for atomicity. Idempotent — skips existing passages.
 *
 * Usage (from backend/ directory):
 *   node scripts/seedReadingBand50_55_batch4.js
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
    id: makeUUID("band50-hist-ancient-egypt"),
    topic: "history",
    difficulty: "band_50_55",
    estimated_minutes: 6,
    passage_title: "Ancient Egypt",
    passage_text: "A. Ancient Egypt was one of the earliest civilizations in the world. It developed along the Nile River in North Africa. The river provided water for farming and helped people grow crops such as wheat. Because of this, many people were able to live and build communities in the area.\n\nB. Egyptian society had a clear structure. At the top was the pharaoh, who was both a political leader and a religious figure. Below him were officials, priests, and workers. People believed the pharaoh had special powers and was chosen by the gods to rule the land.\n\nC. Ancient Egyptians are well known for their pyramids and temples. The pyramids were built as tombs for pharaohs and important people. These structures were made of large stones and required many workers to build. They show the advanced skills and organization of Egyptian society.\n\nD. Religion was an important part of daily life in Ancient Egypt. People believed in many gods and in life after death. They prepared for the afterlife by preserving bodies through mummification. These beliefs influenced their culture, art, and architecture.",
    tags: ["history"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "Why was the Nile River important to Ancient Egypt?", options: { A: "It was used for building pyramids", B: "It provided water for farming", C: "It separated different cities", D: "It was used only for transport" }, correct_answer: "B", explanation: "Paragraph A explains the river helped farming." },
      { order_index: 2, type: "mcq", question_text: "Who was the leader of Ancient Egypt?", options: { A: "The priest", B: "The worker", C: "The pharaoh", D: "The farmer" }, correct_answer: "C", explanation: "Paragraph B states the pharaoh was the leader." },
      { order_index: 3, type: "mcq", question_text: "What were pyramids mainly used for?", options: { A: "Houses for workers", B: "Places for farming", C: "Tombs for important people", D: "Markets for trade" }, correct_answer: "C", explanation: "Paragraph C explains pyramids were tombs." },
      { order_index: 4, type: "tfng", question_text: "The Nile River helped people grow food.", options: null, correct_answer: "TRUE", explanation: "Paragraph A supports this." },
      { order_index: 5, type: "tfng", question_text: "All people in Ancient Egypt had the same social status.", options: null, correct_answer: "FALSE", explanation: "Paragraph B explains a social structure." },
      { order_index: 6, type: "tfng", question_text: "Ancient Egyptians believed in only one god.", options: null, correct_answer: "FALSE", explanation: "Paragraph D says they believed in many gods." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Geography and farming", B: "Social structure and leadership", C: "Buildings and achievements", D: "Religion and beliefs" }, correct_answer: "B", explanation: "Paragraph B explains society and leadership." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Daily work", B: "Government system", C: "Religious beliefs", D: "Trade activities" }, correct_answer: "C", explanation: "Paragraph D focuses on religion." },
    ],
  },
  {
    id: makeUUID("band50-hist-printing-press"),
    topic: "history",
    difficulty: "band_50_55",
    estimated_minutes: 6,
    passage_title: "The Printing Press",
    passage_text: "A. The printing press was an important invention in history. It was developed in Europe in the 15th century by Johannes Gutenberg. Before this invention, books were copied by hand, which took a long time. The printing press made it possible to produce many copies of a book quickly.\n\nB. One major benefit of the printing press was the spread of knowledge. Books became cheaper and more people could buy them. This allowed ideas to travel across countries and reach a larger number of readers. Education improved because more people had access to written information.\n\nC. The printing press also supported scientific and cultural development. Scientists could share their discoveries with others more easily. Writers and thinkers could publish their work and influence society. This helped create a period of learning and new ideas in Europe.\n\nD. Over time, printing technology continued to improve. Machines became faster and more efficient. Today, printing is still used, although digital media is also popular. The invention of the printing press remains one of the most important steps in the history of communication.",
    tags: ["history"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "Who developed the printing press?", options: { A: "Isaac Newton", B: "Johannes Gutenberg", C: "Albert Einstein", D: "Leonardo da Vinci" }, correct_answer: "B", explanation: "Paragraph A names Gutenberg." },
      { order_index: 2, type: "mcq", question_text: "What was a key advantage of the printing press?", options: { A: "Books became more expensive", B: "Books could be produced quickly", C: "People stopped reading", D: "Writing became harder" }, correct_answer: "B", explanation: "Paragraph A explains faster production." },
      { order_index: 3, type: "mcq", question_text: "How did the printing press affect education?", options: { A: "It reduced learning opportunities", B: "It limited access to books", C: "It improved access to information", D: "It stopped the use of schools" }, correct_answer: "C", explanation: "Paragraph B explains wider access." },
      { order_index: 4, type: "tfng", question_text: "Before the printing press, books were copied by hand.", options: null, correct_answer: "TRUE", explanation: "Paragraph A states this." },
      { order_index: 5, type: "tfng", question_text: "The printing press had no effect on science.", options: null, correct_answer: "FALSE", explanation: "Paragraph C says it helped scientific development." },
      { order_index: 6, type: "tfng", question_text: "Printed books are no longer used today.", options: null, correct_answer: "FALSE", explanation: "Paragraph D says printing is still used." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Invention details", B: "Spread of knowledge", C: "Scientific impact", D: "Modern printing" }, correct_answer: "B", explanation: "Paragraph B focuses on knowledge spread." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Early history", B: "Cultural effects", C: "Future decline", D: "Development over time" }, correct_answer: "D", explanation: "Paragraph D discusses improvements over time." },
    ],
  },
  {
    id: makeUUID("band50-hist-first-olympics"),
    topic: "history",
    difficulty: "band_50_55",
    estimated_minutes: 6,
    passage_title: "The First Olympics",
    passage_text: "A. The first Olympic Games were held in ancient Greece around 776 BC. They took place in a place called Olympia and were part of a religious festival. The games were organized to honor Zeus, the most important Greek god. Many people traveled long distances to watch or take part in the events.\n\nB. At the beginning, the Olympics had only one event, a short running race called the stadion. Over time, more sports were added, such as wrestling, boxing, and chariot racing. The games were held every four years, and this period was called an Olympiad. The Olympics became very important in Greek culture.\n\nC. Only free Greek men were allowed to compete in the early Olympics. Women were not allowed to take part in the main events. Athletes trained hard to prepare for the competition. Winners were given simple prizes, such as olive wreaths, but they were highly respected in society.\n\nD. The ancient Olympic Games continued for many centuries before they ended in the 4th century AD. Even after they stopped, people remembered them as an important tradition. Many years later, the Olympics were restarted in modern times. Today, they are one of the biggest international sporting events.",
    tags: ["history"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "Where were the first Olympic Games held?", options: { A: "Rome", B: "Athens", C: "Olympia", D: "Sparta" }, correct_answer: "C", explanation: "Paragraph A states the games were held in Olympia." },
      { order_index: 2, type: "mcq", question_text: "What was the first Olympic event?", options: { A: "Boxing", B: "Running race", C: "Swimming", D: "Chariot racing" }, correct_answer: "B", explanation: "Paragraph B explains the first event was a running race." },
      { order_index: 3, type: "mcq", question_text: "Who could compete in the early Olympics?", options: { A: "All people", B: "Only women", C: "Only free Greek men", D: "Only children" }, correct_answer: "C", explanation: "Paragraph C explains this rule." },
      { order_index: 4, type: "tfng", question_text: "The first Olympics were part of a religious celebration.", options: null, correct_answer: "TRUE", explanation: "Paragraph A states they honored Zeus." },
      { order_index: 5, type: "tfng", question_text: "The early Olympic Games included many different sports from the beginning.", options: null, correct_answer: "FALSE", explanation: "Paragraph B says there was only one event at first." },
      { order_index: 6, type: "tfng", question_text: "Athletes received large amounts of money as prizes.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage only mentions olive wreaths, not money." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Origin of the Olympics", B: "Development of events", C: "Rules for athletes", D: "End of the Olympics" }, correct_answer: "B", explanation: "Paragraph B explains how events developed." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Religious meaning", B: "Competition rules", C: "History and continuation", D: "Types of sports" }, correct_answer: "C", explanation: "Paragraph D discusses the end and later revival." },
    ],
  },
  {
    id: makeUUID("band50-hist-viking-explorers"),
    topic: "history",
    difficulty: "band_50_55",
    estimated_minutes: 6,
    passage_title: "Viking Explorers",
    passage_text: "A. The Vikings were people from Northern Europe who lived more than one thousand years ago. They came from countries like Norway, Sweden, and Denmark. Vikings were known as strong sailors and explorers. They used long wooden ships to travel across seas and rivers.\n\nB. Viking ships were designed for long journeys. They were light, fast, and could travel in both deep and shallow water. This allowed Vikings to explore new lands and reach distant places. They traveled to areas such as Iceland, Greenland, and even parts of North America.\n\nC. Vikings explored for different reasons. Some wanted to find new land for farming, while others were interested in trade or adventure. They traded goods like fur, metal, and food with other people. In some cases, they also attacked villages, which made them feared by others.\n\nD. Today, Vikings are remembered for their skills in navigation and exploration. Their journeys helped connect different parts of the world. Archaeologists have found evidence of Viking settlements in several countries. These discoveries help us understand their lives and achievements.",
    tags: ["history"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "Where did the Vikings come from?", options: { A: "Southern Europe", B: "Northern Europe", C: "Asia", D: "Africa" }, correct_answer: "B", explanation: "Paragraph A states they came from Northern Europe." },
      { order_index: 2, type: "mcq", question_text: "What was special about Viking ships?", options: { A: "They were very large and heavy", B: "They could only travel in deep water", C: "They were fast and could travel in shallow water", D: "They were made of metal" }, correct_answer: "C", explanation: "Paragraph B explains this feature." },
      { order_index: 3, type: "mcq", question_text: "Why did Vikings travel to new places?", options: { A: "Only for war", B: "Only for farming", C: "For farming, trade, and adventure", D: "Only for studying" }, correct_answer: "C", explanation: "Paragraph C lists several reasons." },
      { order_index: 4, type: "tfng", question_text: "Vikings were skilled at sailing.", options: null, correct_answer: "TRUE", explanation: "Paragraph A describes them as strong sailors." },
      { order_index: 5, type: "tfng", question_text: "Vikings never traded with other people.", options: null, correct_answer: "FALSE", explanation: "Paragraph C says they traded goods." },
      { order_index: 6, type: "tfng", question_text: "All Viking settlements have been discovered.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage does not say all have been found." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Origins of Vikings", B: "Design and ability of ships", C: "Reasons for travel", D: "Modern discoveries" }, correct_answer: "B", explanation: "Paragraph B explains ship design." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Exploration reasons", B: "Daily life", C: "Historical importance today", D: "Ship building" }, correct_answer: "C", explanation: "Paragraph D discusses modern understanding." },
    ],
  },
  {
    id: makeUUID("band50-hist-great-wall"),
    topic: "history",
    difficulty: "band_50_55",
    estimated_minutes: 6,
    passage_title: "The Great Wall of China",
    passage_text: "A. The Great Wall of China is one of the most famous structures in the world. It was built many years ago to protect China from attacks. The wall stretches across mountains, deserts, and grasslands. It is very long and was constructed over several periods in history.\n\nB. The wall was mainly built by soldiers, workers, and farmers. They used materials such as stone, brick, and earth. Building the wall was very hard work and took many years to complete. People had to carry heavy materials and work in difficult conditions.\n\nC. The main purpose of the Great Wall was to defend the country from enemies. Soldiers stayed along the wall and watched for danger. They used towers to send signals, such as smoke or fire, to warn others. This system helped protect important areas from attack.\n\nD. Today, the Great Wall is an important historical site and a popular tourist attraction. Millions of people visit it every year to learn about its history. It is also a symbol of Chinese culture and strength. Efforts are made to protect and repair the wall so future generations can see it.",
    tags: ["history"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "Why was the Great Wall built?", options: { A: "To improve trade", B: "To protect the country", C: "To grow crops", D: "To create roads" }, correct_answer: "B", explanation: "Paragraph A states it was built for protection." },
      { order_index: 2, type: "mcq", question_text: "Who helped build the Great Wall?", options: { A: "Only kings", B: "Only soldiers", C: "Soldiers, workers, and farmers", D: "Only tourists" }, correct_answer: "C", explanation: "Paragraph B lists these groups." },
      { order_index: 3, type: "mcq", question_text: "How did soldiers communicate along the wall?", options: { A: "By writing letters", B: "By using smoke and fire signals", C: "By using phones", D: "By sending emails" }, correct_answer: "B", explanation: "Paragraph C explains the signal system." },
      { order_index: 4, type: "tfng", question_text: "The Great Wall was built in a single period of time.", options: null, correct_answer: "FALSE", explanation: "Paragraph A says it was built over several periods." },
      { order_index: 5, type: "tfng", question_text: "Building the wall required a lot of effort.", options: null, correct_answer: "TRUE", explanation: "Paragraph B describes hard work." },
      { order_index: 6, type: "tfng", question_text: "The Great Wall is no longer visited today.", options: null, correct_answer: "FALSE", explanation: "Paragraph D says many people visit it." },
      { order_index: 7, type: "matching", question_text: "Match paragraph C with its main idea", options: { A: "Construction process", B: "Defense purpose and communication", C: "Tourism today", D: "Location of the wall" }, correct_answer: "B", explanation: "Paragraph C explains defense and signals." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Historical importance and tourism", B: "Building materials", C: "Military use", D: "Geography" }, correct_answer: "A", explanation: "Paragraph D focuses on modern importance." },
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
    console.log(`\n\u2705 Band 5.0-5.5 batch 4 seed completed: ${inserted} inserted, ${skipped} skipped`);
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
