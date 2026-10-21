import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeSite, page, check, messages } from './helpers.mjs';
import { proseBlocks, recommendationCue, scopes, sentences } from '../../scripts/checks/labels.mjs';

const R1 = '([R1](/evidence/ledger/#r1))';

test('passes exact tokens, contribute.md without labels and stubs', async () => {
  const root = makeSite({
    'src/content/docs/a.md': page(`[Evidence] One ${R1}. [Proposal] Two ${R1}.\n\n- [Judgment] Three.\n\n| [Judgment] Four. |\n|---|\n`),
    'src/content/docs/contribute.md': page('No labels needed here.'),
    'src/content/docs/stub.md': page('<!-- stub: phase 3 -->'),
    'src/content/docs/home.mdx': page('{/* <!-- stub: phase 7 --> */}'),
  });
  const r = await check('labels', root);
  assert.deepEqual(r.errors, [], messages(r));
});

test('flags near-miss tokens with their line', async () => {
  const root = makeSite({
    'src/content/docs/a.md': page('[Judgment] ok.\n\n[evidence] lower.\n\n[Judgment ] space.\n\n[Judgement] spelling.\n\n[ PROPOSAL ] caps.'),
  });
  const r = await check('labels', root);
  const text = messages(r);
  assert.match(text, /a\.md:8 .*\[evidence\]/);
  assert.match(text, /a\.md:10 .*\[Judgment \]/);
  assert.match(text, /\[Judgement\]/);
  assert.match(text, /\[ PROPOSAL \]/);
  assert.equal(r.errors.length, 4, text);
});

test('fails the retired v0.1 tokens and names their replacement', async () => {
  const root = makeSite({ 'src/content/docs/a.md': page('[Judgment] ok.\n\n[Established] old.\n\n[Heuristic] old.') });
  const r = await check('labels', root);
  const text = messages(r);
  assert.match(text, /a\.md:8 retired label "\[Established\]"; use \[Evidence\]/);
  assert.match(text, /a\.md:10 retired label "\[Heuristic\]"; use \[Judgment\]/);
  assert.equal(r.errors.length, 2, text);
});

test('fails a non-stub page with no label', async () => {
  const root = makeSite({ 'src/content/docs/practices/x.md': page('A claim without a label.') });
  const r = await check('labels', root);
  assert.match(messages(r), /practices\/x\.md.*no label token/);
});

test('ignores tokens in code: they neither count nor trip near-miss', async () => {
  const root = makeSite({
    'src/content/docs/a.md': page('Write `[evidence]` wrong and `[Judgment]` right.\n\n```md\n[Evidence] x\n```'),
  });
  const r = await check('labels', root);
  assert.match(messages(r), /no label token/);
  assert.doesNotMatch(messages(r), /near-miss/);
});

test('flags a token that Markdown would turn into a link', async () => {
  const root = makeSite({
    'src/content/docs/a.md': page('[Evidence](https://example.com/study) says so.\n\n[Proposal][ref] too.\n\n[Judgment]: https://example.com/\n\n[Judgment] fine.'),
  });
  const r = await check('labels', root);
  const text = messages(r);
  assert.match(text, /a\.md:6 .*becomes a link/);
  assert.match(text, /a\.md:8 .*becomes a link/);
  assert.match(text, /a\.md:10 .*link definition/);
});

test('an [Evidence] or [Proposal] scope must link a ledger row', async () => {
  const root = makeSite({
    'src/content/docs/a.md': page(
      `[Evidence] Linked ${R1}.\n\n[Evidence] Not linked, cites a [paper](https://example.com/).\n\n- [Proposal] Not linked either.\n\n| [Proposal] Cell ${R1}. | [Evidence] cell without |\n|---|---|\n`,
    ),
  });
  const r = await check('labels', root);
  const text = messages(r);
  assert.match(text, /a\.md:8 \[Evidence\] claim links no ledger row/);
  assert.match(text, /a\.md:10 \[Proposal\] claim links no ledger row/);
  assert.match(text, /a\.md:12 \[Evidence\] claim links no ledger row/);
  assert.equal(r.errors.length, 3, text);
});

test('a scope ends at the next label, so each label needs its own row link', async () => {
  const root = makeSite({ 'src/content/docs/a.md': page(`[Evidence] First ${R1}. [Proposal] Second has none.`) });
  const r = await check('labels', root);
  assert.match(messages(r), /\[Proposal\] claim links no ledger row/);
  assert.equal(r.errors.length, 1, messages(r));
});

test('a recommendation needs a row link or a [Judgment] label', async () => {
  const root = makeSite({
    'src/content/docs/a.md': page(
      [
        '[Judgment] Labelled page.',
        'Agents should keep plans short.',
        `Agents should keep plans short ${R1}.`,
        '[Judgment] Agents should keep plans short.',
        'Write the checks first.',
        'The verifier runs the checks. Never edit a check.',
        'File names are a design choice.',
      ].join('\n\n'),
    ),
  });
  const r = await check('labels', root);
  const text = messages(r);
  assert.match(text, /a\.md:8 recommendation \("should"\)/);
  assert.match(text, /a\.md:14 recommendation \(imperative "Write"\)/);
  assert.match(text, /a\.md:16 recommendation \("Never"\)/);
  assert.equal(r.errors.length, 3, text);
});

test('headings, JSX lines and callout markers are not read as recommendations', async () => {
  const root = makeSite({
    'src/content/docs/a.mdx': page(
      '[Judgment] Labelled page.\n\n## Should you split a plan?\n\n<LinkCard title="Start" description="Write a packet." />\n\n:::note\n[Judgment] A note.\n:::',
    ),
  });
  const r = await check('labels', root);
  assert.deepEqual(r.errors, [], messages(r));
});

test('the Quickstart may use imperative steps; modal cues still count there', async () => {
  const root = makeSite({
    'src/content/docs/quickstart.md': page('[Judgment] Labelled.\n\n1. Run the tests.\n2. Fill the plan.\n\nYou should never skip the review.'),
  });
  const r = await check('labels', root);
  const text = messages(r);
  assert.match(text, /quickstart\.md:11 recommendation \("should"\)/);
  assert.equal(r.errors.length, 1, text);
});

test('contribute, ledger and method pages are exempt from the recommendation rule', async () => {
  const root = makeSite({
    'src/content/docs/contribute.md': page('Start every claim with a label. You must cite verified sources.'),
    'src/content/docs/evidence/method.md': page('[Judgment] Policy.\n\nFetch the primary source and never cite a summary.'),
  });
  const r = await check('labels', root);
  assert.deepEqual(r.errors, [], messages(r));
});

test('helpers: blocks, scopes, sentences and cues', () => {
  const blocks = proseBlocks('Para one.\nstill one.\n\n- item\n  more\n- next\n\n| a | b |\n|---|---|\n| c | d |\n\n## Head');
  assert.deepEqual(blocks.map((b) => b.text.trim()), ['Para one.\nstill one.', '- item\n  more', '- next', 'a', 'b', 'c', 'd']);
  const [s0, s1] = scopes({ text: 'Lead. [Judgment] Choice.', start: 0 });
  assert.equal(s0.label, null);
  assert.equal(s1.label, 'Judgment');
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
