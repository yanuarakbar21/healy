import { test, expect } from '@playwright/test';

test.describe('Halaman Login', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
    });

    test('menampilkan form login dengan elemen utama', async ({ page }) => {
        await expect(page.getByText('Selamat Datang')).toBeVisible();
        await expect(page.getByText('Masuk ke akun Healy Anda')).toBeVisible();
        await expect(page.getByPlaceholder('nama@email.com')).toBeVisible();
        await expect(page.getByPlaceholder('••••••••')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible();
    });

    test('tautan navigasi ke register', async ({ page }) => {
        await expect(page.getByRole('link', { name: 'Daftar' })).toBeVisible();
    });

    test('tautan navigasi ke beranda', async ({ page }) => {
        await expect(page.getByRole('link', { name: 'Healy' })).toBeVisible();
    });
});

test.describe('Halaman Register', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/register');
    });

    test('menampilkan form register dengan elemen utama', async ({ page }) => {
        await expect(page.getByText('Buat Akun')).toBeVisible();
        await expect(page.getByText('Mulai perjalanan kesehatan Anda')).toBeVisible();
        await expect(page.getByPlaceholder('Nama Lengkap')).toBeVisible();
        await expect(page.getByPlaceholder('nama@email.com')).toBeVisible();
        await expect(page.getByPlaceholder('Minimal 6 karakter')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Daftar' })).toBeVisible();
    });

    test('tautan navigasi ke login', async ({ page }) => {
        await expect(page.getByRole('link', { name: 'Masuk' })).toBeVisible();
    });
});
