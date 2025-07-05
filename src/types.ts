// Core Types for ForkFlow CRM
// Based on data generators and component usage patterns

export type SignUpData = {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
};

// File handling types
export interface RAFile {
    src?: string;
    title?: string;
    path?: string;
    rawFile?: File;
}

// Setting types for configuration and categories
export interface Setting {
    id: number;
    category: string; // 'priority', 'segment', 'stage', 'role', 'influence', 'decision', 'principal', etc.
    key: string;
    label: string;
    color: string;
    sortOrder: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

// Organization/Company types - Enhanced for roadmap implementation
export interface Organization {
    id: number;
    name: string;
    business_name?: string; // alias for name
    logo?: string;
    sector?: string;
    size?: 'Very Small' | 'Small' | 'Medium' | 'Big' | 'Very Big';
    linkedin_url?: string;
    website?: string;
    phone_number?: string;
    phone?: string; // alias for phone_number
    email: string;
    contact_person?: string;
    address?: string;
    zipcode?: string;
    city?: string;
    stateAbbr?: string;
    nb_contacts?: number;
    nb_deals?: number;
    business_type?: 'restaurant' | 'grocery' | 'distributor' | 'other';
    salesId?: number;
    broker_id?: number;
    distributorId?: number;
    organizationId?: number;
    // Additional properties from component usage
    revenue?: number;
    tax_identifier?: string;
    description?: string;
    context_links?: Array<{ name: string; url: string }>;
    createdAt: string;
    updatedAt?: string;
    // Enhanced fields for roadmap features
    priority?: 'high' | 'medium' | 'low';
    segment?: string;
    status?: 'prospect' | 'active' | 'inactive' | 'closed';
    tags?: string[];
    // GPS coordinates for map functionality
    latitude?: number;
    longitude?: number;
    // Enhanced metadata
    lastContactDate?: string;
    nextFollowUpDate?: string;
    notes?: string;
    // Performance metrics
    totalDealsValue?: number;
    averageDealSize?: number;
    conversionRate?: number;
    // Account management
    assignedSalesRep?: string;
    accountManager?: string;
}

// Legacy Company type for compatibility
export interface Company extends Organization { }

// Organization-specific types for enhanced features
export interface OrganizationFilter {
    q?: string; // search query
    priority?: 'high' | 'medium' | 'low';
    segment?: string;
    status?: 'prospect' | 'active' | 'inactive' | 'closed';
    business_type?: 'restaurant' | 'grocery' | 'distributor' | 'other';
    size?: 'Very Small' | 'Small' | 'Medium' | 'Big' | 'Very Big';
    broker_id?: number;
    hasDeals?: boolean;
    revenueMin?: number;
    revenueMax?: number;
}

export interface OrganizationListViewMode {
    mode: 'table' | 'cards' | 'kanban' | 'map';
    sortField: string;
    sortOrder: 'ASC' | 'DESC';
    itemsPerPage: number;
}

export interface OrganizationFormData
    extends Omit<Organization, 'id' | 'createdAt'> {
    // Form-specific fields for creation/editing
    confirmEmail?: string;
    agreedToTerms?: boolean;
    captureGPS?: boolean;
}

export interface TouchTarget {
    minHeight: number;
    minWidth: number;
}

// Contact types
export interface Contact {
    id: number;
    firstName: string;
    lastName: string;
    first_name?: string; // legacy compatibility
    last_name?: string; // legacy compatibility
    fullName?: string;
    email: string;
    phone?: string;
    avatar?: RAFile;
    title?: string;
    role?: Setting;
    influenceLevel?: Setting;
    decisionRole?: Setting;
    organizationId?: number;
    companyId?: number; // legacy compatibility
    company?: Company; // relationship
    organization?: Organization; // relationship
    gender?: string;
    background?: string;
    first_seen?: string;
    last_seen?: string;
    newsletter?: boolean;
    status?: string;
    tags?: Tag[];
    linkedin_url?: string;
    // Additional properties from component usage
    nb_tasks?: number;
    createdAt?: string;
    updatedAt?: string;
}

// Deal types
export interface Deal {
    id: number;
    name?: string;
    organizationId?: number;
    company_id?: number; // legacy compatibility
    organization?: Organization;
    company?: Company; // legacy compatibility
    contactId?: number;
    contact?: Contact;
    productIds?: number[];
    products?: Product[];
    stage: string;
    stageId?: number;
    stageSetting?: Setting;
    amount?: number;
    expected_close_date?: string;
    description?: string;
    notes?: string;
    salesId?: number;
    sales?: Sale;
    category?: string;
    probability?: number;
    createdAt: string;
    updatedAt?: string;
}

// Product types
export interface Product {
    [key: string]: any;
    id: number;
    name: string;
    sku?: string;
    category?: string;
    description?: string;
    unitOfMeasure?: string;
    packageSize?: string;
    costPerUnit?: number;
    pricePerUnit?: number;
    principalId?: number;
    principal?: Setting;
    active?: boolean;
    image?: RAFile;
    createdAt: string;
    updatedAt?: string;
}

// Sales/User types
export interface Sale {
    id: number;
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    password?: string;
    administrator: boolean;
    avatar?: RAFile;
    phone?: string;
    title?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Note types
export interface ContactNote {
    id: number;
    contactId: number;
    contact?: Contact;
    text: string;
    status?: string;
    date?: string;
    salesId?: number;
    sales?: Sale;
    createdAt: string;
    updatedAt?: string;
}

export interface DealNote {
    id: number;
    dealId: number;
    deal?: Deal;
    text: string;
    status?: string;
    date?: string;
    salesId?: number;
    sales?: Sale;
    createdAt: string;
    updatedAt?: string;
}

// Task types
export interface Task {
    id: number;
    title: string;
    description?: string;
    due_date?: string;
    completed?: boolean;
    priority?: string;
    prioritySetting?: Setting;
    type?: string;
    typeSetting?: Setting;
    contactId?: number;
    contact?: Contact;
    dealId?: number;
    deal?: Deal;
    salesId?: number;
    sales?: Sale;
    createdAt: string;
    updatedAt?: string;
}

// Tag types
export interface Tag {
    id: number;
    name: string;
    color?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Interaction types (for the interactions module)
export interface Interaction {
    id: number;
    type: string; // 'email', 'call', 'meeting', 'visit', etc.
    typeSetting?: Setting;
    subject?: string;
    description?: string;
    date: string;
    duration?: number;
    contactId?: number;
    contact?: Contact;
    organizationId?: number;
    organization?: Organization;
    dealId?: number;
    deal?: Deal;
    salesId?: number;
    sales?: Sale;
    outcome?: string;
    followUpRequired?: boolean;
    followUpDate?: string;
    attachments?: RAFile[];
    createdAt: string;
    updatedAt?: string;
}

// Opportunity types (alias for Deal with specific focus)
export interface Opportunity extends Deal {
    source?: string;
    estimatedValue?: number;
    weightedValue?: number;
    nextAction?: string;
    nextActionDate?: string;
}

// Contact gender configuration type
export interface ContactGender {
    value: string;
    label: string;
}

// Deal stage configuration type
export interface DealStage {
    id: string;
    label: string;
    color?: string;
    order?: number;
}

// Note status configuration type
export interface NoteStatus {
    id: string;
    label: string;
    color?: string;
}

// Legacy aliases for backwards compatibility
// Company is already defined as an interface extending Organization above

// Additional types needed by the application

// Authentication and User types
export interface User {
    id: number | string;
    user_id?: string;
    firstName?: string;
    lastName?: string;
    first_name?: string;
    last_name?: string;
    email: string;
    role?: UserRole;
    administrator?: boolean;
    avatar?: RAFile;
    phone?: string;
    title?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type UserRole = 'admin' | 'broker' | 'user' | 'manager';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    tokens: AuthTokens;
    success: boolean;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
}

export interface JWTPayload {
    sub: string;
    email: string;
    role: UserRole;
    exp: number;
    iat: number;
}

export interface BrokerFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetConfirm {
    token: string;
    password: string;
    confirmPassword: string;
}

export interface UserProfileUpdate {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: RAFile;
}

// Activity types
export interface Activity {
    id: number;
    type: string;
    entityType: string;
    entityId: number;
    description: string;
    metadata?: Record<string, any>;
    userId?: number;
    user?: User;
    createdAt: string;
}

export interface ActivityContactCreated extends Activity {
    entityType: 'contact';
    contact?: Contact;
}

export interface ActivityOrganizationCreated extends Activity {
    entityType: 'organization';
    organization?: Organization;
}

export interface ActivityContactNoteCreated extends Activity {
    entityType: 'contactNote';
    contactNote?: ContactNote;
}

export interface ActivityDealCreated extends Activity {
    entityType: 'deal';
    deal?: Deal;
}

export interface ActivityDealNoteCreated extends Activity {
    entityType: 'dealNote';
    dealNote?: DealNote;
}

// Visit and GPS types
export interface Visit {
    id: number;
    contactId?: number;
    contact?: Contact;
    organizationId?: number;
    organization?: Organization;
    date: string;
    visit_date: string;
    duration?: number;
    duration_minutes?: number;
    notes?: string;
    location?: GPSCoordinates;
    salesId?: number;
    sales?: Sale;
    createdAt: string;
    updatedAt?: string;
    latitude?: number;
    longitude?: number;
    total_visits?: number;
}

export interface GPSCoordinates {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp?: string;
}

export interface Customer extends Organization {
    // Customer-specific fields can be added here
}

export interface Order {
    id: number;
    order_date: string;
    total_amount: number;
    // Other order fields can be added here
}

export interface Reminder {
    id: number;
    title: string;
    customer_name: string;
    customer_id: number;
    reminder_date: string;
    is_completed: boolean;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    snooze_count: number;
    notes?: string;
    completed_at?: string;
    snoozed_until?: string;
}
