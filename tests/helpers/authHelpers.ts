import AxeBuilder from '@axe-core/playwright';
import { Page, expect } from '@playwright/test';

export class AuthHelpers {
    constructor(private page: Page) {}

    async gotoSignIn() {
        await this.page.goto('/login');
    }

    async gotoSignUp() {
        await this.page.goto('/signup');
    }

    async fillSignInForm(email: string, password: string) {
        await this.page.fill('[data-testid="email"]', email);
        await this.page.fill('[data-testid="password"]', password);
    }

    async submitSignIn() {
        await this.page.click('[data-testid="submit"]');
    }

    async fillSignUpForm(data: {
        firstName: string;
        email: string;
        password: string;
        confirmPassword: string;
    }) {
        await this.page.fill('[data-testid="firstName"]', data.firstName);
        await this.page.fill('[data-testid="email"]', data.email);
        await this.page.fill('[data-testid="password"]', data.password);
        await this.page.fill(
            '[data-testid="confirmPassword"]',
            data.confirmPassword
        );
    }

    async submitSignUp() {
        await this.page.click('[data-testid="submit"]');
    }

    async expectErrorMessage(message: string) {
        await expect(
            this.page.locator('[data-testid="error-message"]')
        ).toHaveText(message);
    }

    async expectFieldError(field: string, message: string) {
        await expect(
            this.page.locator(`[data-testid="${field}-error"]`)
        ).toHaveText(message);
    }

    async expectSubmitDisabled() {
        await expect(
            this.page.locator('[data-testid="submit"]')
        ).toBeDisabled();
    }

    async expectSubmitEnabled() {
        await expect(this.page.locator('[data-testid="submit"]')).toBeEnabled();
    }

    async togglePasswordVisibility() {
        await this.page.click('[data-testid="toggle-password-visibility"]');
    }

    async checkAccessibility() {
        const results = await new AxeBuilder({ page: this.page }).analyze();
        expect(results.violations).toEqual([]);
    }

    async checkSessionCookieSecure() {
        const cookies = await this.page.context().cookies();
        expect(cookies.some(c => c.secure && c.httpOnly)).toBe(true);
    }

    async gotoForgotPassword() {
        await this.page.goto('/forgot-password');
    }

    async fillForgotPassword(email: string) {
        await this.page.fill('[data-testid="email"]', email);
    }

    async submitForgotPassword() {
        await this.page.click('[data-testid="submit"]');
    }

    async expectResetMessage() {
        await expect(
            this.page.locator('[data-testid="reset-message"]')
        ).toBeVisible();
    }

    async fillMfaCode(code: string) {
        await this.page.fill('[data-testid="mfa-code"]', code);
    }

    async submitMfa() {
        await this.page.click('[data-testid="submit-mfa"]');
    }

    async expectMfaChallenge() {
        await expect(
            this.page.locator('[data-testid="mfa-challenge"]')
        ).toBeVisible();
    }
}
