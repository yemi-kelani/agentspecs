---
title: Comparison
description: How Agent Specs compares with Kiro specs, GitHub Spec Kit, ExecPlans, BMAD, Cline's Memory Bank and a single instruction file.
---

Agent Specs is one of several ways to give a coding agent a written plan. Each section below says what a format is, citing its own documentation, and where it fits. The judgments are ours and are labelled as proposals.

[Heuristic] Böckeler sorts spec-driven tools by how long the spec lives: spec-first (written for one task), spec-anchored (kept to maintain the feature) and spec-as-source (the spec, not the code, is what people edit) ([Böckeler, 2025](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)). [Proposal] In those terms a spec set is spec-first: it serves one task, and project-wide context stays in AGENTS.md.

## Kiro specs

- [Established] Each spec is three Markdown files in `.kiro/specs/<name>/`: requirements.md (or bugfix.md for bugs), design.md and tasks.md ([Kiro docs](https://kiro.dev/docs/specs/)).
- [Established] Requirements use EARS notation (WHEN a condition occurs, THE SYSTEM SHALL respond), written before or after the design ([Kiro docs](https://kiro.dev/docs/specs/feature-specs/)).
- [Established] Kiro can build a dependency graph from tasks.md and run independent tasks in parallel waves ([Kiro docs](https://kiro.dev/docs/specs/)). Knowledge that outlives a spec goes in steering files, loaded always, by file match, on request or automatically ([Kiro docs](https://kiro.dev/docs/steering/)).
- [Evidence] In an October 2025 trial, a small bug still produced 4 user stories with 16 acceptance criteria ([Böckeler, 2025](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)). Caveat: one practitioner on an older version; Kiro has since added bugfix specs and a one-pass Quick Spec, and its guidance now says a chat fix suits trivial issues ([Kiro docs](https://kiro.dev/docs/specs/best-practices/)).
- [Proposal] Better choice when you work in Kiro and want the tool to write, gate and run specs for you. Agent Specs is plain files any agent can read, with no generator.

## GitHub Spec Kit

- [Established] A fixed run of slash commands inside the agent: constitution, specify, plan, tasks and implement, with optional clarify, checklist, analyze and converge steps ([Spec Kit docs](https://github.github.io/spec-kit/quickstart.html)).
- [Established] A project constitution, then per feature a spec.md, a plan.md with research, data-model, contract and quickstart files, and a tasks.md ([Spec Kit repository](https://github.com/github/spec-kit/blob/main/spec-driven.md)).
- [Established] tasks.md groups checkbox tasks into phases, one per user story with a checkpoint, and marks tasks that can run in parallel ([tasks template](https://github.com/github/spec-kit/blob/main/templates/tasks-template.md)).
- [Evidence] On a feature sized at 3–5 story points, Böckeler found the generated files repetitive and tedious to review ([Böckeler, 2025](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)). Caveat: one practitioner, one feature, an October 2025 version and no timed comparison.
- [Proposal] Better choice for a team that wants a guided, command-driven path from requirements to tasks, under a standing constitution.

## ExecPlans (PLANS.md)

- [Established] One self-contained file from which a stateless agent can carry out a change end to end ([OpenAI Cookbook](https://developers.openai.com/cookbook/articles/codex_exec_plans)).
- [Established] Four sections must stay current during the work (Progress, Surprises & Discoveries, Decision Log, Outcomes & Retrospective), and validation means exact commands with expected output ([OpenAI Cookbook](https://developers.openai.com/cookbook/articles/codex_exec_plans)).
- [Established] One OpenAI repository requires an ExecPlan for multi-step work or tasks over about an hour, and makes it optional for trivial fixes ([openai-agents-python](https://github.com/openai/openai-agents-python/blob/main/PLANS.md)).
- [Heuristic] OpenAI says a similar PLANS.md let Codex work for more than seven hours from one prompt ([OpenAI Cookbook](https://developers.openai.com/cookbook/articles/codex_exec_plans)). Caveat: a single vendor anecdote with no task, success measure or comparison.
- [Proposal] Better choice for a medium task that one agent can finish in a session or two: one file is less to keep current than a tree. Our [sizing gate](/concepts/sizing/) says the same, and progress.md borrows the living log.

## BMAD Method

- [Established] Version 4 shards the PRD and architecture into folders of smaller files, keeps stories in docs/stories, and has the dev agent always load a few architecture shards ([BMAD v4 config](https://github.com/bmad-code-org/BMAD-METHOD/blob/v4.44.3/bmad-core/core-config.yaml)).
- [Established] In the v4 cycle a product-owner agent shards the documents, a scrum-master agent drafts the next story and a dev agent builds it, with optional QA ([BMAD v4 guide](https://github.com/bmad-code-org/BMAD-METHOD/blob/v4.44.3/docs/user-guide.md)). Each story section has an owning role ([v4 story template](https://github.com/bmad-code-org/BMAD-METHOD/blob/v4.44.3/bmad-core/templates/story-tmpl.yaml)).
- [Established] The 2026 method no longer documents sharding. It sizes planning in four paths, from trivial to project-sized ([BMad docs](https://docs.bmad-method.org/plan/choose-a-planning-path/)), and tracks stories in tickets.toml files ([BMad docs](https://docs.bmad-method.org/plan/break-work-into-stories-and-track-it/)).
- [Proposal] The ideas overlap: Agent Specs' index-and-leaf files and landing spots resemble v4 sharding and role-owned sections, and its sizing gate resembles the planning paths. BMAD is the better choice when you want role-based agents across a whole product lifecycle.

## Cline Memory Bank

- [Established] A method set up through custom instructions, not a built-in feature: six core Markdown files in memory-bank/, from a project brief to an active-context file and a progress file ([Cline docs](https://docs.cline.bot/features/memory-bank)).
- [Established] Cline is told to read every memory-bank file at the start of every task, so the whole bank costs context each time ([Cline docs](https://docs.cline.bot/features/memory-bank)).
- [Heuristic] Böckeler separates task-scoped specs from a memory bank of context that every session needs ([Böckeler, 2025](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)).
- [Proposal] Better choice for project memory that carries across sessions. It complements a spec set: project facts live in the bank or AGENTS.md, the task in `work/<task-id>/`.

## One AGENTS.md or spec file

- [Established] AGENTS.md is plain Markdown with no required fields or headings ([agents.md](https://agents.md/)).
- [Established] One OpenAI team replaced a large AGENTS.md with a map of about 100 lines, reporting that the big file crowded out the task, made every rule look equally important and went stale ([OpenAI, 2026](https://openai.com/index/harness-engineering/)).
- [Evidence] Files of 25 to 500 lines, and splitting one file into several, made no detectable difference to compliance ([McMillan, 2026](https://arxiv.org/abs/2605.10039)). Caveat: one trivial rule, mostly one model, and a long file still costs tokens every session.
- [Proposal] Better choice for trivial tasks and project-wide rules, which is where the [sizing gate](/concepts/sizing/) sends them: a prompt plus AGENTS.md.

## Side by side

The cells are our judgment of how each format is designed, not measurements; no study compares these formats head to head. Context cost is what an agent loads per session. Drift resistance is how well the files stay true while work changes things. Handoff clarity is how plainly one session tells the next what happened. Maintainability is the effort to keep the files current, reviewability how easily a person can check them, and injection surface how much text reaches the agent's instructions without a choice.

| Format | Context cost | Drift resistance | Handoff clarity | Maintainability | Reviewability | Injection surface |
| --- | --- | --- | --- | --- | --- | --- |
| Agent Specs | [Proposal] Plan plus one phase file | [Proposal] Stable plan, separate state | [Proposal] One HANDOFF.md per phase | [Proposal] Many small files | [Proposal] Short files, but more | [Proposal] Sources read-only; untested |
| Kiro specs | [Proposal] Three files plus steering | [Proposal] Specs refined in place | [Proposal] Tracked tasks | [Proposal] Tool maintains files | [Proposal] Checkable; heavy for small fixes | [Proposal] Steering loads automatically |
| GitHub Spec Kit | [Proposal] Constitution plus feature files | [Proposal] Files regenerated by command | [Proposal] Checkpoint per story | [Proposal] Overlapping generated files | [Proposal] Many files to read | [Proposal] Constitution read every command |
| ExecPlan | [Proposal] One file that grows | [Proposal] Living sections | [Proposal] Plan alone restarts work | [Proposal] One file | [Proposal] One prose document | [Proposal] One file; sources not set apart |
| BMAD v4 | [Proposal] Story plus always-loaded shards | [Proposal] Sharded documents, change log | [Proposal] Role-owned story sections | [Proposal] Many documents and roles | [Proposal] Role-owned sections | [Proposal] Shards load every run |
| Cline Memory Bank | [Proposal] Whole bank, every task | [Proposal] Context files updated often | [Proposal] Progress file | [Proposal] Six files | [Proposal] Six short documents | [Proposal] Whole bank, every task |
| One file | [Proposal] Whole file, every session | [Proposal] Stale without checks | [Proposal] Nothing built in | [Proposal] One file, hard to keep short | [Proposal] One read; rules compete | [Proposal] Everything always loaded |

## When to pick something else

- [Proposal] Trivial task: a prompt plus AGENTS.md.
- [Proposal] Medium task for one agent: one living plan file, such as an ExecPlan or a single plan.md.
- [Proposal] Project memory across sessions: a memory bank, steering files or AGENTS.md.
- [Proposal] A team that wants a tool to generate and gate specs: Kiro or Spec Kit.

[The evidence page](/evidence/) lists every source cited here, with what the research does and does not show.
