---
title: Contribute
description: How to send feedback, propose a change to the specification and write for this site.
---

## Give feedback

- **Problems.** Open an [issue](https://github.com/yemi-kelani/agentspecs/issues) for a broken link, a wrong citation, a template that disagrees with the Specification, or a rule that reads two ways.
- **Questions and ideas.** Start a thread in [Discussions](https://github.com/yemi-kelani/agentspecs/discussions) for usage questions, early ideas, or a report of how a spec set worked on a real task.

Reports from real use help most: what the task was, which agent ran it, and where the phase files helped or got in the way.

## Propose a change to the specification

A spec change moves through three steps, so the reasoning is on record before anything merges.

1. **Issue.** Describe one problem: what breaks or is missing today, with an example spec set or handoff if you have one.
2. **Discussion.** If the fix changes a MUST, SHOULD or MAY rule or a file format, take it to a discussion. Compare the options there and link any evidence. The change is ready when the discussion settles on one option.
3. **Pull request.** One pull request updates, together:
   - the [Specification](/specification/) text;
   - every affected template in `docs/public/templates/`, plus [Templates](/reference/templates/) and the [Quickstart](/quickstart/), which must embed (Templates) or fetch unchanged (Quickstart) every template;
   - the changelog section, [Changes in this version](/specification/#changes-in-this-version);
   - the reference validator, [specs-ref](https://github.com/yemi-kelani/agentspecs/tree/main/specs-ref), when a script can check the rule.

Fixes that do not change the format, such as typos, broken links or clearer wording, can go straight to a pull request.

## Write for this site

From `docs/`, `npm run dev` previews the site, `npm run check` runs the content checks and `npm run check:quickstart` runs the Quickstart end to end. Run all three before you open a pull request. The banned-term check reads a list that only maintainers hold; without it, run `AGENTSPECS_BANNED_TERMS=off npm run check` and a maintainer runs the full check before merging.

- **Label claims.** Start every non-trivial claim with exactly one of `[Established]`, `[Evidence]`, `[Heuristic]` or `[Proposal]`. The [Evidence page](/evidence/#labels) defines them. A heuristic is never a finding, and every `[Evidence]` claim carries its caveat.
- **Cite verified sources only.** A citation is a link whose URL matches a source marked `verified` in `src/data/evidence.json`. Add a new source there first, with the claim it supports, its label and caveat, and the date you checked it. Other outside links belong in `src/data/links-allowlist.json`.
- **Paraphrase.** Content pages hold no quotes of 15 words or more. Short quotes, under 15 words and one per source, live in the evidence data and appear only on the Evidence page.
- **Write original text.** Do not copy from other documentation, including the Agent Skills docs. The check flags any run of 10 words shared with them.
- **Keep pages small.** One idea per page and at most 120 lines of Markdown. Use neutral, made-up examples, never names from a real company or internal project.
- **Follow the page format.** Each page has a `title` of 60 characters or fewer and a `description` of exactly one sentence. Internal links are absolute with a trailing slash, such as `/concepts/sizing/`.

## Origins

Agent Specs began as an internal engineering talk, *Less is More: Leveraging Progressive Disclosure in Agentic Development*. This site turns the talk's central idea, progressive disclosure for coding agents, into a written convention with templates, checks and cited evidence.

## License

The specification, templates and this site are licensed under the [Apache License 2.0](https://github.com/yemi-kelani/agentspecs/blob/main/LICENSE). Contributions are accepted under the same license.
