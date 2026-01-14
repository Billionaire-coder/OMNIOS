import { test, expect } from '@playwright/test';

test('Visual Regression - Blank Editor', async ({ page }) => {
    // 0. Bypass Auth
    await page.setExtraHTTPHeaders({
        'x-e2e-bypass': 'true'
    });

    // 1. Go to blank editor (Mock auth if needed, or assume dev environment bypass)
    await page.goto('/editor/blank');

    // 2. Wait for editor container (Main Wrapper)
    try {
        await page.waitForSelector('.editor-container', { timeout: 10000 });
    } catch (e) {
        console.log('Timeout waiting for selector. Current URL:', page.url());
        console.log('Page Title:', await page.title());
        throw e;
    }

    // 3. Take snapshot
    // We mask dynamic elements like cursors or timestamps if any
    await expect(page).toHaveScreenshot('editor-blank.png', {
        mask: [page.locator('.cursor-overlay')],
        maxDiffPixelRatio: 0.05 // Tolerate small rendering differences (5%)
    });
});
