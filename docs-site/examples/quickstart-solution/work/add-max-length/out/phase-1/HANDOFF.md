# Handoff — Phase 1

Status: DONE
Verify: `node --test` → pass: 8 tests, 0 fail (4 new `maxLength` tests failed before the change)

## Produced
- src/slugify.js — `slugify(text, { maxLength })`; cuts at the last hyphen that fits, or at the limit for one long word; RangeError unless `maxLength` is a positive integer
- test/slugify.test.js — 4 new tests: cut at a hyphen, one long word, short input unchanged, invalid values

## Key facts for later phases
- Calls without `maxLength` behave as before; the 4 original tests are unchanged.
- The cut happens after slugifying, so `maxLength` counts slug characters, not input characters.

## Decisions
- Cut at the last hyphen at or before the limit — keeps whole words, as plan.md asks.
- Hard cut when the first word alone is too long — returning an empty slug would break URLs.

## Open issues
- None.

## Sources used
- plan.md, phases/phase-1-max-length.md, src/slugify.js, test/slugify.test.js @ working tree → src/slugify.js, test/slugify.test.js
