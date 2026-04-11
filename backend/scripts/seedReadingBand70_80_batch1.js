/**
 * backend/scripts/seedReadingBand70_80_batch1.js
 *
 * Seeds 5 band_70_80 reading passages (psychology + philosophy) + questions.
 * Uses a transaction for atomicity. Idempotent — skips existing passages by title.
 *
 * Usage (from backend/ directory):
 *   node scripts/seedReadingBand70_80_batch1.js
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
    id: makeUUID("band70-psych-cognitive-bias"),
    topic: "psychology",
    difficulty: "band_70_80",
    estimated_minutes: 8,
    passage_title: "The Architecture of Cognitive Bias",
    passage_text: "A. Human cognition is often celebrated for its efficiency, yet this efficiency comes at a cost. Cognitive biases\u2014systematic deviations from rational judgment\u2014arise not as flaws but as adaptive shortcuts. These heuristics allow individuals to process vast amounts of information quickly, especially in environments where time and resources are limited. However, their persistence in modern contexts, where decisions often require careful analysis, reveals a tension between evolutionary advantage and contemporary complexity.\n\nB. One of the most pervasive biases is confirmation bias, the tendency to seek and interpret information that aligns with pre-existing beliefs. This phenomenon is reinforced by selective exposure, where individuals gravitate toward sources that validate their views. Consequently, opposing evidence is often dismissed or undervalued, leading to polarized perspectives. In digital environments, algorithms that tailor content to user preferences may exacerbate this bias, creating echo chambers that reinforce existing attitudes.\n\nC. Another significant bias is the availability heuristic, whereby individuals estimate the likelihood of events based on how easily examples come to mind. Dramatic or recent occurrences are therefore perceived as more common than they actually are. This can distort risk perception, as seen in public overestimation of rare but highly publicized dangers. While this heuristic can be useful for rapid decision-making, it often leads to misjudgments in statistical reasoning.\n\nD. Addressing cognitive biases does not necessarily require eliminating them, which may be neither feasible nor desirable. Instead, interventions often focus on increasing awareness and promoting reflective thinking. Techniques such as considering alternative viewpoints or delaying judgment can mitigate their influence. Ultimately, understanding biases offers insight into the fundamental structure of human thought, highlighting both its strengths and limitations.",
    tags: ["psychology"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What is the primary argument in paragraph A?", options: { A: "Cognitive biases are entirely detrimental to human reasoning", B: "Cognitive biases originate from evolutionary adaptations but may conflict with modern needs", C: "Modern environments eliminate the need for heuristics", D: "Human cognition is inherently inefficient" }, correct_answer: "B", explanation: "Paragraph A emphasizes that biases are adaptive but problematic in modern contexts." },
      { order_index: 2, type: "mcq", question_text: "How do digital environments influence confirmation bias?", options: { A: "They eliminate exposure to opposing views", B: "They encourage balanced information consumption", C: "They amplify bias through personalized content", D: "They reduce bias by increasing access to information" }, correct_answer: "C", explanation: "Algorithms reinforce confirmation bias by tailoring content to user preferences." },
      { order_index: 3, type: "mcq", question_text: "What is the main limitation of the availability heuristic?", options: { A: "It requires too much cognitive effort", B: "It prevents quick decision-making", C: "It distorts perception of frequency and risk", D: "It eliminates emotional influence" }, correct_answer: "C", explanation: "The heuristic leads to misjudgment by overestimating memorable events." },
      { order_index: 4, type: "tfng", question_text: "Cognitive biases developed as a response to environmental pressures.", options: null, correct_answer: "TRUE", explanation: "Paragraph A states they are adaptive shortcuts shaped by evolution." },
      { order_index: 5, type: "tfng", question_text: "Confirmation bias is weakened by online algorithms.", options: null, correct_answer: "FALSE", explanation: "Paragraph B states algorithms strengthen confirmation bias." },
      { order_index: 6, type: "tfng", question_text: "All cognitive biases can be completely eliminated through training.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage suggests mitigation, not elimination." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Risk misperception", B: "Adaptive origins", C: "Reinforcement of existing beliefs", D: "Mitigation strategies" }, correct_answer: "C", explanation: "Paragraph B focuses on confirmation bias." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Mitigation strategies", B: "Evolutionary origins", C: "Statistical errors", D: "Information overload" }, correct_answer: "A", explanation: "Paragraph D discusses addressing biases." },
    ],
  },
  {
    id: makeUUID("band70-psych-economic-irrationality"),
    topic: "psychology",
    difficulty: "band_70_80",
    estimated_minutes: 8,
    passage_title: "Irrationality in Economic Decision-Making",
    passage_text: "A. Traditional economic theory assumes that individuals act as rational agents, consistently making decisions that maximize their utility. However, behavioral economics challenges this premise by demonstrating that human choices are often systematically irrational. Rather than being random errors, these deviations follow predictable patterns influenced by cognitive limitations, emotions, and social contexts. As a result, economic behavior is better understood as boundedly rational, shaped by both internal biases and external framing effects.\n\nB. One key concept in behavioral economics is loss aversion, the tendency for individuals to prefer avoiding losses over acquiring equivalent gains. Empirical studies suggest that the psychological impact of a loss is significantly greater than that of a comparable gain. This asymmetry can lead individuals to make overly conservative decisions, such as holding onto declining investments to avoid realizing a loss. It also explains why people may reject fair gambles if potential losses are emphasized, even when expected outcomes are positive.\n\nC. Another influential factor is the framing effect, whereby the presentation of information alters decision outcomes. Identical choices, when framed differently, can lead to markedly different responses. For instance, a medical treatment described as having a 90% survival rate may be perceived more favorably than one described as having a 10% mortality rate, despite conveying the same information. This demonstrates that decision-making is not purely based on objective data but is highly sensitive to contextual cues.\n\nD. Behavioral economics has significant implications for public policy and market design. Governments and institutions increasingly employ nudges\u2014subtle interventions that guide behavior without restricting choice. Examples include automatic enrollment in retirement savings plans or the strategic placement of healthier food options. While such measures can improve outcomes, they also raise ethical concerns about manipulation and autonomy. The challenge lies in balancing effectiveness with respect for individual freedom, ensuring that interventions remain transparent and aligned with societal values.",
    tags: ["psychology"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What is the main critique of traditional economic theory in paragraph A?", options: { A: "It ignores emotional factors entirely", B: "It assumes rationality that does not reflect actual human behavior", C: "It overestimates the role of social influences", D: "It focuses too heavily on external constraints" }, correct_answer: "B", explanation: "Paragraph A argues that humans are not perfectly rational." },
      { order_index: 2, type: "mcq", question_text: "Why might individuals hold onto declining investments according to paragraph B?", options: { A: "They expect future gains based on analysis", B: "They underestimate risks involved", C: "They wish to avoid acknowledging a loss", D: "They lack access to relevant information" }, correct_answer: "C", explanation: "Loss aversion leads people to avoid realizing losses." },
      { order_index: 3, type: "mcq", question_text: "What does the example in paragraph C primarily illustrate?", options: { A: "People prefer medical treatments with higher survival rates", B: "Statistical data is often misunderstood", C: "The framing of information influences perception and choice", D: "Medical decisions are inherently emotional" }, correct_answer: "C", explanation: "The same information leads to different choices depending on presentation." },
      { order_index: 4, type: "tfng", question_text: "Behavioral economics suggests that irrational decisions occur randomly.", options: null, correct_answer: "FALSE", explanation: "Paragraph A states that irrationality follows predictable patterns." },
      { order_index: 5, type: "tfng", question_text: "Loss aversion implies that gains and losses are valued equally by individuals.", options: null, correct_answer: "FALSE", explanation: "Losses are valued more strongly than gains." },
      { order_index: 6, type: "tfng", question_text: "All governments use nudges to manipulate citizens without their awareness.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage mentions nudges but not universally or secretly." },
      { order_index: 7, type: "matching", question_text: "Match paragraph C with its main idea", options: { A: "Policy implications", B: "Impact of presentation on decisions", C: "Emotional bias in loss perception", D: "Limits of rationality" }, correct_answer: "B", explanation: "Paragraph C focuses on framing effects." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Ethical considerations of behavioral interventions", B: "Statistical reasoning errors", C: "Cognitive limitations", D: "Market unpredictability" }, correct_answer: "A", explanation: "Paragraph D discusses nudges and ethical concerns." },
    ],
  },
  {
    id: makeUUID("band70-psych-social-identity"),
    topic: "psychology",
    difficulty: "band_70_80",
    estimated_minutes: 8,
    passage_title: "The Dynamics of Social Identity",
    passage_text: "A. Social Identity Theory posits that an individual\u2019s sense of self is not solely derived from personal attributes but is also shaped by membership in social groups. These groups\u2014ranging from nationality and ethnicity to professional affiliations\u2014provide individuals with a framework through which they interpret their place in society. Crucially, group membership is not merely descriptive; it carries evaluative significance, influencing self-esteem and guiding behavior. As such, identity is both a cognitive construct and a social phenomenon.\n\nB. A central mechanism within this theory is the process of social categorization, whereby individuals classify themselves and others into distinct groups. This categorization simplifies the social world but often results in exaggerated differences between groups and minimized variation within them. Consequently, individuals tend to perceive out-group members as more homogeneous than they actually are. This cognitive shortcut facilitates quick judgments but can also contribute to stereotyping and prejudice.\n\nC. Social comparison further intensifies group dynamics by encouraging individuals to evaluate their group relative to others. To maintain a positive social identity, individuals are motivated to view their in-group favorably, often leading to in-group favoritism and, in some cases, discrimination against out-groups. Importantly, these biases can emerge even in minimal group conditions, where group distinctions are arbitrary and lack substantive meaning. This suggests that the mere act of categorization is sufficient to trigger intergroup bias.\n\nD. While Social Identity Theory explains many forms of intergroup conflict, it also offers insights into social cohesion and collective action. Shared identity can foster cooperation, solidarity, and coordinated effort, particularly in contexts requiring collective responses. However, the same mechanisms that unite individuals within groups can also divide them from others. Understanding this duality is essential for addressing social tensions, as interventions must balance the reinforcement of inclusive identities with the mitigation of exclusionary tendencies.",
    tags: ["psychology"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What is the primary claim made in paragraph A?", options: { A: "Personal traits are more important than social groups", B: "Identity is formed exclusively through social interactions", C: "Group membership plays a significant role in shaping self-concept", D: "Social identity has no effect on behavior" }, correct_answer: "C", explanation: "Paragraph A emphasizes that identity is partly derived from group membership." },
      { order_index: 2, type: "mcq", question_text: "What is a consequence of social categorization described in paragraph B?", options: { A: "Improved understanding of individual differences", B: "Greater accuracy in judging others", C: "Increased perception of similarity within out-groups", D: "Elimination of stereotypes" }, correct_answer: "C", explanation: "Out-group members are perceived as more similar than they are." },
      { order_index: 3, type: "mcq", question_text: "Why are minimal group conditions significant in paragraph C?", options: { A: "They demonstrate that group bias requires deep historical context", B: "They show that arbitrary group distinctions can still produce bias", C: "They eliminate the effects of social comparison", D: "They prevent discrimination from occurring" }, correct_answer: "B", explanation: "Bias emerges even when group divisions are meaningless." },
      { order_index: 4, type: "tfng", question_text: "Social Identity Theory suggests that group membership has no influence on self-esteem.", options: null, correct_answer: "FALSE", explanation: "Paragraph A states that group membership influences self-esteem." },
      { order_index: 5, type: "tfng", question_text: "People always treat members of other groups fairly when group boundaries are unclear.", options: null, correct_answer: "FALSE", explanation: "Paragraph C shows bias can occur even in minimal groups." },
      { order_index: 6, type: "tfng", question_text: "Social Identity Theory fully explains all forms of social conflict.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage says it explains many forms, not all." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Group comparison processes", B: "Formation of identity", C: "Categorization leading to stereotypes", D: "Collective action" }, correct_answer: "C", explanation: "Paragraph B focuses on categorization and its consequences." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Dual role of identity in unity and division", B: "Cognitive simplification", C: "Bias in decision-making", D: "Individual self-perception" }, correct_answer: "A", explanation: "Paragraph D discusses both cohesion and division." },
    ],
  },
  {
    id: makeUUID("band70-psych-memory-reconstruction"),
    topic: "psychology",
    difficulty: "band_70_80",
    estimated_minutes: 8,
    passage_title: "The Reconstruction of Memory",
    passage_text: "A. Memory is often perceived as a reliable record of past events, yet contemporary research suggests that it is inherently reconstructive rather than reproductive. Instead of storing exact replicas of experiences, the brain encodes fragments of information that are later reassembled during recall. This process is influenced by existing knowledge, expectations, and contextual cues, meaning that memories are continuously reshaped rather than passively retrieved. As a result, recollection is less like replaying a recording and more akin to reconstructing a narrative.\n\nB. The encoding stage plays a critical role in determining how memories are formed. Factors such as attention, emotional intensity, and meaning significantly affect which elements of an experience are retained. For instance, emotionally charged events tend to be remembered more vividly, although not necessarily more accurately. Selective attention further narrows the scope of encoding, leading individuals to prioritize certain details while neglecting others. Consequently, what is stored in memory is already a filtered representation of reality.\n\nC. During retrieval, memories are particularly susceptible to distortion. External influences, such as leading questions or exposure to new information, can alter recollections in subtle but significant ways. This phenomenon, known as the misinformation effect, demonstrates how easily memory can be manipulated. Over time, repeated recall may reinforce these altered versions, making them appear increasingly credible. Thus, confidence in a memory does not necessarily correlate with its accuracy.\n\nD. Despite its fallibility, reconstructive memory serves important adaptive functions. By integrating past experiences with present knowledge, individuals can make sense of complex situations and anticipate future outcomes. This flexibility allows memory to remain relevant in changing environments. However, it also poses challenges in contexts that demand precision, such as eyewitness testimony. Understanding the dynamic nature of memory highlights the need for caution in treating recollections as objective evidence, emphasizing the interplay between cognition and interpretation.",
    tags: ["psychology"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What is the main argument presented in paragraph A?", options: { A: "Memory stores exact copies of experiences", B: "Memory is a dynamic process of reconstruction", C: "Memory is unaffected by external factors", D: "Memory declines steadily over time" }, correct_answer: "B", explanation: "Paragraph A explains that memory is reconstructive, not a direct recording." },
      { order_index: 2, type: "mcq", question_text: "Why are emotionally intense events significant in memory formation?", options: { A: "They are always remembered accurately", B: "They prevent selective attention", C: "They are encoded more strongly but not necessarily accurately", D: "They eliminate memory distortion" }, correct_answer: "C", explanation: "Paragraph B states they are vivid but not always accurate." },
      { order_index: 3, type: "mcq", question_text: "What does the misinformation effect demonstrate?", options: { A: "Memory improves with repetition", B: "External information can alter stored memories", C: "All memories are false", D: "Confidence guarantees accuracy" }, correct_answer: "B", explanation: "Paragraph C shows memory can be distorted by new information." },
      { order_index: 4, type: "tfng", question_text: "Memory recall involves reconstructing stored information.", options: null, correct_answer: "TRUE", explanation: "Paragraph A describes memory as reconstructive." },
      { order_index: 5, type: "tfng", question_text: "All details of an event are encoded equally during memory formation.", options: null, correct_answer: "FALSE", explanation: "Paragraph B explains selective attention filters details." },
      { order_index: 6, type: "tfng", question_text: "Eyewitness testimony is always unreliable due to memory distortion.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage mentions challenges but not absolute unreliability." },
      { order_index: 7, type: "matching", question_text: "Match paragraph C with its main idea", options: { A: "Adaptive benefits of memory", B: "Encoding mechanisms", C: "Distortion during recall", D: "Nature of memory storage" }, correct_answer: "C", explanation: "Paragraph C discusses distortion and misinformation." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Limitations in encoding", B: "Benefits and risks of reconstructive memory", C: "Emotional influence", D: "Attention processes" }, correct_answer: "B", explanation: "Paragraph D covers both usefulness and limitations." },
    ],
  },
  {
    id: makeUUID("band70-phil-ai-ethics"),
    topic: "philosophy",
    difficulty: "band_70_80",
    estimated_minutes: 8,
    passage_title: "Ethical Frontiers of Artificial Intelligence",
    passage_text: "A. The emergence of artificial intelligence has reignited philosophical debates concerning moral responsibility, particularly in contexts where decision-making is delegated to autonomous systems. Unlike conventional tools, AI systems are capable of learning from data and adapting their behavior in ways that are not always fully predictable. This raises a fundamental question: when an AI system produces a harmful outcome, who should be held accountable? The diffusion of responsibility across designers, users, and institutions complicates traditional ethical frameworks that assume clear causal chains and identifiable agents.\n\nB. A central philosophical tension lies in determining whether AI systems can be meaningfully integrated into existing moral categories. Classical theories of ethics, such as deontology and utilitarianism, presuppose agents capable of intention and moral reasoning. Since current AI lacks consciousness and subjective experience, many argue that it cannot possess genuine moral agency. However, others suggest that the functional role of AI in decision-making processes may justify attributing a limited form of responsibility, particularly when its actions have significant real-world consequences.\n\nC. Beyond questions of agency, the ethical design of AI systems presents practical challenges. Efforts to embed fairness and transparency into algorithms often encounter technical limitations, including biases in training data and the opacity of complex models. These issues are especially pronounced in high-stakes domains such as hiring, policing, and medical diagnosis, where algorithmic decisions can reinforce existing inequalities. Consequently, ethical considerations must extend beyond abstract principles to include rigorous evaluation of how systems operate in real-world contexts.\n\nD. The broader societal implications of AI ethics underscore the need for collective governance. Decisions about how AI is developed and deployed reflect underlying social values, influencing the distribution of risks and benefits across populations. As such, ethical oversight cannot be confined to technical experts alone but must involve public deliberation and institutional accountability. Rather than seeking definitive solutions, many scholars advocate for adaptive ethical frameworks that evolve alongside technological advancements, ensuring that moral reflection remains responsive to emerging challenges.",
    tags: ["philosophy"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What is the main concern raised in paragraph A?", options: { A: "The unpredictability of AI learning processes", B: "The difficulty of assigning responsibility for AI decisions", C: "The economic impact of AI systems", D: "The technical limitations of autonomous systems" }, correct_answer: "B", explanation: "Paragraph A focuses on the ambiguity of accountability in AI outcomes." },
      { order_index: 2, type: "mcq", question_text: "Why do some philosophers reject AI as moral agents?", options: { A: "AI systems are too expensive to regulate", B: "AI lacks intention and subjective experience", C: "AI systems are controlled entirely by humans", D: "AI decisions are always biased" }, correct_answer: "B", explanation: "Paragraph B states that moral agency requires consciousness and intention." },
      { order_index: 3, type: "mcq", question_text: "What issue is emphasized in paragraph C regarding AI systems?", options: { A: "Lack of public trust in technology", B: "Conflicts between ethical ideals and technical realities", C: "Insufficient data for training models", D: "Overregulation of AI industries" }, correct_answer: "B", explanation: "Paragraph C highlights the tension between fairness goals and technical constraints." },
      { order_index: 4, type: "tfng", question_text: "AI systems always function as predictable tools with fixed outputs.", options: null, correct_answer: "FALSE", explanation: "Paragraph A notes that AI behavior can be unpredictable." },
      { order_index: 5, type: "tfng", question_text: "All ethical theories can easily accommodate AI systems.", options: null, correct_answer: "FALSE", explanation: "Paragraph B indicates that traditional theories struggle to categorize AI." },
      { order_index: 6, type: "tfng", question_text: "Public involvement in AI governance is universally required by law.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage suggests involvement but does not state legal requirements." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Challenges in assigning responsibility", B: "Debate over AI moral status", C: "Technical constraints in design", D: "Societal governance of AI" }, correct_answer: "B", explanation: "Paragraph B discusses whether AI can be moral agents." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Public and institutional role in AI ethics", B: "Cognitive limitations of AI", C: "Bias in datasets", D: "Economic impact of AI" }, correct_answer: "A", explanation: "Paragraph D focuses on governance and societal implications." },
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
      // Idempotent check by title (since original data used placeholder IDs)
      const existing = await client.query(
        "SELECT id FROM reading_passages WHERE passage_title = $1",
        [p.passage_title]
      );
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
    console.log(`\n\u2705 Band 7.0-8.0 batch 1 seed completed: ${inserted} inserted, ${skipped} skipped`);
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
