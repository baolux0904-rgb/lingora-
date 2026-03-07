-- =============================================================
-- Lingora · seed_current.sql
--
-- Compatible with the RUNNING backend schema only.
-- Schema source of truth: lessonRepository.js (provided verbatim).
--
-- Tables written:
--   lessons          (id, title, description, level, order_index)
--   vocab_items      (id, lesson_id, word, meaning, example_sentence, pronunciation)
--   quiz_items       (id, lesson_id, question, option_a-d, correct_option)
--   speaking_prompts (id, lesson_id, prompt_text, sample_answer, hint)
--
-- Tables NOT touched:
--   courses, units, users, user_progress — not referenced in the
--   running lessonRepository.js, so we leave them alone entirely.
--
-- Safety:
--   · All PKs are pinned UUIDs  → seed is deterministic.
--   · ON CONFLICT (id) DO NOTHING  → re-running never duplicates rows.
--   · Single transaction  → partial failure leaves the DB unchanged.
--   · Zero DROP / ALTER / CREATE statements.
-- =============================================================

BEGIN;

-- =============================================================
-- LESSONS
-- =============================================================

INSERT INTO lessons (id, title, description, level, order_index)
VALUES
  (
    'aaaaaaaa-0001-4000-8000-000000000001',
    'Greetings',
    'Learn how to say hello, goodbye, and ask how someone is doing in everyday English.',
    'beginner',
    1
  ),
  (
    'aaaaaaaa-0001-4000-8000-000000000002',
    'Introducing Yourself',
    'Practice saying your name, where you are from, your age, and what you enjoy.',
    'beginner',
    2
  ),
  (
    'aaaaaaaa-0001-4000-8000-000000000003',
    'Daily Conversation',
    'Build confidence with common phrases used in everyday situations at school and home.',
    'beginner',
    3
  ),
  (
    'aaaaaaaa-0001-4000-8000-000000000004',
    'At the Restaurant',
    'Learn how to order food, ask for the menu, and request the bill politely.',
    'intermediate',
    4
  ),
  (
    'aaaaaaaa-0001-4000-8000-000000000005',
    'Shopping Basics',
    'Discover vocabulary and phrases for asking prices, choosing items, and paying in a shop.',
    'intermediate',
    5
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- VOCAB ITEMS
-- Columns: id, lesson_id, word, meaning, example_sentence, pronunciation
-- =============================================================

-- ── Lesson 1 · Greetings ─────────────────────────────────────
INSERT INTO vocab_items (id, lesson_id, word, meaning, example_sentence, pronunciation)
VALUES
  (
    'bbbbbbbb-0001-4000-8000-000000000001',
    'aaaaaaaa-0001-4000-8000-000000000001',
    'Hello',
    'A common greeting used when meeting someone.',
    'Hello! How are you today?',
    '/həˈloʊ/'
  ),
  (
    'bbbbbbbb-0001-4000-8000-000000000002',
    'aaaaaaaa-0001-4000-8000-000000000001',
    'Goodbye',
    'A word said when leaving or ending a conversation.',
    'Goodbye! See you tomorrow.',
    '/ˌɡʊdˈbaɪ/'
  ),
  (
    'bbbbbbbb-0001-4000-8000-000000000003',
    'aaaaaaaa-0001-4000-8000-000000000001',
    'Good morning',
    'A greeting used in the morning, before noon.',
    'Good morning, class! Are you ready to learn?',
    '/ɡʊd ˈmɔːrnɪŋ/'
  ),
  (
    'bbbbbbbb-0001-4000-8000-000000000004',
    'aaaaaaaa-0001-4000-8000-000000000001',
    'Good evening',
    'A greeting used later in the day, after sunset.',
    'Good evening! Welcome to our show.',
    '/ɡʊd ˈiːvnɪŋ/'
  ),
  (
    'bbbbbbbb-0001-4000-8000-000000000005',
    'aaaaaaaa-0001-4000-8000-000000000001',
    'How are you?',
    'A polite question asking about someone''s wellbeing.',
    'Hi! How are you? I am doing well, thanks.',
    '/haʊ ɑːr juː/'
  )
ON CONFLICT (id) DO NOTHING;

-- ── Lesson 2 · Introducing Yourself ──────────────────────────
INSERT INTO vocab_items (id, lesson_id, word, meaning, example_sentence, pronunciation)
VALUES
  (
    'bbbbbbbb-0002-4000-8000-000000000001',
    'aaaaaaaa-0001-4000-8000-000000000002',
    'My name is',
    'A phrase used to tell someone what you are called.',
    'My name is Linh. What is your name?',
    '/maɪ neɪm ɪz/'
  ),
  (
    'bbbbbbbb-0002-4000-8000-000000000002',
    'aaaaaaaa-0001-4000-8000-000000000002',
    'I am from',
    'A phrase used to say which country or city you come from.',
    'I am from Vietnam. Where are you from?',
    '/aɪ æm frɒm/'
  ),
  (
    'bbbbbbbb-0002-4000-8000-000000000003',
    'aaaaaaaa-0001-4000-8000-000000000002',
    'I am ... years old',
    'A phrase used to state your age.',
    'I am nine years old.',
    '/aɪ æm ... jɪərz oʊld/'
  ),
  (
    'bbbbbbbb-0002-4000-8000-000000000004',
    'aaaaaaaa-0001-4000-8000-000000000002',
    'Nice to meet you',
    'A polite phrase said when meeting someone for the first time.',
    'Nice to meet you, Anna! I hope we can be friends.',
    '/naɪs tə miːt juː/'
  ),
  (
    'bbbbbbbb-0002-4000-8000-000000000005',
    'aaaaaaaa-0001-4000-8000-000000000002',
    'I like',
    'A phrase used to express what you enjoy.',
    'I like reading books and playing football.',
    '/aɪ laɪk/'
  )
ON CONFLICT (id) DO NOTHING;

-- ── Lesson 3 · Daily Conversation ────────────────────────────
INSERT INTO vocab_items (id, lesson_id, word, meaning, example_sentence, pronunciation)
VALUES
  (
    'bbbbbbbb-0003-4000-8000-000000000001',
    'aaaaaaaa-0001-4000-8000-000000000003',
    'Please',
    'A word added to make a request polite.',
    'Can you help me, please?',
    '/pliːz/'
  ),
  (
    'bbbbbbbb-0003-4000-8000-000000000002',
    'aaaaaaaa-0001-4000-8000-000000000003',
    'Thank you',
    'An expression of gratitude.',
    'Thank you for helping me with my homework.',
    '/θæŋk juː/'
  ),
  (
    'bbbbbbbb-0003-4000-8000-000000000003',
    'aaaaaaaa-0001-4000-8000-000000000003',
    'Sorry',
    'A word used to apologise or express regret.',
    'Sorry, I did not hear you. Can you repeat that?',
    '/ˈsɒri/'
  ),
  (
    'bbbbbbbb-0003-4000-8000-000000000004',
    'aaaaaaaa-0001-4000-8000-000000000003',
    'Excuse me',
    'A phrase used to get attention or to apologise for a small interruption.',
    'Excuse me, where is the library?',
    '/ɪkˈskjuːz miː/'
  ),
  (
    'bbbbbbbb-0003-4000-8000-000000000005',
    'aaaaaaaa-0001-4000-8000-000000000003',
    'You are welcome',
    'A polite reply when someone thanks you.',
    'You are welcome! It was no trouble at all.',
    '/juː ɑːr ˈwelkəm/'
  )
ON CONFLICT (id) DO NOTHING;

-- ── Lesson 4 · At the Restaurant ─────────────────────────────
INSERT INTO vocab_items (id, lesson_id, word, meaning, example_sentence, pronunciation)
VALUES
  (
    'bbbbbbbb-0004-4000-8000-000000000001',
    'aaaaaaaa-0001-4000-8000-000000000004',
    'Menu',
    'A list of food and drinks available in a restaurant.',
    'Could I see the menu, please?',
    '/ˈmenjuː/'
  ),
  (
    'bbbbbbbb-0004-4000-8000-000000000002',
    'aaaaaaaa-0001-4000-8000-000000000004',
    'I would like',
    'A polite phrase for ordering or requesting something.',
    'I would like a bowl of noodle soup, please.',
    '/aɪ wʊd laɪk/'
  ),
  (
    'bbbbbbbb-0004-4000-8000-000000000003',
    'aaaaaaaa-0001-4000-8000-000000000004',
    'The bill',
    'The document showing the total cost of your meal.',
    'Excuse me, could we have the bill, please?',
    '/ðə bɪl/'
  ),
  (
    'bbbbbbbb-0004-4000-8000-000000000004',
    'aaaaaaaa-0001-4000-8000-000000000004',
    'Delicious',
    'Tasting extremely good.',
    'This fried rice is absolutely delicious!',
    '/dɪˈlɪʃəs/'
  ),
  (
    'bbbbbbbb-0004-4000-8000-000000000005',
    'aaaaaaaa-0001-4000-8000-000000000004',
    'A table for two',
    'A request for seating for two people.',
    'Hello, a table for two, please.',
    '/ə ˈteɪbəl fɔːr tuː/'
  )
ON CONFLICT (id) DO NOTHING;

-- ── Lesson 5 · Shopping Basics ────────────────────────────────
INSERT INTO vocab_items (id, lesson_id, word, meaning, example_sentence, pronunciation)
VALUES
  (
    'bbbbbbbb-0005-4000-8000-000000000001',
    'aaaaaaaa-0001-4000-8000-000000000005',
    'How much is this?',
    'A question used to ask the price of something.',
    'Excuse me, how much is this T-shirt?',
    '/haʊ mʌtʃ ɪz ðɪs/'
  ),
  (
    'bbbbbbbb-0005-4000-8000-000000000002',
    'aaaaaaaa-0001-4000-8000-000000000005',
    'I will take it',
    'A phrase used to say you want to buy the item.',
    'That sounds fair. I will take it, thank you.',
    '/aɪ wɪl teɪk ɪt/'
  ),
  (
    'bbbbbbbb-0005-4000-8000-000000000003',
    'aaaaaaaa-0001-4000-8000-000000000005',
    'Too expensive',
    'More money than you want to pay.',
    'Oh, that is too expensive. Do you have a cheaper one?',
    '/tuː ɪkˈspensɪv/'
  ),
  (
    'bbbbbbbb-0005-4000-8000-000000000004',
    'aaaaaaaa-0001-4000-8000-000000000005',
    'Do you have',
    'A question asking if something is available.',
    'Do you have this in a bigger size?',
    '/duː juː hæv/'
  ),
  (
    'bbbbbbbb-0005-4000-8000-000000000005',
    'aaaaaaaa-0001-4000-8000-000000000005',
    'Change',
    'Money returned when you pay more than the price.',
    'Here is your change — fifty pence.',
    '/tʃeɪndʒ/'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- QUIZ ITEMS
-- Columns: id, lesson_id, question, option_a, option_b,
--          option_c, option_d, correct_option
-- Note: correct_option is a VARCHAR storing 'a', 'b', 'c', or 'd'.
-- =============================================================

-- ── Lesson 1 · Greetings ─────────────────────────────────────
INSERT INTO quiz_items (id, lesson_id, question, option_a, option_b, option_c, option_d, correct_option)
VALUES
  (
    'cccccccc-0001-4000-8000-000000000001',
    'aaaaaaaa-0001-4000-8000-000000000001',
    'Which phrase do you use when you meet someone in the morning?',
    'Good night',
    'Good morning',
    'Goodbye',
    'See you later',
    'b'
  ),
  (
    'cccccccc-0001-4000-8000-000000000002',
    'aaaaaaaa-0001-4000-8000-000000000001',
    'What is the correct response to "How are you?"',
    'My name is Linh.',
    'I am from Vietnam.',
    'I am fine, thank you.',
    'Nice to meet you.',
    'c'
  ),
  (
    'cccccccc-0001-4000-8000-000000000003',
    'aaaaaaaa-0001-4000-8000-000000000001',
    'Which word has the same meaning as "Hello"?',
    'Goodbye',
    'Sorry',
    'Please',
    'Hi',
    'd'
  )
ON CONFLICT (id) DO NOTHING;

-- ── Lesson 2 · Introducing Yourself ──────────────────────────
INSERT INTO quiz_items (id, lesson_id, question, option_a, option_b, option_c, option_d, correct_option)
VALUES
  (
    'cccccccc-0002-4000-8000-000000000001',
    'aaaaaaaa-0001-4000-8000-000000000002',
    'How do you tell someone your name?',
    'I am from Hanoi.',
    'My name is ...',
    'I am nine years old.',
    'I like football.',
    'b'
  ),
  (
    'cccccccc-0002-4000-8000-000000000002',
    'aaaaaaaa-0001-4000-8000-000000000002',
    'What do you say when you meet someone for the first time?',
    'See you later.',
    'How old are you?',
    'Nice to meet you.',
    'What is your name?',
    'c'
  ),
  (
    'cccccccc-0002-4000-8000-000000000003',
    'aaaaaaaa-0001-4000-8000-000000000002',
    'Which sentence correctly states your age in English?',
    'My age is nine.',
    'I have nine years.',
    'I am nine years old.',
    'Nine years I am.',
    'c'
  )
ON CONFLICT (id) DO NOTHING;

-- ── Lesson 3 · Daily Conversation ────────────────────────────
INSERT INTO quiz_items (id, lesson_id, question, option_a, option_b, option_c, option_d, correct_option)
VALUES
  (
    'cccccccc-0003-4000-8000-000000000001',
    'aaaaaaaa-0001-4000-8000-000000000003',
    'Which word do you add to make a request polite?',
    'Sorry',
    'Please',
    'Excuse me',
    'Hello',
    'b'
  ),
  (
    'cccccccc-0003-4000-8000-000000000002',
    'aaaaaaaa-0001-4000-8000-000000000003',
    'What do you say when someone thanks you?',
    'Thank you',
    'Sorry',
    'You are welcome',
    'Excuse me',
    'c'
  ),
  (
    'cccccccc-0003-4000-8000-000000000003',
    'aaaaaaaa-0001-4000-8000-000000000003',
    'Which phrase is best for getting someone''s attention politely?',
    'Goodbye',
    'I like you',
    'You are welcome',
    'Excuse me',
    'd'
  )
ON CONFLICT (id) DO NOTHING;

-- ── Lesson 4 · At the Restaurant ─────────────────────────────
INSERT INTO quiz_items (id, lesson_id, question, option_a, option_b, option_c, option_d, correct_option)
VALUES
  (
    'cccccccc-0004-4000-8000-000000000001',
    'aaaaaaaa-0001-4000-8000-000000000004',
    'What do you ask for to see the list of available food?',
    'The bill',
    'A table for two',
    'The menu',
    'Some water',
    'c'
  ),
  (
    'cccccccc-0004-4000-8000-000000000002',
    'aaaaaaaa-0001-4000-8000-000000000004',
    'How do you politely order food at a restaurant?',
    'Give me rice.',
    'I would like some rice, please.',
    'Rice now.',
    'I want rice!',
    'b'
  ),
  (
    'cccccccc-0004-4000-8000-000000000003',
    'aaaaaaaa-0001-4000-8000-000000000004',
    'What does "delicious" mean?',
    'Very cheap',
    'Very spicy',
    'Very big',
    'Very tasty',
    'd'
  )
ON CONFLICT (id) DO NOTHING;

-- ── Lesson 5 · Shopping Basics ────────────────────────────────
INSERT INTO quiz_items (id, lesson_id, question, option_a, option_b, option_c, option_d, correct_option)
VALUES
  (
    'cccccccc-0005-4000-8000-000000000001',
    'aaaaaaaa-0001-4000-8000-000000000005',
    'How do you ask the price of an item?',
    'Do you have this?',
    'I will take it.',
    'How much is this?',
    'Can I help you?',
    'c'
  ),
  (
    'cccccccc-0005-4000-8000-000000000002',
    'aaaaaaaa-0001-4000-8000-000000000005',
    'What do you say when you decide to buy something?',
    'That is too expensive.',
    'I will take it.',
    'Do you have another?',
    'No, thank you.',
    'b'
  ),
  (
    'cccccccc-0005-4000-8000-000000000003',
    'aaaaaaaa-0001-4000-8000-000000000005',
    'What is "change" in a shopping context?',
    'A new item in the shop.',
    'The price tag.',
    'Money returned after paying too much.',
    'A receipt.',
    'c'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- SPEAKING PROMPTS
-- Columns: id, lesson_id, prompt_text, sample_answer, hint
-- =============================================================

-- ── Lesson 1 · Greetings ─────────────────────────────────────
INSERT INTO speaking_prompts (id, lesson_id, prompt_text, sample_answer, hint)
VALUES
  (
    'dddddddd-0001-4000-8000-000000000001',
    'aaaaaaaa-0001-4000-8000-000000000001',
    'Greet your teacher when you arrive at school in the morning.',
    'Good morning, teacher! How are you today?',
    'Think about what time of day it is and use the right greeting.'
  ),
  (
    'dddddddd-0001-4000-8000-000000000002',
    'aaaaaaaa-0001-4000-8000-000000000001',
    'Say goodbye to a friend at the end of the school day.',
    'Goodbye, Anna! See you tomorrow!',
    'You can add "see you tomorrow" or "have a good evening" after goodbye.'
  )
ON CONFLICT (id) DO NOTHING;

-- ── Lesson 2 · Introducing Yourself ──────────────────────────
INSERT INTO speaking_prompts (id, lesson_id, prompt_text, sample_answer, hint)
VALUES
  (
    'dddddddd-0002-4000-8000-000000000001',
    'aaaaaaaa-0001-4000-8000-000000000002',
    'Introduce yourself to a new classmate. Say your name, where you are from, your age, and one thing you like.',
    'Hi! My name is Linh. I am from Hanoi, Vietnam. I am nine years old. I like drawing. Nice to meet you!',
    'Use: My name is... / I am from... / I am ... years old. / I like... / Nice to meet you!'
  )
ON CONFLICT (id) DO NOTHING;

-- ── Lesson 3 · Daily Conversation ────────────────────────────
INSERT INTO speaking_prompts (id, lesson_id, prompt_text, sample_answer, hint)
VALUES
  (
    'dddddddd-0003-4000-8000-000000000001',
    'aaaaaaaa-0001-4000-8000-000000000003',
    'You bumped into a classmate in the corridor by accident. What do you say?',
    'Oh, sorry! I did not see you. Are you okay?',
    'Use "sorry" to apologise and check if the person is okay.'
  ),
  (
    'dddddddd-0003-4000-8000-000000000002',
    'aaaaaaaa-0001-4000-8000-000000000003',
    'A friend helped you carry your books. How do you respond?',
    'Thank you so much! That was very kind of you.',
    'Use "thank you" and add something kind like "that was very helpful".'
  )
ON CONFLICT (id) DO NOTHING;

-- ── Lesson 4 · At the Restaurant ─────────────────────────────
INSERT INTO speaking_prompts (id, lesson_id, prompt_text, sample_answer, hint)
VALUES
  (
    'dddddddd-0004-4000-8000-000000000001',
    'aaaaaaaa-0001-4000-8000-000000000004',
    'You are at a restaurant. Ask for a table, order your favourite dish, and then ask for the bill.',
    'Hello! A table for two, please. I would like a bowl of pho and an orange juice. Excuse me, could we have the bill, please? Thank you!',
    'Steps: ask for a table → order using "I would like" → ask for the bill politely.'
  )
ON CONFLICT (id) DO NOTHING;

-- ── Lesson 5 · Shopping Basics ────────────────────────────────
INSERT INTO speaking_prompts (id, lesson_id, prompt_text, sample_answer, hint)
VALUES
  (
    'dddddddd-0005-4000-8000-000000000001',
    'aaaaaaaa-0001-4000-8000-000000000005',
    'You are in a shop and want to buy a jacket. Ask the price, say it is too expensive, and ask if there is a cheaper one.',
    'Excuse me, how much is this jacket? Oh, that is too expensive. Do you have a cheaper one, please?',
    'Use: How much is...? / That is too expensive. / Do you have a cheaper one?'
  ),
  (
    'dddddddd-0005-4000-8000-000000000002',
    'aaaaaaaa-0001-4000-8000-000000000005',
    'You decided to buy the item. Tell the shopkeeper and count your change out loud.',
    'I will take it, thank you. I am paying with fifty dollars. My change should be twenty, right?',
    'Use: I will take it. / Here is... / My change is...'
  )
ON CONFLICT (id) DO NOTHING;

COMMIT;
