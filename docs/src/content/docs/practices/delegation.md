---
title: Delegation
description: When a packet hands slices to subagents or parallel sessions, and what that costs.
---

## Question

[Judgment] Should slices run in subagents or parallel sessions, and if so, which ones?

## What the evidence shows

- [Evidence] **Weak.** Anthropic's multi-agent research system beat a single agent by 90.2% on an internal research eval, with no disclosed metric or sample size ([R14](/evidence/ledger/#r14)).
- [Evidence] **Weak.** The same post reports that multi-agent systems use about 15 times the tokens of a chat, and that token use alone explained 80% of the variance on one browsing benchmark ([R14a](/evidence/ledger/#r14a), [R14b](/evidence/ledger/#r14b)).
- [Evidence] **Anecdotal.** Anthropic says multi-agent setups fit poorly where agents share context or depend on each other, and that most coding is less parallelizable than research ([R14c](/evidence/ledger/#r14c)). It also lists what a subagent brief needs: an objective, an output format, tool guidance and clear boundaries ([R14d](/evidence/ledger/#r14d)).
- [Evidence] **Moderate.** In a taxonomy of multi-agent failures, the largest share came from system design, including agents disobeying the task or role specification ([R13](/evidence/ledger/#r13)).
- [Evidence] **Anecdotal.** Anthropic's harness post leaves open whether one general coding agent or several specialised ones works best ([R12e](/evidence/ledger/#r12e)).
- [Evidence] **Strong (documentation).** A subagent runs in its own context window and returns a summary ([R102](/evidence/ledger/#r102)). Worktrees isolate file edits but are not a security boundary, and do not track what shell commands write ([R105](/evidence/ledger/#r105), [R115](/evidence/ledger/#r115)).

## What the packet does

- [Proposal] Subagents are optional. Use them only for low-coupling slices, and expect a large token cost ([R14a](/evidence/ledger/#r14a), [R14c](/evidence/ledger/#r14c)).
- [Proposal] Each delegated slice gets its full brief injected by the orchestrator, with objective, behavior, files, checks and boundaries, rather than a pointer for the subagent to fetch ([R14d](/evidence/ledger/#r14d), [R13](/evidence/ledger/#r13)).
- [Proposal] Slices that run at the same time get separate working copies, and nothing relies on a worktree for safety ([R105](/evidence/ledger/#r105), [R115](/evidence/ledger/#r115)).

## Borrowed from

- [Judgment] The elements of a subagent brief: Anthropic's multi-agent research system ([R14d](/evidence/ledger/#r14d)).

## Judgment calls

- [Judgment] Which slices count as low-coupling: those whose files and checks do not overlap any other running slice.
- [Judgment] Running slices one after another in fresh sessions of a single agent is the default; parallel runs are an optimisation.

## Untested

- [Judgment] Whether subagents help on coding packets at all, once their token cost is counted; the 90.2% figure comes from research queries, not code.
