// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { unified } from '@astrojs/markdown-remark';
import remarkLabels from './src/plugins/remark-labels.mjs';
import rehypeTaskListLabels from './src/plugins/rehype-task-list-labels.mjs';
import { GITHUB_URL, SITE_TITLE, SITE_URL } from './src/consts.mjs';
import { SIDEBAR } from './src/sidebar.mjs';

// Social image for every page (public/og.png, 1200x630). Starlight already emits the canonical
// link, og:title/description/url and twitter:card=summary_large_image from `site` and frontmatter.
const OG_IMAGE = new URL('/og.png', SITE_URL).href;

// Astro 7 defaults to the Sätteri Markdown processor, which does not run remark plugins.
// The unified processor runs our remark plugin on .md and .mdx alike; Starlight supports both.
// rehypeTaskListLabels gives GFM task-list checkboxes (Reference > Checklist) an accessible name.
export default defineConfig({
	site: SITE_URL,
	trailingSlash: 'ignore',
	markdown: {
		processor: unified({ remarkPlugins: [remarkLabels], rehypePlugins: [rehypeTaskListLabels] }),
	},
	integrations: [
		starlight({
			title: SITE_TITLE,
			favicon: '/favicon.svg',
			head: [
				{ tag: 'meta', attrs: { property: 'og:image', content: OG_IMAGE } },
				{ tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
				{ tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
				{
					tag: 'meta',
					attrs: { property: 'og:image:alt', content: 'agentspecs: task specs that coding agents can follow phase by phase.' },
				},
				{ tag: 'meta', attrs: { name: 'twitter:image', content: OG_IMAGE } },
				{ tag: 'link', attrs: { rel: 'alternate', type: 'text/plain', title: 'llms.txt', href: '/llms.txt' } },
			],
			// src/pages/404.astro replaces Starlight's built-in 404 route.
			disable404Route: true,
			social: [{ icon: 'github', label: 'GitHub', href: GITHUB_URL }],
			customCss: [
				'@fontsource-variable/inter',
				'@fontsource-variable/jetbrains-mono',
				'./src/styles/theme.css',
				'./src/styles/labels.css',
			],
			components: {
				Head: './src/components/Head.astro',
				PageTitle: './src/components/PageTitle.astro',
			},
			tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
			sidebar: SIDEBAR,
		}),
	],
});
