---
title: Write a phase file
description: Write one phase brief that a fresh agent can run on its own, prove and hand off.
---

A phase file is the whole brief for one agent run. Write it for an agent that has never seen your conversation: it gets plan.md, this file and the inputs listed here, and nothing else.

[Established] Anthropic found that each subagent brief needs an objective, an output format, guidance on which tools and sources to use, and clear task boundaries; vague briefs led subagents to duplicate work, leave gaps or misread the task ([multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)). That finding comes from a research system rather than coding, and it is reported without numbers. The template's sections cover each element: Objective, Output contract, Inputs with Tools and permissions, and Boundaries with Stop conditions.

## Steps

1. **Objective.** One paragraph: what the phase produces and why the goal in plan.md needs it. Name the output, not the activity.
2. **Inputs.** Exact paths: `plan.md`, the handoffs of the phases it depends on, and the source files it needs. They must match the Reads column in plan.md. [Proposal] If the agent finds it needs something that is not listed, the brief has a gap: it stops and says so in HANDOFF.md instead of searching the repo.
3. **Boundaries.** What is in scope, what is out of scope (and which phase owns it), and the only paths the phase may write: `out/phase-<N>/` plus its landing spot from plan.md.
4. **Tools and permissions.** List the commands it may run and what it may not do, such as network access, pushes or writes elsewhere. [Established] Some tools can enforce this: a Claude Code subagent definition can allowlist or denylist tools ([subagents](https://code.claude.com/docs/en/sub-agents)). Where your tool can enforce the list, do that as well as writing it down.
5. **Steps.** Short and numbered, in the order that matters. Put "write a failing test first" here when the phase changes code.
6. **Output contract.** Every file the phase writes, with its format and any size limit, plus `out/phase-<N>/HANDOFF.md` following the [HANDOFF template](/templates/HANDOFF.md).
7. **Verify.** Commands with their expected results, run by the agent before it writes the handoff. See [Verify and accept](/guides/verify-and-accept/).
8. **Stop conditions.** When to set `Status: BLOCKED` and stop instead of improvising: missing inputs, a conflict with plan.md, or a Verify that cannot pass.

## Give the whole brief at once

[Established] OpenAI requires an ExecPlan to be self-contained, so that a stateless agent with only the working tree and the plan can finish the change ([ExecPlans](https://developers.openai.com/cookbook/articles/codex_exec_plans)). A phase file applies the same rule to one phase.

[Evidence] Splitting instructions across turns costs reliability. Across 15 models in simulated chats, revealing an instruction in pieces cut performance by 39% on average, while giving the same pieces in one prompt kept about 95% of full performance ([Laban et al.](https://arxiv.org/abs/2505.06120)). Those were chat tasks with simulated users, not agent runs, so read it as a reason rather than proof: put everything in the brief instead of planning to explain the rest later.

[Heuristic] If the brief needs more than a screen or two, or two people would describe its objective differently, it is probably two phases.

## Worked example

Phase 1 of the CSV export task from [Write plan.md](/guides/write-plan/).

```md title="work/csv-export/phases/phase-1-csv-writer.md"
# Phase 1 — csv-writer

## Objective
Add a pure `toCsv(rows, columns)` function so phase 3 can wire a `--format csv` flag without touching quoting rules.

## Inputs
- plan.md
- sources/csv-rules.md
- src/export/json.js (the row shape to match)

## Boundaries
- In scope: `toCsv` and its tests.
- Out of scope: the CLI flag and docs (phase 3), fixtures (phase 2).
- Write only to out/phase-1/, src/export/csv.js and test/csv.test.js.

## Tools and permissions
- Allowed: read the inputs; run `npm test`.
- Not allowed: network, new dependencies, edits outside the paths above, commits.

## Steps
1. Write failing tests: plain values, a comma, a double quote, a newline, an empty row list.
2. Implement `toCsv` until `npm test` passes.
3. Fill out/phase-1/HANDOFF.md, including the exported function signature under Key facts.

## Output contract
- out/phase-1/HANDOFF.md, following the HANDOFF template
- src/export/csv.js — exports `toCsv(rows, columns)`; returns a header line, then one line per row, CRLF endings; no I/O

## Verify
- `npm test` → exit 0
- `node -e "import('./src/export/csv.js').then(m => console.log(JSON.stringify(m.toCsv([{a: 'x,y'}], ['a']))))"` → `"a\r\n\"x,y\"\r\n"`

## Stop conditions
- Set Status: BLOCKED in HANDOFF.md and stop if sources/csv-rules.md conflicts with plan.md, or `npm test` fails before your change.
```

## Check before you dispatch

- Could someone with only this file, plan.md and the listed inputs do the work?
- Is every write path also in the phase's Writes column in plan.md?
- Can Verify run without you, and does each line say what passing looks like?
