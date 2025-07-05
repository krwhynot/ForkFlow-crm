-- Initial schema migration for ForkFlow CRM
-- This migration creates the database schema using "organizations" as the standard naming convention

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create the organizations table as the primary entity
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255), -- alias for name
    logo TEXT,
    sector VARCHAR(100),
    size VARCHAR(20) CHECK (size IN ('Very Small', 'Small', 'Medium', 'Big', 'Very Big')),
    linkedin_url TEXT,
    website TEXT,
    phone_number VARCHAR(50),
    phone VARCHAR(50), -- alias for phone_number
    email VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    address TEXT,
    zipcode VARCHAR(20),
    city VARCHAR(100),
    state_abbr VARCHAR(10),
    nb_contacts INTEGER DEFAULT 0,
    nb_deals INTEGER DEFAULT 0,
    business_type VARCHAR(50) CHECK (business_type IN ('restaurant', 'grocery', 'distributor', 'other')),
    sales_id INTEGER,
    broker_id INTEGER,
    distributor_id INTEGER,
    revenue DECIMAL(15,2),
    tax_identifier VARCHAR(50),
    description TEXT,
    priority VARCHAR(20) CHECK (priority IN ('high', 'medium', 'low')),
    segment VARCHAR(100),
    status VARCHAR(20) CHECK (status IN ('prospect', 'active', 'inactive', 'closed')),
    tags TEXT[],
    -- GPS coordinates for map functionality
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    -- Enhanced metadata
    last_contact_date TIMESTAMP WITH TIME ZONE,
    next_followup_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    -- Performance metrics
    total_deals_value DECIMAL(15,2),
    average_deal_size DECIMAL(15,2),
    conversion_rate DECIMAL(5,4),
    -- Territory management
    assigned_sales_rep VARCHAR(255),
    account_manager VARCHAR(255),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the sales table for user profiles
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    administrator BOOLEAN DEFAULT FALSE,
    avatar JSONB,
    phone VARCHAR(50),
    title VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the contacts table
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar JSONB,
    title VARCHAR(100),
    role_id INTEGER,
    influence_level_id INTEGER,
    decision_role_id INTEGER,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    gender VARCHAR(20),
    background TEXT,
    first_seen TIMESTAMP WITH TIME ZONE,
    last_seen TIMESTAMP WITH TIME ZONE,
    newsletter BOOLEAN DEFAULT FALSE,
    status VARCHAR(50),
    linkedin_url TEXT,
    nb_tasks INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the deals table
CREATE TABLE deals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
    stage VARCHAR(100),
    stage_id INTEGER,
    amount DECIMAL(15,2),
    expected_close_date DATE,
    description TEXT,
    notes TEXT,
    sales_id INTEGER REFERENCES sales(id),
    category VARCHAR(100),
    probability INTEGER CHECK (probability >= 0 AND probability <= 100),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    category VARCHAR(100),
    description TEXT,
    unit_of_measure VARCHAR(50),
    package_size VARCHAR(50),
    cost_per_unit DECIMAL(10,4),
    price_per_unit DECIMAL(10,4),
    principal_id INTEGER,
    active BOOLEAN DEFAULT TRUE,
    image JSONB,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the interactions table
CREATE TABLE interactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    type_id INTEGER,
    subject VARCHAR(255),
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER, -- in minutes
    contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL,
    sales_id INTEGER REFERENCES sales(id),
    outcome VARCHAR(100),
    followup_required BOOLEAN DEFAULT FALSE,
    followup_date TIMESTAMP WITH TIME ZONE,
    attachments JSONB,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the settings table for configuration
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    key VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    color VARCHAR(7), -- hex color code
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, key)
);

-- Create the tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    priority_id INTEGER,
    type VARCHAR(50),
    type_id INTEGER,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
    deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL,
    sales_id INTEGER REFERENCES sales(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the visits table
CREATE TABLE visits (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    visit_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER,
    notes TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    sales_id INTEGER REFERENCES sales(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the reminders table
CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    customer_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    snooze_count INTEGER DEFAULT 0,
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    snoozed_until TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the contact_notes table
CREATE TABLE contact_notes (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    status VARCHAR(50),
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sales_id INTEGER REFERENCES sales(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the deal_notes table
CREATE TABLE deal_notes (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    status VARCHAR(50),
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sales_id INTEGER REFERENCES sales(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the tags table
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7), -- hex color code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the init_state table for application initialization
CREATE TABLE init_state (
    id SERIAL PRIMARY KEY,
    is_initialized BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial record
INSERT INTO init_state (is_initialized) VALUES (FALSE);

-- Create indexes for better performance
CREATE INDEX idx_organizations_name ON organizations(name);
CREATE INDEX idx_organizations_city ON organizations(city);
CREATE INDEX idx_organizations_business_type ON organizations(business_type);
CREATE INDEX idx_organizations_created_by ON organizations(created_by);
CREATE INDEX idx_organizations_location ON organizations(latitude, longitude);

CREATE INDEX idx_contacts_organization_id ON contacts(organization_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_name ON contacts(first_name, last_name);
CREATE INDEX idx_contacts_created_by ON contacts(created_by);

CREATE INDEX idx_deals_organization_id ON deals(organization_id);
CREATE INDEX idx_deals_contact_id ON deals(contact_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_created_by ON deals(created_by);

CREATE INDEX idx_interactions_organization_id ON interactions(organization_id);
CREATE INDEX idx_interactions_contact_id ON interactions(contact_id);
CREATE INDEX idx_interactions_date ON interactions(date);
CREATE INDEX idx_interactions_type ON interactions(type);
CREATE INDEX idx_interactions_created_by ON interactions(created_by);

CREATE INDEX idx_tasks_contact_id ON tasks(contact_id);
CREATE INDEX idx_tasks_deal_id ON tasks(deal_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);

CREATE INDEX idx_visits_organization_id ON visits(organization_id);
CREATE INDEX idx_visits_contact_id ON visits(contact_id);
CREATE INDEX idx_visits_date ON visits(visit_date);
CREATE INDEX idx_visits_created_by ON visits(created_by);

CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_sales_email ON sales(email);

-- Create views for summary data
CREATE VIEW contacts_summary AS
SELECT 
    c.*,
    o.name as organization_name,
    COUNT(t.id) as task_count,
    COUNT(CASE WHEN t.completed = false THEN 1 END) as pending_tasks
FROM contacts c
LEFT JOIN organizations o ON c.organization_id = o.id
LEFT JOIN tasks t ON c.id = t.contact_id
GROUP BY c.id, o.name;

CREATE VIEW organizations_summary AS
SELECT 
    o.*,
    COUNT(c.id) as contact_count,
    COUNT(d.id) as deal_count,
    COALESCE(SUM(d.amount), 0) as total_deal_value,
    COUNT(v.id) as visit_count,
    MAX(v.visit_date) as last_visit_date
FROM organizations o
LEFT JOIN contacts c ON o.id = c.organization_id
LEFT JOIN deals d ON o.id = d.organization_id
LEFT JOIN visits v ON o.id = v.organization_id
GROUP BY o.id;

-- Add foreign key constraints that reference settings
ALTER TABLE organizations ADD CONSTRAINT fk_organizations_sales_id FOREIGN KEY (sales_id) REFERENCES sales(id);
ALTER TABLE deals ADD CONSTRAINT fk_deals_sales_id FOREIGN KEY (sales_id) REFERENCES sales(id);
ALTER TABLE contacts ADD CONSTRAINT fk_contacts_role_id FOREIGN KEY (role_id) REFERENCES settings(id);
ALTER TABLE contacts ADD CONSTRAINT fk_contacts_influence_level_id FOREIGN KEY (influence_level_id) REFERENCES settings(id);
ALTER TABLE contacts ADD CONSTRAINT fk_contacts_decision_role_id FOREIGN KEY (decision_role_id) REFERENCES settings(id);
ALTER TABLE interactions ADD CONSTRAINT fk_interactions_type_id FOREIGN KEY (type_id) REFERENCES settings(id);
ALTER TABLE products ADD CONSTRAINT fk_products_principal_id FOREIGN KEY (principal_id) REFERENCES settings(id);
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_priority_id FOREIGN KEY (priority_id) REFERENCES settings(id);
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_type_id FOREIGN KEY (type_id) REFERENCES settings(id);

-- Insert default settings
INSERT INTO settings (category, key, label, color, sort_order, active) VALUES
-- Priority settings
('priority', 'high', 'High Priority', '#f44336', 1, true),
('priority', 'medium', 'Medium Priority', '#ff9800', 2, true),
('priority', 'low', 'Low Priority', '#4caf50', 3, true),

-- Segment settings
('segment', 'enterprise', 'Enterprise', '#2196f3', 1, true),
('segment', 'mid-market', 'Mid-Market', '#9c27b0', 2, true),
('segment', 'small-business', 'Small Business', '#ff5722', 3, true),

-- Role settings
('role', 'decision-maker', 'Decision Maker', '#4caf50', 1, true),
('role', 'influencer', 'Influencer', '#2196f3', 2, true),
('role', 'user', 'User', '#9e9e9e', 3, true),

-- Influence level settings
('influence', 'high', 'High Influence', '#f44336', 1, true),
('influence', 'medium', 'Medium Influence', '#ff9800', 2, true),
('influence', 'low', 'Low Influence', '#4caf50', 3, true),

-- Decision role settings
('decision', 'economic-buyer', 'Economic Buyer', '#4caf50', 1, true),
('decision', 'technical-buyer', 'Technical Buyer', '#2196f3', 2, true),
('decision', 'coach', 'Coach', '#ff9800', 3, true),
('decision', 'user', 'User', '#9e9e9e', 4, true),

-- Principal settings (for products)
('principal', 'brand-a', 'Brand A', '#2196f3', 1, true),
('principal', 'brand-b', 'Brand B', '#4caf50', 2, true),
('principal', 'brand-c', 'Brand C', '#ff9800', 3, true),

-- Interaction types
('interaction', 'email', 'Email', '#2196f3', 1, true),
('interaction', 'phone', 'Phone Call', '#4caf50', 2, true),
('interaction', 'meeting', 'Meeting', '#ff9800', 3, true),
('interaction', 'visit', 'Site Visit', '#9c27b0', 4, true),

-- Deal stages
('stage', 'lead', 'Lead', '#9e9e9e', 1, true),
('stage', 'qualified', 'Qualified', '#2196f3', 2, true),
('stage', 'proposal', 'Proposal', '#ff9800', 3, true),
('stage', 'negotiation', 'Negotiation', '#f44336', 4, true),
('stage', 'closed-won', 'Closed Won', '#4caf50', 5, true),
('stage', 'closed-lost', 'Closed Lost', '#9e9e9e', 6, true);

-- Add comments for documentation
COMMENT ON TABLE organizations IS 'Primary entity table for companies, restaurants, grocery stores, and distributors';
COMMENT ON TABLE contacts IS 'Individual contacts associated with organizations';
COMMENT ON TABLE deals IS 'Sales opportunities and deals';
COMMENT ON TABLE interactions IS 'All interactions (emails, calls, meetings, visits) with contacts and organizations';
COMMENT ON TABLE visits IS 'Physical visits to customer locations with GPS tracking';
COMMENT ON TABLE reminders IS 'Follow-up reminders for brokers';
COMMENT ON TABLE settings IS 'Configuration settings for various categories (priority, segment, role, etc.)';
COMMENT ON TABLE sales IS 'User profiles for brokers and administrators'; 