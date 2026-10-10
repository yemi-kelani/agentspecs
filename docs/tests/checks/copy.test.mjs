import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { makeSite, page, check, messages } from './helpers.mjs';

// A local copy of the agentskills.io docs, outside the site, named by AGENTSPECS_COPY_CORPUS.
const withCorpus = (root) => ({ env: { ...process.env, AGENTSPECS_COPY_CORPUS: join(root, '../corpus') } });

const SOURCE = 'Some upstream text. The quick brown fox jumps over the lazy dog near the river bank today.\n';

test('flags a shared 10-word shingle, ignoring case and punctuation', async () => {
  const root = makeSite({
    '../corpus/page.mdx': SOURCE,
    'src/content/docs/a.md': page('[Proposal] Ours: the QUICK brown fox, jumps over the lazy dog near the... other stuff.'),
  });
  const r = await check('copy', root, withCorpus(root));
  assert.equal(r.errors.length, 1, messages(r));
  assert.match(messages(r), /a\.md.*the quick brown fox jumps over the lazy dog near/);
});

test('passes a 9-word overlap', async () => {
  const root = makeSite({
    '../corpus/page.mdx': SOURCE,
    'src/content/docs/a.md': page('[Proposal] Here: quick brown fox jumps over the lazy dog near. Then something else entirely.'),
  });
  const r = await check('copy', root, withCorpus(root));
  assert.deepEqual(r.errors, [], messages(r));
});

test('scans nested .mdx files only', async () => {
  const root = makeSite({
    '../corpus/sub/deep.mdx': SOURCE,
    '../corpus/notes.txt': 'alpha beta gamma delta epsilon zeta eta theta iota kappa',
    'src/content/docs/a.md': page('[Proposal] alpha beta gamma delta epsilon zeta eta theta iota kappa. The quick brown fox jumps over the lazy dog near the river.'),
  });
  const r = await check('copy', root, withCorpus(root));
  assert.equal(r.errors.length, 1, messages(r));
  assert.match(messages(r), /quick brown fox/);
});

test('without AGENTSPECS_COPY_CORPUS, uses the committed shingle hashes (not a warning-only skip)', async () => {
  const root = makeSite({ 'src/content/docs/a.md': page('[Proposal] x') });
  const r = await check('copy', root);
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.warnings, []);
});

test('a corpus setting that points nowhere is an error, not a silent fallback', async () => {
  const root = makeSite({ 'src/content/docs/a.md': page('[Proposal] x') });
  const r = await check('copy', root, withCorpus(root));
  assert.equal(r.errors.length, 1, messages(r));
  assert.match(messages(r), /AGENTSPECS_COPY_CORPUS/);
});
