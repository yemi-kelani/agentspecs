import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeSite, page, check, messages } from './helpers.mjs';

const lines = (n) => Array.from({ length: n }, (_, i) => `[Proposal] Line ${i}.`).join('\n');

test('fails pages over the 120-line budget', async () => {
  const root = makeSite({ 'src/content/docs/long.md': page(lines(130)) });
  const r = await check('length', root);
  assert.equal(r.errors.length, 1, messages(r));
  assert.match(messages(r), /long\.md.*1[34]\d lines.*120/);
});

test('passes pages within budget and exempt pages', async () => {
  const root = makeSite({
    'src/content/docs/short.md': page(lines(50)),
    'src/content/docs/specification.md': page(lines(300)),
    'src/content/docs/reference/templates.md': page(lines(300)),
    'src/content/docs/evidence.md': page(lines(300)),
    'src/content/docs/quickstart.md': page(lines(300)),
  });
  const r = await check('length', root);
  assert.deepEqual(r.errors, [], messages(r));
});
