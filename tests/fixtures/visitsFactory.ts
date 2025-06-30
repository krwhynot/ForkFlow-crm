import { expect, Page } from '@playwright/test';

export interface VisitTestData {
    id?: string;
    date: string;
    location: string;
    notes?: string;
    customerId?: string;
}

export function generateVisit(seed: number = Date.now()): VisitTestData {
    return {
        date: new Date(seed).toISOString().split('T')[0],
        location: `TestLocation${seed}`,
        notes: `Visit notes ${seed}`,
        customerId: undefined,
    };
}

export async function createVisit(page: Page, data: VisitTestData): Promise<string | undefined> {
    // TODO: Implement visit creation (UI or API)
    expect(data.location).toContain('TestLocation');
    return undefined;
}

export async function deleteVisit(page: Page, visitId: string): Promise<void> {
    // TODO: Implement visit deletion (UI or API)
} 