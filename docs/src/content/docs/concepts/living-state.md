---
title: Living state
description: Why plan.md stays stable while two orchestrator-only files, state.json and progress.md, record status, surprises and decisions.
---

Every phase reads plan.md, so it should not shift under them, yet a long task can surface facts its plan did not foresee. [Proposal] Agent Specs keeps plan.md stable and records change in two files that only the orchestrator writes: state.json for status and progress.md for the narrative.

## Three files, three jobs

[Proposal] Each file has one job and one writer.

| File | Holds | Written by | Changes |
|---|---|---|---|
| plan.md | Goal, constraints, phase table, acceptance | The orchestrator, before dispatch | Rarely, and only with a decision-log entry |
| state.json | Each phase's status, verified flag and handoff path | The orchestrator | After every phase |
| progress.md | Progress, surprises, decision log, retrospective | The orchestrator | As the work runs |

[Proposal] Phases never edit state.json or progress.md. They report through HANDOFF.md and the orchestrator transcribes, so parallel phases cannot conflict over these files and no phase can mark itself verified.

## Why status lives in JSON

[Heuristic] Anthropic picked JSON for its harness feature list because its team judged the model less likely to wrongly change or overwrite a JSON file than a Markdown one ([Anthropic, long-running harnesses](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)). No measurement or comparison was published.

[Established] In that harness, every feature in the list started out marked failing, and coding agents were told to change only each feature's passes field ([Anthropic, long-running harnesses](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)). That was one web-app demo.

[Proposal] state.json applies the same idea to phases: a small fixed schema in which the orchestrator changes only status, verified and handoff, and a script can read progress without parsing prose.

```json
{ "id": 1, "file": "phases/phase-1-<slug>.md", "status": "pending", "verified": false, "handoff": null }
```

## Why progress.md has living sections

[Established] OpenAI's ExecPlan format requires four sections that are kept current as work proceeds: progress, surprises and discoveries, a decision log, and outcomes with a retrospective ([OpenAI, ExecPlans](https://developers.openai.com/cookbook/articles/codex_exec_plans)). It is a prompt convention for Codex, and OpenAI invites users to add or remove sections.

[Established] Anthropic describes structured notes kept outside the context window, such as a to-do list or a NOTES.md file, as a low-overhead memory that an agent reads back later ([Anthropic, context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)).

[Established] An ExecPlan is meant to be fully self-contained, so that a stateless agent can restart the work from it alone, which makes plans long ([OpenAI, ExecPlans](https://developers.openai.com/cookbook/articles/codex_exec_plans)). [Proposal] progress.md keeps the same four sections but moves them out of plan.md, so the file every phase reads stays stable and the moving parts sit where only the orchestrator writes.

## Learning during the work

[Heuristic] Kent Beck, quoted by Martin Fowler, objects that spec-driven development as usually described writes the whole spec before building and so assumes nothing will be learned along the way ([Fowler, Fragments](https://martinfowler.com/fragments/2026-01-08.html)). It is expert opinion, aimed at write-it-all-first descriptions rather than at plans that are updated during the work.

[Proposal] The decision log is the answer to that critique. When a phase surfaces something the plan got wrong, the orchestrator records the decision and its reason in progress.md, then edits plan.md or a later phase file to match. The plan is stable between decisions, not frozen.

[Established] OpenAI's Codex team checks execution plans, with their progress and decision logs, into the repository next to the code ([OpenAI, harness engineering](https://openai.com/index/harness-engineering/)).

**In the spec:** [Specification](/reference/specification/) — state.json, progress.md and who may write them.

**Next:** [Verification and review](/concepts/verification-and-review/) — how do you know a phase, and the whole task, is done?
