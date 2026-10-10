// quotes: flag any double- or curly-single-quoted span, or blockquote, of ≥15 words in content prose. Quotes belong in
// evidence.json (`quote` field, <15 words) and render on /evidence only.
// Ignores code, frontmatter and attribute values (a quote right after "=").
import { result } from './lib.mjs';
import { lineOf } from '../../src/lib/md-utils.mjs';

export const MAX_WORDS = 15;
const PARAGRAPH = /(?:[^\n]*\S[^\n]*(?:\n|$))+/g;
const QUOTED = /"([^"]*)"|“([^”]*)”|‘([^’]*)’/g;
const BLOCKQUOTE = /(?:^ {0,3}>[^\n]*(?:\n|$))+/gm;
const countWords = (s) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

export default {
  name: 'quotes',
  run(ctx) {
    const r = result();
    for (const p of ctx.pages) {
      const text = p.masked;
      for (const para of text.matchAll(PARAGRAPH)) {
        for (const q of para[0].matchAll(QUOTED)) {
          const at = para.index + q.index;
          if (text[at - 1] === '=') continue;
          const span = q[1] ?? q[2] ?? q[3];
          const n = countWords(span);
          if (n >= MAX_WORDS) {
            r.errors.push({
              file: p.file,
              line: lineOf(text, at),
              message: `quoted span of ${n} words; paraphrase, or move a <${MAX_WORDS}-word quote into evidence.json`,
            });
          }
        }
      }
      for (const b of text.matchAll(BLOCKQUOTE)) {
        const n = countWords(b[0].replace(/^ {0,3}>/gm, ''));
        if (n >= MAX_WORDS) {
          r.errors.push({
            file: p.file,
            line: lineOf(text, b.index),
            message: `blockquote of ${n} words; paraphrase, or move a <${MAX_WORDS}-word quote into evidence.json`,
          });
        }
      }
    }
    return r;
  },
};
