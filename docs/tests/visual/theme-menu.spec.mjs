// Behaviour of the header theme menu (src/components/ThemeSelect.astro): menu button pattern,
// the stored preference ('starlight-theme': '' | 'light' | 'dark') and the applied data-theme.
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.setViewportSize({ width: 1500, height: 900 });
	await page.emulateMedia({ colorScheme: 'dark' });
	await page.goto('/');
});

const toggle = (page) => page.locator('header .theme-menu__toggle');
const menu = (page) => page.locator('header .theme-menu [role="menu"]');
const stored = (page) => page.evaluate(() => localStorage.getItem('starlight-theme'));

test('opens on the checked item and applies a choice', async ({ page }) => {
	await expect(page.locator('header as-theme-menu')).toHaveAttribute('data-pref', 'auto');
	await toggle(page).click();
	await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
	await expect(menu(page).getByRole('menuitemradio', { name: 'System' })).toBeFocused();
	await expect(menu(page).getByRole('menuitemradio', { name: 'System' })).toHaveAttribute('aria-checked', 'true');

	await menu(page).getByRole('menuitemradio', { name: 'Light' }).click();
	await expect(menu(page)).toBeHidden();
	await expect(toggle(page)).toBeFocused();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
	await expect(page.locator('header as-theme-menu')).toHaveAttribute('data-pref', 'light');
	expect(await stored(page)).toBe('light');

	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
	await expect(page.locator('header as-theme-menu')).toHaveAttribute('data-pref', 'light');
});

test('keyboard: arrows move, Enter chooses, Escape closes', async ({ page }) => {
	await toggle(page).focus();
	await page.keyboard.press('ArrowDown');
	await expect(menu(page).getByRole('menuitemradio', { name: 'System' })).toBeFocused();
	await page.keyboard.press('ArrowUp');
	await expect(menu(page).getByRole('menuitemradio', { name: 'Dark' })).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	expect(await stored(page)).toBe('dark');

	await page.keyboard.press('Enter');
	await expect(menu(page)).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(menu(page)).toBeHidden();
	await expect(toggle(page)).toBeFocused();
});

test('System follows the colour scheme and clears the stored value', async ({ page }) => {
	await page.evaluate(() => localStorage.setItem('starlight-theme', 'light'));
	await page.reload();
	await toggle(page).click();
	await menu(page).getByRole('menuitemradio', { name: 'System' }).click();
	expect(await stored(page)).toBe('');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await page.emulateMedia({ colorScheme: 'light' });
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
