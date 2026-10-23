---
title: Trust and security
description: Why packet files are treated as trusted code, and what the evidence says about instructions hidden in agent inputs.
---

## Question

[Judgment] Which files may an agent take instructions from, and how should the rest be handled?

## What the evidence shows

- [Evidence] **Moderate.** Indirect prompt injection lets an attacker plant instructions in content an application later reads ([R122](/evidence/ledger/#r122)).
- [Evidence] **Anecdotal.** Researchers showed that one added instruction and a script in a public skill made Claude Code send a user's file to an outside server ([R26](/evidence/ledger/#r26)), and argue that agents treat every line of a skill as an instruction ([R26a](/evidence/ledger/#r26a)).
- [Evidence] **Moderate.** On a skill-injection benchmark, contextual attack success ranged from 8.6% to 67.6% across models and policies ([R27](/evidence/ledger/#r27)), and payloads in bundled scripts succeeded more often than payloads in text ([R27a](/evidence/ledger/#r27a)).
- [Evidence] **Moderate.** In confirmed malicious skills found in the wild, 84.2% of vulnerabilities sat in the SKILL.md text, not in code ([R27b](/evidence/ledger/#r27b)); a wider scan flagged 26.1% of skills with a vulnerability pattern ([R27e](/evidence/ledger/#r27e)).
- [Evidence] **Weak and moderate.** When an injected skill must first win retrieval among many, its effective success fell by 87% to 97% ([R27c](/evidence/ledger/#r27c)), but a router-aware attack recovered part of that ([R27d](/evidence/ledger/#r27d)).
- [Evidence] **Weak.** Poisoned agent memory carried malicious rules into later sessions, and a prompt defense left that cross-session effect nearly unchanged ([R28](/evidence/ledger/#r28), [R28a](/evidence/ledger/#r28a)).
- [Evidence] **Moderate.** Adaptive attackers evaded an open-source skill scanner in most runs ([R124](/evidence/ledger/#r124)).

## What the packet does

- [Proposal] Packet files are trusted code: a person writes or reviews every line, provenance is tracked in git, and no line is generated from untrusted content ([R26a](/evidence/ledger/#r26a), [R27b](/evidence/ledger/#r27b)).
- [Proposal] Everything else an agent reads, such as issue text, web pages and fetched documents, is data, never instructions, and the packet says so in its constraints ([R122](/evidence/ledger/#r122)).
- [Proposal] Handoffs and plan.md are reviewed before the next session loads them, because state that persists across sessions can carry an injection forward ([R28](/evidence/ledger/#r28)).

## Borrowed from

- [Judgment] The "lethal trifecta" framing of private data, untrusted content and outbound communication: Simon Willison ([R129](/evidence/ledger/#r129)).

## Judgment calls

- [Judgment] Human review of every packet line is the control; the packet does not mandate a scanner, since scanners were evaded ([R124](/evidence/ledger/#r124)).

## Untested

- [Judgment] Whether treating packet files as reviewed code measurably reduces injection on real coding tasks; the rows above test skills and memory, not task packets.
