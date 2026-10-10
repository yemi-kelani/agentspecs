// Structural conformance to Agent Specs v0.1 (Specification: File requirements, Phase lifecycle,
// Conformance). Shared by the Quickstart runner and the `specsets` check. Reads files only; it never
// runs commands. validateSpecSet returns { errors, verify } where verify lists the commands that
// plan.md Global acceptance and each phase's Verify name, for a caller that wants to run them.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, isAbsolute, join, relative, resolve, sep } from 'node:path';

export const SPEC_STRING = 'agentspecs v0.1';
export const STATUSES = ['pending', 'in_progress', 'done', 'blocked'];
export const REQUIRED = {
  agents: ['Commands', 'Rules the code does not show', 'Routing', 'Boundaries'],
  plan: ['Goal', 'Non-goals', 'Constraints and invariants', 'Global acceptance', 'Phases', 'Shared definitions'],
  phase: ['Objective', 'Inputs', 'Boundaries', 'Tools and permissions', 'Steps', 'Output contract', 'Verify', 'Stop conditions'],
  handoff: ['Produced', 'Key facts for later phases', 'Decisions', 'Open issues', 'Sources used'],
  progress: ['Progress', 'Surprises and discoveries', 'Decision log', 'Outcomes and retrospective'],
};
const PLAN_COLUMNS = ['#', 'Phase file', 'Reads', 'Writes', 'Depends on', 'Skills'];
const MANIFEST_COLUMNS = ['Source', 'Origin', 'Version or hash', 'Readable by phases'];
const UPDATED = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/;
const ENTRY_TIME = /\(\d{4}-\d{2}-\d{2} \d{2}:\d{2}Z\)/;

const headings = (md) => [...md.matchAll(/^## (.+?)\s*$/gm)].map((m) => m[1]);

/** Body of the `## heading` section (up to the next h2), or null. */
export function section(md, heading) {
  const start = new RegExp(`^## ${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm').exec(md);
  if (!start) return null;
  const rest = md.slice(start.index + start[0].length);
  const next = /^## /m.exec(rest);
  return next ? rest.slice(0, next.index) : rest;
}

/** Commands from list items that start with a `code span`, under the given h2. */
export function commandsUnder(md, heading) {
  const body = section(md, heading) ?? '';
  return [...body.matchAll(/^\s*-\s+(?:\[[ xX]\]\s+)?`([^`]+)`/gm)].map((x) => x[1]);
}

/** First Markdown table in text: { header: [..], rows: [[..], ..] } or null. */
function firstTable(text) {
  const lines = text.split('\n').map((l) => l.trim());
  const i = lines.findIndex((l, k) => l.startsWith('|') && /^\|[\s:|-]+\|$/.test(lines[k + 1] ?? ''));
  if (i < 0) return null;
  const cells = (l) => l.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  const rows = [];
  for (let k = i + 2; k < lines.length && lines[k].startsWith('|'); k++) rows.push(cells(lines[k]));
  return { header: cells(lines[i]), rows };
}

function requireSections(md, required, where, { ordered = true } = {}) {
  const have = headings(md);
  const missing = required.filter((h) => !have.includes(h));
  if (missing.length) return missing.map((h) => `${where}: missing section "${h}"`);
  if (ordered && have.filter((h) => required.includes(h)).join('\n') !== required.join('\n')) {
    return [`${where}: required sections out of order (expected ${required.join(', ')})`];
  }
  return [];
}

/** Errors for a repository AGENTS.md (Specification: File requirements > AGENTS.md). */
export function validateAgentsMd(md, where = 'AGENTS.md') {
  const errors = requireSections(md, REQUIRED.agents, where);
  if (errors.length) return errors;
  const table = firstTable(section(md, 'Routing'));
  if (!table || !table.rows.some((r) => r.join(' ').includes('work/'))) {
    errors.push(`${where}: Routing has no row that sends multi-step work to work/<task-id>/`);
  }
  return errors;
}

function insideDir(dir, rel) {
  if (typeof rel !== 'string' || isAbsolute(rel)) return null;
  const abs = resolve(dir, rel);
  return (abs + sep).startsWith(resolve(dir) + sep) ? abs : null;
}

const read = (p) => (existsSync(p) && statSync(p).isFile() ? readFileSync(p, 'utf8') : null);

/** Validate one work/<task-id>/ spec set. */
export function validateSpecSet(dir) {
  const name = basename(dir);
  const errors = [];
  const verify = [];
  const err = (msg) => errors.push(`${name}/${msg}`);

  // plan.md
  const plan = read(join(dir, 'plan.md'));
  if (plan === null) return { errors: [`${name}/plan.md is missing`], verify };
  errors.push(...requireSections(plan, REQUIRED.plan, `${name}/plan.md`));
  const acceptance = section(plan, 'Global acceptance') ?? '';
  if (!/^\s*-\s+\[[ xX]\]/m.test(acceptance)) err('plan.md: Global acceptance must be a task list');
  verify.push(...commandsUnder(plan, 'Global acceptance').map((cmd) => ({ cmd, from: `${name}/plan.md` })));
  const table = firstTable(section(plan, 'Phases') ?? '');
  const planPhases = new Map(); // id -> file
  if (!table) err('plan.md: Phases has no table');
  else {
    for (const c of PLAN_COLUMNS) if (!table.header.includes(c)) err(`plan.md: Phases table lacks column "${c}"`);
    const fileCol = table.header.indexOf('Phase file');
    for (const row of table.rows) if (/^\d+$/.test(row[0]) && fileCol >= 0) planPhases.set(Number(row[0]), row[fileCol]);
  }

  // state.json
  let state = null;
  try {
    state = JSON.parse(read(join(dir, 'state.json')) ?? 'null');
  } catch (e) {
    err(`state.json does not parse: ${e.message}`);
  }
  if (!state || typeof state !== 'object') {
    if (!errors.some((e) => e.includes('state.json'))) err('state.json is missing');
    return { errors, verify };
  }
  for (const k of ['task', 'spec', 'updated', 'phases']) if (!(k in state)) err(`state.json: missing key "${k}"`);
  if (state.task !== name) err(`state.json: "task" is ${JSON.stringify(state.task)}; it must equal the folder name "${name}"`);
  if (state.spec !== SPEC_STRING) err(`state.json: "spec" is ${JSON.stringify(state.spec)}; expected "${SPEC_STRING}"`);
  if (!UPDATED.test(String(state.updated))) err(`state.json: "updated" is ${JSON.stringify(state.updated)}; expected YYYY-MM-DDTHH:MMZ`);
  const phases = Array.isArray(state.phases) ? state.phases : [];
  if (!phases.length) err('state.json: "phases" is empty');

  // Same phases in plan.md, phases/ and state.json.
  const stateIds = new Set(phases.map((p) => p.id));
  for (const [id, file] of planPhases) if (!stateIds.has(id)) err(`plan.md: phase ${id} (${file}) is not in state.json`);
  const phasesDir = join(dir, 'phases');
  const onDisk = existsSync(phasesDir) ? readdirSync(phasesDir).filter((f) => f.endsWith('.md')).map((f) => `phases/${f}`) : [];
  for (const f of onDisk) if (![...planPhases.values()].includes(f)) err(`${f} is not in the plan.md Phases table`);

  for (const p of phases) {
    const where = `state.json: phase ${p.id}`;
    if (!Number.isInteger(p.id)) err(`${where}: "id" must be an integer`);
    if (!STATUSES.includes(p.status)) err(`${where}: status "${p.status}" is not one of ${STATUSES.join(', ')}`);
    if (typeof p.verified !== 'boolean') err(`${where}: "verified" must be true or false`);
    if (p.verified === true && p.status !== 'done') err(`${where}: verified is true but status is "${p.status}"`);
    if (!(p.handoff === null || typeof p.handoff === 'string')) err(`${where}: "handoff" must be a path or null`);
    if (!planPhases.has(p.id)) err(`state.json: phase ${p.id} (${p.file}) is not in the plan.md Phases table`);
    else if (planPhases.get(p.id) !== p.file) err(`${where}: file ${p.file} differs from plan.md (${planPhases.get(p.id)})`);

    const phaseAbs = insideDir(dir, p.file);
    const phaseText = phaseAbs && read(phaseAbs);
    if (!phaseText) {
      err(`${where}: phase file ${p.file} is missing or outside the spec set`);
      continue;
    }
    errors.push(...requireSections(phaseText, REQUIRED.phase, `${name}/${p.file}`));
    const cmds = commandsUnder(phaseText, 'Verify');
    if (!cmds.length) err(`${p.file}: Verify lists no command (each phase must end in an executable check)`);
    verify.push(...cmds.map((cmd) => ({ cmd, from: `${name}/${p.file}`, phase: p.id })));

    if (p.status !== 'done') continue;
    if (p.verified !== true) err(`${where}: status is done but verified is not true`);
    const hAbs = insideDir(dir, p.handoff);
    const h = hAbs && read(hAbs);
    if (!h) {
      err(`${where}: handoff ${p.handoff} is missing or outside the spec set`);
      continue;
    }
    const hw = `${p.handoff}`;
    if (!new RegExp(`^# Handoff — Phase ${p.id}\\s*$`, 'm').test(h)) err(`${hw}: heading must be "# Handoff — Phase ${p.id}"`);
    const status = /^Status: (DONE|PARTIAL|BLOCKED)\s*$/m.exec(h)?.[1];
    if (!status) err(`${hw}: no Status line (DONE, PARTIAL or BLOCKED)`);
    else if (status !== 'DONE') err(`${hw}: Status is ${status} but state.json says done`);
    const verifyLines = (h.match(/^Verify:/gm) ?? []).length;
    if (verifyLines < cmds.length) err(`${hw}: ${verifyLines} Verify line(s) for ${cmds.length} verify command(s)`);
    errors.push(...requireSections(h, REQUIRED.handoff, `${name}/${hw}`, { ordered: false }));
  }

  // progress.md
  const progress = read(join(dir, 'progress.md'));
  if (progress === null) err('progress.md is missing');
  else {
    errors.push(...requireSections(progress, REQUIRED.progress, `${name}/progress.md`));
    for (const line of (section(progress, 'Progress') ?? '').split('\n')) {
      if (!/^\s*-\s/.test(line)) continue;
      if (!/^\s*-\s+\[[ xX]\]/.test(line)) err('progress.md: Progress entry is not a task-list item');
      else if (!ENTRY_TIME.test(line)) err('progress.md: Progress entry without a UTC timestamp "(YYYY-MM-DD HH:MMZ)"');
    }
  }

  // sources/
  const srcDir = join(dir, 'sources');
  const srcFiles = existsSync(srcDir) ? readdirSync(srcDir).filter((f) => f !== 'MANIFEST.md' && f !== '.DS_Store') : [];
  const manifest = read(join(srcDir, 'MANIFEST.md'));
  if (srcFiles.length && manifest === null) err('sources/MANIFEST.md is missing');
  if (manifest !== null) {
    const t = firstTable(manifest);
    if (!t) err('sources/MANIFEST.md: no table');
    else for (const c of MANIFEST_COLUMNS) if (!t.header.includes(c)) err(`sources/MANIFEST.md: table lacks column "${c}"`);
  }

  return { errors, verify };
}

/** Spec sets under a root: every work/<task-id>/ folder that holds plan.md. */
export function findSpecSets(root) {
  const work = join(root, 'work');
  if (!existsSync(work)) return [];
  return readdirSync(work)
    .map((n) => join(work, n))
    .filter((d) => statSync(d).isDirectory() && existsSync(join(d, 'plan.md')))
    .sort();
}

export const relativeTo = (from, p) => relative(from, p).split(sep).join('/');
