---
title: FAQ
description: Short answers to common questions about Agent Practices and the evidence behind it.
---

## Is this a framework or a standard?

No. Agent Practices reports what published studies, product documentation and teams' own accounts show about giving coding agents context, and links every claim to its source. There is no format to adopt. It is not affiliated with any agent vendor or with the AGENTS.md or Agent Skills projects.

## What happened to Agent Specs and the spec packet?

The site used to propose a spec format. It now starts from the evidence instead. The format was retired in October 2026, and its parts that rows support appear as practices: state and progress files on [Long-running work](/practices/long-running-work/), and checks written first and run by someone other than the implementer on [Verification](/practices/verification/). Old addresses redirect.

## How strong is the evidence?

It varies by question, and each row's caveat says what it does not show. Much of the ledger is vendor documentation and practitioners' accounts of what they do. Controlled studies of coding agents exist for some questions, such as checking the work and finding code in a repository, and are few or absent for others. [Method](/evidence/method/) explains how rows are chosen and checked, and [Open questions](/evidence/open-questions/) lists what nobody has tested.

## Does an instruction file make agents more successful?

[Evidence] Not in general, in the controlled tests so far: an AGENTS.md-style file did not significantly change task success and raised cost by about 20% ([R1](/evidence/ledger/#r1), [R1a](/evidence/ledger/#r1a)). An efficiency study found lower runtime ([R2](/evidence/ledger/#r2)); see conflict [C1](/evidence/ledger/#c1-do-context-files-raise-or-lower-cost). [Instruction files](/practices/instruction-files/) has the detail.

## Does file length matter?

[Evidence] One study found no detectable effect from 25 to 500 lines on following one simple rule ([R3](/evidence/ledger/#r3)); others found accuracy falling as inputs or instruction counts grew ([R4](/evidence/ledger/#r4), [R5](/evidence/ledger/#r5)). See conflict [C2](/evidence/ledger/#c2-do-file-size-and-position-matter).

## Do I need subagents?

[Evidence] Not by default. One vendor's multi-agent system used about 15 times the tokens of a chat, and fits poorly where agents must share context ([R14a](/evidence/ledger/#r14a), [R14c](/evidence/ledger/#r14c)). [Subagents and parallel work](/practices/subagents/) covers when they help.

## Should I have the agent do test-driven development?

[Evidence] Tests in the prompt helped on small functions ([R220](/evidence/ledger/#r220)), and the Claude Code docs show a failing test written before the fix ([R234](/evidence/ledger/#r234)). But models wrote a correct failing test for only a fifth to a third of real issues, and tests written from existing code tended to pass its bugs ([R225](/evidence/ledger/#r225), [R229](/evidence/ledger/#r229)). [Verification](/practices/verification/) covers what to check.

## Can an agent understand a codebase of millions of lines?

[Evidence] Success falls as repositories grow, and finding the right code is where much of the effort goes ([R169](/evidence/ledger/#r169), [R171](/evidence/ledger/#r171)). [Large codebases](/practices/large-codebases/) covers what has been tested to help.

## How do I add evidence or correct a claim?

See [Contribute](/contribute/).
