import {
    Company,
    Contact,
    ContactNote,
    Deal,
    DealNote,
    Sale,
    Tag,
    Task,
    Organization,
    Setting,
    Product,
} from '../../../types';

export interface Db {
    companies: Required<Company>[];
    contacts: Required<Contact>[];
    contactNotes: ContactNote[];
    deals: Deal[];
    dealNotes: DealNote[];
    sales: Sale[];
    tags: Tag[];
    tasks: Task[];
    // B2B resources
    organizations?: Organization[];
    settings?: Setting[];
    products?: Product[];
    // Additional collections
    customer_summary?: any[];
    visits?: any[];
    reminders?: any[];
    orders?: any[];
}
