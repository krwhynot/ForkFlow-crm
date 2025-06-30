import { expect, test } from '@playwright/test';
import { AuthHelpers } from '../helpers/authHelpers';

test.describe('Authentication - Sign Up', () => {
    test('should require all mandatory fields', async ({ page }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignUp();
        await auth.submitSignUp();
        await auth.expectFieldError('firstName', 'First name is required');
        await auth.expectFieldError('email', 'Email is required');
        await auth.expectFieldError('password', 'Password is required');
        await auth.expectFieldError('confirmPassword', 'Please confirm your password');
    });

    test('should enforce password rules', async ({ page }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignUp();
        await auth.fillSignUpForm({ firstName: 'Test', email: 'test@example.com', password: 'short', confirmPassword: 'short' });
        await auth.submitSignUp();
        await auth.expectFieldError('password', 'Password must be at least 8 characters and include a number, uppercase, and special character');
    });

    test('should require matching passwords', async ({ page }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignUp();
        await auth.fillSignUpForm({ firstName: 'Test', email: 'test@example.com', password: 'Password123!', confirmPassword: 'Password1234!' });
        await auth.submitSignUp();
        await auth.expectFieldError('confirmPassword', 'Passwords do not match');
    });

    test('should show activation message after successful sign up', async ({ page }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignUp();
        await auth.fillSignUpForm({ firstName: 'Test', email: 'newuser@example.com', password: 'Password123!', confirmPassword: 'Password123!' });
        await auth.submitSignUp();
        await expect(page.locator('[data-testid="activation-message"]')).toBeVisible();
    });

    test('should redirect existing users to sign in', async ({ page }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignUp();
        await auth.fillSignUpForm({ firstName: 'Test', email: 'user@example.com', password: 'Password123!', confirmPassword: 'Password123!' });
        await auth.submitSignUp();
        await expect(page).toHaveURL('/login');
    });

    test('should be accessible', async ({ page }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignUp();
        await auth.checkAccessibility();
    });

    test('should show error for duplicate email', async ({ page }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignUp();
        await auth.fillSignUpForm({ firstName: 'Test', email: 'user@example.com', password: 'Password123!', confirmPassword: 'Password123!' });
        await auth.submitSignUp();
        await auth.expectErrorMessage('An account with this email already exists');
    });

    test('should sanitize SQLi and XSS input', async ({ page }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignUp();
        await auth.fillSignUpForm({ firstName: "' OR 1=1;--", email: '<script>alert(1)</script>', password: 'Password123!', confirmPassword: 'Password123!' });
        await auth.submitSignUp();
        await auth.expectErrorMessage('Invalid input');
    });

    test('should support full keyboard navigation', async ({ page }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignUp();
        await page.keyboard.press('Tab'); // First name
        await page.keyboard.press('Tab'); // Email
        await page.keyboard.press('Tab'); // Password
        await page.keyboard.press('Tab'); // Confirm password
        await page.keyboard.press('Tab'); // Submit
        await auth.fillSignUpForm({ firstName: 'Test', email: 'newuser@example.com', password: 'Password123!', confirmPassword: 'Password123!' });
        await page.keyboard.press('Enter');
        await expect(page.locator('[data-testid="activation-message"]')).toBeVisible();
    });

    test('should have proper ARIA attributes for screen readers', async ({ page }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignUp();
        const emailInput = page.locator('[data-testid="email"]');
        await expect(emailInput).toHaveAttribute('aria-label');
        const error = page.locator('[data-testid="error-message"]');
        await expect(error).toHaveAttribute('aria-live', 'polite');
    });

    test('should support email verification flow', async ({ page }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignUp();
        await auth.fillSignUpForm({ firstName: 'Test', email: 'verifyme@example.com', password: 'Password123!', confirmPassword: 'Password123!' });
        await auth.submitSignUp();
        await expect(page.locator('[data-testid="activation-message"]')).toBeVisible();
    });

    test('should support password reset from sign up', async ({ page }) => {
        await page.goto('/forgot-password');
        await page.fill('[data-testid="email"]', 'user@example.com');
        await page.click('[data-testid="submit"]');
        await expect(page.locator('[data-testid="reset-message"]')).toBeVisible();
    });

    test('should support MFA challenge after sign up', async ({ page }) => {
        const auth = new AuthHelpers(page);
        await auth.gotoSignUp();
        await auth.fillSignUpForm({ firstName: 'MFA', email: 'mfauser@example.com', password: 'Password123!', confirmPassword: 'Password123!' });
        await auth.submitSignUp();
        await expect(page.locator('[data-testid="mfa-challenge"]')).toBeVisible();
        await page.fill('[data-testid="mfa-code"]', '123456');
        await page.click('[data-testid="submit-mfa"]');
        await expect(page).toHaveURL('/dashboard');
    });

    test('should load the sign-up page without JS or console errors', async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (err) => errors.push(err.message));
        page.on('console', msg => {
            if (msg.type() === 'error') errors.push(msg.text());
        });

        await page.goto('/signup');
        await expect(page.locator('[data-testid="firstName"]')).toBeVisible();
        await expect(page.locator('[data-testid="email"]')).toBeVisible();
        await expect(page.locator('[data-testid="password"]')).toBeVisible();
        await expect(page.locator('[data-testid="submit"]')).toBeVisible();

        expect(errors).toEqual([]);
    });
}); 