import { test, expect } from '@playwright/test';

test.describe('Halaman Assessment (tanpa auth — redirect)', () => {
    test('halaman assessments redirect ke login', async ({ page }) => {
        await page.goto('/assessments');
        await expect(page).toHaveURL(/\/login/);
    });

    test('halaman BMI redirect ke login', async ({ page }) => {
        await page.goto('/assessments/bmi');
        await expect(page).toHaveURL(/\/login/);
    });

    test('halaman diabetes redirect ke login', async ({ page }) => {
        await page.goto('/assessments/diabetes');
        await expect(page).toHaveURL(/\/login/);
    });

    test('halaman stress redirect ke login', async ({ page }) => {
        await page.goto('/assessments/stress');
        await expect(page).toHaveURL(/\/login/);
    });

    test('halaman chat redirect ke login', async ({ page }) => {
        await page.goto('/chat');
        await expect(page).toHaveURL(/\/login/);
    });

    test('halaman profile redirect ke login', async ({ page }) => {
        await page.goto('/profile');
        await expect(page).toHaveURL(/\/login/);
    });

    test('halaman dashboard redirect ke login', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/login/);
    });

    test('halaman admin redirect ke login', async ({ page }) => {
        await page.goto('/admin');
        await expect(page).toHaveURL(/\/login/);
    });
});
