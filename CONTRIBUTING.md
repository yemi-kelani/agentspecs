# Contributing to Agent Specs

The full guide is the [Contribute](https://agentspecs.io/contribute/) page. This file is the short version.

## Feedback

- **Problems:** open an [issue](https://github.com/yemi-kelani/agentspecs/issues). Examples include a broken link, a wrong citation, a template that disagrees with the Specification, or a rule that reads two ways.
- **Questions and ideas:** start a thread in [Discussions](https://github.com/yemi-kelani/agentspecs/discussions). Reports from real use help most: what the task was, which agent ran it, and where the phase files helped or got in the way.

## Changing the format

A change to a MUST, SHOULD or MAY rule, or to a file format, goes through three steps:

1. An issue that describes one problem.
2. A discussion that compares the options and links the evidence.
3. One pull request that updates all of these together:
   - the Specification (`docs/src/content/docs/specification.md`)
   - every affected template in `docs/public/templates/`
   - the Templates page and the Quickstart
   - the changelog under Changes in this version

Fixes that leave the format alone can go straight to a pull request. Typos, broken links and clearer wording are examples.

## Writing for the site

Run these from `docs/` before you open a pull request:

```bash
npm install                 # once
npm test                    # tests for checks, plugins and the validator
npm run check               # content checks
npm run check:quickstart    # runs the Quickstart end to end
```

The banned-term check reads a list that only maintainers hold. If you don't have the list, run `AGENTSPECS_BANNED_TERMS=off npm run check`; a maintainer runs the full check before merging.

The page rules follow. The Contribute page and [docs/AGENTS.md](docs/AGENTS.md) give the details.

- Start every non-trivial claim with one label: `[Established]`, `[Evidence]`, `[Heuristic]` or `[Proposal]`.
- Cite only sources marked verified in `docs/src/data/evidence.json`.
- Paraphrase; content pages hold no quotes of 15 words or more.
- Write original text, and use made-up examples, never real company or project names.

## License

The license for the specification, templates and site is being finalized.
