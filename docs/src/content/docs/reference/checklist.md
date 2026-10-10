---
title: Checklist
description: Checkable lists for dispatching a phase, accepting it, closing a task and checking conformance.
---

[Proposal] Each item restates a rule from the [Specification](/specification/) as something you can confirm by opening a file or running a command. Paths are relative to `work/<task-id>/`. Copy a list into progress.md or a review comment and tick it off.

## Before dispatching a phase

- [ ] `plan.md` exists and has the sections Goal, Non-goals, Constraints and invariants, Global acceptance, Phases and Shared definitions.
- [ ] `plan.md` has a row for this phase in its Phases table, with Phase file, Reads, Writes and Depends on filled in.
- [ ] `phases/phase-<N>-<slug>.md` exists and has the sections Objective, Inputs, Boundaries, Tools and permissions, Steps, Output contract, Verify and Stop conditions.
- [ ] The phase file's Inputs list `plan.md`, and every listed path exists now.
- [ ] The phase file's Verify section has at least one command with an expected exit code or output.
- [ ] The phase file's Output contract lists `out/phase-<N>/HANDOFF.md`.
- [ ] Every phase in this phase's Depends on column has `"status": "done"` in `state.json`.
- [ ] No phase that is `in_progress` has a Writes path that overlaps this phase's Writes path.
- [ ] If another phase is `in_progress`, this phase gets its own working copy (`git worktree list` shows it), and its `env` values in `state.json` differ from that phase's.
- [ ] Each file under `sources/` that the phase reads has a row in `sources/MANIFEST.md` that lists this phase number.
- [ ] `wc -l plan.md` reports about 80 lines or fewer, or the overrun is logged in the progress.md decision log ([budgets](/reference/size-budgets/)).
- [ ] The dispatch message gives the exact paths of `plan.md`, the phase file and its inputs.
- [ ] `state.json` shows this phase as `"in_progress"` with a new `updated` time.

## Before marking a phase done

- [ ] `out/phase-<N>/HANDOFF.md` exists and starts with `# Handoff — Phase <N>`.
- [ ] Its Status line reads `DONE`.
- [ ] It has one Verify line for each verify command in the phase file, and every one reports pass.
- [ ] You re-ran each verify command from the phase file and got the expected exit code or output.
- [ ] It has the sections Produced, Key facts for later phases, Decisions, Open issues and Sources used.
- [ ] Key facts has 10 bullets or fewer, and none of them pastes text from a source.
- [ ] Every path under Produced exists and sits inside the phase's Writes paths.
- [ ] `git status --porcelain` shows no changed file outside the phase's Writes paths.
- [ ] `state.json` shows `"status": "done"`, `"verified": true` and the handoff's path in `handoff`, with a new `updated` time.
- [ ] `progress.md` has a timestamped Progress entry for this phase.
- [ ] If `sources/MANIFEST.md` marks a source confidential, the leak check passes before you commit or push this phase's outputs.

## Before closing the task

- [ ] Every phase in `state.json` has `"status": "done"` and `"verified": true`.
- [ ] No handoff in `out/` has a Status of `PARTIAL` or `BLOCKED`.
- [ ] Every command under Global acceptance in `plan.md` exits 0 when you run it now.
- [ ] Every observable check under Global acceptance is ticked, with a link to its evidence.
- [ ] If `plan.md` lists more than one phase, the review phase is `done`: its agent ran none of the other phases, re-ran Global acceptance and listed no open gap.
- [ ] If `sources/MANIFEST.md` marks a source confidential, the leak check passes now, and no file in the repository holds the term list or hashes of its terms.
- [ ] Every item under Open issues in every handoff is either fixed or recorded in the progress.md decision log.
- [ ] `shasum -a 256` on each file in `sources/` matches the hash in `sources/MANIFEST.md`.
- [ ] The Outcomes and retrospective section of `progress.md` is filled in.

## Conformance

- [ ] `plan.md`, `state.json`, `progress.md` and at least one file in `phases/` exist.
- [ ] Each phase file name matches `phase-<N>-<slug>.md`.
- [ ] The phase files, the Phases table rows in `plan.md` and the `phases` entries in `state.json` name the same phases.
- [ ] `python3 -m json.tool state.json` exits 0.
- [ ] `state.json` has the keys `task`, `spec`, `updated` and `phases`, and `spec` is `"agentspecs v0.1"`.
- [ ] Each `phases` entry has `id`, `file`, `status`, `verified` and `handoff`, and `status` is `pending`, `in_progress`, `done` or `blocked`.
- [ ] No entry has `"verified": true` with a status other than `done`.
- [ ] Every `done` phase has a handoff that passes the "Before marking a phase done" list.
- [ ] If `sources/` holds any file, `sources/MANIFEST.md` exists and has one row per file, each with a version or `sha256:` hash.
- [ ] No two phases without a dependency path between them share any Writes path or any `env` value for the same name.
- [ ] If `plan.md` lists more than one phase, the last row is `phases/phase-<N>-review.md`: it depends on every other phase, writes only `out/phase-<N>/`, and its Verify includes every Global acceptance command.
- [ ] `sources/MANIFEST.md`, if present, has a Confidential column with `yes` or `no` in every row, and if any row says `yes`, Constraints and invariants in `plan.md` say where the term list lives and Global acceptance has a leak check item with its command.
- [ ] The repository's `AGENTS.md` has the sections Commands, Rules the code does not show, Routing and Boundaries, and a Routing row that points multi-step tasks to `work/<task-id>/`.
- [ ] Each skill folder name under `.agents/skills/` equals the `name` field of its `SKILL.md`.
