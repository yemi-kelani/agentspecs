---
title: Glossary
description: The terms this site uses for the spec packet, its files and its roles.
---

[Judgment] These are the packet's own terms. Where another format uses a similar word for something different, the entry says so.

- **Spec packet (packet).** The folder `packets/<task-id>/` that carries one task: plan.md, acceptance/, slices/, state.json and handoffs/. Replaces the v0.1 "spec set".
- **Slice.** One verifiable behavior, with its own brief and at least one acceptance check. Not a workflow stage; a task has as many slices as it has verification boundaries.
- **Slice brief.** `slices/NN-name.md`: a self-contained description of one slice that a fresh session can act on.
- **Acceptance check.** An executable check in `acceptance/`, written or reviewed by a person before code exists.
- **Hold-out.** An acceptance check the verifier keeps outside the implementer's workspace and runs before setting passes.
- **Standing context.** What an agent loads in every session before the task, such as a repository's AGENTS.md.
- **Repo grounding.** The plan.md section that lists real paths, APIs, commands and abstractions, checked at a commit.
- **Orchestrator.** The person or script that starts sessions, injects plan.md and slice briefs, and keeps state.json.
- **Implementer.** The session that builds a slice. It does not edit acceptance/ or set passes.
- **Verifier.** A session or person that did not implement the slice, runs every check and hold-out, and sets passes.
- **Reviewer.** Whoever runs the plan review gate. Not the plan's author.
- **Plan review gate.** The check, before any slice starts and after any replan, that every slice maps to a check and no check contradicts the goal.
- **Replan gate.** After two failed verifications of a slice, or a surprise that breaks the plan, plan.md changes only through the plan review gate.
- **Dispute.** A section in a handoff where the implementer names a check it thinks is wrong and says why, instead of editing it.
- **Handoff.** `handoffs/NN.md`: the verified record of one slice, with what changed, dead ends, superseded facts and raw check results.
- **Superseded fact.** A line in plan.md or a handoff that is no longer true. The orchestrator retires it rather than appending a correction.
- **Ledger row.** One verified claim in [the Ledger](/evidence/ledger/), cited as R1, R1a and so on.
