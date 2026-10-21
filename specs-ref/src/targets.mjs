// What a path asks specs-ref to check: a packet (a folder with plan.md), or a repository root,
// meaning every packets/<task-id>/ packet under it.
import { existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { findPackets } from './conformance.mjs';

/** Packet folders for one path, or null when it holds nothing to check. */
export function resolveTargets(path) {
  const abs = resolve(path);
  if (!existsSync(abs) || !statSync(abs).isDirectory()) return null;
  if (existsSync(join(abs, 'plan.md'))) return [abs];
  return existsSync(join(abs, 'packets')) ? findPackets(abs) : null;
}
