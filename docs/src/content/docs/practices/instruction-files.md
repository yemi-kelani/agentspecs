---
title: Instruction files
description: What goes in a repository's AGENTS.md or CLAUDE.md, how long it can be, and what the evidence says about whether it helps.
---

Most coding agents read a file from the repository at the start of every session: AGENTS.md, CLAUDE.md, a Copilot instructions file or a Cursor rule. This page asks what goes in that file, how long it can be, and whether it makes the agent's work any better.

## Short answer

[Evidence] In controlled tests, adding an instruction file did not significantly change whether coding agents solved tasks, and it raised cost by about a fifth ([R1](/evidence/ledger/#r1), [R1a](/evidence/ledger/#r1a), [R191](/evidence/ledger/#r191)). Agents did act on the concrete instructions in such files, without following them every time ([R1c](/evidence/ledger/#r1c), [R3d](/evidence/ledger/#r3d)). Vendor and practitioner guidance converges on short, human-written files that hold only what the agent cannot work out alone and point to detail elsewhere ([R50](/evidence/ledger/#r50), [R56](/evidence/ledger/#r56), [R58](/evidence/ledger/#r58)). None of the size limits comes from an experiment, and one study found no effect of length from 25 to 500 lines ([R3](/evidence/ledger/#r3)).

## What the evidence shows

### Does a file help?

- [Evidence] Across four agent setups on SWE-bench Lite and on 138 tasks from repositories with their own context files, adding an AGENTS.md-style file did not significantly change task success: LLM-generated files moved it by about -0.5 to -2 points, developer-written ones by about +2.4 ([R1](/evidence/ledger/#r1)). The repositories were all Python.
- [Evidence] A smaller study of 288 runs (15 tasks for Claude Code and 17 for Codex, from 3 repositories) found no significant change in pass rate between no context and the full AGENTS.md in the system prompt ([R191](/evidence/ledger/#r191)). It could rule out only effects larger than about 10 to 15 points, and many tasks sat at floor or ceiling.
- [Evidence] Developer-written files did about 7% better than LLM-generated ones, though still not significantly better than no file ([R1d](/evidence/ledger/#r1d)).
- [Evidence] Files raised inference cost by about 19% to 23% and added 2.5 to 3.9 agent steps per task ([R1a](/evidence/ledger/#r1a)), with up to 22% more reasoning tokens for one model ([R1e](/evidence/ledger/#r1e)). A separate study tied an AGENTS.md to a 28.6% lower median runtime for Codex, without measuring correctness ([R2](/evidence/ledger/#r2)). See conflict [C1](/evidence/ledger/#c1-do-context-files-raise-or-lower-cost).
- [Evidence] In Vercel's evals on Next.js 16 APIs that models had not seen in training, a compressed docs index in AGENTS.md passed 100% of cases against 53% with no docs ([R20](/evidence/ledger/#r20)). The index shrank from about 40KB to 8KB with no loss, and points to local doc files read on demand ([R20b](/evidence/ledger/#r20b)). The sample size is not disclosed. See conflict [C3](/evidence/ledger/#c3-does-always-loaded-context-help): the rows fit together if a file helps only when it carries facts the model cannot get elsewhere.

### Do agents follow it?

- [Evidence] A tool such as uv was used about 1.6 times per task when the file mentioned it, against under 0.01 times when it did not ([R1c](/evidence/ledger/#r1c)).
- [Evidence] Without an instruction file, none of 524 functions carried a required annotation; with one, about 68% did ([R3d](/evidence/ledger/#r3d)). A written rule changed behaviour without guaranteeing it.
- [Evidence] In the same study, which task the agent was doing moved compliance more (45% to 84%) than any file-structure choice ([R3e](/evidence/ledger/#r3e)).
- [Evidence] One practitioner often saw agents miss instructions in detailed spec files, and at other times follow them too eagerly ([R7a](/evidence/ledger/#r7a)).
- [Evidence] The Claude Code docs describe CLAUDE.md as advisory context, and point to hooks for anything that must happen every time ([R85](/evidence/ledger/#r85)).

### Length, position and splitting

- [Evidence] In a factorial study of Claude Code sessions on one TypeScript codebase, a CLAUDE.md of 25, 100, 250 or 500 lines made no detectable difference to following one simple rule (60% to 68%), and neither did a conflicting rule ([R3](/evidence/ledger/#r3)). Moving the rule from line 2 to line 250 made none either ([R3a](/evidence/ledger/#r3a)), nor did splitting the file in two or adding nested files ([R3b](/evidence/ledger/#r3b)). It is a single-author preprint scoring a trivial marker.
- [Evidence] Other studies found accuracy falling as inputs grew or as more instructions had to be followed at once ([R4](/evidence/ledger/#r4), [R6](/evidence/ledger/#r6)). See conflict [C2](/evidence/ledger/#c2-do-file-size-and-position-matter) and [Context limits](/practices/context-limits/).
- [Evidence] The Claude Code docs set a target of under 200 lines per CLAUDE.md because longer files reduce adherence, and note that imports organise a file without cutting its context cost ([R47](/evidence/ledger/#r47)). They warn that a bloated file gets rules lost, and suggest testing each line by asking whether removing it would cause mistakes ([R48](/evidence/ledger/#r48)).
- [Evidence] Other vendor figures run from about 100 lines for OpenAI's AGENTS.md map to 500 for Cursor rules ([R58](/evidence/ledger/#r58), [R53](/evidence/ledger/#r53)), and one practitioner keeps a root CLAUDE.md under 60 lines ([R64](/evidence/ledger/#r64)). None of these figures comes from a published experiment ([R58](/evidence/ledger/#r58)).
- [Evidence] OpenAI's Codex team replaced one large AGENTS.md with a map of roughly 100 lines pointing into a structured docs directory ([R56](/evidence/ledger/#r56)). It reports that the large file crowded out the task, made every rule look equally important, went stale quickly and could not be checked mechanically ([R57](/evidence/ledger/#r57)).

### What goes in

- [Evidence] AGENTS.md is plain Markdown with no required fields, meant for build, test and style instructions that would clutter a README ([R45](/evidence/ledger/#r45)).
- [Evidence] The Claude Code docs list what belongs: commands the agent cannot guess, non-default style rules, test instructions and project gotchas. They list what to leave out: what it can learn by reading the code, standard conventions, detailed API docs and file-by-file descriptions ([R50](/evidence/ledger/#r50)).
- [Evidence] Repository overviews did not help agents reach the files they needed any sooner ([R1b](/evidence/ledger/#r1b)). That shows overviews did not help there; it does not show they hurt.
- [Evidence] BMad's project-context step writes a small block of unobvious, project-specific facts and leaves out repo maps, overviews, style a linter can enforce, and history ([R63](/evidence/ledger/#r63)).
- [Evidence] Cursor advises adding a rule only after the agent repeats the same mistake, and referencing files rather than copying their contents in ([R53](/evidence/ledger/#r53), [R54](/evidence/ledger/#r54)). HumanLayer advises never using the model as a linter ([R64](/evidence/ledger/#r64)).

### Pointing to detail

- [Evidence] Anthropic describes loading detail just in time: the agent holds file paths and reads through tools when needed, which Claude Code mixes with CLAUDE.md files loaded up front ([R52](/evidence/ledger/#r52)). Anthropic calls the same idea, progressive disclosure, the core design principle of Agent Skills ([R60](/evidence/ledger/#r60)); [agentskills.io](https://agentskills.io) covers skills in depth.
- [Evidence] OpenAI routes Codex to its plan format through a short AGENTS.md section that says when to use it and points to PLANS.md ([R55](/evidence/ledger/#r55)). BMAD always loads three architecture files (coding standards, tech stack, source tree) and tells its developer agent that the story file holds everything else ([R144](/evidence/ledger/#r144)). Kiro steering files have four inclusion modes: always, on a file match, manual and auto ([R65](/evidence/ledger/#r65)).
- [Evidence] On-demand detail can go unread: in Vercel's evals, a skill the agent was free to call was never invoked in 56% of cases, a figure that may predate the final eval suite ([R20a](/evidence/ledger/#r20a)), and small wording changes in the pointer swung results ([R20c](/evidence/ledger/#r20c)).

## What to do

- Write the file by hand, and limit it to what the agent cannot work out alone: commands it cannot guess, non-default conventions and project gotchas ([R1d](/evidence/ledger/#r1d), [R50](/evidence/ledger/#r50), [R63](/evidence/ledger/#r63)).
- Name concrete tools and commands; agents used a tool far more often when the file mentioned it ([R1c](/evidence/ledger/#r1c)).
- Leave out repository overviews and file-by-file tours: overviews did not help agents find files sooner ([R1b](/evidence/ledger/#r1b)), and the Claude Code docs list file descriptions among things to omit ([R50](/evidence/ledger/#r50)).
- Keep the file short and point to longer material: vendor targets run from about 100 to 500 lines ([R58](/evidence/ledger/#r58)), and OpenAI moved from one large file to a short map ([R56](/evidence/ledger/#r56), [R57](/evidence/ledger/#r57)). The one controlled test of length found no compliance effect up to 500 lines, so the case for brevity rests on context cost and vendor guidance ([R3](/evidence/ledger/#r3), [R47](/evidence/ledger/#r47)).
- Test each line by asking whether removing it would cause a mistake ([R48](/evidence/ledger/#r48)), and consider adding a rule when the agent repeats a mistake rather than in advance ([R53](/evidence/ledger/#r53)).
- Back any rule that must always hold with a hook, linter or CI check: a written rule took compliance from 0% to about 68%, not to 100% ([R3d](/evidence/ledger/#r3d)), and Claude Code treats the file as advisory ([R85](/evidence/ledger/#r85)).
- If the agent needs facts it cannot have learned, such as a framework version newer than the model, consider a compact index in the file that points to local docs: one vendor eval found it beat an on-demand skill ([R20](/evidence/ledger/#r20), [R20b](/evidence/ledger/#r20b), [R20a](/evidence/ledger/#r20a)).
- Expect the file to cost tokens and steps on every task, about a fifth more in one study ([R1a](/evidence/ledger/#r1a)).

For how files in different folders and tools combine, see [Team context](/practices/team-context/).

## Not yet known

- Whether instruction files help outside Python and TypeScript, beyond 500 lines, or for rules harder than a comment marker ([R1](/evidence/ledger/#r1), [R3](/evidence/ledger/#r3)).
- Whether any line or token count marks a point where adherence drops; the vendor figures come from no published experiment ([R58](/evidence/ledger/#r58)).
- Whether a file helps on work that spans several sessions, which none of the controlled tests covered ([R1](/evidence/ledger/#r1), [R191](/evidence/ledger/#r191)).
- Whether a short index with on-demand detail beats an always-loaded file beyond one framework's docs ([R20](/evidence/ledger/#r20)); see conflict [CS2](/evidence/ledger/#cs2-does-loading-a-short-index-first-and-fetching-detail-on-demand-help-agents).
- Whether rule updates cause better compliance, given one before/after result ([R183](/evidence/ledger/#r183)) and a controlled null ([R191](/evidence/ledger/#r191)); see conflict [CT1](/evidence/ledger/#ct1-do-repository-instruction-files-measurably-change-what-agents-produce).
- [Open questions](/evidence/open-questions/) collects these gaps.
