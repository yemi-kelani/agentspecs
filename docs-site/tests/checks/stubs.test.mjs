import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeSite, page, check, messages } from './helpers.mjs';

const files = {
  'src/content/docs/a.md': page('<!-- stub: phase 3 -->'),
  'src/content/docs/index.mdx': page('{/* <!-- stub: phase 7 --> */}'),
  'src/content/docs/done.md': page('[Proposal] Real content mentions `<!-- stub: phase N -->` in code only.'),
};

test('fails pages that still carry a stub marker', async () => {
  const r = await check('stubs', makeSite(files));
  const text = messages(r);
  assert.equal(r.errors.length, 2, text);
  assert.match(text, /a\.md:6 .*stub/);
  assert.match(text, /index\.mdx:6 .*stub/);
});

test('is skipped with --allow-stubs', async () => {
  const r = await check('stubs', makeSite(files), { allowStubs: true });
  assert.deepEqual(r.errors, []);
  assert.ok(r.skipped);
});
