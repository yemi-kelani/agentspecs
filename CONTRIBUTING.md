# Contributing to Agent Practices

The full guide is the [Contribute](https://agentpractices.io/contribute/) page. This file is the short version.

## Feedback

- **Problems:** open an [issue](https://github.com/yemi-kelani/agentspecs/issues). Examples include a broken link, a claim its ledger row does not support, a missed null result, or a sentence that says more than its source.
- **Evidence we missed:** open an issue with the primary source (the paper, the official documentation or the team's own post) and the finding it reports. A result that contradicts a page is the most useful kind.
- **Questions and ideas:** start a thread in [Discussions](https://github.com/yemi-kelani/agentspecs/discussions).

## How the site changes

The evidence comes first and the pages follow it, so most changes start in the ledger.

1. **Add or correct a row** in `docs/src/data/evidence.json`: the claim, its kind and strength, the primary source, a quote of fewer than 15 words or a locator, a caveat and the date you checked it. Read the full text, not only the abstract. A row the source does not support is dropped with its reason, not deleted. Then run `node scripts/gen-evidence.mjs` from `docs/` to regenerate the Ledger page.
2. **Change the page the row bears on.** If the row contradicts what a page says, the page changes. Put null results and conflicts next to the finding they qualify.
3. **Add a practice page only when verified rows answer its question.** A question with no rows behind it belongs on the Open questions page. Record a new page, a removed page or any change to these rules in `docs/DECISIONS.md`.

Typos, broken links and clearer wording can go straight to a pull request.

## Writing for the site

Run these from `docs/` before you open a pull request:

```bash
npm install                 # once
npm test                    # tests for checks and plugins
npm run check               # content checks
```

From the repository root, `npm test` and `npm run check` forward to `docs/`.

The banned-term check reads a list that only maintainers hold. If you don't have the list, run `AGENTSPECS_BANNED_TERMS=off npm run check`; a maintainer runs the full check before merging.

The page rules follow. The Contribute page and [docs/AGENTS.md](docs/AGENTS.md) give the details.

- Start a claim that reports evidence with `[Evidence]` and link its ledger row. It is the only label.
- Any sentence that recommends something links a verified row. A point no row settles goes to Open questions; there is no other way to pass the check.
- Word each claim to fit its row: one small study is "one study found", documentation describes a product. Do not put strength grades (strong, moderate, weak, anecdotal) on pages; they stay in `evidence.json`.
- Cite primary sources only, never a secondary write-up, newsletter or aggregator.
- Paraphrase; content pages hold no quotes of 15 words or more.
- Write original text, and use made-up examples, never real company or project names.

## License

The site and its content are licensed under the [Apache License 2.0](LICENSE). By contributing, you agree that your contributions are licensed under the same terms.
