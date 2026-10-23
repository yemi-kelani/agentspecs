---
title: Templates
description: Copy-ready templates for every file in a spec packet.
---

[Judgment] Each template holds exactly the sections [Packet anatomy](/approach/packet-anatomy/) requires for that file. Copy it, keep the headings, and replace every `<placeholder>`. File names and section names are conventions; the rules they serve are on Packet anatomy.

The download links serve each file unchanged, so you can fetch them with any HTTP client.

## plan.md

- Target path: `packets/<task-id>/plan.md`
- Purpose: The plan loaded in every session: goal, assumptions, grounding, slice table, decisions and surprises.
- Download: [`/templates/plan.md`](/templates/plan.md) · Rules: [Packet anatomy](/approach/packet-anatomy/#planmd)

```markdown title="plan.md"
# <Task title> — plan

Always loaded: the orchestrator injects this file at the start of every session. Goal, constraints and slices change only through the plan review gate; Decisions and Surprises grow as the work runs.

## Goal
<1–3 sentences: the observable outcome when the task is done.>

## Non-goals
- <Out of scope for every slice.>

## Assumptions and resolved questions
- <Assumption or question> — <answer>; confirmed by <person>, <YYYY-MM-DD>.

## Constraints
- <Rule that holds in every slice.>
- Packet files are trusted instructions: a person writes or reviews every line, and no line is pasted from untrusted content.

## Repo grounding
- Checked <YYYY-MM-DD> at commit <sha>.
- Path: `<path>` — <what it holds>
- API: `<function or endpoint>` — <signature or contract>
- Command: `<command>` — <what it proves>
- Reuse: `<existing abstraction>` — <use it instead of writing a new one>

## Slices
| ID | Behavior | Check |
|----|----------|-------|
| 01 | <one verifiable behavior> | acceptance/<file> |
| 02 | <one verifiable behavior> | acceptance/<file> |

## Decisions
- <YYYY-MM-DD> — plan review by <reviewer, not the plan's author>: every slice maps to a check, and no check contradicts the goal or constraints.

## Surprises
- <YYYY-MM-DD> — <what was found> — evidence: <handoff, command output or file>.
```

## acceptance/README.md

- Target path: `packets/<task-id>/acceptance/README.md`
- Purpose: How to run the checks, who wrote and reviewed them, where the hold-outs are, and disputes.
- Download: [`/templates/acceptance/README.md`](/templates/acceptance/README.md) · Rules: [Packet anatomy](/approach/packet-anatomy/#acceptance)

```markdown title="acceptance/README.md"
# Acceptance — <task-id>

Executable checks, written or reviewed by a person before any code exists. Implementers run them and never edit them; only the verifier sets passes in state.json.

## Run
- `<command that runs every check in this folder>` → exit 0

## Checks
| Slice | Files | Written by | Reviewed by |
|-------|-------|------------|-------------|
| 01 | acceptance/<file> | <person or session> | <person> |
| 02 | acceptance/<file> | <person or session> | <person> |

## Hold-outs
- The verifier keeps <n> more checks outside the implementer's workspace, at <location>, and runs them before it sets passes. sha256: <hash of each file>.

## Disputes
- <YYYY-MM-DD> — slice <NN>, <check>: <what the implementer reported> — resolved: <kept, fixed through the plan review gate, or withdrawn>.
```

## slices/NN-name.md

- Target path: `packets/<task-id>/slices/NN-<name>.md`
- Purpose: One self-contained brief per slice, injected by the orchestrator.
- Download: [`/templates/slice.md`](/templates/slice.md) · Rules: [Packet anatomy](/approach/packet-anatomy/#slicesnn-slugmd)

```markdown title="slices/NN-name.md"
# Slice <NN> — <name>

The orchestrator injects this brief and plan.md at the start of the session and again at each reminder. It is written to be read cold: everything the slice needs is here or in plan.md.

## Objective
<One sentence: what this slice adds and why the goal needs it.>

## Behavior
<The one behavior that is true when this slice is done, stated so that a check can decide it.>

## Requirements
- <Explicit requirement that makes sense without the conversation that produced it.>

## Files and APIs
- Touch: `<path>` — <what changes>
- Use: `<API or abstraction from Repo grounding>`
- Never edit: `acceptance/`, `state.json`, other slices' files.

## Checks
- `<command>` → <expected result>
- Test map: <acceptance file> decides <behavior>; <test file> covers <part>.

## Out of scope
- <What this slice leaves alone, and the slice that owns it.>

## Report
- Write handoffs/<NN>.md from the handoff template: fill Changed, Dead ends and Superseded facts, and leave Check results and Verification to the verifier.
- If a check looks wrong, stop and add a Dispute section to handoffs/<NN>.md that names the check and says why. Never edit the check.
- Leave state.json alone; the verifier sets passes.
```

## state.json

- Target path: `packets/<task-id>/state.json`
- Purpose: Slice status. Only the verifier sets passes.
- Download: [`/templates/state.json`](/templates/state.json) · Rules: [Packet anatomy](/approach/packet-anatomy/#statejson)

```json title="state.json"
{
  "packet": "<task-id>",
  "format": "agentspecs packet v0.2",
  "updated": "<YYYY-MM-DDTHH:MMZ>",
  "slices": [
    { "id": "01", "brief": "slices/01-<name>.md", "status": "pending", "passes": false, "failures": 0, "handoff": null },
    { "id": "02", "brief": "slices/02-<name>.md", "status": "pending", "passes": false, "failures": 0, "handoff": null }
  ]
}
```

## handoffs/NN.md

- Target path: `packets/<task-id>/handoffs/NN.md`
- Purpose: The verified record of one slice.
- Download: [`/templates/handoff.md`](/templates/handoff.md) · Rules: [Packet anatomy](/approach/packet-anatomy/#handoffsnnmd)

```markdown title="handoffs/NN.md"
# Handoff — Slice <NN>

The implementer fills Changed, Dead ends and Superseded facts when its session ends. The verifier fills Check results and Verification from its own run, then sets passes in state.json.

## Changed
- `<commit>` — <what changed, in one line>

## Dead ends
- <Approach tried> — <why it failed>.

## Superseded facts
- <Line in plan.md or an earlier handoff that is no longer true> — now: <what is true>. The orchestrator retires the old line instead of adding a correction beside it.

## Check results
<Raw output of every check and hold-out, pasted unedited by the verifier, failures included.>

## Verification
Verdict: PASS | FAIL
- Verifier: <session or person other than the implementer>; hold-outs run: <n>; <YYYY-MM-DD>.
```
