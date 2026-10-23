# specs-ref

Reference validator for [Agent Specs](https://agentspecs.io) packets, format v0.2 (draft).

> [!IMPORTANT]
> This package demonstrates the structural rules on the [Packet anatomy](https://agentspecs.io/approach/packet-anatomy/) page. It is not a production tool, and it adds no requirements of its own: where it and Packet anatomy disagree, Packet anatomy wins.

## What it checks

`specs-ref` reads files and checks the rules a script can check:

- plan.md: the eight required sections in order; at least one list item under Assumptions and Repo grounding; a Slices table with `ID | Behavior | Check`, two-digit ids, and check files that exist under `acceptance/`.
- slices/: one `NN-<slug>.md` brief per slice, headed `# Slice NN — <name>`, with its seven sections in order and at least one command under Checks.
- acceptance/README.md: Run (with a command), Checks (a table with one row per slice, files matching plan.md, Reviewed by filled in), Hold-outs and Disputes.
- state.json: `packet`, `format`, `updated` and `slices`; each slice's status, `passes`, `failures` and `handoff`; `passes` is true exactly when the slice is done.
- handoffs/: a done slice has `handoffs/NN.md` with the five sections in order, non-empty Check results and `Verdict: PASS`; a disputed slice's handoff has a Dispute section.
- Gates: once a slice leaves pending, plan.md Decisions records a plan review; a slice with two or more failures has a replan line that names it.

It does not run the check commands, compare hold-out hashes or judge the content of a brief. Use the [Checklist](https://agentspecs.io/reference/checklist/) for those.

## Install

Node 22.18 or later; no dependencies. From a clone of this repository:

```bash
npm install --global ./specs-ref    # puts specs-ref on your PATH
```

Or run it without installing: `node specs-ref/src/cli.mjs <command>`.

## Usage

### CLI

```bash
# Check one packet
specs-ref validate packets/csv-export

# Check every packets/<task-id>/ under a repository root
specs-ref validate .

# List the check commands from acceptance/README.md and the slice briefs as JSON (nothing is run)
specs-ref commands packets/csv-export
```

Exit codes: 0 when everything conforms, 1 when there are problems, 2 for a usage error (including a path with no plan.md and no `packets/` folder).

### JavaScript API

```js
import { validatePacket, findPackets } from 'specs-ref';

for (const dir of findPackets('.')) {
  const { errors, commands } = validatePacket(dir);
  if (errors.length) console.log(errors);
}
```

## Development

```bash
npm test
```

## License

Apache License 2.0; see [LICENSE](LICENSE).
