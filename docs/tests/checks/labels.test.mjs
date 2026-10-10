import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeSite, page, check, messages } from './helpers.mjs';

test('passes exact tokens, contribute.md without labels and stubs', async () => {
  const root = makeSite({
    'src/content/docs/a.md': page('[Established] One. [Evidence] Two.\n\n- [Heuristic] Three.\n\n| [Proposal] Four. |\n|---|\n'),
    'src/content/docs/contribute.md': page('No labels needed here.'),
    'src/content/docs/stub.md': page('<!-- stub: phase 3 -->'),
    'src/content/docs/home.mdx': page('{/* <!-- stub: phase 7 --> */}'),
  });
  const r = await check('labels', root);
  assert.deepEqual(r.errors, [], messages(r));
});

test('flags near-miss tokens with their line', async () => {
  const root = makeSite({
    'src/content/docs/a.md': page('[Proposal] ok.\n\n[established] lower.\n\n[Heuristic ] space.\n\n[Heuristics] plural.\n\n[ PROPOSAL ] caps.'),
  });
  const r = await check('labels', root);
  const text = messages(r);
  assert.match(text, /a\.md:8 .*\[established\]/);
  assert.match(text, /a\.md:10 .*\[Heuristic \]/);
  assert.match(text, /\[Heuristics\]/);
  assert.match(text, /\[ PROPOSAL \]/);
  assert.equal(r.errors.length, 4);
});

test('fails a non-stub page with no label', async () => {
  const root = makeSite({ 'src/content/docs/concepts/x.md': page('A claim without a label.') });
  const r = await check('labels', root);
  assert.match(messages(r), /concepts\/x\.md.*no label token/);
});

test('ignores tokens in code: they neither count nor trip near-miss', async () => {
  const root = makeSite({
    'src/content/docs/a.md': page('Write `[established]` wrong and `[Proposal]` right.\n\n```md\n[Evidence] x\n```'),
  });
  const r = await check('labels', root);
  assert.equal(r.errors.length, 1, messages(r));
  assert.match(messages(r), /no label token/);
});

test('flags a token that Markdown would turn into a link', async () => {
  const root = makeSite({
    'src/content/docs/a.md': page('[Evidence](https://example.com/study) says so.\n\n[Proposal][ref] too.\n\n[Heuristic]: https://example.com/\n\n[Established] fine.'),
  });
  const r = await check('labels', root);
  const text = messages(r);
  assert.match(text, /a\.md:6 .*becomes a link/);
  assert.match(text, /a\.md:8 .*becomes a link/);
  assert.match(text, /a\.md:10 .*link definition/);
});
