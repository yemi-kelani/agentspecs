---
title: "Sizing: when to use what"
description: How to match the weight of a spec set to the size of the task, when to step up, and what each step up costs.
---

[Established] Vendors advise skipping a formal plan when a change is small: Claude Code says to skip planning when the diff fits in one sentence ([Claude Code best practices](https://code.claude.com/docs/en/best-practices)). [Proposal] Agent Specs comes in three sizes, and you move up a size only when a trigger fires.

## Three sizes

[Proposal] Pick the smallest format that holds the task.

| Task | Example | Format |
|---|---|---|
| Trivial: the diff fits in one sentence | Fix a typo in an error message | A prompt plus the repository's AGENTS.md |
| Medium: one session, a handful of files | Add CSV export to one report | One living plan.md that carries its own progress and decision log |
| Large: several sessions, agents or untrusted sources | Add CSV export across the API, the UI and the docs | The full spec set: plan.md, phases/, state.json, progress.md, sources/ and out/ |

[Established] Other formats draw similar lines. The openai-agents-python repo requires an ExecPlan for multi-step or multi-file work, new features, refactors or tasks expected to take more than about an hour, and makes one optional for trivial fixes ([openai-agents-python PLANS.md](https://github.com/openai/openai-agents-python/blob/main/PLANS.md)). BMad's current docs offer four planning paths, from trivial to project-sized ([BMad planning paths](https://docs.bmad-method.org/plan/choose-a-planning-path/)).

## When to step up

[Heuristic] Move from one plan.md to the full spec set when the plan grows past about 150 lines, or when about 40% of the context window is used up before implementation starts. Neither number has been tested; treat each as a prompt to reconsider, not a threshold.

[Heuristic] The 40% figure follows HumanLayer, which once warned at about 40% of a model's usable window and has since moved to a fixed 100k-token warning for long-context models ([HumanLayer, long context](https://www.humanlayer.dev/blog/long-context-isnt-the-answer)). It is one team's operating threshold, not a benchmark, and the team itself changed it.

[Proposal] Step up regardless of length when the task reads untrusted sources or splits across agents, because those need the read-only sources/ folder and the per-phase landing spots of the full spec set.

## What each step up costs

**Indirection.** [Established] The Claude Code docs note that importing other files into CLAUDE.md organizes it but does not reduce its context cost ([Claude Code memory](https://code.claude.com/docs/en/memory)). [Proposal] Every extra file is another hop and another place for a fact to go stale, so split only when a session can skip the leaf.

**More context, more tokens.** [Evidence] Adding an AGENTS.md-style context file raised inference cost by about 20% and added 2.5 to 3.9 agent steps per task ([Gloaguen et al., 2026](https://arxiv.org/abs/2602.11988)). [Evidence] In the same study, task success did not change significantly ([Gloaguen et al., 2026](https://arxiv.org/abs/2602.11988)). Caveat: Python repositories and four agent setups only, task plans were not tested, and a second study measured lower runtime with AGENTS.md on Codex ([Lulla et al., 2026](https://arxiv.org/abs/2601.20404)).

**Multi-agent multiples.** [Evidence] Anthropic reports that agents use about 4 times the tokens of a chat, and multi-agent systems about 15 times ([Anthropic, multi-agent research](https://www.anthropic.com/engineering/multi-agent-research-system)). Caveat: approximate figures from Anthropic's own research workloads, with the method unpublished. [Established] Anthropic adds that multi-agent setups fit poorly when agents must share context or depend on each other, and that most coding tasks are less parallel than research ([Anthropic, multi-agent research](https://www.anthropic.com/engineering/multi-agent-research-system)).

**Heavy workflows on small tasks.** [Evidence] In one hands-on review, Kiro turned a small bug into 4 user stories with 16 acceptance criteria, and spec-kit produced repetitive files that were tedious to review for a mid-sized feature ([Böckeler, 2025](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)). Caveat: one practitioner on October 2025 versions; Kiro has since added bugfix specs and Quick Spec.

**In the spec:** [Specification](/reference/specification/) defines the files of a full spec set; [Templates: Budgets](/reference/templates/#budgets) collects the line budgets.
