import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeSite, page, check, messages } from './helpers.mjs';

const words = (n) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ');

test('flags straight and curly double-quoted spans of 15+ words', async () => {
  const root = makeSite({
    'src/content/docs/a.md': page(`[Proposal] They said "${words(15)}" once.\n\nAlso “${words(8)}\n${words(8)}” across lines.`),
  });
  const r = await check('quotes', root);
  const text = messages(r);
  assert.equal(r.errors.length, 2, text);
  assert.match(text, /a\.md:6 .*15 words/);
  assert.match(text, /a\.md:8 .*16 words/);
});

test('passes short quotes, code, and a long quoted frontmatter description', async () => {
  const root = makeSite({
    'src/content/docs/a.md':
      `---\ntitle: A\ndescription: "${words(20)}."\n---\n\n` +
      `[Proposal] Short "${words(14)}" quote.\n\n\`"${words(20)}"\`\n\n\`\`\`json\n{"k": "${words(20)}"}\n\`\`\`\n\n"a" then ${words(20)} then "b".\n`,
  });
  const r = await check('quotes', root);
  assert.deepEqual(r.errors, [], messages(r));
});
