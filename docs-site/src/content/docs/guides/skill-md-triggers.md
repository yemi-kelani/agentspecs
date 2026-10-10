---
title: Write SKILL.md that triggers reliably
description: Write a skill description that loads the skill when it should, back critical skills with a routing line and prove the skill helps.
---

A skill helps only if the agent loads it at the right moment. The file format is defined by the [Agent Skills specification](https://agentskills.io/specification); follow it there, because Agent Specs adds no rules of its own. This guide covers the parts you control beyond the format: the description, a routing line for skills that must run, and an eval that shows the skill earns its place.

## Steps

1. **Start from the template.** Fetch [SKILL.md](/templates/SKILL.md) into a folder named after the skill, in the place your agent loads skills from. Check the name and folder rules in the specification.
2. **Say what and when.** [Established] The specification asks for a description that covers the skill's job and the situations that call for it, with keywords an agent can match against a request ([specification](https://agentskills.io/specification)). Use the words a user would actually type, not your internal name for the procedure.
3. **Write in the third person.** [Established] Anthropic advises third person because the description is inserted into the system prompt, where a shifting point of view can cause discovery problems ([best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)). That guidance was written for Claude; other agents are untested.
4. **Lead with the main use case.** [Established] Claude Code shortens long descriptions in its skill listing and advises putting the key use case first ([skills](https://code.claude.com/docs/en/skills)). The cut-off is specific to that tool and may change, so do not write to an exact number.
5. **Do not rely on discovery for critical skills.** [Evidence] In Vercel's evals on Next.js 16 APIs, the agent never invoked an available skill in 56% of cases. Left to the agent's discretion, the skill passed 53% of evals, the same as having no docs at all; with an explicit instruction to use it, 79%; a compressed docs index in AGENTS.md passed 100% ([Vercel](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals)). This is one vendor's eval on one framework, with models and case counts undisclosed.
6. **Add a routing line for skills that must run.** [Proposal] For each skill whose omission causes real mistakes, add a row to the AGENTS.md routing table: `| <kind of task> | skill <name> |`. The row is passive context that is always loaded, so it costs one line in every session; keep it for the few skills that need it.
7. **Prove the skill with a no-skill baseline.** [Established] Anthropic recommends building evaluations before writing much skill content: run representative tasks without the skill, write about three scenarios that target the gaps, measure the baseline, then write minimal instructions and iterate ([best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)). Anthropic notes there is no built-in way to run these evaluations, so script them yourself.
8. **Re-run the eval after every wording change.** [Evidence] In the same Vercel evals, small wording changes swung results: telling the agent it must invoke the skill made it miss project context, while telling it to explore the project first and then invoke the skill did better ([Vercel](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals)). The author calls this brittle and illustrates it with single cases, not a systematic study.

## Worked example

A release-notes skill whose first description never fired.

```yaml title="Before"
description: Helps with releases.
```

```yaml title="After" wrap
description: Drafts release notes from merged pull requests and CHANGELOG.md. Use when the user asks for release notes, a changelog entry, a version summary or "what changed since" a tag.
```

The routing row in AGENTS.md, because a missed release note blocks the release:

```md title="AGENTS.md (routing excerpt)" wrap
| Preparing a release or tagging a version | skill `release-notes` |
```

A small eval, run without the skill, then with it:

| Scenario | Prompt | Pass when |
|----------|--------|-----------|
| Direct | "Write release notes for v2.4" | Notes list every merged PR since v2.3, grouped by type |
| Indirect | "What changed since v2.3? I need it for the announcement" | The skill loads without being named |
| Negative | "Fix the failing date test" | The skill does not load |

Keep the skill if it beats the baseline on the first two scenarios and stays quiet on the third. If it does not beat the baseline, delete it.

## Check

- Does the description say what the skill does and when to use it, in the third person, with the user's own words?
- Is the main use case in the first sentence?
- Does a critical skill have a routing row, and does the eval include a scenario where the skill should stay quiet?
