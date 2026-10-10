---
title: Handoff contracts
description: Why each phase declares its outputs and a landing spot before it starts, and reports back through one fixed-template HANDOFF.md.
---

[Established] Agents sometimes call work finished when nothing usable exists yet, for example by marking features done without testing them end to end ([Anthropic, long-running harnesses](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)). [Proposal] Agent Specs has every phase declare an output contract and a landing spot before it starts, and report through a fixed-template HANDOFF.md that is the only file the orchestrator reads by default.

## What a brief must declare

[Established] Anthropic's multi-agent research team concluded that each subagent brief needs an objective, an output format, guidance on tools and sources, and clear task boundaries, because vague briefs led to duplicated work, gaps and misread tasks ([Anthropic, multi-agent research](https://www.anthropic.com/engineering/multi-agent-research-system)). The lesson comes from a search system, not coding, and is reported without numbers.

[Proposal] The phase template gives each of those elements its own section, and adds two more that make the contract checkable:

| Brief element | Section in phase.md |
|---|---|
| Objective | Objective |
| Output format | Output contract |
| Tools and sources | Inputs; Tools and permissions |
| Boundaries | Boundaries (in scope, out of scope, write paths) |
| Proof of completion | Verify |
| When to give up | Stop conditions |

[Evidence] A brief should also arrive whole: across 15 models, revealing an instruction in pieces over several turns cut performance by 39% on average compared with giving it all at once ([Laban et al., 2025](https://arxiv.org/abs/2505.06120)). Caveat: simulated users and chat tasks, not agentic coding runs.

## A landing spot per phase

[Proposal] Each phase writes only to `out/phase-N/` and the paths its brief declares. Parallel phases never touch the same file, and the orchestrator can see exactly what each one produced.

[Established] Anthropic recommends that subagents save their outputs to external storage and pass lightweight references back to the coordinator, which avoids losing detail and the token cost of relaying everything through the lead agent ([Anthropic, multi-agent research](https://www.anthropic.com/engineering/multi-agent-research-system)).

## HANDOFF.md is what crosses back

[Established] A Claude Code subagent works in its own context window and returns only a summary to the main conversation ([Claude Code subagents](https://code.claude.com/docs/en/sub-agents)). [Established] In Anthropic's pattern, a subagent may spend tens of thousands of tokens exploring and hand back a condensed summary of often 1,000 to 2,000 tokens ([Anthropic, context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)); that range is a typical figure, not a measured one.

[Proposal] HANDOFF.md fixes the shape of that summary. It opens with a status and the real output of each verify command:

```markdown
Status: DONE | PARTIAL | BLOCKED
Verify: `<command>` → <pass or fail, one line of evidence>
```

The rest lists what was produced, at most ten distilled key facts, decisions, open issues and the sources used. [Proposal] The orchestrator reads this file by default and opens raw outputs only when a fact is in doubt, so a phase's exploration, and any untrusted text it read, stays out of the orchestrator's context. See [Untrusted sources](/concepts/untrusted-sources/) for why that matters.

## The failure it prevents

[Proposal] Without a contract, a phase can end its session saying it is finished while leaving nothing the next phase can load. With one, done has a definition: the declared files exist at the landing spot, every Verify command passed, and HANDOFF.md records the real output. Anything less is PARTIAL or BLOCKED.

[Established] The Claude Code docs make the same point from the agent's side: give it a check it can run, so it keeps iterating until the check passes instead of stopping when the work only looks done ([Claude Code best practices](https://code.claude.com/docs/en/best-practices)).

**In the spec:** [Specification](/specification/) — phase files, output contracts and HANDOFF.md. The templates are in [Reference: Templates](/reference/templates/).
