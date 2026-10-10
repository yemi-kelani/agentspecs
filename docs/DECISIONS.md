# Decisions (append-only; one entry per decision, newest last)

## 2026-10-09 — Stack: Astro 7 + Starlight 0.42
- Choice: Astro 7.3.8 with Starlight 0.42.6, static output.
- Why: open source; static HTML; built-in Pagefind search, light/dark, sidebar, TOC and prev/next; component overrides (`components.PageTitle`) and static endpoints (`src/pages/*.md.ts`) cover the Copy page menu and `/<slug>.md` without a custom theme.
- Alternatives: Docusaurus (React/MDX; search needs Algolia or a plugin; heavier client JS). Mintlify-compatible stack (matches agentskills.io exactly, but hosted and proprietary; would push us toward copying their look and config).

## 2026-10-09 — Markdown processor: unified, not Sätteri
- Choice: `markdown.processor: unified({ remarkPlugins: [remarkLabels] })` from `@astrojs/markdown-remark`.
- Why: Astro 7 defaults to Sätteri, which does not run remark plugins. The brief asks for a remark plugin for label badges. Starlight 0.42 supports the unified processor for its asides and heading anchors; `@astrojs/mdx` inherits it, so `.md` and `.mdx` get the same plugin.
- Cost: slower Markdown builds than Sätteri; irrelevant at ~25 pages.

## 2026-10-09 — Fonts self-hosted via Fontsource variable packages
- Choice: `@fontsource-variable/inter` and `@fontsource-variable/jetbrains-mono` in Starlight `customCss`.
- Why: no external font or CDN requests; variable fonts cover all weights in one file per subset.

## 2026-10-09 — Label badges are links
- Choice: `[Established]` etc. render as `<a class="label-link" href="/evidence/#labels" title="..."><span class="label label--established">Established</span></a>`; inside link text the badge is a bare `<span>` with the `title`.
- Why: brief asks for badges that link to the label definitions; nested links are invalid HTML.

## 2026-10-09 — Stub marker in MDX
- Choice: MDX stubs use `{/* <!-- stub: phase N --> */}`.
- Why: MDX rejects HTML comments. The JSX comment keeps the exact `<!-- stub` text, so both the stub check and plain greps find it. The check also accepts `{/* stub`.

## 2026-10-09 — Checks scan prose, not code
- Choice: labels, citations, links and quotes checks ignore fenced and inline code; quotes also ignores frontmatter and attribute values; copy and banned scan everything.
- Why: Templates and examples live in code blocks and may contain URLs, quotes or label-like text that are not claims or citations.

## 2026-10-09 — Citation matching is exact
- Choice: a content URL must equal a verified `sources[].url` string exactly (no trailing-slash or `#fragment` normalisation). The allowlist has exact `urls` and `startsWith` `prefixes`.
- Why: plan.md says "URL equals". Exactness keeps evidence.json the single source of truth.

## 2026-10-09 — Copy menu items limited to four
- Choice: Copy page, View as Markdown, Open in Claude, Open in ChatGPT; generic icons, no vendor logos.
- Why: brief scope; avoids brand marks and any implied affiliation.

## 2026-10-09 — GitHub URL is a pending constant
- Choice: `GITHUB_URL = https://github.com/agentspecs/agentspecs` in `src/consts.mjs`, also listed in `src/data/links-allowlist.json`.
- Why: owner decision pending; one place to change in code (plus the allowlist entry).

## 2026-10-09 — GitHub URL set by owner
- Choice: `GITHUB_URL = https://github.com/yemi-kelani/agentspecs` (supersedes the pending placeholder above). Allowlist and the Quickstart clone command updated to match.
- Why: owner supplied the repository. The Quickstart assumes this folder (with `docs/`) is the repository root.

## 2026-10-10 — Banned terms: list kept outside the repository, repository-wide scan
- Choice: `scripts/checks/banned.mjs` reads a plain term list from outside the repository (`AGENTSPECS_BANNED_TERMS`, default `~/.config/agentspecs/banned-terms.txt`; whole words, case-sensitive) and scans every file `git ls-files -co --exclude-standard` returns for the whole repository; messages print only the term's line in the list. It fails when the list is missing; `AGENTSPECS_BANNED_TERMS=off` skips it with a warning. An earlier version kept unkeyed SHA-256 hashes in the repository; they were removed because hashes of short names can be reversed by guessing.
- Why: the final review found that a plain-text list, and the build records, would publish the very names the check protects. Unkeyed hashes do too: anyone can hash candidate names and compare. A list outside the repository publishes nothing; CI gets it from a secret.

## 2026-10-10 — Review phase, parallel isolation and leak check folded into v0.1
- Choice: three rules added to the v0.1 draft before first publication, each with verified citations.
  - Review phase: required only when plan.md lists more than one phase, so a one-phase task (the Quickstart) stays one agent run. The review phase is a phase file named `phase-<N>-review.md`, so the validator can find it; no separate template, because the Quickstart must fetch every template and has one phase. The worked example lives in Verify and accept.
  - Parallel isolation: separate working copies for concurrent writing phases; optional `env` per phase in state.json, which must not repeat a value for the same name across phases that can run at the same time; shared files belong to the orchestrator; a phase stops only its own processes. The validator now checks disjoint Writes and env values from the Depends on graph.
  - Leak check: a Confidential column (yes or no) in MANIFEST.md; any `yes` requires a Constraints line naming where the term list lives (the validator looks for "term list") and a Global acceptance item with a command and the words "leak check". Term lists stay outside the repository, not even as hashes, and allow lists kept in the repository must not silence the check.
- Why: the owner's evidence review and this site's own build both hit these problems: a parallel session in one checkout, a reviewer that caught what the phases missed, and a hashed term list that could be reversed. Labels follow the verified evidence: the rules are Proposals; vendor support is Established; the self-correction and self-preference studies are Evidence with caveats; what nobody has tested is listed on the Evidence page and in ROADMAP.md.

## 2026-10-10 — Look: match the agentskills.io docs (Mintlify) on Starlight
- Choice: keep Starlight and override PageFrame, TwoColumnContent, Header, Sidebar, PageSidebar, ThemeSelect, Pagination and MobileMenuToggle, with colours, type scale and spacing measured from agentskills.io in both themes (`src/styles/theme.css`). One centred 92rem frame; sidebar groups are flat labelled sections; TOC from 80rem; Expressive Code with agentskills.io's Shiki themes (dark-plus, github-light-default).
- Why: the owner asked for the site to look like agentskills.io. Component overrides keep Starlight's search, mobile menu, TOC tracking and Markdown pipeline.
- Differences kept on purpose: light-mode "current page" text is #6b6b6b (agentskills.io uses #7f7f7f, under 4.5:1); code uses JetBrains Mono (Paper Mono is not packaged on npm); no assistant, star count or chat box; the sidebar shows from 50rem (Starlight's breakpoint), agentskills.io from 64rem.
- Supersedes the 2026-10-09 note that a Mintlify-style look meant copying their config: only measured visual values are reused, no code or text.

## 2026-10-10 — Mark: solid pentagon
- Choice: the favicon is a solid black pentagon in both colour schemes (as agentskills.io's black hexagon); `og.png` uses the same mark in light ink. Generated by `scripts/gen-brand.mjs`.
- Why: owner asked for a plain black shape like agentskills.io's, replacing the index-card mark.

## 2026-10-10 — Picture tests with Playwright
- Choice: `@playwright/test` (dev dependency) with `tests/visual/`: pictures of 4 pages x 4 widths x 2 themes plus components and open states, a geometry spec of the measured numbers, and theme-menu behaviour. `threshold: 0.02`, `maxDiffPixels: 20`.
- Why: a restyle has to be checked by looking; the red-proof deleted the header's 1px hairline and 40 pictures went red. Pictures are rendered on macOS; re-cut on another OS before comparing there.

## 2026-10-10 — Repository layout mirrors the Agent Skills repository
- Choice: the site moved from `docs-site/` to `docs/`. The repository root holds README.md, AGENTS.md (with a CLAUDE.md symlink), CONTRIBUTING.md, ROADMAP.md and a package.json whose scripts forward to `docs/`. Reviewed screenshots moved from `docs/screens/` to `tests/visual/screens/`, so the site folder holds no second `docs/`. The `specsets` check also covers `work/` at the repository root and checks the root AGENTS.md against the Specification.
- Why: owner request, to match the layout of the Agent Skills repository (project files at the root, the site in `docs/`). The copy check's `../research/` path keeps working because the site stays one level down.
