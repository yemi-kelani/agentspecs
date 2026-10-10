import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeSite, page, check, messages } from './helpers.mjs';

const PLAN = '# Plan\n\n```sh\nnpm test\n```\n';
const STATE = '{ "phase": 1 }\n';

test('skips stub pages', async () => {
  const root = makeSite({
    'public/templates/plan.md': PLAN,
    'src/content/docs/reference/templates.md': page('<!-- stub: phase 3 -->'),
    'src/content/docs/quickstart.md': page('<!-- stub: phase 5 -->'),
  });
  const r = await check('templates', root);
  assert.deepEqual(r.errors, [], messages(r));
});

test('passes when every template is embedded byte-for-byte (longer fence around inner fence)', async () => {
  const root = makeSite({
    'public/templates/plan.md': PLAN,
    'public/templates/state.json': STATE,
    'src/content/docs/reference/templates.md': page('[Proposal] x\n\n````md title="plan.md"\n' + PLAN + '````\n\n~~~json\n' + STATE + '~~~'),
    'src/content/docs/quickstart.md': page('[Proposal] Copy `plan.md` and `state.json`.'),
  });
  const r = await check('templates', root);
  assert.deepEqual(r.errors, [], messages(r));
});

test('fails when a template is missing or altered in templates.md', async () => {
  const root = makeSite({
    'public/templates/plan.md': PLAN,
    'public/templates/state.json': STATE,
    'src/content/docs/reference/templates.md': page('````md\n' + PLAN.replace('npm test', 'npm  test') + '````'),
  });
  const r = await check('templates', root);
  const text = messages(r);
  assert.match(text, /templates\.md.*plan\.md/);
  assert.match(text, /templates\.md.*state\.json/);
  assert.equal(r.errors.length, 2);
});

test('fails when quickstart does not name every template file', async () => {
  const root = makeSite({
    'public/templates/plan.md': PLAN,
    'public/templates/SKILL.md': '---\nname: x\n---\n',
    'src/content/docs/quickstart.md': page('[Proposal] Copy plan.md only.'),
  });
  const r = await check('templates', root);
  assert.match(messages(r), /quickstart\.md.*SKILL\.md/);
  assert.equal(r.errors.length, 1);
});

test('passes with a warning when public/templates is absent or empty', async () => {
  const root = makeSite({
    'src/content/docs/reference/templates.md': page('[Proposal] No templates yet.'),
    'src/content/docs/quickstart.md': page('[Proposal] Nothing to name.'),
  });
  const r = await check('templates', root);
  assert.deepEqual(r.errors, []);
  assert.match(r.warnings.join('\n'), /public\/templates/);
});
