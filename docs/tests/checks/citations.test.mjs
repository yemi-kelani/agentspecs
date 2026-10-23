import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeSite, page, check, messages } from './helpers.mjs';

const evidence = JSON.stringify({
  sources: [
    { id: 's1', url: 'https://example.com/study', status: 'verified' },
    { id: 's2', url: 'https://example.com/unverified', status: 'pending' },
  ],
  claims: [],
});
const allowlist = JSON.stringify({
  urls: ['https://agentskills.io', 'https://github.com/agentspecs/agentspecs'],
  prefixes: ['https://agentskills.io/'],
});

test('passes verified sources, allowlisted URLs and prefixes; ignores code', async () => {
  const root = makeSite({
    'src/data/evidence.json': evidence,
    'src/data/links-allowlist.json': allowlist,
    'src/content/docs/a.md': page(
      '[Evidence] See [the study](https://example.com/study).\n\nRelated: <https://agentskills.io>, [spec](https://agentskills.io/specification), [repo](https://github.com/agentspecs/agentspecs).\n\n```sh\ncurl https://not-checked.example/\n```\n\nInline `https://also-not-checked.example/` too.',
    ),
  });
  const r = await check('citations', root);
  assert.deepEqual(r.errors, [], messages(r));
});

test('fails unknown and unverified URLs, including bare URLs and JSX href', async () => {
  const root = makeSite({
    'src/data/evidence.json': evidence,
    'src/data/links-allowlist.json': allowlist,
    'src/content/docs/a.md': page('[x](https://example.com/unverified)\n\nBare https://unknown.example/page here.'),
    'src/content/docs/b.mdx': page('<LinkCard title="X" href="https://other.example/" />'),
  });
  const r = await check('citations', root);
  const text = messages(r);
  assert.match(text, /a\.md:6 .*https:\/\/example\.com\/unverified/);
  assert.match(text, /a\.md:8 .*https:\/\/unknown\.example\/page/);
  assert.match(text, /b\.mdx:6 .*https:\/\/other\.example\//);
  assert.equal(r.errors.length, 3);
});

test('matching is exact: a different path or trailing slash is not a citation', async () => {
  const root = makeSite({
    'src/data/evidence.json': evidence,
    'src/data/links-allowlist.json': allowlist,
    'src/content/docs/a.md': page('[x](https://example.com/study/) and [y](https://github.com/agentspecs/agentspecs/issues)'),
  });
  const r = await check('citations', root);
  assert.equal(r.errors.length, 2, messages(r));
});

test('fails clearly when evidence.json is missing', async () => {
  const root = makeSite({ 'src/data/evidence.json': null, 'src/content/docs/a.md': page('x') });
  const r = await check('citations', root);
  assert.match(messages(r), /evidence\.json/);
});

test('ledger row links must name a verified row', async () => {
  const rows = JSON.stringify({
    sources: [],
    claims: [
      { id: 'c1', row: 'R1', status: 'verified' },
      { id: 'c2', row: 'R2', status: 'dropped', drop_reason: 'duplicate of R1' },
      { id: 'c3', status: 'verified' },
      { id: 'c4', row: 'R1a', status: 'verified' },
    ],
  });
  const root = makeSite({
    'src/data/evidence.json': rows,
    'src/content/docs/a.md': page(
      '[Evidence] ok ([R1](/evidence/ledger/#r1)).\n\n[Evidence] dropped ([R2](/evidence/ledger/#r2)).\n\n[Evidence] unknown ([R9](/evidence/ledger/#r9)).\n\n`/evidence/ledger/#r9` in code is ignored.\n\n[Evidence] suffix ok ([R1a](/evidence/ledger/#r1a)), suffix unknown ([R1b](/evidence/ledger/#r1b)).',
    ),
  });
  const r = await check('citations', root);
  const text = messages(r);
  assert.match(text, /a\.md:8 ledger row R2 is dropped, not verified \(duplicate of R1\)/);
  assert.match(text, /a\.md:10 ledger row R9 is not in src\/data\/evidence\.json/);
  assert.match(text, /a\.md:14 ledger row R1b is not in/);
  assert.equal(r.errors.length, 3, text);
});
