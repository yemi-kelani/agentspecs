// Pictures of the site chrome and content styles (the agentskills.io docs look).
// Subjects: header, sidebar, title row with Copy page, body text, code block (plain and titled),
//   task list, table, Steps, link cards, right-hand TOC, the 404 splash page, and these states:
//   mobile menu, Copy page menu, theme menu and search dialog open.
// Matrix: pages at 375 / 700 / 1100 / 1500 px x dark / light; components and states at the
//   narrowest and widest width.
// Not carried here: measured sizes (geometry.spec.mjs), theme menu behaviour (theme-menu.spec.mjs),
//   label colour contrast (tests/labels-contrast.test.mjs), Copy page clipboard and keyboard
//   behaviour, favicon and social image (scripts/gen-brand.mjs writes a preview).
// Pictures are rendered on macOS (Chromium, Inter and JetBrains Mono from node_modules); another
//   OS anti-aliases glyphs differently, so re-cut there before comparing.
// Regenerate deliberately, after review: npx playwright test tests/visual/site.spec.mjs --update-snapshots
import { test, expect } from '@playwright/test';
import { openPage, THEMES, WIDTHS } from './helpers.mjs';

const PAGES = [
	{ name: 'overview', path: '/', h1: 'Agent Specs overview' },
	{ name: 'specification', path: '/specification/', h1: 'Specification' },
	{ name: 'sizing', path: '/concepts/sizing/', h1: 'Sizing: when to use what' },
	{ name: 'not-found', path: '/404.html', h1: 'Page not found' },
];

const COMPONENTS = [
	{ name: 'code-block', path: '/', locator: '.sl-markdown-content .expressive-code' },
	{ name: 'code-block-titled', path: '/quickstart/', locator: '.sl-markdown-content .expressive-code:has(.has-title)' },
	{ name: 'task-list', path: '/reference/checklist/', locator: '.sl-markdown-content .contains-task-list' },
	{ name: 'steps', path: '/', locator: '.sl-markdown-content .sl-steps' },
	{ name: 'link-cards', path: '/', locator: '.sl-markdown-content .card-grid' },
	{ name: 'table', path: '/concepts/sizing/', locator: '.sl-markdown-content table' },
];

const EDGE_WIDTHS = [WIDTHS[0], WIDTHS.at(-1)];

for (const theme of THEMES) {
	for (const width of WIDTHS) {
		for (const p of PAGES) {
			test(`${p.name} ${width} ${theme}`, async ({ page }) => {
				await openPage(page, p.path, { width, theme });
				await expect(page.locator('h1').first()).toHaveText(p.h1);
				await expect(page).toHaveScreenshot(`${p.name}_${width}_${theme}.png`);
			});
		}
	}

	for (const width of EDGE_WIDTHS) {
		for (const c of COMPONENTS) {
			test(`${c.name} ${width} ${theme}`, async ({ page }) => {
				await openPage(page, c.path, { width, theme });
				const el = page.locator(c.locator).first();
				await el.scrollIntoViewIfNeeded();
				await expect(el).toBeVisible();
				await expect(el).toHaveScreenshot(`${c.name}_${width}_${theme}.png`);
			});
		}
	}

	test(`menu-open 375 ${theme}`, async ({ page }) => {
		await openPage(page, '/concepts/sizing/', { width: 375, theme });
		await page.locator('button[popovertarget="starlight__sidebar"]').click();
		await expect(page.locator('#starlight__sidebar')).toBeVisible();
		await expect(page.locator('#starlight__sidebar a[aria-current="page"]')).toHaveText('Sizing: when to use what');
		await expect(page).toHaveScreenshot(`menu-open_375_${theme}.png`);
	});

	test(`copy-menu-open 1500 ${theme}`, async ({ page }) => {
		await openPage(page, '/', { width: 1500, theme });
		await page.locator('.copy-page__toggle').click();
		await expect(page.locator('.copy-page__toggle')).toHaveAttribute('aria-expanded', 'true');
		await expect(page.locator('#copy-page-menu')).toBeVisible();
		await expect(page).toHaveScreenshot(`copy-menu-open_1500_${theme}.png`);
	});

	test(`theme-menu-open 1500 ${theme}`, async ({ page }) => {
		await openPage(page, '/', { width: 1500, theme });
		await page.locator('header .theme-menu__toggle').click();
		const menu = page.locator('header .theme-menu [role="menu"]');
		await expect(menu).toBeVisible();
		await expect(menu.locator(`[data-value="${theme}"]`)).toHaveAttribute('aria-checked', 'true');
		await expect(page).toHaveScreenshot(`theme-menu-open_1500_${theme}.png`, { clip: { x: 900, y: 0, width: 600, height: 300 } });
	});

	test(`search-open 1500 ${theme}`, async ({ page }) => {
		await openPage(page, '/', { width: 1500, theme });
		await page.locator('button[data-open-modal]').click();
		await expect(page.locator('dialog[aria-label="Search"]')).toBeVisible();
		await expect(page.locator('dialog[aria-label="Search"] input')).toBeVisible();
		await expect(page).toHaveScreenshot(`search-open_1500_${theme}.png`);
	});
}
