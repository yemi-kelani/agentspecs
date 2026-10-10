// Measured geometry of the site chrome. Every number is a laid-out box or computed style that was
// measured on agentskills.io (2026-10-10, banner dismissed); at >= 1472 px its layout is the same
// width, so 1500 px stands for every wide screen. Tolerance: 1 px.
// Not carried here: colours and anything a picture shows better (site.spec.mjs).
// Run: npm run test:visual -- tests/visual/geometry.spec.mjs
import { test, expect } from '@playwright/test';
import { openPage } from './helpers.mjs';

const box = (locator) =>
	locator.evaluate((el) => {
		const r = el.getBoundingClientRect();
		return { x: r.x, y: r.y, w: r.width, h: r.height, right: r.right, bottom: r.bottom };
	});
const css = (locator, ...props) =>
	locator.evaluate((el, props) => Object.fromEntries(props.map((p) => [p, getComputedStyle(el)[p]])), props);
const near = (actual, expected, what, tol = 1) =>
	expect(Math.abs(actual - expected), `${what}: ${actual.toFixed(1)} vs ${expected}`).toBeLessThanOrEqual(tol);

test.describe('1500 px', () => {
	test.beforeEach(({ page }) => openPage(page, '/', { width: 1500, theme: 'dark' }));

	test('header: 64 px bar, 30 px bold title at 62, 280x36 search centred, 32 px theme button', async ({ page }) => {
		near((await box(page.locator('header.header'))).h, 64, 'header height');
		const title = page.locator('.site-title');
		near((await box(title)).x, 62, 'title x');
		expect(await css(title, 'fontSize', 'fontWeight')).toEqual({ fontSize: '30px', fontWeight: '700' });
		const searchBtn = page.locator('header site-search button[data-open-modal]');
		const search = await box(searchBtn);
		near(search.w, 280, 'search width');
		near(search.h, 36, 'search height');
		near(search.x + search.w / 2, 750, 'search centre');
		expect((await css(searchBtn, 'borderTopLeftRadius')).borderTopLeftRadius).toBe('12px');
		const theme = await box(page.locator('header .theme-menu__toggle'));
		near(theme.w, 32, 'theme button width');
		near(theme.right, 1438, 'theme button right edge');
	});

	test('sidebar: 256x36 pills at 46, text at 62, labelled groups 32 px apart', async ({ page }) => {
		const current = page.locator('#starlight__sidebar a[aria-current="page"]');
		const c = await box(current);
		near(c.x, 46, 'pill x');
		near(c.y, 96, 'first pill y');
		near(c.w, 256, 'pill width');
		near(c.h, 36, 'pill height');
		expect(await css(current, 'fontSize', 'borderTopLeftRadius', 'paddingLeft')).toEqual({
			fontSize: '14px',
			borderTopLeftRadius: '12px',
			paddingLeft: '16px',
		});
		const firstSection = await box(page.locator('#starlight__sidebar .sidebar-section').first());
		const label = page.locator('#starlight__sidebar .sidebar-group-label').first();
		const l = await box(label);
		near(l.y, firstSection.bottom + 32, 'group label y');
		near(l.h, 24, 'group label height');
		expect(await css(label, 'fontSize', 'fontWeight')).toEqual({ fontSize: '14px', fontWeight: '600' });
		const grouped = page.locator('#starlight__sidebar ul.grouped').first().locator('a');
		const [g1, g2] = [await box(grouped.nth(0)), await box(grouped.nth(1))];
		near(g1.y, l.bottom + 10, 'first grouped link y');
		near(g2.y - g1.y, 37, 'grouped link pitch');
	});

	test('title row: 36/40 h1 at (377, 106), 18/28 description, 34 px Copy page at the content edge', async ({ page }) => {
		const h1 = page.locator('h1#_top');
		const t = await box(h1);
		near(t.x, 377.2, 'h1 x');
		near(t.y, 106, 'h1 y');
		expect(await css(h1, 'fontSize', 'lineHeight', 'fontWeight')).toEqual({ fontSize: '36px', lineHeight: '40px', fontWeight: '600' });
		const desc = page.locator('.page-description');
		near((await box(desc)).y, t.bottom + 8, 'description y');
		expect(await css(desc, 'fontSize', 'lineHeight')).toEqual({ fontSize: '18px', lineHeight: '28px' });
		const content = await box(page.locator('.sl-markdown-content'));
		near(content.x, 377.2, 'content x');
		near(content.w, 720.8, 'content width');
		const copy = page.locator('.copy-page__group');
		const cp = await box(copy);
		near(cp.h, 34, 'Copy page height');
		near(cp.y, t.y + 3, 'Copy page y');
		near(cp.right, content.right, 'Copy page right edge');
		expect((await css(copy, 'borderTopLeftRadius')).borderTopLeftRadius).toBe('12px');
	});

	test('body: 16/28 text 32 px under the description; 24 px h2 36 px after text, 18 px above the next block', async ({ page }) => {
		const desc = await box(page.locator('.page-description'));
		near((await box(page.locator('.sl-markdown-content > :first-child'))).y, desc.bottom + 32, 'first block y');
		const wrapper = page.locator('.sl-markdown-content > p + .sl-heading-wrapper.level-h2').first();
		const h = await box(wrapper);
		const before = await box(wrapper.locator('xpath=preceding-sibling::*[1]'));
		near(h.y, before.bottom + 36, 'h2 after a paragraph');
		near(h.h, 32, 'h2 line box');
		expect(await css(wrapper.locator('h2'), 'fontSize', 'fontWeight')).toEqual({ fontSize: '24px', fontWeight: '600' });
		const p = page.locator('.sl-markdown-content .level-h2 + p').first();
		near((await box(p)).y, h.bottom + 18, 'paragraph after h2');
		expect(await css(p, 'fontSize', 'lineHeight')).toEqual({ fontSize: '16px', lineHeight: '28px' });
	});

	test('code: 14 px chips with 2/8 padding; blocks with a 1 px border, 16 px radius, 14/24 text', async ({ page }) => {
		const code = page.locator('.sl-markdown-content p code').first();
		expect(await css(code, 'fontSize', 'fontWeight', 'paddingTop', 'paddingLeft', 'borderTopLeftRadius')).toEqual({
			fontSize: '14px',
			fontWeight: '500',
			paddingTop: '2px',
			paddingLeft: '8px',
			borderTopLeftRadius: '6px',
		});
		const pre = page.locator('.sl-markdown-content .expressive-code pre').first();
		expect(await css(pre, 'borderTopWidth', 'borderTopLeftRadius')).toEqual({ borderTopWidth: '1px', borderTopLeftRadius: '16px' });
		near((await box(pre)).w, 720.8, 'code block width');
		const line = pre.locator('.ec-line').first();
		expect(await css(line, 'fontSize', 'lineHeight')).toEqual({ fontSize: '14px', lineHeight: '24px' });
		const p = await box(pre);
		near((await box(line)).y, p.y + 1 + 14, 'first line y (border + 14 px padding)');
		const glyphX = await line.evaluate((el) => {
			const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
			let node;
			while ((node = walker.nextNode()) && !node.textContent.trim());
			const at = node.textContent.search(/\S/);
			const range = document.createRange();
			range.setStart(node, at);
			range.setEnd(node, at + 1);
			return range.getBoundingClientRect().x;
		});
		near(glyphX, p.x + 1 + 16, 'code text inset (border + 16 px)');
	});

	test('TOC: "On this page" at (1190, 112), 32 px rows, no page-title entry', async ({ page }) => {
		const title = page.locator('starlight-toc h2');
		const t = await box(title);
		near(t.x, 1190, 'TOC title x');
		near(t.y, 112, 'TOC title y');
		near(t.h, 24, 'TOC title height');
		await expect(page.locator('starlight-toc a[href="#_top"]')).toBeHidden();
		const first = await box(page.locator('starlight-toc a:visible').first());
		near(first.y, t.bottom, 'first TOC link y');
		near(first.h, 32, 'TOC row height');
		near((await box(page.locator('starlight-toc nav'))).w, 264, 'TOC width');
	});
});

test('1500 px, scrolled: header, sidebar and TOC stay in place', async ({ page }) => {
	await openPage(page, '/specification/', { width: 1500, theme: 'dark' });
	await page.evaluate(() => window.scrollTo(0, 3000));
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(2000);
	near((await box(page.locator('header.header'))).y, 0, 'header y');
	near((await box(page.locator('#starlight__sidebar a').first())).y, 96, 'first sidebar link y');
	near((await box(page.locator('starlight-toc h2'))).y, 112, 'TOC title y');
});

test('1100 px: sidebar and content, no TOC', async ({ page }) => {
	await openPage(page, '/', { width: 1100, theme: 'dark' });
	await expect(page.locator('starlight-toc')).toBeHidden();
	await expect(page.locator('mobile-starlight-toc')).toBeHidden();
	near((await box(page.locator('#starlight__sidebar a[aria-current="page"]'))).x, 32, 'pill x');
	const content = await box(page.locator('.sl-markdown-content'));
	near(content.x, 363.2, 'content x');
	near(content.w, 700.8, 'content width');
});

test('375 px: 64 px header with menu button, "On this page" bar, content at 20', async ({ page }) => {
	await openPage(page, '/', { width: 375, theme: 'dark' });
	near((await box(page.locator('header.header'))).h, 64, 'header height');
	const title = page.locator('.site-title');
	near((await box(title)).x, 16, 'title x');
	expect((await css(title, 'fontSize')).fontSize).toBe('24px');
	const menu = await box(page.locator('button[popovertarget="starlight__sidebar"]'));
	near(menu.w, 32, 'menu button width');
	near(menu.right, 359, 'menu button right edge');
	near((await box(page.locator('mobile-starlight-toc summary'))).h, 56, 'On this page bar height');
	const h1 = page.locator('h1#_top');
	near((await box(h1)).x, 20, 'h1 x');
	expect((await css(h1, 'fontSize')).fontSize).toBe('30px');
	await expect(page.locator('starlight-toc')).toBeHidden();
});
