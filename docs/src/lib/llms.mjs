// llms.txt (https://llmstxt.org) and llms-full.txt, built from the docs collection in sidebar order.
// Used by src/pages/llms.txt.ts and src/pages/llms-full.txt.ts. Page text comes from the same
// export as /<slug>.md (pageToMarkdown), so the three formats never drift apart.
import { pageToMarkdown } from './markdown.ts';
import { mdPathFor } from './paths.mjs';
import { sidebarPages } from '../sidebar.mjs';

/** Pages an agent can skip when context is short: the llms.txt "Optional" section, whatever their sidebar group. */
export const OPTIONAL_PAGES = new Set(['comparison', 'evidence', 'faq', 'contribute']);
const DOCS = 'Docs';
const OPTIONAL = 'Optional';

/**
 * Docs entries in sidebar order, each tagged with its llms.txt section: "Optional" for OPTIONAL_PAGES,
 * else the sidebar group label, or "Docs" for top-level pages. Entries the sidebar does not list go last, as Optional.
 * @param {Array<{ id: string }>} entries docs collection entries (404 excluded by the caller)
 */
export function orderPages(entries) {
  const byId = new Map(entries.map((e) => [e.id, e]));
  const pages = [];
  for (const { slug, group } of sidebarPages()) {
    const entry = byId.get(slug);
    if (!entry) continue;
    byId.delete(slug);
    pages.push({ entry, section: OPTIONAL_PAGES.has(slug) ? OPTIONAL : (group ?? DOCS) });
  }
  const rest = [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
  return [...pages, ...rest.map((entry) => ({ entry, section: OPTIONAL }))];
}

/** One page as standalone Markdown, identical to its /<slug>.md export. */
export function entryMarkdown(entry) {
  return pageToMarkdown({
    title: entry.data.title,
    description: entry.data.description,
    body: entry.body ?? '',
    format: entry.filePath?.endsWith('.mdx') ? 'mdx' : 'md',
  });
}

/**
 * llms.txt: H1, one-line summary, a pointer to llms-full.txt, then one H2 section per sidebar group
 * listing `- [Title](<site>/<slug>.md): description`. "Optional" is always the last section.
 */
export function llmsTxt(entries, { title, site, version }) {
  const pages = orderPages(entries);
  const home = pages.find((p) => p.entry.id === 'index')?.entry;
  const sections = new Map();
  for (const { entry, section } of pages) {
    if (!sections.has(section)) sections.set(section, []);
    sections.get(section).push(entry);
  }
  const names = [...sections.keys()].sort((a, b) => Number(a === OPTIONAL) - Number(b === OPTIONAL));
  const url = (path) => new URL(path, site).href;

  const lines = [`# ${title}`, ''];
  if (home?.data.description) lines.push(`> ${home.data.description} Specification ${version}.`, '');
  lines.push(
    `Each link is the Markdown version of a page on ${url('/')}. All pages in one file: ${url('/llms-full.txt')}`,
  );
  for (const name of names) {
    lines.push('', `## ${name}`, '');
    for (const e of sections.get(name)) {
      lines.push(`- [${e.data.title}](${url(mdPathFor(e.id))})` + (e.data.description ? `: ${e.data.description}` : ''));
    }
  }
  return lines.join('\n') + '\n';
}

/** llms-full.txt: every page's Markdown export in sidebar order, separated by thematic breaks. */
export function llmsFullTxt(entries) {
  return orderPages(entries)
    .map(({ entry }) => entryMarkdown(entry))
    .join('\n---\n\n');
}
