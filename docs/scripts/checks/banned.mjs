// banned: no employer or internal product names anywhere the repository would publish.
// The term list is never stored in the repository, as text or as hashes: a hash of a short name
// can be reversed by guessing. It lives in a plain-text file outside the repository, at the path in
// AGENTSPECS_BANNED_TERMS, else ~/.config/agentspecs/banned-terms.txt. One term per line, matched
// case-sensitively as whole words (a multi-word term matches only with single spaces); blank
// lines and # comments are ignored. AGENTSPECS_BANNED_TERMS=off skips the scan with a warning,
// for contributors who do not hold the list. Messages give the term's line in the list, never the term.
// Scope: path arguments if given; otherwise, inside a git repository, every tracked or
// not-ignored file in the whole repository (`git ls-files -co --exclude-standard`); otherwise
// every file under the site root. Binary files are skipped.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, relative } from 'node:path';
import { result, toPosix } from './lib.mjs';
import { lineOf } from '../../src/lib/md-utils.mjs';

export const TERMS_ENV = 'AGENTSPECS_BANNED_TERMS';
const DEFAULT_TERMS = '.config/agentspecs/banned-terms.txt'; // under the home folder
const SKIP_DIRS = new Set(['node_modules', 'dist', '.astro', '.git']);
const BINARY_EXT = /\.(png|jpe?g|gif|webp|avif|ico|bmp|woff2?|ttf|otf|eot|pdf|zip|gz|mp4|webm|mp3)$/i;

const isBinary = (buf) => buf.subarray(0, 8000).includes(0);

function walk(dir) {
  if (!existsSync(dir)) return [];
  if (statSync(dir).isFile()) return [dir];
  return readdirSync(dir)
    .filter((n) => !SKIP_DIRS.has(n) && n !== '.DS_Store')
    .flatMap((n) => walk(join(dir, n)))
    .sort();
}

/** Files git would publish from the repository containing `root`, or null outside a repository. */
function repoFiles(root) {
  const top = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd: root, encoding: 'utf8' });
  if (top.status !== 0) return null;
  const dir = top.stdout.trim();
  const ls = spawnSync('git', ['ls-files', '-z', '-co', '--exclude-standard'], {
    cwd: dir,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
  if (ls.status !== 0) return null;
  return ls.stdout.split('\0').filter(Boolean).map((f) => join(dir, f)).filter((f) => existsSync(f) && statSync(f).isFile());
}

/** [{ line, re }] from the term list text: one whole-word, case-sensitive pattern per term. */
function parseTerms(text) {
  const escape = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text
    .split('\n')
    .map((raw, i) => ({ line: i + 1, term: raw.trim() }))
    .filter(({ term }) => term && !term.startsWith('#'))
    .map(({ line, term }) => ({ line, re: new RegExp(`(?<![A-Za-z0-9])${escape(term)}(?![A-Za-z0-9])`, 'g') }));
}

export default {
  name: 'banned',
  run(ctx) {
    const r = result();
    const env = ctx.env ?? process.env;
    if (env[TERMS_ENV] === 'off') {
      r.warnings.push(`banned-term scan skipped (${TERMS_ENV}=off); maintainers must run it with the list`);
      return r;
    }
    const termsPath = env[TERMS_ENV] || join(env.HOME || homedir(), DEFAULT_TERMS);
    if (!existsSync(termsPath)) {
      r.errors.push({
        file: termsPath,
        message: `term list not found; set ${TERMS_ENV} to its path (outside the repository), or to "off" if you do not hold it`,
      });
      return r;
    }
    const terms = parseTerms(readFileSync(termsPath, 'utf8'));
    const files = ctx.scoped.length ? ctx.scoped.flatMap(walk) : (repoFiles(ctx.root) ?? walk(ctx.root));
    const base = realpathSync(ctx.root);
    for (const abs of files) {
      if (BINARY_EXT.test(abs)) continue;
      const buf = readFileSync(abs);
      if (isBinary(buf)) continue;
      const text = buf.toString('utf8');
      for (const { line, re } of terms) {
        for (const m of text.matchAll(re)) {
          r.errors.push({
            file: toPosix(relative(base, realpathSync(abs))),
            line: lineOf(text, m.index),
            message: `banned term (term on line ${line} of the list); remove employer or internal names`,
          });
        }
      }
    }
    return r;
  },
};
