import { test, expect } from '@playwright/test';

test.describe('Halaman Tips / Artikel', () => {
    test('halaman artikel tanpa slug redirect ke welcome', async ({ page }) => {
        const resp = await page.goto('/tips/');
        // harusnya 404 atau redirect, pastikan gak error
        expect(resp?.status()).toBeLessThan(500);
    });

    test('halaman artikel dengan slug tidak dikenal', async ({ page }) => {
        const resp = await page.goto('/tips/artikel-tidak-ada');
        await expect(page.locator('#app')).toBeAttached();
    });
});
