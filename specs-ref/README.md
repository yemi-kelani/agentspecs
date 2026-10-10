# specs-ref

Reference validator for [Agent Specs](https://agentspecs.io).

> [!IMPORTANT]
> This package demonstrates the Specification's structural rules. It is not a production tool, and it adds no requirements of its own: where it and the [Specification](https://agentspecs.io/specification/) disagree, the Specification wins.

## What it checks

`specs-ref` reads files and checks the rules a script can check:

- AGENTS.md: the required sections, and a Routing row that sends multi-step work to `work/<task-id>/`.
- plan.md, the phase files, the handoffs, state.json, progress.md and sources/MANIFEST.md: required sections in order, the Phases table and its columns, and phase file names.
- The plan table, the `phases/` folder and state.json all describe the same phases. Every `done` phase is verified and has a valid handoff with a Verify line for each command.
- Phases that can run at the same time have no overlapping Writes paths and no shared `env` values. Dependency cycles and unknown dependencies are reported.
- When there is more than one phase, the last is a review phase that depends on every other phase, writes only its own `out/` folder, and re-runs every Global acceptance command.
- A source marked confidential requires a term-list line in Constraints and a leak check command in Global acceptance.

It does not run verify commands, compare source hashes or judge the content of a brief. Use the [Checklist](https://agentspecs.io/reference/checklist/) for those.

## Install

Node 22.18 or later; no dependencies. From a clone of this repository:

```bash
npm install --global ./specs-ref    # puts specs-ref on your PATH
```

Or run it without installing: `node specs-ref/src/cli.mjs <command>`.

## Usage

### CLI

```bash
# Check one spec set
specs-ref validate work/csv-export

# Check a repository: its AGENTS.md and every spec set under work/
specs-ref validate .

# List the verify commands from plan.md and the phase files as JSON (nothing is run)
specs-ref commands work/csv-export
```

Exit codes: 0 when everything conforms, 1 when there are problems, 2 for a usage error.

### JavaScript API

```js
import { validateSpecSet, validateAgentsMd } from 'specs-ref';
import { readFileSync } from 'node:fs';

const { errors, verify } = validateSpecSet('work/csv-export');
if (errors.length) console.log(errors);

const agentsErrors = validateAgentsMd(readFileSync('AGENTS.md', 'utf8'));
```

## Development

```bash
npm test
```

## License

Apache License 2.0; see [LICENSE](LICENSE).
