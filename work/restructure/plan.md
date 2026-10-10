# Restructure navigation and concept flow — plan

Medium task: one session, one living plan (Specification, Sizing gate). Commands run from `docs/` unless they start with `cd`.

## Goal
The sidebar reads as a flow: Start, Concepts, Guides, Works with, Reference, Background. Every page sits in it exactly once, every old URL redirects, and no rule in the Specification changes.

## Non-goals
- No change to a MUST, SHOULD or MAY rule, a field name, a section name or the file tree in the Specification. Only links and rationale move.
- No rewrite or split of the Evidence page; link fixes only.
- No change to `public/templates/` or to the SKILL.md rules in the Specification.
- No new claim without a verified source in `src/data/evidence.json`. Moved claims keep their labels and citations.
- No change to `specs-ref/` (the task does not cover a rule it checks).

## Constraints and invariants
- Follow `docs/AGENTS.md`: label tokens, verified citations only, internal links absolute with a trailing slash, 120-line page budget, no 15-word quotes, no text copied from agentskills.io.
- No employer or internal product names anywhere, including this folder and commit messages. The term list lives outside the repository (`~/.config/agentspecs/banned-terms.txt`).
- Branch `restructure-navigation`; small commits, files staged by name; no push.
- Keep the look: only pictures that show the sidebar or a moved page may be re-cut.

## Global acceptance
- [ ] `npm run build` exits 0; the docs collection holds 22 pages, as on main (22 − 1 size-budgets − 2 guides + 2 works-with + 1 concept)
- [ ] `node ../work/restructure/check-sidebar.mjs` exits 0: every page in `src/content/docs/` is in the sidebar exactly once, and llms.txt and llms-full.txt follow sidebar order
- [ ] `npm run check` exits 0 for every check except `specsets` on this folder (see Decision log); `links` reports no broken internal link
- [ ] `dist/specification/index.html`, `dist/guides/agents-md-router/index.html`, `dist/guides/skill-md-triggers/index.html` and `dist/reference/size-budgets/index.html` redirect to the new pages
- [ ] `cd .. && npm test` exits 0
- [ ] `npm run test:visual` exits 0; only pictures changed by the navigation are re-cut, and each is named in the Decision log
- [ ] `npm run check:quickstart` exits 0 (specs-ref validates the Quickstart's spec set)
- [ ] `cd .. && git grep -nE "(^|[^e])/specification/|agentspecs\.io/specification|agents-md-router|skill-md-triggers|size-budgets"` lists only the redirects in `astro.config.mjs` and this plan
- [ ] `npm run check -- --only banned` exits 0 (the banned check scans the whole repository, `work/` included)
- [ ] Each concept page except the last ends with a `Next:` line to the following concept; Overview links to the first concept

## Progress
- [x] (2026-10-10 13:58Z) Baseline on main: 118 tests pass, all 12 checks pass, build makes 23 pages (22 docs + 404), check:quickstart passes.

## Surprises and discoveries
- specs-ref validates every `work/*/plan.md` as a large spec set: `npm run check -- --only specsets` reports 4 problems on this plan (no Phases, Shared definitions, Phases table or state.json). The Specification's Sizing gate says conformance applies in full to large tasks only, so specs-ref, not this plan, disagrees with the Specification.

## Decision log
- 2026-10-10: Keep this plan as a medium plan and leave specs-ref unchanged. Why: the brief forbids a multi-phase spec set, and AGENTS.md allows specs-ref changes only when the task covers the rule. The specsets failure on this folder is reported to the owner as a conflict, not fixed.

## Outcomes and retrospective
