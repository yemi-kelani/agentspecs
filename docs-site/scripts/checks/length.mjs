// length: plan.md caps each page at 120 Markdown lines (frontmatter excluded).
// Exempt: Specification, Templates and Evidence (per plan.md) and Quickstart (shows whole files).
import { result } from './lib.mjs';

const MAX_LINES = 120;
const EXEMPT = new Set(['specification', 'reference/templates', 'evidence', 'quickstart']);

export default {
  name: 'length',
  run(ctx) {
    const r = result();
    for (const p of ctx.pages) {
      if (EXEMPT.has(p.slug)) continue;
      const n = p.body.replace(/\n+$/, '').split('\n').length;
      if (n > MAX_LINES) r.errors.push({ file: p.file, message: `${n} lines in body; budget is ${MAX_LINES}` });
    }
    return r;
  },
};
