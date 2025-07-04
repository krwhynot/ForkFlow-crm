import { Page, expect } from '@playwright/test';

/**
 * ContactsPage helper for Playwright E2E tests
 * Encapsulates selectors and actions for the contacts UI
 */
export class ContactsPage {
    constructor(private page: Page) {}

    /**
     * Navigates to the contacts list page
     */
    async gotoList() {
        await this.page.goto('/contacts');
        await expect(this.page).toHaveURL(/\/contacts/);
    }

    /**
     * Clicks the 'Create Contact' button
     */
    async clickCreate() {
        await this.page.click('button:has-text("Create Contact")');
    }

    /**
     * Fills the contact form
     */
    async fillForm(data: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
    }) {
        await this.page.fill('input[name="firstName"]', data.firstName);
        await this.page.fill('input[name="lastName"]', data.lastName);
        await this.page.fill('input[name="email"]', data.email);
        if (data.phone) {
            await this.page.fill('input[name="phone"]', data.phone);
        }
    }

    /**
     * Submits the contact form
     */
    async submitForm() {
        await this.page.click('button[type="submit"]');
    }

    /**
     * Deletes a contact by email (UI-based, for demo)
     */
    async deleteByEmail(email: string) {
        await this.page.click(
            `tr:has-text("${email}") button:has-text("Delete")`
        );
        await this.page.click('button:has-text("Confirm")');
    }
}
