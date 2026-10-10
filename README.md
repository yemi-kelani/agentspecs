# Agent Specs

A convention for writing task specs that coding agents can follow phase by phase. This is draft v0.1.

Agent Specs splits a long agent task into plain files under `work/<task-id>/`: a short plan that stays put, one brief per phase, and a handoff that each phase writes when it stops. A fresh agent runs each phase from its brief alone, proves it with commands, and passes on only what the next phase needs. A person can review every step in the same files.

```
work/<task-id>/
├── plan.md                      stable index, read by every phase
├── phases/phase-<N>-<slug>.md   one brief per phase, ending in verify commands
├── out/phase-<N>/HANDOFF.md     what each phase produced and hands on
├── state.json                   phase status, written only by the orchestrator
├── progress.md                  log, surprises, decisions, retrospective
└── sources/MANIFEST.md          pinned inputs, treated as untrusted data
```

Read the Specification, guides and templates at [agentspecs.io](https://agentspecs.io), and start with the [Quickstart](https://agentspecs.io/quickstart/).

## Repository

| Path | What it holds |
|------|---------------|
| [`docs/`](docs/) | The agentspecs.io site: the Specification, guides, templates (`docs/public/templates/`), evidence data, content checks and the Quickstart example. See [docs/README.md](docs/README.md). |
| [`AGENTS.md`](AGENTS.md) | Instructions for coding agents working in this repository. |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | How to give feedback and propose changes. |
| [`ROADMAP.md`](ROADMAP.md) | What v0.1 leaves out, and the questions no source has tested yet. |

## Develop

Node 22.18 or later.

```bash
cd docs && npm install && cd ..   # once
npm run dev                       # dev server at http://localhost:4321
npm test && npm run check         # tests and content checks
```

## Status

Agent Specs is a draft and may change in incompatible ways before v1.0. It is an independent project, not affiliated with the AGENTS.md or Agent Skills projects or any agent vendor. The license is being finalized.
