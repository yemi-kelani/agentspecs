---
title: Packet anatomy
description: The files in a spec packet, the sections each one needs, and the rules a validator checks.
---

[Judgment] This page is the authority for the packet format. The templates, the Quickstart and the reference validator, [specs-ref](https://github.com/yemi-kelani/agentspecs/tree/main/specs-ref), follow it; where they disagree with it, they are wrong. Every rule below is a [Judgment] design choice unless it links a ledger row. The keywords **must** and **must not** mark what specs-ref checks.

## Files

```text
packets/<task-id>/
├── plan.md
├── acceptance/
│   ├── README.md
│   └── <check files>
├── slices/
│   └── NN-<slug>.md
├── state.json
└── handoffs/
    └── NN.md
```

- [Judgment] A packet lives at `packets/<task-id>/` in the repository it changes, and the folder name is the task id. File names are conventions, not findings.
- [Judgment] Slice ids are two digits (`01`, `02`). A slice brief's file name starts with its id.

## plan.md

[Judgment] The always-loaded file. It must have these `##` sections, in this order: **Goal**, **Non-goals**, **Assumptions and resolved questions**, **Constraints**, **Repo grounding**, **Slices**, **Decisions**, **Surprises**. Assumptions and Repo grounding must each hold at least one list item.

- [Judgment] Slices must hold a table with the columns `ID | Behavior | Check`. Each Check cell names one or more files under `acceptance/` that exist.
- [Proposal] Decisions and Surprises are living logs, borrowed from ExecPlans ([R29](/evidence/ledger/#r29)). Goal, constraints and the slice table change only through the plan review gate.

## acceptance/

[Judgment] Executable checks plus a README. The README must have **Run** (at least one command, as a list item starting with a code span), **Checks** (a table with `Slice | Files | Written by | Reviewed by`, one row per slice, files matching plan.md, Reviewed by filled in), **Hold-outs** and **Disputes**.

- [Proposal] The implementer never edits `acceptance/`; editable tests invite cheating ([R18](/evidence/ledger/#r18)).
- [Proposal] Hold-outs live outside the implementer's workspace and the README records their hashes ([R18b](/evidence/ledger/#r18b)). [Evidence] Held-out tests added little over an LLM judge in one benchmark ([R19](/evidence/ledger/#r19)), so treat them as one safeguard, not proof.

## slices/NN-slug.md

[Judgment] One self-contained brief per slice, headed `# Slice NN — <name>`, with the sections **Objective**, **Behavior**, **Requirements**, **Files and APIs**, **Checks**, **Out of scope** and **Report**, in that order. Checks must list at least one command as a code span.

- [Proposal] The brief is written to be read cold, because the orchestrator injects it into a fresh session ([R14d](/evidence/ledger/#r14d), [R13](/evidence/ledger/#r13)).

## state.json

```json
{ "packet": "<task-id>", "format": "agentspecs packet v0.2", "updated": "YYYY-MM-DDTHH:MMZ",
  "slices": [{ "id": "01", "brief": "slices/01-<name>.md", "status": "pending", "passes": false, "failures": 0, "handoff": null }] }
```

- [Judgment] `packet` must equal the folder name; `status` is one of `pending`, `in_progress`, `disputed`, `blocked`, `done`.
- [Judgment] `passes` is true exactly when `status` is `done`, and a done slice must have `handoffs/NN.md` with a `Verdict: PASS` line.
- [Proposal] Only the verifier sets `passes`. The idea of a passes-only field comes from Anthropic's harness, where the coding agent set it itself ([R12b](/evidence/ledger/#r12b)); moving it to a separate verifier is this packet's change, from [R18](/evidence/ledger/#r18) and [R95](/evidence/ledger/#r95).
- [Judgment] JSON rather than Markdown because a script can read it. Anthropic's preference for JSON rests on an unmeasured observation ([R12c](/evidence/ledger/#r12c)).

## handoffs/NN.md

[Judgment] Headed `# Handoff — Slice NN`, with **Changed**, **Dead ends** and **Superseded facts** (filled by the implementer), then **Check results** and **Verification** (filled by the verifier), in that order. Check results must not be empty. A disputed slice's handoff must add a `## Dispute` section with at least one list item.

## Gates

- [Judgment] Once any slice leaves `pending`, plan.md Decisions must contain an entry with the words "plan review".
- [Judgment] A slice with `failures` of 2 or more must have a Decisions line with the word "replan" that names the slice id.

## Conformance

[Judgment] A packet conforms when every **must** above holds. `specs-ref validate packets/<task-id>` checks structure only; it lists the commands from acceptance/README.md Run and each slice's Checks but does not run them.

## Changes in this version

- `v0.2 (draft)`: replaces the v0.1 spec set. Phases become slices (one verifiable behavior each); `work/<task-id>/` becomes `packets/<task-id>/`; `phases/`, `progress.md`, `out/phase-N/HANDOFF.md` and `sources/MANIFEST.md` give way to `slices/`, `acceptance/`, `handoffs/` and a plan.md with Assumptions, Repo grounding, Decisions and Surprises. Adds the plan review and replan gates, the verifier-only `passes` rule and the dispute rule. Drops the size budgets, the fixed review phase, the AGENTS.md and SKILL.md rules, and the confidential-source leak check, none of which a ledger row supported as a rule.
- `v0.1 (draft)`: first public draft.
