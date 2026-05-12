/**
 * Vietnamese reading-time util.
 *
 * 150 wpm is the conservative reading-rate constant for Vietnamese
 * general-purpose prose (educational content, peer voice). Below that
 * for technical/dense material; above that for casual chat. 150 is a
 * deliberate middle ground for blog posts.
 *
 * Tokenization: strip MDX/markdown syntax noise (code fences, headings,
 * frontmatter, link braces, html tags), then space-split. Vietnamese is
 * space-delimited so word count = token count.
 */

const VN_WPM = 150;

export function readingTime(mdx: string): number {
  const stripped = mdx
    // remove fenced code blocks (don't count code as prose)
    .replace(/```[\s\S]*?```/g, " ")
    // remove inline code
    .replace(/`[^`]*`/g, " ")
    // remove html/jsx tags but keep inner text
    .replace(/<[^>]+>/g, " ")
    // markdown link/image: keep label, drop url
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    // strip markdown emphasis markers
    .replace(/[*_~`#>]/g, " ")
    // collapse whitespace
    .replace(/\s+/g, " ")
    .trim();

  if (!stripped) return 1;

  const wordCount = stripped.split(" ").filter(Boolean).length;
  const minutes = Math.ceil(wordCount / VN_WPM);
  return Math.max(1, minutes);
}
