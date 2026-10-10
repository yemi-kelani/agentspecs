---
title: Verification and review
description: Why every phase ends in a check a machine can run, why a separate reviewer re-runs the global checks, and why the orchestrator settles its findings.
---

[Proposal] In Agent Specs a phase is done when a command says so, not when the agent says so. Every phase ends in checks a machine can run, a longer plan ends with a review by an agent that did none of the work, and the orchestrator settles what the review finds.

## Every phase ends in a check

[Established] The Claude Code docs advise giving an agent a check it can run, such as tests, a build or a linter, so it keeps iterating until the check passes instead of stopping when the work only looks done ([Claude Code best practices](https://code.claude.com/docs/en/best-practices)).

[Proposal] So every phase file names verify commands with their expected results, Global acceptance holds only commands and observable checks, and the orchestrator re-runs a phase's commands itself before marking it done.

## A reviewer that did none of the work

[Proposal] Phase checks show that each phase met its own contract, not that the phases together met the goal. So when plan.md lists more than one phase, the last is a review: a fresh agent reads plan.md, the phase files, their handoffs and the diff, never the other agents' transcripts.

[Established] Claude Code's docs recommend a reviewer subagent with a fresh context that sees only the diff and the criteria, so the agent that did the work does not grade it, and say a fresh context improves review because the model is not biased toward code it just wrote ([Claude Code best practices](https://code.claude.com/docs/en/best-practices)).

[Evidence] Without outside feedback, models corrected their own reasoning poorly and sometimes made it worse, while a sound external checker helped ([Huang et al., 2023](https://arxiv.org/abs/2310.01798), [Stechly et al., 2024](https://arxiv.org/abs/2402.08115)). Both studies used reasoning and planning benchmarks, not coding agents, neither tested a separate reviewer, and the checker in the second was a formal validator, not another model. [Proposal] So the reviewer re-runs every Global acceptance command, an outside check that does not depend on its own judgement.

[Evidence] A model also tends to favour its own output: GPT-4, GPT-3.5 Turbo and Llama 2 favoured their own news summaries over other models' and people's ([Panickssery et al., 2024](https://arxiv.org/abs/2404.13076)). That study covered summarization without human quality checks, and a later preprint found much of strong models' self-preference matched genuinely better answers ([Chen et al., 2025](https://arxiv.org/abs/2504.03846)). [Heuristic] A fresh context removes the conversation, not the model, so when you can, give the review to a different model as well.

## The orchestrator settles findings

[Established] Claude Code's docs warn that a reviewer asked to find gaps will usually report some even when the work is sound, and that chasing every finding leads to over-engineering ([Claude Code best practices](https://code.claude.com/docs/en/best-practices)).

[Proposal] So the reviewer reports only gaps that break correctness, a constraint or a Global acceptance item, each with its evidence, and changes nothing outside its own landing spot. Any gap makes its handoff `PARTIAL`. The orchestrator decides what to fix: it fixes each gap or reopens the phase that owns it, logs why in progress.md and dispatches the review again.

## What is not shown

[Proposal] We found no study that compares a fresh-context reviewer on the same model with the same agent checking its own work on coding tasks. [Evidence] In the studies above, the clear gain came from a sound external verifier, a formal checker rather than another model ([Stechly et al., 2024](https://arxiv.org/abs/2402.08115)). [Proposal] That is why the reviewer runs the commands first and reads the diff second. The review phase is on the Evidence page's list of [untested parts](/evidence/#untested-parts-of-agent-specs).

**In the spec:** [Specification](/reference/specification/#review-phase) — the review phase. How to write the checks: [Verify and accept](/guides/verify-and-accept/).

**Next:** [Untrusted sources](/concepts/untrusted-sources/) — what can go wrong when a phase reads outside content?
