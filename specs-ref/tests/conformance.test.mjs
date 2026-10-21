// Tests for src/conformance.mjs: one valid packet, then one mutation per structural rule on the
// Packet anatomy page (Files, State rules, Gates and Conformance).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findPackets, validatePacket } from '../src/index.mjs';
import { ACCEPTANCE, HANDOFF, PLAN, SLICE, STATE, packet } from './fixtures.mjs';

const errorsOf = (t, overrides) => validatePacket(packet(t, overrides)).errors.join('\n');
const state = (patch, slicePatch = {}) => ({ ...STATE, ...patch, slices: [{ ...STATE.slices[0], ...slicePatch }] });
const pending = { status: 'pending', passes: false, handoff: null };

test('a valid packet has no errors, and its commands are collected', (t) => {
  const r = validatePacket(packet(t));
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.commands.map((c) => [c.cmd, c.from]), [
    ['true', 'demo/slices/01-demo.md'],
    ['true', 'demo/acceptance/README.md'],
  ]);
});

test('plan.md: required sections in order', (t) => {
  assert.match(errorsOf(t, { 'plan.md': null }), /demo\/plan\.md is missing/);
  const swapped = PLAN.replace('## Goal\nShip it.\n\n## Non-goals\n- More.\n', '## Non-goals\n- More.\n\n## Goal\nShip it.\n');
  assert.match(errorsOf(t, { 'plan.md': swapped }), /plan\.md: required sections out of order/);
  assert.match(errorsOf(t, { 'plan.md': PLAN.replace(/## Repo grounding\n.*\n\n/, '') }), /missing section "Repo grounding"/);
});

test('plan.md: assumptions and repo grounding are recorded', (t) => {
  assert.match(errorsOf(t, { 'plan.md': PLAN.replace(/(## Assumptions and resolved questions\n).*\n/, '$1') }), /Assumptions and resolved questions has no list item/);
  assert.match(errorsOf(t, { 'plan.md': PLAN.replace(/(## Repo grounding\n).*\n/, '$1') }), /Repo grounding has no list item/);
});

test('plan.md: the slice table maps each two-digit id to a behavior and an existing check', (t) => {
  assert.match(errorsOf(t, { 'plan.md': PLAN.replace('| Check |', '| Test |') }), /Slices table lacks column "Check"/);
  assert.match(errorsOf(t, { 'plan.md': PLAN.replace('| 01 | demo()', '| 1 | demo()') }), /slice id "1" must be two digits/);
  assert.match(errorsOf(t, { 'plan.md': PLAN.replace('demo() returns 1 |', '— |') }), /slice 01 has no behavior/);
  assert.match(errorsOf(t, { 'plan.md': PLAN.replace('acceptance/01-demo.test.js', 'test/demo.test.js') }), /check test\/demo\.test\.js is not under acceptance\//);
  assert.match(errorsOf(t, { 'acceptance/01-demo.test.js': null }), /check acceptance\/01-demo\.test\.js does not exist/);
});

test('slices/: one brief per slice, named NN-<slug>.md, with its sections and a runnable check', (t) => {
  assert.match(errorsOf(t, { 'slices/01-demo.md': null }), /no brief for slice 01/);
  assert.match(errorsOf(t, { 'slices/02-extra.md': SLICE }), /slices\/02-extra\.md is not in the plan\.md Slices table/);
  assert.match(errorsOf(t, { 'slices/01_Demo.md': SLICE }), /slices\/01_Demo\.md: name must be NN-<slug>\.md/);
  assert.match(errorsOf(t, { 'slices/01-demo.md': SLICE.replace('# Slice 01 — demo', '# Demo') }), /heading must be "# Slice 01 — <name>"/);
  assert.match(errorsOf(t, { 'slices/01-demo.md': SLICE.replace('## Out of scope\n- Anything else.\n\n', '') }), /missing section "Out of scope"/);
  assert.match(errorsOf(t, { 'slices/01-demo.md': SLICE.replace('- `true` → exit 0', '- It works.') }), /Checks lists no command/);
});

test('acceptance/README.md: sections, a run command, and a reviewed row per slice that matches plan.md', (t) => {
  assert.match(errorsOf(t, { 'acceptance/README.md': null }), /acceptance\/README\.md is missing/);
  assert.match(errorsOf(t, { 'acceptance/README.md': ACCEPTANCE.replace('## Hold-outs\n- None.\n\n', '') }), /missing section "Hold-outs"/);
  assert.match(errorsOf(t, { 'acceptance/README.md': ACCEPTANCE.replace('- `true` → exit 0', '- run it') }), /Run lists no command/);
  assert.match(errorsOf(t, { 'acceptance/README.md': ACCEPTANCE.replace('| Ada | Grace |', '| Ada | — |') }), /slice 01 checks have no reviewer/);
  assert.match(errorsOf(t, { 'acceptance/README.md': ACCEPTANCE.replace('| 01 | acceptance', '| 02 | acceptance') }), /no row for slice 01[\s\S]*slice 02 is not in plan\.md/);
  assert.match(errorsOf(t, { 'acceptance/README.md': ACCEPTANCE.replace('acceptance/01-demo.test.js', 'acceptance/other.test.js') }), /slice 01 files differ from plan\.md/);
});

test('state.json: keys, packet name, format, updated, status enum and field types', (t) => {
  assert.match(errorsOf(t, { 'state.json': null }), /state\.json is missing/);
  assert.match(errorsOf(t, { 'state.json': '{ nope' }), /state\.json does not parse/);
  assert.match(errorsOf(t, { 'state.json': state({ updated: 'yesterday' }) }), /"updated"/);
  assert.match(errorsOf(t, { 'state.json': state({ format: 'agentspecs v0.1' }) }), /"format"/);
  assert.match(errorsOf(t, { 'state.json': state({ packet: 'other' }) }), /"packet" is "other"/);
  assert.match(errorsOf(t, { 'state.json': state({}, { status: 'finished' }) }), /status "finished"/);
  assert.match(errorsOf(t, { 'state.json': state({}, { id: 1 }) }), /"id" must be a two-digit string/);
  assert.match(errorsOf(t, { 'state.json': state({}, { failures: -1 }) }), /"failures" must be a whole number/);
  assert.match(errorsOf(t, { 'state.json': state({}, { brief: 'slices/01-other.md' }) }), /brief slices\/01-other\.md differs/);
  assert.match(errorsOf(t, { 'state.json': { ...STATE, slices: [] } }), /"slices" is empty[\s\S]*slice 01 is not in state\.json/);
});

test('state.json: passes and done go together, and done needs a PASS handoff', (t) => {
  assert.match(errorsOf(t, { 'state.json': state({}, { status: 'in_progress' }) }), /passes is true but status is "in_progress"/);
  assert.match(errorsOf(t, { 'state.json': state({}, { passes: false }) }), /status is done but passes is not true/);
  assert.match(errorsOf(t, { 'handoffs/01.md': null }), /handoff handoffs\/01\.md is missing/);
  assert.match(errorsOf(t, { 'state.json': state({}, { handoff: 'out/01.md' }) }), /expected "handoffs\/01\.md"/);
  assert.match(errorsOf(t, { 'handoffs/01.md': HANDOFF.replace('Verdict: PASS', 'Verdict: FAIL') }), /Verdict is FAIL but state\.json says done/);
  assert.match(errorsOf(t, { 'handoffs/01.md': HANDOFF.replace('Verdict: PASS', 'Looks good.') }), /no "Verdict: PASS" line/);
  assert.match(errorsOf(t, { 'handoffs/01.md': HANDOFF.replace('# Handoff — Slice 01', '# Notes') }), /heading must be "# Handoff — Slice 01"/);
  assert.match(errorsOf(t, { 'handoffs/01.md': HANDOFF.replace('## Dead ends\n- None.\n\n', '') }), /missing section "Dead ends"/);
  assert.match(errorsOf(t, { 'handoffs/01.md': HANDOFF.replace(/```text\n.*\n```/, '') }), /Check results is empty/);
  assert.match(errorsOf(t, { 'handoffs/07.md': HANDOFF }), /handoffs\/07\.md does not match a slice id/);
});

test('a disputed slice needs a Dispute section in its handoff', (t) => {
  const disputed = state({}, { status: 'disputed', passes: false });
  assert.match(errorsOf(t, { 'state.json': disputed }), /slice is disputed, so the handoff needs a "## Dispute" section/);
  const withDispute = HANDOFF.replace('Verdict: PASS', 'Verdict: FAIL') + '\n## Dispute\n- acceptance/01-demo.test.js expects 2; plan.md says 1.\n';
  assert.equal(errorsOf(t, { 'state.json': disputed, 'handoffs/01.md': withDispute }), '');
});

test('gates: a started slice needs a recorded plan review; two failures need a recorded replan', (t) => {
  const noReview = PLAN.replace(/- 2026-10-17 — plan review.*\n/, '- 2026-10-17 — kept it small.\n');
  assert.match(errorsOf(t, { 'plan.md': noReview }), /Decisions must record the plan review/);
  assert.equal(errorsOf(t, { 'plan.md': noReview, 'state.json': state({}, pending), 'handoffs/01.md': null }), '');
  const failing = state({}, { status: 'in_progress', passes: false, failures: 2, handoff: null });
  assert.match(errorsOf(t, { 'state.json': failing, 'handoffs/01.md': null }), /2 failed verifications, so plan\.md Decisions must record a replan that names slice 01/);
  const replanned = PLAN.replace('## Surprises', '- 2026-10-18 — replan of slice 01 through the plan review gate: split the parser out.\n\n## Surprises');
  assert.equal(errorsOf(t, { 'plan.md': replanned, 'state.json': failing, 'handoffs/01.md': null }), '');
});

test('findPackets lists packets/<task-id>/ folders that hold plan.md', (t) => {
  const repo = mkdtempSync(join(tmpdir(), 'find-'));
  t.after(() => rmSync(repo, { recursive: true, force: true }));
  for (const d of ['b', 'a', 'empty']) mkdirSync(join(repo, 'packets', d), { recursive: true });
  writeFileSync(join(repo, 'packets/a/plan.md'), '#');
  writeFileSync(join(repo, 'packets/b/plan.md'), '#');
  assert.deepEqual(findPackets(repo).map((d) => d.split('/').pop()), ['a', 'b']);
  assert.deepEqual(findPackets(join(repo, 'packets/a')), []);
});
