// specsets: every work/<task-id>/ spec set conforms to the Specification (structure only; verify
// commands are not run here — see scripts/lib/conformance.mjs). Looks in work/ under the site root and
// under the repository root (the git top level, else the folder above the site), and checks the
// repository root AGENTS.md, when there is one, against the Specification's AGENTS.md rules.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { result, toPosix } from './lib.mjs';
import { findSpecSets, validateAgentsMd, validateSpecSet } from '../lib/conformance.mjs';

function repoRoot(siteRoot) {
  const top = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd: siteRoot, encoding: 'utf8' });
  return top.status === 0 ? resolve(top.stdout.trim()) : dirname(siteRoot);
}

export default {
  name: 'specsets',
  run(ctx) {
    const r = result();
    const repo = repoRoot(ctx.root);
    for (const base of new Set([resolve(ctx.root), repo])) {
      for (const dir of findSpecSets(base)) {
        for (const message of validateSpecSet(dir).errors) r.errors.push({ file: toPosix(relative(ctx.root, join(base, 'work'))) || 'work', message });
      }
    }
    const agents = join(repo, 'AGENTS.md');
    if (repo !== resolve(ctx.root) && existsSync(agents)) {
      for (const message of validateAgentsMd(readFileSync(agents, 'utf8'), 'AGENTS.md')) {
        r.errors.push({ file: toPosix(relative(ctx.root, agents)), message });
      }
    }
    return r;
  },
};
