---
title: Size budgets
description: Line and token budgets for each file in a spec set.
---

[Proposal] These budgets keep small the files that many agents read. They are about cost and focus: a line in a file that every phase or every session loads is paid for many times over. None of them is a proven compliance threshold.

| File | Budget | Label | Why | Source |
|------|--------|-------|-----|--------|
| `AGENTS.md` | About 100 lines | [Heuristic] | Loaded every session, paid for every turn | [OpenAI](https://openai.com/index/harness-engineering/) |
| SKILL.md `name` | 1–64 characters; matches its folder | [Established] | Agent Skills rule | [Agent Skills](https://agentskills.io/specification) |
| SKILL.md `description` | 1–1,024 characters | [Established] | Agent Skills rule; loads at startup | [Agent Skills](https://agentskills.io/specification) |
| SKILL.md body | Under 500 lines, about 5k tokens | [Established] | Loads whole when the skill activates | [Agent Skills](https://agentskills.io/specification), [Anthropic](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) |
| Skill reference file | One level deep; contents list past 100 lines | [Established] | Long files may be read only in part | [Anthropic](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) |
| `plan.md` | About 60–80 lines, 1.2k tokens | [Heuristic] | Fan-out: every phase reads it | [Sizing](/concepts/sizing/) |
| `plan.md`, medium tier | About 150 lines | [Heuristic] | Past this, use the full tree | [Sizing gate](/reference/specification/#sizing-gate) |
| Phase file | About 100 lines | [Proposal] | Leaves the agent's context for the work | [Phase file](/guides/write-phase-file/) |
| `HANDOFF.md` | 10 key facts, about 60 lines | [Proposal] | The orchestrator reads only handoffs | [Handoffs](/concepts/handoff-contracts/) |
| `state.json` | One object per phase, no prose | [Proposal] | Rewritten at every status change | [Spec](/reference/specification/#statejson) |
| `progress.md` | No fixed cap | [Proposal] | No phase loads it | [Living state](/concepts/living-state/) |
| `MANIFEST.md` | One row per source | [Proposal] | Phases open only their listed sources | [Sources](/concepts/untrusted-sources/) |
| Session context | Escalate near 40% of the window | [Heuristic] | Leaves room for the work | [HumanLayer](https://www.humanlayer.dev/blog/long-context-isnt-the-answer) |

[Heuristic] The 40% figure is rough: HumanLayer, its source, has since moved to a fixed warning at about 100k tokens for long-context models.

[Established] Agent Skills also limits which characters `name` may use and where hyphens may go ([Agent Skills specification](https://agentskills.io/specification)). Follow that specification, not this summary.

[Established] Vendor guidance agrees on short instruction files: under 500 lines for SKILL.md and for Cursor rules, under 200 lines per CLAUDE.md, and about 100 lines for OpenAI's AGENTS.md map ([Agent Skills specification](https://agentskills.io/specification), [Cursor rules](https://cursor.com/docs/rules), [Claude Code memory docs](https://code.claude.com/docs/en/memory), [OpenAI](https://openai.com/index/harness-engineering/)). Each figure is a recommendation or one team's practice, not the result of a published experiment.

## What the evidence says about file length

[Evidence] In a factorial study of 1,650 Claude Code sessions, CLAUDE.md files of 25, 100, 250 or 500 lines made no detectable difference to how often the agent applied a required annotation, and Bayes factors favoured no effect ([McMillan, 2026](https://arxiv.org/abs/2605.10039)). Caveat: the rule was a trivial comment marker, sessions were single-turn and mostly ran Sonnet 4.6 on two codebases, files over 500 lines were not tested, and a long file still costs tokens in every session.

[Evidence] At larger scales, quantity does matter: when 20 models had to follow between 10 and 500 simple instructions at once, accuracy fell as the count rose, and the best model reached 68.9% at 500 ([Jaroslawicz et al., 2025](https://arxiv.org/abs/2507.11538)). Caveat: these were keyword-inclusion instructions in one report-writing task with 2025 models; the study measured instruction count, not file length or coding agents.

[Proposal] So this spec does not claim that shorter files are obeyed more often. Its budgets rest on cost and focus: a short file is cheaper on every load and leaves more of the window for the task. Background: [Sizing: when to use what](/concepts/sizing/).
