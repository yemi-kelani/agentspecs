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
	// Old page URLs from before the 2026-10-10 navigation restructure (see DECISIONS.md).
	redirects: {
		'/specification': '/reference/specification/',
	},
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
			// The frame, header, sidebar, TOC, theme menu and pagination follow the agentskills.io docs
			// layout (a centred 92rem frame); see DECISIONS.md and tests/visual/.
			components: {
				Head: './src/components/Head.astro',
				Header: './src/components/Header.astro',
				MobileMenuToggle: './src/components/MobileMenuToggle.astro',
				PageFrame: './src/components/PageFrame.astro',
				PageSidebar: './src/components/PageSidebar.astro',
				PageTitle: './src/components/PageTitle.astro',
				Pagination: './src/components/Pagination.astro',
				Sidebar: './src/components/Sidebar.astro',
				ThemeSelect: './src/components/ThemeSelect.astro',
				TwoColumnContent: './src/components/TwoColumnContent.astro',
			},
			// Same Shiki themes as agentskills.io; frame colours and sizes are set in theme.css.
			// frame: 'code' keeps shell blocks free of terminal chrome, as there.
			expressiveCode: {
				themes: ['dark-plus', 'github-light-default'],
				useStarlightUiThemeColors: false,
				defaultProps: { frame: 'code' },
				styleOverrides: {
					// Expressive Code adds the border width to this, giving a 16px outer corner.
					borderRadius: '0.9375rem',
					borderWidth: '1px',
					codeFontSize: '0.875rem',
					codeLineHeight: '1.5rem',
					codePaddingBlock: '0.875rem',
					codePaddingInline: '1rem',
					frames: { frameBoxShadowCssValue: 'none' },
				},
			},
			tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
			sidebar: SIDEBAR,
		}),
	],
});
