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
5. **Review with a fresh context.** [Established] Claude Code's docs recommend a reviewer subagent with a fresh context that sees only the diff and the criteria, so the agent that did the work does not grade it ([best practices](https://code.claude.com/docs/en/best-practices)). Give the reviewer the phase file's Boundaries and Verify sections, not the conversation.
6. **Move critical rules into hooks or CI.** [Established] Claude Code treats its instruction file as advisory and recommends hooks, which run every time, for anything that must always happen ([best practices](https://code.claude.com/docs/en/best-practices)). [Established] OpenAI's Codex team enforces its documentation structure with linters and CI jobs ([Harness engineering](https://openai.com/index/harness-engineering/)). [Heuristic] If breaking a rule would cost you a review cycle, write it as a check and keep the prose line only to explain why.

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
