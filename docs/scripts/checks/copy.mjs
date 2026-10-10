// copy: no 10-word shingle (lowercased, punctuation stripped) shared between site content
// and the agentskills.io docs. Uses ../research/agentskills/docs/**/*.mdx when present; otherwise
// the committed hashes in src/data/copy-shingles.json (no source text; regenerate with
// `node scripts/gen-copy-shingles.mjs`). Fails if neither exists.
// Consecutive matching shingles are reported once, as a single run.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { result, toPosix, walkFiles } from './lib.mjs';
import { lineOf } from '../../src/lib/md-utils.mjs';

export const SHINGLE = 10;
export const RESEARCH_DIR = '../research/agentskills/docs';
export const SHINGLES_FILE = 'src/data/copy-shingles.json';
export const HASH_HEX = 12;
export const shingleHash = (s, hex = HASH_HEX) => createHash('sha256').update(s).digest('hex').slice(0, hex);

/** Corpus shingles: Map shingle -> source file name, read from the research directory. */
export function corpusShingles(dir) {
  const seen = new Map();
  for (const abs of walkFiles(dir, (f) => f.endsWith('.mdx'))) {
    const words = tokens(readFileSync(abs, 'utf8')).map((t) => t.word);
    const name = toPosix(relative(dir, abs));
    for (let i = 0; i + SHINGLE <= words.length; i++) {
      const s = words.slice(i, i + SHINGLE).join(' ');
      if (!seen.has(s)) seen.set(s, name);
    }
  }
  return seen;
}

/** Tokens with their source offsets: [{ word, index }]. */
export function tokens(text) {
  const out = [];
  for (const m of text.matchAll(/\S+/g)) {
    const word = m[0].toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    if (word) out.push({ word, index: m.index });
  }
  return out;
}

export default {
  name: 'copy',
  run(ctx) {
    const r = result();
    const dir = resolve(ctx.root, RESEARCH_DIR);
    const hashFile = resolve(ctx.root, SHINGLES_FILE);
    let seen; // { has(shingle), get(shingle) -> source name }
    if (existsSync(dir)) {
      seen = corpusShingles(dir);
    } else if (existsSync(hashFile)) {
      const data = JSON.parse(readFileSync(hashFile, 'utf8'));
      const hashes = new Set(data.hashes ?? []);
      const hex = data.hex ?? HASH_HEX;
      seen = { has: (s) => hashes.has(shingleHash(s, hex)), get: () => 'agentskills.io docs (hashed)' };
    } else {
      r.errors.push({ file: SHINGLES_FILE, message: `${SHINGLES_FILE} is missing and ${RESEARCH_DIR} is absent; the copy check cannot run` });
      return r;
    }
    for (const p of ctx.pages) {
      const toks = tokens(p.raw);
      let i = 0;
      while (i + SHINGLE <= toks.length) {
        const s = toks.slice(i, i + SHINGLE).map((t) => t.word).join(' ');
        if (!seen.has(s)) {
          i++;
          continue;
        }
        let end = i + SHINGLE; // extend the run while the next shingle also matches
        while (end < toks.length && seen.has(toks.slice(end - SHINGLE + 1, end + 1).map((t) => t.word).join(' '))) end++;
        const run = toks.slice(i, end).map((t) => t.word).join(' ');
        r.errors.push({
          file: p.file,
          line: lineOf(p.raw, toks[i].index),
          message: `${end - i}-word run copied from agentskills ${seen.get(s)}: "${run}"`,
        });
        i = end;
      }
    }
    return r;
  },
};
