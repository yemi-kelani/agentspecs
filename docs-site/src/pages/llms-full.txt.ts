// /llms-full.txt: every docs page's Markdown export, concatenated in sidebar order.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { llmsFullTxt } from '../lib/llms.mjs';

export const GET: APIRoute = async () => {
	const entries = await getCollection('docs', (entry) => entry.id !== '404');
	return new Response(llmsFullTxt(entries), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
