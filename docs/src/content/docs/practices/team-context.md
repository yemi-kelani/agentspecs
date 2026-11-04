---
title: Team context
description: How teams share agent context across people and tools, how nested and global files combine, and what the evidence says about keeping them current.
---

Once several people and several agents work in one repository, the instruction files become shared infrastructure: who writes them, which tool reads which file, and who notices when they go out of date. This page asks how teams share agent context, how the files layer, and how they stay current.

## Short answer

[Evidence] Studies of public repositories show teams mostly write build, test, implementation and architecture notes, and rarely security or performance ([R180](/evidence/ledger/#r180), [R184](/evidence/ledger/#r184)). Files tend to grow by small additions, and in one sample half of AGENTS.md files never changed after creation ([R180b](/evidence/ledger/#r180b), [R185a](/evidence/ledger/#r185a)). Each tool combines nested and global files its own way, some joining them all and some letting the nearest file win, so the same files can reach two agents differently ([R187](/evidence/ledger/#r187), [R188b](/evidence/ledger/#r188b), [R49](/evidence/ledger/#r49), [R51](/evidence/ledger/#r51)). One checker flagged a stale code reference in about a quarter of the repositories it sampled ([R190](/evidence/ledger/#r190)), and the only result tying a rule update to better compliance is a before/after comparison with no control group ([R183](/evidence/ledger/#r183)).

## What the evidence shows

### What teams write, and leave out

- [Evidence] In 2,303 context files from 1,925 public repositories, testing instructions appeared in 75.9% of files, implementation details in 70.8% and architecture in 68.1%, but security in only 14.8% and performance in 14.5% ([R180](/evidence/ledger/#r180)).
- [Evidence] An earlier study of 253 CLAUDE.md files found build and run instructions in 77.1% of files and security in 8.7% ([R184](/evidence/ledger/#r184)).
- [Evidence] Across 7,310 rules from 83 projects, code implementation and development workflow were the largest categories, while 99 surveyed practitioners rated architecture and design the most important ([R182](/evidence/ledger/#r182)).
- [Evidence] In 401 repositories with Cursor rules, 28.7% of lines were exact copies of lines elsewhere, most often among instructions aimed at the model; the authors read this as copied templates ([R181a](/evidence/ledger/#r181a)). The rules fell into five themes: conventions, guidelines, project information, model directives and examples ([R181](/evidence/ledger/#r181)).
- [Evidence] None of these studies measures whether the content helps agents ([R180](/evidence/ledger/#r180), [R181](/evidence/ledger/#r181)).

### How many repositories use them

- [Evidence] In one snapshot, only 5% of 10,000 popular, mature repositories had any of the AGENTS.md, CLAUDE.md, GEMINI.md or Copilot formats, and 25 had both AGENTS.md and CLAUDE.md ([R185](/evidence/ledger/#r185)).
- [Evidence] Among 2,926 repositories that already use an agent tool, the first version of one study found CLAUDE.md made up 34.2% of context files, AGENTS.md 32.3%, Copilot instructions 27.7% and GEMINI.md 3.3%, and most repositories had one or two files ([R186](/evidence/ledger/#r186)).
- [Evidence] The agents.md site reports use by more than 60,000 open-source projects, an undated count of its own ([R44](/evidence/ledger/#r44)). The format came from several agent vendors and is now stewarded under the Linux Foundation ([R130](/evidence/ledger/#r130)).

### How the files change

- [Evidence] In the 2,303-file study, 59% to 67% of files changed in more than one commit, with a median gap of about a day between changes for Claude Code and Codex files ([R180a](/evidence/ledger/#r180a)). Edits were mostly small additions: deletions had a median under 15 words per commit ([R180b](/evidence/ledger/#r180b)).
- [Evidence] In another sample, 50% of 155 AGENTS.md files never changed after creation and 23% changed once ([R185a](/evidence/ledger/#r185a)). The files were young, since the format dates from 2025.
- [Evidence] Of the 504 rule changes whose reason could be determined, the largest groups expanded or enriched context, and 77.8% of surveyed developers said they change rules to correct AI errors, usually by adding a constraint on what not to do ([R182a](/evidence/ledger/#r182a)).

### How each tool layers files

[Evidence] Each tool documents its own order, and they disagree on whether nested files join or override ([R46](/evidence/ledger/#r46), [R49](/evidence/ledger/#r49), [R187](/evidence/ledger/#r187)):

| Tool | Files it reads | When several apply |
|------|----------------|--------------------|
| Codex | A global file, then one `AGENTS.override.md` or `AGENTS.md` per folder from the project root down to the working folder | Joined root first, so nearer files come later and override; stops adding at 32 KiB by default ([R187](/evidence/ledger/#r187), [R187a](/evidence/ledger/#r187a)) |
| GitHub Copilot | `.github/copilot-instructions.md`, path-specific `.instructions.md` files, and `AGENTS.md` anywhere | Matching repository-wide and path files are both used; the nearest `AGENTS.md` wins ([R188](/evidence/ledger/#r188), [R188b](/evidence/ledger/#r188b)) |
| Gemini CLI | A global `GEMINI.md`, workspace folders and their parents, and, just in time, the folder of any file a tool reads and its parents | All found files joined into every prompt; the file name can be set to `AGENTS.md` ([R189](/evidence/ledger/#r189), [R189a](/evidence/ledger/#r189a)) |
| Claude Code | Every `CLAUDE.md` from the filesystem root to the working folder; subfolder files on demand | All joined, with no nearest-wins rule; `AGENTS.md` read by default only when no `CLAUDE.md` exists ([R49](/evidence/ledger/#r49), [R51](/evidence/ledger/#r51)) |
| Cursor | `.mdc` rules in `.cursor/rules`, plus nested `AGENTS.md` files | Rules apply always, by description, by glob or on mention; nested files combine with parents and the more specific wins ([R136](/evidence/ledger/#r136), [R46](/evidence/ledger/#r46)) |
| Kiro | Workspace and global steering folders, plus `AGENTS.md` | Workspace steering overrides global on conflict ([R65](/evidence/ledger/#r65)) |

- [Evidence] The AGENTS.md convention itself says the closest file wins and an explicit prompt overrides everything ([R46](/evidence/ledger/#r46)). For Copilot Chat on GitHub.com, personal instructions take precedence over repository ones, which take precedence over organisation ones ([R188a](/evidence/ledger/#r188a)).
- [Evidence] In one Claude Code study, splitting the file in two or adding nested files gave no detectable compliance gain over one file ([R3b](/evidence/ledger/#r3b)).

### Files that point at each other

- [Evidence] In the same study's first version, 518 pairs of context files referenced each other instead of repeating content; CLAUDE.md was the file most often pointing elsewhere and AGENTS.md the file most often pointed to ([R186a](/evidence/ledger/#r186a)).
- [Evidence] Gemini CLI and Claude Code both support imports from one file into another ([R189a](/evidence/ledger/#r189a), [R47](/evidence/ledger/#r47)); the Claude Code docs note an import organises a file without lowering its context cost ([R47](/evidence/ledger/#r47)).

### Staleness and upkeep

- [Evidence] A documentation-consistency checker flagged at least one stale code reference in 82 of 356 sampled repositories (23.0%); 64% of 50 hand-checked hits were genuine, and the authors call the rate a feasibility signal ([R190](/evidence/ledger/#r190)).
- [Evidence] One developer keeping spec documents for a 108,000-line project reported 1 to 2 hours of upkeep a week, and at least two cases where outdated documents led the agent to write code that clashed with recent refactors ([R190a](/evidence/ledger/#r190a)).
- [Evidence] OpenAI reports that one large instruction file went stale quickly ([R57](/evidence/ledger/#r57)), and that it now checks its docs structure with linters and CI and runs a recurring agent that opens fixes for stale docs ([R91](/evidence/ledger/#r91)). It gives no effectiveness data.

### Does updating a rule change what gets built?

- [Evidence] In 160 rule-update events, artifacts' compliance with the rule rose from 49% before the update to 72% after ([R183](/evidence/ledger/#r183)). There was no control group, an LLM judged compliance, and commits may have been written by people or agents. A controlled two-agent study found no significant pass-rate change between no context and a full AGENTS.md ([R191](/evidence/ledger/#r191)); see conflict [CT1](/evidence/ledger/#ct1-do-repository-instruction-files-measurably-change-what-agents-produce), which notes the two measure different outcomes.

## What to do

- Check what your tools actually load before splitting guidance across folders: Codex, Gemini CLI and Claude Code join files, while Copilot and the AGENTS.md convention let the nearest AGENTS.md win ([R187](/evidence/ledger/#r187), [R189](/evidence/ledger/#r189), [R49](/evidence/ledger/#r49), [R188b](/evidence/ledger/#r188b), [R46](/evidence/ledger/#r46)).
- If your team uses Claude Code with other agents, know that by default it reads AGENTS.md only when no CLAUDE.md is present ([R51](/evidence/ledger/#r51)); in public repositories CLAUDE.md is the file that most often points elsewhere ([R186a](/evidence/ledger/#r186a)).
- Keep one copy of each fact and point to it from the other files, rather than repeating it, as Cursor advises so that rules do not go stale ([R54](/evidence/ledger/#r54), [R186a](/evidence/ledger/#r186a)).
- If you use Codex with many nested files, watch their combined size, since it stops adding files at 32 KiB by default ([R187a](/evidence/ledger/#r187a)).
- Check whether your files say anything about security and performance, which most public files leave out ([R180](/evidence/ledger/#r180), [R184](/evidence/ledger/#r184)).
- Remove lines as well as adding them: public files grew mostly by small additions ([R180b](/evidence/ledger/#r180b)), and the Claude Code docs warn that a bloated file gets rules lost ([R48](/evidence/ledger/#r48)).
- Consider checking code references in the files automatically, for example in CI: about a quarter of repositories in one check carried a stale reference ([R190](/evidence/ledger/#r190)), and OpenAI runs linters, CI jobs and a recurring agent for this ([R91](/evidence/ledger/#r91)).
- After changing a rule, look at what the agent then produces; in the one before/after study compliance rose to 72%, not 100% ([R183](/evidence/ledger/#r183)).

What goes into the file itself is on [Instruction files](/practices/instruction-files/).

## Not yet known

- Whether adding security or performance guidance changes how agents handle them ([R180](/evidence/ledger/#r180)).
- Whether joining files or letting the nearest win gives better results; no row compares them ([R46](/evidence/ledger/#r46), [R49](/evidence/ledger/#r49), [R3b](/evidence/ledger/#r3b)).
- Whether files that point at each other stay consistent over time ([R186a](/evidence/ledger/#r186a)).
- How often stale references change what an agent builds, beyond one developer's report ([R190](/evidence/ledger/#r190), [R190a](/evidence/ledger/#r190a)).
- Whether rule updates cause the compliance rise seen in before/after data ([R183](/evidence/ledger/#r183)).
- How adoption has changed since that snapshot ([R185](/evidence/ledger/#r185)).
- [Open questions](/evidence/open-questions/) collects these gaps.
