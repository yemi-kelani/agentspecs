import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeSite, page, check, messages } from './helpers.mjs';
import { proseBlocks, recommendationCue, scopes, sentences } from '../../scripts/checks/labels.mjs';

const R1 = '([R1](/evidence/ledger/#r1))';

test('passes linked [Evidence] claims, unlabelled description and stubs', async () => {
  const root = makeSite({
    'src/content/docs/a.md': page(`[Evidence] One ${R1}. Plain description.\n\n- [Evidence] Two ${R1}.\n\n| [Evidence] Three ${R1}. |\n|---|\n`),
    'src/content/docs/b.md': page('A page with no label at all.'),
    'src/content/docs/stub.md': page('<!-- stub: phase 3 -->'),
    'src/content/docs/home.mdx': page('{/* <!-- stub: phase 7 --> */}'),
  });
  const r = await check('labels', root);
  assert.deepEqual(r.errors, [], messages(r));
});

test('flags near-miss tokens with their line', async () => {
  const root = makeSite({
    'src/content/docs/a.md': page(`[Evidence] ok ${R1}.\n\n[evidence] lower.\n\n[Evidence ] space.\n\n[Evidance] spelling.\n\n[ EVIDENCE ] caps.`),
  });
  const r = await check('labels', root);
  const text = messages(r);
  assert.match(text, /a\.md:8 .*\[evidence\]/);
  assert.match(text, /a\.md:10 .*\[Evidence \]/);
  assert.match(text, /\[Evidance\]/);
  assert.match(text, /\[ EVIDENCE \]/);
  assert.equal(r.errors.length, 4, text);
});

test('fails every retired token and says what to do instead', async () => {
  const root = makeSite({
    'src/content/docs/a.md': page('[Established] old.\n\n[Heuristic] old.\n\n[Proposal] old.\n\n[Judgment] old.\n\n[Judgemnt] misspelt.'),
  });
  const r = await check('labels', root);
  const text = messages(r);
  assert.match(text, /a\.md:6 retired label "\[Established\]"; use \[Evidence\]/);
  assert.match(text, /a\.md:8 retired label "\[Heuristic\]"; link a ledger row, or move the point to Open questions/);
  assert.match(text, /a\.md:10 retired label "\[Proposal\]"; link a ledger row/);
  assert.match(text, /a\.md:12 retired label "\[Judgment\]"; link a ledger row, or move the point to Open questions/);
  assert.match(text, /a\.md:14 misspelt label "\[Judgemnt\]"/);
  assert.equal(r.errors.length, 5, text);
});

test('ignores tokens in code: they neither need a row nor trip near-miss', async () => {
  const root = makeSite({
    'src/content/docs/a.md': page('Authors type `[evidence]` wrong and `[Judgment]` retired.\n\n```md\n[Evidence] x\n```'),
  });
  const r = await check('labels', root);
  assert.deepEqual(r.errors, [], messages(r));
});

test('flags a token that Markdown would turn into a link', async () => {
  const root = makeSite({
    'src/content/docs/a.md': page(`[Evidence](https://example.com/study) says so.\n\n[Evidence][ref] too.\n\n[Evidence]: https://example.com/\n\n[Evidence] fine ${R1}.`),
  });
  const r = await check('labels', root);
  const text = messages(r);
  assert.match(text, /a\.md:6 .*becomes a link/);
  assert.match(text, /a\.md:8 .*becomes a link/);
  assert.match(text, /a\.md:10 .*link definition/);
});

test('an [Evidence] scope must link a ledger row', async () => {
  const root = makeSite({
    'src/content/docs/a.md': page(
      `[Evidence] Linked ${R1}.\n\n[Evidence] Not linked, cites a [paper](https://example.com/).\n\n- [Evidence] Not linked either.\n\n| [Evidence] Cell ${R1}. | [Evidence] cell without |\n|---|---|\n`,
    ),
  });
  const r = await check('labels', root);
  const text = messages(r);
  assert.match(text, /a\.md:8 \[Evidence\] claim links no ledger row/);
  assert.match(text, /a\.md:10 \[Evidence\] claim links no ledger row/);
  assert.match(text, /a\.md:12 \[Evidence\] claim links no ledger row/);
  assert.equal(r.errors.length, 3, text);
});

test('a scope ends at the next label, so each label needs its own row link', async () => {
  const root = makeSite({ 'src/content/docs/a.md': page(`[Evidence] First ${R1}. [Evidence] Second has none.`) });
  const r = await check('labels', root);
  assert.match(messages(r), /\[Evidence\] claim links no ledger row/);
  assert.equal(r.errors.length, 1, messages(r));
});

test('a recommendation needs a row link; nothing else passes it', async () => {
  const root = makeSite({
    'src/content/docs/a.md': page(
      [
        'A plain description.',
        'Agents should keep plans short.',
        `Agents should keep plans short ${R1}.`,
        `[Evidence] A study found it ${R1}. Agents should keep plans short.`,
        'Write the checks first.',
        'The verifier runs the checks. Never edit a check.',
        'File names are a convention.',
      ].join('\n\n'),
    ),
  });
  const r = await check('labels', root);
  const text = messages(r);
  assert.match(text, /a\.md:8 recommendation \("should"\) links no ledger row/);
  assert.match(text, /a\.md:14 recommendation \(imperative "Write"\)/);
  assert.match(text, /a\.md:16 recommendation \("Never"\)/);
  assert.equal(r.errors.length, 3, text);
});

test('headings, JSX lines and callout markers are not read as recommendations', async () => {
  const root = makeSite({
    'src/content/docs/a.mdx': page(
      'A page.\n\n## Should you split a plan?\n\n<LinkCard title="Start" description="Write a plan." />\n\n:::note\nA note.\n:::',
    ),
  });
  const r = await check('labels', root);
  assert.deepEqual(r.errors, [], messages(r));
});

test('contribute, ledger and method pages are exempt from the recommendation rule', async () => {
  const root = makeSite({
    'src/content/docs/contribute.md': page('Start every claim with a label. You must cite verified sources.'),
    'src/content/docs/evidence/method.md': page('Policy.\n\nFetch the primary source and never cite a summary.'),
  });
  const r = await check('labels', root);
  assert.deepEqual(r.errors, [], messages(r));
});

test('helpers: blocks, scopes, sentences and cues', () => {
  const blocks = proseBlocks('Para one.\nstill one.\n\n- item\n  more\n- next\n\n| a | b |\n|---|---|\n| c | d |\n\n## Head');
  assert.deepEqual(blocks.map((b) => b.text.trim()), ['Para one.\nstill one.', '- item\n  more', '- next', 'a', 'b', 'c', 'd']);
  const [s0, s1] = scopes({ text: 'Lead. [Evidence] Finding.', start: 0 });
  assert.equal(s0.label, null);
  assert.equal(s1.label, 'Evidence');
  assert.deepEqual(
    sentences({ text: 'Rates fell 5.6% per step, e.g. in R3 (McMillan et al. found it). Next one.', start: 0 }).map((s) => s.text.trim()),
    ['Rates fell 5.6% per step, e.g. in R3 (McMillan et al. found it).', 'Next one.'],
  );
  assert.equal(recommendationCue('Keep it short.'), 'imperative "Keep"');
  assert.equal(recommendationCue('Keep it short.', { imperatives: false }), null);
  assert.equal(recommendationCue('- [ ] **Run** the check.'), 'imperative "Run"');
  assert.equal(recommendationCue('It is always loaded.'), '"always"');
  assert.equal(recommendationCue('Test gaming rose.'), null);
});
