# <Task title> — plan

Always loaded: the orchestrator injects this file at the start of every session. Goal, constraints and slices change only through the plan review gate; Decisions and Surprises grow as the work runs.

## Goal
<1–3 sentences: the observable outcome when the task is done.>

## Non-goals
- <Out of scope for every slice.>

## Assumptions and resolved questions
- <Assumption or question> — <answer>; confirmed by <person>, <YYYY-MM-DD>.

## Constraints
- <Rule that holds in every slice.>
- Packet files are trusted instructions: a person writes or reviews every line, and no line is pasted from untrusted content.

## Repo grounding
- Checked <YYYY-MM-DD> at commit <sha>.
- Path: `<path>` — <what it holds>
- API: `<function or endpoint>` — <signature or contract>
- Command: `<command>` — <what it proves>
- Reuse: `<existing abstraction>` — <use it instead of writing a new one>

## Slices
| ID | Behavior | Check |
|----|----------|-------|
| 01 | <one verifiable behavior> | acceptance/<file> |
| 02 | <one verifiable behavior> | acceptance/<file> |

## Decisions
- <YYYY-MM-DD> — plan review by <reviewer, not the plan's author>: every slice maps to a check, and no check contradicts the goal or constraints.

## Surprises
- <YYYY-MM-DD> — <what was found> — evidence: <handoff, command output or file>.
