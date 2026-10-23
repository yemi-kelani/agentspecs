---
title: Contribute
description: How to send feedback, propose a change to the specification and write for this site.
---

## Give feedback

- **Problems.** Open an [issue](https://github.com/yemi-kelani/agentspecs/issues) for a broken link, a wrong citation, a template that disagrees with the Specification, or a rule that reads two ways.
- **Questions and ideas.** Start a thread in [Discussions](https://github.com/yemi-kelani/agentspecs/discussions) for usage questions, early ideas, or a report of how a packet worked on a real task.

Reports from real use help most: what the task was, which agent ran it, and where the slices, checks or handoffs helped or got in the way. A run of the [head-to-head protocol](/evidence/open-questions/#replication-protocol-for-the-head-to-head) helps most of all.

## Propose a change to the format

A format change moves through three steps, so the reasoning is on record before anything merges.

1. **Issue.** Describe one problem: what breaks or is missing today, with an example packet or handoff if you have one.
2. **Discussion.** If the fix changes a rule or a file format, take it to a discussion. Compare the options there and link the ledger rows that bear on it. Every rule costs each packet that follows it, so add one only for a need someone has shown.
3. **Pull request.** One pull request updates, together:
   - the [Packet anatomy](/approach/packet-anatomy/) text, which is the authority for the format;
   - every affected template in `docs/public/templates/`, plus [Templates](/reference/templates/) and the [Quickstart](/quickstart/), which must embed (Templates) or fetch unchanged (Quickstart) every template;
   - the changelog section, [Changes in this version](/approach/packet-anatomy/#changes-in-this-version);
   - the reference validator, [specs-ref](https://github.com/yemi-kelani/agentspecs/tree/main/specs-ref), when a script can check the rule.

Fixes that do not change the format, such as typos, broken links or clearer wording, can go straight to a pull request.

## Write for this site

From `docs/`, `npm run dev` previews the site, `npm run check` runs the content checks and `npm run check:quickstart` runs the Quickstart end to end. Run all three before you open a pull request. The banned-term check reads a list that only maintainers hold; without it, run `AGENTSPECS_BANNED_TERMS=off npm run check` and a maintainer runs the full check before merging.

- **Label claims.** Start every non-trivial claim with exactly one of `[Evidence]`, `[Proposal]` or `[Judgment]`. [Method](/evidence/method/#labels) defines them. `[Evidence]` and `[Proposal]` claims link a ledger row such as `/evidence/ledger/#r18`, and any sentence that recommends something links a row or sits under `[Judgment]`.
- **Cite rows, then sources.** A ledger row is a claim in `src/data/evidence.json` with its row id, kind, strength, quote or locator and caveat. Add a row there first, with the primary source marked `verified` and the date you checked it, then run `node scripts/gen-evidence.mjs`. An outside link must match a verified source; other outside links belong in `src/data/links-allowlist.json`.
- **Paraphrase.** Content pages hold no quotes of 15 words or more. Short quotes, under 15 words, live in the evidence data and appear only on the Ledger.
- **Write original text.** Do not copy from other documentation, including the Agent Skills docs. The check flags any run of 10 words shared with them.
- **Keep pages small.** At most 120 lines of Markdown. Use neutral, made-up examples, never names from a real company or internal project.
- **Follow the page format.** Each page has a `title` of 60 characters or fewer and a `description` of exactly one sentence. Internal links are absolute with a trailing slash, such as `/practices/planning/`.

## License

The specification, templates and this site are licensed under the [Apache License 2.0](https://github.com/yemi-kelani/agentspecs/blob/main/LICENSE). Contributions are accepted under the same license.
