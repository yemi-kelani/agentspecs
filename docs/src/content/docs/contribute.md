---
title: Contribute
description: How to report evidence we missed, correct a claim and write for this site.
---

## Give feedback

- **Problems.** Open an [issue](https://github.com/yemi-kelani/agentspecs/issues) for a broken link, a claim its ledger row does not support, a missed null result, or a sentence that says more than its source.
- **Evidence we missed.** Open an issue with the primary source (the paper, the official documentation or the team's own post) and the finding it reports. A result that contradicts a page is the most useful kind.
- **Questions and ideas.** Start a thread in [Discussions](https://github.com/yemi-kelani/agentspecs/discussions).

## How the site changes

The evidence comes first and the pages follow it, so most changes start in the ledger.

1. **Add or correct a row.** A ledger row is a claim in `docs/src/data/evidence.json` with its primary source, a quote of fewer than 15 words or a locator, a caveat and the date you checked it. Read the full text, not only the abstract. Mark the source `verified`, then run `node scripts/gen-evidence.mjs` from `docs/` to regenerate the [Ledger](/evidence/ledger/). A row the source does not support is dropped with its reason, not deleted.
2. **Change the page the row bears on.** If the row contradicts what a page says, the page changes. Null results and conflicts go next to the finding they qualify.
3. **Add a page only when rows answer its question.** A question with no rows behind it belongs on [Open questions](/evidence/open-questions/). A new page, a removed page or a change to these rules is recorded in `docs/DECISIONS.md`.

Typos, broken links and clearer wording can go straight to a pull request.

## Write for this site

Run these from `docs/` before you open a pull request:

```bash
npm install     # once
npm run dev     # preview at http://localhost:4321
npm test        # tests for the checks and plugins
npm run check   # content checks
```

The banned-term check reads a list that only maintainers hold; without it, run `AGENTSPECS_BANNED_TERMS=off npm run check` and a maintainer runs the full check before merging.

- **Label claims.** Start a claim that reports evidence with `[Evidence]` and link its ledger row, such as `/evidence/ledger/#r18`. It is the only label. [Method](/evidence/method/#labels) explains it.
- **Link a row for every recommendation.** A sentence that recommends something links a verified row. The check fails it otherwise, and there is no escape label.
- **Word claims to fit their rows.** Describe the study (its size, setting and who ran it) rather than grading it. Kind and strength grades stay in the data file.
- **Cite primary sources.** An outside link must match a verified source in the data file; other outside links belong in `src/data/links-allowlist.json`.
- **Paraphrase.** Content pages hold no quotes of 15 words or more. Short quotes live in the evidence data and appear only on the Ledger.
- **Write original text.** Do not copy from other documentation, including the Agent Skills docs. The check flags any run of 10 words shared with them.
- **Keep pages small.** At most 120 lines of Markdown. Use neutral, made-up examples, never names from a real company or internal project.
- **Follow the page format.** Each page has a `title` of 60 characters or fewer and a `description` of exactly one sentence. Internal links are absolute with a trailing slash, such as `/practices/planning/`. [docs/AGENTS.md](https://github.com/yemi-kelani/agentspecs/blob/main/docs/AGENTS.md) has the rest.

## License

This site and its content are licensed under the [Apache License 2.0](https://github.com/yemi-kelani/agentspecs/blob/main/LICENSE). Contributions are accepted under the same license.
