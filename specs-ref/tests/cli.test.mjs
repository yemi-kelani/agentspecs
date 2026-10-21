// Tests for the specs-ref command line: run it as a user would and check output and exit codes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PLAN, SLICE, packet } from './fixtures.mjs';

const CLI = fileURLToPath(new URL('../src/cli.mjs', import.meta.url));
const run = (...args) => spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8' });

test('validate: a conforming packet exits 0 and says so', (t) => {
  const r = run('validate', packet(t));
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /✔ .*packets\/demo conforms/);
});

test('validate: problems exit 1 and list each one', (t) => {
  const r = run('validate', packet(t, { 'plan.md': PLAN.replace('## Non-goals\n- More.\n\n', '') }));
  assert.equal(r.status, 1);
  assert.match(r.stdout, /✖ .*packets\/demo: 1 problem/);
  assert.match(r.stdout, /demo\/plan\.md: missing section "Non-goals"/);
});

test('validate: a repository root checks every packet under packets/', (t) => {
  const repo = dirname(dirname(packet(t)));
  const ok = run('validate', repo);
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.match(ok.stdout, /✔ .*packets\/demo conforms/);
});

test('validate: a folder with no plan.md and no packets/ is a usage error', (t) => {
  const empty = mkdtempSync(`${tmpdir()}/specs-ref-empty-`);
  t.after(() => rmSync(empty, { recursive: true, force: true }));
  const r = run('validate', empty);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /no plan\.md or packets\/ folder/);
});

test('commands: prints the check commands as JSON without running them', (t) => {
  const dir = packet(t, { 'slices/01-demo.md': SLICE.replace('- `true` → exit 0', '- `false` → exit 0') });
  const r = run('commands', dir);
  assert.equal(r.status, 0, r.stderr);
  const cmds = JSON.parse(r.stdout);
  assert.deepEqual(cmds.map((c) => c.cmd), ['false', 'true']);
  assert.equal(cmds[0].slice, '01');
  assert.equal(cmds[1].from, 'demo/acceptance/README.md');
  assert.equal(run('commands', dirname(dir)).status, 2);
});

test('help, version and unknown commands', () => {
  const help = run('--help');
  assert.equal(help.status, 0);
  assert.match(help.stdout, /specs-ref validate <path>/);
  assert.match(run('--version').stdout, /^0\.2\.0\n$/);
  const bad = run('lint');
  assert.equal(bad.status, 2);
  assert.match(bad.stderr, /unknown command "lint"/);
  assert.equal(run().status, 2);
});
