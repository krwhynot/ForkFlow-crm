/* eslint-disable import/no-anonymous-default-export */
import { Contact } from '../../../types';
import { generateB2BContacts } from './b2bContacts';
import { generateCompanies } from './companies';
import { generateContactNotes } from './contactNotes';
import { generateDealNotes } from './dealNotes';
import { generateDeals } from './deals';
import { finalize } from './finalize';
import { generateOrganizations } from './organizations';
import { generateSales } from './sales';
import { generateSettings } from './settings';
import { generateTags } from './tags';
import { generateTasks } from './tasks';
import { Db } from './types';

export default (): Db => {
    const db = {} as Db;
    db.sales = generateSales(db);
    db.tags = generateTags(db);
    db.companies = generateCompanies(db);

    // Generate B2B resources
    db.settings = generateSettings(db);
    db.organizations = generateOrganizations(db);
    db.contacts = generateB2BContacts(db) as Required<Contact>[]; // Override old contacts with B2B schema

    // Generate legacy resources
    db.contactNotes = generateContactNotes(db);
    db.deals = generateDeals(db);
    db.dealNotes = generateDealNotes(db);
    db.tasks = generateTasks(db);
    finalize(db);

    return db;
};
