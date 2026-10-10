---
title: FAQ
description: Short answers to common questions about Agent Specs.
---

## Is Agent Specs an official standard?

No. [Proposal] Agent Specs v0.1 (draft) is a proposal, published in [the Agent Specs repository](https://github.com/yemi-kelani/agentspecs) for anyone to use or criticise. It is not affiliated with Anthropic, the Agent Skills project or any agent vendor.

## How does it relate to Agent Skills and AGENTS.md?

[Proposal] It builds on both and redefines neither. AGENTS.md stays the router that most tools load at the start of a session (tools differ; see [the Evidence page](/evidence/)), and skills follow the [Agent Skills specification](https://agentskills.io/specification). Agent Specs adds the task layer: a plan.md index, phase files and handoffs in `work/<task-id>/`. See [Write AGENTS.md as a router](/guides/agents-md-router/) and [Write SKILL.md that triggers reliably](/guides/skill-md-triggers/).

## Does it make agents more successful?

Nobody knows yet. [Proposal] No study has tested Agent Specs, or any index-and-leaf plan, head to head. [Evidence] The nearest study found that adding a context file did not significantly change task success and raised cost by about 20%, on Python repositories with four agent setups and no task plans ([Gloaguen et al., 2026](https://arxiv.org/abs/2602.11988)). See [what the research does not show](/evidence/#what-it-does-not-show).

## Does file length matter?

[Evidence] One study found no detectable effect of CLAUDE.md files of 25 to 500 lines on whether an agent followed a rule, though the rule was trivial and longer files were not tested ([McMillan, 2026](https://arxiv.org/abs/2605.10039)). [Evidence] Other studies saw accuracy fall as inputs or the number of instructions grew, on synthetic tasks rather than coding agents ([Chroma, 2025](https://www.trychroma.com/research/context-rot); [Jaroslawicz et al., 2025](https://arxiv.org/abs/2507.11538)). [Proposal] So the [size budgets](/reference/templates/#budgets) rest on token cost and focus, not on a proven threshold.

## Do I need subagents?

No. [Proposal] Phases can run one after another in fresh sessions of a single agent; subagents only make the isolation automatic. [Established] Anthropic itself says multi-agent setups fit poorly where agents must share context or depend on each other, and that most coding is less parallel than research ([Anthropic, 2025](https://www.anthropic.com/engineering/multi-agent-research-system)). See [Run phases with subagents](/guides/run-phases-with-subagents/).

## Does every task need a review phase?

Only tasks whose plan has more than one phase. [Proposal] There, the last phase is a review by an agent that did none of the work; see [Verify and accept](/guides/verify-and-accept/#the-review-phase). [Evidence] Studies of reasoning tasks found that models correct themselves poorly without outside feedback ([Huang et al., 2023](https://arxiv.org/abs/2310.01798)), but we found no study that tests whether a fresh-context reviewer catches more than self-review on coding work. The review costs one more agent run.

## Which agents support it?

[Proposal] Any agent that can read and write files in your repository; nothing needs special support, and a person can act as the orchestrator. [Established] Loading still differs by tool: Claude Code, for example, reads AGENTS.md by default only when no CLAUDE.md exists ([Claude Code docs](https://code.claude.com/docs/en/memory)).

## Is it overkill for small tasks?

For the full spec set, yes. [Established] Vendors advise skipping a formal plan for small changes, such as a diff you can describe in one sentence ([Claude Code docs](https://code.claude.com/docs/en/best-practices)). [Proposal] The [sizing gate](/concepts/sizing/) agrees: a prompt plus AGENTS.md for trivial work, one plan.md for medium work, and the full spec set only for large tasks.

## Why JSON for state?

[Heuristic] Anthropic chose JSON for a long-running agent's feature list because, in its experience, models were less likely to wrongly overwrite JSON than Markdown; it published no data ([Anthropic, 2025](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)). [Proposal] state.json can also be parsed by a script, so checking status needs no prose. See [Living state](/concepts/living-state/).

## Are spec sets safe with untrusted documents?

Not fully. [Evidence] Instructions planted in content an agent later reads can steer it, as shown against real applications in 2023, before today's coding agents ([Greshake et al., 2023](https://arxiv.org/abs/2302.12173)). [Proposal] Agent Specs keeps sources read-only and treats them as data, which limits the damage but does not remove the risk. See [Untrusted sources](/concepts/untrusted-sources/).

## How is it different from Kiro, Spec Kit or ExecPlans?

[Proposal] Those formats come with their own tools or a single plan file; Agent Specs is a tool-neutral set of plain files, sized to the task. Each of them is the better choice in some situations, and the [comparison](/comparison/) says which.

## Is there a validator?

A reference one. [Proposal] [specs-ref](https://github.com/yemi-kelani/agentspecs/tree/main/specs-ref), in the Agent Specs repository, checks a spec set, or a repository's AGENTS.md and every spec set under `work/`, against the Specification's structural rules. It is a demonstration rather than a production tool, and it does not run verify commands; use the [checklist](/reference/checklist/) and each phase's Verify for the rest. A GitHub Action is on the roadmap.

## How do I propose a change?

See [Contribute](/contribute/). Changes to the spec and to this site go through [the Agent Specs repository](https://github.com/yemi-kelani/agentspecs).
