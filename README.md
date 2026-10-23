# Agent Specs

A spec packet for coding agents on medium-to-hard work, built from published research and leading practice. This is draft v0.2.

A packet is a folder of plain files that carries one task from a clarified goal to verified slices. A person confirms the assumptions and reviews the plan; checks are written before code and the implementer cannot edit them; each slice is one verifiable behavior, built in a fresh session from a self-contained brief; a separate verifier runs the checks and hold-outs and is the only one that marks a slice as passing; and each handoff keeps raw check output and dead ends while retiring facts that stopped being true.

```
packets/<task-id>/
├── plan.md            always loaded: goal, assumptions, repo grounding, slices, decisions, surprises
├── acceptance/        checks written before code; hold-outs stay with the verifier
├── slices/NN-name.md  one self-contained brief per slice
├── state.json         slice status; only the verifier sets passes
└── handoffs/NN.md     what changed, raw check results, dead ends, superseded facts
```

Every claim on the site links a graded row in the evidence ledger or is labelled a judgment call. The packet as a whole has not been tested head to head; the site's Open questions page describes that experiment. Read it at [agentspecs.io](https://agentspecs.io), and start with the [Quickstart](https://agentspecs.io/quickstart/).

## Repository

| Path | What it holds |
|------|---------------|
| [`docs/`](docs/) | The agentspecs.io site: pages, the five templates (`docs/public/templates/`), the evidence ledger data (`docs/src/data/evidence.json`), content checks and the Quickstart example. See [docs/README.md](docs/README.md). |
| [`specs-ref/`](specs-ref/) | Reference validator: checks packets against Packet anatomy's structural rules. See [specs-ref/README.md](specs-ref/README.md). |
| [`AGENTS.md`](AGENTS.md) | Instructions for coding agents working in this repository. |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | How to give feedback and propose changes. |
| [`ROADMAP.md`](ROADMAP.md) | What v0.2 leaves out, and the questions no study has tested yet. |

## Develop

Node 22.18 or later.

```bash
cd docs && npm install && cd ..   # once
npm run dev                       # dev server at http://localhost:4321
npm test && npm run check         # tests and content checks
npm run validate                  # specs-ref on every packets/<task-id>/ in this repository
```

## Status

Agent Specs is a draft and may change in incompatible ways before v1.0. It is an independent project, not affiliated with the AGENTS.md or Agent Skills projects or any agent vendor. Ideas borrowed from other formats are credited on the site.

## License

The format, templates and site are licensed under the [Apache License 2.0](LICENSE).
