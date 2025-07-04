import { expect, Page } from '@playwright/test';

export interface ProductTestData {
    id?: string;
    name: string;
    price: number;
    sku: string;
    description?: string;
}

export function generateProduct(seed: number = Date.now()): ProductTestData {
    return {
        name: `TestProduct${seed}`,
        price: 10 + (seed % 100),
        sku: `SKU${seed}`,
        description: `Product description ${seed}`,
    };
}

export async function createProduct(
    page: Page,
    data: ProductTestData
): Promise<string | undefined> {
    // TODO: Implement product creation (UI or API)
    expect(data.name).toContain('TestProduct');
    return undefined;
}

export async function deleteProduct(
    page: Page,
    productId: string
): Promise<void> {
    // TODO: Implement product deletion (UI or API)
}
