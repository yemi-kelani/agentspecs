#!/usr/bin/env node
// Write src/data/copy-shingles.json: truncated SHA-256 hashes of every 10-word shingle in the
// agentskills.io docs (../research/agentskills/docs, git-ignored). The file holds no source text,
// so the copy check runs on fresh clones and in CI. Run from docs-site/ when the corpus changes.
import { writeFileSync } from 'node:fs';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { corpusShingles, shingleHash, HASH_HEX, RESEARCH_DIR, SHINGLE, SHINGLES_FILE } from './checks/copy.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = resolve(ROOT, RESEARCH_DIR);
if (!existsSync(dir)) {
  console.error(`${RESEARCH_DIR} not found; nothing to hash`);
  process.exit(1);
}
const hashes = [...new Set([...corpusShingles(dir).keys()].map((s) => shingleHash(s)))].sort();
const out = { $comment: 'Truncated SHA-256 of each 10-word shingle (lowercased, punctuation stripped) in the agentskills.io docs. No source text. Regenerate: node scripts/gen-copy-shingles.mjs', shingle: SHINGLE, hex: HASH_HEX, hashes };
writeFileSync(resolve(ROOT, SHINGLES_FILE), JSON.stringify(out) + '\n');
console.log(`wrote ${SHINGLES_FILE}: ${hashes.length} hashes`);
