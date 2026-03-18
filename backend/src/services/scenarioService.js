/**
 * scenarioService.js
 *
 * Orchestrates the scenario speaking practice flow:
 *   1. List / get scenario definitions
 *   2. Start a conversation session (AI opening turn)
 *   3. Accept user turns, generate AI responses
 *   4. End session with scoring and feedback
 *
 * IELTS sessions use a deterministic state machine — the backend controls
 * part transitions, NOT the AI. The AI receives explicit instructions about
 * which part/phase it is in and what question to ask next.
 */

const { createAiProvider } = require("../providers/ai/aiProvider");
const scenarioRepository = require("../repositories/scenarioRepository");

const ai = createAiProvider();

// ---------------------------------------------------------------------------
// IELTS State Machine Constants
// ---------------------------------------------------------------------------

const IELTS_PART1_QUESTIONS = 5; // 4-6 questions, we use 5
const IELTS_PART3_QUESTIONS = 5;

// Cue cards — backend owns these, not frontend
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

/**
 * Build a strict IELTS examiner system prompt that includes the current
 * session state. The AI CANNOT deviate — it must follow the state.
 */
function buildIeltsSystemPrompt(state) {
  const base = `You are a strict, professional IELTS Speaking examiner conducting an official speaking test.

CRITICAL RULES:
- You MUST follow the session state provided below EXACTLY.
- Do NOT invent new parts or topics.
- Do NOT behave like a chatbot or assistant.
- Keep questions concise and realistic (1-2 sentences max).
- Maintain a formal, neutral examiner tone throughout.
- NEVER explain what you are doing. Just ask the next question.
- NEVER say "Let me ask you" or "I'd like to ask". Just ask directly.
- Do NOT use phrases like "Great answer!" or "That's interesting!" — stay neutral.`;

  if (state.part === 1) {
    return `${base}

CURRENT STATE:
- Part: 1 (Introduction & Interview)
- Question: ${state.questionIndex + 1} of ${IELTS_PART1_QUESTIONS}
- Phase: ${state.phase}

INSTRUCTIONS FOR PART 1:
- Ask ONE short, direct question about familiar topics (home, work, studies, hobbies, daily routine).
- Each question should be on a slightly different subtopic.
- Keep your question to 1 sentence.
- Do NOT repeat topics already covered in the conversation.
${state.questionIndex === 0 ? "- This is the FIRST question. Start with a brief greeting: 'Good morning/afternoon. My name is [examiner name]. Can I have your full name please?' Then ask about where they live or what they do." : ""}`;
  }

  if (state.part === 2) {
    return `${base}

CURRENT STATE:
- Part: 2 (Individual Long Turn)
- Phase: ${state.phase}
- Cue card topic: "${state.cueCard?.topic}"

INSTRUCTIONS FOR PART 2:
${state.phase === "transition" ? `- Say EXACTLY: "Now, I'd like you to talk about a topic. Here is your task card. You have one minute to prepare, and then you should speak for one to two minutes."
- Do NOT say anything else. Just this transition statement.` : ""}
${state.phase === "follow_up" ? `- The candidate has finished speaking about: "${state.cueCard?.topic}"
- Ask ONE brief follow-up question related to their topic. Keep it to 1 sentence.
- Example: "Do you think you will actually do this in the future?" or "Is this something your friends also enjoy?"` : ""}`;
  }

  if (state.part === 3) {
    return `${base}

CURRENT STATE:
- Part: 3 (Two-Way Discussion)
- Question: ${state.questionIndex + 1} of ${IELTS_PART3_QUESTIONS}
- Phase: ${state.phase}
- Part 2 topic was: "${state.cueCard?.topic}"

INSTRUCTIONS FOR PART 3:
${state.questionIndex === 0 ? `- Say EXACTLY: "We've been talking about ${state.cueCard?.topic.toLowerCase().replace("describe ", "")} and I'd like to discuss some related questions."
- Then ask your FIRST abstract/analytical question related to the Part 2 topic.` : ""}
${state.questionIndex > 0 ? `- Ask ONE abstract, analytical question that explores the broader theme of "${state.cueCard?.topic}".
- Questions should be deeper and more complex than Part 1.
- Examples of good Part 3 question styles: "Why do you think...", "How has X changed...", "To what extent do you agree...", "What are the advantages and disadvantages of..."
- Do NOT repeat the same question angle already covered in the conversation.` : ""}`;
  }

  return base;
}

/**
 * Compute the IELTS session state from existing turns.
 * This is deterministic — same turns always produce same state.
 */
function computeIeltsState(turns, cueCardIndex) {
  const userTurnCount = turns.filter(t => t.role === "user").length;
  const cueCard = IELTS_CUE_CARDS[cueCardIndex % IELTS_CUE_CARDS.length];

  // Part 1: first IELTS_PART1_QUESTIONS user turns
  if (userTurnCount < IELTS_PART1_QUESTIONS) {
    return {
      part: 1,
      phase: "question",
      questionIndex: userTurnCount,
      totalQuestions: IELTS_PART1_QUESTIONS,
      cueCard,
    };
  }

  // Transition to Part 2
  if (userTurnCount === IELTS_PART1_QUESTIONS) {
    return {
      part: 2,
      phase: "transition",
      questionIndex: 0,
      totalQuestions: 1,
      cueCard,
    };
  }

  // Part 2 follow-up (after candidate's long turn)
  if (userTurnCount === IELTS_PART1_QUESTIONS + 1) {
    return {
      part: 2,
      phase: "follow_up",
      questionIndex: 0,
      totalQuestions: 1,
      cueCard,
    };
  }

  // Part 3: remaining turns
  const part3Index = userTurnCount - (IELTS_PART1_QUESTIONS + 2);
  if (part3Index < IELTS_PART3_QUESTIONS) {
    return {
      part: 3,
      phase: "question",
      questionIndex: part3Index,
      totalQuestions: IELTS_PART3_QUESTIONS,
      cueCard,
    };
  }

  // Test complete
  return {
    part: 3,
    phase: "complete",
    questionIndex: IELTS_PART3_QUESTIONS,
    totalQuestions: IELTS_PART3_QUESTIONS,
    cueCard,
  };
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

/**
 * Start a new conversation session.
 * For IELTS: picks a random cue card index, stores in session metadata.
 */
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
    // Pick random cue card — store index in session for deterministic state
    const cueCardIndex = Math.floor(Math.random() * IELTS_CUE_CARDS.length);
    const state = computeIeltsState([], cueCardIndex);

    // Generate the examiner's opening via AI with strict prompt
    const systemPrompt = buildIeltsSystemPrompt(state);
    openingContent = await ai.generateResponse(systemPrompt, [], { category: "exam" });

    // Store cue card index + state alongside the session
    await scenarioRepository.updateSessionMeta(session.id, {
      cueCardIndex,
      ieltsState: state,
    });
  } else {
    openingContent = scenario.opening_message;
  }

  const openingTurn = await scenarioRepository.insertTurn(
    session.id, 0, "assistant", openingContent
  );

  const cueCardIndex = isIelts
    ? (await scenarioRepository.getSessionMeta(session.id))?.cueCardIndex ?? 0
    : 0;
  const cueCard = isIelts
    ? IELTS_CUE_CARDS[cueCardIndex % IELTS_CUE_CARDS.length]
    : null;

  return {
    sessionId: session.id,
    title: session.title,
    emoji: session.emoji,
    category: session.category,
    cueCard: isIelts ? cueCard : undefined,
    turns: [{
      turnIndex: openingTurn.turn_index,
      role: openingTurn.role,
      content: openingTurn.content,
      createdAt: openingTurn.created_at,
    }],
  };
}

/**
 * Submit a user turn and get an AI response.
 * For IELTS: uses deterministic state machine to control the examiner.
 */
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

  // Build conversation history
  const conversationHistory = existingTurns.map(t => ({ role: t.role, content: t.content }));
  conversationHistory.push({ role: "user", content });

  const isIelts = session.category === "exam";
  let aiContent;
  let ieltsState = null;

  if (isIelts) {
    // Get stored cue card index
    const meta = await scenarioRepository.getSessionMeta(sessionId);
    const cueCardIndex = meta?.cueCardIndex ?? 0;

    // Compute state AFTER this user turn
    const userTurnCount = conversationHistory.filter(t => t.role === "user").length;
    ieltsState = computeIeltsState(
      conversationHistory.filter(t => t.role === "user"),
      cueCardIndex
    );

    console.log(`[ielts] session=${sessionId} part=${ieltsState.part} phase=${ieltsState.phase} qIdx=${ieltsState.questionIndex} userTurns=${userTurnCount}`);

    // Check if test is complete
    if (ieltsState.phase === "complete") {
      // Generate closing statement
      aiContent = "Thank you very much. That is the end of the speaking test.";
    } else {
      const systemPrompt = buildIeltsSystemPrompt(ieltsState);
      console.log(`[ai] session: ${sessionId} | category: exam | ielts part: ${ieltsState.part} | phase: ${ieltsState.phase}`);
      aiContent = await ai.generateResponse(systemPrompt, conversationHistory, { category: "exam" });
    }

    // Update stored state
    await scenarioRepository.updateSessionMeta(sessionId, {
      cueCardIndex,
      ieltsState,
    });
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

/**
 * Pre-score based on objective metrics before AI scoring.
 * Returns penalty multiplier and floor scores.
 */
function computeHybridPenalties(turns) {
  const userTurns = turns.filter(t => t.role === "user");
  const totalWords = userTurns.reduce(
    (sum, t) => sum + t.content.trim().split(/\s+/).filter(Boolean).length, 0
  );
  const avgWords = userTurns.length > 0 ? totalWords / userTurns.length : 0;

  let penalty = 1.0;
  let floorScore = 0;

  // Very short answers → heavy penalty
  if (avgWords < 3) {
    penalty = 0.35; // scores capped around 20-35
    floorScore = 0;
  } else if (avgWords < 6) {
    penalty = 0.55; // scores capped around 30-50
    floorScore = 0;
  } else if (avgWords < 10) {
    penalty = 0.75; // mild penalty
    floorScore = 20;
  } else if (avgWords < 20) {
    penalty = 0.90;
    floorScore = 30;
  }

  // Check for cop-out answers
  const copOuts = userTurns.filter(t => {
    const lower = t.content.toLowerCase();
    return lower.includes("i don't know") ||
           lower.includes("i have no idea") ||
           lower.includes("i can't answer") ||
           lower.includes("no comment") ||
           lower.includes("pass") && t.content.trim().length < 10;
  });

  if (copOuts.length > userTurns.length * 0.5) {
    penalty = Math.min(penalty, 0.3);
  } else if (copOuts.length > 0) {
    penalty = Math.min(penalty, penalty * 0.7);
  }

  return { penalty, floorScore, avgWords, totalWords };
}

/**
 * End a session: hybrid score (objective + AI) and persist results.
 */
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

  console.log(`[ai] scoring session: ${sessionId} | turns: ${conversationHistory.length}`);

  // Step 1: AI scoring
  const aiScores = await ai.scoreConversation(
    session.system_prompt,
    conversationHistory
  );

  // Step 2: Hybrid penalties
  const { penalty, floorScore, avgWords, totalWords } = computeHybridPenalties(turns);

  // Step 3: Apply penalties to AI scores
  const adjustedFluency = Math.max(floorScore, Math.round(aiScores.fluency * penalty));
  const adjustedVocab = Math.max(floorScore, Math.round(aiScores.vocabulary * penalty));
  const adjustedGrammar = Math.max(floorScore, Math.round(aiScores.grammar * penalty));
  const adjustedOverall = Math.round((adjustedFluency + adjustedVocab + adjustedGrammar) / 3);

  console.log(`[scoring] AI: ${aiScores.overallScore} | penalty: ${penalty} | avgWords: ${avgWords.toFixed(1)} | adjusted: ${adjustedOverall}`);

  // Adjust coach feedback if scores are very low
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
