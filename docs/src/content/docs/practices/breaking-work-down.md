---
title: Breaking work down and keeping state
description: How a packet splits a task into verifiable slices, and how state and handoffs carry facts between sessions.
---

## Question

[Judgment] How should a long task be split across sessions, and what should carry over from one session to the next?

## What the evidence shows

- [Evidence] **Weak.** Compliance with a written rule fell as a session went on, about 5.6% lower odds per function written, in a finding identified after the fact ([R3c](/evidence/ledger/#r3c)).
- [Evidence] **Weak.** Across 18 models, performance grew less reliable as input length grew, even on simple tasks ([R5](/evidence/ledger/#r5)), and a focused prompt beat the full conversation history ([R5c](/evidence/ledger/#r5c)).
- [Evidence] **Moderate.** Revealing an instruction in pieces over several turns cut performance by 39% on average in simulated chats ([R40](/evidence/ledger/#r40)), and consolidating the pieces into one prompt recovered most of it ([R81](/evidence/ledger/#r81)).
- [Evidence] **Moderate.** Observation masking and LLM summarization each cut agent cost by roughly half with solve rates roughly flat ([R22](/evidence/ledger/#r22)); summaries made runs longer, possibly by hiding failure signals ([R22a](/evidence/ledger/#r22a)).
- [Evidence] **Moderate.** Memory systems often failed to replace outdated facts, ranking the old fact first even when the new one was retrieved ([R24](/evidence/ledger/#r24), [R24a](/evidence/ledger/#r24a)).
- [Evidence] **Weak, null.** Cross-task episodic memory never beat a coding agent's baseline ([R25](/evidence/ledger/#r25)).
- [Evidence] **Weak.** A vendor's memory tool plus context editing improved an internal search eval ([R23](/evidence/ledger/#r23)).
- [Evidence] **Anecdotal.** Anthropic's long-running harness worked one feature per session from a feature list and a progress file, after agents tried to build everything at once or declared the job done early ([R12](/evidence/ledger/#r12), [R12a](/evidence/ledger/#r12a)).

## What the packet does

- [Proposal] One slice per session, each one verifiable behavior with its own check, so that a session stays short and its result can be judged ([R12](/evidence/ledger/#r12), [R3c](/evidence/ledger/#r3c)).
- [Proposal] Each slice brief is self-contained, so the session starts from one consolidated statement of the work rather than scattered turns ([R81](/evidence/ledger/#r81)).
- [Proposal] Handoffs keep raw check output and dead ends rather than a summary of them ([R22a](/evidence/ledger/#r22a)).
- [Proposal] Superseded facts are retired from plan.md, not appended beside the old line, because stale facts tend to win ([R24a](/evidence/ledger/#r24a)).
- [Proposal] state.json holds status only; facts live in plan.md and the handoffs ([R12b](/evidence/ledger/#r12b)).

## Borrowed from

- [Judgment] A feature list whose only editable field is a pass flag, worked one item per session: Anthropic's long-running harness ([R12b](/evidence/ledger/#r12b)). There the coding agent sets the flag itself; the packet gives that job to the verifier (see [Verification](/practices/verification/)).

## Judgment calls

- [Judgment] Slice size: small enough that one check decides it and one session can finish it. No study sets a size.
- [Judgment] The handoff schema (Changed, Dead ends, Superseded facts, Check results, Verification).
- [Judgment] JSON for state because scripts can read it; the vendor's JSON-over-Markdown preference is an unmeasured observation ([R12c](/evidence/ledger/#r12c)).

## Untested

- [Judgment] Whether a multi-file packet beats one living plan file, and whether sharded briefs beat one document.
- [Judgment] How often handoff and progress files go stale in real use, and whether a handoff is worth its token cost.
