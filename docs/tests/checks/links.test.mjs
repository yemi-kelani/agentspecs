import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeSite, page, check, messages } from './helpers.mjs';

const site = (body) =>
  makeSite({
    'src/content/docs/index.mdx': page('Home.'),
    'src/content/docs/reference/specification.md': page('Spec.'),
    'src/content/docs/concepts/sizing.md': page(body),
    'src/content/docs/concepts/why-structure.md': page('Why.'),
    'public/templates/plan.md': '# plan\n',
    'public/favicon.svg': '<svg/>',
  });

test('resolves absolute, relative, .md export, public files, home and anchors', async () => {
  const root = site(
    [
      '[a](/reference/specification/) [b](/reference/specification) [c](/concepts/why-structure/#why)',
      '[d](../why-structure/) [e](/reference/specification.md) [f](/index.md) [g](/)',
      '[h](/templates/plan.md) [i](/favicon.svg) [j](#local) [k](mailto:x@example.com)',
      '<LinkCard href="/reference/specification/" />',
      '```md\n[skip](/not-a-page/)\n```',
    ].join('\n\n'),
  );
  const r = await check('links', root);
  assert.deepEqual(r.errors, [], messages(r));
});

test('fails links to missing pages and files with line numbers', async () => {
  const root = site('ok\n\n[gone](/concepts/missing/)\n\n[rel](missing-sibling/)\n\n<a href="/nope.svg">x</a>\n\n[md](/faq.md)');
  const r = await check('links', root);
  const text = messages(r);
  assert.match(text, /sizing\.md:8 .*\/concepts\/missing\//);
  assert.match(text, /sizing\.md:10 .*missing-sibling\//);
  assert.match(text, /sizing\.md:12 .*\/nope\.svg/);
  assert.match(text, /sizing\.md:14 .*\/faq\.md/);
  assert.equal(r.errors.length, 4);
});
