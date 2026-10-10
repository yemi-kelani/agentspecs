// Sidebar order, shared by astro.config.mjs (Starlight navigation) and the llms.txt /
// llms-full.txt routes (page order). Every docs page is listed here exactly once.
export const SIDEBAR = [
	{ slug: 'index', label: 'Overview' },
	'reference/specification',
	'quickstart',
	{
		label: 'Concepts',
		items: [
			'concepts/why-structure',
			'concepts/index-and-leaves',
			'concepts/handoff-contracts',
			'concepts/living-state',
			'concepts/sizing',
			'concepts/untrusted-sources',
		],
	},
	{
		label: 'Guides',
		items: [
			'guides/write-plan',
			'guides/write-phase-file',
			'guides/verify-and-accept',
			'guides/run-phases-with-subagents',
		],
	},
	{
		label: 'Works with',
		items: ['works-with/agents-md', 'works-with/agent-skills'],
	},
	{
		label: 'Reference',
		items: ['reference/templates', 'reference/checklist'],
	},
	'comparison',
	'evidence',
	'faq',
	'contribute',
];

/**
 * Flatten SIDEBAR into [{ slug, group }] in reading order. Top-level pages get group null;
 * pages inside a labelled group get that label.
 */
export function sidebarPages(items = SIDEBAR, group = null) {
	return items.flatMap((item) => {
		if (typeof item === 'string') return [{ slug: item, group }];
		if ('items' in item) return sidebarPages(item.items, item.label);
		return [{ slug: item.slug, group }];
	});
}
