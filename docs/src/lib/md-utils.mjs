// Small, dependency-free Markdown helpers shared by the export (src/lib/markdown.ts) and the checks (scripts/checks/).

const FENCE_OPEN = /^(\s*)(`{3,}|~{3,})(.*)$/;

/**
 * Split Markdown into prose and fenced-code segments.
 * Each segment: { code: boolean, text: string, startLine: number (1-based), info?: string, body?: string }
 * For code segments, `body` is the text between the fences (each line + "\n").
 */
export function splitFences(text) {
  const lines = text.split('\n');
  const segments = [];
  let prose = [];
  let proseStart = 1;
  let i = 0;
  const flushProse = () => {
    if (prose.length) segments.push({ code: false, text: prose.join('\n'), startLine: proseStart });
    prose = [];
  };
  while (i < lines.length) {
    const m = FENCE_OPEN.exec(lines[i]);
    // Backtick fences may not have backticks in the info string.
    if (m && !(m[2][0] === '`' && m[3].includes('`'))) {
      const char = m[2][0];
      const len = m[2].length;
      const close = new RegExp(`^\\s*${char === '`' ? '`' : '~'}{${len},}\\s*$`);
      let j = i + 1;
      while (j < lines.length && !close.test(lines[j])) j++;
      flushProse();
      const bodyLines = lines.slice(i + 1, j);
      segments.push({
        code: true,
        text: lines.slice(i, Math.min(j + 1, lines.length)).join('\n'),
        startLine: i + 1,
        info: m[3].trim(),
        body: bodyLines.map((l) => l + '\n').join(''),
        closed: j < lines.length,
      });
      i = j + 1;
      proseStart = i + 1;
      continue;
    }
    if (prose.length === 0) proseStart = i + 1;
    prose.push(lines[i]);
    i++;
  }
  flushProse();
  return segments;
}

/** All fenced code blocks: [{ info, body, startLine }]. */
export function fencedBlocks(text) {
  return splitFences(text).filter((s) => s.code);
}

/**
 * Replace fenced code blocks and inline code spans with spaces, keeping line numbers and columns.
 * Use before scanning prose for tokens, URLs or quotes.
 */
export function maskCode(text) {
  return splitFences(text)
    .map((s) => (s.code ? s.text.replace(/[^\n]/g, ' ') : maskInlineCode(s.text)))
    .join('\n');
}

function maskInlineCode(text) {
  // A code span never crosses a blank line, so one stray backtick cannot mask later paragraphs.
  return text.replace(/(`+)((?:(?!\n[ \t]*\n)[\s\S])*?[^`])\1(?!`)/g, (m) => m.replace(/[^\n]/g, ' '));
}

/** Split a file into { frontmatter (raw YAML or null), body, bodyStartLine }. */
export function splitFrontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(raw);
  if (!m) return { frontmatter: null, body: raw, bodyStartLine: 1 };
  const consumed = m[0];
  return {
    frontmatter: m[1],
    body: raw.slice(consumed.length),
    bodyStartLine: consumed.split('\n').length,
  };
}

/** 1-based line number of a character offset. */
export function lineOf(text, offset) {
  let line = 1;
  for (let i = 0; i < offset && i < text.length; i++) if (text.charCodeAt(i) === 10) line++;
  return line;
}

/** True when a page body is still a stub (HTML or MDX comment marker). */
export function isStub(text) {
  return /<!--\s*stub\b|\{\/\*\s*stub\b/.test(text);
}
