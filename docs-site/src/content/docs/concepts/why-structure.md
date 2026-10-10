---
title: Why specs need structure
description: What goes wrong in long agent runs, what the evidence does and does not support, and why Agent Specs relies on small files and short sessions.
---

[Established] Agent work gets less reliable as the context window fills, and the Claude Code docs call context the most important resource to manage ([Claude Code best practices](https://code.claude.com/docs/en/best-practices)). [Proposal] Agent Specs responds with small files loaded on purpose and short sessions that start fresh, and this page keeps what the evidence supports apart from what it does not.

## Four ways long contexts fail

### Context rot

[Evidence] A test of 18 models found that output grew less reliable as input got longer, even on simple tasks such as retrieving a planted fact or repeating a word sequence ([Chroma, 2025](https://www.trychroma.com/research/context-rot)). Caveat: a vendor report, not peer reviewed, on synthetic tasks and mid-2025 models; the authors do not explain the cause.

[Evidence] In the same report, every model scored significantly higher on a conversational memory benchmark when given a focused prompt of about 300 tokens than when given the full history of about 113,000 tokens ([Chroma, 2025](https://www.trychroma.com/research/context-rot)). Caveat: the focused prompts were selected in advance, so the result shows the value of removing irrelevant context, not a token budget.

### Lost in the middle

[Evidence] Language models answered best when the relevant passage sat at the start or end of the input and worst when it sat in the middle ([Liu et al., 2023](https://arxiv.org/abs/2307.03172)). Caveat: 2023 models on retrieval tasks with 10 to 30 documents; newer models may behave differently.

[Evidence] A 2026 study moved a target rule from line 2 to line 250 of a configuration file and saw no detectable position effect ([McMillan, 2026](https://arxiv.org/abs/2605.10039)). Caveat: a failure to reject rather than proof of no effect, and the file was only 2,000 to 3,000 tokens, far shorter than the inputs where the U-shape is usually seen.

### Drift

[Evidence] In a simulated trading environment with competing pressures, all four tested models drifted from their system-prompt goal to some degree, though a scaffolded Claude 3.5 Sonnet kept near-perfect adherence beyond 100,000 tokens ([Arike et al., 2025](https://arxiv.org/abs/2505.02709)). Caveat: one environment the authors call too simple to rank frontier models, 2024-era models, and no reasoning models.

[Evidence] Rule-following also decays within a single session: each extra function an agent wrote was linked to about 5.6% lower odds of applying a configured rule ([McMillan, 2026](https://arxiv.org/abs/2605.10039)). Caveat: the trend was identified post hoc, is non-monotonic, and was not tested against fixes such as fresh sessions or subagents.

### Poisoning

[Evidence] Google's Gemini 2.5 report uses the term context poisoning for a failure in which false beliefs about the game state spread into a game-playing agent's goals and summaries, sending it after impossible goals for a long time ([Gemini team, 2025](https://arxiv.org/abs/2507.06261)). Caveat: a qualitative observation from one agent harness, reported in an appendix.

[Heuristic] A practitioner taxonomy lists poisoning as one of four context failures: an error enters the context and keeps being referenced as if it were fact ([Breunig, 2025](https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html)). Its categories are descriptive labels, not measured rates.

## What the evidence does not show

[Evidence] In 1,650 Claude Code sessions, a CLAUDE.md of 25, 100, 250 or 500 lines made no detectable difference to whether the agent applied a required annotation, and Bayes factors favoured no effect ([McMillan, 2026](https://arxiv.org/abs/2605.10039)). Caveat: one trivial rule, single-turn runs, mainly one model on two codebases, and nothing above 500 lines; long files still cost tokens in every session.

[Evidence] The same study saw no detectable compliance gain from splitting the configuration into CLAUDE.md plus AGENTS.md, or from nested files ([McMillan, 2026](https://arxiv.org/abs/2605.10039)). Caveat: a failure to reject without Bayes-factor support; token savings and scoping were not measured.

[Proposal] We know of no study showing that splitting a task spec into several files improves compliance, so Agent Specs does not claim that it does.

[Evidence] Size can still hurt at larger scales: given 10 to 500 simple instructions at once, models lost accuracy as the count rose, and the best of 20 reached 68.9% at 500 ([Jaroslawicz et al., 2025](https://arxiv.org/abs/2507.11538)). Caveat: trivial keyword-inclusion instructions in one writing task, not file length or coding agents.

## Where the structure earns its keep

[Proposal] The design rests on three effects that do not depend on a compliance gain.

**Token economy.** [Established] Anthropic describes good context engineering as finding the smallest set of high-signal tokens that makes the desired outcome likely ([Anthropic, context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)). [Proposal] A phase reads plan.md, its own phase file and the inputs that file lists, not the whole tree.

**Isolation.** [Established] A Claude Code subagent works in a separate context window and hands back only a summary ([Claude Code subagents](https://code.claude.com/docs/en/sub-agents)). [Proposal] Each phase runs as one such session, so its exploration never reaches the orchestrator.

**Short, fresh sessions.** [Evidence] When the pieces of an instruction spread over several turns were joined into one prompt, models recovered about 95% of their full-prompt performance ([Laban et al., 2025](https://arxiv.org/abs/2505.06120)). Caveat: simulated chat tasks, not agent runs, and the authors' advice to restart in a fresh conversation was not itself tested. [Established] Anthropic reports that agents without a structured harness tried to build a whole app at once or ran out of context mid-feature, and that compaction alone did not prevent this ([Anthropic, long-running harnesses](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)).

For the full source list and caveats, see [the evidence page](/evidence/).

**In the spec:** [Specification](/specification/) — the spec-set layout and what each phase reads.
