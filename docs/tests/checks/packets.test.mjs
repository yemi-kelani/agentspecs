import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeSite, check, messages } from './helpers.mjs';

test('flags a packet under packets/ that breaks the packet format', async () => {
  const root = makeSite({ 'packets/demo/plan.md': '# Demo — plan\n\n## Goal\nShip.\n' });
  const r = await check('packets', root);
  assert.match(messages(r), /demo\/plan\.md: missing section "Non-goals"/);
  assert.match(messages(r), /demo\/state\.json is missing/);
});

test('passes when there is no packets/ folder', async () => {
  const r = await check('packets', makeSite({}));
  assert.deepEqual(r.errors, [], messages(r));
});

test('also checks packets in the repository root packets/ folder', async () => {
  const root = makeSite({ '../packets/root-task/plan.md': '# Root — plan\n\n## Goal\nShip.\n' });
  const r = await check('packets', root);
  assert.match(messages(r), /root-task\/plan\.md: missing section "Non-goals"/);
});
