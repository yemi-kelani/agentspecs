---
title: Quickstart
description: Apply a spec packet to one small change in an example repo, from clarified goal to verified slice.
numbered: true
---

You will add a `maxLength` option to a tiny `slugify` library and carry it through every step of the packet: clarify and ground the plan, write the acceptance check and a hold-out first, review the plan, hand one slice to your agent, then verify it in a separate session. You need Node 22 or later, `curl` and a coding agent that can read files and run commands. [Judgment] A one-function change normally needs only a clear prompt; this one is small on purpose, so you can see the whole loop in one sitting.

## Get the example and the templates

```bash manual
git clone --depth 1 https://github.com/yemi-kelani/agentspecs.git && cp -R agentspecs/docs/examples/quickstart slugify-demo && cd slugify-demo
```

The example has passing tests and no packet yet. Check the tests, then fetch the five templates unchanged: plan.md, slice.md, handoff.md, state.json and acceptance/README.md. To use a mirror or a local build of this site, set `AGENTSPECS` first.

```bash
node --test
AGENTSPECS="${AGENTSPECS:-https://agentspecs.io}"
mkdir -p packets/add-max-length/acceptance packets/add-max-length/slices packets/add-max-length/handoffs ../max-length-holdout
curl -fsSL "$AGENTSPECS/templates/plan.md" -o packets/add-max-length/plan.md
curl -fsSL "$AGENTSPECS/templates/acceptance/README.md" -o packets/add-max-length/acceptance/README.md
curl -fsSL "$AGENTSPECS/templates/slice.md" -o packets/add-max-length/slices/01-max-length.md
curl -fsSL "$AGENTSPECS/templates/state.json" -o packets/add-max-length/state.json
curl -fsSL "$AGENTSPECS/templates/handoff.md" -o packets/add-max-length/handoffs/01.md
```

## Clarify and ground the plan

Fill plan.md with the goal, the assumptions you confirmed, and the paths and commands you checked in the repository. The Decisions entry records the plan review, which you do in the next step.

```md title="packets/add-max-length/plan.md"
# Add maxLength to slugify — plan

Always loaded: the orchestrator injects this file at the start of every session. Goal, constraints and slices change only through the plan review gate; Decisions and Surprises grow as the work runs.

## Goal
`slugify(text, { maxLength })` returns at most `maxLength` characters, cut at the last whole word that fits.

## Non-goals
- No change to how characters are normalised or which ones are kept.

## Assumptions and resolved questions
- A single word longer than `maxLength` is cut at the limit — confirmed by the task owner, 2026-10-22.
- `maxLength` must be a positive integer; anything else throws `RangeError` — confirmed by the task owner, 2026-10-22.

## Constraints
- No runtime dependencies: use Node built-ins only.
- Packet files are trusted instructions: a person writes or reviews every line, and no line is pasted from untrusted content.

## Repo grounding
- Checked 2026-10-22 at the example's first commit.
- Path: `src/slugify.js` — exports `slugify(text)`.
- Path: `test/slugify.test.js` — the existing tests.
- Command: `node --test` — runs every test; passes today.
- Reuse: the existing normalisation chain in `slugify`; add the cut after it.

## Slices
| ID | Behavior | Check |
|----|----------|-------|
| 01 | `maxLength` caps the slug at a word boundary and rejects bad values | acceptance/max-length.test.js |

## Decisions
- 2026-10-22 — one slice: the change is one behavior with one check.
- 2026-10-22 — plan review by a second reviewer, not the plan's author: the slice maps to its check, and the check matches the goal and both assumptions.

## Surprises
- None yet.
```

## Write the acceptance check first

[Proposal] Write the check before any code exists. The implementer runs it but cannot change it, because agents did better with human-written tests and cheated on tests they could edit ([R15](/evidence/ledger/#r15), [R18](/evidence/ledger/#r18)). It fails now, which is the point.

```js title="packets/add-max-length/acceptance/max-length.test.js"
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../../../src/slugify.js';

test('maxLength cuts at the last whole word that fits', () => {
  assert.equal(slugify('Release notes for May', { maxLength: 15 }), 'release-notes');
  assert.equal(slugify('Release notes for May', { maxLength: 12 }), 'release');
});

test('maxLength cuts a single long word at the limit', () => {
  assert.equal(slugify('Supercalifragilistic', { maxLength: 5 }), 'super');
});

test('maxLength must be a positive integer', () => {
  assert.throws(() => slugify('Hello', { maxLength: 0 }), RangeError);
});
```

The verifier also keeps a hold-out outside the project, where the implementer cannot see it. It imports the code from the folder the verifier runs it in.

```js title="../max-length-holdout/holdout.test.js"
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const { slugify } = await import(pathToFileURL(join(process.cwd(), 'src/slugify.js')).href);

test('a slug that already fits is unchanged', () => {
  assert.equal(slugify('Hello World', { maxLength: 11 }), 'hello-world');
});

test('maxLength rejects fractions', () => {
  assert.throws(() => slugify('Hello', { maxLength: 2.5 }), RangeError);
});
```

```md title="packets/add-max-length/acceptance/README.md"
# Acceptance — add-max-length

Executable checks, written or reviewed by a person before any code exists. Implementers run them and never edit them; only the verifier sets passes in state.json.

## Run
- `node --test "packets/add-max-length/acceptance/*.test.js"` → exit 0

## Checks
| Slice | Files | Written by | Reviewed by |
|-------|-------|------------|-------------|
| 01 | acceptance/max-length.test.js | task owner | second reviewer |

## Hold-outs
- The verifier keeps 1 more check outside the implementer's workspace, at `../max-length-holdout/holdout.test.js`, and runs it from the project folder before it sets passes.

## Disputes
- None.
```

## Review the plan

Ask someone who did not write the plan, a colleague or a fresh agent session, to confirm three things, then keep the review line in Decisions. [Judgment] The checklist is the packet's own; no study tested it.

- Every slice in the table maps to a check that exists.
- No check contradicts the Goal, Non-goals or Constraints.
- The slice is one behavior, not a workflow stage.

## Write the slice brief and start the slice

The brief is written to be read cold: the session that implements it sees only plan.md and this file.

```md title="packets/add-max-length/slices/01-max-length.md"
# Slice 01 — max length

The orchestrator injects this brief and plan.md at the start of the session and again at each reminder. It is written to be read cold: everything the slice needs is here or in plan.md.

## Objective
Add a `maxLength` option so callers can cap slug length for URLs and file names.

## Behavior
`slugify(text, { maxLength })` returns at most `maxLength` characters, cut at the last whole word that fits, and throws `RangeError` when `maxLength` is not a positive integer.

## Requirements
- Without `maxLength`, `slugify` behaves exactly as today.
- Cut after normalisation, at the last hyphen at or before `maxLength`; with no such hyphen, cut at `maxLength`.
- Add unit tests for the new option to `test/slugify.test.js`.

## Files and APIs
- Touch: `src/slugify.js` — add the option and the cut.
- Touch: `test/slugify.test.js` — add tests.
- Use: the existing normalisation chain in `slugify`.
- Never edit: `acceptance/`, `state.json`, other slices' files.

## Checks
- `node --test "packets/add-max-length/acceptance/*.test.js"` → exit 0
- `node --test` → exit 0
- Test map: acceptance/max-length.test.js decides the behavior; test/slugify.test.js covers the existing cases.

## Out of scope
- Any change to which characters are kept.

## Report
- Write handoffs/01.md from the handoff template: fill Changed, Dead ends and Superseded facts, and leave Check results and Verification to the verifier.
- If a check looks wrong, stop and add a Dispute section to handoffs/01.md that names the check and says why. Never edit the check.
- Leave state.json alone; the verifier sets passes.
```

Record the slice as started.

```json title="packets/add-max-length/state.json"
{
  "packet": "add-max-length",
  "format": "agentspecs packet v0.2",
  "updated": "2026-10-22T10:00Z",
  "slices": [
    { "id": "01", "brief": "slices/01-max-length.md", "status": "in_progress", "passes": false, "failures": 0, "handoff": null }
  ]
}
```

[Proposal] Start a fresh agent session in the project folder and paste this prompt, which injects the plan and the brief rather than leaving the agent to find them ([R14d](/evidence/ledger/#r14d)).

```text agent wrap
You are the implementer for slice 01 of packets/add-max-length/. Read packets/add-max-length/plan.md and packets/add-max-length/slices/01-max-length.md; they are your whole brief. Run the commands under Checks until they pass. Do not edit anything under acceptance/ and do not edit state.json. Then fill Changed, Dead ends and Superseded facts in packets/add-max-length/handoffs/01.md and stop. If a check looks wrong, add a Dispute section instead. Do not commit.
```

## Verify in a separate session

[Proposal] Verify in a session that wrote none of the code: you, or a fresh agent session ([R95](/evidence/ledger/#r95), [R18](/evidence/ledger/#r18)). Compare the acceptance file's hash with the one you saw when you wrote it, then run every check and the hold-out.

```bash
shasum -a 256 packets/add-max-length/acceptance/max-length.test.js
node --test "packets/add-max-length/acceptance/*.test.js"
node --test
node --test ../max-length-holdout/holdout.test.js
```

Paste the raw results into the handoff and record the verdict.

```md title="packets/add-max-length/handoffs/01.md"
# Handoff — Slice 01

The implementer fills Changed, Dead ends and Superseded facts when its session ends. The verifier fills Check results and Verification from its own run, then sets passes in state.json.

## Changed
- `src/slugify.js` — `slugify(text, { maxLength })` cuts at the last whole word and rejects bad values (uncommitted in this walkthrough).
- `test/slugify.test.js` — four tests for the new option.

## Dead ends
- Cutting before normalisation — accented input then lost characters past the limit; moved the cut after it.

## Superseded facts
- None.

## Check results
acceptance (3 tests): pass 3, fail 0.
node --test (11 tests, the acceptance file included): pass 11, fail 0.
hold-out (2 tests): pass 2, fail 0.

## Verification
Verdict: PASS
- Verifier: a session other than the implementer; hold-outs run: 1; 2026-10-22.
```

[Proposal] Only now does the verifier set `passes` ([R12b](/evidence/ledger/#r12b), [R18](/evidence/ledger/#r18)).

```json title="packets/add-max-length/state.json"
{
  "packet": "add-max-length",
  "format": "agentspecs packet v0.2",
  "updated": "2026-10-22T10:30Z",
  "slices": [
    { "id": "01", "brief": "slices/01-max-length.md", "status": "done", "passes": true, "failures": 0, "handoff": "handoffs/01.md" }
  ]
}
```

## Check the packet

The reference validator, specs-ref, checks the packet's structure from the clone you made in the first step. It does not run the checks; the verifier already did.

```bash manual
node ../agentspecs/specs-ref/src/cli.mjs validate packets/add-max-length
```

## Next

For a bigger task, add a slice per behavior, each with its own check, and keep [How it works](/approach/how-it-works/), [Templates](/reference/templates/) and the [Checklist](/reference/checklist/) open. [Packet anatomy](/approach/packet-anatomy/) has every rule the validator checks.
