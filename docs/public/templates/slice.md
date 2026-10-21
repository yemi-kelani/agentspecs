# Slice <NN> — <name>

The orchestrator injects this brief and plan.md at the start of the session and again at each reminder. It is written to be read cold: everything the slice needs is here or in plan.md.

## Objective
<One sentence: what this slice adds and why the goal needs it.>

## Behavior
<The one behavior that is true when this slice is done, stated so that a check can decide it.>

## Requirements
- <Explicit requirement that makes sense without the conversation that produced it.>

## Files and APIs
- Touch: `<path>` — <what changes>
- Use: `<API or abstraction from Repo grounding>`
- Never edit: `acceptance/`, `state.json`, other slices' files.

## Checks
- `<command>` → <expected result>
- Test map: <acceptance file> decides <behavior>; <test file> covers <part>.

## Out of scope
- <What this slice leaves alone, and the slice that owns it.>

## Report
- Write handoffs/<NN>.md from the handoff template: fill Changed, Dead ends and Superseded facts, and leave Check results and Verification to the verifier.
- If a check looks wrong, stop and add a Dispute section to handoffs/<NN>.md that names the check and says why. Never edit the check.
- Leave state.json alone; the verifier sets passes.
