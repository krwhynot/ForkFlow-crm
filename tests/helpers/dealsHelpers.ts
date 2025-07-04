import { Page, expect } from '@playwright/test';

export class DealsPage {
    constructor(private page: Page) {}

    async gotoList() {
        await this.page.goto('/deals');
        await expect(this.page).toHaveURL(/\/deals/);
    }

    async clickCreate() {
        await this.page.click('button:has-text("Create Deal")');
    }

    async fillForm(data: { title: string; value: number; stage: string }) {
        await this.page.fill('input[name="title"]', data.title);
        await this.page.fill('input[name="value"]', data.value.toString());
        await this.page.selectOption('select[name="stage"]', data.stage);
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
