// labels: only the four exact tokens (near-misses and misspellings within edit distance 2 fail);
// every non-stub page except contribute has at least one.
// Code (fenced and inline) is ignored. Also flags tokens Markdown would turn into links.
import { basename } from 'node:path';
import { result } from './lib.mjs';
import { LABEL_LIKE_RE, LABEL_TOKEN_RE, LABELS } from '../../src/lib/labels.mjs';
import { lineOf } from '../../src/lib/md-utils.mjs';

const EXACT = new Set(LABELS.map((l) => `[${l.name}]`));
const NAMES = LABELS.map((l) => l.name.toLowerCase());
const BRACKETED_WORD = /\[([A-Za-z]{4,14})\]/g;

/** Levenshtein distance, for catching misspelt labels such as [Heurstic]. */
function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
const EXEMPT = new Set(['contribute']);

export default {
  name: 'labels',
  run(ctx) {
    const r = result();
    for (const p of ctx.pages) {
      const text = p.masked;
      const err = (index, message) => r.errors.push({ file: p.file, line: lineOf(text, index), message });

      for (const m of text.matchAll(new RegExp(LABEL_LIKE_RE.source, 'gi'))) {
        if (!EXACT.has(m[0])) err(m.index, `near-miss label "${m[0]}"; use one of ${[...EXACT].join(' ')}`);
      }
      const likeAt = new Set([...text.matchAll(new RegExp(LABEL_LIKE_RE.source, 'gi'))].map((m) => m.index));
      for (const m of text.matchAll(BRACKETED_WORD)) {
        if (EXACT.has(m[0]) || likeAt.has(m.index)) continue;
        const w = m[1].toLowerCase();
        if (NAMES.some((n) => distance(w, n) <= 2)) err(m.index, `misspelt label "${m[0]}"; use one of ${[...EXACT].join(' ')}`);
      }
      let count = 0;
      for (const m of text.matchAll(new RegExp(LABEL_TOKEN_RE.source, 'g'))) {
        const lineStart = text.lastIndexOf('\n', m.index) + 1;
        const after = text[m.index + m[0].length];
        if (after === ':' && /^ {0,3}$/.test(text.slice(lineStart, m.index))) {
          err(m.index, `"${m[0]}:" at line start is a link definition; it hides the label token`);
        } else if (after === '(' || after === '[') {
          err(m.index, `"${m[0]}${after}" becomes a link; put a space after the label`);
        } else {
          count++;
        }
      }
      const name = basename(p.rel).replace(/\.(md|mdx)$/, '');
      if (!p.stub && count === 0 && !(EXEMPT.has(name) && p.rel === `${name}.${p.format}`)) {
        r.errors.push({ file: p.file, line: 1, message: 'no label token; non-stub pages need at least one' });
      }
    }
    return r;
  },
};
