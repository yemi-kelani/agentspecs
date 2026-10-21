#!/usr/bin/env node
// specs-ref command line. For demonstration; see README.md.
import { existsSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { validatePacket } from './conformance.mjs';
import { resolveTargets } from './targets.mjs';

const VERSION = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
const USAGE = `Usage:
  specs-ref validate <path>...   Check against the Agent Specs packet format. A path is a packet
                                 (a folder with plan.md) or a repository root (every
                                 packets/<task-id>/ under it).
  specs-ref commands <packet>    Print the check commands from acceptance/README.md and the slice
                                 briefs as JSON. Nothing is run.
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
    if (!targets) return usage(`${path}: no plan.md or packets/ folder to check`);
    if (!targets.length) console.log(`- ${show(path)}: no packets under packets/`);
    for (const dir of targets) {
      const { errors } = validatePacket(dir);
      if (!errors.length) {
        console.log(`✔ ${show(dir)} conforms`);
        continue;
      }
      console.log(`✖ ${show(dir)}: ${errors.length} problem${errors.length === 1 ? '' : 's'}`);
      for (const e of errors) console.log(`  - ${e}`);
      problems += errors.length;
    }
  }
  return problems ? 1 : 0;
}

function commands([dir, ...extra]) {
  if (!dir || extra.length) return usage('commands needs exactly one packet');
  if (!existsSync(join(resolve(dir), 'plan.md'))) return usage(`${dir}: not a packet (no plan.md)`);
  console.log(JSON.stringify(validatePacket(resolve(dir)).commands, null, 2));
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
