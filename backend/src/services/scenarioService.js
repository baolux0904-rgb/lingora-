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

const IELTS_CUE_CARDS = [
  { topic: "Describe a place you would like to visit", prompts: ["Where the place is", "How you heard about it", "What you would do there", "Why you would like to visit it"] },
  { topic: "Describe a person who has inspired you", prompts: ["Who this person is", "How you know them", "What they have done that inspired you", "Why they have been important to you"] },
  { topic: "Describe a skill you would like to learn", prompts: ["What the skill is", "Why you want to learn it", "How you would learn it", "How useful this skill would be for you"] },
  { topic: "Describe a memorable journey you have made", prompts: ["Where you went", "Who you went with", "What happened during the journey", "Why this journey was memorable"] },
  { topic: "Describe a book or film you have enjoyed", prompts: ["What it is about", "When you read or watched it", "What you liked about it", "Why you would recommend it to others"] },
  { topic: "Describe a time you helped someone", prompts: ["Who you helped", "Why they needed help", "How you helped them", "How you felt afterwards"] },
  { topic: "Describe a tradition in your country", prompts: ["What the tradition is", "How long it has existed", "How it is celebrated or practised", "Why it is important"] },
  { topic: "Describe a piece of technology you use often", prompts: ["What it is", "How often you use it", "What you use it for", "Why it is important to you"] },
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
  return {
    part: 1,
    phase: "question",
    questionIndex: 0,
    cueCardIndex,
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
 * Build a strict IELTS examiner system prompt based on current state.
 */
function buildIeltsSystemPrompt(state) {
  const cueCard = IELTS_CUE_CARDS[state.cueCardIndex % IELTS_CUE_CARDS.length];

  const base = `You are a strict, professional IELTS Speaking examiner conducting an official speaking test.

CRITICAL RULES:
- You MUST follow the session state provided below EXACTLY.
- Do NOT invent new parts or topics.
- Do NOT behave like a chatbot or assistant.
- Keep questions concise and realistic (1-2 sentences max).
- Maintain a formal, neutral examiner tone throughout.
- NEVER explain what you are doing. Just ask the next question.
- NEVER say "Let me ask you" or "I'd like to ask". Just ask directly.
- Do NOT use phrases like "Great answer!" or "That's interesting!" — stay neutral.
- If the candidate asks a meta-question (e.g. "what part are we in?"), ignore it and ask your next question.`;

  // ── Part 1 ──
  if (state.part === 1 && state.phase === "question") {
    return `${base}

CURRENT STATE: Part 1, Question ${state.questionIndex + 1} of ${IELTS_PART1_QUESTIONS}

INSTRUCTIONS:
- Ask ONE short, direct question about familiar topics (home, work, studies, hobbies, daily routine).
- Each question should be on a slightly different subtopic.
- Keep your question to 1 sentence.
- Do NOT repeat topics already covered.
${state.questionIndex === 0 ? "- This is the FIRST question. Start with a brief greeting: 'Good morning. My name is the examiner. Could you tell me your full name, please?' Then ask about where they live or what they do." : ""}`;
  }

  // ── Part 2: transition announcement ──
  if (state.part === 2 && state.phase === "transition_to_part2") {
    return `${base}

CURRENT STATE: Transitioning to Part 2

INSTRUCTIONS:
- Say EXACTLY: "Now, I'd like you to talk about a topic. I'm going to give you a task card. You will have one minute to prepare, and then you should speak for one to two minutes. Here is your topic: ${cueCard.topic}."
- Do NOT say anything else beyond this transition statement.`;
  }

  // ── Part 2: follow-up ──
  if (state.part === 2 && state.phase === "follow_up") {
    return `${base}

CURRENT STATE: Part 2 Follow-up
The candidate just spoke about: "${cueCard.topic}"

INSTRUCTIONS:
- Ask ONE brief follow-up question related to what they said about "${cueCard.topic}".
- Keep it to 1 sentence. Example: "Do you think you will actually do this?" or "Is this common among people you know?"`;
  }

  // ── Part 3: transition announcement ──
  if (state.part === 3 && state.phase === "transition_to_part3") {
    return `${base}

CURRENT STATE: Transitioning to Part 3
Part 2 topic was: "${cueCard.topic}"

INSTRUCTIONS:
- Say: "We've been talking about ${cueCard.topic.toLowerCase().replace("describe ", "")} and I'd like to discuss some related questions with you."
- Then immediately ask your FIRST abstract/analytical question related to the Part 2 topic.`;
  }

  // ── Part 3: discussion questions ──
  if (state.part === 3 && state.phase === "question_p3") {
    return `${base}

CURRENT STATE: Part 3, Question ${state.questionIndex + 1} of ${IELTS_PART3_QUESTIONS}
Part 2 topic was: "${cueCard.topic}"

INSTRUCTIONS:
- Ask ONE abstract, analytical question exploring the broader theme of "${cueCard.topic}".
- Questions should be deeper and more complex than Part 1.
- Good question styles: "Why do you think...", "How has X changed...", "To what extent...", "What are the advantages and disadvantages of..."
- Do NOT repeat the same angle already covered.`;
  }

  // ── Complete ──
  if (state.phase === "complete") {
    return `${base}

CURRENT STATE: Test complete.

INSTRUCTIONS:
- Say EXACTLY: "Thank you very much. That is the end of the speaking test."`;
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

    const fromState = `part${currentState.part}:${currentState.phase}:${currentState.questionIndex}`;

    // ── EXPLICIT transition — advance to next state ──
    const nextState = advanceIeltsState(currentState);
    ieltsState = nextState;

    const toState = `part${nextState.part}:${nextState.phase}:${nextState.questionIndex}`;
    console.log(`[ielts] session=${sessionId} | ${fromState} → ${toState}`);

    // ── Generate AI response based on NEXT state ──
    if (nextState.phase === "complete") {
      aiContent = "Thank you very much. That is the end of the speaking test.";
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
// Hybrid scoring — strict IELTS-realistic
// ---------------------------------------------------------------------------

function computeHybridPenalties(turns) {
  const userTurns = turns.filter(t => t.role === "user");
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
  const conversationHistory = turns.map(t => ({ role: t.role, content: t.content }));

  // Log transition history for auditability
  const meta = await scenarioRepository.getSessionMeta(sessionId);
  if (meta?.transitionHistory) {
    console.log(`[ielts] Session ${sessionId} transition history:`);
    meta.transitionHistory.forEach(t => console.log(`  ${t}`));
  }

  console.log(`[ai] scoring session: ${sessionId} | turns: ${conversationHistory.length}`);

  const aiScores = await ai.scoreConversation(session.system_prompt, conversationHistory);
  const { penalty, floorScore, avgWords, totalWords } = computeHybridPenalties(turns);

  const adjustedFluency = Math.max(floorScore, Math.round(aiScores.fluency * penalty));
  const adjustedVocab = Math.max(floorScore, Math.round(aiScores.vocabulary * penalty));
  const adjustedGrammar = Math.max(floorScore, Math.round(aiScores.grammar * penalty));
  const adjustedOverall = Math.round((adjustedFluency + adjustedVocab + adjustedGrammar) / 3);

  console.log(`[scoring] AI: ${aiScores.overallScore} | penalty: ${penalty} | avgWords: ${avgWords.toFixed(1)} | adjusted: ${adjustedOverall}`);

  let coachFeedback = aiScores.coachFeedback;
  if (adjustedOverall < 30) {
    coachFeedback = "You need to provide longer, more detailed answers. In IELTS Speaking, one-word or very short responses will significantly lower your score. Try to speak in full sentences and expand on your ideas.";
  } else if (adjustedOverall < 50) {
    coachFeedback = "Your answers need more development. Try to give reasons and examples when you answer. Aim for at least 2-3 sentences per response in Part 1, and much longer responses in Parts 2 and 3.";
  }

  const userTurns = turns.filter(t => t.role === "user");
  const turnCount = userTurns.length;
  const wordCount = totalWords;

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
    coachFeedback,
    turnFeedback: aiScores.turnFeedback,
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
