// A valid packet for tests, written to a temp folder: one slice, verified and done.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

export const PLAN = `# Demo — plan

## Goal
Ship it.

## Non-goals
- More.

## Assumptions and resolved questions
- Node 22 is available — yes; confirmed by Ada, 2026-10-17.

## Constraints
- No new dependencies.

## Repo grounding
- Command: \`node --test\` — runs every test.

## Slices
| ID | Behavior | Check |
|----|----------|-------|
| 01 | demo() returns 1 | acceptance/01-demo.test.js |

## Decisions
- 2026-10-17 — plan review by Grace: every slice maps to a check.

## Surprises
- None yet.
`;

export const SLICE = `# Slice 01 — demo

## Objective
Add demo().

## Behavior
demo() returns 1.

## Requirements
- Export demo from src/demo.js.

## Files and APIs
- Touch: \`src/demo.js\`

## Checks
- \`true\` → exit 0

## Out of scope
- Anything else.

## Report
- Write handoffs/01.md.
`;

export const ACCEPTANCE = `# Acceptance — demo

## Run
- \`true\` → exit 0

## Checks
| Slice | Files | Written by | Reviewed by |
|-------|-------|------------|-------------|
| 01 | acceptance/01-demo.test.js | Ada | Grace |

## Hold-outs
- None.

## Disputes
- None.
`;

export const HANDOFF = `# Handoff — Slice 01

## Changed
- \`abc1234\` — added demo()

## Dead ends
- None.

## Superseded facts
- None.

## Check results
\`\`\`text
ok 1 - demo returns 1
\`\`\`

## Verification
Verdict: PASS
- Verifier: fresh session; hold-outs run: 0; 2026-10-17.
`;

export const STATE = {
  packet: 'demo',
  format: 'agentspecs packet v0.2',
  updated: '2026-10-17T10:00Z',
  slices: [{ id: '01', brief: 'slices/01-demo.md', status: 'done', passes: true, failures: 0, handoff: 'handoffs/01.md' }],
};

/** Write a packet at <tmp>/packets/demo, applying overrides (null deletes a file). Returns its dir. */
export function packet(t, overrides = {}) {
  const base = mkdtempSync(join(tmpdir(), 'conf-'));
  t.after(() => rmSync(base, { recursive: true, force: true }));
  const dir = join(base, 'packets/demo');
  const files = {
    'plan.md': PLAN,
    'slices/01-demo.md': SLICE,
    'acceptance/README.md': ACCEPTANCE,
    'acceptance/01-demo.test.js': "import { test } from 'node:test';\ntest('demo', () => {});\n",
    'handoffs/01.md': HANDOFF,
    'state.json': JSON.stringify(STATE, null, 2),
    ...overrides,
  };
  for (const [rel, text] of Object.entries(files)) {
    if (text === null) continue;
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), typeof text === 'string' ? text : JSON.stringify(text, null, 2));
  }
  return dir;
}
