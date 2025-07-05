-- Enable Row Level Security (RLS) and create policies
-- This migration secures all tables with appropriate RLS policies

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE init_state ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view all organizations" ON organizations
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create organizations" ON organizations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update organizations" ON organizations
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete organizations they created" ON organizations
    FOR DELETE USING (created_by = auth.uid());

-- Contacts policies
CREATE POLICY "Users can view all contacts" ON contacts
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create contacts" ON contacts
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update contacts" ON contacts
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete contacts they created" ON contacts
    FOR DELETE USING (created_by = auth.uid());

-- Deals policies
CREATE POLICY "Users can view all deals" ON deals
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create deals" ON deals
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update deals" ON deals
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete deals they created" ON deals
    FOR DELETE USING (created_by = auth.uid());

-- Interactions policies
CREATE POLICY "Users can view all interactions" ON interactions
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create interactions" ON interactions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update interactions" ON interactions
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete interactions they created" ON interactions
    FOR DELETE USING (created_by = auth.uid());

-- Visits policies
CREATE POLICY "Users can view all visits" ON visits
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create visits" ON visits
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update visits" ON visits
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete visits they created" ON visits
    FOR DELETE USING (created_by = auth.uid());

-- Reminders policies
CREATE POLICY "Users can view all reminders" ON reminders
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create reminders" ON reminders
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update reminders" ON reminders
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete reminders they created" ON reminders
    FOR DELETE USING (created_by = auth.uid());

-- Tasks policies
CREATE POLICY "Users can view all tasks" ON tasks
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update tasks" ON tasks
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete tasks they created" ON tasks
    FOR DELETE USING (created_by = auth.uid());

-- Contact notes policies
CREATE POLICY "Users can view all contact notes" ON contact_notes
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create contact notes" ON contact_notes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update contact notes" ON contact_notes
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete contact notes they created" ON contact_notes
    FOR DELETE USING (created_by = auth.uid());

-- Deal notes policies
CREATE POLICY "Users can view all deal notes" ON deal_notes
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create deal notes" ON deal_notes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update deal notes" ON deal_notes
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete deal notes they created" ON deal_notes
    FOR DELETE USING (created_by = auth.uid());

-- Products policies
CREATE POLICY "Users can view all products" ON products
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create products" ON products
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update products" ON products
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete products they created" ON products
    FOR DELETE USING (created_by = auth.uid());

-- Sales policies (user profiles)
CREATE POLICY "Users can view all sales profiles" ON sales
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create sales profiles" ON sales
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own sales profile" ON sales
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own sales profile" ON sales
    FOR DELETE USING (user_id = auth.uid());

-- Settings policies (configuration data)
CREATE POLICY "Users can view all settings" ON settings
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create settings" ON settings
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update settings" ON settings
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete settings" ON settings
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Tags policies
CREATE POLICY "Users can view all tags" ON tags
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create tags" ON tags
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update tags" ON tags
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete tags" ON tags
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Init state policies
CREATE POLICY "Users can view init state" ON init_state
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update init state" ON init_state
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Views policies (inherit from base tables)
-- Note: Views in PostgreSQL inherit RLS from their underlying tables
-- so no additional policies are needed for contacts_summary and organizations_summary

-- Function to sync sales table with auth.users
CREATE OR REPLACE FUNCTION sync_sales_with_auth_users()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a new sales record when a user is created
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.sales (user_id, first_name, last_name, email, administrator)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
            NEW.email,
            COALESCE((NEW.raw_user_meta_data->>'administrator')::boolean, false)
        );
        RETURN NEW;
    END IF;
    
    -- Update sales record when user is updated
    IF TG_OP = 'UPDATE' THEN
        UPDATE public.sales 
        SET 
            first_name = COALESCE(NEW.raw_user_meta_data->>'first_name', first_name),
            last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', last_name),
            email = NEW.email,
            administrator = COALESCE((NEW.raw_user_meta_data->>'administrator')::boolean, administrator),
            updated_at = NOW()
        WHERE user_id = NEW.id;
        RETURN NEW;
    END IF;
    
    -- Delete sales record when user is deleted
    IF TG_OP = 'DELETE' THEN
        DELETE FROM public.sales WHERE user_id = OLD.id;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync sales table with auth.users
CREATE TRIGGER sync_sales_trigger
    AFTER INSERT OR UPDATE OR DELETE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION sync_sales_with_auth_users();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at on all tables
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
    BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interactions_updated_at
    BEFORE UPDATE ON interactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visits_updated_at
    BEFORE UPDATE ON visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at
    BEFORE UPDATE ON reminders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_notes_updated_at
    BEFORE UPDATE ON contact_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deal_notes_updated_at
    BEFORE UPDATE ON deal_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
    BEFORE UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 