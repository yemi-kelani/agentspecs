#!/usr/bin/env node
// Ledger page generator.
//   node scripts/gen-evidence.mjs            rewrite the generated region of evidence/ledger.md
//   node scripts/gen-evidence.mjs --check    exit 1 if that region is stale (file untouched)
//   --root <dir>                             site root (default: docs/)
//
// Only the text between the two markers below is rewritten; everything else on the page is
// hand-written. The region is rendered from src/data/evidence.json:
//   - conflicts between rows (id, title, the rows involved, summary)
//   - verified rows grouped by section, each with an anchor (#r18), strength, kind, claim,
//     linked sources, verified date, quote or locator, and caveat; ordered by row number
//   - a table of verified sources (title, authors, venue, date, verified date, link)
//   - dropped rows and claims with the reason, never linked
// Quotes must be under 15 words; a longer one is left out with a warning.
// Output is deterministic: every list is sorted by a fixed key, never by input order.
// Exit codes: 0 ok, 1 stale (--check) or missing markers, 2 unreadable data.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rowAnchor } from '../src/lib/labels.mjs';

export const START = '<!-- evidence:generated:start -->';
export const END = '<!-- evidence:generated:end -->';
export const PAGE = 'src/content/docs/evidence/ledger.md';
export const DATA = 'src/data/evidence.json';
export const MAX_QUOTE_WORDS = 15; // quotes must be shorter than this

/** Section id -> heading, in page order. Unknown sections follow, sorted by id. */
export const SECTIONS = [
  ['context', 'Context and attention'],
  ['standing-context', 'Standing context'],
  ['planning', 'Planning'],
  ['decomposition', 'Breaking work down and keeping state'],
  ['verification', 'Verification'],
  ['delegation', 'Delegation'],
  ['security', 'Trust and security'],
  ['tools', 'How tools and formats work'],
];
export const STRENGTHS = ['strong', 'moderate', 'weak', 'anecdotal'];
export const KINDS = ['finding', 'practice', 'documentation'];

const DEFAULT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ---------- text helpers ----------

const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const byId = (a, b) => cmp(String(a.id), String(b.id));
const ALNUM = /[\p{L}\p{N}]/u;

/** Escape characters Markdown would read as code, emphasis, links, HTML, table cells or strikethrough. */
export function md(text) {
  const s = String(text ?? '')
    .replace(/\s*\n\s*/g, ' ')
    .trim()
    .replace(/\\/g, '\\\\')
    .replace(/[`*[\]<|~]/g, (c) => `\\${c}`);
  // Intraword underscores (when_to_use) are literal in Markdown; escape the rest.
  return s.replace(/_/g, (u, i) => (ALNUM.test(s[i - 1] ?? '') && ALNUM.test(s[i + 1] ?? '') ? u : '\\_'));
}

/** End a sentence with a period unless it already ends with terminal punctuation. */
function sentence(text) {
  const s = String(text ?? '').trim();
  return /[.!?]["'”’)\]]*$/.test(s) ? s : `${s}.`;
}

function host(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Row order: R2 < R10, R1 < R1a < R1b. */
export function rowKey(row) {
  const m = /^R(\d+)([a-z]?)$/.exec(String(row ?? ''));
  return m ? [Number(m[1]), m[2]] : [Infinity, String(row)];
}
export const byRow = (a, b) => {
  const [na, sa] = rowKey(a.row);
  const [nb, sb] = rowKey(b.row);
  return na - nb || cmp(sa, sb) || byId(a, b);
};

const wordCount = (s) => String(s).split(/\s+/).filter((w) => ALNUM.test(w)).length;
const link = (source) => `[${md(source.title)}](${source.url})`;
export const rowLink = (row) => `[${row}](#${rowAnchor(row)})`;

// ---------- rendering ----------

/**
 * Render the generated region body (without markers) from evidence.json data.
 * `warn` receives one message per item left out because of a data problem.
 */
export function renderGenerated(evidence, { warn = () => {} } = {}) {
  const sources = [...(evidence.sources ?? [])].sort(byId);
  const claims = [...(evidence.claims ?? [])].sort(byRow);
  const sourceById = new Map(sources.map((s) => [s.id, s]));
  const isVerified = (s) => s && s.status === 'verified';

  // Verified sources for a claim, the one matching claim.url first, de-duplicated by URL.
  const claimSources = (c) => {
    const listed = (c.sources ?? []).map((id) => sourceById.get(id)).filter(isVerified);
    const primary = listed.filter((s) => s.url === c.url);
    const seen = new Set();
    return [...primary, ...listed].filter((s) => !seen.has(s.url) && seen.add(s.url));
  };

  const rows = [];
  for (const c of claims.filter((x) => x.status === 'verified')) {
    if (!/^R\d+[a-z]?$/.test(String(c.row ?? ''))) warn(`${c.id}: no row id; left out`);
    else if (!STRENGTHS.includes(c.strength)) warn(`${c.id}: unknown strength "${c.strength}"; left out`);
    else if (!KINDS.includes(c.kind)) warn(`${c.id}: unknown kind "${c.kind}"; left out`);
    else if (claimSources(c).length === 0) warn(`${c.id}: no verified source; left out`);
    else rows.push(c);
  }
  const shown = new Set(rows.map((c) => c.row));
  const known = new Map(SECTIONS);
  const sectionOf = (c) => c.section || 'other';
  const extra = [...new Set(rows.map(sectionOf).filter((t) => !known.has(t)))].sort(cmp);
  const order = [...SECTIONS.map(([id]) => id), ...extra];

  const verifiedSources = sources.filter(isVerified);
  const otherSources = sources.filter((s) => !isVerified(s));
  const dropped = claims.filter((c) => c.status === 'dropped');
  const conflicts = [...(evidence.conflicts ?? [])].sort(byId);
  const tally = (key, values) => values.map((v) => `${rows.filter((c) => c[key] === v).length} ${v}`).join(', ');

  const out = [];
  const push = (...lines) => out.push(...lines);
  push(
    '<!-- Generated by scripts/gen-evidence.mjs from src/data/evidence.json. Do not edit by hand: change the data, then run `node scripts/gen-evidence.mjs`. -->',
    '',
    `${rows.length} verified rows (${tally('strength', STRENGTHS)}; ${tally('kind', KINDS)}), ${verifiedSources.length} verified sources, ${conflicts.length} conflicts and ${dropped.length} dropped rows, generated from \`src/data/evidence.json\` (data dated ${md(evidence.generated ?? 'unknown')}).`,
    '',
    '## Conflicts',
    '',
    'Rows that point different ways. Each conflict names its rows and says what the disagreement does and does not cover.',
  );
  if (conflicts.length === 0) push('', 'None recorded.');
  for (const cf of conflicts) {
    const missing = (cf.rows ?? []).filter((r) => !shown.has(r));
    if (missing.length) warn(`${cf.id}: rows ${missing.join(', ')} are not shown`);
    push('', `### ${md(cf.id)}: ${md(cf.title)}`, '', `Rows: ${(cf.rows ?? []).map(rowLink).join(', ')}.`, '', md(sentence(cf.summary)));
  }

  for (const t of order) {
    const group = rows.filter((c) => sectionOf(c) === t);
    if (group.length === 0) continue;
    push('', `## ${md(known.get(t) ?? t)}`, '');
    for (const c of group) {
      const srcs = claimSources(c);
      const cites = srcs.map((s) => `${link(s)} (${host(s.url)})`).join('; ');
      const q = String(c.quote ?? '').trim();
      let where = '';
      if (q && wordCount(q) >= MAX_QUOTE_WORDS) warn(`${c.id}: quote has ${wordCount(q)} words (limit is under ${MAX_QUOTE_WORDS}); left out`);
      else if (q) where = ` Quote: “${md(q)}”${c.locator ? ` (${md(c.locator)})` : ''}.`;
      if (!where && c.locator) where = ` Locator: ${md(c.locator)}.`;
      const caveat = String(c.caveat ?? '').trim() ? ` Caveat: ${md(sentence(c.caveat))}` : '';
      push(
        `- <span id="${rowAnchor(c.row)}"></span>**${c.row}** · ${c.strength} · ${c.kind} · ${md(sentence(c.claim))} ` +
          `${srcs.length > 1 ? 'Sources' : 'Source'}: ${cites}. Verified ${md(c.verified)}.${where}${caveat} \`${c.id}\``,
      );
    }
  }

  push('', '## Sources', '', '| Source | Authors | Venue | Date | Verified | Link |', '| --- | --- | --- | --- | --- | --- |');
  for (const s of verifiedSources) {
    push(`| ${md(s.title)} | ${md(s.authors)} | ${md(s.venue || s.type || '')} | ${md(s.date || 'n.d.')} | ${md(s.verified)} | [${md(host(s.url))}](${s.url}) |`);
  }
  if (otherSources.length) {
    push('', 'Sources that could not be verified are never cited:', '');
    for (const s of otherSources) push(`- ${md(s.title)} (${md(s.authors)}): ${md(s.status || 'not verified')}.`);
  }

  push('', '## Dropped', '', 'Rows and claims the sources did not support as stated. No page relies on them.', '');
  if (dropped.length === 0) push('None.');
  for (const c of dropped) {
    const why = String(c.drop_reason ?? '').trim() ? ` Why dropped: ${md(sentence(c.drop_reason))}` : '';
    const row = c.row ? `<span id="${rowAnchor(c.row)}"></span>**${c.row}** · ` : '';
    push(`- ${row}${md(sentence(c.claim))}${why} \`${c.id}\``);
  }

  return out.join('\n') + '\n';
}

// ---------- region handling ----------

/** Find the markers. Returns { innerStart, innerEnd, line } or { error, line }. */
export function locate(text) {
  const s = text.indexOf(START);
  const e = text.indexOf(END);
  const lineAt = (i) => text.slice(0, i).split('\n').length;
  if (s === -1 || e === -1) return { error: `missing ${START} … ${END} markers`, line: 1 };
  if (e < s) return { error: `${END} comes before ${START}`, line: lineAt(e) };
  if (text.indexOf(START, s + 1) !== -1 || text.indexOf(END, e + 1) !== -1) {
    return { error: `${START} and ${END} must each appear once`, line: lineAt(s) };
  }
  return { innerStart: s + START.length, innerEnd: e, line: lineAt(s) };
}

/** Replace the text between the markers with "\n" + body. Throws if the markers are missing. */
export function replaceRegion(text, body) {
  const loc = locate(text);
  if (loc.error) throw new Error(loc.error);
  return text.slice(0, loc.innerStart) + '\n' + body + text.slice(loc.innerEnd);
}

/** The page text as it should be for this evidence data. */
export function expectedPage(text, evidence, opts) {
  // A blank line before the end marker keeps it out of the last list item.
  return replaceRegion(text, renderGenerated(evidence, opts) + '\n');
}

/** Compare a page with the data. Returns {} when up to date, else { error, line }. */
export function compareRegion(text, evidence) {
  const loc = locate(text);
  if (loc.error) return loc;
  if (expectedPage(text, evidence) !== text) {
    return { error: 'generated region is stale; run `node scripts/gen-evidence.mjs`', line: loc.line };
  }
  return {};
}

// ---------- CLI ----------

function main(argv) {
  let root = DEFAULT_ROOT;
  let checkOnly = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--check') checkOnly = true;
    else if (argv[i] === '--root') root = resolve(argv[++i]);
    else {
      console.error(`Unknown argument ${argv[i]}`);
      return 2;
    }
  }
  const pagePath = join(root, PAGE);
  const dataPath = join(root, DATA);
  for (const p of [pagePath, dataPath]) {
    if (!existsSync(p)) {
      console.error(`${p} not found`);
      return 2;
    }
  }
  let evidence;
  try {
    evidence = JSON.parse(readFileSync(dataPath, 'utf8'));
  } catch (e) {
    console.error(`${DATA} is not valid JSON: ${e.message}`);
    return 2;
  }
  const text = readFileSync(pagePath, 'utf8');
  const loc = locate(text);
  if (loc.error) {
    console.error(`${PAGE}:${loc.line} ${loc.error}`);
    return 1;
  }
  const warnings = [];
  const next = expectedPage(text, evidence, { warn: (w) => warnings.push(w) });
  for (const w of warnings) console.error(`warning: ${w}`);
  if (checkOnly) {
    if (next !== text) {
      console.error(`${PAGE}:${loc.line} generated region is stale; run \`node scripts/gen-evidence.mjs\``);
      return 1;
    }
    console.log(`${PAGE}: generated region is up to date`);
    return 0;
  }
  if (next === text) {
    console.log(`${PAGE}: already up to date`);
  } else {
    writeFileSync(pagePath, next);
    console.log(`${PAGE}: generated region rewritten`);
  }
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
