// templates: public/templates/ is the single source.
// - reference/templates.md (when not a stub) embeds every template byte-for-byte in a top-level fenced block.
// - quickstart.md (when not a stub) names every template file.
// Absent or empty public/templates/ -> pass with a warning.
import { readFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { result, toPosix, walkFiles } from './lib.mjs';
import { fencedBlocks } from '../../src/lib/md-utils.mjs';

const TEMPLATES_DIR = 'public/templates';

export default {
  name: 'templates',
  run(ctx) {
    const r = result();
    const dir = join(ctx.root, TEMPLATES_DIR);
    const templates = walkFiles(dir).map((abs) => ({ rel: toPosix(relative(dir, abs)), content: readFileSync(abs, 'utf8') }));
    if (templates.length === 0) {
      r.warnings.push(`${TEMPLATES_DIR}/ is absent or empty; nothing to compare`);
      return r;
    }
    const find = (slug) => ctx.pages.find((p) => p.slug === slug);

    const ref = find('reference/templates');
    if (ref && !ref.stub) {
      const blocks = new Set(fencedBlocks(ref.body).map((b) => b.body));
      for (const t of templates) {
        const want = t.content.endsWith('\n') ? t.content : t.content + '\n';
        if (!blocks.has(want)) {
          r.errors.push({ file: ref.file, message: `${TEMPLATES_DIR}/${t.rel} is not embedded byte-for-byte in a fenced block` });
        }
      }
    }

    const qs = find('quickstart');
    if (qs && !qs.stub) {
      for (const t of templates) {
        if (!qs.body.includes(basename(t.rel))) {
          r.errors.push({ file: qs.file, message: `does not name template ${basename(t.rel)} (${TEMPLATES_DIR}/${t.rel})` });
        }
      }
    }
    return r;
  },
};
