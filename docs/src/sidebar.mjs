// Sidebar order, shared by astro.config.mjs (Starlight navigation) and the llms.txt /
// llms-full.txt routes (page order). Every docs page is listed here exactly once.
export const SIDEBAR = [
	{
		label: 'Start',
		items: [{ slug: 'index', label: 'Overview' }, 'faq'],
	},
	{
		label: 'Practices',
		items: [
			'practices/context-limits',
			'practices/instruction-files',
			'practices/team-context',
			'practices/large-codebases',
			'practices/planning',
			'practices/long-running-work',
			'practices/subagents',
			'practices/verification',
			'practices/trust-and-security',
		],
	},
	{
		label: 'Evidence',
		items: ['evidence/ledger', 'evidence/method', 'evidence/open-questions'],
	},
	{
		label: 'About',
		items: ['credits', 'contribute'],
	},
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
