// Usage (from docs/, after `npm run build`): node ../work/restructure/check-sidebar.mjs
// Fails unless every page in src/content/docs/ is in the sidebar exactly once and
// dist/llms.txt and dist/llms-full.txt list the pages in sidebar order.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { sidebarPages } from '../../docs/src/sidebar.mjs';

const CONTENT = 'src/content/docs';
const walk = (dir) =>
	readdirSync(dir).flatMap((n) => {
		const p = join(dir, n);
		return statSync(p).isDirectory() ? walk(p) : [p];
	});
const files = walk(CONTENT)
	.filter((p) => /\.mdx?$/.test(p))
	.map((p) => relative(CONTENT, p).replace(/\.mdx?$/, ''));

const order = sidebarPages().map((p) => p.slug);
let failures = 0;
const fail = (msg) => {
	console.error(msg);
	failures++;
};

for (const slug of new Set(order)) {
	const n = order.filter((s) => s === slug).length;
	if (n !== 1) fail(`sidebar lists ${slug} ${n} times`);
	if (!files.includes(slug)) fail(`sidebar lists ${slug}, which has no page`);
}
for (const f of files) if (!order.includes(f)) fail(`page ${f} is not in the sidebar`);

// llms.txt: one "- [Title](https://agentspecs.io/<slug>.md)" line per page, in sidebar order.
const llms = readFileSync('dist/llms.txt', 'utf8');
const entries = [...llms.matchAll(/^- \[(.+?)\]\(https:\/\/agentspecs\.io\/(.+?)\.md\)/gm)].map((m) => ({ title: m[1], slug: m[2] }));
const listed = entries.map((e) => e.slug).join(' ');
if (listed !== order.join(' ')) fail(`llms.txt order differs from the sidebar:\n  llms.txt: ${listed}\n  sidebar:  ${order.join(' ')}`);

// llms-full.txt: each page starts with "# <title>", in the same order.
const full = readFileSync('dist/llms-full.txt', 'utf8');
let at = -1;
for (const { title, slug } of entries) {
	const next = full.indexOf(`# ${title}\n`, at + 1);
	if (next <= at) fail(`llms-full.txt: "${title}" (${slug}) is missing or out of sidebar order`);
	else at = next;
}

console.log(failures ? `${failures} problem(s)` : `sidebar: ${order.length} pages, each once; llms.txt and llms-full.txt in sidebar order`);
process.exit(failures ? 1 : 0);
