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
- Why: owner supplied the repository. The Quickstart assumes this folder (with `docs-site/`) is the repository root.

## 2026-10-10 — Banned terms: list kept outside the repository, repository-wide scan
- Choice: `scripts/checks/banned.mjs` reads a plain term list from outside the repository (`AGENTSPECS_BANNED_TERMS`, default `~/.config/agentspecs/banned-terms.txt`; whole words, case-sensitive) and scans every file `git ls-files -co --exclude-standard` returns for the whole repository; messages print only the term's line in the list. It fails when the list is missing; `AGENTSPECS_BANNED_TERMS=off` skips it with a warning. An earlier version kept unkeyed SHA-256 hashes in the repository; they were removed because hashes of short names can be reversed by guessing.
- Why: the final review found that a plain-text list, and the build records, would publish the very names the check protects. Unkeyed hashes do too: anyone can hash candidate names and compare. A list outside the repository publishes nothing; CI gets it from a secret.
