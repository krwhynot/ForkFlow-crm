import { Page, expect } from '@playwright/test';

export class VisitsPage {
    constructor(private page: Page) {}

    async gotoList() {
        await this.page.goto('/visits');
        await expect(this.page).toHaveURL(/\/visits/);
    }

    async clickCreate() {
        await this.page.click('button:has-text("Create Visit")');
    }

    async fillForm(data: { date: string; location: string; notes?: string }) {
        await this.page.fill('input[name="date"]', data.date);
        await this.page.fill('input[name="location"]', data.location);
        if (data.notes) {
            await this.page.fill('textarea[name="notes"]', data.notes);
        }
    }

    async submitForm() {
        await this.page.click('button[type="submit"]');
    }

    async deleteByLocation(location: string) {
        await this.page.click(
            `tr:has-text("${location}") button:has-text("Delete")`
        );
        await this.page.click('button:has-text("Confirm")');
    }
}
