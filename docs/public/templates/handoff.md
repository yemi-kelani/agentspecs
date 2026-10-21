# Handoff — Slice <NN>

The implementer fills Changed, Dead ends and Superseded facts when its session ends. The verifier fills Check results and Verification from its own run, then sets passes in state.json.

## Changed
- `<commit>` — <what changed, in one line>

## Dead ends
- <Approach tried> — <why it failed>.

## Superseded facts
- <Line in plan.md or an earlier handoff that is no longer true> — now: <what is true>. The orchestrator retires the old line instead of adding a correction beside it.

## Check results
<Raw output of every check and hold-out, pasted unedited by the verifier, failures included.>

## Verification
Verdict: PASS | FAIL
- Verifier: <session or person other than the implementer>; hold-outs run: <n>; <YYYY-MM-DD>.
