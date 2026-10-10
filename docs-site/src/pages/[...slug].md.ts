// Static Markdown export: every docs page is also served at /<slug>.md (home at /index.md).
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { pageToMarkdown } from '../lib/markdown';
import { mdSlug } from '../lib/paths.mjs';

export const getStaticPaths = (async () => {
	const docs = await getCollection('docs', (entry) => entry.id !== '404');
	return docs.map((entry) => ({ params: { slug: mdSlug(entry.id) }, props: { entry } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ entry: CollectionEntry<'docs'> }> = ({ props }) => {
	const { entry } = props;
	const markdown = pageToMarkdown({
		title: entry.data.title,
		description: entry.data.description,
		body: entry.body ?? '',
		format: entry.filePath?.endsWith('.mdx') ? 'mdx' : 'md',
	});
	return new Response(markdown, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
