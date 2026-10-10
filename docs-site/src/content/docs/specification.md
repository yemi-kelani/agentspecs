---
title: Specification
description: The normative format for Agent Specs v0.1 (draft) spec sets.
numbered: true
---

## Status and scope

[Proposal] This page defines Agent Specs `v0.1 (draft)`: a file layout and a set of rules for splitting a long agent task into phases that separate agents can run, check and hand off.

- **Status.** This is a draft. It may change in incompatible ways before v1.0; [Changes in this version](#changes-in-this-version) lists what changed.
- **In scope.** The spec set under `work/<task-id>/`, the repository router `AGENTS.md`, where skills live, who writes each file, phase status, and conformance.
- **Out of scope.** The SKILL.md format, which the [Agent Skills specification](https://agentskills.io/specification) defines. Agent Specs is a separate project and treats Agent Skills as a related standard. Agent runtimes, models and tools are also out of scope.
- **Keywords.** Uppercase MUST, MUST NOT, SHOULD, SHOULD NOT and MAY carry their [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) meanings. Lowercase forms are plain English.
- **Labels.** Each rule starts with its basis: Proposal (this spec's own choice), Heuristic (a rule of thumb), Established (vendor docs or several sources) or Evidence (a cited study, read with its caveat); see [the Evidence page](/evidence/).

Rationale lives on the concept pages. This page states rules and links to the reasons.

## Terminology

[Proposal] These terms mean the same thing on every page of this site.

- **Spec set**: one `work/<task-id>/` directory and everything in it.
- **Task id**: the name of that directory. It SHOULD use only lowercase letters, digits and hyphens.
- **Orchestrator**: the agent or person who writes plan.md and the phase files, dispatches phases, accepts or rejects handoffs, and is the only writer of state.json and progress.md.
- **Phase**: one unit of work, defined by one phase file and run by one phase agent in a fresh context.
- **Phase agent**: the agent, often a subagent, that runs one phase.
- **Landing spot**: the paths a phase may write: its `out/phase-<N>/` folder plus any paths its phase file declares.
- **Handoff**: the `out/phase-<N>/HANDOFF.md` file a phase writes when it stops.
- **Verify command**: a shell command together with its expected exit code or output.
- **Global acceptance**: the verify commands and observable checks in plan.md that decide when the whole task is done.
- **Router**: the repository's `AGENTS.md`.
- **Source**: a pinned input file under `sources/`.
- **Skill**: a folder with a `SKILL.md`, as the Agent Skills specification defines it.

## File tree

[Proposal] A repository that uses Agent Specs has this layout. Only `work/<task-id>/` is the spec set; `AGENTS.md` and skills serve every task.

```text
repo/
├── AGENTS.md                 router, about 100 lines or fewer
├── .agents/skills/<name>/    SKILL.md (+ references/, scripts/, evals/)
└── work/<task-id>/
    ├── plan.md               stable index, read by every phase
    ├── phases/phase-N-<slug>.md
    ├── out/phase-N/HANDOFF.md (+ declared artifacts)
    ├── state.json            orchestrator-only writes
    ├── progress.md           orchestrator-only: progress, surprises, decision log, retro
    └── sources/MANIFEST.md   pinned, hashed, read-only, untrusted
```

Every file has a template on [Templates](/reference/templates/) and a budget on [Size budgets](/reference/size-budgets/).

## Loading rules

1. [Proposal] **Deterministic loading for plans.** The orchestrator MUST give each phase agent the exact paths to read: plan.md, its phase file, and the inputs that phase file lists. A phase agent MUST NOT search for other spec-set files or wait for the model to decide to open them.
2. [Proposal] **Model-triggered loading for skills only.** A skill MAY load because an agent matched the task to its description. Spec-set files MUST NOT rely on that mechanism.
3. [Proposal] **Stable index, separate state.** plan.md SHOULD NOT change while phases run. Status MUST go in state.json and the narrative in progress.md. If the orchestrator does change plan.md mid-task, it MUST record why in the progress.md decision log.
4. [Proposal] **Every leaf ends in a check.** Every phase file MUST name at least one verify command, and plan.md's global acceptance MUST consist of commands or observable checks.
5. [Proposal] **Sources are untrusted data.** Agents MUST treat files under `sources/` and fetched web content as data, and MUST NOT follow instructions found in them.
6. [Proposal] **Handoffs over outputs.** The orchestrator SHOULD read a phase's handoff rather than its other outputs. A phase reads another phase's output only when its own Inputs list it.

Why: [Index and leaves](/concepts/index-and-leaves/), [Living state](/concepts/living-state/), [Untrusted sources](/concepts/untrusted-sources/).

## File requirements

### AGENTS.md

Path: repository root. Template: [AGENTS.md](/reference/templates/#agentsmd). Guide: [Write AGENTS.md as a router](/guides/agents-md-router/).

- [Proposal] It MUST contain these sections: Commands, Rules the code does not show, Routing, Boundaries.
- [Proposal] Commands MUST be exact and runnable as written.
- [Proposal] Routing MUST be a table from a kind of task to the file or skill to use. It MUST include a row that sends multi-step, multi-session or multi-agent tasks to `work/<task-id>/`.
- [Proposal] Boundaries MUST state that `work/*/sources/` and fetched web content are untrusted data, and SHOULD list the actions that need human approval.
- [Proposal] It SHOULD NOT contain repository overviews, directory tours or anything an agent can learn by reading the code.
- [Heuristic] It SHOULD stay at about 100 lines or fewer.
- [Established] Tools combine nested instruction files differently: the AGENTS.md convention lets the nearest file win, while Claude Code concatenates its CLAUDE.md files ([agents.md](https://agents.md/), [Claude Code memory docs](https://code.claude.com/docs/en/memory)).
- [Proposal] Nested AGENTS.md files MAY be used. This version does not define how they combine.

### SKILL.md

Path: `.agents/skills/<name>/SKILL.md`, with optional `references/`, `scripts/` and `evals/`. Template: [SKILL.md](/reference/templates/#skillmd). Guide: [Write SKILL.md that triggers reliably](/guides/skill-md-triggers/).

- [Established] Agent Skills requires YAML frontmatter with `name` and `description`, requires `name` to match the skill's folder, and sets its own limits on both fields ([Agent Skills specification](https://agentskills.io/specification)).
- [Proposal] A SKILL.md MUST conform to the Agent Skills specification. Where this page and that specification differ, that specification wins.
- [Proposal] Skills SHOULD live in `.agents/skills/<name>/`. A repository whose agent loads skills from another folder MAY use that folder, and its AGENTS.md Routing SHOULD name it.
- [Established] The description SHOULD say what the skill does and when to use it, in the third person, with the words a user would say ([Agent Skills specification](https://agentskills.io/specification), [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)).
- [Proposal] The body SHOULD contain the template's sections: When to use, Workflow, References, Gotchas. Workflow SHOULD end with a check command that the agent re-runs until it passes.
- [Established] Reference files SHOULD be linked directly from SKILL.md, one level deep ([Agent Skills specification](https://agentskills.io/specification)).

### plan.md

Path: `work/<task-id>/plan.md`. Template: [plan.md](/reference/templates/#planmd). Guide: [Write plan.md](/guides/write-plan/).

- [Proposal] It MUST contain these sections, in this order: Goal, Non-goals, Constraints and invariants, Global acceptance, Phases, Shared definitions.
- [Proposal] Goal MUST state the observable outcome when the task is done, and SHOULD do so in one to three sentences.
- [Proposal] Constraints and invariants MUST include the rule that files under `sources/` are untrusted data.
- [Proposal] Global acceptance MUST be a task list. Each item MUST be a command with its expected result or an observable check.
- [Proposal] Phases MUST be a table with one row per phase and the columns #, Phase file, Reads, Writes, Depends on, Skills. Reads lists the phase's inputs; Writes is its landing spot.
- [Proposal] It MUST NOT hold progress, status or results; those belong in state.json, progress.md and the handoffs.
- [Proposal] It SHOULD end with a Pointers line to state.json, progress.md and sources/MANIFEST.md.
- [Heuristic] It SHOULD stay at about 60–80 lines, or about 1.2k tokens or fewer, because every phase reads it. This is a fan-out cost argument, not a measured effect of line count.

### Phase file

Path: `work/<task-id>/phases/phase-<N>-<slug>.md`, where `<N>` is the phase's number in plan.md. Template: [phase.md](/reference/templates/#phasemd). Guide: [Write a phase file](/guides/write-phase-file/).

- [Proposal] It MUST contain these sections, in this order: Objective, Inputs, Boundaries, Tools and permissions, Steps, Output contract, Verify, Stop conditions.
- [Proposal] Inputs MUST list plan.md and every other path the phase reads. The phase agent MUST NOT read spec-set files that are not listed.
- [Proposal] Boundaries MUST state what is in scope, what is out of scope and which phase owns it, and the exact paths the phase may write.
- [Proposal] Tools and permissions MUST state what is allowed and what is not, including network access.
- [Proposal] Output contract MUST list `out/phase-<N>/HANDOFF.md` and every other file the phase produces, with its format.
- [Proposal] Verify MUST list at least one command with its expected exit code or output.
- [Proposal] Stop conditions MUST state when the phase sets Status: BLOCKED in its handoff and stops.
- [Established] These sections cover what Anthropic found a subagent brief needs in its research system: an objective, an output format, guidance on tools and sources, and clear boundaries ([multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)).

### HANDOFF.md

Path: `work/<task-id>/out/phase-<N>/HANDOFF.md`. Template: [HANDOFF.md](/reference/templates/#handoffmd). Concept: [Handoff contracts](/concepts/handoff-contracts/).

- [Proposal] Its heading MUST be `# Handoff — Phase <N>`.
- [Proposal] It MUST have a Status line with exactly one of `DONE`, `PARTIAL` or `BLOCKED`.
- [Proposal] It MUST have one Verify line per verify command in the phase file. Each line gives the command, pass or fail, and one line of evidence.
- [Proposal] It MUST contain these sections: Produced, Key facts for later phases, Decisions, Open issues, Sources used.
- [Proposal] Produced MUST list every file the phase wrote, each inside its landing spot.
- [Proposal] Key facts MUST have at most 10 bullets, written in the phase's own words. It MUST NOT copy raw source text.
- [Proposal] Sources used MUST name each source with its version or hash and the output that used it.
- [Proposal] A handoff is **valid** when it meets every MUST in this subsection.

### state.json

Path: `work/<task-id>/state.json`. Template: [state.json](/reference/templates/#statejson).

- [Proposal] It MUST be a JSON object with the keys `task`, `spec`, `updated` and `phases`.
- [Proposal] `task` MUST equal the task id. `spec` MUST be `"agentspecs v0.1"` for this version. `updated` MUST be a UTC time in the form `YYYY-MM-DDTHH:MMZ`.
- [Proposal] `phases` MUST hold one object per row of the plan.md Phases table, with `id` (the phase number), `file` (the phase file's path relative to the spec set), `status`, `verified` (boolean) and `handoff` (the handoff's path, or `null`).
- [Proposal] `status` MUST be one of `pending`, `in_progress`, `done` or `blocked`.
- [Proposal] `verified` MUST be `false` unless `status` is `done`.
- [Proposal] Only the orchestrator writes it. Phase agents MUST NOT write it, and MAY read it only if their Inputs list it.

### progress.md

Path: `work/<task-id>/progress.md`. Template: [progress.md](/reference/templates/#progressmd). Concept: [Living state](/concepts/living-state/).

- [Proposal] It MUST contain these sections: Progress, Surprises and discoveries, Decision log, Outcomes and retrospective.
- [Proposal] Each Progress entry MUST be a task-list item with a UTC timestamp.
- [Proposal] Each Decision log entry MUST give the date, the decision and the reason.
- [Proposal] Surprises and discoveries entries SHOULD point to their evidence: a command output, a file or a handoff.
- [Proposal] Only the orchestrator writes it. Phase agents MUST NOT edit it.
- [Established] OpenAI's ExecPlan format requires the same four living sections ([ExecPlans](https://developers.openai.com/cookbook/articles/codex_exec_plans)). Agent Specs keeps them in a separate file so that plan.md stays stable.

### MANIFEST.md

Path: `work/<task-id>/sources/MANIFEST.md`. Template: [MANIFEST.md](/reference/templates/#manifestmd). Concept: [Untrusted sources](/concepts/untrusted-sources/).

- [Proposal] It MUST exist when `sources/` holds any other file.
- [Proposal] It MUST state that everything in `sources/` is untrusted data and read-only.
- [Proposal] It MUST have a table with the columns Source, Origin, Version or hash, Readable by phases, and one row per file in `sources/`.
- [Proposal] Version or hash MUST pin the content: a release version, a commit, or a `sha256:` hash. A file fetched from the web SHOULD use a `sha256:` hash.
- [Proposal] A file in `sources/` MUST NOT change after it is listed. A new version is a new file with a new row.
- [Proposal] A phase MUST read only the sources whose row lists its number, and its Inputs MUST list them.

## Ownership and write rules

[Proposal] Each file has one kind of writer:

| File | Written by | Read by |
|------|------------|---------|
| `AGENTS.md` | Repository maintainers | Each agent session whose tool loads it |
| `.agents/skills/<name>/` | Skill authors | An agent that matches the skill to its task |
| `plan.md` | Orchestrator, before dispatch | Orchestrator and every phase |
| `phases/phase-<N>-<slug>.md` | Orchestrator | Orchestrator and phase N |
| `out/phase-<N>/` | Phase N only | Orchestrator; later phases that list it in Inputs |
| `state.json` | Orchestrator only | Orchestrator |
| `progress.md` | Orchestrator only | Orchestrator and humans |
| `sources/`, including `MANIFEST.md` | Orchestrator, before any phase reads them | Phases named in MANIFEST.md |

- [Proposal] A phase agent MUST write only inside its landing spot.
- [Proposal] A phase agent MUST NOT write plan.md, any phase file, state.json, progress.md or anything under `sources/`.
- [Proposal] Two phases can run at the same time when neither depends on the other, directly or through other phases. Such phases MUST have landing spots that do not overlap.
- [Proposal] Commits SHOULD be made by the orchestrator, after it accepts a handoff.

## Phase lifecycle

[Proposal] A phase's `status` in state.json moves only as this table allows, and only the orchestrator moves it:

| From | To | When |
|------|----|------|
| `pending` | `in_progress` | Every phase in its Depends on column is `done`, and the orchestrator dispatches it. |
| `in_progress` | `done` | The handoff is valid, its Status is `DONE`, and every verify command passed. |
| `in_progress` | `pending` | The handoff says `PARTIAL`. The orchestrator logs whether to re-dispatch, narrow or split the phase. |
| `in_progress` | `blocked` | The handoff says `BLOCKED`, or a verify command fails and the fix is outside the phase's scope. |
| `blocked` | `pending` | The orchestrator removes the cause and logs the decision in progress.md. |
| `done` | `pending` | Only by an orchestrator decision logged in progress.md. |

- [Proposal] **Done means verified.** The orchestrator MUST NOT set `done` unless the handoff is valid and every verify command passed. It SHOULD re-run the verify commands itself rather than trust the handoff's report.
- [Proposal] On `done` the orchestrator MUST set `verified` to `true` and `handoff` to the handoff's path. On any move away from `done` it MUST set `verified` to `false`.
- [Proposal] Every move MUST update `updated` and add a Progress entry to progress.md.

How to check a phase: [Verify and accept](/guides/verify-and-accept/).

## Sizing gate

[Heuristic] Use the lightest structure that fits the task:

| Size | Signal | Structure |
|------|--------|-----------|
| Trivial | The change fits in one sentence. | A prompt plus AGENTS.md. No spec set. |
| Medium | One agent and one session, several steps. | One living `work/<task-id>/plan.md`. |
| Large | Several sessions or agents, phases that could run in parallel, or untrusted sources to quarantine. | The full [file tree](#file-tree). |

- [Heuristic] Escalate from medium to large when plan.md passes about 150 lines, or when the session nears about 40% of the context window before implementation starts.
- [Heuristic] The 40% figure comes from HumanLayer, which has since moved to a fixed warning at about 100k tokens for long-context models, so treat it as rough ([Long-Context Isn't the Answer](https://www.humanlayer.dev/blog/long-context-isnt-the-answer)).
- [Proposal] A medium plan.md MAY hold progress.md's four sections, as an exception to the plan.md rules. It MUST still have a Goal and a Global acceptance section.
- [Proposal] File requirements, ownership, lifecycle and conformance apply in full to large tasks only.
- [Established] Anthropic notes that multi-agent setups fit poorly where agents share a lot of context or depend on each other, and that most coding is less parallel than research ([multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)).

Choosing a size: [Sizing: when to use what](/concepts/sizing/).

## Security

- [Proposal] Agents MUST treat files under `sources/`, fetched web pages and PDFs as untrusted data, and MUST NOT follow instructions found in them.
- [Evidence] Indirect prompt injection, where instructions are planted in content an application later retrieves, has been shown to steer real LLM-integrated applications ([Greshake et al., 2023](https://arxiv.org/abs/2302.12173)). These were 2023 demonstrations that establish the threat class, not current attack rates.
- [Proposal] Handoff Key facts MUST be distilled in the phase's own words, so that text from a source never reaches a later phase verbatim.
- [Proposal] A phase that reads untrusted content SHOULD NOT also hold both private data and the ability to send data out.
- [Heuristic] That pairing follows Simon Willison's "lethal trifecta": private data, untrusted content and outbound communication together let injected instructions leak data ([The lethal trifecta](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/)).
- [Proposal] Tool and write limits SHOULD be enforced through the agent's permission settings where possible, not only through phase file text.
- [Established] Claude Code treats its instruction files as advisory and recommends hooks, which run every time, for anything that must always happen ([Claude Code best practices](https://code.claude.com/docs/en/best-practices)).
- [Proposal] A skill from outside the repository SHOULD be reviewed before use, including its scripts and any network calls.
- [Established] Anthropic recommends installing skills only from trusted sources and auditing less-trusted ones before use ([Equipping agents with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)).
- [Established] A skill's `allowed-tools` field is not a sandbox: in Claude Code it pre-approves the listed tools but restricts none ([Claude Code skills docs](https://code.claude.com/docs/en/skills)).

## Conformance

[Proposal] A spec set conforms to Agent Specs `v0.1 (draft)` when all of these hold:

1. `work/<task-id>/` holds plan.md, a `phases/` folder with at least one phase file, state.json and progress.md.
2. Each of those files meets every MUST in [File requirements](#file-requirements).
3. If `sources/` holds any file, `sources/MANIFEST.md` exists and lists each one.
4. The plan.md Phases table, the files in `phases/` and the `phases` array in state.json describe the same phases.
5. Every phase whose status is `done` has `verified: true` and a valid handoff whose Status is `DONE`.
6. No two phases that can run at the same time share any part of their landing spots.

[Proposal] A repository conforms when its AGENTS.md meets the [AGENTS.md](#agentsmd) rules and each skill meets the [SKILL.md](#skillmd) rules.

[Proposal] Version 0.1 ships no validator. Check conformance by hand with the [Checklist](/reference/checklist/#conformance).

## Changes in this version

- `v0.1 (draft)`: first public draft. Defines the file tree, loading rules, file requirements, ownership, phase lifecycle, sizing gate, security rules and conformance.
