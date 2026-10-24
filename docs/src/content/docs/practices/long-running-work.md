---
title: Long-running work
description: How coding work survives context limits and new sessions, and what compaction, progress files, handoffs and memory have been shown to do.
---

A long task can outgrow one context window, one session or one agent. This page asks how the work survives that: what happens when context fills up, what gets written down between sessions, what a new agent taking over needs, and whether memory carries lessons from one task to the next.

## Short answer

[Evidence] Trimming what stays in context has the most direct tests on coding agents: on SWE-bench Verified, masking old tool output or pruning it with a small model cut cost or tokens by 23% to 57% with solve rates roughly flat in most configurations ([R22](/evidence/ledger/#r22), [R209](/evidence/ledger/#r209)), and a learned compressor did the same on agent tasks outside coding ([R208](/evidence/ledger/#r208)). When a coding agent took over an interrupted task, the predecessor's trace cut rediscovery work and raised solved rates ([R210](/evidence/ledger/#r210), [R210a](/evidence/ledger/#r210a)). Progress files and feature lists are what vendors describe for multi-session work, without measured comparisons ([R12](/evidence/ledger/#r12), [R12a](/evidence/ledger/#r12a)), and cross-task memory never beat a coding agent's baseline in one small study ([R25](/evidence/ledger/#r25)).

## What the evidence shows

### Compaction and pruning

- [Evidence] In SWE-agent on SWE-bench Verified, hiding old observations and LLM summarisation each cut cost by 41% to 57% in four of five model configurations, with solve rates roughly flat; one configuration lost solve rate ([R22](/evidence/ledger/#r22)). Summarised runs were longer (52 turns against 44 with one model), which the authors suggest is because summaries hide failure signals ([R22a](/evidence/ledger/#r22a)).
- [Evidence] SWE-Pruner, a trained 0.6B model that prunes what the agent reads, cut token use on SWE-bench Verified by 23.1% with Claude Sonnet 4.5 and 38.3% with GLM 4.6, while resolve rates rose by about one point, within plausible noise since no variance is reported ([R209](/evidence/ledger/#r209)).
- [Evidence] ACON, which learns compression rules from agent failures, cut peak tokens by 26% to 54% on AppWorld, OfficeBench and multi-objective QA, with higher success than other compressors; none of these is a coding task ([R208](/evidence/ledger/#r208)).
- [Evidence] In one 681-turn Claude Code session, evicting stale tool results by age shrank context from 5,038KB to 339KB, but the model asked again for 97% of what was evicted ([R202a](/evidence/ledger/#r202a)).
- [Evidence] Anthropic warns that compacting too aggressively can drop details whose importance shows only later ([R33](/evidence/ledger/#r33)), and reports that compaction alone did not stop its agents running out of context mid-feature ([R12a](/evidence/ledger/#r12a)). It also reports that its memory tool plus context editing improved an internal search eval by 39%, with no sample size given ([R23](/evidence/ledger/#r23)).
- [Evidence] In one study, each extra function an agent wrote in a session went with about 5.6% lower odds of following a written rule, a trend found after the fact rather than tested for ([R3c](/evidence/ledger/#r3c)).

### Progress files and task state

- [Evidence] In Anthropic's long-running harness, a first session writes a setup script, a progress log, a first commit and a feature list ([R78](/evidence/ledger/#r78)). Each later session works on one feature: it reads the progress file, git log and feature list, runs a basic end-to-end check, and ends with a commit and a progress update ([R12](/evidence/ledger/#r12)).
- [Evidence] Without that structure, Anthropic reports, agents tried to build the whole app at once, ran out of context mid-feature or declared the job done early; the post covers one web-app demo and gives no failure rates ([R12a](/evidence/ledger/#r12a)). Sessions could change only each feature's pass flag, which the coding agent set itself after testing ([R12b](/evidence/ledger/#r12b)), and the list was JSON because the model overwrote JSON less often than Markdown, an unmeasured observation ([R12c](/evidence/ledger/#r12c)).
- [Evidence] Anthropic describes notes such as a to-do list or NOTES.md, written outside the context window and read back later, as low-overhead memory ([R77](/evidence/ledger/#r77)), and its research agent saves its plan to external memory because context beyond 200,000 tokens was truncated ([R79](/evidence/ledger/#r79)). It matches compaction to long back-and-forth, notes to work with clear milestones, and several agents to parallel research, without a comparison ([R32](/evidence/ledger/#r32)).
- [Evidence] HumanLayer runs research, plan and implement as separate steps, distils each into a document, writes status back into the plan after each verified phase, and aims to keep context use around 40% to 60%, from one team's experience ([R83](/evidence/ledger/#r83)).
- [Evidence] OpenAI's ExecPlan keeps progress, surprises and decisions in the plan itself ([R29](/evidence/ledger/#r29)) and requires it to be self-contained, so a stateless agent can restart from the plan and the working tree alone ([R67](/evidence/ledger/#r67)). OpenAI reports a Codex run of more than seven hours from one such plan, with no comparison ([R29a](/evidence/ledger/#r29a)). BMad's docs track each story with a stable ID and a build plan that holds its acceptance criteria and status ([R73](/evidence/ledger/#r73)).

### Handing over to another agent

- [Evidence] In a study of 181 handoff points on SWE-bench Verified with three open-weight successor models, giving the successor the predecessor's trace or notes cut median agent events by 20% to 59% and prompt tokens by 42% to 63%, against repository state alone ([R210](/evidence/ledger/#r210)).
- [Evidence] In the same study, the raw trace raised solved rates by 6.1 to 14.9 points for all three successors, while notes raised them significantly for only one ([R210a](/evidence/ledger/#r210a)). The notes were generated templates, not a progress file kept over many sessions.
- [Evidence] In simulated chats, giving an instruction in pieces over several turns cut performance by 39%, and putting the pieces into one prompt recovered about 95% of full-prompt performance ([R40](/evidence/ledger/#r40), [R81](/evidence/ledger/#r81)). These were chats, not coding agents.

### Memory across tasks

- [Evidence] Adding cross-task episodic memory to a coding agent never beat the baseline: 42% resolved against 31% to 40% across memory set-ups, on 45 instances with GPT-4o ([R25](/evidence/ledger/#r25)).
- [Evidence] On a benchmark of memories made outdated by later evidence, in a personal-assistant setting, memory frameworks scored 5.1% to 17.8% against 8.7% for the plain model ([R24](/evidence/ledger/#r24)), and the best framework ranked the outdated evidence first in over 84% of cases even when the new evidence was also retrieved ([R24a](/evidence/ledger/#r24a)).
- [Evidence] Google's Gemini 2.5 report names this kind of failure context poisoning: false beliefs about a game's state spread into its agent's goals and summaries and took a long time to undo ([R80](/evidence/ledger/#r80)).

### Fresh context for each step

- [Evidence] LongHorizon-Harness, in which a manager holds task state, a fresh-context executor does each subtask and a read-only auditor checks results, raised one model from 51.8% to 80.7% on WeaveBench and from 69.7% to 77.2% on Terminal-Bench 2.1, using 24% fewer tokens on the second but 2.3 times more on the first ([R211](/evidence/ledger/#r211)). The three parts are bundled, so fresh context is not tested on its own, and the study is its authors' own preprint.

### A plan as a table of contents

One proposed pattern is a short plan that works as a table of contents, with each session loading only its own step's detail. The rows test parts of it, mostly outside code.

- [Evidence] Pointers from an index to detail: OpenAI's Codex team keeps an AGENTS.md of about 100 lines as a map into a docs/ directory ([R56](/evidence/ledger/#r56)) and points to its plan format from a short AGENTS.md section ([R55](/evidence/ledger/#r55)); Vercel's 8KB docs index points to files the agent reads on demand, with no loss in pass rate ([R20b](/evidence/ledger/#r20b)); BMAD v4 split its product and architecture documents into one file per section plus an index ([R145](/evidence/ledger/#r145)).
- [Evidence] On-demand loading that agents skip: in Vercel's evals, a skill left to the agent passed 53% and was never invoked in 56% of cases, while an always-loaded index passed 100% ([R20](/evidence/ledger/#r20), [R20a](/evidence/ledger/#r20a)). In a wiki study's pilot, a capable agent never loaded the 150KB index and read pages directly; the split wiki still cut cost per answer by 30% to 34%, with answers no worse by a model judge ([R204a](/evidence/ledger/#r204a), [R204](/evidence/ledger/#r204), [R204b](/evidence/ledger/#r204b)). See conflicts [C3](/evidence/ledger/#c3-does-always-loaded-context-help) and [CS2](/evidence/ledger/#cs2-does-loading-a-short-index-first-and-fetching-detail-on-demand-help-agents).
- [Evidence] On long-document questions rather than code, a flat pack of skills raised one agent's score from about 0.26 to 0.46 in a 20-book library ([R203](/evidence/ledger/#r203)) but added nothing for Codex on a single book ([R203a](/evidence/ledger/#r203a)). In single-book tests a second level of routing never beat the flat pack and cut one score from 0.91 to 0.64, which the authors put down to always-loaded child descriptions filling the context; at library scale the two were mixed, and that hierarchy was child skills, not a plan pointing to step files ([R203b](/evidence/ledger/#r203b)).
- [Evidence] Self-contained plans pull the other way: OpenAI's format puts everything in one file so that any session can restart from it, which makes plans long ([R67](/evidence/ledger/#r67)).

## What to do

- When context grows long, consider masking or pruning old tool output before summarising it: both cut cost with solve rates roughly flat in coding-agent tests, and summaries made runs longer ([R22](/evidence/ledger/#r22), [R22a](/evidence/ledger/#r22a), [R209](/evidence/ledger/#r209)).
- Consider what the agent will need again before evicting tool output: an age rule alone led one session to re-request 97% of what it evicted ([R202a](/evidence/ledger/#r202a)).
- For work over several sessions, consider a task-scoped progress file and a list of what is done, read at the start of each session and updated at its end, as Anthropic's and HumanLayer's set-ups do ([R12](/evidence/ledger/#r12), [R78](/evidence/ledger/#r78), [R83](/evidence/ledger/#r83)). These are vendor and practitioner reports without measured comparisons ([R12a](/evidence/ledger/#r12a)).
- Consider limiting each session to one feature and ending it with a commit and a progress update; Anthropic adopted this after its agents tried to build everything at once ([R12](/evidence/ledger/#r12), [R12a](/evidence/ledger/#r12a)).
- When another agent takes over a task, consider passing it the predecessor's raw trace rather than notes alone: in one takeover study, the trace raised solved rates for all three successor models and notes for one ([R210](/evidence/ledger/#r210), [R210a](/evidence/ledger/#r210a)).
- Replace outdated facts in notes and memory rather than adding new lines beside them: in a non-coding benchmark, memory systems ranked the outdated fact first even when the new one was retrieved ([R24](/evidence/ledger/#r24), [R24a](/evidence/ledger/#r24a)).
- Consider leaving cross-task memory off for a coding agent until you have measured it on your tasks: in one 45-instance study it never beat the baseline ([R25](/evidence/ledger/#r25)).
- If you rely on an agent to load detail on demand, check that it does: in Vercel's evals an available skill went unused in 56% of cases ([R20a](/evidence/ledger/#r20a)).
- Consider keeping any index flat: a second level of always-loaded descriptions never helped, and once hurt badly, in single-book tests of one long-document study outside code ([R203b](/evidence/ledger/#r203b)).

## Not yet known

- Whether a short plan that works as a table of contents, with each session loading only its own step, beats one self-contained plan or no plan on coding work; no study tests the whole pattern ([R67](/evidence/ledger/#r67), [R203b](/evidence/ledger/#r203b), [CS2](/evidence/ledger/#cs2-does-loading-a-short-index-first-and-fetching-detail-on-demand-help-agents)).
- Whether progress files and feature lists beat no structure over many sessions; the vendor posts give no numbers ([R12a](/evidence/ledger/#r12a)).
- Whether notes kept across many sessions work as well as the traces in the one takeover study, which tested a single handoff ([R210](/evidence/ledger/#r210)).
- Whether a fresh context for each step helps apart from the manager and auditor it was bundled with ([R211](/evidence/ledger/#r211)).
- Whether learned compression such as ACON carries over to coding tasks ([R208](/evidence/ledger/#r208)).
- How often progress files and notes go stale in real use, and what stale state costs ([R24](/evidence/ledger/#r24), [R80](/evidence/ledger/#r80)).
- More gaps are listed on [Open questions](/evidence/open-questions/).
