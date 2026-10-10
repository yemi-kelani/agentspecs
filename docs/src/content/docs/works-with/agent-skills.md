---
title: Agent Skills
description: How a spec set names the skills each phase needs, and when a skill also needs a routing line in AGENTS.md.
---

[Proposal] A skill packages a procedure that many tasks repeat; a spec set says which phase uses it. The [Agent Skills specification](https://agentskills.io/specification) defines SKILL.md, and Agent Specs adds no rules to it. Start from the [SKILL.md template](/reference/templates/#skillmd) and follow that specification for the file itself. This page covers the two places a spec set points to a skill.

## Name skills in the phase table

[Proposal] The Skills column of the plan.md Phases table lists, by exact name, the skills a phase should load, or `—`. The orchestrator names those skills in the dispatch prompt, next to plan.md and the phase file, so the phase does not wait for the model to decide to load them. See [Run phases with subagents](/guides/run-phases-with-subagents/).

```md title="work/csv-export/plan.md (Phases excerpt)" wrap
| # | Phase file | Reads | Writes | Depends on | Skills |
|---|------------|-------|--------|------------|--------|
| 3 | phases/phase-3-cli-flag.md | out/phase-1/HANDOFF.md, out/phase-2/HANDOFF.md, src/cli/ | src/cli/, docs/cli.md, out/phase-3/ | 1, 2 | release-notes |
```

[Proposal] Skills live in `.agents/skills/<name>/` by default. If your agent loads them from another folder, use that folder and name it in AGENTS.md Routing ([Specification](/reference/specification/#skillmd)).

## Back critical skills with a routing line

[Evidence] In Vercel's evals on Next.js 16 APIs, the agent never invoked an available skill in 56% of cases. Left to the agent's discretion, the skill passed 53% of evals, the same as having no docs at all; with an explicit instruction to use it, 79%; a compressed docs index in AGENTS.md passed 100% ([Vercel](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals)). This is one vendor's eval on one framework, with models and case counts undisclosed.

[Proposal] For each skill whose omission causes real mistakes, add a row to the AGENTS.md routing table: `| <kind of task> | skill <name> |`. The row is passive context that is always loaded, so it costs one line in every session; keep it for the few skills that need it.

```md title="AGENTS.md (routing excerpt)" wrap
| Preparing a release or tagging a version | skill `release-notes` |
```

## Everything else

Writing the description, structuring the body and testing whether a skill triggers belong to Agent Skills: see [agentskills.io](https://agentskills.io/). Before you use a skill from outside the repository, review it as the [security rules](/reference/specification/#security) ask.
