---
title: FAQ
description: Short answers to common questions about the Agent Specs packet.
---

## Is it better than other spec formats, or than no spec?

Untested. [Judgment] Nobody has compared this packet, or any packaged format, head to head on medium or hard multi-session work. [Open questions](/evidence/open-questions/#replication-protocol-for-the-head-to-head) gives a protocol for that comparison. Some parts rest on peer-reviewed studies and others on practitioner reports; each row says which.

## Is Agent Specs an official standard?

No. [Judgment] Format v0.2 is a draft, published in [the Agent Specs repository](https://github.com/yemi-kelani/agentspecs) for anyone to use or criticise. It is not affiliated with any agent vendor or with the AGENTS.md or Agent Skills projects.

## Do I need a packet for every change?

No. [Judgment] A change you can describe in one sentence needs a prompt. The packet is for work that spans several sessions or needs checks written up front. Vendors give the same advice for small changes ([R70](/evidence/ledger/#r70)).

## Does a context file make agents more successful?

[Evidence] Not in general, in the one controlled study: an AGENTS.md-style file did not significantly change task success and raised cost by about 20% ([R1](/evidence/ledger/#r1), [R1a](/evidence/ledger/#r1a)). An efficiency study found lower runtime ([R2](/evidence/ledger/#r2)); see conflict [C1](/evidence/ledger/#c1-do-context-files-raise-or-lower-cost).

## Does file length matter?

[Evidence] One study found no detectable effect from 25 to 500 lines on following one trivial rule ([R3](/evidence/ledger/#r3)); others found accuracy falling as inputs or instruction counts grew ([R4](/evidence/ledger/#r4), [R5](/evidence/ledger/#r5)). See conflict [C2](/evidence/ledger/#c2-do-file-size-and-position-matter). [Judgment] The packet sets no line budget.

## Why can't the implementer mark its own slice as passing?

[Proposal] Because agents cheat on tests they can edit ([R18](/evidence/ledger/#r18)) and correct themselves poorly without outside feedback ([R95](/evidence/ledger/#r95)). A separate verifier sets passes.

## Do I need subagents?

No. [Proposal] Slices can run one after another in fresh sessions of one agent. Multi-agent setups use many more tokens and fit poorly where work is coupled ([R14a](/evidence/ledger/#r14a), [R14c](/evidence/ledger/#r14c)).

## Why JSON for state?

[Judgment] So a script can read it. The vendor report that models overwrite JSON less often than Markdown is an unmeasured observation ([R12c](/evidence/ledger/#r12c)).

## Which agents support it?

[Judgment] Any agent that can read and write files in your repository. A person can act as orchestrator or verifier.

## Is there a validator?

[Judgment] A reference one, [specs-ref](https://github.com/yemi-kelani/agentspecs/tree/main/specs-ref), checks a packet's structure against [Packet anatomy](/approach/packet-anatomy/). It does not run the checks; the verifier does.

## How do I propose a change?

See [Contribute](/contribute/).
