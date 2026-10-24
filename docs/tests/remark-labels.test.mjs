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
  `<a class="label-link" href="/evidence/method/#labels" title="${name}: ${def}"><span class="label label--${kind}">${name}</span></a>`;

test('renders [Evidence] at the start of a paragraph as a linked badge', async () => {
  const html = await md('[Evidence] Agents read files.');
  assert.equal(html, `<p>${badge('evidence', 'Evidence', 'What the linked ledger rows report.')} Agents read files.</p>`);
});

test('leaves retired tokens as plain text', async () => {
  const html = await md('[Established] a. [Heuristic] b. [Proposal] c. [Judgment] d.');
  assert.doesNotMatch(html, /class="label/);
  assert.match(html, /\[Proposal\] c\. \[Judgment\] d\./);
});

test('renders [Evidence] in list items and table cells', async () => {
  const html = await md('- Keep it short.\n- [Evidence] A study.\n\n| Claim | Note |\n| --- | --- |\n| [Evidence] One file. | x |\n');
  assert.match(html, /<li>Keep it short\.<\/li>/);
  assert.match(html, /<li><a class="label-link"[^>]*><span class="label label--evidence">Evidence<\/span><\/a> A study\.<\/li>/);
  assert.match(html, /<td><a class="label-link"[^>]*><span class="label label--evidence">Evidence<\/span><\/a> One file\.<\/td>/);
});

test('renders labels inside emphasis', async () => {
  const html = await md('**[Evidence] Bold claim.**');
  assert.match(html, /<strong><a class="label-link"[^>]*><span class="label label--evidence">Evidence<\/span><\/a> Bold claim\.<\/strong>/);
});

test('leaves near-misses as plain text', async () => {
  const html = await md('[evidence] one. [Judgment ] two. [PROPOSAL] three.');
  assert.doesNotMatch(html, /class="label/);
  assert.match(html, /\[evidence\] one\. \[Judgment \] two\. \[PROPOSAL\] three\./);
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
  const out = String(await compile('[Evidence] A study.', { remarkPlugins: [remarkLabels] }));
  assert.match(out, /"label label--evidence"/);
  assert.match(out, /"\/evidence\/method\/#labels"/);
});
