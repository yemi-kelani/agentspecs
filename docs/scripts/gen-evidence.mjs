#!/usr/bin/env node
// Evidence page generator.
//   node scripts/gen-evidence.mjs            rewrite the generated region of evidence.md
//   node scripts/gen-evidence.mjs --check    exit 1 if that region is stale (file untouched)
//   --root <dir>                             site root (default: docs/)
//
// Only the text between the two markers below is rewritten; everything else on the page is
// hand-written. The region is rendered from src/data/evidence.json:
//   - verified claims, grouped by their first topic (label token, claim, linked sources, caveat, id),
//     sorted by label, then source, then id
//   - a table of verified sources (title, authors, date, verified date, link)
//   - quotes: at most one per source, under 15 words, attributed, from verified claims only
//   - dropped claims with the reason and id, never labelled or linked
// Output is deterministic: every list is sorted by a fixed key, never by input order.
// Exit codes: 0 ok, 1 stale (--check) or missing markers, 2 unreadable data.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const START = '<!-- evidence:generated:start -->';
export const END = '<!-- evidence:generated:end -->';
export const PAGE = 'src/content/docs/evidence.md';
export const DATA = 'src/data/evidence.json';
export const MAX_QUOTE_WORDS = 15; // quotes must be shorter than this

const LABEL_ORDER = ['Established', 'Evidence', 'Heuristic', 'Proposal'];

/** Topic id -> heading, in page order. Unknown topics follow, sorted by id. */
export const TOPICS = [
  ['context-limits', 'Context limits'],
  ['sizing', 'Sizing and file length'],
  ['agents-md', 'AGENTS.md and instruction files'],
  ['progressive-disclosure', 'Progressive disclosure'],
  ['skills', 'Agent Skills'],
  ['plans', 'Plans'],
  ['living-state', 'Living state'],
  ['handoffs', 'Handoffs'],
  ['subagents', 'Subagents'],
  ['verification', 'Verification'],
  ['security', 'Security'],
  ['cost', 'Cost'],
  ['formats', 'Formats'],
];

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

/** "A, B, C (team)" -> "A et al."; one or two names stay as written. Commas inside parentheses do not split. */
export function shortAuthors(authors) {
  const parts = [];
  let depth = 0;
  let cur = '';
  for (const ch of String(authors ?? '')) {
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === ',' && depth === 0) {
      parts.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  parts.push(cur.trim());
  return parts.length >= 3 ? `${parts[0]} et al.` : String(authors ?? '').trim();
}

const wordCount = (s) => String(s).split(/\s+/).filter((w) => ALNUM.test(w)).length;
const link = (source) => `[${md(source.title)}](${source.url})`;

// ---------- rendering ----------

/**
 * Render the generated region body (without markers) from evidence.json data.
 * `warn` receives one message per item left out because of a data problem.
 */
export function renderGenerated(evidence, { warn = () => {} } = {}) {
  const sources = [...(evidence.sources ?? [])].sort(byId);
  const claims = [...(evidence.claims ?? [])].sort(byId);
  const sourceById = new Map(sources.map((s) => [s.id, s]));
  const isVerified = (s) => s && s.status === 'verified';

  // Verified sources for a claim, the one matching claim.url first, de-duplicated by URL.
  const claimSources = (c) => {
    const listed = (c.sources ?? []).map((id) => sourceById.get(id)).filter(isVerified);
    const primary = listed.filter((s) => s.url === c.url);
    const seen = new Set();
    return [...primary, ...listed].filter((s) => !seen.has(s.url) && seen.add(s.url));
  };

  const verified = [];
  for (const c of claims.filter((x) => x.status === 'verified')) {
    if (!LABEL_ORDER.includes(c.label)) warn(`${c.id}: unknown label "${c.label}"; claim left out`);
    else if (claimSources(c).length === 0) warn(`${c.id}: no verified source; claim left out`);
    else verified.push(c);
  }

  const known = new Map(TOPICS);
  const topicOf = (c) => (c.topics && c.topics[0]) || 'other';
  const extra = [...new Set(verified.map(topicOf).filter((t) => !known.has(t)))].sort(cmp);
  const order = [...TOPICS.map(([id]) => id), ...extra];
  const heading = (t) => known.get(t) ?? t;

  const out = [];
  const push = (...lines) => out.push(...lines);

  // Quotes: from verified claims only, attributed to the source whose URL the claim cites.
  const quotes = [];
  const quoted = new Set();
  for (const c of verified) {
    const q = String(c.quote ?? '').trim();
    if (!q) continue;
    const src = sources.find((s) => s.url === c.url && isVerified(s));
    if (!src) continue;
    if (wordCount(q) >= MAX_QUOTE_WORDS) {
      warn(`${c.id}: quote has ${wordCount(q)} words (limit is under ${MAX_QUOTE_WORDS}); left out`);
      continue;
    }
    if (quoted.has(src.id)) {
      warn(`${c.id}: ${src.id} already has a quote; left out`);
      continue;
    }
    quoted.add(src.id);
    quotes.push({ q, src });
  }
  quotes.sort((a, b) => byId(a.src, b.src));

  const verifiedSources = sources.filter(isVerified);
  const otherSources = sources.filter((s) => !isVerified(s));
  const dropped = claims.filter((c) => c.status === 'dropped');

  push(
    '<!-- Generated by scripts/gen-evidence.mjs from src/data/evidence.json. Do not edit by hand: change the data, then run `node scripts/gen-evidence.mjs`. -->',
    '',
    '## Claims by topic',
    '',
    `${verified.length} verified claims, ${verifiedSources.length} verified sources, ${quotes.length} quotes and ${dropped.length} dropped claims, generated from \`src/data/evidence.json\` (data dated ${md(evidence.generated ?? 'unknown')}). Each claim appears once, under its main topic, with its label, sources, caveat and id in the evidence file.`,
  );

  for (const t of order) {
    const group = verified
      .filter((c) => topicOf(c) === t)
      .sort(
        (a, b) =>
          LABEL_ORDER.indexOf(a.label) - LABEL_ORDER.indexOf(b.label) ||
          byId(claimSources(a)[0], claimSources(b)[0]) ||
          byId(a, b),
      );
    if (group.length === 0) continue;
    push('', `### ${heading(t)}`, '');
    for (const c of group) {
      const srcs = claimSources(c);
      const cites = srcs.map((s) => `${link(s)} (${host(s.url)})`).join('; ');
      const caveat = String(c.caveat ?? '').trim() ? ` Caveat: ${md(sentence(c.caveat))}` : '';
      push(`- [${c.label}] ${md(sentence(c.claim))} ${srcs.length > 1 ? 'Sources' : 'Source'}: ${cites}.${caveat} \`${c.id}\``);
    }
  }

  push('', '## Sources', '', '| Source | Authors | Date | Verified | Link |', '| --- | --- | --- | --- | --- |');
  for (const s of verifiedSources) {
    push(`| ${md(s.title)} | ${md(s.authors)} | ${md(s.date || 'n.d.')} | ${md(s.verified)} | [${md(host(s.url))}](${s.url}) |`);
  }
  if (otherSources.length) {
    push('', 'Sources that could not be verified are never cited:', '');
    for (const s of otherSources) push(`- ${md(s.title)} (${md(s.authors)}): ${md(s.status || 'not verified')}.`);
  }

  push('', '## Quotes', '', `Short quotes, at most one per source and each under ${MAX_QUOTE_WORDS} words. Other pages paraphrase.`, '');
  if (quotes.length === 0) push('None yet.');
  for (const { q, src } of quotes) push(`- “${md(q)}” — ${md(shortAuthors(src.authors))}, ${link(src)}`);

  push('', '## Dropped claims', '', 'Claims the research could not support as stated. No page on this site relies on them.', '');
  if (dropped.length === 0) push('None.');
  for (const c of dropped) {
    const why = String(c.drop_reason ?? '').trim() ? ` Why dropped: ${md(sentence(c.drop_reason))}` : '';
    push(`- ${md(sentence(c.claim))}${why} \`${c.id}\``);
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
