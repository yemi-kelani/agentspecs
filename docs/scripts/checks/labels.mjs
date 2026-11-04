// labels: [Evidence] is the only label. Near-misses, misspellings within edit distance 2 and the
// retired tokens ([Established], [Heuristic], [Proposal], [Judgment]) fail. Code (fenced and inline)
// is ignored. Also flags tokens Markdown would turn into links.
//
// Scope: the label covers the text from its token to the next token, or to the end of its paragraph,
// list item or table cell. Two rules read scopes:
//   - An [Evidence] scope links at least one ledger row (/evidence/ledger/#r<N>).
//   - A recommendation sentence links a ledger row; there is no other way to pass. A sentence is a
//     recommendation when it holds a modal cue (should, must, avoid, never, recommend, ...) or opens
//     with an imperative verb. Headings, JSX lines and callout markers are skipped.
// Whether a linked row exists and is verified is the citations check's job.
import { result } from './lib.mjs';
import { LABEL_LIKE_RE, LABEL_TOKEN_RE, LABELS, RETIRED_LABELS, ROW_LINK_RE } from '../../src/lib/labels.mjs';
import { lineOf } from '../../src/lib/md-utils.mjs';

const EXACT = new Set(LABELS.map((l) => `[${l.name}]`));
// Misspellings of retired names are caught too, so [Judgemnt] does not slip through as plain text.
const NAMES = [...LABELS.map((l) => l.name), ...Object.keys(RETIRED_LABELS)].map((n) => n.toLowerCase());
const BRACKETED_WORD = /\[([A-Za-z]{4,14})\]/g;
const RETIRED_RE = new RegExp(`\\[(${Object.keys(RETIRED_LABELS).join('|')})\\]`, 'g');
// Pages whose prose is site policy or generated evidence, not practice guidance.
const NO_RECOMMENDATION_RULE = new Set(['contribute', 'evidence/ledger', 'evidence/method']);

export const MODAL_RE =
  /\b(should(?:n't)?|must(?:n't)?|needs? to|ha(?:ve|s) to|ought to|recommend(?:s|ed|ation)?|advises?|prefer(?:s|red)?|avoid(?:s|ed)?|never|always|do not|don't|make sure|be sure|better to|best to)\b/i;
// Unambiguous imperative openings. Words that also open descriptive sentences as nouns
// (File, Test, Report, Review, Record, Name, List, Size) are left out on purpose.
export const IMPERATIVES = new Set(
  (
    'Write Use Keep Give Run Put Add Mark Stop Treat Start Ask Let Split Merge Move Make Prefer Avoid Re-run Rerun ' +
    'Inject Retire Delete Remove Fill Replace Create Define Describe Edit Fetch Follow Include Leave Paste Prove ' +
    'Skip Tell Verify Wait Rewrite Grant Dispatch Flip Reject Read Apply Choose Pick Do Never Always Consider Try'
  ).split(' '),
);
const ABBREVIATIONS = /\b(e\.g|i\.e|et al|vs|cf|approx|etc|no)\./gi;

/** Levenshtein distance, for catching misspelt labels such as [Judgement]. */
function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/**
 * Prose blocks of masked page text: paragraphs, list items and table cells, each { text, start }.
 * Headings, JSX/import lines, callout markers and table separator rows are not blocks.
 */
export function proseBlocks(text) {
  const blocks = [];
  let cur = null;
  const flush = () => {
    if (cur && cur.text.trim()) blocks.push(cur);
    cur = null;
  };
  let offset = 0;
  for (const line of text.split('\n')) {
    const at = offset;
    offset += line.length + 1;
    const t = line.trim();
    if (!t) {
      flush();
      continue;
    }
    if (/^#{1,6}\s/.test(t) || /^:::/.test(t) || /^(<|import\s|export\s|\{\/\*)/.test(t)) {
      flush();
      continue;
    }
    if (t.startsWith('|')) {
      flush();
      if (/^\|[\s:|-]+\|?$/.test(t)) continue;
      let pos = at + line.indexOf('|') + 1;
      for (const cell of t.replace(/^\||\|$/g, '').split('|')) {
        if (cell.trim()) blocks.push({ text: cell, start: pos });
        pos += cell.length + 1;
      }
      continue;
    }
    if (/^([-*+]|\d+[.)])\s/.test(t)) {
      flush();
      cur = { text: line, start: at };
      continue;
    }
    if (cur) cur.text += '\n' + line;
    else cur = { text: line, start: at };
  }
  flush();
  return blocks;
}

/** Split a block into label scopes: [{ label: name | null, text, start }]. */
export function scopes(block) {
  const out = [];
  const re = new RegExp(LABEL_TOKEN_RE.source, 'g');
  let last = 0;
  let label = null;
  for (const m of block.text.matchAll(re)) {
    out.push({ label, text: block.text.slice(last, m.index), start: block.start + last });
    label = m[1];
    last = m.index + m[0].length;
  }
  out.push({ label, text: block.text.slice(last), start: block.start + last });
  return out.filter((s) => s.label || s.text.trim());
}

/** Sentences of a scope, each { text, start }. Abbreviations and decimals do not end a sentence. */
export function sentences(scope) {
  const guarded = scope.text.replace(ABBREVIATIONS, (m) => m.replace(/\./g, '\u0000'));
  const out = [];
  let last = 0;
  for (const m of guarded.matchAll(/[.!?](?=\s+["“(*_[]?[A-Z0-9])/g)) {
    out.push({ text: scope.text.slice(last, m.index + 1), start: scope.start + last });
    last = m.index + 1;
  }
  out.push({ text: scope.text.slice(last), start: scope.start + last });
  return out.filter((s) => /[\p{L}]/u.test(s.text));
}

const hasRowLink = (s) => new RegExp(ROW_LINK_RE.source).test(s);

/** First word of a sentence once list markers, task boxes, emphasis and link brackets are stripped. */
function firstWord(s) {
  const t = s
    .replace(/^\s*([-*+]|\d+[.)])\s+/, '')
    .replace(/^\[[ xX]\]\s+/, '')
    .replace(/^[\s*_“"(]+/, '')
    .replace(/^\[/, '');
  return /^[A-Za-z][A-Za-z'-]*/.exec(t)?.[0] ?? '';
}

/** Why a sentence reads as a recommendation, or null. */
export function recommendationCue(sentence, { imperatives = true } = {}) {
  const prose = sentence.replace(/\]\([^)]*\)/g, ']');
  const modal = MODAL_RE.exec(prose);
  if (modal) return `"${modal[0]}"`;
  if (imperatives) {
    const w = firstWord(prose);
    if (IMPERATIVES.has(w)) return `imperative "${w}"`;
  }
  return null;
}

export default {
  name: 'labels',
  run(ctx) {
    const r = result();
    for (const p of ctx.pages) {
      const text = p.masked;
      const err = (index, message) => r.errors.push({ file: p.file, line: lineOf(text, index), message });

      for (const m of text.matchAll(RETIRED_RE)) {
        err(m.index, `retired label "${m[0]}"; ${RETIRED_LABELS[m[1]]} (see /evidence/method/#labels)`);
      }
      const retiredAt = new Set([...text.matchAll(RETIRED_RE)].map((m) => m.index));
      for (const m of text.matchAll(new RegExp(LABEL_LIKE_RE.source, 'gi'))) {
        if (!EXACT.has(m[0]) && !retiredAt.has(m.index)) err(m.index, `near-miss label "${m[0]}"; use ${[...EXACT].join(' ')}`);
      }
      const likeAt = new Set([...text.matchAll(new RegExp(LABEL_LIKE_RE.source, 'gi'))].map((m) => m.index));
      for (const m of text.matchAll(BRACKETED_WORD)) {
        if (EXACT.has(m[0]) || likeAt.has(m.index) || retiredAt.has(m.index)) continue;
        const w = m[1].toLowerCase();
        if (NAMES.some((n) => distance(w, n) <= 2)) err(m.index, `misspelt label "${m[0]}"; use ${[...EXACT].join(' ')}`);
      }
      for (const m of text.matchAll(new RegExp(LABEL_TOKEN_RE.source, 'g'))) {
        const lineStart = text.lastIndexOf('\n', m.index) + 1;
        const after = text[m.index + m[0].length];
        if (after === ':' && /^ {0,3}$/.test(text.slice(lineStart, m.index))) {
          err(m.index, `"${m[0]}:" at line start is a link definition; it hides the label token`);
        } else if (after === '(' || after === '[') {
          err(m.index, `"${m[0]}${after}" becomes a link; put a space after the label`);
        }
      }
      if (p.stub) continue;

      const recommendations = !NO_RECOMMENDATION_RULE.has(p.slug);
      for (const block of proseBlocks(text)) {
        for (const s of scopes(block)) {
          if (s.label) {
            if (!hasRowLink(s.text)) err(s.start, `[${s.label}] claim links no ledger row; add a link such as [R1](/evidence/ledger/#r1)`);
            continue;
          }
          if (!recommendations) continue;
          for (const sentence of sentences(s)) {
            const cue = recommendationCue(sentence.text);
            if (cue && !hasRowLink(sentence.text)) {
              err(sentence.start, `recommendation (${cue}) links no ledger row; link one, or move the point to Open questions`);
            }
          }
        }
      }
    }
    return r;
  },
};
