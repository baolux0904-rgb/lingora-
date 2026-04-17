const format = require('../../../src/domain/ielts/format');

describe('format constants', () => {
  it('READING has 40 questions over 60 minutes', () => {
    expect(format.READING.TOTAL_QUESTIONS).toBe(40);
    expect(format.READING.TOTAL_MINUTES).toBe(60);
    expect(format.READING.TOTAL_PASSAGES).toBe(3);
  });

  it('LISTENING is 32 minutes total (30 audio + 2 review)', () => {
    expect(format.LISTENING.AUDIO_MINUTES).toBe(30);
    expect(format.LISTENING.REVIEW_MINUTES).toBe(2);
    expect(format.LISTENING.TOTAL_MINUTES).toBe(32);
  });

  it('LISTENING allows zero replays', () => {
    expect(format.LISTENING.AUDIO_REPLAYS_ALLOWED).toBe(0);
  });

  it('WRITING Task 1 min 150 words', () => {
    expect(format.WRITING.TASK_1.MIN_WORDS).toBe(150);
  });

  it('WRITING Task 2 min 250 words', () => {
    expect(format.WRITING.TASK_2.MIN_WORDS).toBe(250);
  });

  it('SPEAKING Part 2 has 60s prep + 60-120s speaking', () => {
    expect(format.SPEAKING.PART_2.PREP_SECONDS).toBe(60);
    expect(format.SPEAKING.PART_2.SPEAKING_SECONDS_MIN).toBe(60);
    expect(format.SPEAKING.PART_2.SPEAKING_SECONDS_MAX).toBe(120);
  });

  it('FULL_TEST_ORDER is listening → reading → writing → speaking', () => {
    expect(format.FULL_TEST_ORDER).toEqual(['listening', 'reading', 'writing', 'speaking']);
  });

  it('TEST_TYPES contains both academic and general_training', () => {
    expect(format.TEST_TYPES).toContain('academic');
    expect(format.TEST_TYPES).toContain('general_training');
  });

  it('constants are frozen', () => {
    expect(Object.isFrozen(format.READING)).toBe(true);
    expect(Object.isFrozen(format.WRITING)).toBe(true);
    expect(Object.isFrozen(format.WRITING.TASK_1)).toBe(true);
    expect(Object.isFrozen(format.FULL_TEST_ORDER)).toBe(true);
  });
});
