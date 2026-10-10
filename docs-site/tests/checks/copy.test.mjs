import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeSite, page, check, messages } from './helpers.mjs';

const SOURCE = 'Some upstream text. The quick brown fox jumps over the lazy dog near the river bank today.\n';

test('flags a shared 10-word shingle, ignoring case and punctuation', async () => {
  const root = makeSite({
    '../research/agentskills/docs/page.mdx': SOURCE,
    'src/content/docs/a.md': page('[Proposal] Ours: the QUICK brown fox, jumps over the lazy dog near the... other stuff.'),
  });
  const r = await check('copy', root);
  assert.equal(r.errors.length, 1, messages(r));
  assert.match(messages(r), /a\.md.*the quick brown fox jumps over the lazy dog near/);
});

test('passes a 9-word overlap', async () => {
  const root = makeSite({
    '../research/agentskills/docs/page.mdx': SOURCE,
    'src/content/docs/a.md': page('[Proposal] Here: quick brown fox jumps over the lazy dog near. Then something else entirely.'),
  });
  const r = await check('copy', root);
  assert.deepEqual(r.errors, [], messages(r));
});

test('scans nested .mdx files only', async () => {
  const root = makeSite({
    '../research/agentskills/docs/sub/deep.mdx': SOURCE,
    '../research/agentskills/docs/notes.txt': 'alpha beta gamma delta epsilon zeta eta theta iota kappa',
    'src/content/docs/a.md': page('[Proposal] alpha beta gamma delta epsilon zeta eta theta iota kappa. The quick brown fox jumps over the lazy dog near the river.'),
  });
  const r = await check('copy', root);
  assert.equal(r.errors.length, 1, messages(r));
  assert.match(messages(r), /quick brown fox/);
});

test('falls back to the committed shingle hashes (not a warning-only skip) when the research directory is absent', async () => {
  const root = makeSite({ 'src/content/docs/a.md': page('[Proposal] x') });
  const r = await check('copy', root);
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.warnings, []);
});
