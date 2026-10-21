// Tests for scripts/quickstart/run.mjs (the `npm run check:quickstart` runner).
// Run: node --test scripts/quickstart/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const RUNNER = join(HERE, 'run.mjs');
const F = '```';

function runner(args = []) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const r = spawnSync(process.execPath, [RUNNER, ...args], { cwd: ROOT, env, encoding: 'utf8', timeout: 180_000 });
  return { code: r.status, out: `${r.stdout}\n${r.stderr}` };
}

function tmp(t) {
  const dir = mkdtempSync(join(tmpdir(), 'qs-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function writeTree(dir, files) {
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), content);
  }
}

// A minimal packet Quickstart: two templates, one slice, an agent step and a check command.
const TEMPLATES = {
  'plan.md': '# <title> — plan\n\n## Goal\n\n## Non-goals\n\n## Assumptions and resolved questions\n\n## Constraints\n\n## Repo grounding\n\n## Slices\n\n## Decisions\n\n## Surprises\n',
  'acceptance/README.md': '# Acceptance\n\n## Run\n\n## Checks\n\n## Hold-outs\n\n## Disputes\n',
};
const PLAN = [
  '# Demo — plan', '', '## Goal', 'Ship it.', '', '## Non-goals', '- More.', '',
  '## Assumptions and resolved questions', '- None open; confirmed by Ada.', '', '## Constraints', '- None.', '',
  '## Repo grounding', '- Command: `true` — always passes.', '',
  '## Slices', '| ID | Behavior | Check |', '|---|---|---|', '| 01 | feature.txt says shipped | acceptance/01-demo.sh |', '',
  '## Decisions', '- 2026-10-17 — plan review by Grace: the slice maps to its check.', '', '## Surprises', '- None.', '',
].join('\n');
const SLICE = [
  '# Slice 01 — demo', '', '## Objective', 'Ship.', '', '## Behavior', 'feature.txt says shipped.', '',
  '## Requirements', '- Write feature.txt.', '', '## Files and APIs', '- Touch: `feature.txt`', '',
  '## Checks', '- `sh packets/demo/acceptance/01-demo.sh` → exit 0', '', '## Out of scope', '- Anything else.', '',
  '## Report', '- Write handoffs/01.md.', '',
].join('\n');
const ACCEPTANCE = [
  '# Acceptance — demo', '', '## Run', '- `sh packets/demo/acceptance/01-demo.sh` → exit 0', '',
  '## Checks', '| Slice | Files | Written by | Reviewed by |', '|---|---|---|---|', '| 01 | acceptance/01-demo.sh | Ada | Grace |', '',
  '## Hold-outs', '- None.', '', '## Disputes', '- None.', '',
].join('\n');
const HANDOFF_DONE = [
  '# Handoff — Slice 01', '', '## Changed', '- feature.txt — written', '', '## Dead ends', '- None.', '',
  '## Superseded facts', '- None.', '', '## Check results', '```text', 'exit 0', '```', '',
  '## Verification', 'Verdict: PASS', '- Verifier: fresh session.', '',
].join('\n');
const STATE_DONE = '{ "packet": "demo", "format": "agentspecs packet v0.2", "updated": "2026-10-17T10:00Z", "slices": [{ "id": "01", "brief": "slices/01-demo.md", "status": "done", "passes": true, "failures": 0, "handoff": "handoffs/01.md" }] }';

function page({ plan = PLAN, state = STATE_DONE, slice = SLICE, check = 'grep -q shipped feature.txt', fetch = Object.keys(TEMPLATES), extra = '' } = {}) {
  const curls = fetch.map((f) => `curl -fsSL "$AGENTSPECS/templates/${f}" -o packets/demo/${f}`).join('\n');
  return [
    '---', 'title: Quickstart', 'description: Test page.', '---', '',
    `${F}bash manual`, 'git clone https://example.invalid/repo.git', F, '',
    `${F}bash`, 'mkdir -p packets/demo/slices packets/demo/acceptance', curls, F, '',
    `${F}md title="packets/demo/plan.md"`, plan.trimEnd(), F, '',
    `${F}md title="packets/demo/slices/01-demo.md"`, slice.trimEnd(), F, '',
    `${F}md title="packets/demo/acceptance/README.md"`, ACCEPTANCE.trimEnd(), F, '',
    `${F}sh title="packets/demo/acceptance/01-demo.sh"`, check, F, '',
    `${F}text agent`, 'You are the implementer for slice 01.', F, '',
    extra,
    `${F}json title="packets/demo/state.json"`, state, F, '',
  ].join('\n');
}

function fixture(t, opts = {}) {
  const dir = tmp(t);
  writeTree(join(dir, 'public/templates'), TEMPLATES);
  writeTree(join(dir, 'example'), { 'README.md': '# demo\n' });
  writeTree(join(dir, 'solution'), {
    'feature.txt': 'shipped\n',
    'packets/demo/handoffs/01.md': opts.handoff ?? HANDOFF_DONE,
  });
  writeFileSync(join(dir, 'quickstart.md'), page(opts));
  let serve = join(dir, 'public');
  if (opts.corrupt) {
    serve = join(dir, 'served');
    cpSync(join(dir, 'public'), serve, { recursive: true });
    writeFileSync(join(serve, 'templates', opts.corrupt), '# tampered\n');
  }
  return [
    '--page', join(dir, 'quickstart.md'),
    '--example', join(dir, 'example'),
    '--solution', join(dir, 'solution'),
    '--templates', join(dir, 'public/templates'),
    '--serve', serve,
  ];
}

// The failing case the brief asks for: a template served with different bytes must fail the run.
test('fails when a fetched template differs from the canonical copy', (t) => {
  const r = runner(fixture(t, { corrupt: 'plan.md' }));
  assert.notEqual(r.code, 0, r.out);
  assert.match(r.out, /plan\.md.*differs from .*templates/);
});

test('passes a minimal valid Quickstart', (t) => {
  const r = runner(fixture(t));
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /check:quickstart passed/);
});

test('fails when a canonical template in a subfolder is never fetched', (t) => {
  const r = runner(fixture(t, { fetch: ['plan.md'] }));
  assert.notEqual(r.code, 0, r.out);
  assert.match(r.out, /never fetches acceptance\/README\.md/);
});

test('fails when a command block exits non-zero, naming its line', (t) => {
  const r = runner(fixture(t, { extra: `${F}bash\nfalse\n${F}\n` }));
  assert.notEqual(r.code, 0, r.out);
  assert.match(r.out, /block at line \d+ exited with 1/);
});

test('a file block may write the folder beside the project, and no further', (t) => {
  const ok = runner(fixture(t, { extra: `${F}js title="../holdout/h.test.js"\n// hold-out\n${F}\n` }));
  assert.equal(ok.code, 0, ok.out);
  const bad = runner(fixture(t, { extra: `${F}js title="../../escape.js"\n// no\n${F}\n` }));
  assert.notEqual(bad.code, 0, bad.out);
  assert.match(bad.out, /leaves the project's folder/);
});

test('fails when a slice is not done in state.json', (t) => {
  const r = runner(fixture(t, { state: STATE_DONE.replace('"status": "done", "passes": true', '"status": "in_progress", "passes": false') }));
  assert.notEqual(r.code, 0, r.out);
  assert.match(r.out, /slice 01 is "in_progress" with passes false, expected done and true/);
});

test('fails when state.json is not valid JSON', (t) => {
  const r = runner(fixture(t, { state: '{ "packet": "demo", ' }));
  assert.notEqual(r.code, 0, r.out);
  assert.match(r.out, /state\.json does not parse/);
});

test('fails when the handoff of a done slice has no PASS verdict', (t) => {
  const r = runner(fixture(t, { handoff: HANDOFF_DONE.replace('Verdict: PASS', 'Verdict: PASS | FAIL') }));
  assert.notEqual(r.code, 0, r.out);
  assert.match(r.out, /handoffs\/01\.md: Verification has no "Verdict: PASS" line/);
});

test('fails when a check command fails', (t) => {
  const r = runner(fixture(t, { check: 'grep -q missing-word feature.txt' }));
  assert.notEqual(r.code, 0, r.out);
  assert.match(r.out, /check command failed: sh packets\/demo\/acceptance\/01-demo\.sh/);
});

// The real page, example and overlay.
test('the published Quickstart runs end to end', () => {
  const r = runner();
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /check:quickstart passed/);
});

test('the published Quickstart fails when a served template is corrupted', (t) => {
  const dir = tmp(t);
  cpSync(join(ROOT, 'public/templates'), join(dir, 'templates'), { recursive: true });
  const original = readFileSync(join(dir, 'templates/state.json'), 'utf8');
  writeFileSync(join(dir, 'templates/state.json'), original.replace('pending', 'done'));
  const r = runner(['--serve', dir]);
  assert.notEqual(r.code, 0, r.out);
  assert.match(r.out, /state\.json.*differs from .*templates/);
});

test('fails when plan.md lacks a section the packet format requires', (t) => {
  const r = runner(fixture(t, { plan: PLAN.replace('## Surprises\n- None.\n', '') }));
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /plan\.md.*"Surprises"/);
});

test('fails when a slice brief lacks a section the packet format requires', (t) => {
  const r = runner(fixture(t, { slice: SLICE.replace('## Out of scope\n- Anything else.\n', '') }));
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /01-demo\.md: missing section "Out of scope"/);
});

test('fails when a handoff lacks a section the packet format requires', (t) => {
  const r = runner(fixture(t, { handoff: HANDOFF_DONE.replace('## Dead ends\n- None.\n', '') }));
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /handoffs\/01\.md: missing section "Dead ends"/);
});

test('fails when a filled file drops a section of the template it was fetched from', (t) => {
  const r = runner(fixture(t, { plan: PLAN.replace('## Non-goals\n- More.\n', '') }));
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /packets\/demo\/plan\.md.*template plan\.md.*"Non-goals"/);
});
