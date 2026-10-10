import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeSite, check, messages } from './helpers.mjs';

test('flags a spec set under work/ that breaks the Specification', async () => {
  const root = makeSite({ 'work/demo/plan.md': '# Demo — plan\n\n## Goal\nShip.\n' });
  const r = await check('specsets', root);
  assert.match(messages(r), /demo\/plan\.md: missing section "Non-goals"/);
  assert.match(messages(r), /demo\/state\.json is missing/);
});

test('passes when there is no work/ folder', async () => {
  const r = await check('specsets', makeSite({}));
  assert.deepEqual(r.errors, [], messages(r));
});
