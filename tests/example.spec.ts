import { test, expect } from '@playwright/test';

test('Login to Krya Prepaid Application', async ({ page }) => {

    await page.goto('https://krya-prepaid-qa.kryasolutions.com/#/');

    await page.waitForLoadState('networkidle');

    // Verify Login Page
    await expect(page).toHaveURL(/krya-prepaid-qa/);

    // Enter credentials
    await page.locator('input[type="email"]').fill('your_username');
    await page.locator('input[type="password"]').fill('your_password');

    // Click Login
    await page.locator('button[type="submit"]').click();

    // Verify successful login
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(/login/);

});