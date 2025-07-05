import { DataProvider, Identifier } from 'react-admin';
import {
    COMPANY_CREATED,
    CONTACT_CREATED,
    CONTACT_NOTE_CREATED,
    DEAL_CREATED,
    DEAL_NOTE_CREATED,
} from '../../consts';
import {
    Activity,
    Contact,
    ContactNote,
    Deal,
    DealNote,
    Organization,
} from '../../types';

// FIXME: Requires 5 large queries to get the latest activities.
// Replace with a server-side view or a custom API endpoint.
export async function getActivityLog(
    dataProvider: DataProvider,
    organizationId?: Identifier,
    brokerId?: Identifier
) {
    let companyFilter = {} as any;
    if (organizationId) {
        companyFilter.id = organizationId;
    } else if (brokerId) {
        companyFilter['createdBy@in'] = `(${brokerId})`;
    }

    let filter = {} as any;
    if (organizationId) {
        filter.organizationId = organizationId;
    } else if (brokerId) {
        filter['createdBy@in'] = `(${brokerId})`;
    }

    const [newOrganizations, newContactsAndNotes, newDealsAndNotes] =
        await Promise.all([
            getNewOrganizations(dataProvider, companyFilter),
            getNewContactsAndNotes(dataProvider, filter),
            getNewDealsAndNotes(dataProvider, filter),
        ]);
    return (
        [...newOrganizations, ...newContactsAndNotes, ...newDealsAndNotes]
            // sort by date desc
            .sort((a, b) =>
                a.date && b.date ? a.date.localeCompare(b.date) * -1 : 0
            )
            // limit to 250 activities
            .slice(0, 250)
    );
}

const getNewOrganizations = async (
    dataProvider: DataProvider,
    filter: any
): Promise<Activity[]> => {
    const { data: organizations } = await dataProvider.getList<Organization>(
        'organizations',
        {
            filter,
            pagination: { page: 1, perPage: 250 },
            sort: { field: 'createdAt', order: 'DESC' },
        }
    );
    return organizations.map(organization => ({
        id: `organization.${organization.id}.created`,
        type: COMPANY_CREATED, // Keep constant name for backwards compatibility
        organizationId:
            typeof organization.id === 'number' ? organization.id : Number(organization.id),
        organization: {
            id:
                typeof organization.id === 'number'
                    ? organization.id
                    : Number(organization.id),
            name: organization.name ?? '',
            phone: organization.phone,
            website: organization.website,
            address: organization.address,
            city: organization.city,
            zipcode: organization.zipcode,
            createdAt: organization.createdAt,
            updatedAt: organization.updatedAt,
        },
        brokerId: 0,
        date: organization.createdAt,
    }));
};

async function getNewContactsAndNotes(
    dataProvider: DataProvider,
    filter: any
): Promise<Activity[]> {
    const { data: contacts } = await dataProvider.getList<Contact>('contacts', {
        filter,
        pagination: { page: 1, perPage: 250 },
        sort: { field: 'createdAt', order: 'DESC' },
    });

    let recentContactNotesFilter = {} as any;
    if (filter.createdBy) {
        recentContactNotesFilter.createdBy = filter.createdBy;
    }
    if (filter.organizationId) {
        // No organizationId field in contactNote, filtering by related contacts instead.
        // This filter is only valid if a company has less than 250 contact.
        const contactIds = contacts.map(contact => contact.id).join(',');
        recentContactNotesFilter['contact_id@in'] = `(${contactIds})`;
    }

    const { data: contactNotes } = await dataProvider.getList<ContactNote>(
        'contactNotes',
        {
            filter: recentContactNotesFilter,
            pagination: { page: 1, perPage: 250 },
            sort: { field: 'date', order: 'DESC' },
        }
    );

    const newContacts = contacts.map(contact => ({
        id: `contact.${contact.id}.created`,
        type: CONTACT_CREATED,
        organizationId: contact.organizationId,
        contactId: contact.id,
        contact,
        brokerId: 0,
        date: contact.createdAt,
    }));

    const newContactNotes = contactNotes.map(contactNote => ({
        id: `contactNote.${contactNote.id}.created`,
        type: CONTACT_NOTE_CREATED,
        organizationId: contactNote.organizationId,
        contactId: contactNote.contactId,
        contactNote: {
            id: contactNote.id,
            contactId: contactNote.contactId,
            organizationId: contactNote.organizationId,
            content: contactNote.content,
            subject: contactNote.subject,
            status: contactNote.status,
            createdAt: contactNote.createdAt,
            updatedAt: contactNote.updatedAt,
            createdBy: contactNote.createdBy,
        },
        brokerId: 0,
        date: contactNote.createdAt,
    }));

    return [...newContacts, ...newContactNotes];
}

async function getNewDealsAndNotes(
    dataProvider: DataProvider,
    filter: any
): Promise<Activity[]> {
    const { data: deals } = await dataProvider.getList<Deal>('deals', {
        filter,
        pagination: { page: 1, perPage: 250 },
        sort: { field: 'createdAt', order: 'DESC' },
    });

    let recentDealNotesFilter = {} as any;
    if (filter.createdBy) {
        recentDealNotesFilter.createdBy = filter.createdBy;
    }
    if (filter.organizationId) {
        // No organizationId field in dealNote, filtering by related deals instead.
        // This filter is only valid if a deal has less than 250 notes.
        const dealIds = deals.map(deal => deal.id).join(',');
        recentDealNotesFilter['deal_id@in'] = `(${dealIds})`;
    }

    const { data: dealNotes } = await dataProvider.getList<DealNote>(
        'dealNotes',
        {
            filter: recentDealNotesFilter,
            pagination: { page: 1, perPage: 250 },
            sort: { field: 'date', order: 'DESC' },
        }
    );

    const newDeals = deals.map(deal => ({
        id: `deal.${deal.id}.created`,
        type: DEAL_CREATED,
        organizationId: deal.organizationId,
        contactId: deal.contactId,
        dealId: deal.id,
        deal,
        brokerId: 0,
        date: deal.createdAt,
    }));

    const newDealNotes = dealNotes.map(dealNote => ({
        id: `dealNote.${dealNote.id}.created`,
        type: DEAL_NOTE_CREATED,
        organizationId: dealNote.organizationId,
        dealId: dealNote.dealId,
        dealNote: {
            id: dealNote.id,
            dealId: dealNote.dealId,
            organizationId: dealNote.organizationId,
            content: dealNote.content,
            subject: dealNote.subject,
            status: dealNote.status,
            createdAt: dealNote.createdAt,
            updatedAt: dealNote.updatedAt,
            createdBy: dealNote.createdBy,
        },
        brokerId: 0,
        date: dealNote.createdAt,
    }));

    return [...newDeals, ...newDealNotes];
}
