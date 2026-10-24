---
title: Context limits
description: What happens to an agent's work as its context window fills, and what the evidence says about how much to put in it.
---

Models now accept hundreds of thousands of tokens, so it is tempting to hand an agent the whole repository, every tool and the full chat history. This page asks whether more context helps, or whether the work gets worse as the window fills.

## Short answer

[Evidence] Across retrieval, question-answering and chat benchmarks, models grew less reliable as input got longer, as related but unhelpful text was added, and as a task arrived in pieces over many turns ([R5](/evidence/ledger/#r5), [R5b](/evidence/ledger/#r5b), [R40](/evidence/ledger/#r40)). The one long-context coding benchmark in the ledger saw the same for one model: with the files needed for a fix padded out by unrelated files, it solved 29% of issues at 32K tokens and 3% at 256K, while other models held steady on code questions ([R200](/evidence/ledger/#r200), [R200a](/evidence/ledger/#r200a)). Most of this was measured on question answering and synthetic tasks, not on agents that choose what to read, and the effect of where text sits did not replicate in later tests ([C2](/evidence/ledger/#c2-do-file-size-and-position-matter)).

## What the evidence shows

### Length and distractors

- [Evidence] A report from a retrieval company tested 18 LLMs and found output less reliable as input grew, even on tasks as simple as finding a planted fact or repeating a word sequence ([R5](/evidence/ledger/#r5)). It is not peer reviewed and uses synthetic tasks.
- [Evidence] In the same report, one passage on the right topic that did not hold the answer lowered accuracy, and four lowered it further ([R5b](/evidence/ledger/#r5b)). Coherent filler hurt more than shuffled filler, which the authors could not explain ([R5a](/evidence/ledger/#r5a)).
- [Evidence] On a conversation-memory benchmark, models did better with a focused prompt of about 300 tokens than with the full history of about 113k tokens ([R5c](/evidence/ledger/#r5c)). The focused prompts were chosen in advance, so this shows the value of removing irrelevant text, not a token budget.
- [Evidence] When 20 models had to follow between 10 and 500 simple instructions at once, accuracy fell as the count rose, and the best model reached 68.9% at 500 ([R4](/evidence/ledger/#r4)). One practitioner reads this as a budget of about 150 to 200 instructions, of which Claude Code's own system prompt uses about 50; the paper's abstract does not state that figure ([R43](/evidence/ledger/#r43)).
- [Evidence] Anthropic treats context as a finite resource with diminishing returns ([R34](/evidence/ledger/#r34)), and the Claude Code docs say performance degrades as the window fills, without naming a fill level ([R31](/evidence/ledger/#r31)). One team moved its warning point from about 40% of the window to a fixed 100k tokens after seeing instruction adherence slip ([R42](/evidence/ledger/#r42)).

### Where information sits

- [Evidence] In multi-document question answering with 2023 models, accuracy was highest when the answer sat at the start or end of the input and lowest in the middle ([R6](/evidence/ledger/#r6)). With 20 documents and the answer mid-context, GPT-3.5-Turbo scored below its score with no documents at all ([R6a](/evidence/ledger/#r6a)).
- [Evidence] Two later tests found no position effect: the context-rot report across 11 positions of a planted fact ([R5d](/evidence/ledger/#r5d)), and a Claude Code study that moved one rule from line 2 to line 250 of its instruction file ([R3a](/evidence/ledger/#r3a)). See conflict [C2](/evidence/ledger/#c2-do-file-size-and-position-matter): the tasks, models and input sizes differ.
- [Evidence] In the many-instruction test, models missed later instructions more often than earlier ones ([R4](/evidence/ledger/#r4)).

### Long sessions and many turns

- [Evidence] In over 200,000 simulated conversations across 15 LLMs, revealing an instruction over several turns cut performance by 39% on average against giving it all at once, mostly because answers became less reliable rather than less capable ([R40](/evidence/ledger/#r40)). Putting the same pieces into one prompt recovered about 95% of full performance ([R81](/evidence/ledger/#r81)). These were chat tasks, not coding runs.
- [Evidence] In a factorial study of Claude Code sessions, each extra function the agent wrote came with about 5.6% lower odds of following a rule from the instruction file, and in runs with a miss the first one came at the fourth function (median) ([R3c](/evidence/ledger/#r3c)). The trend was spotted during analysis, not planned in advance.
- [Evidence] In a simulated trading environment, all four 2024-era models drifted from their system-prompt goal to some degree, though one scaffolded model kept near-perfect adherence past 100,000 tokens ([R38](/evidence/ledger/#r38)). The authors link drift to models copying their own earlier actions, and call that evidence only suggestive ([R39](/evidence/ledger/#r39)).
- [Evidence] Google's Gemini 2.5 report describes context poisoning in a game-playing agent: false beliefs about the game spread into its goals and summaries and took a long time to undo ([R80](/evidence/ledger/#r80)). A practitioner taxonomy lists poisoning alongside distraction, confusion and clash as ways long contexts fail ([R37](/evidence/ledger/#r37)).

### Code

- [Evidence] LongCodeBench (COLM 2025) filled the prompt with the files from the fixing pull request plus randomly chosen files from the same repository, up to each length bracket. Claude 3.5 Sonnet solved 29% of issues at the 32K bracket and 3% at 256K ([R200](/evidence/ledger/#r200)). On code question answering, three Gemini models stayed between about 63% and 75% up to 1M tokens, while Qwen2.5-14B fell to 40% at 1M ([R200a](/evidence/ledger/#r200a)).
- [Evidence] A retrieval pipeline kept the same Claude model at 16% to 23% of issues across all brackets ([R200b](/evidence/ledger/#r200b)), yet scored close to chance on code question answering ([R200c](/evidence/ledger/#r200c)). See conflict [CS1](/evidence/ledger/#cs1-does-handing-a-model-retrieved-pieces-instead-of-the-whole-context-help-on-code-tasks): one model, one retrieval setup, and no agent choosing its own reads.
- [Evidence] A follow-up on Python code question answering found accuracy of about 62% to 81% with answer options fell to about 33% to 54% when the options were removed ([R201](/evidence/ledger/#r201)).

### What fills a real session

- [Evidence] Across one user's 857 Claude Code sessions, 21.8% of input tokens were structural waste: unused tool schemas 11.0%, stale tool results 8.7% and duplicated content 2.2% ([R202](/evidence/ledger/#r202)). The study does not measure task success.
- [Evidence] In one 681-turn session, evicting old tool results by age shrank the context from 5,038 KB to 339 KB, but the model asked again for 97% of the evicted items ([R202a](/evidence/ledger/#r202a)).
- [Evidence] Anthropic states that 50 or more MCP tool definitions take about 77K tokens before work begins, against about 8.7K when tools load on demand ([R205](/evidence/ledger/#r205)). In its internal evals, tool-selection accuracy rose with on-demand loading, for example from 49% to 74% for Opus 4 ([R205a](/evidence/ledger/#r205a)). Neither figure comes with a method or sample size.
- [Evidence] Cline's Memory Bank instructions have the agent read every memory-bank file at the start of every task, so the whole bank costs context each time ([R41](/evidence/ledger/#r41)).

## What to do

- Give the agent the smallest set of relevant material rather than everything that might help: text on the right topic but without the answer lowered accuracy ([R5b](/evidence/ledger/#r5b)), a focused prompt beat the full history ([R5c](/evidence/ledger/#r5c)), and Anthropic frames the goal as the smallest set of high-signal tokens ([R35](/evidence/ledger/#r35), [R36](/evidence/ledger/#r36)).
- Treat a large window as room, not as a target to fill: in the one long-context coding benchmark, one model's issue fixing fell from 29% to 3% as unrelated files filled the prompt ([R200](/evidence/ledger/#r200)), though other models held up on code questions ([R200a](/evidence/ledger/#r200a)).
- When a long conversation goes off track, consider restating the whole task in one fresh prompt. A single prompt recovered about 95% of what piecemeal turns lost ([R40](/evidence/ledger/#r40), [R81](/evidence/ledger/#r81)); the fresh-conversation step is the authors' suggestion, and the test was on chat, not coding.
- Expect rules to slip late in a long session, and back the ones that matter with a check: compliance fell with each function written ([R3c](/evidence/ledger/#r3c)), and the Claude Code docs recommend hooks for anything that must happen every time ([R85](/evidence/ledger/#r85)).
- If your agent can load tool definitions on demand, consider it when you connect many tools: unused schemas were the largest share of waste in one user's sessions ([R202](/evidence/ledger/#r202)), and Anthropic reports large savings in its own evals ([R205](/evidence/ledger/#r205), [R205a](/evidence/ledger/#r205a)).
- Treat simple age-based eviction of tool results with care: in one session the model asked for nearly all of the evicted items again ([R202a](/evidence/ledger/#r202a)).

## Not yet known

- At what fill level an agent's coding work starts to slip; the vendor docs give none ([R31](/evidence/ledger/#r31)), and one team's threshold has already moved ([R42](/evidence/ledger/#r42)).
- Whether the length and distractor effects measured in retrieval and question answering carry over to agents that choose their own reads ([R5](/evidence/ledger/#r5), [R200](/evidence/ledger/#r200)).
- Whether position within the whole prompt, rather than within one file, matters to current models in agent runs ([R6](/evidence/ledger/#r6), [R3a](/evidence/ledger/#r3a)).
- Whether a fresh session, a subagent or re-injecting the rules stops compliance falling late in a session ([R3c](/evidence/ledger/#r3c)).
- How much detail compaction loses; Anthropic warns about the loss without measuring it ([R33](/evidence/ledger/#r33)).
- [Open questions](/evidence/open-questions/) collects these gaps.
