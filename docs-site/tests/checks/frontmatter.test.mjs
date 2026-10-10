import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeSite, check, messages } from './helpers.mjs';

const fm = (lines) => `---\n${lines.join('\n')}\n---\n\nBody [Proposal] x.\n`;

test('passes a page with a short title and a one-sentence description', async () => {
  const root = makeSite({
    'src/content/docs/a.md': fm(['title: Handoff contracts', 'description: How phases hand work to each other, e.g. via HANDOFF.md files.']),
    'src/content/docs/b.mdx': fm(['title: "Overview"', "description: 'Agent Specs v0.1 (draft) in one page.'"]),
  });
  const r = await check('frontmatter', root);
  assert.deepEqual(r.errors, [], messages(r));
});

test('fails on missing or long title', async () => {
  const root = makeSite({
    'src/content/docs/missing.md': fm(['description: Fine.']),
    'src/content/docs/long.md': fm(['title: ' + 'x'.repeat(61), 'description: Fine.']),
  });
  const r = await check('frontmatter', root);
  const text = messages(r);
  assert.match(text, /missing\.md.*title is missing/);
  assert.match(text, /long\.md.*title is 61 chars/);
});

test('fails on missing, multi-sentence or unterminated description', async () => {
  const root = makeSite({
    'src/content/docs/none.md': fm(['title: A']),
    'src/content/docs/two.md': fm(['title: B', 'description: First sentence. Second sentence.']),
    'src/content/docs/question.md': fm(['title: C', 'description: Is this one? Yes it is.']),
    'src/content/docs/noperiod.md': fm(['title: D', 'description: No period at the end']),
  });
  const r = await check('frontmatter', root);
  const text = messages(r);
  assert.match(text, /none\.md.*description is missing/);
  assert.match(text, /two\.md.*exactly one sentence/);
  assert.match(text, /question\.md.*exactly one sentence/);
  assert.match(text, /noperiod\.md.*end with a period/);
});

test('fails on a file without frontmatter or with invalid YAML', async () => {
  const root = makeSite({
    'src/content/docs/bare.md': 'Just text.\n',
    'src/content/docs/bad.md': '---\ntitle: [unclosed\n---\n',
  });
  const r = await check('frontmatter', root);
  const text = messages(r);
  assert.match(text, /bare\.md.*no frontmatter/);
  assert.match(text, /bad\.md.*invalid YAML/);
});
