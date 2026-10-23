// Claim label tokens. Single source for the remark plugin, the Markdown export and the labels check.
// Evidence and Proposal claims link a ledger row (/evidence/ledger/#r<N>); Judgment claims need none.
// Only Evidence is shown to readers. Proposal and Judgment are source-only markers: the labels check
// reads them, and the renderer and the Markdown export strip them (see HIDDEN_LABEL_RE).
export const LABELS = [
  { kind: 'evidence', name: 'Evidence', definition: 'What the linked ledger rows report.', visible: true },
  { kind: 'proposal', name: 'Proposal', definition: 'What the packet does, following from the linked rows.', visible: false },
  { kind: 'judgment', name: 'Judgment', definition: 'A design choice the evidence does not settle.', visible: false },
];

/** Labels shown as badges on the site. */
export const VISIBLE_LABELS = LABELS.filter((l) => l.visible);

/** A hidden marker plus the spaces after it, e.g. "[Judgment] ". Global: use with replace or matchAll. */
export const HIDDEN_LABEL_RE = new RegExp(`\\[(${LABELS.filter((l) => !l.visible).map((l) => l.name).join('|')})\\][ \\t]*`, 'g');

export const LABEL_HREF = '/evidence/method/#labels';

/** Labels whose scope must link at least one verified ledger row. */
export const NEEDS_ROW = new Set(['Evidence', 'Proposal']);

/** Matches an exact label token, e.g. `[Evidence]`. Global: reset lastIndex or use matchAll. */
export const LABEL_TOKEN_RE = /\[(Evidence|Proposal|Judgment)\]/g;

/** Matches bracketed spans that look like a label, exact or not. Used to flag near-misses. */
export const LABEL_LIKE_RE = /\[\s*(evidence\w*|proposal\w*|judge?ment\w*)\s*\]/gi;

/** Retired tokens from v0.1. Each fails the labels check with a pointer to its replacement. */
export const RETIRED_LABELS = { Established: 'Evidence', Heuristic: 'Judgment' };

/** Path of the ledger page and the anchor form of a row id ("R18" -> "r18"). */
export const LEDGER_PATH = '/evidence/ledger/';
export const rowAnchor = (row) => String(row).toLowerCase();

/** Matches a link to a ledger row in Markdown or HTML: /evidence/ledger/#r18 or #r1a. Captures the row id after "r". */
export const ROW_LINK_RE = /\/evidence\/ledger\/#r(\d+[a-z]?)\b/g;

export function labelByName(name) {
  return LABELS.find((l) => l.name === name);
}
