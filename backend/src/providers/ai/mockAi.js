/**
 * mockAi.js
 *
 * Deterministic mock AI conversation provider for development.
 * Generates realistic-looking scenario responses based on category and turn count.
 * No external APIs called — fully offline.
 */

// ---------------------------------------------------------------------------
// Response pools per category
// ---------------------------------------------------------------------------
const RESPONSE_POOLS = {
  daily: [
    "That sounds like a great morning routine! Do you usually have coffee or tea first thing?",
    "I see! What time do you normally wake up on weekdays?",
    "That's interesting. Do you prefer to exercise in the morning or evening?",
    "Nice! How long does it usually take you to get ready?",
    "I understand. Do you have any special weekend routines?",
    "That makes sense. What's your favourite part of the day?",
    "Cool! Do you usually eat breakfast at home or on the way to work?",
    "Really? That sounds like a productive way to start the day!",
  ],
  travel: [
    "Welcome! Do you have your passport and boarding pass ready?",
    "Your flight departs from Gate B12. Would you like directions?",
    "I can help with that. How many bags would you like to check in?",
    "The departure lounge is just through security on your left.",
    "Of course! The exchange bureau is on the ground floor near exit C.",
    "Your hotel is about 20 minutes from the airport by taxi.",
    "I'd recommend taking the express train — it's faster and cheaper.",
    "Here's a map of the area. The main attractions are within walking distance.",
  ],
  work: [
    "Thanks for coming in today. Could you start by telling me about yourself?",
    "That's impressive experience. What attracted you to this role specifically?",
    "Great answer. How do you typically handle tight deadlines?",
    "I see. Can you give me an example of a challenging project you completed?",
    "Interesting. How would your previous colleagues describe your work style?",
    "Good to know. Do you have any questions about the team or the company?",
    "We value collaboration here. How do you prefer to work with others?",
    "Thank you for sharing that. What are your long-term career goals?",
  ],
  food: [
    "Welcome! Here's our menu. Would you like to start with a drink?",
    "Great choice! We have a special today — the grilled salmon. Interested?",
    "Sure! Would you prefer your steak medium-rare, medium, or well-done?",
    "Absolutely. Would you like any sides with that?",
    "Of course! We have gluten-free and vegetarian options available.",
    "Your food should be ready in about 15 minutes. Can I get you anything else?",
    "How is everything? Is the food to your liking?",
    "Would you like to see our dessert menu?",
  ],
  social: [
    "Hi there! I don't think we've met before. I'm Alex!",
    "Nice to meet you! So, what do you do for fun?",
    "That sounds really cool! How did you get into that?",
    "I totally agree. Have you been to any good events recently?",
    "Oh, I've heard about that! We should go together sometime.",
    "That would be awesome! Are you free this weekend?",
    "Perfect! Let's exchange numbers and figure out the details.",
    "It was great chatting with you! Looking forward to this weekend!",
  ],
  academic: [
    "Hello, what brings you in today? How have you been feeling?",
    "I see. How long have you been experiencing those symptoms?",
    "That's helpful to know. Are you currently taking any medications?",
    "Let me check that for you. Do you have any allergies I should know about?",
    "I'd like to run a quick examination. Is that okay with you?",
    "Everything looks normal. I'll prescribe something to help with that.",
    "Take this twice a day after meals. Come back if symptoms persist.",
    "Do you have any other questions or concerns I can help with?",
  ],
};

// Fallback for unknown categories
const DEFAULT_RESPONSES = [
  "That's interesting! Could you tell me more about that?",
  "I see. What would you like to do next?",
  "Great! Is there anything else you'd like to discuss?",
  "Thank you for sharing. How does that make you feel?",
  "I understand. Let's continue — what happens next?",
  "Good point! Can you elaborate a bit more?",
  "Absolutely. What else is on your mind?",
  "That makes sense. Shall we move on to the next topic?",
];

// ---------------------------------------------------------------------------
// Coach feedback pools
// ---------------------------------------------------------------------------
const COACH_FEEDBACK = [
  "Good effort! Try using more connecting words like 'however', 'therefore', and 'meanwhile' to make your speech flow more naturally.",
  "Nice work! Focus on expanding your vocabulary by using synonyms instead of repeating the same words.",
  "Well done! Next time, try forming longer sentences to demonstrate more complex grammar structures.",
  "Great conversation! Pay attention to verb tenses — mixing past and present tense can be confusing.",
  "Solid performance! Try to ask more follow-up questions to keep the conversation going naturally.",
];

const TURN_TIPS = [
  "Try using a complete sentence here instead of a short phrase.",
  "Good use of vocabulary! Consider adding an adjective for more detail.",
  "Watch your verb tense — this should be in the present tense.",
  "Nice response! You could make it more natural by adding a follow-up question.",
  "Consider using a transition word to connect your ideas.",
  "Good effort! Try rephrasing this using a more formal register.",
  "Well structured! Adding an example would strengthen your response.",
  "Try to vary your sentence structure for a more natural flow.",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Deterministic hash from a string -> number in [0, 1).
 * @param {string} str
 * @param {number} seed
 * @returns {number}
 */
function hash(str, seed = 0) {
  let h = seed;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h % 1000) / 1000;
}

/**
 * Clamp a value between min and max.
 */
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a conversational response for a scenario turn.
 *
 * @param {string} systemPrompt       – the scenario's system prompt
 * @param {Array}  conversationHistory – array of { role, content }
 * @param {object} [options]
 * @param {string} [options.category]  – scenario category for pool selection
 * @returns {Promise<string>}
 */
async function generateResponse(systemPrompt, conversationHistory, options = {}) {
  // Simulate 300-700ms latency
  const latency = 300 + Math.round(hash(systemPrompt, conversationHistory.length) * 400);
  await new Promise((resolve) => setTimeout(resolve, latency));

  const category = options.category || "daily";
  const pool = RESPONSE_POOLS[category] || DEFAULT_RESPONSES;

  // Pick deterministically based on turn count + hash of last message
  const lastMessage = conversationHistory.length > 0
    ? conversationHistory[conversationHistory.length - 1].content
    : "";
  const turnCount = conversationHistory.filter((t) => t.role === "user").length;
  const idx = Math.floor((turnCount + hash(lastMessage, 42) * pool.length) % pool.length);

  return pool[idx];
}

/**
 * Score a completed conversation.
 *
 * @param {string} systemPrompt       – the scenario's system prompt
 * @param {Array}  conversationHistory – array of { role, content }
 * @returns {Promise<object>} { overallScore, fluency, vocabulary, grammar, coachFeedback, turnFeedback }
 */
async function scoreConversation(systemPrompt, conversationHistory) {
  // Simulate 500-900ms latency
  const latency = 500 + Math.round(hash(systemPrompt, 99) * 400);
  await new Promise((resolve) => setTimeout(resolve, latency));

  // Compute base score from average word count per user turn
  const userTurns = conversationHistory.filter((t) => t.role === "user");
  const totalWords = userTurns.reduce(
    (sum, t) => sum + t.content.trim().split(/\s+/).filter(Boolean).length,
    0
  );
  const avgWords = userTurns.length > 0 ? totalWords / userTurns.length : 0;

  // Map avg words to a base score: 1-3 words → 30-50, 4-8 → 50-70, 9+ → 70-90
  let baseScore;
  if (avgWords <= 3) {
    baseScore = 30 + (avgWords / 3) * 20;
  } else if (avgWords <= 8) {
    baseScore = 50 + ((avgWords - 3) / 5) * 20;
  } else {
    baseScore = 70 + Math.min((avgWords - 8) / 7, 1) * 20;
  }

  baseScore = Math.round(clamp(baseScore, 20, 95));

  // Derive sub-scores with deterministic variation
  const fluency = clamp(Math.round(baseScore + hash(systemPrompt, 1) * 16 - 8), 0, 100);
  const vocabulary = clamp(Math.round(baseScore + hash(systemPrompt, 2) * 14 - 7), 0, 100);
  const grammar = clamp(Math.round(baseScore + hash(systemPrompt, 3) * 12 - 6), 0, 100);
  const overallScore = Math.round((fluency + vocabulary + grammar) / 3);

  // Pick coach feedback deterministically
  const feedbackIdx = Math.floor(hash(systemPrompt, 4) * COACH_FEEDBACK.length);
  const coachFeedback = COACH_FEEDBACK[feedbackIdx];

  // Generate 2-3 per-turn tips for user turns
  const tipCount = userTurns.length >= 3 ? 3 : Math.max(userTurns.length, 1);
  const turnFeedback = [];
  for (let i = 0; i < tipCount && i < userTurns.length; i++) {
    const tipIdx = Math.floor(hash(userTurns[i].content, i + 10) * TURN_TIPS.length);
    // Find the original turn index in the full conversation
    let originalIndex = 0;
    let userCount = 0;
    for (let j = 0; j < conversationHistory.length; j++) {
      if (conversationHistory[j].role === "user") {
        if (userCount === i) {
          originalIndex = j;
          break;
        }
        userCount++;
      }
    }
    turnFeedback.push({ turnIndex: originalIndex, tip: TURN_TIPS[tipIdx] });
  }

  return {
    overallScore,
    fluency,
    vocabulary,
    grammar,
    coachFeedback,
    turnFeedback,
  };
}

module.exports = { generateResponse, scoreConversation };
