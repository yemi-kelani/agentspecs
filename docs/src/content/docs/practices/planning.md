---
title: Planning
description: How a packet's plan is clarified, grounded, reviewed and kept current, and the evidence behind each step.
---

## Question

[Judgment] What should a plan hold before an agent writes code, and who should check it?

## What the evidence shows

- [Evidence] **Strong.** Across four LLMs on 497 SWE-bench Verified issues, a standard navigate, reproduce, patch, validate plan resolved more issues than no plan for every model ([R9](/evidence/ledger/#r9)).
- [Evidence] **Moderate.** A subpar plan, with its reproduction or validation phase removed, did worse than no plan in several model pairs ([R9b](/evidence/ledger/#r9b)), and adding best-practice phases lowered success for all four models ([R9c](/evidence/ledger/#r9c)).
- [Evidence] **Weak.** On a benchmark that scores clarification and planning separately, 46.7% of runs failed at those stages ([R10](/evidence/ledger/#r10)), most often by missing a requirement ([R10a](/evidence/ledger/#r10a)).
- [Evidence] **Weak and moderate.** A to-do-style planning tool lifted a weak model by 11.6 points but cost larger models a little success while cutting their cost ([R8](/evidence/ledger/#r8), [R8a](/evidence/ledger/#r8a)).
- [Evidence] **Weak.** Grounding hooks raised an LLM judge's score in a Spec Kit pipeline, but that study did not compare specs against no specs, and blinded humans preferred the version without hooks ([R11](/evidence/ledger/#r11), [R11a](/evidence/ledger/#r11a), [R11c](/evidence/ledger/#r11c)).
- [Evidence] **Anecdotal.** In one practitioner's trials, spec tools turned a small bug into 16 acceptance criteria and produced files tedious to review ([R7b](/evidence/ledger/#r7b), [R7](/evidence/ledger/#r7)).
- [Evidence] **Anecdotal.** Vendors advise skipping a formal plan for changes you can describe in one sentence ([R70](/evidence/ledger/#r70), [R74](/evidence/ledger/#r74)).

## What the packet does

- [Proposal] Clarify first: plan.md records each assumption with the person who confirmed it, because clarification is where many runs fail ([R10](/evidence/ledger/#r10)).
- [Proposal] Ground against the real repository: Repo grounding names paths, APIs, commands and abstractions to reuse, checked at a commit ([R7a](/evidence/ledger/#r7a), [R11](/evidence/ledger/#r11)).
- [Proposal] Review before execution: a plan review gate, because a bad plan can be worse than none ([R9b](/evidence/ledger/#r9b)), and keep the plan lean, because extra phases hurt ([R9c](/evidence/ledger/#r9c)).
- [Proposal] Keep Decisions and Surprises as living logs in plan.md ([R29](/evidence/ledger/#r29)).

## Borrowed from

- [Judgment] Living Decisions and Surprises sections: OpenAI's ExecPlans ([R29](/evidence/ledger/#r29)), which OpenAI says let Codex work for over seven hours from one prompt, an anecdote with no comparison ([R29a](/evidence/ledger/#r29a)).
- [Judgment] Tracing each requirement to a task and a check: Kiro specs and GitHub Spec Kit ([R152](/evidence/ledger/#r152), [R76](/evidence/ledger/#r76)). The packet traces each slice to an acceptance file instead of to a requirement list.

## Judgment calls

- [Judgment] The reviewer checklist: every slice maps to a check, no check contradicts the goal or constraints, no padded phases. No study tested a checklist.
- [Judgment] When to use a packet at all: the packet is for work that spans several sessions; a one-sentence change needs only a prompt. No study sets the boundary.
- [Judgment] Free-form acceptance wording; the packet does not require EARS or Given-When-Then.

## Untested

- [Judgment] Whether a reviewed plan beats an unreviewed one, or a human reviewer beats an agent reviewer.
- [Judgment] How plan granularity affects results: the packet's finer slices against the coarse four-phase plan in R9.
