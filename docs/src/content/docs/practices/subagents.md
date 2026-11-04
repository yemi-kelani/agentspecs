---
title: Subagents and parallel work
description: When splitting a task across subagents or parallel sessions helps, what it costs, and what keeps parallel agents out of each other's way.
---

You can hand part of a task to a subagent, or run several agent sessions on one repository at the same time. This page asks when that split helps, what it costs, and what stops parallel agents from getting in each other's way.

## Short answer

[Evidence] A subagent works in its own context window and hands back a short summary, so its exploration stays out of the main session ([R102](/evidence/ledger/#r102), [R110](/evidence/ledger/#r110)). The largest reported gain, 90.2% over a single agent, comes from Anthropic's own research-search eval, not coding, and multi-agent systems there used about 15 times the tokens of a chat ([R14](/evidence/ledger/#r14), [R14a](/evidence/ledger/#r14a)). Anthropic itself says most coding is less parallel than research and that it is unclear whether several agents beat one on code ([R14c](/evidence/ledger/#r14c), [R12e](/evidence/ledger/#r12e)). Many multi-agent failures trace to how tasks and roles were set up or to coordination between agents ([R13](/evidence/ledger/#r13), [R165b](/evidence/ledger/#r165b)), and worktrees keep parallel file edits apart but not what shell commands write ([R105](/evidence/ledger/#r105)). None of these rows is a controlled comparison of one agent against several on ordinary coding work.

## What the evidence shows

### What a subagent is

- [Evidence] In Claude Code, a subagent runs in a separate context window with its own system prompt, tools and permissions, and returns only a summary to the main conversation. Its requests count toward the same usage limits as the main session ([R102](/evidence/ledger/#r102)).
- [Evidence] Anthropic describes subagents that may spend tens of thousands of tokens exploring and hand the lead agent a summary of often 1,000 to 2,000 tokens. The range is a typical figure the vendor states, not a measured one ([R110](/evidence/ledger/#r110)).
- [Evidence] Anthropic also describes subagents saving their outputs to external storage and passing back references, so the lead agent does not relay everything. It gives no measurements ([R113](/evidence/ledger/#r113)).
- [Evidence] Claude Code warns at startup when the combined descriptions of custom subagents pass 15,000 tokens, and suggests short descriptions with detail in each subagent's own prompt ([R103](/evidence/ledger/#r103)).

### The gain and its cost

- [Evidence] On Anthropic's internal research eval, a Claude Opus 4 lead with Claude Sonnet 4 subagents beat single-agent Claude Opus 4 by 90.2%. The task was research search, not coding, and the metric, sample size and variance are not published ([R14](/evidence/ledger/#r14)).
- [Evidence] The same post reports that agents use about 4 times the tokens of a chat and multi-agent systems about 15 times, from Anthropic's own usage data ([R14a](/evidence/ledger/#r14a)).
- [Evidence] On one browsing benchmark, token use alone explained 80% of the variance in performance, and token use, tool calls and model choice together explained 95%. The regression is not published ([R14b](/evidence/ledger/#r14b)).
- [Evidence] A preprint harness in which a manager holds task state, a fresh-context executor does each subtask and a read-only auditor checks the results raised one model from 69.7% to 77.2% on Terminal-Bench 2.1, with 24% fewer tokens, and from 51.8% to 80.7% on WeaveBench, with 2.3 times the tokens. The authors built it, and the three parts are tested together, so the effect of splitting alone is not isolated ([R211](/evidence/ledger/#r211)).

### Which work fits

- [Evidence] Anthropic says multi-agent systems suit high-value tasks that parallelise heavily, fit poorly today where agents share context or depend on each other, and that most coding tasks are less parallel than research ([R14c](/evidence/ledger/#r14c)).
- [Evidence] Anthropic's research lead agent scales effort by prompt rules: one agent with 3 to 10 tool calls for simple fact-finding, 2 to 4 subagents for comparisons, more than 10 for complex research. The rules were tuned for that one system ([R114](/evidence/ledger/#r114)).
- [Evidence] Anthropic's post on long-running coding agents says it is still unclear whether one general agent or a multi-agent design works best, and that its harness was tuned for full-stack web apps ([R12e](/evidence/ledger/#r12e)).
- [Evidence] Claude Code's bundled /batch skill splits a large change into 5 to 30 independent units and runs one background subagent per unit, each in its own worktree ([R101](/evidence/ledger/#r101)).

### Briefs and how delegation fails

- [Evidence] Anthropic found that each subagent brief needs an objective, an output format, guidance on which tools and sources to use, and clear task boundaries. Vague briefs led subagents to duplicate work, leave gaps or misread the task. This comes from research search and is reported without numbers ([R14d](/evidence/ledger/#r14d)).
- [Evidence] A taxonomy of 14 failure modes in multi-agent LLM systems put the largest share, 44.2% in its third version, in system design, which includes agents disobeying the task or role specification. Shares moved between versions, the labels came from an LLM annotator, and the systems were not all coding ones ([R13](/evidence/ledger/#r13)).
- [Evidence] On a code question-answering benchmark over fifteen Python repositories, an agent that planned and delegated exploration to a subagent passed 46.2% of questions, against 65.2% for a single agent with a vector index, pooled over four models. The tool sets differed by design and the gap varied widely by model, so this is not a clean test of delegation ([R165](/evidence/ledger/#r165)); the ledger sets it beside other search studies in [CN1](/evidence/ledger/#cn1-does-an-embedding-index-beat-agentic-grep-style-search-for-finding-code).
- [Evidence] In the same study, breakdowns between planner and subagent caused 41.8% of the delegating agent's failures, and in 91% of those it still returned a confident answer. The authors coded the failures themselves ([R165b](/evidence/ledger/#r165b)).

### Keeping parallel sessions apart

- [Evidence] Git lets one repository have several linked working trees, each with its own branch, sharing everything except per-worktree files such as HEAD and the index ([R112](/evidence/ledger/#r112)).
- [Evidence] Claude Code, Codex in the ChatGPT desktop app and Cursor each document worktrees as a way to run several sessions or agents on one repository without conflicts ([R106](/evidence/ledger/#r106), [R107](/evidence/ledger/#r107), [R111](/evidence/ledger/#r111)). A Claude Code subagent can run in a temporary worktree that is removed if it makes no changes ([R104](/evidence/ledger/#r104)).
- [Evidence] Claude Code's docs say its worktree isolation does not track which files a shell command writes, so a `cp` or a shell redirect can still write into the main checkout ([R105](/evidence/ledger/#r105)). VS Code's docs say worktree isolation keeps changes apart but is not a security boundary and does not limit commands or network access ([R115](/evidence/ledger/#r115)).
- [Evidence] Some tools separate more than files: Conductor gives each local workspace its own range of 10 ports ([R108](/evidence/ledger/#r108)), and Container Use, an early open-source tool, gives each agent a fresh container on its own branch ([R109](/evidence/ledger/#r109)).

## What to do

- Consider a subagent for a side task whose reads you do not need in the main session, such as a broad search; it keeps that exploration in its own window and returns a summary ([R102](/evidence/ledger/#r102), [R110](/evidence/ledger/#r110)).
- Split work across agents only where the pieces are independent; Anthropic counts shared context and dependencies between agents as a poor fit, and most coding as less parallel than research ([R14c](/evidence/ledger/#r14c), [R12e](/evidence/ledger/#r12e)).
- Expect a large token bill: about 15 times a chat in Anthropic's multi-agent research system, and subagent requests count toward the same usage limits ([R14a](/evidence/ledger/#r14a), [R102](/evidence/ledger/#r102)).
- Give each subagent a full brief with the objective, the output format, the tools and sources to use, and where its task stops ([R14d](/evidence/ledger/#r14d), [R13](/evidence/ledger/#r13)).
- Ask for a short result, or for output saved to a file the lead agent can read, rather than a long relay ([R110](/evidence/ledger/#r110), [R113](/evidence/ledger/#r113)).
- Check a subagent's answer before building on it, since in one study most coordination failures still came back sounding confident ([R165b](/evidence/ledger/#r165b)); [Verification](/practices/verification/) covers how.
- Give each parallel session its own worktree, so that file edits stay apart ([R106](/evidence/ledger/#r106), [R111](/evidence/ledger/#r111), [R112](/evidence/ledger/#r112)).
- Treat a worktree as separation of edits, not a sandbox: shell commands can still write outside it, and it limits neither commands nor network access ([R105](/evidence/ledger/#r105), [R115](/evidence/ledger/#r115)).
- If parallel sessions run the same app, plan for clashes outside the files: Conductor gives each workspace its own port range for that reason, and Container Use gives each agent its own container ([R108](/evidence/ledger/#r108), [R109](/evidence/ledger/#r109)).

## Not yet known

- Whether several agents beat one on ordinary coding tasks once their token cost is counted. The 90.2% figure comes from research search ([R14](/evidence/ledger/#r14)), and the nearest coding result tests several changes at once ([R211](/evidence/ledger/#r211)).
- How much of a multi-agent gain comes from the split itself, and how much from spending more tokens ([R14b](/evidence/ledger/#r14b)).
- Which coding tasks are independent enough to split. No row gives a test for coupling.
- Whether the brief elements found for research subagents carry over to coding subagents ([R14d](/evidence/ledger/#r14d)).
- How often shell side effects, shared ports or shared databases break parallel sessions in real use ([R105](/evidence/ledger/#r105)).
- More gaps are listed under [Open questions](/evidence/open-questions/).
