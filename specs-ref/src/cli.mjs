#!/usr/bin/env node
// specs-ref command line. For demonstration; see README.md.
import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { validateAgentsMd, validateSpecSet } from './conformance.mjs';
import { resolveTargets } from './targets.mjs';

const VERSION = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
const USAGE = `Usage:
  specs-ref validate <path>...   Check against the Agent Specs Specification. A path is a spec set
                                 (a folder with plan.md) or a repository root (its AGENTS.md and
                                 every work/<task-id>/ under it).
  specs-ref commands <spec-set>  Print the verify commands from plan.md and the phase files as JSON.
                                 Nothing is run.
  specs-ref --help | --version

Exit codes: 0 conforms, 1 problems found, 2 usage error.`;

const show = (p) => relative(process.cwd(), p) || '.';

function usage(message) {
  if (message) console.error(`specs-ref: ${message}\n`);
  console.error(USAGE);
  return 2;
}

function validate(paths) {
  if (!paths.length) return usage('validate needs at least one path');
  let problems = 0;
  for (const path of paths) {
    const targets = resolveTargets(path);
    if (!targets) return usage(`${path}: no plan.md, AGENTS.md or work/ folder to check`);
    if (!targets.length) console.log(`- ${show(path)}: no spec sets under work/`);
    for (const t of targets) {
      const errors = t.kind === 'agents' ? validateAgentsMd(readFileSync(t.path, 'utf8'), show(t.path)) : validateSpecSet(t.path).errors;
      if (!errors.length) {
        console.log(`✔ ${show(t.path)} conforms`);
        continue;
      }
      console.log(`✖ ${show(t.path)}: ${errors.length} problem${errors.length === 1 ? '' : 's'}`);
      for (const e of errors) console.log(`  - ${e}`);
      problems += errors.length;
    }
  }
  return problems ? 1 : 0;
}

function commands([dir, ...extra]) {
  if (!dir || extra.length) return usage('commands needs exactly one spec set');
  const targets = resolveTargets(dir);
  if (!targets || targets.length !== 1 || targets[0].kind !== 'spec-set' || !existsSync(join(targets[0].path, 'plan.md'))) {
    return usage(`${dir}: not a spec set (no plan.md)`);
  }
  console.log(JSON.stringify(validateSpecSet(targets[0].path).verify, null, 2));
  return 0;
}

function main([cmd, ...rest]) {
  if (cmd === '--help' || cmd === '-h') return console.log(USAGE), 0;
  if (cmd === '--version' || cmd === '-v') return console.log(VERSION), 0;
  if (cmd === 'validate') return validate(rest);
  if (cmd === 'commands') return commands(rest);
  return usage(cmd ? `unknown command "${cmd}"` : '');
}

process.exitCode = main(process.argv.slice(2));
