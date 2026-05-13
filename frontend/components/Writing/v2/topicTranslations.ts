/**
 * Vietnamese topic localization for the editorial essay picker.
 *
 * DB topic field is lowercase English (seeded from writing-prompts-bank.json:
 * "society", "education", "technology", etc.). Frontend translates for
 * display only — no migration, no AI translation pipeline. Unmapped
 * topics fall back to capitalized English.
 *
 * Title localization (`translatePromptTitle`) is a v1 heuristic — pattern-
 * matches common IELTS prompt shapes and produces a short Vietnamese
 * paraphrase suitable for the editorial card title. Upgrade path: add
 * a `vietnamese_title` column to writing_questions and pre-translate
 * the seed bank.
 */

const TOPIC_VI: Record<string, string> = {
  education: "Giáo dục",
  environment: "Môi trường",
  technology: "Công nghệ",
  society: "Xã hội",
  health: "Y tế",
  globalization: "Toàn cầu hóa",
  government: "Chính phủ",
  work: "Công việc",
  culture: "Văn hóa",
  family: "Gia đình",
  transport: "Giao thông",
  tourism: "Du lịch",
  media: "Truyền thông",
  economy: "Kinh tế",
  language: "Ngôn ngữ",
  sport: "Thể thao",
  food: "Ăn uống",
  housing: "Nhà ở",
  crime: "Tội phạm",
  science: "Khoa học",
};

const DIFFICULTY_VI: Record<string, string> = {
  band_5_6: "Cơ bản",
  band_6_7: "Trung cấp",
  band_7_8: "Nâng cao",
};

export function topicLabel(topic: string | null | undefined): string {
  if (!topic) return "Khác";
  const key = topic.trim().toLowerCase();
  if (TOPIC_VI[key]) return TOPIC_VI[key];
  // Fallback: capitalize first letter of the raw lowercase string.
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export function difficultyLabel(d: string | null | undefined): string {
  if (!d) return "";
  return DIFFICULTY_VI[d] ?? d;
}

/**
 * Lightweight Vietnamese paraphrase for IELTS prompt titles. Targets
 * common Task 2 question shapes and falls back to a truncated English
 * snippet when no pattern matches.
 *
 * Examples:
 *   "Some people think A. Others believe B. Discuss both views..."
 *     → "Có người cho rằng A. Người khác cho rằng B."
 *   "The line chart below shows X..."
 *     → "Biểu đồ thể hiện X" (Task 1)
 */
export function translatePromptTitle(
  questionText: string,
  fallbackTitle?: string | null,
): string {
  if (fallbackTitle && fallbackTitle.length > 0 && fallbackTitle.length <= 80) {
    return fallbackTitle;
  }
  const t = questionText.trim();
  // Task 1 chart-summary openers
  if (/^The (line|bar|pie) chart/i.test(t) || /^The chart/i.test(t) || /^The table/i.test(t)) {
    return "Biểu đồ thể hiện dữ liệu — tóm tắt và so sánh các đặc điểm chính";
  }
  // Task 2 — "Some people think X. Others believe Y."
  if (/Some people (think|believe|argue)/i.test(t) && /Others/i.test(t)) {
    return "Hai luồng ý kiến đối lập — thảo luận và đưa quan điểm";
  }
  // Task 2 — "Do you agree or disagree?"
  if (/Do you agree or disagree/i.test(t)) {
    return "Bạn đồng ý hay không — và vì sao";
  }
  // Task 2 — problem/solution
  if (/(causes? and|problems? and|reasons? and).*solutions?/i.test(t)) {
    return "Nguyên nhân và giải pháp";
  }
  // Task 2 — advantages/disadvantages
  if (/(advantages and disadvantages|outweigh)/i.test(t)) {
    return "Lợi và hại — đâu lớn hơn";
  }
  // Two-part
  if (t.includes("?") && (t.match(/\?/g) || []).length >= 2) {
    return "Câu hỏi hai phần — trả lời cụ thể từng ý";
  }
  // Fallback: first sentence, max 70 chars.
  const firstSentence = t.split(/[.?!]/)[0]?.trim() ?? t;
  return firstSentence.length > 70
    ? firstSentence.slice(0, 67).trimEnd() + "..."
    : firstSentence;
}
