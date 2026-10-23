---
title: How it works
description: One task through the packet, from a clarified goal to verified slices, handoffs and state.
---

[Judgment] This page follows one task through the packet. Three roles do the work: a **person** who owns the goal, an **orchestrator** (a person or a script) who starts sessions and keeps state, and agent sessions that act as **implementer**, **reviewer** or **verifier**. One agent can play several roles, but never implementer and verifier for the same slice.

## 1. Clarify

[Proposal] The person and an agent turn the request into plan.md's Goal, Non-goals and Assumptions, and the person confirms each assumption with a date. On a benchmark that scores the stages separately, 46.7% of agent runs failed at requirement clarification or planning ([R10](/evidence/ledger/#r10)), with missed requirements the largest single cause ([R10a](/evidence/ledger/#r10a)).

## 2. Ground

[Proposal] The agent reads the real repository and writes Repo grounding: paths that exist, the APIs and commands to use, and abstractions to reuse, each checked at a named commit. Böckeler saw an agent take notes on existing classes as a new spec and write the classes again ([R7a](/evidence/ledger/#r7a)), and repository-grounding hooks raised a judged quality score in one Spec Kit study ([R11](/evidence/ledger/#r11)).

## 3. Acceptance first

[Proposal] Before any code, a person writes or reviews executable checks in `acceptance/`, one or more per slice, and the verifier keeps a hold-out subset outside the implementer's workspace. Agents given human-written tests passed far more tasks than agents that wrote their own ([R15](/evidence/ledger/#r15), [R15a](/evidence/ledger/#r15a)), and a spec written before tests raised bug detection in one study ([R16](/evidence/ledger/#r16)).

## 4. Plan review gate

[Judgment] A reviewer other than the plan's author confirms that every slice maps to a check, that no check contradicts the goal or constraints, and that the plan is not padded. The reviewer records the review in Decisions; the validator refuses to let a slice start without it. [Evidence] A subpar plan did worse than no plan in one study, and adding best-practice phases also hurt ([R9b](/evidence/ledger/#r9b), [R9c](/evidence/ledger/#r9c)).

## 5. Execute one slice

[Proposal] The orchestrator starts a fresh session, injects plan.md and the one slice brief, and re-injects them during long sessions. A standard plan improved resolution for all four models in one study, and periodic reminders helped three of the four ([R9](/evidence/ledger/#r9), [R9a](/evidence/ledger/#r9a)). Compliance with a written rule fell as a session went on ([R3c](/evidence/ledger/#r3c)). [Judgment] How often to re-inject is not settled by any study; the templates suggest at the start and after each check run.

## 6. Verify separately

[Proposal] A verifier session that wrote none of the code runs every check and hold-out, pastes the raw output into the handoff, and only then sets `passes` in state.json. Agents cheated on editable tests in a large share of impossible tasks, and read-only or hidden tests cut that cheating ([R18](/evidence/ledger/#r18), [R18b](/evidence/ledger/#r18b), [R18c](/evidence/ledger/#r18c)). Models also correct themselves poorly without outside feedback ([R95](/evidence/ledger/#r95)).

## 7. Hand off

[Proposal] The handoff records what changed (with commit refs), raw check results, dead ends tried and facts now superseded, and the orchestrator retires the superseded lines from plan.md instead of appending corrections. LLM summaries can hide failure signals ([R22a](/evidence/ledger/#r22a)), and memory systems often ranked an outdated fact above its replacement ([R24a](/evidence/ledger/#r24a)).

## 8. Replan gate

[Judgment] After two failed verifications of a slice, or a surprise that breaks the plan, plan.md changes only through the step-4 review, and the replan is recorded in Decisions with the slice named.

## The dispute rule

[Proposal] If an implementer thinks a check is wrong, it stops and writes a Dispute section in its handoff naming the check and the reason; it never edits the check, and the slice status becomes `disputed`. Prompting models to flag impossible tasks for a human cut cheating sharply for two of three models tested ([R18d](/evidence/ledger/#r18d)).

## Tooling over exhortation

[Proposal] Each slice brief gives runnable commands and a test map, not an instruction to "do TDD". A TDD prompt alone increased regressions in one study, while a map of the tests each change affects reduced them ([R17](/evidence/ledger/#r17)).

[Judgment] [Packet anatomy](/approach/packet-anatomy/) gives the exact sections and rules for each file; the [practice pages](/practices/standing-context/) grade the evidence behind each step.
