# Contributing to Agent Specs

The full guide is the [Contribute](https://agentspecs.io/contribute/) page. This file is the short version.

## Feedback

- **Problems:** open an [issue](https://github.com/yemi-kelani/agentspecs/issues). Examples include a broken link, a wrong citation or ledger row, a template that disagrees with Packet anatomy, or a rule that reads two ways.
- **Questions and ideas:** start a thread in [Discussions](https://github.com/yemi-kelani/agentspecs/discussions). Reports from real use help most: what the task was, which agent ran it, and where the slices, checks or handoffs helped or got in the way.

## Changing the format

A change to a rule or a file format goes through three steps:

1. An issue that describes one problem.
2. A discussion that compares the options and links the ledger rows that bear on it.
3. One pull request that updates all of these together:
   - Packet anatomy (`docs/src/content/docs/approach/packet-anatomy.md`), the authority for the format
   - every affected template in `docs/public/templates/`
   - the Templates page and the Quickstart
   - the changelog under Changes in this version
   - `specs-ref/`, when a script can check the rule

Fixes that leave the format alone can go straight to a pull request. Typos, broken links and clearer wording are examples.

## Changing the evidence

Add or correct a row in `docs/src/data/evidence.json`: the claim, its kind and strength, the primary source (never a secondary write-up), a quote of fewer than 15 words or a locator, a caveat and the date you checked it. Then run `node scripts/gen-evidence.mjs` from `docs/` to regenerate the Ledger page. A row the source does not support is dropped with its reason, not deleted.

## Writing for the site

Run these from `docs/` before you open a pull request:

```bash
npm install                 # once
npm test                    # tests for checks and plugins
npm run check               # content checks
npm run check:quickstart    # runs the Quickstart end to end
```

For the validator, run `npm test` in `specs-ref/`. From the repository root, `npm test` runs both test suites.

The banned-term check reads a list that only maintainers hold. If you don't have the list, run `AGENTSPECS_BANNED_TERMS=off npm run check`; a maintainer runs the full check before merging.

The page rules follow. The Contribute page and [docs/AGENTS.md](docs/AGENTS.md) give the details.

- Start a claim that reports evidence with `[Evidence]` and link its ledger row; it is the only label readers see.
- In the source, start what the packet does with `[Proposal]` (it also links a row) and a design choice with `[Judgment]`. The site hides both, but the check reads them: any recommendation links a row or carries one of them.
- Do not put strength grades (strong, moderate, weak, anecdotal) on pages; they stay in `evidence.json`.
- Paraphrase; content pages hold no quotes of 15 words or more.
- Write original text, and use made-up examples, never real company or project names.

## License

The format, templates and site are licensed under the [Apache License 2.0](LICENSE). By contributing, you agree that your contributions are licensed under the same terms.
