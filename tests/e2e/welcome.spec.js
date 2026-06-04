import { test, expect } from '@playwright/test';

test.describe('Halaman Beranda (Welcome)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('menampilkan header dan tombol navigasi', async ({ page }) => {
        await expect(page.locator('nav')).toContainText('Healy');
        await expect(page.getByRole('link', { name: 'Masuk' }).first()).toBeVisible();
        await expect(page.getByRole('link', { name: 'Daftar' }).first()).toBeVisible();
    });

    test('hero section memiliki elemen utama', async ({ page }) => {
        await expect(page.getByText('Asisten Kesehatan Pintar')).toBeVisible();
        await expect(page.getByText('Keluarga Anda')).toBeVisible();
        await expect(page.getByRole('link', { name: 'Mulai Tes Kesehatan' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Pelajari Lebih Lanjut' })).toBeVisible();
    });

    test('menampilkan ikon kesehatan di hero', async ({ page }) => {
        const hero = page.locator('.animate-float');
        await expect(hero.locator('.material-symbols-outlined')).toHaveText('health_and_safety');
    });

    test('fitur unggulan section lengkap', async ({ page }) => {
        await expect(page.getByText('Fitur Unggulan Kami')).toBeVisible();
        await expect(page.getByText('Healy AI Consultant')).toBeVisible();
        await expect(page.getByText('Health Assessments')).toBeVisible();
        await expect(page.getByText('Dashboard Keluarga')).toBeVisible();
        await expect(page.getByText('Tips Harian')).toBeVisible();
    });

    test('navigasi ke halaman login', async ({ page }) => {
        await page.getByRole('link', { name: 'Masuk' }).first().click();
        await expect(page).toHaveURL('/login');
    });

    test('navigasi ke halaman register', async ({ page }) => {
        await page.getByRole('link', { name: 'Daftar' }).first().click();
        await expect(page).toHaveURL('/register');
    });

    test('CTA section siap memulai', async ({ page }) => {
        await expect(page.getByText('Siap Memulai Perjalanan Hidup Sehat')).toBeVisible();
        await expect(page.getByRole('link', { name: 'Daftar Sekarang' })).toBeVisible();
    });

    test('footer memiliki elemen kebijakan', async ({ page }) => {
        await expect(page.getByText('Healy Digital Health')).toBeVisible();
        await expect(page.getByText('Kebijakan Privasi')).toBeVisible();
        await expect(page.getByText('Ketentuan Layanan')).toBeVisible();
        await expect(page.getByText('Hubungi Kami')).toBeVisible();
    });
});
