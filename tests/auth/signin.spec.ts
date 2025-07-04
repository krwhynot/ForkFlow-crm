import { expect, test } from '@playwright/test';
import { AuthHelpers } from '../helpers/authHelpers';

test.describe('Authentication - Sign In', () => {
    test('should login with valid credentials', async ({ page }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignIn();
        await auth.fillSignInForm('user@example.com', 'Password123!');
        await auth.submitSignIn();
        await expect(page).toHaveURL('/dashboard');
    });

    test('should show error for invalid credentials', async ({ page }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignIn();
        await auth.fillSignInForm('user@example.com', 'WrongPassword');
        await auth.submitSignIn();
        await auth.expectErrorMessage('Email or password incorrect');
    });

    test('should disable submit until fields are filled', async ({ page }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignIn();
        await auth.expectSubmitDisabled();
        await auth.fillSignInForm('user@example.com', '');
        await auth.expectSubmitDisabled();
        await auth.fillSignInForm('user@example.com', 'Password123!');
        await auth.expectSubmitEnabled();
    });

    test('should allow pressing Enter to submit', async ({ page }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignIn();
        await auth.fillSignInForm('user@example.com', 'Password123!');
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL('/dashboard');
    });

    test('should toggle password visibility', async ({ page }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignIn();
        await auth.fillSignInForm('user@example.com', 'Password123!');
        await auth.togglePasswordVisibility();
        // Optionally check input type or visibility
    });

    test('should be accessible', async ({ page }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignIn();
        await auth.checkAccessibility();
    });

    test('should set Secure and HttpOnly on session cookie after login', async ({
        page,
    }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignIn();
        await auth.fillSignInForm('user@example.com', 'Password123!');
        await auth.submitSignIn();
        await auth.checkSessionCookieSecure();
    });

    test('should lock out after multiple failed attempts', async ({ page }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignIn();
        for (let i = 0; i < 5; i++) {
            await auth.fillSignInForm('user@example.com', 'WrongPassword');
            await auth.submitSignIn();
        }
        await auth.expectErrorMessage('Account locked. Try again later.');
    });

    test('should sanitize SQLi and XSS input', async ({ page }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignIn();
        await auth.fillSignInForm("' OR 1=1;--", '<script>alert(1)</script>');
        await auth.submitSignIn();
        await auth.expectErrorMessage('Email or password incorrect');
    });

    test('should support full keyboard navigation', async ({ page }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignIn();
        await page.keyboard.press('Tab'); // Email
        await page.keyboard.press('Tab'); // Password
        await page.keyboard.press('Tab'); // Submit
        await auth.fillSignInForm('user@example.com', 'Password123!');
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL('/dashboard');
    });

    test('should have proper ARIA attributes for screen readers', async ({
        page,
    }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignIn();
        const emailInput = page.locator('[data-testid="email"]');
        await expect(emailInput).toHaveAttribute('aria-label');
        const error = page.locator('[data-testid="error-message"]');
        await expect(error).toHaveAttribute('aria-live', 'polite');
    });

    test('should support password reset flow', async ({ page }) => {
        await page.goto('/forgot-password');
        await page.fill('[data-testid="email"]', 'user@example.com');
        await page.click('[data-testid="submit"]');
        await expect(
            page.locator('[data-testid="reset-message"]')
        ).toBeVisible();
    });

    test('should support MFA challenge', async ({ page }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignIn();
        await auth.fillSignInForm('mfauser@example.com', 'Password123!');
        await auth.submitSignIn();
        await expect(
            page.locator('[data-testid="mfa-challenge"]')
        ).toBeVisible();
        await page.fill('[data-testid="mfa-code"]', '123456');
        await page.click('[data-testid="submit-mfa"]');
        await expect(page).toHaveURL('/dashboard');
    });

    test('should load the sign-in page without JS or console errors', async ({
        page,
    }) => {
        const errors: string[] = [];
        page.on('pageerror', err => errors.push(err.message));
        page.on('console', msg => {
            if (msg.type() === 'error') errors.push(msg.text());
        });

        await page.goto('/login');
        await expect(page.locator('[data-testid="email"]')).toBeVisible();
        await expect(page.locator('[data-testid="password"]')).toBeVisible();
        await expect(page.locator('[data-testid="submit"]')).toBeVisible();

        expect(errors).toEqual([]);
    });
});
