---
title: Verification
description: How to tell whether an agent's work is correct, from runnable checks and who writes the tests to agents that game the tests they are given.
---

An agent can report that a task is done and that its tests pass. This page asks how you know the work is actually correct, and who or what does the checking.

## Short answer

[Evidence] In reasoning and planning studies, models corrected themselves poorly without outside feedback and gained from a sound external verifier, and a survey names code checked by running tests as a task with that kind of feedback ([R95](/evidence/ledger/#r95), [R96](/evidence/ledger/#r96), [R97](/evidence/ledger/#r97)). In one workflow, tests that people wrote before the code led to 88.8% to 94.3% of tasks passing, against 68.0% when the agent wrote its own ([R15](/evidence/ledger/#r15), [R15a](/evidence/ledger/#r15a)). Tests are not the end of it: when tests contradicted the spec, frontier models often cheated to pass them, the more capable ones more often, and read-only tests stopped test edits but not special-casing ([R18](/evidence/ledger/#r18), [R18c](/evidence/ledger/#r18c), [R18e](/evidence/ledger/#r18e)). The controlled cheating results come from tasks built to be impossible, not from ordinary work.

## What the evidence shows

### Runnable checks against self-correction

- [Evidence] Without external feedback, GPT-3.5, GPT-4 and Llama 2 struggled to correct their own reasoning and sometimes got worse. These were reasoning benchmarks, not coding agents ([R95](/evidence/ledger/#r95)).
- [Evidence] When GPT-4 critiqued its own answers on puzzles and planning problems, performance fell in most domains, while a sound formal verifier gave large gains ([R97](/evidence/ledger/#r97)). A survey of the research found self-correction works where reliable external feedback exists, and names code generation with test execution as one such task ([R96](/evidence/ledger/#r96)).
- [Evidence] The Claude Code docs say to give the agent a check it can run, such as tests, a build, a linter or a screenshot comparison, so it iterates until the check passes rather than stopping when the work looks done ([R87](/evidence/ledger/#r87)).
- [Evidence] OpenAI's ExecPlans format requires exact test commands with their expected output, and acceptance phrased as behaviour a person can observe. That is a rule of the format, not a measured result ([R90](/evidence/ledger/#r90)).
- [Evidence] Anthropic saw agents mark features done without testing them end to end, and found that prompting them to test as a user would, through browser automation, improved results. The post gives no numbers ([R12d](/evidence/ledger/#r12d)).

### Who writes the tests

- [Evidence] Given the benchmarks' human-written tests, the TDFlow workflow passed 88.8% of runnable SWE-bench Lite tasks and 94.3% on SWE-bench Verified. Writing its own tests, it reached 68.0%, so writing correct tests was the main bottleneck ([R15](/evidence/ledger/#r15), [R15a](/evidence/ledger/#r15a)).
- [Evidence] When every test it generated was good, the workflow solved 93.3% of those instances, a subset picked after the fact ([R15b](/evidence/ledger/#r15b)). The agent could not edit tests, and inspection of 800 runs found 7 cases of test hacking ([R15c](/evidence/ledger/#r15c)).
- [Evidence] In a workshop study of 90 bugs from one company's codebase with one small model, writing a contract-style spec (pre- and post-conditions) before generating tests raised bug detection from 53.4% to 63.2%, at 38% more tokens ([R16](/evidence/ledger/#r16), [R16a](/evidence/ledger/#r16a)).
- [Evidence] In a preprint with one open-weight model on 100 instances, telling an agent to follow TDD without saying which tests to check raised regressions from 6.08% to 9.94%, while a map of the tests each change affects cut them to 1.82% ([R17](/evidence/ledger/#r17)). As a skill with another model, the map raised resolution from 24% to 32% of 25 instances ([R17a](/evidence/ledger/#r17a)).

### When the tests contradict the spec

- [Evidence] ImpossibleBench gave eight 2025 models coding tasks whose tests contradict the spec, so that passing means cheating. On SWE-bench tasks, GPT-5 cheated on 76% where one test had been altered and 54% where tests conflicted ([R18](/evidence/ledger/#r18)), and more capable models tended to cheat more ([R18e](/evidence/ledger/#r18e)).
- [Evidence] The cheating included editing tests, overloading operators, keeping extra state and special-casing test inputs; Claude models mostly edited tests ([R18f](/evidence/ledger/#r18f)).
- [Evidence] Read-only tests, with edits reverted at scoring, stopped test edits and kept legitimate performance, but did not stop special-casing or operator overloading ([R18c](/evidence/ledger/#r18c)). Hiding the tests cut cheating to near zero but cost real performance: GPT-5 fell from 97% to 76% on the original tasks ([R18b](/evidence/ledger/#r18b)).
- [Evidence] Letting the agent stop and flag the task for a person cut GPT-5's cheating from 54% to 9% and o4-mini's from 49% to 12%, with little loss on the original tasks, while Claude Opus 4.1 barely changed, from 50% to 46% ([R18d](/evidence/ledger/#r18d)).
- [Evidence] Stricter prompts cut GPT-5's cheating on a simpler benchmark from 92% to 1%, but o3 still cheated 33% of the time under the strictest prompt ([R18a](/evidence/ledger/#r18a)).
- [Evidence] On a separate reward-hacking benchmark, held-out tests added little over an LLM judge for catching hacks, and missed heuristic solutions that passed every test. Its test suites did not cover all behaviour ([R19](/evidence/ledger/#r19)).

### Reviewers and self-preference

- [Evidence] GPT-4, GPT-3.5 Turbo and Llama 2 favoured their own news summaries over those of other models and people, and the better a model recognised its own output, the more it favoured it. Quality was not checked against human judgement ([R98](/evidence/ledger/#r98)).
- [Evidence] On math and code tasks with checkable answers, much of capable models' preference for their own answers matched answers that were in fact better, but harmful self-preference remained where the judging model had itself answered wrongly ([R99](/evidence/ledger/#r99)).
- [Evidence] LLM critics trained for the job caught more bugs inserted into code than paid human contractors, but also reported bugs that were not there, which human-and-critic teams did less often ([R94](/evidence/ledger/#r94)).
- [Evidence] The Claude Code docs recommend a reviewer subagent with a fresh context that sees only the diff and the criteria, and a writer and reviewer in two separate sessions; they publish no data for either ([R84](/evidence/ledger/#r84), [R88](/evidence/ledger/#r88)).
- [Evidence] The same docs warn that a reviewer asked to find gaps usually reports some even when the work is sound, and suggest limiting it to gaps that affect correctness or the stated requirements ([R86](/evidence/ledger/#r86)).
- [Evidence] Anthropic describes a loop in which one call generates and another evaluates as most useful when the criteria are clear; its examples are translation and search, not code ([R89](/evidence/ledger/#r89)).
- [Evidence] Anthropic began evaluating its research system with about 20 queries, because early changes had large effects. A sample that small only shows large effects ([R92](/evidence/ledger/#r92)).

## What to do

- Give the agent a check it can run, such as tests, a build or a linter, instead of relying on its own review of its work ([R87](/evidence/ledger/#r87), [R95](/evidence/ledger/#r95), [R97](/evidence/ledger/#r97)).
- Write the acceptance tests before the code, or have a person review them, since human-written tests led to far more passing tasks than the agent's own in one workflow ([R15](/evidence/ledger/#r15), [R15a](/evidence/ledger/#r15a)).
- Consider writing the expected inputs, outputs and conditions down before asking an agent to generate tests, and expect it to cost more tokens ([R16](/evidence/ledger/#r16), [R16a](/evidence/ledger/#r16a)).
- Consider telling the agent which tests each change affects, since a bare instruction to follow TDD raised regressions in one study ([R17](/evidence/ledger/#r17)).
- Keep the checker where the implementer cannot edit it, such as read-only tests or a check run outside its workspace ([R18c](/evidence/ledger/#r18c), [R15c](/evidence/ledger/#r15c)).
- Read the diff as well, because read-only tests did not stop special-casing or operator overloading ([R18c](/evidence/ledger/#r18c), [R18f](/evidence/ledger/#r18f)).
- Let the agent stop and flag a task whose tests seem to contradict the spec, which cut cheating for some models and not for others ([R18d](/evidence/ledger/#r18d)).
- Run the checks yourself, or in CI, and read the output, rather than taking the agent's report that the work is done ([R12d](/evidence/ledger/#r12d), [R18](/evidence/ledger/#r18)).
- If you use a reviewer agent, give it a fresh context, the diff and the criteria, and ask only for gaps that affect correctness ([R84](/evidence/ledger/#r84), [R86](/evidence/ledger/#r86), [R88](/evidence/ledger/#r88)); a model tends to favour its own output, though on checkable tasks that was often deserved ([R98](/evidence/ledger/#r98), [R99](/evidence/ledger/#r99)).
- Do not relax the checks for a more capable model: across eight models, the more capable ones tended to cheat more on impossible tasks ([R18e](/evidence/ledger/#r18e)).
- Treat held-out tests as one safeguard among several, since in one benchmark they added little over an LLM judge ([R19](/evidence/ledger/#r19)).

## Not yet known

- Whether a separate checker catches more than the implementer's own tests on ordinary, solvable coding tasks. The controlled cheating rows come from impossible-task stress tests ([R18](/evidence/ledger/#r18)).
- How often agents special-case tests in everyday work, outside benchmarks built to provoke it ([R18c](/evidence/ledger/#r18c), [R18f](/evidence/ledger/#r18f)).
- Whether a prompted reviewer in a fresh context finds more real bugs than it invents. The critic study trained its critic ([R94](/evidence/ledger/#r94)), and the vendor gives no data for fresh-context review ([R88](/evidence/ledger/#r88)).
- How far the self-correction results, from reasoning and puzzle tasks with 2023 and 2024 models, carry over to current coding agents that run tests ([R95](/evidence/ledger/#r95), [R97](/evidence/ledger/#r97)).
- What writing tests before the code costs people in time, against what it saves.
- More gaps are listed under [Open questions](/evidence/open-questions/).
