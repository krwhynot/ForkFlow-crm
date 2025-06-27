import { Db } from './types';

export const finalize = (db: Db) => {
    // set contact status according to the latest note
    db.contactNotes
        .sort((a, b) => new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf())
        .forEach(note => {
            const contactId = note.contactId;
            if (contactId && db.contacts[contactId as number]) {
                // Removed: db.contacts[contactId as number].status = note.status;
            }
        });
};
