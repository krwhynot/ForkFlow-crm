import { expect, Page } from '@playwright/test';

/**
 * Contact test data type
 */
export interface ContactTestData {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    companyId?: string;
}

/**
 * Deterministically generates a contact test data object
 * @param seed - Optional seed for deterministic data
 */
export function generateContact(seed: number = Date.now()): ContactTestData {
    return {
        firstName: `TestFirst${seed}`,
        lastName: `TestLast${seed}`,
        email: `test${seed}@example.com`,
        phone: `555-01${String(seed).slice(-4)}`,
        companyId: undefined,
    };
}

/**
 * Creates a contact via UI or API (to be implemented)
 * @param page Playwright page
 * @param data ContactTestData
 * @returns The created contact's ID (if available)
 */
export async function createContact(
    page: Page,
    data: ContactTestData
): Promise<string | undefined> {
    // TODO: Implement contact creation (UI or API)
    // Example: await page.goto('/contacts/create');
    // Fill form fields, submit, and return new contact ID
    expect(data.email).toContain('@'); // Example validation
    return undefined;
}

/**
 * Deletes a contact via UI or API (to be implemented)
 * @param page Playwright page
 * @param contactId Contact ID
 */
export async function deleteContact(
    page: Page,
    contactId: string
): Promise<void> {
    // TODO: Implement contact deletion (UI or API)
    // Example: await page.goto(`/contacts/${contactId}`); await page.click('Delete');
}
