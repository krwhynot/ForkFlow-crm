import { expect, Page } from '@playwright/test';

export interface ReminderTestData {
    id?: string;
    title: string;
    dueDate: string;
    notes?: string;
    userId?: string;
}

export function generateReminder(seed: number = Date.now()): ReminderTestData {
    return {
        title: `TestReminder${seed}`,
        dueDate: new Date(seed).toISOString().split('T')[0],
        notes: `Reminder notes ${seed}`,
        userId: undefined,
    };
}

export async function createReminder(page: Page, data: ReminderTestData): Promise<string | undefined> {
    // TODO: Implement reminder creation (UI or API)
    expect(data.title).toContain('TestReminder');
    return undefined;
}

export async function deleteReminder(page: Page, reminderId: string): Promise<void> {
    // TODO: Implement reminder deletion (UI or API)
} 