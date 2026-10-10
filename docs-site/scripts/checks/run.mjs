#!/usr/bin/env node
// Check harness runner.
//   npm run check                       all checks, all content
//   npm run check -- <path...>          limit content checks to these files/dirs
//   npm run check -- --allow-stubs      skip the stubs check
//   --root <dir>                        site root (default: docs-site/)
//   --only <name,name>                  run a subset of checks
// The banned check reads its term list from outside the repository (see banned.mjs).
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { loadContext } from './lib.mjs';
import frontmatter from './frontmatter.mjs';
import labels from './labels.mjs';
import citations from './citations.mjs';
import links from './links.mjs';
import templates from './templates.mjs';
import banned from './banned.mjs';
import copy from './copy.mjs';
import quotes from './quotes.mjs';
import stubs from './stubs.mjs';
import length from './length.mjs';
import specsets from './specsets.mjs';
import generated from './generated.mjs';

export const CHECKS = [frontmatter, labels, citations, links, templates, banned, copy, quotes, length, stubs, generated, specsets];

const DEFAULT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** Run checks and return [{ name, errors, warnings, skipped }]. */
export async function runChecks({ root = DEFAULT_ROOT, paths = [], allowStubs = false, only = null, env = process.env } = {}) {
  const ctx = { ...loadContext({ root, paths, allowStubs }), env };
  const unknown = (only ?? []).filter((n) => !CHECKS.some((c) => c.name === n));
  if (unknown.length) throw new Error(`Unknown check name(s): ${unknown.join(', ')}`);
  const selected = only ? CHECKS.filter((c) => only.includes(c.name)) : CHECKS;
  const results = [];
  for (const c of selected) {
    const r = await c.run(ctx);
    results.push({ name: c.name, errors: r.errors ?? [], warnings: r.warnings ?? [], skipped: r.skipped ?? null });
  }
  return results;
}

function parseArgs(argv) {
  const opts = { root: DEFAULT_ROOT, paths: [], allowStubs: false, only: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--allow-stubs') opts.allowStubs = true;
    else if (a === '--root') opts.root = resolve(argv[++i]);
    else if (a === '--only') opts.only = argv[++i].split(',');
    else if (a.startsWith('--')) throw new Error(`Unknown option ${a}`);
    else opts.paths.push(resolve(a));
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const results = await runChecks(opts);
  let failed = 0;
  for (const r of results) {
    if (r.skipped) console.log(`- ${r.name}: skipped (${r.skipped})`);
    else if (r.errors.length === 0) console.log(`✔ ${r.name}`);
    else console.log(`✖ ${r.name}: ${r.errors.length} problem(s)`);
    for (const e of r.errors) console.log(`    ${e.file}${e.line ? `:${e.line}` : ''} ${e.message}`);
    for (const w of r.warnings) console.log(`    warning: ${w}`);
    failed += r.errors.length;
  }
  const scope = opts.paths.length ? ` (scoped to ${opts.paths.length} path(s))` : '';
  console.log(failed ? `\n${failed} problem(s)${scope}.` : `\nAll checks passed${scope}.`);
  process.exitCode = failed ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e);
    process.exitCode = 2;
  });
}
