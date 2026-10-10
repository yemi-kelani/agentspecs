import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkLabels from '../src/plugins/remark-labels.mjs';
import rehypeTaskListLabels from '../src/plugins/rehype-task-list-labels.mjs';

async function md(source) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkLabels)
    .use(remarkRehype)
    .use(rehypeTaskListLabels)
    .use(rehypeStringify)
    .process(source);
  return String(file);
}

test('wraps a task-list checkbox and its text in a label', async () => {
  const html = await md('- [ ] `plan.md` exists\n- [x] Done');
  assert.match(html, /<li class="task-list-item"><label><input type="checkbox" disabled> <code>plan\.md<\/code> exists<\/label><\/li>/);
  assert.match(html, /<li class="task-list-item"><label><input type="checkbox" checked disabled> Done<\/label><\/li>/);
});

test('keeps a nested list outside the label', async () => {
  const html = await md('- [ ] Parent item\n  - Child item');
  assert.match(html, /<li class="task-list-item"><label><input type="checkbox" disabled> Parent item<\/label>\s*<ul>\s*<li>Child item<\/li>\s*<\/ul>\s*<\/li>/);
});

test('labels the checkbox inside a paragraph of a loose list', async () => {
  const html = await md('- [ ] First\n\n- [ ] Second');
  assert.match(html, /<li class="task-list-item">\s*<p><label><input type="checkbox" disabled> First<\/label><\/p>/);
});

test('keeps label badges and links inside the label', async () => {
  const html = await md('- [ ] [Proposal] See [the spec](/reference/specification/).');
  assert.match(html, /<label><input type="checkbox" disabled> <a class="label-link"[^>]*><span class="label label--proposal">Proposal<\/span><\/a> See <a href="\/reference\/specification\/">the spec<\/a>\.<\/label>/);
});

test('leaves ordinary lists untouched', async () => {
  const html = await md('- Plain item\n- Another');
  assert.ok(!html.includes('<label>'));
});
