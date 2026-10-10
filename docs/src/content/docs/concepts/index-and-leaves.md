---
title: Index and leaves
description: How a short index routes an agent to the one leaf file it needs, and why plans pass exact paths instead of waiting for the model to find files.
---

[Established] Every file an agent reads spends part of a finite context budget, and recall falls as that budget fills ([Anthropic, context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)). [Proposal] Agent Specs puts a short index in front of focused leaf files, so a session opens the leaf its job needs and leaves the rest on disk.

## Build the catalog, not the pile

A library does not hand you every book when you bring it a question. You look in the catalog, walk to one shelf and open one book at the right page. The catalog stays small because its only job is to say where to go.

[Proposal] An index file is that catalog: it names each leaf, says when to open it, and carries little else. The authoring rule follows from the picture: build the catalog, not the pile.

[Established] OpenAI's Codex team replaced one large AGENTS.md with a file of roughly 100 lines that works as a map into a structured docs directory ([OpenAI, harness engineering](https://openai.com/index/harness-engineering/)). [Established] The team reports that the single large file had crowded out the task, made every rule look equally important and gone stale quickly ([OpenAI, harness engineering](https://openai.com/index/harness-engineering/)).

[Evidence] A pile also distracts: adding one related but non-answering passage to a retrieval prompt lowered accuracy, and adding four lowered it further ([Chroma, 2025](https://www.trychroma.com/research/context-rot)). Caveat: a synthetic retrieval task, and the effect varied across distractors and model families.

## One shape, three loading rules

[Proposal] The same index-to-leaf shape appears at three levels, and each level loads its leaves by a different rule.

| Index | Its leaves | When a leaf loads | Who decides |
|---|---|---|---|
| AGENTS.md | Nested AGENTS.md files and the docs it points to | [Established] Agents read the nearest file in the tree, and the closest one wins on conflict ([agents.md](https://agents.md/)) | The tool, by directory |
| SKILL.md | Files in references/ and scripts/ | [Established] The body loads when the skill activates for a task; bundled files load only when needed ([Agent Skills specification](https://agentskills.io/specification)) | The model, from the description |
| plan.md | Phase files, inputs and handoffs | [Proposal] The orchestrator hands each phase the exact paths it must read | The orchestrator, every time |

[Established] Tools differ on nested files: Claude Code concatenates every CLAUDE.md from the filesystem root down instead of letting the nearest win, and loads subdirectory files on demand ([Claude Code memory](https://code.claude.com/docs/en/memory)). Check how your tool merges nested files before relying on override order.

## Why plans do not wait for a trigger

[Evidence] In Vercel's Next.js agent evals, a skill the agent was free to use went uninvoked in 56% of cases, and that setup passed 53%, the same as having no docs at all ([Vercel agent evals](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals)). Adding an explicit instruction to use the skill lifted the pass rate to 79%, and a compressed docs index in AGENTS.md reached 100%. Caveat: one vendor's internal eval of new-API knowledge on one framework, not peer reviewed, with case counts, models and harness undisclosed.

[Proposal] A plan is a contract between phases, so no phase may depend on a model deciding to open a file. plan.md and each phase file name their inputs by path, and the orchestrator passes those paths to the phase when it starts.

[Heuristic] The Vercel author draws a similar line: skills for explicit, action-specific workflows such as a framework migration, and always-present AGENTS.md context for broad framework knowledge ([Vercel agent evals](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals)). That advice sits outside what the eval measured.

## Keep leaves one hop away

[Established] Skill authors are told to link every reference file straight from SKILL.md, because an agent may only preview a file it reaches through a chain of references ([Agent Skills specification](https://agentskills.io/specification)). [Established] Anthropic also suggests a table of contents at the top of any reference file longer than 100 lines, so a partial read still reveals its scope ([Anthropic, skill authoring](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)).

[Proposal] In a spec set, every file a phase needs is named in plan.md or in its own phase file. A leaf never sends the reader to a third file to learn what to do.

[Proposal] The payoff claimed here is token economy and focus, not higher compliance; [Why specs need structure](/concepts/why-structure/) covers the null results on splitting files.

**In the spec:** [Specification](/reference/specification/) — plan.md, phase files and AGENTS.md routing. For the router itself, see the [AGENTS.md router guide](/guides/agents-md-router/).
