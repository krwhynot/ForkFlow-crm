import { Page, expect } from '@playwright/test';

export class ProductsPage {
    constructor(private page: Page) {}

    async gotoList() {
        await this.page.goto('/products');
        await expect(this.page).toHaveURL(/\/products/);
    }

    async clickCreate() {
        await this.page.click('button:has-text("Create Product")');
    }

    async fillForm(data: {
        name: string;
        price: number;
        sku: string;
        description?: string;
    }) {
        await this.page.fill('input[name="name"]', data.name);
        await this.page.fill('input[name="price"]', data.price.toString());
        await this.page.fill('input[name="sku"]', data.sku);
        if (data.description) {
            await this.page.fill(
                'textarea[name="description"]',
                data.description
            );
        }
    }

    async submitForm() {
        await this.page.click('button[type="submit"]');
    }

    async deleteByName(name: string) {
        await this.page.click(
            `tr:has-text("${name}") button:has-text("Delete")`
        );
        await this.page.click('button:has-text("Confirm")');
    }
}
