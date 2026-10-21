// Structural conformance to the Agent Specs packet format v0.2 (Packet anatomy page: Files, State
// rules, Gates and Conformance). Used by the specs-ref CLI and by the site's Quickstart runner and
// `packets` check. Reads files only; it never runs commands. validatePacket returns
// { errors, commands } where commands lists the commands that acceptance/README.md Run and each slice
// brief's Checks name, for a caller that wants to run them.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, isAbsolute, join, relative, resolve, sep } from 'node:path';

export const FORMAT = 'agentspecs packet v0.2';
export const STATUSES = ['pending', 'in_progress', 'disputed', 'blocked', 'done'];
export const REQUIRED = {
  plan: ['Goal', 'Non-goals', 'Assumptions and resolved questions', 'Constraints', 'Repo grounding', 'Slices', 'Decisions', 'Surprises'],
  slice: ['Objective', 'Behavior', 'Requirements', 'Files and APIs', 'Checks', 'Out of scope', 'Report'],
  acceptance: ['Run', 'Checks', 'Hold-outs', 'Disputes'],
  handoff: ['Changed', 'Dead ends', 'Superseded facts', 'Check results', 'Verification'],
};
const SLICE_COLUMNS = ['ID', 'Behavior', 'Check'];
const ACCEPTANCE_COLUMNS = ['Slice', 'Files', 'Reviewed by'];
const UPDATED = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/;
const SLICE_ID = /^\d{2}$/;
const BRIEF_NAME = /^(\d{2})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;

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

const listItems = (body = '') => [...body.matchAll(/^\s*-\s+\S.*$/gm)].map((m) => m[0]);

/** First Markdown table in text: { header: [..], rows: [[..], ..] } or null. */
function firstTable(text = '') {
  const lines = text.split('\n').map((l) => l.trim());
  const i = lines.findIndex((l, k) => l.startsWith('|') && /^\|[\s:|-]+\|$/.test(lines[k + 1] ?? ''));
  if (i < 0) return null;
  const cells = (l) => l.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  const rows = [];
  for (let k = i + 2; k < lines.length && lines[k].startsWith('|'); k++) rows.push(cells(lines[k]));
  return { header: cells(lines[i]), rows };
}

function requireSections(md, required, where) {
  const have = headings(md);
  const missing = required.filter((h) => !have.includes(h));
  if (missing.length) return missing.map((h) => `${where}: missing section "${h}"`);
  if (have.filter((h) => required.includes(h)).join('\n') !== required.join('\n')) {
    return [`${where}: required sections out of order (expected ${required.join(', ')})`];
  }
  return [];
}

function insideDir(dir, rel) {
  if (typeof rel !== 'string' || isAbsolute(rel)) return null;
  const abs = resolve(dir, rel);
  return (abs + sep).startsWith(resolve(dir) + sep) ? abs : null;
}

const read = (p) => (p && existsSync(p) && statSync(p).isFile() ? readFileSync(p, 'utf8') : null);

/** Paths in a table cell ("acceptance/a.test.js, `acceptance/b.sh`"); a dash means none. */
const pathsIn = (cell = '') =>
  cell
    .split(',')
    .map((x) => x.trim().replace(/^`|`$/g, '').replace(/^\.\//, ''))
    .filter((x) => x && !/^[—–-]$/.test(x));
const placeholder = (cell = '') => !cell.trim() || /^[—–-]$/.test(cell.trim()) || /^<.*>$/.test(cell.trim());
const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

/** Validate one packet folder (packets/<task-id>/). */
export function validatePacket(dir) {
  const name = basename(dir);
  const errors = [];
  const commands = [];
  const err = (msg) => errors.push(`${name}/${msg}`);

  // plan.md
  const plan = read(join(dir, 'plan.md'));
  if (plan === null) return { errors: [`${name}/plan.md is missing`], commands };
  errors.push(...requireSections(plan, REQUIRED.plan, `${name}/plan.md`));
  for (const h of ['Assumptions and resolved questions', 'Repo grounding']) {
    if (section(plan, h) !== null && listItems(section(plan, h)).length === 0) err(`plan.md: ${h} has no list item`);
  }
  const decisions = section(plan, 'Decisions') ?? '';
  const table = firstTable(section(plan, 'Slices') ?? '');
  const slices = new Map(); // id -> { behavior, checks }
  if (!table) err('plan.md: Slices has no table');
  else {
    for (const c of SLICE_COLUMNS) if (!table.header.includes(c)) err(`plan.md: Slices table lacks column "${c}"`);
    const col = (row, c) => row[table.header.indexOf(c)] ?? '';
    for (const row of table.rows) {
      const id = col(row, 'ID').replace(/`/g, '');
      if (!SLICE_ID.test(id)) {
        err(`plan.md: slice id "${id}" must be two digits, such as 01`);
        continue;
      }
      if (slices.has(id)) err(`plan.md: slice ${id} appears twice`);
      if (placeholder(col(row, 'Behavior'))) err(`plan.md: slice ${id} has no behavior`);
      const checks = pathsIn(col(row, 'Check'));
      if (!checks.length) err(`plan.md: slice ${id} names no check`);
      for (const c of checks) {
        if (!c.startsWith('acceptance/')) err(`plan.md: slice ${id}: check ${c} is not under acceptance/`);
        else if (!read(insideDir(dir, c))) err(`plan.md: slice ${id}: check ${c} does not exist`);
      }
      slices.set(id, { checks });
    }
    if (table.header.includes('ID') && !slices.size) err('plan.md: Slices table has no slice');
  }

  // slices/
  const slicesDir = join(dir, 'slices');
  const briefs = new Map(); // id -> relative path
  const onDisk = existsSync(slicesDir) ? readdirSync(slicesDir).filter((f) => f.endsWith('.md')).sort() : [];
  for (const f of onDisk) {
    const m = BRIEF_NAME.exec(f);
    if (!m) err(`slices/${f}: name must be NN-<slug>.md (lowercase, hyphens)`);
    else if (!slices.has(m[1])) err(`slices/${f} is not in the plan.md Slices table`);
    else if (briefs.has(m[1])) err(`slices/: slice ${m[1]} has more than one brief`);
    else briefs.set(m[1], `slices/${f}`);
  }
  for (const id of slices.keys()) {
    const rel = briefs.get(id);
    if (!rel) {
      err(`slices/: no brief for slice ${id} (expected slices/${id}-<slug>.md)`);
      continue;
    }
    const text = read(join(dir, rel));
    if (!new RegExp(`^# Slice ${id} — \\S`, 'm').test(text)) err(`${rel}: heading must be "# Slice ${id} — <name>"`);
    errors.push(...requireSections(text, REQUIRED.slice, `${name}/${rel}`));
    const cmds = commandsUnder(text, 'Checks');
    if (!cmds.length) err(`${rel}: Checks lists no command (each slice ends in a runnable check)`);
    commands.push(...cmds.map((cmd) => ({ cmd, from: `${name}/${rel}`, slice: id })));
  }

  // acceptance/README.md
  const acc = read(join(dir, 'acceptance', 'README.md'));
  if (acc === null) err('acceptance/README.md is missing');
  else {
    errors.push(...requireSections(acc, REQUIRED.acceptance, `${name}/acceptance/README.md`));
    const run = commandsUnder(acc, 'Run');
    if (!run.length) err('acceptance/README.md: Run lists no command');
    commands.push(...run.map((cmd) => ({ cmd, from: `${name}/acceptance/README.md` })));
    const t = firstTable(section(acc, 'Checks') ?? '');
    if (!t) err('acceptance/README.md: Checks has no table');
    else {
      for (const c of ACCEPTANCE_COLUMNS) if (!t.header.includes(c)) err(`acceptance/README.md: Checks table lacks column "${c}"`);
      const col = (row, c) => row[t.header.indexOf(c)] ?? '';
      const listed = new Map(t.rows.map((row) => [col(row, 'Slice').replace(/`/g, ''), row]));
      for (const [id, { checks }] of slices) {
        const row = listed.get(id);
        if (!row) err(`acceptance/README.md: Checks table has no row for slice ${id}`);
        else {
          if (!sameSet(pathsIn(col(row, 'Files')), checks)) err(`acceptance/README.md: slice ${id} files differ from plan.md (${checks.join(', ')})`);
          if (placeholder(col(row, 'Reviewed by'))) err(`acceptance/README.md: slice ${id} checks have no reviewer (Reviewed by)`);
        }
      }
      for (const id of listed.keys()) if (!slices.has(id)) err(`acceptance/README.md: slice ${id} is not in plan.md`);
    }
  }

  // state.json
  let state = null;
  try {
    state = JSON.parse(read(join(dir, 'state.json')) ?? 'null');
  } catch (e) {
    err(`state.json does not parse: ${e.message}`);
    return { errors, commands };
  }
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    err('state.json is missing');
    return { errors, commands };
  }
  for (const k of ['packet', 'format', 'updated', 'slices']) if (!(k in state)) err(`state.json: missing key "${k}"`);
  if (state.packet !== name) err(`state.json: "packet" is ${JSON.stringify(state.packet)}; it must equal the folder name "${name}"`);
  if (state.format !== FORMAT) err(`state.json: "format" is ${JSON.stringify(state.format)}; expected "${FORMAT}"`);
  if (!UPDATED.test(String(state.updated))) err(`state.json: "updated" is ${JSON.stringify(state.updated)}; expected YYYY-MM-DDTHH:MMZ`);
  const entries = Array.isArray(state.slices) ? state.slices : [];
  if (!entries.length) err('state.json: "slices" is empty');
  const stateIds = new Set(entries.map((s) => s.id));
  for (const id of slices.keys()) if (!stateIds.has(id)) err(`plan.md: slice ${id} is not in state.json`);

  const started = entries.some((s) => s.status && s.status !== 'pending');
  if (started && !/\bplan review\b/i.test(decisions)) {
    err('plan.md: a slice has left pending, so Decisions must record the plan review (an entry with "plan review")');
  }

  for (const s of entries) {
    const where = `state.json: slice ${s.id}`;
    if (typeof s.id !== 'string' || !SLICE_ID.test(s.id)) err(`${where}: "id" must be a two-digit string such as "01"`);
    if (!slices.has(s.id)) err(`${where} is not in the plan.md Slices table`);
    else if (briefs.get(s.id) && s.brief !== briefs.get(s.id)) err(`${where}: brief ${s.brief} differs from ${briefs.get(s.id)}`);
    if (!STATUSES.includes(s.status)) err(`${where}: status "${s.status}" is not one of ${STATUSES.join(', ')}`);
    if (typeof s.passes !== 'boolean') err(`${where}: "passes" must be true or false`);
    if (!Number.isInteger(s.failures) || s.failures < 0) err(`${where}: "failures" must be a whole number`);
    if (!(s.handoff === null || typeof s.handoff === 'string')) err(`${where}: "handoff" must be a path or null`);
    if (s.passes === true && s.status !== 'done') err(`${where}: passes is true but status is "${s.status}"`);
    if (s.status === 'done' && s.passes !== true) err(`${where}: status is done but passes is not true`);
    if (Number.isInteger(s.failures) && s.failures >= 2 && !new RegExp(`\\breplan\\b[^\\n]*\\b${s.id}\\b|\\b${s.id}\\b[^\\n]*\\breplan\\b`, 'i').test(decisions)) {
      err(`${where}: ${s.failures} failed verifications, so plan.md Decisions must record a replan that names slice ${s.id}`);
    }

    const needsHandoff = s.status === 'done' || s.status === 'disputed';
    if (!needsHandoff && s.handoff === null) continue;
    const expected = `handoffs/${s.id}.md`;
    if (s.handoff !== expected) {
      err(`${where}: handoff is ${JSON.stringify(s.handoff)}; expected "${expected}"`);
      continue;
    }
    const h = read(insideDir(dir, s.handoff));
    if (!h) {
      err(`${where}: handoff ${s.handoff} is missing`);
      continue;
    }
    if (!new RegExp(`^# Handoff — Slice ${s.id}\\s*$`, 'm').test(h)) err(`${s.handoff}: heading must be "# Handoff — Slice ${s.id}"`);
    errors.push(...requireSections(h, REQUIRED.handoff, `${name}/${s.handoff}`));
    if (!/\S/.test((section(h, 'Check results') ?? '').replace(/<[^>]*>/g, ''))) err(`${s.handoff}: Check results is empty`);
    const verdict = /^Verdict: (PASS|FAIL)\s*$/m.exec(section(h, 'Verification') ?? '')?.[1];
    if (s.status === 'done') {
      if (!verdict) err(`${s.handoff}: Verification has no "Verdict: PASS" line`);
      else if (verdict !== 'PASS') err(`${s.handoff}: Verdict is ${verdict} but state.json says done`);
    }
    if (s.status === 'disputed' && !listItems(section(h, 'Dispute') ?? '').length) {
      err(`${s.handoff}: slice is disputed, so the handoff needs a "## Dispute" section with the disputed check and why`);
    }
  }

  // handoffs/ holds one file per slice id, nothing else.
  const hDir = join(dir, 'handoffs');
  for (const f of existsSync(hDir) ? readdirSync(hDir).filter((x) => x.endsWith('.md')) : []) {
    if (!slices.has(f.replace(/\.md$/, ''))) err(`handoffs/${f} does not match a slice id in plan.md`);
  }

  return { errors, commands };
}

/** Packets under a root: every packets/<task-id>/ folder that holds plan.md. */
export function findPackets(root) {
  const base = join(root, 'packets');
  if (!existsSync(base)) return [];
  return readdirSync(base)
    .map((n) => join(base, n))
    .filter((d) => statSync(d).isDirectory() && existsSync(join(d, 'plan.md')))
    .sort();
}

export const relativeTo = (from, p) => relative(from, p).split(sep).join('/');
