// Tests for scripts/gen-evidence.mjs and the `generated` check that runs it in --check mode.
// Run: npm test (or node --test scripts/gen-evidence.test.mjs)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeSite, page, check, messages } from '../tests/checks/helpers.mjs';
import { END, START, renderGenerated, replaceRegion } from './gen-evidence.mjs';

const GEN = fileURLToPath(new URL('./gen-evidence.mjs', import.meta.url));
const PAGE = 'src/content/docs/evidence.md';

const SOURCES = [
  { id: 's-study', title: 'A study | with a pipe', authors: 'Ada One, Bo Two, Cy Three', date: '2026-01-02', url: 'https://example.org/study', verified: '2026-10-09', status: 'verified' },
  { id: 's-vendor', title: 'Vendor docs', authors: 'Vendor', date: '2026-10', url: 'https://example.com/docs', verified: '2026-10-09', status: 'verified' },
  { id: 's-gone', title: 'Lost talk', authors: 'Someone', date: '', url: 'https://example.net/talk', verified: '2026-10-09', status: 'unreachable' },
];

const claim = (o) => ({ quote: '', caveat: '', drop_reason: '', status: 'verified', verified: '2026-10-09', ...o });
const CLAIMS = [
  claim({ id: 'c-sizing', claim: 'Short files under .kiro/specs/<name>/ carry a [P] marker at ~40%.', label: 'Established', sources: ['s-vendor'], url: 'https://example.com/docs', caveat: 'Vendor guidance only.', topics: ['sizing', 'skills'], quote: 'Keep it short.' }),
  claim({ id: 'b-rot', claim: 'Accuracy fell as input grew.', label: 'Evidence', sources: ['s-study', 's-vendor'], url: 'https://example.org/study', caveat: 'Synthetic tasks.', topics: ['context-limits'], quote: 'performance grows less reliable' }),
  claim({ id: 'b-rot-2', claim: 'A second finding from the same study.', label: 'Evidence', sources: ['s-study'], url: 'https://example.org/study', caveat: 'Same study.', topics: ['context-limits'], quote: 'a second quote from the same source' }),
  claim({ id: 'a-long-quote', claim: 'A vendor rule.', label: 'Heuristic', sources: ['s-vendor'], url: 'https://example.com/docs', caveat: 'Not measured.', topics: ['skills'], quote: 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen' }),
  claim({ id: 'x-orphan', claim: 'Rests only on an unreachable source.', label: 'Heuristic', sources: ['s-gone'], url: 'https://example.net/talk', caveat: 'n/a', topics: ['skills'] }),
  claim({ id: 'd-gone', claim: 'A claim we could not support.', label: 'Established', sources: ['s-vendor'], url: 'https://example.com/docs', status: 'dropped', drop_reason: 'The source does not say this.', topics: ['sizing'], quote: 'dropped claims never quoted' }),
];

const EVIDENCE = { generated: '2026-10-09', labels: {}, sources: SOURCES, claims: CLAIMS };

const HEAD = '---\ntitle: Evidence\ndescription: One sentence.\n---\n\n## Labels\n\n[Proposal] Hand-written part.\n\n';
const TAIL = '\nHand-written footer.\n';
const stalePage = () => `${HEAD}${START}\nold generated text\n${END}\n${TAIL}`;

function site(pageText = stalePage(), evidence = EVIDENCE) {
  return makeSite({ 'src/data/evidence.json': JSON.stringify(evidence), [PAGE]: pageText });
}

function gen(root, ...args) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const r = spawnSync(process.execPath, [GEN, '--root', root, ...args], { encoding: 'utf8', env });
  return { code: r.status, out: `${r.stdout}\n${r.stderr}` };
}

const region = (text) => text.slice(text.indexOf(START), text.indexOf(END) + END.length);

test('--check exits 1 on a stale evidence.md and leaves the file untouched', () => {
  const root = site();
  const before = readFileSync(join(root, PAGE), 'utf8');
  const r = gen(root, '--check');
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /stale/);
  assert.equal(readFileSync(join(root, PAGE), 'utf8'), before);
});

test('writing the region makes --check pass and keeps the hand-written text', () => {
  const root = site();
  const w = gen(root);
  assert.equal(w.code, 0, w.out);
  const after = readFileSync(join(root, PAGE), 'utf8');
  assert.ok(after.startsWith(HEAD + START), 'text above the region is unchanged');
  assert.ok(after.endsWith(END + '\n' + TAIL), 'text below the region is unchanged');
  assert.ok(!after.includes('old generated text'));
  assert.equal(gen(root, '--check').code, 0);
  // A second write is a no-op.
  assert.equal(gen(root).code, 0);
  assert.equal(readFileSync(join(root, PAGE), 'utf8'), after);
});

test('a hand edit inside the region makes --check fail again', () => {
  const root = site();
  gen(root);
  const text = readFileSync(join(root, PAGE), 'utf8');
  writeFileSync(join(root, PAGE), text.replace('Accuracy fell', 'Accuracy rose'));
  assert.equal(gen(root, '--check').code, 1);
});

test('missing or misordered markers fail in both modes', () => {
  for (const text of [page('[Proposal] No markers.'), `${HEAD}${END}\n${START}\n`]) {
    const root = site(text);
    for (const args of [[], ['--check']]) {
      const r = gen(root, ...args);
      assert.equal(r.code, 1, r.out);
      assert.match(r.out, /evidence:generated/);
    }
  }
});

test('output is deterministic: input order does not matter', () => {
  const shuffled = { ...EVIDENCE, sources: [...SOURCES].reverse(), claims: [CLAIMS[3], CLAIMS[0], CLAIMS[5], CLAIMS[2], CLAIMS[4], CLAIMS[1]] };
  assert.equal(renderGenerated(shuffled), renderGenerated(EVIDENCE));
  assert.equal(renderGenerated(EVIDENCE), renderGenerated(structuredClone(EVIDENCE)));
});

test('verified claims are grouped under their first topic with label, linked source and caveat', () => {
  const out = renderGenerated(EVIDENCE);
  const ctx = out.indexOf('### Context limits');
  const sizing = out.indexOf('### Sizing');
  assert.ok(ctx > -1 && sizing > ctx, 'topics appear in the fixed order');
  assert.match(out, /^- \[Evidence\] Accuracy fell as input grew\. .*\(https:\/\/example\.org\/study\).*Caveat: Synthetic tasks\./m);
  // Secondary sources are linked too, primary (claim.url) first.
  assert.match(out, /Accuracy fell.*example\.org\/study.*example\.com\/docs/);
  // A claim is listed once, under its first topic only.
  assert.equal(out.split('Short files under').length, 2);
  // Each claim ends with its id, so drop reasons that name ids can be followed.
  assert.match(out, /Caveat: Synthetic tasks\. `b-rot`$/m);
});

test('within a topic, claims sort by label, then by source, then by id', () => {
  const extra = claim({ id: 'a-first', claim: 'Another vendor finding.', label: 'Evidence', sources: ['s-vendor'], url: 'https://example.com/docs', caveat: 'Vendor.', topics: ['context-limits'] });
  const out = renderGenerated({ ...EVIDENCE, claims: [...CLAIMS, extra] });
  const ctx = out.slice(out.indexOf('### Context limits'), out.indexOf('### Sizing'));
  const order = ['b-rot`', 'b-rot-2`', 'a-first`'].map((id) => ctx.indexOf(id));
  assert.ok(order.every((i) => i > -1), ctx);
  assert.deepEqual([...order].sort((a, b) => a - b), order, 'same-source claims stay together; s-study sorts before s-vendor');
});

test('excludes dropped claims and claims without a verified source from the claim list', () => {
  const out = renderGenerated(EVIDENCE);
  const claimsPart = out.slice(0, out.indexOf('## Sources'));
  assert.ok(!claimsPart.includes('A claim we could not support'));
  assert.ok(!out.includes('Rests only on an unreachable source'));
  assert.ok(!out.includes('https://example.net/talk'), 'unverified source URLs are never linked');
});

test('lists dropped claims with their reason, unlabelled and unlinked', () => {
  const out = renderGenerated(EVIDENCE);
  const dropped = out.slice(out.indexOf('## Dropped claims'));
  assert.match(dropped, /A claim we could not support\..*The source does not say this\. `d-gone`$/m);
  assert.ok(!/\[(Established|Evidence|Heuristic|Proposal)\]/.test(dropped));
  assert.ok(!dropped.includes('https://'));
});

test('sources table lists verified sources with title, authors, date, verified date and link', () => {
  const out = renderGenerated(EVIDENCE);
  const table = out.slice(out.indexOf('## Sources'), out.indexOf('## Quotes'));
  assert.match(table, /\| A study \\\| with a pipe \| Ada One, Bo Two, Cy Three \| 2026-01-02 \| 2026-10-09 \| \[example\.org\]\(https:\/\/example\.org\/study\) \|/);
  assert.ok(!table.includes('](https://example.net/talk)'));
  assert.match(table, /Lost talk/, 'unverified sources are named without a link');
});

test('quotes: at most one per source, under 15 words, never from dropped claims, attributed', () => {
  const out = renderGenerated(EVIDENCE);
  const quotes = out.slice(out.indexOf('## Quotes'), out.indexOf('## Dropped claims'));
  assert.ok(quotes.includes('performance grows less reliable'));
  assert.ok(!quotes.includes('a second quote from the same source'));
  assert.ok(!quotes.includes('fifteen'), 'a 15-word quote is skipped');
  assert.ok(!quotes.includes('dropped claims never quoted'));
  assert.ok(quotes.includes('Keep it short.'));
  assert.match(quotes, /performance grows less reliable.*Ada One et al\..*\[A study \\\| with a pipe\]\(https:\/\/example\.org\/study\)/);
});

test('escapes text that Markdown would otherwise treat as HTML, links or strikethrough', () => {
  const out = renderGenerated(EVIDENCE);
  assert.ok(out.includes('.kiro/specs/\\<name>/'));
  assert.ok(out.includes('\\[P\\]'));
  assert.ok(out.includes('\\~40%'));
});

test('replaceRegion only touches the text between the markers', () => {
  const text = `a\n${START}\nx\n${END}\nb\n`;
  assert.equal(replaceRegion(text, 'new\n'), `a\n${START}\nnew\n${END}\nb\n`);
  assert.throws(() => replaceRegion('no markers', 'x'), /evidence:generated/);
});

test('generated check: fails a stale page, passes a fresh one', async () => {
  const root = site();
  let r = await check('generated', root);
  assert.equal(r.errors.length, 1, messages(r));
  assert.match(messages(r), /evidence\.md:\d+ .*stale.*gen-evidence/);
  gen(root);
  r = await check('generated', root);
  assert.deepEqual(r.errors, [], messages(r));
  assert.equal(region(readFileSync(join(root, PAGE), 'utf8')).includes('Accuracy fell'), true);
});

test('generated check: fails a finished page without markers', async () => {
  const r = await check('generated', site(page('[Proposal] No markers.', { title: 'Evidence' })));
  assert.equal(r.errors.length, 1, messages(r));
  assert.match(messages(r), /evidence:generated/);
});

test('generated check: passes when evidence.md is absent, a stub, or out of scope', async () => {
  assert.deepEqual((await check('generated', makeSite({}))).errors, []);
  assert.deepEqual((await check('generated', site(page('<!-- stub: phase 6 -->')))).errors, []);
  const root = site();
  const other = join(root, 'src/content/docs/other.md');
  writeFileSync(other, page('[Proposal] Other.'));
  assert.deepEqual((await check('generated', root, { paths: [other] })).errors, []);
});

test('generated check: reports invalid evidence.json instead of crashing', async () => {
  const root = makeSite({ 'src/data/evidence.json': '{ nope', [PAGE]: stalePage() });
  const r = await check('generated', root);
  assert.equal(r.errors.length, 1, messages(r));
  assert.match(messages(r), /not valid JSON/);
});
