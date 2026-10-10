import { expect } from '@playwright/test';

export const WIDTHS = [375, 700, 1100, 1500];
export const THEMES = ['dark', 'light'];
export const HEIGHT = 900;

/**
 * Open `path` at `width` in `theme`, using the site's own theme mechanism (Starlight reads
 * localStorage 'starlight-theme' before first paint), then prove the theme took and fonts loaded.
 */
export async function openPage(page, path, { width, theme, height = HEIGHT }) {
	await page.setViewportSize({ width, height });
	await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
	await page.addInitScript((t) => localStorage.setItem('starlight-theme', t), theme);
	await page.goto(path);
	await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
	await page.evaluate(() => document.fonts.ready);
	await expect(page.locator('h1').first()).toBeVisible();
}
