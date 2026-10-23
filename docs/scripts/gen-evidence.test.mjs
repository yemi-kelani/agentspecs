// Tests for scripts/gen-evidence.mjs and the `generated` check that runs it in --check mode.
// Run: npm test (or node --test scripts/gen-evidence.test.mjs)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeSite, page, check, messages } from '../tests/checks/helpers.mjs';
import { END, PAGE, START, renderGenerated, replaceRegion, rowKey } from './gen-evidence.mjs';

const GEN = fileURLToPath(new URL('./gen-evidence.mjs', import.meta.url));

const SOURCES = [
  { id: 's-study', title: 'A study | with a pipe', authors: 'Ada One, Bo Two, Cy Three', venue: 'TACL 2024', date: '2026-01-02', url: 'https://example.org/study', verified: '2026-10-09', status: 'verified' },
  { id: 's-vendor', title: 'Vendor docs', authors: 'Vendor', type: 'vendor-doc', date: '2026-10', url: 'https://example.com/docs', verified: '2026-10-09', status: 'verified' },
  { id: 's-gone', title: 'Lost talk', authors: 'Someone', date: '', url: 'https://example.net/talk', verified: '2026-10-09', status: 'unreachable' },
];

const claim = (o) => ({ quote: '', locator: '', caveat: '', drop_reason: '', status: 'verified', verified: '2026-10-09', kind: 'finding', strength: 'moderate', ...o });
const CLAIMS = [
  claim({ id: 'c-sizing', row: 'R10', kind: 'documentation', strength: 'strong', section: 'tools', claim: 'Short files under .kiro/specs/<name>/ carry a [P] marker at ~40%.', sources: ['s-vendor'], url: 'https://example.com/docs', caveat: 'Vendor guidance only.', quote: 'Keep it short.' }),
  claim({ id: 'b-rot', row: 'R2', section: 'context', claim: 'Accuracy fell as input grew.', sources: ['s-study', 's-vendor'], url: 'https://example.org/study', caveat: 'Synthetic tasks.', quote: 'performance grows less reliable', locator: 'Section 3' }),
  claim({ id: 'b-rot-2', row: 'R2a', strength: 'weak', section: 'context', claim: 'A second finding from the same study.', sources: ['s-study'], url: 'https://example.org/study', caveat: 'Same study.', locator: 'Table 2' }),
  claim({ id: 'a-long-quote', row: 'R11', kind: 'practice', strength: 'anecdotal', section: 'tools', claim: 'A vendor rule.', sources: ['s-vendor'], url: 'https://example.com/docs', caveat: 'Not measured.', quote: 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen' }),
  claim({ id: 'x-orphan', row: 'R12', section: 'tools', claim: 'Rests only on an unreachable source.', sources: ['s-gone'], url: 'https://example.net/talk', caveat: 'n/a' }),
  claim({ id: 'd-gone', row: 'R3', section: 'context', claim: 'A claim we could not support.', sources: ['s-vendor'], url: 'https://example.com/docs', status: 'dropped', drop_reason: 'The source does not say this.', quote: 'dropped claims never quoted' }),
];
const CONFLICTS = [{ id: 'C1', rows: ['R2', 'R10'], title: 'Short or long?', summary: 'R2 and R10 point different ways' }];

const EVIDENCE = { generated: '2026-10-09', sources: SOURCES, conflicts: CONFLICTS, claims: CLAIMS };

const HEAD = '---\ntitle: Ledger\ndescription: One sentence.\n---\n\n[Judgment] Hand-written part.\n\n';
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

test('--check exits 1 on a stale ledger and leaves the file untouched', () => {
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
  for (const text of [page('[Judgment] No markers.'), `${HEAD}${END}\n${START}\n`]) {
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

test('row order is numeric, then by suffix', () => {
  const ids = ['R10', 'R2', 'R1b', 'R1', 'R1a'].sort((a, b) => {
    const [na, sa] = rowKey(a);
    const [nb, sb] = rowKey(b);
    return na - nb || (sa < sb ? -1 : sa > sb ? 1 : 0);
  });
  assert.deepEqual(ids, ['R1', 'R1a', 'R1b', 'R2', 'R10']);
});

test('each row renders an anchor, claim, linked sources, verified date, quote or locator, caveat and id', () => {
  const out = renderGenerated(EVIDENCE);
  assert.match(
    out,
    /^- <span id="r2"><\/span>\*\*R2\*\* · Accuracy fell as input grew\. Sources: \[A study \\\| with a pipe\]\(https:\/\/example\.org\/study\) \(example\.org\); \[Vendor docs\]\(https:\/\/example\.com\/docs\) \(example\.com\)\. Verified 2026-10-09\. Quote: “performance grows less reliable” \(Section 3\)\. Caveat: Synthetic tasks\. `b-rot`$/m,
  );
  assert.match(out, /\*\*R2a\*\* · A second finding .* Locator: Table 2\. Caveat: Same study\. `b-rot-2`$/m);
  assert.doesNotMatch(out, /· (strong|moderate|weak|anecdotal|finding|practice|documentation) ·/, 'strength and kind are not rendered');
});

test('rows are grouped by section in a fixed order and sorted by row within it', () => {
  const out = renderGenerated(EVIDENCE);
  const ctx = out.indexOf('## Context and attention');
  const tools = out.indexOf('## How tools and formats work');
  assert.ok(ctx > -1 && tools > ctx, 'sections appear in the fixed order');
  const t = out.slice(tools, out.indexOf('## Sources'));
  assert.ok(t.indexOf('**R10**') < t.indexOf('**R11**'));
});

test('conflicts list their rows as links and their summary', () => {
  const out = renderGenerated(EVIDENCE);
  const part = out.slice(out.indexOf('## Conflicts'), out.indexOf('## Context and attention'));
  assert.match(part, /### C1: Short or long\?/);
  assert.match(part, /Rows: \[R2\]\(#r2\), \[R10\]\(#r10\)\./);
  assert.match(part, /R2 and R10 point different ways\./);
});

test('warns about a conflict that names a row not shown', () => {
  const warnings = [];
  renderGenerated({ ...EVIDENCE, conflicts: [{ id: 'C9', rows: ['R99'], title: 'x', summary: 'y' }] }, { warn: (w) => warnings.push(w) });
  assert.ok(warnings.some((w) => /C9: rows R99/.test(w)), warnings.join('\n'));
});

test('quotes of 15 words or more are left out with a warning; dropped rows are never quoted or linked', () => {
  const warnings = [];
  const out = renderGenerated(EVIDENCE, { warn: (w) => warnings.push(w) });
  assert.ok(!out.includes('fifteen'));
  assert.ok(warnings.some((w) => /a-long-quote: quote has 15 words/.test(w)));
  assert.ok(!out.includes('dropped claims never quoted'));
  const dropped = out.slice(out.indexOf('## Dropped'));
  assert.match(dropped, /<span id="r3"><\/span>\*\*R3\*\* · A claim we could not support\. Why dropped: The source does not say this\. `d-gone`$/m);
  assert.ok(!dropped.includes('https://'));
});

test('leaves out rows without a verified source, a row id, or a known strength', () => {
  const warnings = [];
  const bad = [claim({ id: 'no-row', section: 'tools', claim: 'No row.', sources: ['s-vendor'], url: 'https://example.com/docs' }),
    claim({ id: 'bad-strength', row: 'R40', strength: 'huge', section: 'tools', claim: 'Bad.', sources: ['s-vendor'], url: 'https://example.com/docs' })];
  const out = renderGenerated({ ...EVIDENCE, claims: [...CLAIMS, ...bad] }, { warn: (w) => warnings.push(w) });
  assert.ok(!out.includes('Rests only on an unreachable source'));
  assert.ok(!out.includes('https://example.net/talk'), 'unverified source URLs are never linked');
  assert.ok(!out.includes('No row.') && !out.includes('**R40**'));
  assert.equal(warnings.filter((w) => /no-row|bad-strength|x-orphan/.test(w)).length, 3, warnings.join('\n'));
});

test('sources table lists verified sources with venue, and names unverified ones without a link', () => {
  const out = renderGenerated(EVIDENCE);
  const table = out.slice(out.indexOf('## Sources'), out.indexOf('## Dropped'));
  assert.match(table, /\| A study \\\| with a pipe \| Ada One, Bo Two, Cy Three \| TACL 2024 \| 2026-01-02 \| 2026-10-09 \| \[example\.org\]\(https:\/\/example\.org\/study\) \|/);
  assert.match(table, /\| Vendor docs \| Vendor \| vendor-doc \|/);
  assert.ok(!table.includes('](https://example.net/talk)'));
  assert.match(table, /Lost talk/);
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

test('generated check: fails a stale ledger, passes a fresh one', async () => {
  const root = site();
  let r = await check('generated', root);
  assert.equal(r.errors.length, 1, messages(r));
  assert.match(messages(r), /evidence\/ledger\.md:\d+ .*stale.*gen-evidence/);
  gen(root);
  r = await check('generated', root);
  assert.deepEqual(r.errors, [], messages(r));
  assert.equal(region(readFileSync(join(root, PAGE), 'utf8')).includes('Accuracy fell'), true);
});

test('generated check: fails a finished ledger without markers', async () => {
  const r = await check('generated', site(page('[Judgment] No markers.', { title: 'Ledger' })));
  assert.equal(r.errors.length, 1, messages(r));
  assert.match(messages(r), /evidence:generated/);
});

test('generated check: passes when the ledger is absent, a stub, or out of scope', async () => {
  assert.deepEqual((await check('generated', makeSite({}))).errors, []);
  assert.deepEqual((await check('generated', site(page('<!-- stub: phase 6 -->')))).errors, []);
  const root = site();
  const other = join(root, 'src/content/docs/other.md');
  writeFileSync(other, page('[Judgment] Other.'));
  assert.deepEqual((await check('generated', root, { paths: [other] })).errors, []);
});

test('generated check: reports invalid evidence.json instead of crashing', async () => {
  const root = makeSite({ 'src/data/evidence.json': '{ nope', [PAGE]: stalePage() });
  const r = await check('generated', root);
  assert.equal(r.errors.length, 1, messages(r));
  assert.match(messages(r), /not valid JSON/);
});
