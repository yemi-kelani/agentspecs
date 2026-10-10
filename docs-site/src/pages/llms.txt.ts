// /llms.txt: index of every docs page's Markdown export (https://llmstxt.org shape).
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { llmsTxt } from '../lib/llms.mjs';
import { SITE_TITLE, SITE_URL, SPEC_VERSION } from '../consts.mjs';

export const GET: APIRoute = async () => {
	const entries = await getCollection('docs', (entry) => entry.id !== '404');
	const body = llmsTxt(entries, { title: SITE_TITLE, site: SITE_URL, version: SPEC_VERSION });
	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
