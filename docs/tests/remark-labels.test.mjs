import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { compile } from '@mdx-js/mdx';
import remarkLabels from '../src/plugins/remark-labels.mjs';

async function md(source) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkLabels)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(source);
  return String(file);
}

const badge = (kind, name, def) =>
  `<a class="label-link" href="/evidence/#labels" title="${name}: ${def}"><span class="label label--${kind}">${name}</span></a>`;

test('renders a label at the start of a paragraph as a linked badge', async () => {
  const html = await md('[Established] Agents read files.');
  assert.equal(
    html,
    `<p>${badge('established', 'Established', 'Vendor docs or multiple sources.')} Agents read files.</p>`,
  );
});

test('renders all four kinds with their own class', async () => {
  const html = await md('[Established] a. [Evidence] b. [Heuristic] c. [Proposal] d.');
  for (const kind of ['established', 'evidence', 'heuristic', 'proposal']) {
    assert.match(html, new RegExp(`class="label label--${kind}"`));
  }
  assert.doesNotMatch(html, /\[(Established|Evidence|Heuristic|Proposal)\]/);
});

test('renders labels in list items and table cells', async () => {
  const html = await md('- [Heuristic] Keep it short.\n\n| Claim | Note |\n| --- | --- |\n| [Proposal] One file. | x |\n');
  assert.match(html, /<li><a class="label-link"[^>]*><span class="label label--heuristic">Heuristic<\/span><\/a> Keep it short\.<\/li>/);
  assert.match(html, /<td><a class="label-link"[^>]*><span class="label label--proposal">Proposal<\/span><\/a> One file\.<\/td>/);
});

test('renders labels inside emphasis', async () => {
  const html = await md('**[Evidence] Bold claim.**');
  assert.match(html, /<strong><a class="label-link"[^>]*><span class="label label--evidence">Evidence<\/span><\/a> Bold claim\.<\/strong>/);
});

test('leaves near-misses as plain text', async () => {
  const html = await md('[established] one. [Heuristic ] two. [PROPOSAL] three.');
  assert.doesNotMatch(html, /class="label/);
  assert.match(html, /\[established\] one\. \[Heuristic \] two\. \[PROPOSAL\] three\./);
});

test('leaves tokens in inline code and fenced code untouched', async () => {
  const html = await md('Write `[Proposal]` first.\n\n```md\n[Evidence] in code\n```\n');
  assert.doesNotMatch(html, /class="label/);
  assert.match(html, /<code>\[Proposal\]<\/code>/);
  assert.match(html, /\[Evidence\] in code/);
});

test('does not nest a link inside link text', async () => {
  const html = await md('[see [Evidence] here](https://example.com/)');
  assert.match(html, /<a href="https:\/\/example.com\/">see <span class="label label--evidence" title="Evidence: [^"]+">Evidence<\/span> here<\/a>/);
  assert.doesNotMatch(html, /label-link/);
});

test('works in MDX', async () => {
  const out = String(await compile('[Heuristic] Rule of thumb.', { remarkPlugins: [remarkLabels] }));
  assert.match(out, /"label label--heuristic"/);
  assert.match(out, /"\/evidence\/#labels"/);
});
