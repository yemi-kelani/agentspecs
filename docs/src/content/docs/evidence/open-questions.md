---
title: Open questions
description: What no study has tested about the packet, and a protocol for the head-to-head comparison nobody has run.
---

[Judgment] The rows in the [Ledger](/evidence/ledger/) test parts of the packet one at a time, mostly in settings other than multi-session coding. None tests the packet as a whole. The roadmap tracks the same list.

## Untested

- [Judgment] **The head-to-head.** No study compares a packaged spec format, this one or any other, against a single plan file and against no structure on medium or hard multi-session work.
- [Judgment] **Multi-file packet against one living plan.** Whether separate slice briefs and handoffs beat one ExecPlan-style document.
- [Judgment] **Sharded briefs against one document.** Whether injecting one slice brief beats injecting the whole plan.
- [Judgment] **Memory-bank files for coding.** Whether always-loaded project memory helps coding agents; [R25](/evidence/ledger/#r25) found cross-task memory did not.
- [Judgment] **JSON against Markdown for state.** The only support is an unmeasured vendor observation ([R12c](/evidence/ledger/#r12c)).
- [Judgment] **Structured acceptance wording.** Whether EARS or Given-When-Then criteria beat free-form checks.
- [Judgment] **Plan granularity.** How results change with slice size, against the coarse plan in [R9](/evidence/ledger/#r9).
- [Judgment] **Reminder frequency.** How often to re-inject the plan; [R9a](/evidence/ledger/#r9a) tested one interval and one model collapsed under it.
- [Judgment] **Separate verifier on possible tasks.** The verification rows from controlled studies come from impossible-task stress tests ([R18](/evidence/ledger/#r18)).
- [Judgment] **Generalising the nulls.** Whether the context-file and file-size nulls ([R1](/evidence/ledger/#r1), [R3](/evidence/ledger/#r3)) hold for other languages, longer files and task specs.
- [Judgment] **Human review cost.** How long writing acceptance checks first and reviewing the plan take, against the time they save.
- [Judgment] **Handoff value.** Whether a handoff is worth its token cost, and how often handoffs and plans go stale in real use.
- [Judgment] **Maintenance over time.** Whether a spec kept after the task stays accurate.

## Replication protocol for the head-to-head

[Judgment] A design anyone with agent access can run. Publish the protocol before running it.

1. [Judgment] **Tasks.** At least 30 medium-to-hard tasks from at least 5 real repositories, each needing several sessions and each with a hidden, human-written acceptance suite. Tasks must post-date the models' training data, or be held out from public benchmarks.
2. [Judgment] **Conditions.** (a) no structure: the issue text only; (b) one living plan file; (c) the full packet; (d) optionally another spec format. Same model, harness, budget and session limit in every condition.
3. [Judgment] **Assignment.** Every task runs in every condition, in random order, at least 3 times per condition to measure run-to-run variance.
4. [Judgment] **Outcomes.** Primary: hidden acceptance suite pass rate. Secondary: regressions in the existing test suite, total tokens and cost, wall-clock time, human minutes spent on clarification and review, and test edits or other cheating found on inspection.
5. [Judgment] **Blinding.** Graders of secondary outcomes do not see the condition.
6. [Judgment] **Analysis.** A mixed-effects model with task and repository as random effects, reporting effect sizes with confidence intervals, and stating the smallest effect the design can detect. Report nulls.
7. [Judgment] **Release.** Tasks, prompts, packets, transcripts and analysis code.
