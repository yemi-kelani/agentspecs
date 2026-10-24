---
title: Open questions
description: What no study has settled about giving coding agents context, the nearest rows for each gap, and a protocol for testing one.
---

Each question below is one the practice pages cannot answer, because no verified row settles it. The rows named are the nearest evidence, not an answer. A study that closes a gap moves it onto a practice page. The [roadmap](https://github.com/yemi-kelani/agentspecs/blob/main/ROADMAP.md) tracks the same list.

## Context and sessions

- **A fresh session per step, against one long session.** Instruction-following falls as a session grows ([R3c](/evidence/ledger/#r3c), [R40](/evidence/ledger/#r40)), and one harness with a fresh-context executor scored higher, but it changed several things at once ([R211](/evidence/ledger/#r211)). No study isolates the fresh session on coding work.
- **A plan that works as a table of contents.** Short files that point to detail elsewhere are documented practice ([R56](/evidence/ledger/#r56)), and one vendor eval compressed an index with no loss ([R20b](/evidence/ledger/#r20b)). One plan format asks for the opposite, a fully self-contained plan ([R67](/evidence/ledger/#r67)). No study compares an index plan pointing to per-step files with one plan document.
- **Loading detail on demand.** Agents often skip context they have to fetch for themselves ([R20a](/evidence/ledger/#r20a), [R204a](/evidence/ledger/#r204a)), and a second level of routing did not help in one study's single-book tests ([R203b](/evidence/ledger/#r203b)). Every test so far is outside coding or vendor-run.
- **Progress files over many sessions.** Vendors describe progress files and feature lists without numbers ([R12](/evidence/ledger/#r12), [R12a](/evidence/ledger/#r12a)), and the one handoff study tested a single takeover ([R210](/evidence/ledger/#r210)).
- **Where coding work starts to slip.** Vendor docs name no fill level ([R31](/evidence/ledger/#r31)), and one team's threshold has already moved ([R42](/evidence/ledger/#r42)).
- **Memory across tasks for coding.** One study found cross-task memory never beat the baseline ([R25](/evidence/ledger/#r25)); nothing yet shows a kind that does.

## Instruction files and teams

- **Whether instruction files help.** The controlled tests are few, small or limited to a few languages ([R1](/evidence/ledger/#r1), [R191](/evidence/ledger/#r191)).
- **Nested or path-scoped files against one root file.** Tools document how they layer files ([R187](/evidence/ledger/#r187), [R188](/evidence/ledger/#r188)); the one test of splitting a file found no difference on one simple rule ([R3b](/evidence/ledger/#r3b)).
- **Team effects over months.** Many files are never edited after they are created ([R185a](/evidence/ledger/#r185a)), and stale code references are common ([R190](/evidence/ledger/#r190)). No study links staleness to agent results, or measures onboarding or review cost.

## Large codebases

- **Repository size as a cause.** Success falls on larger repositories ([R169](/evidence/ledger/#r169), [R170](/evidence/ledger/#r170)), but size moves with language, task type and repository age, and one comparison runs the other way ([R170a](/evidence/ledger/#r170a)).
- **A pre-built index against agentic search for code changes.** The head-to-heads use different tasks and different agents ([R165](/evidence/ledger/#r165), [R172](/evidence/ledger/#r172), [R177](/evidence/ledger/#r177)).
- **Maps and graphs at million-line scale.** The one benchmark at that scale tested only a map taken from the answer ([R171](/evidence/ledger/#r171), [R171a](/evidence/ledger/#r171a)); the graph studies used 300 Python issues ([R160](/evidence/ledger/#r160)).
- **Code graphs with current models.** Graph tools helped smaller models more than stronger ones ([R163a](/evidence/ledger/#r163a)).

## Planning and checking

- **Spec tooling against no spec.** No controlled test compares them ([R11a](/evidence/ledger/#r11a)).
- **A separate checker on ordinary tasks.** The controlled results on agents gaming tests come from tasks built to be impossible ([R18](/evidence/ledger/#r18)).
- **Several agents against one on coding.** Whether one agent or many does better is stated as unresolved ([R12e](/evidence/ledger/#r12e)).

## Trust

- **A defence that stops prompt injection.** No row shows one that works reliably ([R128](/evidence/ledger/#r128)), and planted memory survived a prompt-level defence ([R28a](/evidence/ledger/#r28a)).

## A protocol for testing a practice

A design anyone with agent access can run for any gap above. The protocol is published before the runs.

1. **Tasks.** At least 30 tasks from at least 5 real repositories, each with a hidden, human-written acceptance suite. Tasks post-date the models' training data or are held out from public benchmarks.
2. **Conditions.** The practice against its plain alternative (for example, one long session against a fresh session per step), with the same model, harness, budget and session limit in each.
3. **Assignment.** Every task runs in every condition, in random order, at least 3 times per condition to measure run-to-run variance.
4. **Outcomes.** Primary: the hidden suite's pass rate. Secondary: regressions, tokens and cost, wall-clock time, human minutes spent, and test edits or other gaming found on inspection.
5. **Blinding.** Graders of secondary outcomes are blind to the condition.
6. **Analysis.** A mixed-effects model with task and repository as random effects, effect sizes with confidence intervals, and the smallest effect the design can detect. Nulls are reported.
7. **Release.** Tasks, prompts, transcripts and analysis code.
