// stubs: fail if any page still carries a stub marker (`<!-- stub` or `{/* stub`) outside code.
// Skipped with --allow-stubs.
import { result } from './lib.mjs';
import { lineOf } from '../../src/lib/md-utils.mjs';

const MARKER = /<!--\s*stub\b|\{\/\*\s*stub\b/;

export default {
  name: 'stubs',
  run(ctx) {
    const r = result();
    if (ctx.allowStubs) {
      r.skipped = '--allow-stubs';
      return r;
    }
    for (const p of ctx.pages) {
      const m = MARKER.exec(p.masked);
      if (m) r.errors.push({ file: p.file, line: lineOf(p.masked, m.index), message: 'page is still a stub' });
    }
    return r;
  },
};
