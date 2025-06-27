import { SvgIconComponent } from '@mui/icons-material';
import { Identifier, RaRecord } from 'react-admin';

// Food Broker CRM Types

// Settings System for B2B CRM
export type Setting = {
    id: number;
    category:
        | 'priority'
        | 'segment'
        | 'distributor'
        | 'role'
        | 'influence'
        | 'decision'
        | 'stage'
        | 'interaction_type'
        | 'principal';
    key: string;
    label: string;
    color?: string;
    sortOrder: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
} & Pick<RaRecord, 'id'>;

// Organizations - Core B2B Entity
export type Organization = {
    id: number;
    name: string;
    priorityId?: number;
    segmentId?: number;
    distributorId?: number;
    accountManager?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string;
    website?: string;
    notes?: string;
    latitude?: number;
    longitude?: number;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;

    // Computed fields with Settings relationships
    priority?: Setting;
    segment?: Setting;
    distributor?: Setting;
    contactCount?: number;
    lastContactDate?: string;
    totalOpportunities?: number;
    totalOpportunityValue?: number;
} & Pick<RaRecord, 'id'>;

// Contacts - Enhanced with B2B Relationships
export type Contact = {
    id: number;
    organizationId: number;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    roleId?: number;
    influenceLevelId?: number;
    decisionRoleId?: number;
    linkedInUrl?: string;
    isPrimary: boolean;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;

    // Computed fields with Settings relationships
    organization?: Organization;
    role?: Setting;
    influenceLevel?: Setting;
    decisionRole?: Setting;
    fullName?: string;
    lastInteractionDate?: string;
    interactionCount?: number;
    tags?: string[];
    
    // Additional field aliases for compatibility
    first_name?: string; // Alias for firstName
    last_name?: string;  // Alias for lastName
    first_seen?: string; // For data generator compatibility
    last_seen?: string;  // For data generator compatibility
    title?: string;      // For compatibility
    salesId?: Identifier; // For compatibility
    nb_tasks?: number;   // For compatibility
} & Pick<RaRecord, 'id'>;

// Products - Food Service Catalog Entity
export type Product = {
    id: number;
    name: string;
    principalId: number;
    category?: string;
    description?: string;
    sku: string;
    unitOfMeasure?: string;
    packageSize?: string;
    price: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;

    // Computed fields with Settings relationships
    principal?: Setting;
    
    // Additional computed fields
    displayPrice?: string;
    fullDescription?: string;
    categoryDisplay?: string;
    isAvailable?: boolean;
} & Pick<RaRecord, 'id'>;

export type SignUpData = {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
};

export type BrokerFormData = {
    avatar: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    administrator: boolean;
    disabled: boolean;
};

export type Broker = {
    first_name: string;
    last_name: string;
    administrator: boolean;
    avatar?: RAFile;
    disabled?: boolean;
    user_id: string;
    email: string;
    password?: string; // For fake rest provider only
} & Pick<RaRecord, 'id'>;

export type Customer = {
    business_name: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    phone_number?: string; // Additional field for compatibility
    address?: string;
    business_type: 'restaurant' | 'grocery' | 'distributor' | 'other';
    latitude?: number;
    longitude?: number;
    notes?: string;
    broker_id: Identifier;
    created_at: string;
    createdAt: string; // Additional field for compatibility
    updatedAt: string;

    // Company-specific fields for compatibility
    website?: string;
    linkedin_url?: string;
    logo?: string;
    revenue?: number;
    sector?: string;
    size?: 'Very Small' | 'Small' | 'Medium' | 'Big' | 'Very Big';
    tax_identifier?: string;
    city?: string;
    zipcode?: string;
    stateAbbr?: string;
    salesId?: Identifier;
    description?: string;
    context_links?: string[];
    
    // Contact-specific fields for compatibility
    name?: string; // Alias for business_name
    first_name?: string;
    last_name?: string;
    firstName?: string;
    lastName?: string;
    organizationId?: Identifier;
    isPrimary?: boolean;

    // Computed fields from views
    total_visits?: number;
    last_visit_date?: string;
    last_visit_notes?: string;
    visit_status?:
        | 'Never visited'
        | 'Needs attention'
        | 'Due for visit'
        | 'Recently visited';
    pending_reminders?: number;
    overdue_reminders?: number;
    nb_deals?: number;
    nb_contacts?: number;
} & Pick<RaRecord, 'id'>;

export type Visit = {
    customer_id: Identifier;
    broker_id: Identifier;
    visit_date: string;
    notes?: string;
    latitude?: number;
    longitude?: number;
    duration_minutes?: number;
    visit_type: string;
    created_at: string;
    updatedAt: string;

    // Computed fields
    customer_name?: string;
    distance_from_previous?: number;
} & Pick<RaRecord, 'id'>;

export type Reminder = {
    customer_id: Identifier;
    broker_id: Identifier;
    reminder_date: string;
    completed_at?: string;
    is_completed: boolean;
    title: string;
    notes?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    visit_id?: Identifier;
    snoozed_until?: string;
    snooze_count: number;
    created_at: string;
    updatedAt: string;
    
    // Additional fields for compatibility
    salesId?: Identifier;
    contact_id?: Identifier;
    text?: string;
    attachments?: any[];

    // Computed fields
    customer_name?: string;
    is_overdue?: boolean;
    days_until_due?: number;
} & Pick<RaRecord, 'id'>;

export type Product = {
    name: string;
    category: string;
    subcategory?: string;
    unit_price?: number;
    unit_type: string;
    description?: string;
    image_url?: string;
    sku?: string;
    is_active: boolean;
    allergens?: string[];
    dietary_tags?: string[];
    shelf_life_days?: number;
    storage_requirements?: string;
    created_at: string;
    updatedAt: string;
} & Pick<RaRecord, 'id'>;

export type OrderProduct = {
    product_id: Identifier;
    product_name: string;
    quantity: number;
    unit_price: number;
    total: number;
};

export type Order = {
    customer_id: Identifier;
    broker_id: Identifier;
    visit_id?: Identifier;
    order_date: string;
    expected_delivery_date?: string;
    products_jsonb: OrderProduct[];
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    discount_percent: number;
    status:
        | 'draft'
        | 'pending'
        | 'confirmed'
        | 'in_progress'
        | 'delivered'
        | 'cancelled'
        | 'on_hold';
    notes?: string;
    internal_notes?: string;
    commission_rate: number;
    commission_amount: number;
    created_at: string;
    updatedAt: string;
    
    // Additional fields for compatibility
    salesId?: Identifier;
    organizationId?: Identifier;
    name?: string;
    deal_id?: Identifier;
    stage?: string;
    index?: number;
    amount?: number;
    category?: string;
    archivedAt?: string;
    attachments?: any[];
    expectedClosingDate?: string;

    // Computed fields
    customer_name?: string;
    product_count?: number;
} & Pick<RaRecord, 'id'>;

export type Territory = {
    name: string;
    description?: string;
    broker_id: Identifier;
    boundary_coordinates?: any; // GeoJSON coordinates
    center_latitude?: number;
    center_longitude?: number;
    is_active: boolean;
    created_at: string;
    updatedAt: string;

    // Computed fields
    customer_count?: number;
    total_visits?: number;
} & Pick<RaRecord, 'id'>;

// GPS and Location Types
export type GPSCoordinates = {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp?: string;
};

export type LocationPermission = 'granted' | 'denied' | 'prompt';

// Dashboard Statistics
export type BrokerDashboardStats = {
    total_customers: number;
    customers_this_month: number;
    total_visits: number;
    visits_this_week: number;
    visits_this_month: number;
    pending_reminders: number;
    overdue_reminders: number;
    customers_needing_attention: number;
};

// Activity Types for Food Broker CRM
export type ActivityCustomerCreated = {
    type: 'CUSTOMER_CREATED';
    customer_id: Identifier;
    customer: Customer;
    broker_id: Identifier;
    date: string;
};

export type ActivityVisitLogged = {
    type: 'VISIT_LOGGED';
    customer_id: Identifier;
    broker_id: Identifier;
    visit: Visit;
    date: string;
};

export type ActivityOrderCreated = {
    type: 'ORDER_CREATED';
    customer_id: Identifier;
    broker_id: Identifier;
    order: Order;
    date: string;
};

export type ActivityReminderCreated = {
    type: 'REMINDER_CREATED';
    customer_id: Identifier;
    broker_id: Identifier;
    reminder: Reminder;
    date: string;
};

// Additional activity types for new schema compatibility
export type ActivityOrganizationCreated = {
    type: 'organization.created';
    organizationId: Identifier;
    organization: Organization;
    brokerId: Identifier;
    date: string;
    salesId?: Identifier; // For compatibility
};

export type ActivityContactCreated = {
    type: 'contact.created';
    organizationId: Identifier;
    contactId: Identifier;
    contact: Contact;
    brokerId: Identifier;
    date: string;
    salesId?: Identifier; // For compatibility
};

export type ActivityContactNoteCreated = {
    type: 'contactNote.created';
    organizationId: Identifier;
    contactId: Identifier;
    contactNote: ContactNote;
    brokerId: Identifier;
    date: string;
    salesId?: Identifier; // For compatibility
};

export type ActivityDealCreated = {
    type: 'deal.created';
    organizationId: Identifier;
    contactId?: Identifier;
    dealId: Identifier;
    deal: Deal;
    brokerId: Identifier;
    date: string;
    salesId?: Identifier; // For compatibility
};

export type ActivityDealNoteCreated = {
    type: 'dealNote.created';
    organizationId: Identifier;
    dealId: Identifier;
    dealNote: DealNote;
    brokerId: Identifier;
    date: string;
    salesId?: Identifier; // For compatibility
};

export type Activity = RaRecord &
    (
        | ActivityCustomerCreated
        | ActivityVisitLogged
        | ActivityOrderCreated
        | ActivityReminderCreated
        | ActivityOrganizationCreated
        | ActivityContactCreated
        | ActivityContactNoteCreated
        | ActivityDealCreated
        | ActivityDealNoteCreated
    );

export interface RAFile {
    src: string;
    title: string;
    path?: string;
    rawFile: File;
    type?: string;
}

// Food Broker Business Configuration
export interface BusinessType {
    value: 'restaurant' | 'grocery' | 'distributor' | 'other';
    label: string;
    icon: SvgIconComponent;
}

export interface VisitType {
    value: string;
    label: string;
    color: string;
}

export interface ReminderPriority {
    value: 'low' | 'medium' | 'high' | 'urgent';
    label: string;
    color: string;
}

export interface OrderStatus {
    value:
        | 'draft'
        | 'pending'
        | 'confirmed'
        | 'in_progress'
        | 'delivered'
        | 'cancelled'
        | 'on_hold';
    label: string;
    color: string;
}

// Mobile-specific types
export interface TouchTarget {
    minHeight: number; // 44px minimum for mobile
    minWidth: number;
}

export interface MobileViewport {
    width: number;
    height: number;
    isMobile: boolean;
    isTablet: boolean;
}

// Deals/Opportunities - Core B2B Entity
export type Deal = {
    id: number;
    organizationId: number;
    contactId?: number;
    productId?: number;
    stageId?: number;
    stage: string; // Pipeline stage (lead_discovery, contacted, sampled_visited, follow_up, close)
    status: 'active' | 'won' | 'lost' | 'on-hold';
    probability: number; // 0-100% chance of closing
    amount: number; // Deal value
    expectedClosingDate?: string;
    name?: string; // Deal name/title
    description?: string;
    notes?: string;
    index: number; // For kanban ordering
    archivedAt?: string; // For archived deals
    createdAt: string;
    updatedAt: string;
    createdBy?: string;

    // Computed fields with relationships
    organization?: Organization;
    contact?: Contact;
    product?: Product;
    stageInfo?: Setting;
} & Pick<RaRecord, 'id'>;

// Legacy Types for Compatibility (will be phased out)
export type Company = Customer; // Map Company to Customer for now
// Contact Notes - Notes attached to contacts
export type ContactNote = {
    id: number;
    contactId: number;
    organizationId: number;
    content: string;
    subject?: string;
    status: string;
    attachments?: RAFile[];
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    
    // Computed fields
    contact?: Contact;
    organization?: Organization;
} & Pick<RaRecord, 'id'>;

// Deal Notes - Notes attached to deals/opportunities  
export type DealNote = {
    id: number;
    dealId: number;
    organizationId: number;
    content: string;
    subject?: string;
    status: string;
    attachments?: RAFile[];
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    
    // Computed fields
    deal?: Deal;
    organization?: Organization;
} & Pick<RaRecord, 'id'>;
export type Sale = Broker; // Map Sale to Broker for now
export type SalesFormData = BrokerFormData; // Map SalesFormData to BrokerFormData for now
export type Task = Reminder; // Map Task to Reminder for now
export type Tag = {
    id: Identifier;
    name: string;
    color: string;
} & Pick<RaRecord, 'id'>;

export type ContactGender = 'male' | 'female' | 'other';
export type DealStage = {
    value: string;
    label: string;
};
export type NoteStatus = 'draft' | 'published';

// Activity Legacy Types (using full definitions above)
