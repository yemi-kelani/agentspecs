---
title: Verify and accept
description: Write checks that a machine can run, at task and phase level, and move rules that must always hold into hooks or CI.
---

A phase is finished when a command says so, not when the agent says so. Write acceptance at two levels, give every check an expected result, and turn the rules that must never break into automated checks.

[Evidence] Written rules change agent behaviour but do not guarantee it. In a factorial study of Claude Code sessions, agents applied a trivial required annotation to only about two-thirds of functions even under the best conditions, against none without the instruction file ([McMillan](https://arxiv.org/abs/2605.10039)). The rates are specific to that marker, task set and codebase, and the author's suggested backstops (hooks, linters, CI) were not tested. [Evidence] In hands-on trials of spec-driven tools, Böckeler often saw agents fail to follow all instructions despite detailed specs and checklists, and at other times follow them too eagerly ([Böckeler](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)); that is one practitioner's qualitative report.

## Steps

1. **Global acceptance in plan.md.** List checks for the whole task: commands with the exit code or output you expect, plus any observation a person must make. [Established] OpenAI's ExecPlans require exact test commands with expected outputs, and acceptance phrased as behaviour someone can observe rather than as internal code changes ([ExecPlans](https://developers.openai.com/cookbook/articles/codex_exec_plans)).
2. **Verify in every phase file.** Scope each check to the phase's own outputs and write it as `` `command` → expected result ``. [Established] Claude Code's docs advise giving the agent a check it can run, such as tests, a build or a linter, so it iterates until the check passes instead of stopping when the work merely looks done ([best practices](https://code.claude.com/docs/en/best-practices)).
3. **Test behaviour end to end where users see it.** [Established] Anthropic saw agents mark features done without end-to-end testing, and found that prompting them to test as a user would, through browser automation, substantially improved results ([long-running harnesses](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)). That report is qualitative and comes from one web-app project.
4. **Define done.** [Proposal] A phase is done only when its Verify passes and its HANDOFF.md is complete: a Status line, a Verify line with real output, and filled Produced, Key facts, Decisions, Open issues and Sources used sections. The orchestrator re-runs Verify before it sets `"status": "done"` and `"verified": true` in state.json.
5. **End with a review phase.** [Proposal] A plan with more than one phase ends with a [review phase](#the-review-phase): an agent that did none of the work reads the diff against plan.md, re-runs Global acceptance and reports gaps without fixing them. [Established] Claude Code's docs recommend a reviewer subagent with a fresh context that sees only the diff and the criteria, so the agent that did the work does not grade it ([best practices](https://code.claude.com/docs/en/best-practices)).
6. **Move critical rules into hooks or CI.** [Established] Claude Code treats its instruction file as advisory and recommends hooks, which run every time, for anything that must always happen ([best practices](https://code.claude.com/docs/en/best-practices)). [Established] OpenAI's Codex team enforces its documentation structure with linters and CI jobs ([Harness engineering](https://openai.com/index/harness-engineering/)). [Heuristic] If breaking a rule would cost you a review cycle, write it as a check and keep the prose line only to explain why.

## The review phase

[Proposal] The review phase is the last row of the phase table. It depends on every other phase, writes only `out/phase-<N>/`, and reads plan.md, the phase files, their handoffs and the diff. It never sees the other agents' transcripts, so it judges the work rather than the account of it.

[Evidence] Models check their own work poorly without outside feedback: they corrected their reasoning badly and sometimes made it worse, while a sound external checker helped ([Huang et al.](https://arxiv.org/abs/2310.01798), [Stechly et al.](https://arxiv.org/abs/2402.08115)). Both studies used reasoning and planning benchmarks, not coding agents, neither tested a separate reviewer, and the checker in the second was a formal validator, not another model. [Proposal] So the reviewer re-runs every Global acceptance command, an outside check that does not depend on its own judgement.

[Evidence] A model also tends to favour its own output, as GPT-4, GPT-3.5 Turbo and Llama 2 did with their own news summaries ([Panickssery et al.](https://arxiv.org/abs/2404.13076)). That study did not control for quality, and a later preprint found much of strong models' self-preference matched genuinely better answers ([Chen et al.](https://arxiv.org/abs/2504.03846)). [Established] Claude Code's docs say a fresh context improves review because the model is not biased toward code it just wrote ([best practices](https://code.claude.com/docs/en/best-practices)). [Heuristic] A fresh context removes the conversation, not the model, so when you can, give the review to a different model as well.

[Established] Claude Code's docs warn that a reviewer asked to find gaps will usually report some even when the work is sound, and that chasing every finding leads to over-engineering ([best practices](https://code.claude.com/docs/en/best-practices)). [Proposal] The reviewer reports only gaps that break correctness, a constraint or an acceptance item, each with its evidence, and the orchestrator decides what to fix. Gaps mean `Status: PARTIAL`; after the fixes, run the review again.

Phase 4 of the CSV export task from [Write plan.md](/guides/write-plan/):

```md title="work/csv-export/phases/phase-4-review.md"
# Phase 4 — review

## Objective
Check phases 1–3 against plan.md and their output contracts, from a fresh context, and report gaps without fixing them.

## Inputs
- plan.md
- phases/phase-1-csv-writer.md, phases/phase-2-fixtures.md, phases/phase-3-cli-flag.md
- out/phase-1/HANDOFF.md, out/phase-2/HANDOFF.md, out/phase-3/HANDOFF.md
- The diff: `git diff main...HEAD`

## Boundaries
- In scope: whether the diff meets the Goal, every constraint, Global acceptance and each output contract.
- Out of scope: fixing gaps (the orchestrator decides), style preferences, work the plan does not ask for.
- Write only to out/phase-4/.

## Tools and permissions
- Allowed: read the repository; run `git diff` and the commands under Verify.
- Not allowed: edits outside out/phase-4/, network, commits.

## Steps
1. Run every command under Verify and record each result.
2. Read the diff against plan.md and each phase's Output contract.
3. List each gap under Open issues with its evidence: a file and line, or a command and its output.

## Output contract
- out/phase-4/HANDOFF.md, following the HANDOFF template: Status DONE if there are no gaps, PARTIAL if there are.

## Verify
- `npm test` → exit 0
- `node bin/report-cli.js export --format csv fixtures/small.json | diff - fixtures/small.csv` → exit 0

## Stop conditions
- Set Status: BLOCKED in HANDOFF.md and stop if a handoff or the diff is missing, or a command cannot run.
```

## Worked example

The Verify section of a phase file, with one expected result per line:

```md title="work/csv-export/phases/phase-1-csv-writer.md (excerpt)"
## Verify
- `npm test` → exit 0
- `npm run lint` → exit 0, no warnings in src/export/
- `git diff --name-only main` → only src/export/csv.js and test/csv.test.js, plus files under work/csv-export/out/phase-1/
```

A check that turns "done means a complete handoff" into code. Run it in CI and from whatever end-of-turn or pre-commit hook your agent supports:

```js title="scripts/check-handoffs.mjs"
// Usage: node scripts/check-handoffs.mjs work/<task-id>
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
const state = JSON.parse(readFileSync(join(dir, 'state.json'), 'utf8'));
let failures = 0;
for (const phase of state.phases.filter((p) => p.status === 'done')) {
  const file = phase.handoff && join(dir, phase.handoff);
  const text = file && existsSync(file) ? readFileSync(file, 'utf8') : '';
  if (!/^Status: DONE$/m.test(text) || !/^Verify: .+/m.test(text)) {
    console.error(`phase ${phase.id} is done in state.json, but its handoff lacks "Status: DONE" or a Verify line`);
    failures++;
  }
}
process.exit(failures ? 1 : 0);
```

The Agent Specs [Quickstart](/quickstart/) is checked the same way, and more strictly: a script runs every step of the page, then fails if a phase is not done, a done phase's handoff lacks `Status: DONE` or a Verify line per command, or any file breaks a section the [Specification](/specification/) requires.

## Check

- Does every check say what passing looks like?
- Can every check run without a person, except the ones marked as observations?
- Which rule would hurt most if it were skipped once? Is it a check yet?
- Did the review phase run on an agent that did none of the work, and re-run every Global acceptance command?
