import { SvgIconComponent } from '@mui/icons-material';
import { Identifier, RaRecord } from 'react-admin';

// Food Broker CRM Types

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
    address?: string;
    business_type: 'restaurant' | 'grocery' | 'distributor' | 'other';
    latitude?: number;
    longitude?: number;
    notes?: string;
    broker_id: Identifier;
    created_at: string;
    updated_at: string;
    
    // Computed fields from views
    total_visits?: number;
    last_visit_date?: string;
    last_visit_notes?: string;
    visit_status?: 'Never visited' | 'Needs attention' | 'Due for visit' | 'Recently visited';
    pending_reminders?: number;
    overdue_reminders?: number;
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
    updated_at: string;
    
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
    updated_at: string;
    
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
    updated_at: string;
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
    status: 'draft' | 'pending' | 'confirmed' | 'in_progress' | 'delivered' | 'cancelled' | 'on_hold';
    notes?: string;
    internal_notes?: string;
    commission_rate: number;
    commission_amount: number;
    created_at: string;
    updated_at: string;
    
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
    updated_at: string;
    
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

export type Activity = RaRecord &
    (
        | ActivityCustomerCreated
        | ActivityVisitLogged
        | ActivityOrderCreated
        | ActivityReminderCreated
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
    value: 'draft' | 'pending' | 'confirmed' | 'in_progress' | 'delivered' | 'cancelled' | 'on_hold';
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
