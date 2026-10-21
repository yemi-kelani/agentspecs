# Acceptance — <task-id>

Executable checks, written or reviewed by a person before any code exists. Implementers run them and never edit them; only the verifier sets passes in state.json.

## Run
- `<command that runs every check in this folder>` → exit 0

## Checks
| Slice | Files | Written by | Reviewed by |
|-------|-------|------------|-------------|
| 01 | acceptance/<file> | <person or session> | <person> |
| 02 | acceptance/<file> | <person or session> | <person> |

## Hold-outs
- The verifier keeps <n> more checks outside the implementer's workspace, at <location>, and runs them before it sets passes. sha256: <hash of each file>.

## Disputes
- <YYYY-MM-DD> — slice <NN>, <check>: <what the implementer reported> — resolved: <kept, fixed through the plan review gate, or withdrawn>.
