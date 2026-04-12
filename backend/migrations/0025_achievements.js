/* eslint-disable camelcase */

/**
 * Migration 0025 — Achievement system expansion
 *
 * Adds category, rarity, emoji, unlock_criteria, achievement_points to badges.
 * Adds achievement_score to users.
 * Creates badge_progress tracking table.
 * Seeds ~40 new achievement badges across all activity types.
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // 1. Extend badges table
  pgm.addColumns("badges", {
    category: { type: "text", default: "'learning'" },
    rarity: { type: "text", default: "'common'" },
    emoji: { type: "text", default: "'🏅'" },
    unlock_criteria: { type: "jsonb", default: pgm.func("'{}'::jsonb") },
    achievement_points: { type: "smallint", notNull: true, default: 0 },
  });

  // 2. Add achievement_score to users
  pgm.addColumns("users", {
    achievement_score: { type: "int", notNull: true, default: 0 },
  });

  // 3. Badge progress tracking
  pgm.createTable("badge_progress", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    user_id: { type: "uuid", notNull: true, references: '"users"', onDelete: "CASCADE" },
    badge_slug: { type: "varchar(50)", notNull: true },
    current_value: { type: "int", notNull: true, default: 0 },
    target_value: { type: "int", notNull: true, default: 0 },
    updated_at: { type: "timestamptz", default: pgm.func("now()") },
  });
  pgm.addConstraint("badge_progress", "unique_user_badge_progress", { unique: ["user_id", "badge_slug"] });

  // 4. Update existing badges with new columns
  pgm.sql(`
    UPDATE badges SET category = 'learning', rarity = 'common', emoji = '🎯', achievement_points = 50 WHERE slug = 'first_lesson';
    UPDATE badges SET category = 'streak', rarity = 'common', emoji = '🔥', achievement_points = 75 WHERE slug = 'streak_3';
    UPDATE badges SET category = 'streak', rarity = 'common', emoji = '🔥🔥', achievement_points = 150 WHERE slug = 'streak_7';
    UPDATE badges SET category = 'streak', rarity = 'epic', emoji = '🔥👑', achievement_points = 500 WHERE slug = 'streak_30';
    UPDATE badges SET category = 'learning', rarity = 'rare', emoji = '💯', achievement_points = 100 WHERE slug = 'perfect_score';
    UPDATE badges SET category = 'learning', rarity = 'common', emoji = '⚡', achievement_points = 50 WHERE slug = 'speed_demon';
  `);

  // 5. Seed new badges
  pgm.sql(`
    INSERT INTO badges (slug, name, description, xp_reward, category, rarity, emoji, achievement_points) VALUES
    -- STREAK
    ('streak_14', 'Không Ngừng', '14-day streak', 200, 'streak', 'rare', '🔥🔥🔥', 300),
    ('streak_60', 'Quái Vật Kỷ Luật', '60-day streak', 800, 'streak', 'epic', '🔥👹', 800),
    ('streak_100', 'Huyền Thoại Streak', '100-day streak', 1500, 'streak', 'legendary', '🔥👑', 1500),
    -- XP
    ('xp_1k', '1K Rookie', 'Reach 1,000 XP', 50, 'xp', 'common', '⚡', 50),
    ('xp_5k', '5K Grinder', 'Reach 5,000 XP', 100, 'xp', 'common', '⚡⚡', 100),
    ('xp_10k', '10K Player', 'Reach 10,000 XP', 200, 'xp', 'rare', '⚡🔥', 200),
    ('xp_50k', '50K Beast', 'Reach 50,000 XP', 600, 'xp', 'epic', '⚡👊', 600),
    ('xp_100k', '100K Legend', 'Reach 100,000 XP', 1500, 'xp', 'legendary', '⚡👑', 1500),
    -- SPEAKING
    ('speaking_first', 'First Voice', 'First speaking session', 30, 'speaking', 'common', '🎤', 30),
    ('speaking_10', 'Talkative', '10 speaking sessions', 80, 'speaking', 'common', '🎤🎤', 80),
    ('speaking_50', 'Speaker Pro', '50 speaking sessions', 200, 'speaking', 'rare', '🎤🔥', 250),
    ('speaking_100', 'Speaking Machine', '100 speaking sessions', 500, 'speaking', 'epic', '🎤⚡', 500),
    ('speaking_band7', 'Band 7 Speaker', 'Achieve Band 7+ in speaking', 1000, 'speaking', 'legendary', '🎤🏆', 1000),
    -- WRITING
    ('writing_first', 'First Essay', 'First writing submission', 30, 'writing', 'common', '✍️', 30),
    ('writing_10', 'Writer Mode', '10 writing submissions', 80, 'writing', 'common', '✍️✍️', 80),
    ('writing_50', 'Essay Grinder', '50 writing submissions', 200, 'writing', 'rare', '✍️🔥', 250),
    ('writing_band7', 'Band 7 Writer', 'Achieve Band 7+ in writing', 1000, 'writing', 'legendary', '✍️🏆', 1000),
    -- READING
    ('reading_first', 'First Read', 'First reading session', 30, 'reading', 'common', '📖', 30),
    ('reading_50', 'Focus Mode', '50 correct answers', 80, 'reading', 'common', '📖🎯', 80),
    ('reading_100', 'Accuracy King', '100 correct answers', 200, 'reading', 'rare', '📖🔥', 200),
    ('reading_300', 'Reading Machine', '300 correct answers', 500, 'reading', 'epic', '📖⚡', 500),
    -- BATTLE
    ('battle_first', 'First Blood', 'First battle win', 50, 'battle', 'common', '⚔️', 50),
    ('battle_10', 'Fighter', '10 battle wins', 100, 'battle', 'common', '⚔️⚔️', 100),
    ('battle_50', 'Warrior', '50 battle wins', 250, 'battle', 'rare', '⚔️🔥', 300),
    ('battle_100', 'Gladiator', '100 battle wins', 600, 'battle', 'epic', '⚔️⚡', 600),
    ('battle_streak_3', 'Win Streak 3', '3 battle wins in a row', 80, 'battle', 'common', '🔥⚔️', 80),
    ('battle_streak_5', 'Win Streak 5', '5 battle wins in a row', 150, 'battle', 'rare', '🔥⚔️⚔️', 150),
    ('battle_streak_10', 'Unstoppable', '10 battle wins in a row', 500, 'battle', 'legendary', '🔥👑', 500),
    ('rank_gold', 'Gold Rank', 'Reach Gold rank', 200, 'battle', 'rare', '🏆', 200),
    ('rank_diamond', 'Diamond Rank', 'Reach Diamond rank', 600, 'battle', 'epic', '💎', 600),
    ('rank_challenger', 'Challenger', 'Reach Challenger rank', 1500, 'battle', 'legendary', '👑', 1500),
    -- SOCIAL
    ('social_first_friend', 'First Friend', 'Add your first friend', 30, 'social', 'common', '🤝', 30),
    ('social_5_friends', 'Squad', '5 friends', 80, 'social', 'common', '👥', 80),
    ('social_10_friends', 'Community', '10 friends', 150, 'social', 'rare', '🌐', 150),
    ('social_room_creator', 'Room Creator', 'Create a study room', 150, 'social', 'rare', '🏠', 150),
    -- LEARNING
    ('learning_all_skills', 'All-in-One', 'Practice all 4 skills in one day', 150, 'learning', 'rare', '🧠', 150),
    ('learning_consistency', 'Consistency King', '90 days active', 1200, 'learning', 'legendary', '👑', 1200)
    ON CONFLICT (slug) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable("badge_progress");
  pgm.dropColumns("users", ["achievement_score"]);
  pgm.dropColumns("badges", ["category", "rarity", "emoji", "unlock_criteria", "achievement_points"]);
  pgm.sql(`DELETE FROM badges WHERE slug NOT IN ('first_lesson', 'streak_3', 'streak_7', 'streak_30', 'perfect_score', 'speed_demon');`);
};
