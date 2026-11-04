// Claim label token. Single source for the remark plugin, the Markdown export and the labels check.
// [Evidence] is the only label: it starts a claim that reports what ledger rows found, and its claim
// links at least one row (/evidence/ledger/#r<N>). A recommendation needs no label, but it links a row too.
export const LABELS = [{ kind: 'evidence', name: 'Evidence', definition: 'What the linked ledger rows report.' }];

export const LABEL_HREF = '/evidence/method/#labels';

/** Matches the exact label token `[Evidence]`. Global: reset lastIndex or use matchAll. */
export const LABEL_TOKEN_RE = /\[(Evidence)\]/g;

/** Matches bracketed spans that look like a label, current or retired, exact or not. Used to flag near-misses. */
export const LABEL_LIKE_RE = /\[\s*(evidence\w*|proposal\w*|judge?ment\w*)\s*\]/gi;

/** Retired tokens, each with what to do instead. Each fails the labels check. */
export const RETIRED_LABELS = {
  Established: 'use [Evidence] and link a ledger row',
  Heuristic: 'link a ledger row, or move the point to Open questions',
  Proposal: 'link a ledger row; the claim needs no label',
  Judgment: 'link a ledger row, or move the point to Open questions',
};

/** Path of the ledger page and the anchor form of a row id ("R18" -> "r18"). */
export const LEDGER_PATH = '/evidence/ledger/';
export const rowAnchor = (row) => String(row).toLowerCase();

/** Matches a link to a ledger row in Markdown or HTML: /evidence/ledger/#r18 or #r1a. Captures the row id after "r". */
export const ROW_LINK_RE = /\/evidence\/ledger\/#r(\d+[a-z]?)\b/g;

export function labelByName(name) {
  return LABELS.find((l) => l.name === name);
}
