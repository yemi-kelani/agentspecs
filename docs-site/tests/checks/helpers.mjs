// Test helpers: build a throwaway site tree and run checks against it.
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { runChecks } from '../../scripts/checks/run.mjs';

export const EMPTY_EVIDENCE = JSON.stringify({ sources: [], claims: [] });
export const EMPTY_ALLOWLIST = JSON.stringify({ urls: [], prefixes: [] });
export const EMPTY_SHINGLES = JSON.stringify({ shingle: 10, hex: 12, hashes: [] });

/** Write a banned-term list to its own temp folder, outside any test site. Returns its path. */
export function termsFile(text) {
  const path = join(mkdtempSync(join(tmpdir(), 'agentspecs-terms-')), 'banned-terms.txt');
  writeFileSync(path, text);
  return path;
}

// Hermetic default for every check run in tests, including spawned CLIs: an empty term list.
process.env.AGENTSPECS_BANNED_TERMS = termsFile('');

/**
 * Create `<tmp>/docs-site/` with the given files (paths relative to docs-site/).
 * Paths starting with "../" land beside docs-site (e.g. "../research/...").
 * Returns the docs-site root.
 */
export function makeSite(files = {}) {
  const base = mkdtempSync(join(tmpdir(), 'agentspecs-check-'));
  const root = join(base, 'docs-site');
  const all = {
    'src/data/evidence.json': EMPTY_EVIDENCE,
    'src/data/links-allowlist.json': EMPTY_ALLOWLIST,
    'src/data/copy-shingles.json': EMPTY_SHINGLES,
    ...files,
  };
  for (const [rel, content] of Object.entries(all)) {
    if (content === null) continue;
    const abs = join(root, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content);
  }
  mkdirSync(join(root, 'src/content/docs'), { recursive: true });
  return root;
}

/** A valid page with frontmatter and body. */
export function page(body, { title = 'A page', description = 'One sentence.' } = {}) {
  return `---\ntitle: ${title}\ndescription: ${description}\n---\n\n${body}\n`;
}

/** Run one check; returns its result ({ errors, warnings, skipped }). */
export async function check(name, root, opts = {}) {
  const [result] = await runChecks({ root, only: [name], ...opts });
  return result;
}

export const messages = (result) => result.errors.map((e) => `${e.file}:${e.line ?? ''} ${e.message}`).join('\n');
