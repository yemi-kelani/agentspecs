// What a path asks specs-ref to check: a spec set (a folder with plan.md), or a repository root,
// meaning its AGENTS.md and every work/<task-id>/ spec set under it.
import { existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { findSpecSets } from './conformance.mjs';

/** [{ kind: 'spec-set' | 'agents', path }] for one path, or null when it holds nothing to check. */
export function resolveTargets(path) {
  const abs = resolve(path);
  if (!existsSync(abs) || !statSync(abs).isDirectory()) return null;
  if (existsSync(join(abs, 'plan.md'))) return [{ kind: 'spec-set', path: abs }];
  const targets = [];
  if (existsSync(join(abs, 'AGENTS.md'))) targets.push({ kind: 'agents', path: join(abs, 'AGENTS.md') });
  for (const dir of findSpecSets(abs)) targets.push({ kind: 'spec-set', path: dir });
  return targets.length || existsSync(join(abs, 'work')) ? targets : null;
}
