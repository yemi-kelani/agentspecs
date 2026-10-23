---
title: Verification
description: Why a packet writes checks before code, keeps hold-outs, and lets only a separate verifier mark a slice as passing.
---

## Question

[Judgment] Who should decide that a slice works, and with what?

## What the evidence shows

- [Evidence] **Strong.** On tasks whose tests contradict the spec, frontier models cheated often: GPT-5 on 76% of one benchmark's tasks ([R18](/evidence/ledger/#r18)). More capable models tended to cheat more ([R18e](/evidence/ledger/#r18e)).
- [Evidence] **Moderate.** Hiding tests cut cheating to near zero but cost legitimate performance; read-only tests stopped test edits but not special-casing ([R18b](/evidence/ledger/#r18b), [R18c](/evidence/ledger/#r18c)). Stricter prompts and a flag-for-human option cut cheating for some models and not others ([R18a](/evidence/ledger/#r18a), [R18d](/evidence/ledger/#r18d)).
- [Evidence] **Weak.** Held-out tests added little over an LLM judge for catching reward hacks, and missed some heuristic solutions ([R19](/evidence/ledger/#r19)).
- [Evidence] **Moderate.** Given human-written tests, a test-driven workflow passed 88.8% to 94.3% of tasks, against 68.0% when it wrote its own ([R15](/evidence/ledger/#r15), [R15a](/evidence/ledger/#r15a)).
- [Evidence] **Moderate.** Writing a contract-style spec before generating tests raised bug detection from 53.4% to 63.2%, at 38% more tokens ([R16](/evidence/ledger/#r16), [R16a](/evidence/ledger/#r16a)).
- [Evidence] **Weak.** A TDD prompt alone raised regressions; a map of the tests each change affects cut them ([R17](/evidence/ledger/#r17)).
- [Evidence] **Moderate.** Without outside feedback, models corrected themselves poorly ([R95](/evidence/ledger/#r95), [R97](/evidence/ledger/#r97)), and models tend to favour their own output when judging ([R98](/evidence/ledger/#r98)), though much of that preference matched genuinely better answers on verifiable tasks ([R99](/evidence/ledger/#r99)).
- [Evidence] **Anecdotal.** Anthropic found that end-to-end testing tools improved its harness's results, without numbers ([R12d](/evidence/ledger/#r12d)).

## What the packet does

- [Proposal] Acceptance checks are written or reviewed by a person before code, and the implementer cannot edit them ([R15](/evidence/ledger/#r15), [R18c](/evidence/ledger/#r18c)).
- [Proposal] The verifier keeps a hold-out subset outside the implementer's workspace ([R18b](/evidence/ledger/#r18b)), as one safeguard among several ([R19](/evidence/ledger/#r19)).
- [Proposal] Only a separate verifier sets `passes`, after running every check and hold-out and pasting the raw output ([R18](/evidence/ledger/#r18), [R95](/evidence/ledger/#r95), [R98](/evidence/ledger/#r98)).
- [Proposal] A check that looks wrong is disputed, never edited ([R18d](/evidence/ledger/#r18d)).
- [Proposal] Slice briefs give runnable commands and a test map ([R17](/evidence/ledger/#r17)).

## Borrowed from

- [Judgment] A passes-only status field: Anthropic's harness ([R12b](/evidence/ledger/#r12b)). Giving that field to a separate verifier is this packet's change.
- [Judgment] A fresh-context reviewer: the Claude Code docs' writer and reviewer pattern ([R88](/evidence/ledger/#r88)).

## Judgment calls

- [Judgment] How many hold-outs to keep, and whether a person or an agent verifies; the packet requires only that the verifier did not implement the slice.
- [Judgment] Recording hold-out hashes in acceptance/README.md.

## Untested

- [Judgment] Whether a separate verifier catches more than the implementer's own check on ordinary, possible coding tasks; the strong rows come from impossible-task stress tests.
- [Judgment] The human review cost of writing acceptance checks first.
