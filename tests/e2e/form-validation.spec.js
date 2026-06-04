import { test, expect } from '@playwright/test';

test.describe('Validasi Form Login', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
    });

    test('input email memiliki type=email dan required', async ({ page }) => {
        const input = page.getByPlaceholder('nama@email.com');
        await expect(input).toHaveAttribute('type', 'email');
        await expect(input).toHaveAttribute('required', '');
    });

    test('input password memiliki type=password dan required', async ({ page }) => {
        const input = page.getByPlaceholder('••••••••');
        await expect(input).toHaveAttribute('type', 'password');
        await expect(input).toHaveAttribute('required', '');
    });

    test('submit form kosong dicegah HTML5 validation', async ({ page }) => {
        const submitBtn = page.getByRole('button', { name: 'Masuk' });

        await submitBtn.click();
        // Browser HTML5 validation prevents navigation
        await expect(page).toHaveURL('/login');
    });
});

test.describe('Validasi Form Register', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/register');
    });

    test('input nama required', async ({ page }) => {
        const input = page.getByPlaceholder('Nama Lengkap');
        await expect(input).toHaveAttribute('required', '');
    });

    test('input email type=email dan required', async ({ page }) => {
        const input = page.getByPlaceholder('nama@email.com');
        await expect(input).toHaveAttribute('type', 'email');
        await expect(input).toHaveAttribute('required', '');
    });

    test('input password minLength=6', async ({ page }) => {
        const input = page.getByPlaceholder('Minimal 6 karakter');
        await expect(input).toHaveAttribute('minLength', '6');
        await expect(input).toHaveAttribute('required', '');
    });

    test('tautan ke login sudah terlihat', async ({ page }) => {
        await expect(page.getByText('Sudah punya akun?')).toBeVisible();
        await expect(page.getByRole('link', { name: 'Masuk' })).toBeVisible();
    });
});
