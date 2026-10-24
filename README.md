# Agent Practices

What the evidence says about giving coding agents context, with every claim linked to its source.

Agent Practices gathers published research and documented practice on agent context: how much fits in a context window before quality drops, what instruction files do, how teams share and maintain them, how agents find their way in large codebases, how planning changes with task size, how work survives across sessions, when subagents help, how to check the work, and what to trust. The site describes the shape of good practice that this evidence shows. It does not start from a framework and look for support. Where nothing has been tested, it says so on the Open questions page.

Each claim links a row in the evidence ledger. Each row carries its primary source, a short quote or locator, and a caveat. Skills in depth are covered by [agentskills.io](https://agentskills.io).

Read it at [agentpractices.io](https://agentpractices.io).

## Repository

| Path | What it holds |
|------|---------------|
| [`docs/`](docs/) | The site: pages, the evidence ledger data (`docs/src/data/evidence.json`) and the content checks. See [docs/README.md](docs/README.md). |
| [`AGENTS.md`](AGENTS.md) | The project's purpose and rules, for people and coding agents. |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | How to report evidence we missed and propose changes. |
| [`ROADMAP.md`](ROADMAP.md) | The gaps in the evidence, and what the site needs next. |

## Develop

Node 22.18 or later.

```bash
cd docs && npm install && cd ..   # once
npm run dev                       # dev server at http://localhost:4321
npm test && npm run check         # tests and content checks
```

## Status

Agent Practices is an independent project, not affiliated with the AGENTS.md or Agent Skills projects or any agent vendor. The pages change as new evidence arrives.

## License

The site and its content are licensed under the [Apache License 2.0](LICENSE).
