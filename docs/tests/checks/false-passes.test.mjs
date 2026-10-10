// Regression tests for false passes found in the final review (findings 5a–5f).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { makeSite, page, check, messages } from './helpers.mjs';
import { runChecks } from '../../scripts/checks/run.mjs';

test('5a: a stray backtick does not hide later paragraphs from the citations check', async () => {
  const body = [
    '[Proposal] A stray ` backtick here.',
    '',
    '[Evidence] Uncited claim ([study](https://uncited.example/study)).',
    '',
    '[Proposal] Real code later: `npm test`.',
  ].join('\n');
  const r = await check('citations', makeSite({ 'src/content/docs/a.md': page(body) }));
  assert.match(messages(r), /uncited\.example/);
});

test('5b: misspelt labels are flagged', async () => {
  const body = '[Heurstic] One.\n\n[Evidense] Two.\n\n[Proposal] Fine. See [Note] and [Example] text.';
  const r = await check('labels', makeSite({ 'src/content/docs/a.md': page(body) }));
  const text = messages(r);
  assert.match(text, /\[Heurstic\]/);
  assert.match(text, /\[Evidense\]/);
  assert.equal(r.errors.length, 2, text);
});

test('5c: uppercase scheme, protocol-relative and www. links must be cited too', async () => {
  const body = [
    '[Proposal] See [a](HTTPS://upper.example/a).',
    '',
    '[Proposal] See [b](//relative.example/b).',
    '',
    '[Proposal] See www.bare.example/c for more.',
  ].join('\n');
  const r = await check('citations', makeSite({ 'src/content/docs/a.md': page(body) }));
  const text = messages(r);
  assert.match(text, /upper\.example/i);
  assert.match(text, /relative\.example/);
  assert.match(text, /bare\.example/);
});

test('5c: an uppercase-scheme link to a verified source passes', async () => {
  const evidence = JSON.stringify({ sources: [{ url: 'https://ok.example/a', status: 'verified' }], claims: [] });
  const r = await check(
    'citations',
    makeSite({ 'src/data/evidence.json': evidence, 'src/content/docs/a.md': page('[Proposal] [a](HTTPS://ok.example/a).') }),
  );
  assert.deepEqual(r.errors, [], messages(r));
});

test('5d: long blockquotes and long curly single-quoted spans are flagged', async () => {
  const words = Array.from({ length: 20 }, (_, i) => `word${i}`).join(' ');
  const body = `[Proposal] Intro.\n\n> ${words}\n\n[Proposal] Then ‘${words}’ here, and it's fine to use apostrophes.`;
  const r = await check('quotes', makeSite({ 'src/content/docs/a.md': page(body) }));
  assert.equal(r.errors.length, 2, messages(r));
});

test('5d: short blockquotes pass', async () => {
  const r = await check('quotes', makeSite({ 'src/content/docs/a.md': page('[Proposal] Intro.\n\n> A short aside.') }));
  assert.deepEqual(r.errors, [], messages(r));
});

test('5e: the copy check works from committed shingle hashes when no corpus is set', async () => {
  const words = 'alpha beta gamma delta epsilon zeta eta theta iota kappa';
  const h = createHash('sha256').update(words).digest('hex').slice(0, 12);
  const root = makeSite({
    'src/data/copy-shingles.json': JSON.stringify({ shingle: 10, hex: 12, hashes: [h] }),
    'src/content/docs/a.md': page(`[Proposal] Alpha, beta gamma delta epsilon zeta eta theta iota kappa.`),
  });
  const r = await check('copy', root);
  assert.equal(r.errors.length, 1, messages(r));
});

test('5e: the copy check fails when there is no corpus setting and no shingle hashes', async () => {
  const r = await check('copy', makeSite({ 'src/data/copy-shingles.json': null, 'src/content/docs/a.md': page('[Proposal] Fine.') }));
  assert.equal(r.errors.length, 1, messages(r));
  assert.match(messages(r), /copy-shingles\.json/);
});

test('5f: an unknown --only check name is an error, not a silent pass', async () => {
  await assert.rejects(runChecks({ root: makeSite({}), only: ['citatoins'] }), /unknown check/i);
});
