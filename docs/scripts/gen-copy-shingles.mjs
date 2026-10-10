#!/usr/bin/env node
// Write src/data/copy-shingles.json: truncated SHA-256 hashes of every 10-word shingle in the
// agentskills.io docs. The file holds no source text, so the copy check runs on fresh clones and in
// CI. Usage, from docs/, when those docs change:
//   node scripts/gen-copy-shingles.mjs <folder>   (or set AGENTSPECS_COPY_CORPUS)
// where <folder> is a local copy of the docs/ folder of the Agent Skills repository, kept outside this one.
import { writeFileSync } from 'node:fs';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { corpusShingles, shingleHash, CORPUS_ENV, HASH_HEX, SHINGLE, SHINGLES_FILE } from './checks/copy.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = process.argv[2] ?? process.env[CORPUS_ENV];
if (!arg || !existsSync(arg)) {
  console.error(`usage: node scripts/gen-copy-shingles.mjs <folder> (or set ${CORPUS_ENV}); ${arg ? `${arg} not found` : 'no folder given'}`);
  process.exit(1);
}
const dir = resolve(arg);
const hashes = [...new Set([...corpusShingles(dir).keys()].map((s) => shingleHash(s)))].sort();
const out = { $comment: 'Truncated SHA-256 of each 10-word shingle (lowercased, punctuation stripped) in the agentskills.io docs. No source text. Regenerate: node scripts/gen-copy-shingles.mjs <folder>', shingle: SHINGLE, hex: HASH_HEX, hashes };
writeFileSync(resolve(ROOT, SHINGLES_FILE), JSON.stringify(out) + '\n');
console.log(`wrote ${SHINGLES_FILE}: ${hashes.length} hashes`);
