#!/usr/bin/env node
// npm run check:quickstart — runs the Quickstart page end to end on a temp copy of examples/quickstart.
//
// Page convention (src/content/docs/quickstart.md), top-level fenced blocks in page order:
//   ```bash                  commands; run with `bash -euo pipefail` in the project root
//   ```<lang> title="<path>" full file contents; written to <path> (relative to the project root)
//   ```bash manual           shown to the reader only; the runner copies examples/quickstart instead
//   ```text agent            the prompt for your agent; the runner applies examples/quickstart-solution/ here
// Other blocks are ignored. Each command block runs in its own shell with AGENTSPECS=file://<public dir>.
//
// Assertions: every file in public/templates/ is fetched by a `curl … "$AGENTSPECS/templates/<file>"
// -o <path>` command and arrives unchanged; exactly one agent step; each fetched file, after the page
// fills it in, still has its template's `##` sections in order; AGENTS.md conforms to the
// Specification; each work/<task-id>/ spec set conforms (specs-ref, the reference validator: sections, state
// schema, plan/state/phases agreement, valid DONE handoffs with Verify lines, timestamped progress),
// plan.md is ≤80 lines, every phase ends "done", and every Global acceptance and Verify command exits 0.
// Trust: page commands run like test code (full env) inside a temp copy of the example.
//
// Options (tests use them): --page --example --solution --templates --serve <dir> --keep
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { fencedBlocks, splitFrontmatter } from '../../src/lib/md-utils.mjs';
import { validateAgentsMd, validateSpecSet } from '../../../specs-ref/src/index.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const PLAN_MAX_LINES = 80;
const FETCH = /curl\s[^\n]*?"\$\{?AGENTSPECS\}?\/templates\/([^"]+)"[^\n]*?\s-o\s+("[^"]+"|\S+)/g;
const STATUS = /^Status: (DONE|PARTIAL|BLOCKED)\s*$/m;
const h2s = (md) => [...md.matchAll(/^## (.+?)\s*$/gm)].map((m) => m[1]);

class Failure extends Error {}
const fail = (msg) => { throw new Failure(msg); };

function parseArgs(argv) {
  const opts = {
    page: join(ROOT, 'src/content/docs/quickstart.md'),
    example: join(ROOT, 'examples/quickstart'),
    solution: join(ROOT, 'examples/quickstart-solution'),
    templates: join(ROOT, 'public/templates'),
    serve: join(ROOT, 'public'),
    keep: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i].replace(/^--/, '');
    if (key === 'keep') opts.keep = true;
    else if (key in opts) opts[key] = resolve(argv[++i] ?? fail(`missing value for --${key}`));
    else fail(`unknown option ${argv[i]}`);
  }
  return opts;
}

function classify(block) {
  const [lang = '', ...rest] = block.info.split(/\s+/);
  const title = /title="([^"]*)"/.exec(block.info)?.[1];
  const flags = new Set(rest.filter((w) => !w.includes('=')));
  if (title) return { kind: 'file', title };
  if (lang === 'bash' && flags.has('manual')) return { kind: 'manual' };
  if (lang === 'bash') return { kind: 'run' };
  if (flags.has('agent')) return { kind: 'agent' };
  return { kind: 'other' };
}

function inside(project, rel, where) {
  const abs = resolve(project, rel);
  if (isAbsolute(rel) || !(abs + sep).startsWith(project + sep)) fail(`${where}: path ${rel} leaves the project`);
  return abs;
}

function sh(code, cwd, env) {
  return spawnSync('bash', ['-euo', 'pipefail', '-c', code], { cwd, env, encoding: 'utf8', timeout: 120_000 });
}

function listFiles(dir, base = dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? listFiles(p, base) : [relative(base, p)];
  });
}

function checkSpecSet(project, dir, env, log) {
  const name = relative(project, dir);
  const plan = readFileSync(join(dir, 'plan.md'), 'utf8');
  const planLines = plan.replace(/\n+$/, '').split('\n').length;
  if (planLines > PLAN_MAX_LINES) fail(`${name}/plan.md has ${planLines} lines; the limit is ${PLAN_MAX_LINES}`);
  const { errors, verify } = validateSpecSet(dir);
  if (errors.length) fail(`${name} does not conform to the Specification:\n  - ${errors.join('\n  - ')}`);
  const state = JSON.parse(readFileSync(join(dir, 'state.json'), 'utf8'));
  for (const p of state.phases) if (p.status !== 'done') fail(`${name}: phase ${p.id} status is "${p.status}", expected "done"`);
  for (const { cmd, from } of verify) {
    const r = sh(cmd, project, env);
    if (r.status !== 0) fail(`verify command failed: ${cmd} (from ${from}, exit ${r.status})\n${r.stdout}${r.stderr}`);
    log(`verify ok: ${cmd}  (${from})`);
  }
  log(`${name}: plan.md ${planLines} lines, ${state.phases.length} phase(s) done, ${verify.length} verify command(s) passed`);
}

export function runQuickstart(opts, log = console.log) {
  const page = splitFrontmatter(readFileSync(opts.page, 'utf8'));
  const blocks = fencedBlocks(page.body).map((b) => ({ ...b, line: b.startLine + page.bodyStartLine - 1 }));
  const canonical = readdirSync(opts.templates).filter((f) => statSync(join(opts.templates, f)).isFile());
  if (canonical.length === 0) fail(`no templates in ${opts.templates}`);

  const tmp = mkdtempSync(join(tmpdir(), 'agentspecs-quickstart-'));
  const project = join(tmp, 'project');
  const env = { ...process.env, AGENTSPECS: pathToFileURL(opts.serve).href.replace(/\/$/, '') };
  delete env.NODE_TEST_CONTEXT; // let a nested `node --test` report normally
  try {
    cpSync(opts.example, project, { recursive: true });
    log(`project: copy of ${relative(ROOT, opts.example) || opts.example}; AGENTSPECS=${env.AGENTSPECS}`);
    const fetched = new Set();
    const fetchedTo = new Map(); // project path -> template file name
    let agentSteps = 0;

    for (const b of blocks) {
      const where = `${relative(ROOT, opts.page)} block at line ${b.line}`;
      const kind = classify(b);
      if (kind.kind === 'file') {
        const abs = inside(project, kind.title, where);
        mkdirSync(dirname(abs), { recursive: true });
        writeFileSync(abs, b.body);
        log(`write ${kind.title}`);
      } else if (kind.kind === 'agent') {
        agentSteps++;
        cpSync(opts.solution, project, { recursive: true, force: true });
        log(`agent step: applied ${listFiles(opts.solution).length} file(s) from ${relative(ROOT, opts.solution) || opts.solution}`);
      } else if (kind.kind === 'run') {
        const r = sh(b.body, project, env);
        if (r.status !== 0) fail(`${where} exited with ${r.status ?? r.signal}\n${b.body}${r.stdout}${r.stderr}`);
        log(`run ok: ${where} (${b.body.trim().split('\n').length} line(s))`);
        for (const [, file, rawOut] of b.body.matchAll(FETCH)) {
          const out = rawOut.replace(/^"|"$/g, '');
          const want = join(opts.templates, file);
          if (!existsSync(want)) fail(`${where} fetches ${file}, which is not in ${opts.templates}`);
          const got = inside(project, out, where);
          if (!existsSync(got)) fail(`${where}: ${out} was not written by the fetch of ${file}`);
          if (!readFileSync(got).equals(readFileSync(want))) {
            fail(`${where}: fetched ${file} (${out}) differs from ${relative(ROOT, want) || want}`);
          }
          fetched.add(file);
          fetchedTo.set(out, file);
        }
      } else if (kind.kind === 'manual') {
        log(`skip (manual): ${where}`);
      }
    }

    if (agentSteps !== 1) fail(`expected exactly one \`text agent\` block, found ${agentSteps}`);
    for (const f of canonical) if (!fetched.has(f)) fail(`the page never fetches ${f} from $AGENTSPECS/templates/`);
    log(`templates: ${fetched.size} fetched, all byte-identical to ${relative(ROOT, opts.templates) || opts.templates}`);

    // A filled-in file keeps every `##` section of its template, in order.
    for (const [out, file] of fetchedTo) {
      const want = h2s(readFileSync(join(opts.templates, file), 'utf8'));
      const have = h2s(readFileSync(join(project, out), 'utf8'));
      let i = 0;
      for (const h of have) if (h === want[i]) i++;
      if (i < want.length) fail(`${out} no longer keeps the sections of template ${file} in order; missing "${want[i]}"`);
    }
    log(`templates: ${fetchedTo.size} filled file(s) keep their template sections`);

    const agents = join(project, 'AGENTS.md');
    if (!existsSync(agents)) fail('AGENTS.md is missing at the project root');
    const agentErrors = validateAgentsMd(readFileSync(agents, 'utf8'), 'AGENTS.md');
    if (agentErrors.length) fail(agentErrors.join('\n'));

    const workDir = join(project, 'work');
    const sets = existsSync(workDir)
      ? readdirSync(workDir).map((d) => join(workDir, d)).filter((d) => existsSync(join(d, 'state.json')))
      : [];
    if (sets.length === 0) fail('no spec set found (expected work/<task-id>/state.json)');
    for (const dir of sets) checkSpecSet(project, dir, env, log);
  } finally {
    if (opts.keep) log(`kept ${tmp}`);
    else rmSync(tmp, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    runQuickstart(parseArgs(process.argv.slice(2)));
    console.log('check:quickstart passed');
  } catch (e) {
    console.error(`check:quickstart FAILED: ${e instanceof Failure ? e.message : e.stack}`);
    process.exitCode = 1;
  }
}
