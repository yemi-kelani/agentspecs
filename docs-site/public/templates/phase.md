# Phase <N> — <slug>

## Objective
<One paragraph: what this phase produces and why the goal needs it.>

## Inputs
- plan.md
- <path>

## Boundaries
- In scope: <…>
- Out of scope: <… (owned by phase M)>
- Write only to out/phase-<N>/ and <declared paths>.

## Tools and permissions
- Allowed: <reads, commands>
- Not allowed: <network, pushes, writes elsewhere>

## Steps
1. <…>
2. <…>

## Output contract
- out/phase-<N>/HANDOFF.md, following the HANDOFF template
- <path> — <contents, size limit, format>

## Verify
- `<command>` → <expected output or exit code>

## Stop conditions
- Set Status: BLOCKED in HANDOFF.md and stop if <inputs are missing, plan.md is contradicted, verify cannot pass>.
