import { test, expect } from '@playwright/test';

test.describe('Responsive — Halaman Beranda', () => {
    const viewports = [
        { name: 'mobile', width: 375, height: 812 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
        test(`tampilan ${vp.name} tidak overflow horizontal`, async ({ page }) => {
            await page.setViewportSize({ width: vp.width, height: vp.height });
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
            const viewportWidth = await page.evaluate(() => window.innerWidth);
            expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 2);
        });

        test(`hero section ${vp.name} tetap terlihat`, async ({ page }) => {
            await page.setViewportSize({ width: vp.width, height: vp.height });
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            await expect(page.getByText('Asisten Kesehatan Pintar')).toBeVisible();
            await expect(page.getByRole('link', { name: 'Mulai Tes Kesehatan' })).toBeVisible();
        });
    }
});

test.describe('Responsive — Halaman Login', () => {
    test('form login tidak overflow di mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(bodyWidth).toBeLessThanOrEqual(377);
    });
});

test.describe('Responsive — Halaman Register', () => {
    test('form register tidak overflow di mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/register');
        await page.waitForLoadState('networkidle');

        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(bodyWidth).toBeLessThanOrEqual(377);
    });
});
