// Tests for the specs-ref command line: run it as a user would and check output and exit codes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AGENTS, PLAN, specSet } from './fixtures.mjs';

const CLI = fileURLToPath(new URL('../src/cli.mjs', import.meta.url));
const run = (...args) => spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8' });

test('validate: a conforming spec set exits 0 and says so', (t) => {
  const dir = specSet(t);
  const r = run('validate', dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /✔ .*work\/demo conforms/);
});

test('validate: problems exit 1 and list each one', (t) => {
  const dir = specSet(t, { 'plan.md': PLAN.replace('## Non-goals\n- More.\n\n', '') });
  const r = run('validate', dir);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /✖ .*work\/demo: 1 problem/);
  assert.match(r.stdout, /demo\/plan\.md: missing section "Non-goals"/);
});

test('validate: a repository root checks its AGENTS.md and every spec set under work/', (t) => {
  const repo = dirname(dirname(specSet(t)));
  writeFileSync(join(repo, 'AGENTS.md'), AGENTS);
  const ok = run('validate', repo);
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.match(ok.stdout, /✔ .*AGENTS\.md conforms/);
  assert.match(ok.stdout, /✔ .*work\/demo conforms/);
  writeFileSync(join(repo, 'AGENTS.md'), '# AGENTS.md\n\nThis repo has src/.\n');
  const bad = run('validate', repo);
  assert.equal(bad.status, 1);
  assert.match(bad.stdout, /AGENTS\.md: missing section "Commands"/);
});

test('validate: a folder that is neither a spec set nor a repository is a usage error', (t) => {
  const empty = mkdtempSync(join(tmpdir(), 'specs-ref-empty-'));
  t.after(() => rmSync(empty, { recursive: true, force: true }));
  const r = run('validate', empty);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /no plan\.md, AGENTS\.md or work\//);
});

test('commands: prints the verify commands as JSON without running them', (t) => {
  const dir = specSet(t, { 'plan.md': PLAN.replace('- [ ] `true` exits 0', '- [ ] `false` exits 0') });
  const r = run('commands', dir);
  assert.equal(r.status, 0, r.stderr);
  const cmds = JSON.parse(r.stdout);
  assert.deepEqual(cmds.map((c) => c.cmd), ['false', 'true']);
  assert.equal(cmds[0].from, 'demo/plan.md');
  assert.equal(cmds[1].phase, 1);
});

test('help, version and unknown commands', () => {
  const help = run('--help');
  assert.equal(help.status, 0);
  assert.match(help.stdout, /specs-ref validate <path>/);
  assert.match(run('--version').stdout, /^0\.1\.0\n$/);
  const bad = run('lint');
  assert.equal(bad.status, 2);
  assert.match(bad.stderr, /unknown command "lint"/);
  assert.equal(run().status, 2);
});
