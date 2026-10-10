import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { makeSite, page, check, messages, termsFile } from './helpers.mjs';

// The real list lives outside the repository. These dummy terms stand in for it.
const TERMS = termsFile('# dummy terms\nZorblax\n\nAcme\nWidget Pro\n');
const env = { AGENTSPECS_BANNED_TERMS: TERMS };

test('flags terms and multi-word terms anywhere in the site tree, case-sensitive', async () => {
  const root = makeSite({
    'src/content/docs/a.md': page('Built at Zorblax-branded labs.'),
    'work/task/plan.md': '# Plan\n\nUses Acme tooling.\n',
    'scripts/notes.md': 'The Widget Pro build.\n',
  });
  const r = await check('banned', root, { env });
  const text = messages(r);
  assert.equal(r.errors.length, 3, text);
  assert.match(text, /src\/content\/docs\/a\.md:6/);
  assert.match(text, /work\/task\/plan\.md:3/);
  assert.match(text, /scripts\/notes\.md:1/);
});

test('messages never print the matched term, only its line in the list', async () => {
  const root = makeSite({ 'src/content/docs/a.md': page('Zorblax and Widget Pro.') });
  const r = await check('banned', root, { env });
  assert.equal(r.errors.length, 2);
  assert.doesNotMatch(messages(r), /Zorblax|Widget/);
  assert.match(messages(r), /term on line 2 of the list/);
  assert.match(messages(r), /term on line 5 of the list/);
});

test('ignores other casing, longer words, split multi-word terms and binary files', async () => {
  const root = makeSite({
    'src/content/docs/a.md': page('zorblax Zorblaxes AcmeCorp Widget\nPro Widget  Pro'),
    'public/img.png': Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0, ...Buffer.from('Zorblax')]),
  });
  const r = await check('banned', root, { env });
  assert.deepEqual(r.errors, [], messages(r));
});

test('fails when the term list is missing, and names the setting', async () => {
  const root = makeSite({ 'src/content/docs/a.md': page('[Proposal] Fine.') });
  const r = await check('banned', root, { env: { AGENTSPECS_BANNED_TERMS: join(dirname(TERMS), 'nope.txt') } });
  assert.equal(r.errors.length, 1, messages(r));
  assert.match(messages(r), /AGENTSPECS_BANNED_TERMS/);
});

test('without the setting, reads the default list in the home folder', async () => {
  const home = dirname(termsFile(''));
  const root = makeSite({ 'src/content/docs/a.md': page('Acme.') });
  const missing = await check('banned', root, { env: { HOME: home } });
  assert.match(messages(missing), /\.config\/agentspecs\/banned-terms\.txt/);
  mkdirSync(join(home, '.config/agentspecs'), { recursive: true });
  writeFileSync(join(home, '.config/agentspecs/banned-terms.txt'), 'Acme\n');
  const found = await check('banned', root, { env: { HOME: home } });
  assert.equal(found.errors.length, 1, messages(found));
});

test('"off" skips the scan with a warning instead of an error', async () => {
  const root = makeSite({ 'src/content/docs/a.md': page('Zorblax.') });
  const r = await check('banned', root, { env: { AGENTSPECS_BANNED_TERMS: 'off' } });
  assert.deepEqual(r.errors, []);
  assert.match(r.warnings.join('\n'), /skipped/);
});

test('in a git repository, scans every publishable file in the repo and skips ignored ones', async () => {
  const root = makeSite({ 'src/content/docs/a.md': page('[Proposal] Fine.') });
  const repo = dirname(root);
  const write = (rel, text) => {
    mkdirSync(dirname(join(repo, rel)), { recursive: true });
    writeFileSync(join(repo, rel), text);
  };
  write('.gitignore', 'private/\n');
  write('BRIEF.md', 'Origin: an Acme talk.\n');
  write('private/slides.md', 'Zorblax internal.\n');
  assert.equal(spawnSync('git', ['init', '-q'], { cwd: repo }).status, 0);
  const r = await check('banned', root, { env });
  const text = messages(r);
  assert.equal(r.errors.length, 1, text);
  assert.match(text, /BRIEF\.md:1/);
});

test('a copy of the term list inside the repository flags itself', async () => {
  const root = makeSite({ 'src/data/terms.txt': 'Zorblax\nAcme\n' });
  const r = await check('banned', root, { env });
  assert.equal(r.errors.length, 2, messages(r));
});
