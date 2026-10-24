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
	// Old page URLs: before the 2026-10-10 navigation restructure, the v0.2 packet rebuild and the
	// 2026-10-23 evidence-first restructure (see DECISIONS.md). Every retired slug lands, in one hop,
	// on the page that now covers it.
	redirects: {
		'/specification': '/',
		'/reference/specification': '/',
		'/concepts/why-structure': '/',
		'/approach/how-it-works': '/',
		'/quickstart': '/',
		'/reference/checklist': '/',
		'/reference/glossary': '/',
		'/reference/size-budgets': '/practices/planning/',
		'/concepts/sizing': '/practices/planning/',
		'/guides/write-plan': '/practices/planning/',
		'/guides/agents-md-router': '/practices/instruction-files/',
		'/guides/skill-md-triggers': '/practices/instruction-files/',
		'/concepts/index-and-leaves': '/practices/instruction-files/',
		'/works-with/agents-md': '/practices/instruction-files/',
		'/works-with/agent-skills': '/practices/instruction-files/',
		'/practices/standing-context': '/practices/instruction-files/',
		'/approach/packet-anatomy': '/practices/long-running-work/',
		'/reference/templates': '/practices/long-running-work/',
		'/concepts/handoff-contracts': '/practices/long-running-work/',
		'/concepts/living-state': '/practices/long-running-work/',
		'/guides/write-phase-file': '/practices/long-running-work/',
		'/practices/breaking-work-down': '/practices/long-running-work/',
		'/concepts/verification-and-review': '/practices/verification/',
		'/guides/verify-and-accept': '/practices/verification/',
		'/guides/run-phases-with-subagents': '/practices/subagents/',
		'/practices/delegation': '/practices/subagents/',
		'/concepts/untrusted-sources': '/practices/trust-and-security/',
		'/comparison': '/faq/',
		'/evidence': '/evidence/ledger/',
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
					attrs: { property: 'og:image:alt', content: 'Agent Practices: what the evidence says about giving coding agents context.' },
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
