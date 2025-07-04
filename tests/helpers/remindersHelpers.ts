import { Page, expect } from '@playwright/test';

export class RemindersPage {
    constructor(private page: Page) {}

    async gotoList() {
        await this.page.goto('/reminders');
        await expect(this.page).toHaveURL(/\/reminders/);
    }

    async clickCreate() {
        await this.page.click('button:has-text("Create Reminder")');
    }

    async fillForm(data: { title: string; dueDate: string; notes?: string }) {
        await this.page.fill('input[name="title"]', data.title);
        await this.page.fill('input[name="dueDate"]', data.dueDate);
        if (data.notes) {
            await this.page.fill('textarea[name="notes"]', data.notes);
        }
    }

    async submitForm() {
        await this.page.click('button[type="submit"]');
    }

    async deleteByTitle(title: string) {
        await this.page.click(
            `tr:has-text("${title}") button:has-text("Delete")`
        );
        await this.page.click('button:has-text("Confirm")');
    }
}
