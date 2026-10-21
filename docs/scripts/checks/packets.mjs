// packets: every packets/<task-id>/ packet conforms to the Packet anatomy page (structure only; check
// commands are not run here — see specs-ref/, the reference validator). Looks in packets/ under the
// site root and under the repository root (the git top level, else the folder above the site).
import { spawnSync } from 'node:child_process';
import { dirname, join, relative, resolve } from 'node:path';
import { result, toPosix } from './lib.mjs';
import { findPackets, validatePacket } from '../../../specs-ref/src/index.mjs';

function repoRoot(siteRoot) {
  const top = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd: siteRoot, encoding: 'utf8' });
  return top.status === 0 ? resolve(top.stdout.trim()) : dirname(siteRoot);
}

export default {
  name: 'packets',
  run(ctx) {
    const r = result();
    for (const base of new Set([resolve(ctx.root), repoRoot(ctx.root)])) {
      for (const dir of findPackets(base)) {
        for (const message of validatePacket(dir).errors) {
          r.errors.push({ file: toPosix(relative(ctx.root, join(base, 'packets'))) || 'packets', message });
        }
      }
    }
    return r;
  },
};
