import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeSite, page } from './helpers.mjs';
import { runChecks, CHECKS } from '../../scripts/checks/run.mjs';

const RUN = fileURLToPath(new URL('../../scripts/checks/run.mjs', import.meta.url));

test('registers all twelve checks in a fixed order', () => {
  assert.deepEqual(
    CHECKS.map((c) => c.name),
    ['frontmatter', 'labels', 'citations', 'links', 'templates', 'banned', 'copy', 'quotes', 'length', 'stubs', 'generated', 'specsets'],
  );
});

test('path arguments limit content checks to those paths', async () => {
  const root = makeSite({
    'src/content/docs/good/a.md': page('[Proposal] Fine.'),
    'src/content/docs/bad/b.md': page('No label and [established] near-miss.'),
  });
  const scoped = await runChecks({ root, paths: [join(root, 'src/content/docs/good')], allowStubs: true });
  assert.deepEqual(scoped.flatMap((r) => r.errors), []);
  const all = await runChecks({ root, allowStubs: true });
  assert.ok(all.flatMap((r) => r.errors).length >= 2);
});

test('CLI exits 1 on errors, 0 when clean, and honours --allow-stubs and paths', () => {
  const root = makeSite({
    'src/content/docs/good/a.md': page('[Proposal] Fine.'),
    'src/content/docs/stub.md': page('<!-- stub: phase 3 -->'),
  });
  const fail = spawnSync(process.execPath, [RUN, '--root', root], { encoding: 'utf8' });
  assert.equal(fail.status, 1, fail.stdout + fail.stderr);
  assert.match(fail.stdout, /stubs/);
  const ok = spawnSync(process.execPath, [RUN, '--root', root, '--allow-stubs'], { encoding: 'utf8' });
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  const scoped = spawnSync(process.execPath, [RUN, '--root', root, 'src/content/docs/good'], { encoding: 'utf8', cwd: root });
  assert.equal(scoped.status, 0, scoped.stdout + scoped.stderr);
});
