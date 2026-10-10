// links: every internal link in content resolves to a content page (HTML or its /<slug>.md export)
// or to a file in public/. Relative links resolve like a browser would from the page URL
// (/concepts/sizing/ + ../why-structure/ -> /concepts/why-structure/). Fragments are not checked.
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { result } from './lib.mjs';
import { lineOf } from '../../src/lib/md-utils.mjs';

const PATTERNS = [
  /\]\(\s*<?([^)\s>]+)>?(?:\s+["'(][^)]*)?\)/g, // [text](href "title")
  /^ {0,3}\[[^\]]+\]:\s*<?([^\s>]+)>?/gm, // [ref]: href
  /\b(?:href|src)=["']([^"']+)["']/g, // HTML / JSX attributes
];

export function pageUrl(slug) {
  if (slug === 'index') return '/';
  return '/' + slug.replace(/(^|\/)index$/, '') + '/';
}

function isInternal(href) {
  return !href.startsWith('#') && !href.startsWith('//') && !/^[a-z][a-z0-9+.-]*:/i.test(href);
}

export default {
  name: 'links',
  run(ctx) {
    const r = result();
    const slugs = new Set(ctx.allPages.map((p) => p.slug));
    const hasPage = (slug) => slugs.has(slug) || slugs.has(`${slug}/index`) || (slug === '' && slugs.has('index'));
    const publicFile = (path) => {
      const abs = join(ctx.root, 'public', path);
      return existsSync(abs) && statSync(abs).isFile();
    };

    for (const p of ctx.pages) {
      const base = new URL(pageUrl(p.slug), 'https://site.invalid');
      for (const re of PATTERNS) {
        for (const m of p.codeMasked.matchAll(new RegExp(re.source, re.flags))) {
          const href = m[1];
          if (!isInternal(href)) continue;
          let path;
          try {
            path = decodeURIComponent(new URL(href, base).pathname).replace(/^\//, '');
          } catch {
            path = null;
          }
          const ok =
            path !== null &&
            (publicFile(path) ||
              (path.endsWith('.md') && hasPage(path.slice(0, -3))) ||
              hasPage(path.replace(/\/$/, '')));
          if (!ok) {
            r.errors.push({
              file: p.file,
              line: lineOf(p.codeMasked, m.index),
              message: `internal link ${href} does not resolve to a page or a file in public/`,
            });
          }
        }
      }
    }
    return r;
  },
};
