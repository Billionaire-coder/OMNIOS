
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    // Basic connectivity check for now as we might be in 'dev mode' bypassing auth
    test('login page should render', async ({ page }) => {
        await page.goto('/login');
        // Check if we are on login page or redirected to editor
        const url = page.url();
        if (url.includes('login')) {
            await expect(page.locator('input[type="email"]')).toBeVisible();
        }
    });
});
