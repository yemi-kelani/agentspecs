---
title: Checklist
description: Checkable lists for each gate in a packet's life, from clarifying the task to closing it.
---

[Judgment] Each item restates a rule from [Packet anatomy](/approach/packet-anatomy/) or a step from [How it works](/approach/how-it-works/) as something you can confirm by opening a file or running a command. Paths are relative to `packets/<task-id>/`. `specs-ref validate packets/<task-id>` checks the structural items for you.

## Before the plan review

- [ ] `plan.md` has Goal, Non-goals, Assumptions and resolved questions, Constraints, Repo grounding, Slices, Decisions and Surprises, in that order.
- [ ] Every assumption names who confirmed it and when.
- [ ] Repo grounding names a commit, and every path, API and command it lists exists at that commit.
- [ ] Every row of the Slices table names one behavior and at least one file under `acceptance/` that exists.
- [ ] `acceptance/README.md` has a Run command, and its Checks table has one row per slice with Reviewed by filled in.
- [ ] The hold-outs exist outside the implementer's workspace, and their hashes are in `acceptance/README.md`.

## Plan review gate

- [ ] The reviewer is not the plan's author.
- [ ] Every slice maps to at least one check, and every check maps to a slice.
- [ ] No check contradicts the Goal, Non-goals or Constraints.
- [ ] No slice is a workflow stage (such as "research" or "review") rather than a behavior.
- [ ] Decisions has a dated entry with the words "plan review" and the reviewer's name.

## Before starting a slice

- [ ] `slices/NN-<slug>.md` has Objective, Behavior, Requirements, Files and APIs, Checks, Out of scope and Report, in that order.
- [ ] Checks lists at least one command, and the command runs.
- [ ] The session starts fresh, with plan.md and this brief injected.
- [ ] `state.json` shows the slice as `in_progress` with a new `updated` time.

## Before setting passes

- [ ] The verifier did not implement this slice.
- [ ] `handoffs/NN.md` has Changed (with commit refs), Dead ends and Superseded facts.
- [ ] The verifier ran every check and hold-out and pasted the raw output under Check results.
- [ ] `git diff` shows no change under `acceptance/`.
- [ ] Verification has `Verdict: PASS`, the verifier and the date.
- [ ] `state.json` shows `"status": "done"`, `"passes": true` and `"handoff": "handoffs/NN.md"`.
- [ ] Each superseded fact is retired from plan.md.

## After a failed verification

- [ ] `failures` in `state.json` went up by one.
- [ ] If `failures` is 2 or more, Decisions has a replan line that names the slice, and the plan went back through the review gate.
- [ ] If the implementer disputed a check, the handoff has a Dispute section and acceptance/README.md records how it was resolved.

## Before closing the task

- [ ] Every slice in `state.json` is `done` with `passes` true.
- [ ] The acceptance Run command exits 0 now.
- [ ] `specs-ref validate packets/<task-id>` reports no problems.
