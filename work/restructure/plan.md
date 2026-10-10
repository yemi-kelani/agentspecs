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
- [ ] `cd .. && git grep -nE "(^|[^e])/specification/|agentspecs\.io/specification|agents-md-router|skill-md-triggers|size-budgets"` lists only the redirects in `astro.config.mjs`, this plan and the DECISIONS.md entry that records the move
- [ ] `npm run check -- --only banned` exits 0 (the banned check scans the whole repository, `work/` included)
- [ ] Each concept page except the last ends with a `Next:` line to the following concept; Overview links to the first concept

## Progress
- [x] (2026-10-10 20:58Z) Baseline on main: 118 tests pass, all 12 checks pass, build makes 23 pages (22 docs + 404), check:quickstart passes.
- [x] (2026-10-10 21:00Z) Specification moved to reference/specification; links, length exemption, tests, AGENTS.md, CONTRIBUTING.md and specs-ref README updated; redirect added.
- [x] (2026-10-10 21:01Z) Size budgets folded into Templates as "Budgets"; links updated in specification, write-plan, sizing, checklist, evidence, faq; redirect added.
- [x] (2026-10-10 21:02Z) works-with/agents-md and works-with/agent-skills created from the two guides; guides removed; links updated in specification, index-and-leaves, faq, quickstart; redirects added.
- [x] (2026-10-10 21:04Z) concepts/verification-and-review created (600 words with headings, 544 of prose); Review phase rationale moved out of the Specification; Verify and accept trimmed to task steps.
- [x] (2026-10-10 21:05Z) Sidebar regrouped; Next lines added; llms.txt keeps Background pages under Optional.
- [x] (2026-10-10 21:07Z) 18 sidebar pictures re-cut, geometry spec updated; 76 visual tests pass.
- [x] (2026-10-10 21:08Z) Acceptance run: build 23 pages (22 docs + 404), sidebar helper passes, 11 of 12 checks pass (specsets: this folder), redirects resolve, check:quickstart passes, old-slug grep clean, leak check passes (0 hits in files, work/ and commit messages).

## Surprises and discoveries
- specs-ref validates every `work/*/plan.md` as a large spec set: `npm run check -- --only specsets` reports 4 problems on this plan (no Phases, Shared definitions, Phases table or state.json). The Specification's Sizing gate says conformance applies in full to large tasks only, so specs-ref, not this plan, disagrees with the Specification.
- llms.txt put pages in its Optional section only when they were top-level; with a Background group they would have lost it. `src/lib/llms.mjs` now checks OPTIONAL_PAGES first.
- The geometry spec assumed an unlabelled first sidebar section (first pill at 96 px). With Start labelled, the label takes that slot and the pill sits at 130 px.
- Uncommitted edits by someone else are in the checkout (LICENSE copyright line, docs/.node-version, docs/wrangler.jsonc). Left untouched and unstaged.

## Decision log
- 2026-10-10: Keep this plan as a medium plan and leave specs-ref unchanged. Why: the brief forbids a multi-phase spec set, and AGENTS.md allows specs-ref changes only when the task covers the rule. The specsets failure on this folder is reported to the owner as a conflict, not fixed.
- 2026-10-10: Keep the Specification's "[Heuristic] It SHOULD run on a different model…" bullet. Why: it carries a SHOULD, so moving it would change a rule; its reasoning is restated on the concept page.
- 2026-10-10: Merged duplicate claims when moving rationale (Specification and Verify and accept said the same things). Each moved claim keeps its label and source URL; where the two wordings differed, the fuller caveat was kept.
- 2026-10-10: "What is not shown" says the clear gain came from a sound external verifier (Stechly et al.), not "tests and validators" in general. Why: no verified source here measures gains from tests for reviewers; the broader wording would be a new, unsourced claim.
- 2026-10-10: Dropped from the merged guides, not moved: tool-instruction counts, "keep what the agent cannot infer", "test every line", description wording, third person, no-skill baseline evals and wording fragility. Why: general AGENTS.md or SKILL.md authoring advice owned by those standards. The claims stay in evidence.json and on the Evidence page.
- 2026-10-10: Page count. On main the docs collection holds 22 pages; now 22 (−1 size-budgets, −2 guides, +2 works-with, +1 concept). The brief's "minus 1" for the two guides is net 0, so its formula reads 22 − 1 + 0 + 1 = 22. Astro reports 23 built pages before and after (the 404 included); the four redirects add HTML files it does not count.
- 2026-10-10: Re-cut pictures (navigation only): overview, specification and sizing at 1100 and 1500 px, menu-open 375, copy-menu-open 1500 and search-open 1500, dark and light (18). The same pages at 375 and 700 px did not change.

## Outcomes and retrospective
