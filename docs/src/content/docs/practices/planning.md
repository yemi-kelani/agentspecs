---
title: Planning
description: How much planning a coding task needs, what written plans did in controlled tests, and how agent success changes with the size of the task.
---

Before an agent writes code, someone can write down what the change is and how to make it, or simply ask for it. This page asks how much planning a task needs, and whether the answer depends on how big the task is.

## Short answer

[Evidence] Agents succeed less often as tasks get longer: across models, success fell with the time a human expert needs for the task ([R206a](/evidence/ledger/#r206a)). In one controlled study, a standard four-step plan helped every model, but a plan missing a step did worse than no plan for several models, and adding extra phases lowered success for all four ([R9](/evidence/ledger/#r9), [R9b](/evidence/ledger/#r9b), [R9c](/evidence/ledger/#r9c)). Vendors converge on scaling the plan to the task, from none for a one-sentence change to a written plan for multi-step work, but that is guidance, not measurement ([R70](/evidence/ledger/#r70), [R68](/evidence/ledger/#r68), [R72](/evidence/ledger/#r72)). No controlled test compares spec tooling with no spec ([R11a](/evidence/ledger/#r11a)).

## What the evidence shows

### Task size and success

- [Evidence] METR timed tasks with human experts and found that o3 succeeded about half the time on tasks that take a person about 110 minutes, and that this time horizon for frontier models has doubled roughly every seven months since 2019 ([R206](/evidence/ledger/#r206)). The tasks are mostly software and ML research with automatic scoring.
- [Evidence] Across all models in that study, success fell with human completion time, and the task length models finished 80% of the time was 4 to 6 times shorter than the length they finished half the time ([R206a](/evidence/ledger/#r206a)).
- [Evidence] In SWE-bench Verified, annotators judged that fewer than 10% of issues take an experienced engineer more than an hour ([R207](/evidence/ledger/#r207)), so the plan studies below that use it ([R8](/evidence/ledger/#r8), [R9](/evidence/ledger/#r9)) mostly test tasks judged to take under an hour.
- [Evidence] On SWE-Bench Pro, resolve rates fell sharply as the reference patch spanned more files ([R168](/evidence/ledger/#r168)).

### What vendors say about task size

- [Evidence] Claude Code's docs say to skip planning when the diff fits in one sentence, and the openai-agents-python repository makes its plan format optional for trivial fixes ([R70](/evidence/ledger/#r70)) and requires it for multi-step or multi-file work, new features, refactors or tasks over about an hour ([R68](/evidence/ledger/#r68)).
- [Evidence] OpenAI's team uses lightweight temporary plans for small changes and full execution plans for complex work, without a stated cutoff ([R69](/evidence/ledger/#r69)). BMad's docs set four planning paths from trivial to project-sized, the largest at roughly 20 or more sessions ([R72](/evidence/ledger/#r72)), and Kiro's say a quick chat fix is fine for typos ([R74](/evidence/ledger/#r74)). None of these sources measures where the boundary lies.

### What plans did in controlled tests

- [Evidence] In a peer-reviewed study of SWE-agent with four models on 497 SWE-bench Verified issues, a standard navigate, reproduce, patch and validate plan resolved more issues than no plan for every model ([R9](/evidence/ledger/#r9)).
- [Evidence] In the same study, removing the reproduce or validate phase made the plan worse than no plan for several model and variant pairs ([R9b](/evidence/ledger/#r9b)), and adding best-practice phases such as regression testing lowered success for all four models ([R9c](/evidence/ledger/#r9c)).
- [Evidence] Re-inserting the plan every five steps raised resolved counts for three models, while the fourth fell from 196 to 13 in the paper's own figure ([R9a](/evidence/ledger/#r9a)). On SWE-Bench Pro, compliance with the plan dropped by 13% on average ([R9d](/evidence/ledger/#r9d)).
- [Evidence] In another study, a to-do planning tool the agent kept for itself lifted a 30B model by 11.6 points on SWE-bench Verified at higher cost ([R8](/evidence/ledger/#r8)), while for the two largest models it cut cost by about 30% with small drops in success ([R8a](/evidence/ledger/#r8a)).

### Where runs fail before code

- [Evidence] On a 163-task benchmark that scores clarification and planning separately, an LLM judge placed 46.7% of runs as failing during requirement clarification or implementation planning ([R10](/evidence/ledger/#r10)). Requirement failures were the largest share for most configurations (24.5% to 46.0% of runs), against 5.5% to 17.8% for planning ([R10a](/evidence/ledger/#r10a)).
- [Evidence] Kent Beck, quoted by Martin Fowler, objects that writing the whole spec before building assumes nothing will be learned while building ([R71](/evidence/ledger/#r71)). Dex Horthy of HumanLayer argues that one bad line of a plan leads to hundreds of bad lines of code, so human review pays most on research and plans; the multipliers are rhetorical, not measured ([R100](/evidence/ledger/#r100)).

### Spec tools and living plans

- [Evidence] In a paper that runs agents through GitHub Spec Kit, repository-grounding hooks raised an LLM judge's score from 3.51 to 3.66 out of 5 over 128 runs ([R11](/evidence/ledger/#r11)), but blinded human raters preferred the version without hooks, 19 votes to 8 on 6 tasks ([R11c](/evidence/ledger/#r11c)).
- [Evidence] That paper's spec pipeline and its no-spec baseline scored 3.51 and 3.46 under different time budgets, a gap it did not test ([R11a](/evidence/ledger/#r11a)), and its SWE-bench Lite gain compared two configurations that both lacked specs ([R11b](/evidence/ledger/#r11b)).
- [Evidence] In Birgitta Böckeler's trials, Kiro turned a small bug into 4 user stories with 16 acceptance criteria ([R7b](/evidence/ledger/#r7b)), and Spec Kit produced files for a feature she sized at 3 to 5 story points that she found repetitive and tedious to review ([R7](/evidence/ledger/#r7)). Kiro's docs now say a quick chat fix is fine for typos, and offer a Quick Spec without approval gates ([R74](/evidence/ledger/#r74)).
- [Evidence] OpenAI's ExecPlan format keeps Progress, Surprises & Discoveries, Decision Log and Outcomes sections updated as work goes on ([R29](/evidence/ledger/#r29)). OpenAI says a similar plan let Codex work for more than seven hours from one prompt, with no task or comparison given ([R29a](/evidence/ledger/#r29a)).

## What to do

- Match the plan to the task, as vendors advise: skip a written plan for a change you can state in one sentence, and write one for multi-step or multi-file work ([R70](/evidence/ledger/#r70), [R68](/evidence/ledger/#r68), [R69](/evidence/ledger/#r69)). That boundary is a rule of thumb ([R70](/evidence/ledger/#r70)).
- Keep a plan to the steps the task needs: in one controlled study, a plan with a key step removed did worse than no plan for several models, and extra phases lowered success for all four ([R9b](/evidence/ledger/#r9b), [R9c](/evidence/ledger/#r9c)).
- For an issue fix, consider the sequence that study tested: locate the code, reproduce the problem, patch it, then validate the patch ([R9](/evidence/ledger/#r9)).
- Consider settling requirements before planning the code: requirement failures were the largest failure stage on one benchmark ([R10](/evidence/ledger/#r10), [R10a](/evidence/ledger/#r10a)).
- Expect a task that takes a person hours to fail more often than one that takes minutes, even with a capable model ([R206a](/evidence/ledger/#r206a)).
- If you re-inject a plan into context during a run, check the effect for each model you use: it helped three models and collapsed a fourth in one study ([R9a](/evidence/ledger/#r9a)).
- If you use a spec tool, check that its output fits the size of the change: one practitioner found the output oversized for a small bug and a modest feature ([R7b](/evidence/ledger/#r7b), [R7](/evidence/ledger/#r7)), and Kiro now offers lighter paths ([R74](/evidence/ledger/#r74)).
- Consider updating the plan as work turns up surprises and decisions, as OpenAI's format requires ([R29](/evidence/ledger/#r29)) and as critics of write-it-all-first specs argue ([R71](/evidence/ledger/#r71)).

## Not yet known

- Where the size boundary for a written plan lies; the vendor cutoffs of one sentence or about an hour are rules of thumb ([R70](/evidence/ledger/#r70), [R68](/evidence/ledger/#r68)).
- Whether a spec tool beats no spec on the same tasks under the same budget ([R11a](/evidence/ledger/#r11a)).
- Whether a task-specific plan beats the generic four-step plan ([R9](/evidence/ledger/#r9)).
- Whether splitting a long task into short steps recovers the success rates of short tasks ([R206a](/evidence/ledger/#r206a)).
- How plans affect tasks that take a person more than an hour, since few SWE-bench Verified issues are that long ([R207](/evidence/ledger/#r207)).
- Whether human review of a plan improves results, and what it costs ([R100](/evidence/ledger/#r100)).
- More gaps are listed on [Open questions](/evidence/open-questions/).
