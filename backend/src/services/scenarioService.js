/**
 * scenarioService.js
 *
 * Orchestrates scenario speaking practice + IELTS speaking exam.
 *
 * IELTS sessions use an EXPLICIT STATE MACHINE:
 *  - State is persisted in DB (session_meta JSONB column)
 *  - Each submitTurn call reads the current state, processes the turn,
 *    then EXPLICITLY advances to the next state
 *  - Turn count is NOT used to derive state — state drives everything
 *  - State transitions are logged for auditability
 */

const { createAiProvider } = require("../providers/ai/aiProvider");
const scenarioRepository = require("../repositories/scenarioRepository");

const ai = createAiProvider();

// ---------------------------------------------------------------------------
// IELTS Constants
// ---------------------------------------------------------------------------

const IELTS_PART1_QUESTIONS = 5;
const IELTS_PART3_QUESTIONS = 5;

// ---------------------------------------------------------------------------
// IELTS Part 1 Topic Sets — diverse personal/familiar topics
// Each set has a theme and specific question prompts for the AI to use.
// ---------------------------------------------------------------------------

const IELTS_PART1_TOPIC_SETS = [
  {
    theme: "Home & Accommodation",
    questions: [
      "Can you describe the place where you live?",
      "What do you like most about your home?",
      "Is there anything you would like to change about your home?",
      "Do you plan to live there for a long time?",
    ],
  },
  {
    theme: "Work & Studies",
    questions: [
      "Do you work or are you a student?",
      "What do you enjoy most about your work or studies?",
      "Would you like to change your job or field of study in the future?",
      "What did you want to be when you were younger?",
    ],
  },
  {
    theme: "Hometown & Neighbourhood",
    questions: [
      "Where is your hometown?",
      "What is the best thing about living there?",
      "Has your hometown changed much in recent years?",
      "Would you recommend your hometown to visitors?",
    ],
  },
  {
    theme: "Daily Routine & Leisure",
    questions: [
      "What does a typical day look like for you?",
      "Do you prefer mornings or evenings?",
      "How do you usually relax after a busy day?",
      "Has your daily routine changed recently?",
    ],
  },
  {
    theme: "Food & Cooking",
    questions: [
      "What kind of food do you enjoy eating?",
      "Do you prefer eating at home or in restaurants?",
      "Have you ever tried cooking a dish from another country?",
      "Is there a food you disliked as a child but enjoy now?",
    ],
  },
  {
    theme: "Travel & Transport",
    questions: [
      "How do you usually travel to work or school?",
      "Do you enjoy travelling to new places?",
      "What was the last trip you took?",
      "Do you prefer travelling alone or with others?",
    ],
  },
  {
    theme: "Technology & Internet",
    questions: [
      "How often do you use the internet?",
      "What do you mainly use your phone for?",
      "Do you think people spend too much time on technology?",
      "Is there a piece of technology you could not live without?",
    ],
  },
  {
    theme: "Friends & Social Life",
    questions: [
      "Do you prefer spending time with a few close friends or a large group?",
      "How do you usually keep in touch with friends?",
      "Have your friendships changed since you were younger?",
      "What qualities do you value most in a friend?",
    ],
  },
];

// ---------------------------------------------------------------------------
// IELTS Part 2 Cue Cards — expanded with Part 3 theme link
// ---------------------------------------------------------------------------

const IELTS_CUE_CARDS = [
  { topic: "Describe a place you would like to visit", prompts: ["Where the place is", "How you heard about it", "What you would do there", "Why you would like to visit it"], part3Theme: "tourism and travel" },
  { topic: "Describe a person who has inspired you", prompts: ["Who this person is", "How you know them", "What they have done that inspired you", "Why they have been important to you"], part3Theme: "role models and influence" },
  { topic: "Describe a skill you would like to learn", prompts: ["What the skill is", "Why you want to learn it", "How you would learn it", "How useful this skill would be for you"], part3Theme: "learning and education" },
  { topic: "Describe a memorable journey you have made", prompts: ["Where you went", "Who you went with", "What happened during the journey", "Why this journey was memorable"], part3Theme: "travel experiences and transportation" },
  { topic: "Describe a book or film that made you think", prompts: ["What it was about", "When you read or watched it", "What ideas it presented", "Why it made an impression on you"], part3Theme: "media, culture, and storytelling" },
  { topic: "Describe a time you helped someone", prompts: ["Who you helped", "Why they needed help", "How you helped them", "How you felt afterwards"], part3Theme: "helping others and community" },
  { topic: "Describe a tradition in your country that you enjoy", prompts: ["What the tradition is", "When it takes place", "How people celebrate or practise it", "Why it is important to you personally"], part3Theme: "culture and traditions" },
  { topic: "Describe a piece of technology that has changed your daily life", prompts: ["What the technology is", "When you started using it", "How you use it in your daily life", "How your life was different before you had it"], part3Theme: "technology and modern life" },
  { topic: "Describe an achievement you are proud of", prompts: ["What you achieved", "When it happened", "How you achieved it", "Why you feel proud of it"], part3Theme: "success, ambition, and motivation" },
  { topic: "Describe a time when you had to make a difficult decision", prompts: ["What the decision was", "Why it was difficult", "What you decided to do", "How you felt about the outcome"], part3Theme: "decision-making and responsibility" },
  { topic: "Describe a public place you enjoy visiting", prompts: ["What the place is", "Where it is located", "What you do there", "Why you enjoy going there"], part3Theme: "public spaces and urban planning" },
  { topic: "Describe a hobby or activity you enjoy doing in your free time", prompts: ["What the activity is", "How often you do it", "Who you do it with", "Why you find it enjoyable"], part3Theme: "leisure, hobbies, and work-life balance" },
];

// ---------------------------------------------------------------------------
// IELTS State Machine — Explicit Transitions
// ---------------------------------------------------------------------------

/**
 * State shape (persisted in session_meta JSONB):
 * {
 *   part: 1 | 2 | 3,
 *   phase: "question" | "transition_to_part2" | "cue_card" | "long_turn" |
 *          "follow_up" | "transition_to_part3" | "question_p3" | "complete",
 *   questionIndex: number,         // 0-based within current part
 *   cueCardIndex: number,          // index into IELTS_CUE_CARDS
 *   transitionHistory: string[],   // audit trail of state transitions
 * }
 */

/**
 * Create the initial IELTS state for a new session.
 */
function createInitialIeltsState(cueCardIndex) {
  const topicSetIndex = Math.floor(Math.random() * IELTS_PART1_TOPIC_SETS.length);
  return {
    part: 1,
    phase: "question",
    questionIndex: 0,
    cueCardIndex,
    topicSetIndex,
    // Track user response quality for Part 3 adaptive difficulty
    userWordCounts: [],       // word count per real user turn
    userResponses: [],        // raw text of real user turns (for vocabulary analysis)
    userResponseCount: 0,     // number of substantive user turns
    transitionHistory: ["init → part1:question:0"],
  };
}

/**
 * EXPLICIT state transition — given the current state + the fact that the user
 * just submitted a turn, compute the NEXT state.
 *
 * This is NOT based on turn count. It reads the current state and advances it.
 * Each transition is logged in transitionHistory for auditability.
 */
function advanceIeltsState(currentState) {
  const next = { ...currentState, transitionHistory: [...currentState.transitionHistory] };
  const from = `part${next.part}:${next.phase}:${next.questionIndex}`;

  // ── Part 1: question → question → ... → transition_to_part2 ──
  if (next.part === 1 && next.phase === "question") {
    if (next.questionIndex + 1 >= IELTS_PART1_QUESTIONS) {
      // All Part 1 questions asked → transition to Part 2
      next.part = 2;
      next.phase = "transition_to_part2";
      next.questionIndex = 0;
    } else {
      // Next Part 1 question
      next.questionIndex += 1;
    }
    next.transitionHistory.push(`${from} → part${next.part}:${next.phase}:${next.questionIndex}`);
    return next;
  }

  // ── Part 2: transition_to_part2 → cue_card (user preps) ──
  if (next.part === 2 && next.phase === "transition_to_part2") {
    next.phase = "cue_card";
    next.transitionHistory.push(`${from} → part2:cue_card:0`);
    return next;
  }

  // ── Part 2: cue_card → long_turn (user speaks for 2 min) ──
  if (next.part === 2 && next.phase === "cue_card") {
    next.phase = "long_turn";
    next.transitionHistory.push(`${from} → part2:long_turn:0`);
    return next;
  }

  // ── Part 2: long_turn → follow_up (examiner asks 1 follow-up) ──
  if (next.part === 2 && next.phase === "long_turn") {
    next.phase = "follow_up";
    next.transitionHistory.push(`${from} → part2:follow_up:0`);
    return next;
  }

  // ── Part 2: follow_up → transition_to_part3 ──
  if (next.part === 2 && next.phase === "follow_up") {
    next.part = 3;
    next.phase = "transition_to_part3";
    next.questionIndex = 0;
    next.transitionHistory.push(`${from} → part3:transition_to_part3:0`);
    return next;
  }

  // ── Part 3: transition_to_part3 → question_p3 ──
  if (next.part === 3 && next.phase === "transition_to_part3") {
    next.phase = "question_p3";
    next.transitionHistory.push(`${from} → part3:question_p3:0`);
    return next;
  }

  // ── Part 3: question_p3 → question_p3 → ... → complete ──
  if (next.part === 3 && next.phase === "question_p3") {
    if (next.questionIndex + 1 >= IELTS_PART3_QUESTIONS) {
      next.phase = "complete";
    } else {
      next.questionIndex += 1;
    }
    next.transitionHistory.push(`${from} → part${next.part}:${next.phase}:${next.questionIndex}`);
    return next;
  }

  // Already complete — no transition
  return next;
}

/**
 * Multi-signal response quality analysis for adaptive difficulty.
 *
 * Signals:
 * - avgWordCount: average words per response
 * - vocabComplexity: ratio of words > 6 chars (proxy for advanced vocabulary)
 * - sentenceComplexity: avg commas + conjunctions per response (proxy for compound/complex sentences)
 *
 * Returns: { level: "strong"|"moderate"|"limited", avgWords, vocabRatio, complexityAvg }
 */
function analyzeResponseQuality(state) {
  const counts = state.userWordCounts || [];
  const responses = state.userResponses || [];

  if (counts.length === 0) {
    return { level: "unknown", avgWords: 0, vocabRatio: 0, complexityAvg: 0 };
  }

  const avgWords = counts.reduce((a, b) => a + b, 0) / counts.length;

  // Vocabulary complexity: ratio of "long" words (>6 chars) across all responses
  let totalWords = 0;
  let longWords = 0;
  let totalComplexitySignals = 0;

  for (const text of responses) {
    const words = text.trim().split(/\s+/).filter(Boolean);
    totalWords += words.length;
    longWords += words.filter(w => w.replace(/[^a-zA-Z]/g, "").length > 6).length;
    // Sentence complexity signals: commas, semicolons, conjunctions
    const commas = (text.match(/,/g) || []).length;
    const conjunctions = (text.match(/\b(because|although|however|moreover|furthermore|nevertheless|whereas|therefore|consequently)\b/gi) || []).length;
    totalComplexitySignals += commas + conjunctions * 2;
  }

  const vocabRatio = totalWords > 0 ? longWords / totalWords : 0;
  const complexityAvg = responses.length > 0 ? totalComplexitySignals / responses.length : 0;

  // Composite scoring
  let score = 0;
  if (avgWords >= 40) score += 3;
  else if (avgWords >= 25) score += 2;
  else if (avgWords >= 12) score += 1;

  if (vocabRatio >= 0.20) score += 2;
  else if (vocabRatio >= 0.10) score += 1;

  if (complexityAvg >= 2.0) score += 2;
  else if (complexityAvg >= 1.0) score += 1;

  const level = score >= 5 ? "strong" : score >= 3 ? "moderate" : "limited";

  return { level, avgWords, vocabRatio, complexityAvg };
}

/**
 * Build a strict IELTS examiner system prompt based on current state.
 */
function buildIeltsSystemPrompt(state) {
  const cueCard = IELTS_CUE_CARDS[state.cueCardIndex % IELTS_CUE_CARDS.length];
  const topicSet = IELTS_PART1_TOPIC_SETS[state.topicSetIndex % IELTS_PART1_TOPIC_SETS.length];

  const base = `You are a certified IELTS Speaking examiner conducting an official IELTS Speaking test in a quiet examination room. You have years of experience. You are calm, professional, and genuinely attentive to what the candidate says.

EXAMINER PERSONALITY:
- You are a real person, not a machine. You have warmth but maintain professional distance.
- You listen carefully. Your questions sometimes reference what the candidate just said.
- You speak with natural rhythm — not rushed, not robotic.

HUMAN BEHAVIOUR (mandatory — this is what separates you from a chatbot):
- After the candidate finishes answering, ALWAYS begin your next response with a BRIEF neutral acknowledgment before asking the next question. Vary these naturally:
  "Thank you." / "Okay." / "Right." / "Alright." / "I see." / "Okay, thank you."
- NEVER use the same acknowledgment twice in a row.
- When changing topic within a part, use a SHORT natural transition:
  "Now, I'd like to ask you about..." / "Let's move on to talk about..." / "Turning to a different topic..."
- If the candidate gives an extremely short answer (less than one sentence), you may gently prompt ONCE:
  "Could you tell me a bit more about that?" or "Could you expand on that?"
  But do NOT insist or repeat the prompt.

STRICT RULES:
- Ask ONE question at a time. Never double-question.
- Keep questions to 1–2 sentences maximum.
- NEVER praise: no "Good answer!", "That's interesting!", "Well done!", "Great!".
- NEVER explain the test structure or what part you are in.
- NEVER use mechanical filler: "Let me ask you", "I'd like to ask you".
- If the candidate asks a meta-question, redirect: "Let's continue." then ask the next question.
- Your tone should resemble a university professor conducting a calm interview, not a customer service chatbot.`;

  // ── Part 1: Introduction & Interview ──
  if (state.part === 1 && state.phase === "question") {
    if (state.questionIndex === 0) {
      return `${base}

CURRENT STATE: Part 1 — Opening. This is the very first thing you say.

INSTRUCTIONS:
- Greet the candidate naturally: "Good morning. My name is [pick a common English name like Sarah, David, James, or Emily]. Could you tell me your full name, please?"
- After they respond, verify their identity: "And can I see your identification, please?" (This is standard IELTS protocol — say it even though there is no physical ID to check.)
- Then ask your first question from the topic area: "${topicSet.theme}"
- Combine the greeting, ID check, and first topic question into ONE response. Keep it concise.
- Example flow: "Good morning. My name is Sarah. Could you tell me your full name, please? ... Thank you. And can I see your identification? ... Thank you, that's fine. Now, in the first part of the test, I'm going to ask you some questions about yourself. ${topicSet.questions[0]}"
- IMPORTANT: Do NOT say "My name is the examiner". Use a real first name.`;
    }

    const questionHint = topicSet.questions[Math.min(state.questionIndex, topicSet.questions.length - 1)];
    return `${base}

CURRENT STATE: Part 1, Question ${state.questionIndex + 1} of ${IELTS_PART1_QUESTIONS}
Topic area: "${topicSet.theme}"

INSTRUCTIONS:
- Start with a BRIEF acknowledgment of the candidate's previous answer. Vary naturally: "Thank you.", "Okay.", "Right.", "Alright."
- Then ask ONE question about "${topicSet.theme}".
- Use this as a guide (rephrase naturally, do not read it verbatim): "${questionHint}"
- Keep your total response to 2 sentences maximum (acknowledgment + question).
- Do NOT repeat a topic already covered in this session.
- If this is question 5 (the last Part 1 question), do NOT announce Part 2 — the system handles that.`;
  }

  // ── Part 2: transition announcement ──
  if (state.part === 2 && state.phase === "transition_to_part2") {
    return `${base}

CURRENT STATE: Transitioning to Part 2.

INSTRUCTIONS:
- Say EXACTLY this (word for word): "Now I'm going to give you a topic and I'd like you to talk about it for one to two minutes. Before you talk, you'll have one minute to think about what you're going to say. You can make some notes if you wish. Here is your topic."
- Do NOT mention the specific topic text — the system will display the task card separately.
- Do NOT add anything else.`;
  }

  // ── Part 2: follow-up ──
  if (state.part === 2 && state.phase === "follow_up") {
    return `${base}

CURRENT STATE: Part 2 Follow-up. The candidate just finished their long turn about: "${cueCard.topic}"

INSTRUCTIONS:
- Ask ONE brief rounding-off question related to what the candidate just said about "${cueCard.topic}".
- This should be a simple, short question — not a deep discussion question. Examples:
  "Do you think you will actually do this in the future?"
  "Is this something many people in your country would agree with?"
  "Has your opinion on this changed over time?"
- Keep it to 1 sentence. Do NOT start Part 3 yet.`;
  }

  // ── Part 3: transition announcement ──
  if (state.part === 3 && state.phase === "transition_to_part3") {
    const themeLabel = cueCard.part3Theme || cueCard.topic.toLowerCase().replace("describe ", "");
    return `${base}

CURRENT STATE: Transitioning to Part 3.
Part 2 topic was: "${cueCard.topic}"
Part 3 discussion theme: "${themeLabel}"

INSTRUCTIONS:
- Transition naturally. Say something like: "We've been talking about ${cueCard.topic.toLowerCase().replace("describe ", "")} and I'd like to discuss some more general questions related to this."
- Then immediately ask your FIRST Part 3 discussion question about the theme of "${themeLabel}".
- The question should be more abstract and analytical than Part 1 — about society, trends, or opinions.
- Combine the transition and first question into ONE response.`;
  }

  // ── Part 3: discussion questions (adaptive difficulty) ──
  if (state.part === 3 && state.phase === "question_p3") {
    const analysis = analyzeResponseQuality(state);
    const themeLabel = cueCard.part3Theme || cueCard.topic.toLowerCase().replace("describe ", "");

    let difficultyInstruction;
    if (analysis.level === "strong") {
      difficultyInstruction = `CANDIDATE ASSESSMENT: Strong communicator (avg ${Math.round(analysis.avgWords)} words/response, good vocabulary range, complex sentence structures).
INSTRUCTION: Push this candidate. Ask deeper, more abstract questions that require nuanced reasoning. Use styles like:
  - "To what extent do you think..."
  - "Some people argue that... What is your view?"
  - "How might this issue evolve over the next generation?"
  - "What are the potential drawbacks of..."
  - "Can you think of any exceptions to that?"`;
    } else if (analysis.level === "moderate") {
      difficultyInstruction = `CANDIDATE ASSESSMENT: Adequate communicator (avg ${Math.round(analysis.avgWords)} words/response, developing vocabulary).
INSTRUCTION: Ask clear, thought-provoking questions that invite extended answers without overwhelming the candidate. Use styles like:
  - "Why do you think some people..."
  - "How has this changed in recent years?"
  - "What are the advantages and disadvantages of..."
  - "Do you think this is the same in all countries?"`;
    } else {
      difficultyInstruction = `CANDIDATE ASSESSMENT: Developing communicator (avg ${Math.round(analysis.avgWords)} words/response, basic vocabulary).
INSTRUCTION: Ask accessible but open-ended questions. Avoid overly abstract phrasing. Use styles like:
  - "Do you think most people in your country..."
  - "How is this different now compared to the past?"
  - "Why do you think this is important?"
  - "What do you think is the main reason for..."`;
    }

    return `${base}

CURRENT STATE: Part 3, Question ${state.questionIndex + 1} of ${IELTS_PART3_QUESTIONS}
Part 2 topic was: "${cueCard.topic}"
Part 3 discussion theme: "${themeLabel}"

${difficultyInstruction}

RULES:
- Start with a brief acknowledgment of the candidate's previous answer ("Thank you.", "Okay.", "Right.") before asking your question.
- Ask ONE discussion question about "${themeLabel}".
- Questions must be abstract/analytical — about society, trends, comparisons, or opinions. NOT personal.
- Do NOT repeat an angle already covered in Part 3.
- Keep your question to 1-2 sentences maximum.`;
  }

  // ── Complete ──
  if (state.phase === "complete") {
    return `${base}

CURRENT STATE: Test complete.

INSTRUCTIONS:
- Say EXACTLY: "Thank you. That is the end of the speaking test. Thank you for your time."
- Do NOT add any feedback, scores, or additional commentary.`;
  }

  return base;
}

// ---------------------------------------------------------------------------
// Scenario catalogue
// ---------------------------------------------------------------------------

async function listScenarios(category) {
  return scenarioRepository.findAllScenarios(category);
}

async function getScenario(id) {
  const scenario = await scenarioRepository.findScenarioById(id);
  if (!scenario) {
    const err = new Error("Scenario not found");
    err.status = 404;
    throw err;
  }
  return scenario;
}

// ---------------------------------------------------------------------------
// Session lifecycle
// ---------------------------------------------------------------------------

async function startSession(scenarioId, userId) {
  const scenario = await scenarioRepository.findScenarioById(scenarioId);
  if (!scenario) {
    const err = new Error("Scenario not found");
    err.status = 404;
    throw err;
  }

  await scenarioRepository.abandonActiveSession(userId);
  const session = await scenarioRepository.createSession(scenarioId, userId);

  const isIelts = scenario.category === "exam";
  let openingContent;

  if (isIelts) {
    const cueCardIndex = Math.floor(Math.random() * IELTS_CUE_CARDS.length);
    const initialState = createInitialIeltsState(cueCardIndex);

    // Persist state to DB
    await scenarioRepository.updateSessionMeta(session.id, initialState);

    // Generate examiner opening with strict prompt
    const systemPrompt = buildIeltsSystemPrompt(initialState);
    openingContent = await ai.generateResponse(systemPrompt, [], { category: "exam" });

    console.log(`[ielts] Session started: ${session.id} | cueCard: ${cueCardIndex} | state: part1:question:0`);
  } else {
    openingContent = scenario.opening_message;
  }

  const openingTurn = await scenarioRepository.insertTurn(
    session.id, 0, "assistant", openingContent
  );

  // Return cue card so frontend can display it during Part 2
  const cueCard = isIelts
    ? IELTS_CUE_CARDS[(await scenarioRepository.getSessionMeta(session.id))?.cueCardIndex ?? 0]
    : null;

  return {
    sessionId: session.id,
    title: session.title,
    emoji: session.emoji,
    category: session.category,
    cueCard: cueCard || undefined,
    turns: [{
      turnIndex: openingTurn.turn_index,
      role: openingTurn.role,
      content: openingTurn.content,
      createdAt: openingTurn.created_at,
    }],
  };
}

async function submitTurn(sessionId, userId, content) {
  const session = await scenarioRepository.findSessionById(sessionId);
  if (!session) {
    const err = new Error("Session not found");
    err.status = 404;
    throw err;
  }
  if (session.user_id !== userId) {
    const err = new Error("Not authorized to access this session");
    err.status = 403;
    throw err;
  }
  if (session.status !== "active") {
    const err = new Error("Session is no longer active");
    err.status = 400;
    throw err;
  }

  const existingTurns = await scenarioRepository.findSessionTurns(sessionId);
  const nextIndex = existingTurns.length;

  // Save user turn
  const userTurn = await scenarioRepository.insertTurn(sessionId, nextIndex, "user", content);

  // Build conversation history for AI
  const conversationHistory = existingTurns.map(t => ({ role: t.role, content: t.content }));
  conversationHistory.push({ role: "user", content });

  const isIelts = session.category === "exam";
  let aiContent;
  let ieltsState = null;

  if (isIelts) {
    // ── Read current state from DB ──
    const currentState = await scenarioRepository.getSessionMeta(sessionId);
    if (!currentState || !currentState.part) {
      console.error(`[ielts] FATAL: No state found for session ${sessionId}`);
      const err = new Error("IELTS session state corrupted");
      err.status = 500;
      throw err;
    }

    // ── Track user response quality (skip placeholders) ──
    const isPlaceholder = content.startsWith("[") && content.endsWith("]");
    if (!isPlaceholder) {
      const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
      currentState.userWordCounts = [...(currentState.userWordCounts || []), wordCount];
      currentState.userResponses = [...(currentState.userResponses || []), content];
      currentState.userResponseCount = (currentState.userResponseCount || 0) + 1;
    }

    const fromState = `part${currentState.part}:${currentState.phase}:${currentState.questionIndex}`;

    // ── EXPLICIT transition — advance to next state ──
    const nextState = advanceIeltsState(currentState);
    // Carry forward quality tracking
    nextState.userWordCounts = currentState.userWordCounts;
    nextState.userResponses = currentState.userResponses;
    nextState.userResponseCount = currentState.userResponseCount;
    ieltsState = nextState;

    const toState = `part${nextState.part}:${nextState.phase}:${nextState.questionIndex}`;
    console.log(`[ielts] session=${sessionId} | ${fromState} → ${toState}`);

    // ── Generate AI response based on NEXT state ──
    if (nextState.phase === "complete") {
      aiContent = "Thank you. That is the end of the speaking test. Thank you for your time.";
    } else if (nextState.phase === "cue_card") {
      // Special: cue_card phase — examiner doesn't say anything new,
      // the UI shows the cue card. We send a brief instruction.
      const cueCard = IELTS_CUE_CARDS[nextState.cueCardIndex % IELTS_CUE_CARDS.length];
      aiContent = `Please look at your task card. Your topic is: "${cueCard.topic}". You have one minute to prepare. Remember to cover all the points on the card.`;
    } else if (nextState.phase === "long_turn") {
      // User is about to speak for 2 minutes — no examiner question
      aiContent = "Your preparation time is over. Please begin speaking now. You have up to two minutes.";
    } else {
      const systemPrompt = buildIeltsSystemPrompt(nextState);
      aiContent = await ai.generateResponse(systemPrompt, conversationHistory, { category: "exam" });
    }

    // ── Persist the new state to DB ──
    await scenarioRepository.updateSessionMeta(sessionId, nextState);
  } else {
    console.log(`[ai] session: ${sessionId} | category: ${session.category} | turns: ${conversationHistory.length}`);
    aiContent = await ai.generateResponse(
      session.system_prompt,
      conversationHistory,
      { category: session.category }
    );
  }

  // Save AI turn
  const aiTurn = await scenarioRepository.insertTurn(sessionId, nextIndex + 1, "assistant", aiContent);

  return {
    userTurn: {
      turnIndex: userTurn.turn_index,
      role: userTurn.role,
      content: userTurn.content,
      createdAt: userTurn.created_at,
    },
    aiTurn: {
      turnIndex: aiTurn.turn_index,
      role: aiTurn.role,
      content: aiTurn.content,
      createdAt: aiTurn.created_at,
    },
    ieltsState,
  };
}

// ---------------------------------------------------------------------------
// Placeholder detection — filter internal signals from scoring
// ---------------------------------------------------------------------------

const PLACEHOLDER_PATTERNS = [
  /^\[READY FOR PART [23]\]$/,
  /^\[PREP(ARATION)? (TIME )?COMPLETE/,
  /^\[Speaking completed\]$/,
  /^\[PREPARATION COMPLETE\]$/,
];

function isPlaceholderTurn(content) {
  return PLACEHOLDER_PATTERNS.some(p => p.test(content.trim()));
}

/**
 * Filter conversation history: remove placeholder turns that are internal
 * state-machine signals, not real candidate speech.
 */
function filterPlaceholders(turns) {
  return turns.filter(t => {
    if (t.role === "user" && isPlaceholderTurn(t.content)) return false;
    return true;
  });
}

// ---------------------------------------------------------------------------
// Hybrid scoring — strict IELTS-realistic
// ---------------------------------------------------------------------------

function computeHybridPenalties(turns) {
  // Only score real user turns (excluding placeholders)
  const userTurns = turns.filter(t => t.role === "user" && !isPlaceholderTurn(t.content));
  const totalWords = userTurns.reduce(
    (sum, t) => sum + t.content.trim().split(/\s+/).filter(Boolean).length, 0
  );
  const avgWords = userTurns.length > 0 ? totalWords / userTurns.length : 0;

  let penalty = 1.0;
  let floorScore = 0;

  if (avgWords < 3) {
    penalty = 0.35;
    floorScore = 0;
  } else if (avgWords < 6) {
    penalty = 0.55;
    floorScore = 0;
  } else if (avgWords < 10) {
    penalty = 0.75;
    floorScore = 20;
  } else if (avgWords < 20) {
    penalty = 0.90;
    floorScore = 30;
  }

  const copOuts = userTurns.filter(t => {
    const lower = t.content.toLowerCase();
    return lower.includes("i don't know") ||
           lower.includes("i have no idea") ||
           lower.includes("i can't answer") ||
           lower.includes("no comment") ||
           (lower.includes("pass") && t.content.trim().length < 10);
  });

  if (copOuts.length > userTurns.length * 0.5) {
    penalty = Math.min(penalty, 0.3);
  } else if (copOuts.length > 0) {
    penalty = Math.min(penalty, penalty * 0.7);
  }

  return { penalty, floorScore, avgWords, totalWords };
}

/**
 * Convert a 0-100 score to an IELTS band (1.0–9.0 in 0.5 increments).
 */
function toBandScore(score100) {
  // Map: 0→1, 20→3, 40→4.5, 60→6, 75→7, 85→7.5, 95→8.5, 100→9
  if (score100 >= 95) return 9.0;
  if (score100 >= 90) return 8.5;
  if (score100 >= 85) return 8.0;
  if (score100 >= 80) return 7.5;
  if (score100 >= 75) return 7.0;
  if (score100 >= 70) return 6.5;
  if (score100 >= 60) return 6.0;
  if (score100 >= 50) return 5.5;
  if (score100 >= 40) return 5.0;
  if (score100 >= 30) return 4.5;
  if (score100 >= 20) return 4.0;
  if (score100 >= 10) return 3.0;
  return 2.0;
}

async function endSession(sessionId, userId, durationMs) {
  const session = await scenarioRepository.findSessionById(sessionId);
  if (!session) {
    const err = new Error("Session not found");
    err.status = 404;
    throw err;
  }
  if (session.user_id !== userId) {
    const err = new Error("Not authorized to access this session");
    err.status = 403;
    throw err;
  }
  if (session.status !== "active") {
    const err = new Error("Session is no longer active");
    err.status = 400;
    throw err;
  }

  const turns = await scenarioRepository.findSessionTurns(sessionId);

  // Filter placeholder turns before scoring (keep in DB for audit trail)
  const filteredTurns = filterPlaceholders(turns);
  const conversationHistory = filteredTurns.map(t => ({ role: t.role, content: t.content }));

  // Log transition history for auditability
  const meta = await scenarioRepository.getSessionMeta(sessionId);
  if (meta?.transitionHistory) {
    console.log(`[ielts] Session ${sessionId} transition history:`);
    meta.transitionHistory.forEach(t => console.log(`  ${t}`));
  }

  const isIelts = session.category === "exam";
  console.log(`[ai] scoring session: ${sessionId} | turns: ${conversationHistory.length} (filtered from ${turns.length}) | isIelts: ${isIelts}`);

  const aiScores = await ai.scoreConversation(session.system_prompt, conversationHistory, { isIelts });
  const { penalty, floorScore, avgWords, totalWords } = computeHybridPenalties(turns);

  const adjustedFluency = Math.max(floorScore, Math.round(aiScores.fluency * penalty));
  const adjustedVocab = Math.max(floorScore, Math.round(aiScores.vocabulary * penalty));
  const adjustedGrammar = Math.max(floorScore, Math.round(aiScores.grammar * penalty));
  const adjustedPronunciation = Math.max(floorScore, Math.round((aiScores.pronunciation || aiScores.fluency) * penalty));
  const adjustedOverall = Math.round((adjustedFluency + adjustedVocab + adjustedGrammar + adjustedPronunciation) / 4);

  console.log(`[scoring] AI: ${aiScores.overallScore} | penalty: ${penalty} | avgWords: ${avgWords.toFixed(1)} | adjusted: ${adjustedOverall}`);

  let coachFeedback = aiScores.coachFeedback;
  if (adjustedOverall < 30) {
    coachFeedback = "You need to provide longer, more detailed answers. In IELTS Speaking, one-word or very short responses will significantly lower your score. Try to speak in full sentences and expand on your ideas.";
  } else if (adjustedOverall < 50) {
    coachFeedback = "Your answers need more development. Try to give reasons and examples when you answer. Aim for at least 2-3 sentences per response in Part 1, and much longer responses in Parts 2 and 3.";
  }

  // Extract real user turns (excluding placeholders)
  const realUserTurns = turns.filter(t => t.role === "user" && !isPlaceholderTurn(t.content));
  const turnCount = realUserTurns.length;
  const wordCount = totalWords;

  // Band score conversion for IELTS
  const bandScore = isIelts ? toBandScore(adjustedOverall) : null;

  // Notable vocabulary from AI scoring
  const notableVocabulary = aiScores.notableVocabulary || [];
  const improvementVocabulary = aiScores.improvementVocabulary || [];
  const criteriaFeedback = aiScores.criteriaFeedback || null;

  await scenarioRepository.completeSession(sessionId, {
    overallScore: adjustedOverall,
    fluencyScore: adjustedFluency,
    vocabularyScore: adjustedVocab,
    grammarScore: adjustedGrammar,
    coachFeedback,
    turnCount,
    wordCount,
    durationMs: durationMs || 0,
  });

  return {
    overallScore: adjustedOverall,
    fluency: adjustedFluency,
    vocabulary: adjustedVocab,
    grammar: adjustedGrammar,
    pronunciation: adjustedPronunciation,
    bandScore,
    criteriaFeedback,
    coachFeedback,
    turnFeedback: aiScores.turnFeedback,
    notableVocabulary,
    improvementVocabulary,
    turnCount,
    wordCount,
    durationMs: durationMs || 0,
  };
}

// ---------------------------------------------------------------------------
// Session queries
// ---------------------------------------------------------------------------

async function getSessionDetail(sessionId, userId) {
  const session = await scenarioRepository.findSessionById(sessionId);
  if (!session) {
    const err = new Error("Session not found");
    err.status = 404;
    throw err;
  }
  if (session.user_id !== userId) {
    const err = new Error("Not authorized to access this session");
    err.status = 403;
    throw err;
  }

  const turns = await scenarioRepository.findSessionTurns(sessionId);

  return {
    sessionId: session.id,
    scenarioId: session.scenario_id,
    title: session.title,
    emoji: session.emoji,
    category: session.category,
    status: session.status,
    overallScore: session.overall_score,
    fluencyScore: session.fluency_score,
    vocabularyScore: session.vocabulary_score,
    grammarScore: session.grammar_score,
    coachFeedback: session.feedback_summary,
    turnCount: session.total_turns,
    wordCount: session.total_user_words,
    durationMs: session.duration_ms,
    startedAt: session.started_at,
    completedAt: session.completed_at,
    turns: turns.map(t => ({
      turnIndex: t.turn_index,
      role: t.role,
      content: t.content,
      createdAt: t.created_at,
    })),
  };
}

async function getUserSessions(userId) {
  return scenarioRepository.findSessionsByUser(userId);
}

module.exports = {
  listScenarios,
  getScenario,
  startSession,
  submitTurn,
  endSession,
  getSessionDetail,
  getUserSessions,
};
