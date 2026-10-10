// Evidence label tokens. Single source for the remark plugin, the labels check and the Evidence page.
// Definitions follow plan.md "Shared definitions".
export const LABELS = [
  { kind: 'established', name: 'Established', definition: 'Vendor docs or multiple sources.' },
  { kind: 'evidence', name: 'Evidence', definition: 'A cited study, always with its caveat.' },
  { kind: 'heuristic', name: 'Heuristic', definition: 'Practitioner rule of thumb.' },
  { kind: 'proposal', name: 'Proposal', definition: "This spec's own design." },
];

export const LABEL_HREF = '/evidence/#labels';

/** Matches an exact label token, e.g. `[Established]`. Global: reset lastIndex or use matchAll. */
export const LABEL_TOKEN_RE = /\[(Established|Evidence|Heuristic|Proposal)\]/g;

/** Matches bracketed spans that look like a label, exact or not. Used to flag near-misses. */
export const LABEL_LIKE_RE = /\[\s*(establish\w*|evidence\w*|heuristic\w*|proposal\w*)\s*\]/gi;

export function labelByName(name) {
  return LABELS.find((l) => l.name === name);
}
