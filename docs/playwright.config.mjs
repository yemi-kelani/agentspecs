// Picture and geometry tests for the site chrome (tests/visual/). Run: npm run test:visual
// Builds the site and serves dist/ on its own port, so the pictures show the production output.
// --force clears the content cache, which keeps code blocks rendered with an older Expressive Code
// config. --ignore-lock keeps astro preview in the foreground (it detaches in non-interactive shells).
import { defineConfig } from '@playwright/test';

const PORT = 4329;

export default defineConfig({
	testDir: 'tests/visual',
	snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
	fullyParallel: true,
	reporter: [['list']],
	use: {
		baseURL: `http://localhost:${PORT}`,
		browserName: 'chromium',
		deviceScaleFactor: 1,
	},
	expect: {
		// Pixel count, sized at 375 px: a 1 px hairline across the narrowest viewport is ~375 pixels.
		// threshold 0.02: Playwright's default 0.2 does not see a deleted hairline border.
		toHaveScreenshot: { maxDiffPixels: 20, threshold: 0.02, animations: 'disabled', caret: 'hide', scale: 'css' },
	},
	webServer: {
		command: `npx astro build --force && npx astro preview --port ${PORT} --ignore-lock`,
		url: `http://localhost:${PORT}/`,
		reuseExistingServer: false,
		timeout: 120_000,
	},
});
