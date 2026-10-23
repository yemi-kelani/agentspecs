# Roadmap

Agent Specs is at v0.2 (draft). This file lists what v0.2 leaves out on purpose and the questions no study has tested yet. It is a repository file, not a site page; keep the untested list in step with the site's [Open questions](https://agentspecs.io/evidence/open-questions/) page.

## Out of scope for v0.2

- **Published validator.** `specs-ref/` checks packet structure from a clone. A published package, and a mode that runs the check commands, would come later.
- **GitHub Action.** Runs `specs-ref` on pull requests that touch `packets/`, so a broken packet fails review instead of a later slice.
- **Orchestrator.** A script that injects plan.md and the slice brief, starts sessions, re-injects on a schedule and keeps state.json. v0.2 leaves orchestration to the reader.
- **Example packets.** Worked packets with several slices, a dispute and a replan, beyond the one-slice Quickstart.

## Untested

These are the open questions on the Open questions page. Each would need its own study.

- **The head-to-head.** A packaged spec format, this one or another, against one plan file and against no structure, on medium or hard multi-session work. The Open questions page gives a replication protocol.
- **Multi-file packet against one living plan,** and sharded briefs against one document.
- **Memory-bank files for coding.** Cross-task memory did not help a coding agent in the one study found (ledger R25).
- **JSON against Markdown for state.** Only an unmeasured vendor observation supports JSON (R12c).
- **Structured acceptance wording** (EARS, Given-When-Then) against free-form checks.
- **Plan granularity and reminder frequency.** One study tested one reminder interval, and one model collapsed under it (R9a).
- **A separate verifier on ordinary tasks.** The strong verification rows come from impossible-task stress tests (R18).
- **Whether the context-file and file-size nulls generalise** (R1, R3) to other languages, longer files and task specs.
- **Human review cost** of acceptance-first checks and plan review.
- **Handoff value against token cost,** and how often plans and handoffs go stale in real use.
- **Spec maintenance over time.**
