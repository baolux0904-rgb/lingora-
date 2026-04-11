/**
 * backend/scripts/seedReadingBand70_80_batch2.js
 *
 * Seeds 5 band_70_80 reading passages (philosophy + economics + science) + questions.
 * Uses a transaction for atomicity. Idempotent — skips existing passages by title.
 *
 * Usage (from backend/ directory):
 *   node scripts/seedReadingBand70_80_batch2.js
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
    id: makeUUID("band70-phil-determinism-choice"),
    topic: "philosophy",
    difficulty: "band_70_80",
    estimated_minutes: 8,
    passage_title: "Determinism and the Illusion of Choice",
    passage_text: "A. The debate over free will has long occupied philosophers, centering on whether human actions are genuinely self-determined or the inevitable result of prior causes. Determinism, the view that all events are causally determined by preceding conditions, appears to challenge the notion of free will by suggesting that every decision is the product of an unbroken chain of events. If this is true, the intuitive sense of choosing freely may be nothing more than a subjective experience rather than an objective reality.\n\nB. Compatibilists, however, argue that free will and determinism are not mutually exclusive. They redefine free will not as the absence of causation, but as the capacity to act in accordance with one\u2019s desires and intentions, even if those desires themselves are determined. From this perspective, an action can be considered free as long as it is not coerced or constrained by external forces. This interpretation preserves moral responsibility by focusing on the internal alignment between intention and action rather than the ultimate origin of those intentions.\n\nC. In contrast, libertarians about free will maintain that genuine freedom requires some form of indeterminacy in human decision-making. They argue that if actions are entirely determined, individuals cannot be held morally accountable in any meaningful sense. Some proponents appeal to concepts from quantum mechanics or emphasize the role of conscious deliberation as evidence of non-deterministic processes. However, critics contend that introducing randomness does not necessarily enhance control, and may instead undermine the very agency libertarians seek to defend.\n\nD. The implications of this debate extend beyond abstract philosophy into practical considerations of law, ethics, and social policy. If human behavior is largely determined, punitive systems based on moral blame may require reevaluation. Conversely, if individuals possess genuine freedom, accountability remains justified. Increasingly, interdisciplinary research in neuroscience and psychology informs this discussion, complicating traditional distinctions between choice and causation. Ultimately, the question of free will may not yield a definitive answer, but it continues to shape how society understands responsibility and human agency.",
    tags: ["philosophy"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What is the central issue introduced in paragraph A?", options: { A: "The scientific basis of human behavior", B: "Whether human choices are truly independent or causally determined", C: "The role of emotions in decision-making", D: "The impact of external constraints on freedom" }, correct_answer: "B", explanation: "Paragraph A presents the conflict between determinism and free will." },
      { order_index: 2, type: "mcq", question_text: "How do compatibilists redefine free will?", options: { A: "As the absence of all causal influences", B: "As the presence of randomness in decisions", C: "As acting according to one's desires without external coercion", D: "As complete independence from prior events" }, correct_answer: "C", explanation: "Paragraph B explains compatibilists focus on internal desires and lack of coercion." },
      { order_index: 3, type: "mcq", question_text: "What is a key criticism of libertarian views mentioned in paragraph C?", options: { A: "They rely too heavily on social explanations", B: "They fail to account for moral responsibility", C: "Randomness does not necessarily provide meaningful control", D: "They reject scientific evidence entirely" }, correct_answer: "C", explanation: "Critics argue randomness undermines agency rather than supports it." },
      { order_index: 4, type: "tfng", question_text: "Determinism claims that all events are influenced by prior causes.", options: null, correct_answer: "TRUE", explanation: "Paragraph A defines determinism in this way." },
      { order_index: 5, type: "tfng", question_text: "Compatibilists deny that human desires are influenced by prior events.", options: null, correct_answer: "FALSE", explanation: "They accept desires may be determined but still consider actions free." },
      { order_index: 6, type: "tfng", question_text: "Neuroscience has conclusively resolved the debate over free will.", options: null, correct_answer: "NOT GIVEN", explanation: "Paragraph D says research informs but does not resolve the debate." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Criticism of libertarianism", B: "Redefinition of free will under determinism", C: "Scientific perspectives", D: "Initial philosophical problem" }, correct_answer: "B", explanation: "Paragraph B explains compatibilist view." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Practical implications of the free will debate", B: "Nature of human desires", C: "Quantum theory and decision-making", D: "Definition of determinism" }, correct_answer: "A", explanation: "Paragraph D discusses societal and ethical consequences." },
    ],
  },
  {
    id: makeUUID("band70-phil-political-obligation"),
    topic: "philosophy",
    difficulty: "band_70_80",
    estimated_minutes: 8,
    passage_title: "Foundations of Political Obligation",
    passage_text: "A. Social Contract Theory seeks to explain the legitimacy of political authority by positing an implicit agreement among individuals to form a society. Rather than viewing power as divinely ordained or naturally inherited, this framework suggests that authority arises from the consent of the governed. Early theorists such as Hobbes, Locke, and Rousseau offered distinct interpretations of this contract, each reflecting different assumptions about human nature. Despite these variations, the central premise remains that individuals relinquish certain freedoms in exchange for security and social order.\n\nB. Thomas Hobbes famously argued that in the absence of political authority, life would exist in a state of nature characterized by constant fear and conflict. In this condition, individuals possess unlimited freedom but lack security, leading to what he described as a war of all against all. To escape this instability, individuals collectively agree to submit to an absolute sovereign, whose authority ensures peace. For Hobbes, the social contract is thus a rational response to the dangers of unregulated freedom.\n\nC. In contrast, John Locke proposed a more optimistic view of human nature and the state of nature. While acknowledging certain inconveniences, Locke argued that individuals possess natural rights to life, liberty, and property even before the formation of government. The social contract, in his view, is established primarily to protect these rights. Crucially, Locke maintained that political authority is conditional: if a government fails to uphold its obligations, citizens retain the right to resist or replace it. This introduces a dynamic relationship between authority and accountability.\n\nD. Contemporary interpretations of Social Contract Theory extend beyond its classical formulations, addressing issues such as inequality, justice, and global governance. Critics argue that the notion of consent is often hypothetical rather than actual, raising questions about its legitimacy. Nevertheless, the theory continues to provide a valuable framework for evaluating political systems, particularly in terms of fairness and mutual obligation. By conceptualizing society as a cooperative enterprise, it emphasizes the moral foundations of collective life while acknowledging the tensions inherent in balancing individual freedom with social stability.",
    tags: ["philosophy"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What is the fundamental idea of Social Contract Theory presented in paragraph A?", options: { A: "Political power is derived from divine authority", B: "Individuals naturally prefer complete freedom without constraints", C: "Authority is based on an agreement among individuals", D: "Governments exist independently of human consent" }, correct_answer: "C", explanation: "Paragraph A explains that authority arises from collective consent." },
      { order_index: 2, type: "mcq", question_text: "According to Hobbes in paragraph B, why do individuals accept a sovereign authority?", options: { A: "To gain economic advantages", B: "To escape insecurity and constant conflict", C: "To preserve natural rights", D: "To achieve equality among citizens" }, correct_answer: "B", explanation: "Hobbes argues people seek security from the chaotic state of nature." },
      { order_index: 3, type: "mcq", question_text: "How does Locke's view differ from Hobbes' perspective?", options: { A: "Locke denies the existence of natural rights", B: "Locke supports absolute authority without conditions", C: "Locke emphasizes conditional authority and protection of rights", D: "Locke believes society should remain in the state of nature" }, correct_answer: "C", explanation: "Locke emphasizes natural rights and conditional government authority." },
      { order_index: 4, type: "tfng", question_text: "Social Contract Theory assumes that individuals willingly give up some freedoms for social order.", options: null, correct_answer: "TRUE", explanation: "Paragraph A states individuals relinquish freedoms for security." },
      { order_index: 5, type: "tfng", question_text: "Hobbes believed that people in the state of nature lived peacefully.", options: null, correct_answer: "FALSE", explanation: "Paragraph B describes it as a state of conflict and fear." },
      { order_index: 6, type: "tfng", question_text: "All modern political systems are directly based on Social Contract Theory.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage does not claim universal application." },
      { order_index: 7, type: "matching", question_text: "Match paragraph C with its main idea", options: { A: "Criticism of consent", B: "Conditional authority and natural rights", C: "Chaos in the state of nature", D: "General definition of theory" }, correct_answer: "B", explanation: "Paragraph C explains Locke's emphasis on rights and accountability." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Modern critiques and relevance of the theory", B: "Origins of political authority", C: "Absolute sovereignty", D: "Human nature assumptions" }, correct_answer: "A", explanation: "Paragraph D discusses contemporary interpretations and criticisms." },
    ],
  },
  {
    id: makeUUID("band70-econ-inequality-growth"),
    topic: "economics",
    difficulty: "band_70_80",
    estimated_minutes: 8,
    passage_title: "The Paradox of Inequality and Growth",
    passage_text: "A. The relationship between economic inequality and growth has long been a subject of theoretical and empirical debate. Traditional economic models often posited that inequality could stimulate growth by concentrating capital in the hands of those most likely to invest. However, more recent research challenges this assumption, suggesting that excessive inequality may, in fact, hinder long-term economic performance. The complexity of this relationship lies in the interaction between incentives, access to resources, and institutional structures.\n\nB. Proponents of inequality-driven growth argue that disparities in income create incentives for innovation and productivity. Higher potential rewards can motivate individuals to invest in education, entrepreneurship, and risk-taking activities. Moreover, wealth accumulation among the affluent may lead to increased investment in capital-intensive industries, potentially accelerating economic expansion. From this perspective, some degree of inequality is not only inevitable but also functionally beneficial.\n\nC. Critics, however, contend that high levels of inequality can undermine growth by limiting access to opportunities. When wealth is concentrated, lower-income individuals may face barriers to education, healthcare, and financial capital, reducing their ability to contribute productively to the economy. This can result in underutilization of human potential and slower aggregate growth. Additionally, inequality may erode social cohesion and trust, leading to political instability and policy inefficiencies that further constrain economic development.\n\nD. Contemporary analyses increasingly emphasize the importance of balance, suggesting that both extreme inequality and excessive redistribution can be detrimental. Policies aimed at inclusive growth seek to combine economic efficiency with equitable access to opportunities. These approaches often focus on improving education systems, expanding access to credit, and strengthening institutional frameworks. Ultimately, the challenge lies in designing policies that sustain growth while ensuring that its benefits are broadly shared, thereby reinforcing both economic and social stability.",
    tags: ["economics"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What is the main argument presented in paragraph A?", options: { A: "Inequality always promotes economic growth", B: "The relationship between inequality and growth is complex and debated", C: "Economic growth is independent of inequality", D: "Inequality should be eliminated entirely" }, correct_answer: "B", explanation: "Paragraph A highlights the complexity and evolving debate." },
      { order_index: 2, type: "mcq", question_text: "Why do some economists believe inequality can promote growth?", options: { A: "It ensures equal distribution of resources", B: "It reduces political instability", C: "It creates incentives for innovation and investment", D: "It eliminates poverty entirely" }, correct_answer: "C", explanation: "Paragraph B emphasizes incentives and investment." },
      { order_index: 3, type: "mcq", question_text: "What is a key criticism of high inequality mentioned in paragraph C?", options: { A: "It increases government efficiency", B: "It limits access to opportunities for lower-income individuals", C: "It encourages innovation across all groups", D: "It guarantees political stability" }, correct_answer: "B", explanation: "Paragraph C explains barriers to education and capital." },
      { order_index: 4, type: "tfng", question_text: "All economists agree that inequality is beneficial for growth.", options: null, correct_answer: "FALSE", explanation: "Paragraph A states there is debate." },
      { order_index: 5, type: "tfng", question_text: "High inequality can lead to underutilization of human potential.", options: null, correct_answer: "TRUE", explanation: "Paragraph C explains limited access reduces productivity." },
      { order_index: 6, type: "tfng", question_text: "Excessive redistribution always leads to faster economic growth.", options: null, correct_answer: "NOT GIVEN", explanation: "The passage suggests balance but does not claim this." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Negative effects of inequality", B: "Incentive-based justification for inequality", C: "Policy solutions", D: "Overview of debate" }, correct_answer: "B", explanation: "Paragraph B focuses on incentives and investment." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Balanced policy approaches to growth and equality", B: "Criticism of inequality", C: "Historical perspectives", D: "Economic theory origins" }, correct_answer: "A", explanation: "Paragraph D discusses inclusive growth and policy balance." },
    ],
  },
  {
    id: makeUUID("band70-econ-behavioral-finance"),
    topic: "economics",
    difficulty: "band_70_80",
    estimated_minutes: 8,
    passage_title: "Psychology in Financial Markets",
    passage_text: "A. Behavioral finance challenges the traditional assumption that financial markets are composed of fully rational actors who process information efficiently. Instead, it posits that psychological biases and emotional responses significantly influence investment decisions, often leading to systematic deviations from rationality. These deviations are not random but exhibit consistent patterns, suggesting that markets may be less efficient than classical theories predict. As a result, price movements can reflect not only fundamental values but also collective psychological tendencies.\n\nB. One of the most prominent biases in behavioral finance is overconfidence, where investors overestimate their knowledge, predictive ability, or control over outcomes. This often leads to excessive trading, as individuals believe they can outperform the market despite evidence to the contrary. Overconfidence can inflate asset prices during periods of optimism and contribute to market volatility when expectations are not met. Consequently, it plays a significant role in the formation of financial bubbles.\n\nC. Another key concept is herd behavior, in which individuals mimic the actions of others rather than relying on independent analysis. This tendency is particularly evident during periods of market uncertainty, where investors look to the behavior of others as a heuristic for decision-making. While herding can sometimes lead to coordinated market trends, it also increases the risk of asset mispricing and abrupt market corrections. The collective movement of investors amplifies both upward and downward market swings, reinforcing instability.\n\nD. Despite these inefficiencies, behavioral finance does not imply that markets are entirely irrational or unpredictable. Instead, it highlights the need for models that incorporate psychological factors alongside traditional economic variables. By understanding the cognitive and emotional drivers of investor behavior, policymakers and financial institutions can design interventions to mitigate extreme volatility. Ultimately, behavioral finance offers a more nuanced perspective on market dynamics, acknowledging the complex interplay between rational calculation and human psychology.",
    tags: ["economics"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What is the central claim made in paragraph A?", options: { A: "Financial markets are always efficient", B: "Investor behavior is purely rational", C: "Psychological factors influence financial decisions and market outcomes", D: "Market prices reflect only fundamental values" }, correct_answer: "C", explanation: "Paragraph A emphasizes the role of psychological biases in financial markets." },
      { order_index: 2, type: "mcq", question_text: "How does overconfidence affect investor behavior?", options: { A: "It reduces trading activity", B: "It leads investors to rely more on external advice", C: "It causes excessive trading due to overestimation of ability", D: "It eliminates market volatility" }, correct_answer: "C", explanation: "Paragraph B explains that overconfidence results in excessive trading." },
      { order_index: 3, type: "mcq", question_text: "What is a key risk associated with herd behavior?", options: { A: "Improved individual decision-making", B: "Stable and predictable markets", C: "Increased likelihood of mispricing and sudden corrections", D: "Reduced market participation" }, correct_answer: "C", explanation: "Paragraph C highlights mispricing and instability caused by herding." },
      { order_index: 4, type: "tfng", question_text: "Behavioral finance assumes that investor irrationality occurs randomly.", options: null, correct_answer: "FALSE", explanation: "Paragraph A states that deviations follow predictable patterns." },
      { order_index: 5, type: "tfng", question_text: "Overconfidence can contribute to the formation of financial bubbles.", options: null, correct_answer: "TRUE", explanation: "Paragraph B explicitly mentions this effect." },
      { order_index: 6, type: "tfng", question_text: "Herd behavior always results in accurate market pricing.", options: null, correct_answer: "FALSE", explanation: "Paragraph C states it can lead to mispricing." },
      { order_index: 7, type: "matching", question_text: "Match paragraph B with its main idea", options: { A: "Collective investor behavior", B: "Overconfidence and its effects", C: "Market efficiency theory", D: "Policy implications" }, correct_answer: "B", explanation: "Paragraph B focuses on overconfidence bias." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Complete irrationality of markets", B: "Psychological drivers of bubbles", C: "Integration of psychology into financial models", D: "Short-term trading strategies" }, correct_answer: "C", explanation: "Paragraph D discusses combining psychology with traditional models." },
    ],
  },
  {
    id: makeUUID("band70-sci-quantum-computing"),
    topic: "science",
    difficulty: "band_70_80",
    estimated_minutes: 8,
    passage_title: "Reimagining Computation with Quantum Mechanics",
    passage_text: "A. Quantum computing represents a fundamental departure from classical models of computation by exploiting principles derived from quantum mechanics. Whereas classical computers process information in binary units, or bits, quantum computers utilize quantum bits, or qubits, which can exist in multiple states simultaneously through a property known as superposition. This allows quantum systems to perform certain calculations in parallel, potentially offering exponential speed advantages for specific classes of problems. However, this conceptual power also introduces significant challenges in terms of stability and control.\n\nB. A second defining feature of quantum computing is entanglement, a phenomenon in which the states of qubits become interdependent regardless of physical distance. Through entanglement, operations performed on one qubit can instantaneously influence another, enabling highly coordinated computational processes. This interconnectedness enhances computational capacity but also complicates system design, as maintaining entangled states requires precise environmental conditions. Even minor disturbances can disrupt these fragile quantum states, leading to errors in computation.\n\nC. Despite its theoretical promise, the practical implementation of quantum computing remains in its early stages. One of the most significant obstacles is decoherence, the process by which quantum systems lose their quantum properties due to interaction with their surroundings. Researchers are actively developing error-correction techniques and more robust qubit architectures to address this issue. Additionally, current quantum devices are often described as noisy, meaning they produce unreliable outputs that limit their applicability in real-world scenarios.\n\nD. Nevertheless, quantum computing holds transformative potential across a range of fields, including cryptography, materials science, and optimization problems. For example, certain quantum algorithms could factor large numbers far more efficiently than classical methods, posing both opportunities and risks for data security. As research progresses, the integration of quantum and classical systems may become increasingly important, combining the strengths of both paradigms. Ultimately, while quantum computing is unlikely to replace classical computing entirely, it may redefine the boundaries of what is computationally feasible.",
    tags: ["science"],
    created_by: "ai_generated",
    review_status: "pending",
    questions: [
      { order_index: 1, type: "mcq", question_text: "What is the key distinction between classical and quantum computing mentioned in paragraph A?", options: { A: "Classical computers are faster than quantum computers", B: "Quantum computers use qubits that can exist in multiple states simultaneously", C: "Classical computers rely on entanglement", D: "Quantum computers cannot perform parallel processing" }, correct_answer: "B", explanation: "Paragraph A explains that qubits use superposition, unlike binary bits." },
      { order_index: 2, type: "mcq", question_text: "What role does entanglement play in quantum computing?", options: { A: "It isolates qubits from external interference", B: "It ensures qubits operate independently", C: "It allows qubits to influence each other and coordinate computations", D: "It reduces computational complexity to zero" }, correct_answer: "C", explanation: "Paragraph B describes entanglement as interdependence between qubits." },
      { order_index: 3, type: "mcq", question_text: "Why is decoherence a major challenge in quantum computing?", options: { A: "It increases computational speed uncontrollably", B: "It causes quantum systems to lose their unique properties", C: "It simplifies system design", D: "It eliminates the need for error correction" }, correct_answer: "B", explanation: "Paragraph C states decoherence disrupts quantum states." },
      { order_index: 4, type: "tfng", question_text: "Quantum computers can process multiple possibilities simultaneously.", options: null, correct_answer: "TRUE", explanation: "Paragraph A explains superposition allows parallel computation." },
      { order_index: 5, type: "tfng", question_text: "Entanglement makes quantum systems more stable and less error-prone.", options: null, correct_answer: "FALSE", explanation: "Paragraph B indicates entanglement increases fragility." },
      { order_index: 6, type: "tfng", question_text: "Quantum computers have already replaced classical computers in most applications.", options: null, correct_answer: "FALSE", explanation: "Paragraph D states they will not replace classical systems entirely." },
      { order_index: 7, type: "matching", question_text: "Match paragraph C with its main idea", options: { A: "Applications of quantum computing", B: "Technical challenges and limitations", C: "Fundamental principles", D: "Historical development" }, correct_answer: "B", explanation: "Paragraph C discusses decoherence and noisy systems." },
      { order_index: 8, type: "matching", question_text: "Match paragraph D with its main idea", options: { A: "Future potential and implications", B: "Quantum theory basics", C: "System instability", D: "Hardware limitations" }, correct_answer: "A", explanation: "Paragraph D focuses on applications and future impact." },
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
    console.log(`\n\u2705 Band 7.0-8.0 batch 2 seed completed: ${inserted} inserted, ${skipped} skipped`);
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
