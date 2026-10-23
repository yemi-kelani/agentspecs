---
title: Standing context
description: What belongs in the context an agent loads every session, and what the evidence says about it.
---

## Question

[Judgment] What should an agent see in every session, before it reads the task, and how much of it?

## What the evidence shows

- [Evidence] **Moderate, null.** Adding an AGENTS.md-style context file did not significantly change task success across four agent setups ([R1](/evidence/ledger/#r1)), and it raised inference cost by about 20% ([R1a](/evidence/ledger/#r1a)).
- [Evidence] **Moderate.** Developer-written files beat LLM-generated ones by about 7%, though still not significantly better than no file ([R1d](/evidence/ledger/#r1d)).
- [Evidence] **Moderate.** Repository overviews did not help agents reach the files they needed any sooner ([R1b](/evidence/ledger/#r1b)). That shows overviews did not help there; it does not show they hurt.
- [Evidence] **Weak.** Agents did act on concrete tool instructions in those files ([R1c](/evidence/ledger/#r1c)).
- [Evidence] **Weak, conflicting.** An efficiency study found an AGENTS.md lowered median runtime and output tokens, without measuring correctness ([R2](/evidence/ledger/#r2)). See conflict [C1](/evidence/ledger/#c1-do-context-files-raise-or-lower-cost).
- [Evidence] **Weak, null.** File length from 25 to 500 lines, rule position and splitting the file made no detectable difference to compliance with one trivial rule ([R3](/evidence/ledger/#r3), [R3a](/evidence/ledger/#r3a), [R3b](/evidence/ledger/#r3b)), while a long-context study found a U-shape by position ([R6](/evidence/ledger/#r6)). See conflict [C2](/evidence/ledger/#c2-do-file-size-and-position-matter).
- [Evidence] **Weak.** In one vendor's evals, an always-loaded docs index passed every case where an on-demand skill was often never invoked ([R20](/evidence/ledger/#r20), [R20a](/evidence/ledger/#r20a)). See conflict [C3](/evidence/ledger/#c3-does-always-loaded-context-help).
- [Evidence] **Anecdotal.** Vendors advise short instruction files with detail elsewhere: under 500 lines for SKILL.md ([R21](/evidence/ledger/#r21)), under 200 per CLAUDE.md ([R47](/evidence/ledger/#r47)). None of these limits comes from a published experiment ([R58](/evidence/ledger/#r58)).

## What the packet does

- [Proposal] Standing context stays minimal and human-written: the commands, rules and pitfalls an agent would get wrong without being told. Generated files and overviews add cost with no measured gain ([R1a](/evidence/ledger/#r1a), [R1b](/evidence/ledger/#r1b), [R1d](/evidence/ledger/#r1d)).
- [Proposal] Task facts go in plan.md and the slice brief, which the orchestrator injects, rather than in the repository-wide file. Facts the model cannot otherwise know are where always-loaded context helped ([R20](/evidence/ledger/#r20)).
- [Proposal] A rule that matters is backed by a check, a hook or a linter, because a written rule changed behaviour without guaranteeing it ([R3d](/evidence/ledger/#r3d), [R85](/evidence/ledger/#r85)).

## Borrowed from

- [Judgment] A short AGENTS.md that works as a map to detail elsewhere: OpenAI's harness-engineering write-up, which reports that one large instruction file crowded out the task ([R56](/evidence/ledger/#r56), [R57](/evidence/ledger/#r57)).

## Judgment calls

- [Judgment] No line or token budget. The packet sets none, because the size studies found no threshold and conflict with each other.
- [Judgment] Whether a short repository overview earns its place is left to the author; the packet neither requires nor forbids one.

## Untested

- [Judgment] Whether minimal, human-written standing context beats no standing context on multi-session work. [Open questions](/evidence/open-questions/) lists this.
- [Judgment] Whether the R1 and R3 nulls hold outside Python and TypeScript, or for files longer than 500 lines.
