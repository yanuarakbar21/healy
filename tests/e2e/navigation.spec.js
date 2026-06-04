import { test, expect } from '@playwright/test';

test.describe('Navigasi Smoke Test', () => {
    test('alur: beranda → login → register → kembali ke login', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: 'Masuk' }).first().click();
        await expect(page).toHaveURL('/login');

        await page.getByRole('link', { name: 'Daftar' }).click();
        await expect(page).toHaveURL('/register');

        await page.getByRole('link', { name: 'Masuk' }).click();
        await expect(page).toHaveURL('/login');
    });

    test('alur: beranda → register → login → kembali ke beranda', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: 'Daftar' }).first().click();
        await expect(page).toHaveURL('/register');

        await page.getByRole('link', { name: 'Masuk' }).click();
        await expect(page).toHaveURL('/login');

        await page.getByRole('link', { name: 'Healy' }).click();
        await expect(page).toHaveURL('/');
    });

    test('semua halaman public mengembalikan status 200', async ({ page }) => {
        const pages = ['/', '/login', '/register'];
        for (const path of pages) {
            const resp = await page.goto(path);
            expect(resp?.status()).toBe(200);
        }
    });

    test('halaman terproteksi redirect ke login', async ({ page }) => {
        const protectedPages = [
            '/dashboard', '/assessments', '/assessments/bmi',
            '/assessments/diabetes', '/assessments/stress',
            '/chat', '/profile', '/admin'
        ];
        for (const path of protectedPages) {
            await page.goto(path);
            await expect(page).toHaveURL(/\/login/);
        }
    });

    test('tombol "Mulai Tes Kesehatan" → register', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: 'Mulai Tes Kesehatan' }).click();
        await expect(page).toHaveURL('/register');
    });

    test('tombol "Pelajari Lebih Lanjut" → login', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: 'Pelajari Lebih Lanjut' }).click();
        await expect(page).toHaveURL('/login');
    });

    test('CTA "Daftar Sekarang" → register', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: 'Daftar Sekarang' }).click();
        await expect(page).toHaveURL('/register');
    });

    test('CTA "Masuk" di footer → login', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: 'Masuk' }).last().click();
        await expect(page).toHaveURL('/login');
    });
});
