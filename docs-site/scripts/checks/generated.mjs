// generated: the region of evidence.md between the evidence:generated markers must match what
// scripts/gen-evidence.mjs renders from src/data/evidence.json. Fix: `node scripts/gen-evidence.mjs`.
// Passes when evidence.md is absent, still a stub, or outside the path arguments.
import { result } from './lib.mjs';
import { DATA, compareRegion } from '../gen-evidence.mjs';

export default {
  name: 'generated',
  run(ctx) {
    const r = result();
    const page = ctx.pages.find((p) => p.slug === 'evidence');
    if (!page || page.stub) return r;
    const ev = ctx.readJson(DATA);
    if (ev.error) {
      r.errors.push({ file: DATA, message: ev.error });
      return r;
    }
    const { error, line } = compareRegion(page.raw, ev.value);
    if (error) r.errors.push({ file: page.file, line, message: error });
    return r;
  },
};
