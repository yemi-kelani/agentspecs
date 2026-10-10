// Structural conformance to Agent Specs v0.1 (Specification: File requirements, Ownership and write
// rules, Phase lifecycle, Conformance), including the review phase, disjoint Writes and env values for
// phases that can run at the same time, and the leak-check item for confidential sources.
// Shared by the Quickstart runner and the `specsets` check. Reads files only; it never
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
const MANIFEST_COLUMNS = ['Source', 'Origin', 'Version or hash', 'Readable by phases', 'Confidential'];
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

/** Paths in a Writes cell ("out/phase-1/, `src/a.js`"); a dash means none. */
const pathsIn = (cell = '') =>
  cell
    .split(',')
    .map((x) => x.trim().replace(/^`|`$/g, '').replace(/^\.\//, ''))
    .filter((x) => x && !/^[—–-]$/.test(x));
const idsIn = (cell = '') => [...cell.matchAll(/\d+/g)].map((m) => Number(m[0]));
const bare = (p) => p.replace(/\/+$/, '');
/** The more specific of two paths when one contains the other (or they are equal), else null. */
function overlap(a, b) {
  const [x, y] = [bare(a), bare(b)];
  if (x === y || y.startsWith(`${x}/`)) return b;
  if (x.startsWith(`${y}/`)) return a;
  return null;
}

/** For each phase id, the set of phases it depends on, directly or through other phases.
 *  A phase in a dependency cycle appears in its own set. */
function upstream(rows) {
  const up = new Map();
  for (const id of rows.keys()) {
    const seen = new Set();
    const queue = [...(rows.get(id).deps ?? [])];
    while (queue.length) {
      const d = queue.shift();
      if (seen.has(d)) continue;
      seen.add(d);
      queue.push(...(rows.get(d)?.deps ?? []));
    }
    up.set(id, seen);
  }
  return up;
}

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
  const rows = new Map(); // id -> { file, writes, deps }, in table order
  if (!table) err('plan.md: Phases has no table');
  else {
    for (const c of PLAN_COLUMNS) if (!table.header.includes(c)) err(`plan.md: Phases table lacks column "${c}"`);
    const col = (row, name) => row[table.header.indexOf(name)] ?? '';
    for (const row of table.rows) {
      if (!/^\d+$/.test(row[0]) || !table.header.includes('Phase file')) continue;
      const id = Number(row[0]);
      planPhases.set(id, col(row, 'Phase file'));
      if (!new RegExp(`^phases/phase-${id}-[^/]+\\.md$`).test(col(row, 'Phase file'))) {
        err(`plan.md: phase ${id}: file ${col(row, 'Phase file')} must be named phases/phase-${id}-<slug>.md`);
      }
      rows.set(id, { file: col(row, 'Phase file'), writes: pathsIn(col(row, 'Writes')), deps: idsIn(col(row, 'Depends on')) });
    }
  }

  // Phases that can run at the same time (neither upstream of the other) must not write the same paths.
  // Phases in a cycle can never be ordered, so they count as concurrent too.
  const up = upstream(rows);
  const concurrent = (a, b) => a !== b && Boolean(up.get(a)?.has(b)) === Boolean(up.get(b)?.has(a));
  const ids = [...rows.keys()].sort((a, b) => a - b);
  for (const id of ids) {
    for (const d of rows.get(id).deps) if (!rows.has(d)) err(`plan.md: phase ${id} depends on phase ${d}, which is not in the table`);
  }
  const cyclic = ids.filter((id) => up.get(id).has(id));
  if (cyclic.length) err(`plan.md: Depends on has a cycle through phase${cyclic.length > 1 ? 's' : ''} ${cyclic.join(', ')}`);
  for (const [i, a] of ids.entries()) {
    for (const b of ids.slice(i + 1)) {
      if (!concurrent(a, b)) continue;
      for (const pa of rows.get(a).writes) {
        for (const pb of rows.get(b).writes) {
          const shared = overlap(pa, pb);
          if (shared) err(`plan.md: phases ${a} and ${b} can run at the same time but both write ${shared}`);
        }
      }
    }
  }

  // More than one phase: the last is a review phase that depends on all others and re-runs acceptance.
  if (rows.size > 1) {
    const last = [...rows.keys()].at(-1);
    const { file, writes, deps } = rows.get(last);
    if (!/(^|\/)phase-\d+-review\.md$/.test(file)) {
      err(`plan.md: with more than one phase, the last phase must be a review phase (phases/phase-${last}-review.md)`);
    } else {
      const missing = ids.filter((id) => id !== last && !deps.includes(id));
      if (missing.length) err(`plan.md: review phase ${last} must depend on every other phase (missing ${missing.join(', ')})`);
      if (writes.length !== 1 || bare(writes[0]) !== `out/phase-${last}`) err(`plan.md: review phase ${last} must write only out/phase-${last}/`);
      const text = read(insideDir(dir, file) ?? '');
      if (text) {
        const own = commandsUnder(text, 'Verify');
        for (const cmd of commandsUnder(plan, 'Global acceptance')) {
          if (!own.includes(cmd)) err(`${file}: review phase ${last}: Verify lacks Global acceptance command \`${cmd}\``);
        }
      }
    }
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
    if ('env' in p && (typeof p.env !== 'object' || p.env === null || Array.isArray(p.env) || Object.values(p.env).some((v) => typeof v !== 'string'))) {
      err(`${where}: "env" must map names to strings`);
    }
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

  // Phases that can run at the same time must not share a runtime value (port, temp folder, database).
  const envs = phases.filter((p) => p.env && typeof p.env === 'object' && !Array.isArray(p.env));
  for (const [i, a] of envs.entries()) {
    for (const b of envs.slice(i + 1)) {
      if (!concurrent(a.id, b.id)) continue;
      for (const [k, v] of Object.entries(a.env)) {
        if (b.env[k] === v) err(`state.json: phases ${a.id} and ${b.id} can run at the same time but share env ${k}=${v}`);
      }
    }
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
    else {
      for (const c of MANIFEST_COLUMNS) if (!t.header.includes(c)) err(`sources/MANIFEST.md: table lacks column "${c}"`);
      const k = t.header.indexOf('Confidential');
      const marks = k < 0 ? [] : t.rows.map((r) => ({ source: r[0], value: (r[k] ?? '').toLowerCase() }));
      for (const m of marks) if (!['yes', 'no'].includes(m.value)) err(`sources/MANIFEST.md: row "${m.source}": Confidential must be yes or no`);
      const leakCheck = acceptance
        .split('\n')
        .some((l) => /^\s*-\s+\[[ xX]\]/.test(l) && /`[^`]+`/.test(l) && /\bleak check\b/i.test(l));
      if (marks.some((m) => m.value === 'yes')) {
        if (!leakCheck) err('plan.md: sources/MANIFEST.md marks a source confidential, so Global acceptance needs a leak check item with its command');
        if (!/\bterm list\b/i.test(section(plan, 'Constraints and invariants') ?? '')) {
          err('plan.md: sources/MANIFEST.md marks a source confidential, so Constraints and invariants must say where the term list lives');
        }
      }
    }
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
