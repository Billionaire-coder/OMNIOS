
import { test, expect } from '@playwright/test';

test.describe('Editor Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the editor directly, which should redirect to login
        await page.goto('/editor/blank');

        // If we are on the login page, perform login
        if (page.url().includes('/login')) {
            console.log('Redirected to login. Performing authentication...');
            await page.fill('input[name="email"]', 'demo@omnios.dev');
            await page.fill('input[name="password"]', 'demo');
            await page.click('button[type="submit"]');

            // Wait for redirect back to the editor
            await page.waitForURL(/\/editor\/blank/, { timeout: 60000 });

            console.log('Login successful, back on /editor/blank');
        }
    });

    test('should load the editor', async ({ page }) => {
        // We are already on /editor/blank due to beforeEach
        await expect(page).toHaveTitle(/Omni-OS|Editor/i);
        const container = page.locator('.editor-container');
        await expect(container).toBeVisible({ timeout: 30000 });
    });

    test('should add an element via sidebar', async ({ page }) => {
        page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));

        console.log('Waiting for Loading Editor to disappear...');
        await expect(page.getByText('Loading Editor...')).not.toBeVisible({ timeout: 30000 });

        const container = page.locator('.editor-container');
        await container.waitFor({ state: 'visible', timeout: 30000 });

        // Default tab is 'ADD'. Check for "Div" button.
        const boxBtn = page.getByRole('button', { name: /Div/i });
        await expect(boxBtn).toBeVisible({ timeout: 10000 });
        await boxBtn.click();

        // Check if element added to canvas
        // We added data-testid="designer-element" to ElementRenderer
        const firstElement = page.getByTestId('designer-element').nth(1); // 0 is root, 1 is the new div
        await expect(firstElement).toBeVisible({ timeout: 10000 });
    });

    test('should open deployment panel', async ({ page }) => {
        page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));
        await expect(page.getByText('Loading Editor...')).not.toBeVisible({ timeout: 30000 });

        const container = page.locator('.editor-container');
        await container.waitFor({ state: 'visible', timeout: 30000 });

        // Click "Publish" - we added data-testid="publish-button"
        const publishButton = page.getByTestId('publish-button');
        await expect(publishButton).toBeVisible();
        await publishButton.click();

        // Should see "The Publisher" header in deployment panel
        await expect(page.getByText(/The Publisher/i)).toBeVisible({ timeout: 10000 });

        // Close using the X icon
        await page.locator('svg.lucide-x').last().click();
    });
});
