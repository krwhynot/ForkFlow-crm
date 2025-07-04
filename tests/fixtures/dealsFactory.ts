import { expect, Page } from '@playwright/test';

export interface DealTestData {
    id?: string;
    title: string;
    value: number;
    stage: string;
    contactId?: string;
}

export function generateDeal(seed: number = Date.now()): DealTestData {
    return {
        title: `TestDeal${seed}`,
        value: 1000 + (seed % 1000),
        stage: 'Prospecting',
        contactId: undefined,
    };
}

export async function createDeal(
    page: Page,
    data: DealTestData
): Promise<string | undefined> {
    // TODO: Implement deal creation (UI or API)
    expect(data.value).toBeGreaterThan(0);
    return undefined;
}

export async function deleteDeal(page: Page, dealId: string): Promise<void> {
    // TODO: Implement deal deletion (UI or API)
}
