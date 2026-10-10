import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pageToMarkdown, mdxToMarkdown } from '../src/lib/markdown.ts';
import { splitFences, maskCode, splitFrontmatter, isStub } from '../src/lib/md-utils.mjs';

test('md page: title, description quote, body with frontmatter removed', () => {
  const out = pageToMarkdown({
    title: 'Specification',
    description: 'The format.',
    body: '---\ntitle: Specification\n---\n\n## Scope\n\n[Proposal] One file.\n',
    format: 'md',
  });
  assert.equal(out, '# Specification\n\n> The format.\n\n## Scope\n\n[Proposal] One file.\n');
});

test('md page without description omits the quote line', () => {
  assert.equal(pageToMarkdown({ title: 'T', body: 'Hi.', format: 'md' }), '# T\n\nHi.\n');
});

test('drops HTML comments outside code but keeps them inside fences', () => {
  const out = pageToMarkdown({
    title: 'T',
    description: 'D.',
    body: '<!-- stub: phase 3 -->\n\nText.\n\n```html\n<!-- keep -->\n```\n',
    format: 'md',
  });
  assert.equal(out, '# T\n\n> D.\n\nText.\n\n```html\n<!-- keep -->\n```\n');
});

test('stub-only page exports just the header', () => {
  const out = pageToMarkdown({ title: 'T', description: 'D.', body: '\n<!-- stub: phase 4 -->\n', format: 'md' });
  assert.equal(out, '# T\n\n> D.\n');
});

test('converts Starlight asides to blockquotes', () => {
  const out = pageToMarkdown({ title: 'T', body: ':::tip[Fast path]\nUse the template.\n:::\n\n:::caution\nCareful.\n:::', format: 'md' });
  assert.equal(out, '# T\n\n> **Tip: Fast path**\n>\n> Use the template.\n\n> **Caution**\n>\n> Careful.\n');
});

test('mdx: drops imports and MDX comments, converts cards to lists', () => {
  const body = [
    "import { Card, CardGrid, LinkCard } from '@astrojs/starlight/components';",
    '',
    '{/* <!-- stub: phase 7 --> */}',
    '',
    'Intro with [Established] label.',
    '',
    '<CardGrid>',
    '\t<LinkCard title="Quickstart" href="/quickstart/" description="Run it in five minutes." />',
    '\t<LinkCard',
    '\t\ttitle="Specification"',
    '\t\thref="/reference/specification/"',
    '\t/>',
    '</CardGrid>',
    '',
    '<CardGrid>',
    '\t<Card title="Plan" icon="document">',
    '\t\tOne index file.',
    '\t</Card>',
    '</CardGrid>',
  ].join('\n');
  const out = mdxToMarkdown(body);
  assert.equal(
    out,
    [
      'Intro with [Established] label.',
      '',
      '- [Quickstart](/quickstart/): Run it in five minutes.',
      '- [Specification](/reference/specification/)',
      '',
      '- **Plan**: One index file.',
      '',
    ].join('\n'),
  );
});

test('mdx page uses the same header', () => {
  const out = pageToMarkdown({ title: 'Home', description: 'D.', body: "import X from 'y';\n\nHello.", format: 'mdx' });
  assert.equal(out, '# Home\n\n> D.\n\nHello.\n');
});

test('splitFences handles nested fence lengths and tildes', () => {
  const segs = splitFences('a\n````md\n```js\nx\n```\n````\nb\n~~~\ny\n~~~');
  assert.deepEqual(
    segs.map((s) => [s.code, s.code ? s.body : s.text]),
    [
      [false, 'a'],
      [true, '```js\nx\n```\n'],
      [false, 'b'],
      [true, 'y\n'],
    ],
  );
});

test('maskCode blanks code but keeps line count', () => {
  const src = 'x `[Evidence]` y\n```\n[Proposal]\n```\nz';
  const masked = maskCode(src);
  assert.equal(masked.split('\n').length, src.split('\n').length);
  assert.doesNotMatch(masked, /Evidence|Proposal/);
  assert.match(masked, /^x .* y\n/);
});

test('splitFrontmatter and isStub', () => {
  const { frontmatter, body, bodyStartLine } = splitFrontmatter('---\ntitle: A\n---\nBody\n');
  assert.equal(frontmatter, 'title: A');
  assert.equal(body, 'Body\n');
  assert.equal(bodyStartLine, 4);
  assert.ok(isStub('<!-- stub: phase 3 -->'));
  assert.ok(isStub('{/* stub: phase 7 */}'));
  assert.ok(!isStub('A stub is a placeholder.'));
});

test('mdx: Steps, Tabs, Aside, Badge and code inside components', () => {
  const body = [
    "import { Steps, Tabs, TabItem, Aside, Badge } from '@astrojs/starlight/components';",
    '',
    '<Steps>',
    '1. Copy the templates.',
    '2. Run the check.',
    '</Steps>',
    '',
    '<Tabs>',
    '<TabItem label="npm">',
    '```sh',
    'npm run check',
    '```',
    '</TabItem>',
    '</Tabs>',
    '',
    '<Aside type="tip" title="Fast">',
    'Use the <Badge text="new" /> template.',
    '</Aside>',
  ].join('\n');
  assert.equal(
    mdxToMarkdown(body),
    [
      '1. Copy the templates.',
      '2. Run the check.',
      '',
      '**npm**',
      '',
      '```sh',
      'npm run check',
      '```',
      '',
      '> **Tip: Fast**',
      '>',
      '> Use the new template.',
      '',
    ].join('\n'),
  );
});
