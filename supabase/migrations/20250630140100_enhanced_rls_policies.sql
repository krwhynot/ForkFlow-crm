-- Enhanced Row Level Security Policies for ForkFlow-CRM
-- This migration enhances existing RLS policies with territory-based filtering and audit logging

-- Create function to extract user role from JWT
create or replace function "public"."get_user_role"()
returns text as $$
begin
    return coalesce(auth.jwt() ->> 'role', 'broker');
end;
$$ language plpgsql security definer;

-- Create function to extract user territory from JWT
create or replace function "public"."get_user_territory"()
returns text[] as $$
begin
    return coalesce(
        (auth.jwt() ->> 'territory')::text[],
        array[]::text[]
    );
end;
$$ language plpgsql security definer;

-- Create function to check if user can access organization based on territory
create or replace function "public"."can_access_organization"(org_id bigint)
returns boolean as $$
declare
    user_role text;
    user_territory text[];
    org_state text;
    org_city text;
    org_zip text;
begin
    user_role := get_user_role();
    
    -- Admins and managers can access all organizations
    if user_role in ('admin', 'manager') then
        return true;
    end if;
    
    -- Brokers can only access organizations in their territory
    if user_role = 'broker' then
        user_territory := get_user_territory();
        
        -- If no territory assigned, deny access
        if array_length(user_territory, 1) is null then
            return false;
        end if;
        
        -- Get organization location data
        select state, city, "zipCode" into org_state, org_city, org_zip
        from organizations where id = org_id;
        
        -- Check if organization matches any territory criteria
        return (
            org_state = any(user_territory) or
            org_city = any(user_territory) or
            org_zip = any(user_territory)
        );
    end if;
    
    return false;
end;
$$ language plpgsql security definer;

-- Drop existing RLS policies that need enhancement
drop policy if exists "Organizations are viewable by authenticated users" on "public"."organizations";
drop policy if exists "Organizations are editable by authenticated users" on "public"."organizations";
drop policy if exists "Contacts are viewable by authenticated users" on "public"."contacts";
drop policy if exists "Contacts are editable by authenticated users" on "public"."contacts";

-- Enhanced RLS policies for organizations with territory filtering
create policy "Organizations viewable with territory filtering" 
    on "public"."organizations" 
    for select 
    using (
        auth.role() = 'authenticated' and (
            get_user_role() in ('admin', 'manager') or
            (get_user_role() = 'broker' and can_access_organization(id))
        )
    );

create policy "Organizations editable with territory filtering" 
    on "public"."organizations" 
    for all 
    using (
        auth.role() = 'authenticated' and (
            get_user_role() in ('admin', 'manager') or
            (get_user_role() = 'broker' and can_access_organization(id))
        )
    );

-- Enhanced RLS policies for contacts with organization territory filtering
create policy "Contacts viewable with territory filtering" 
    on "public"."contacts" 
    for select 
    using (
        auth.role() = 'authenticated' and (
            get_user_role() in ('admin', 'manager') or
            (get_user_role() = 'broker' and can_access_organization("organizationId"))
        )
    );

create policy "Contacts editable with territory filtering" 
    on "public"."contacts" 
    for all 
    using (
        auth.role() = 'authenticated' and (
            get_user_role() in ('admin', 'manager') or
            (get_user_role() = 'broker' and can_access_organization("organizationId"))
        )
    );

-- Enhanced RLS policies for interactions with organization territory filtering
create policy "Interactions viewable with territory filtering" 
    on "public"."interactions" 
    for select 
    using (
        auth.role() = 'authenticated' and (
            get_user_role() in ('admin', 'manager') or
            (get_user_role() = 'broker' and can_access_organization("organizationId"))
        )
    );

create policy "Interactions editable with territory filtering" 
    on "public"."interactions" 
    for all 
    using (
        auth.role() = 'authenticated' and (
            get_user_role() in ('admin', 'manager') or
            (get_user_role() = 'broker' and can_access_organization("organizationId"))
        )
    );

-- Enhanced RLS policies for deals/opportunities with organization territory filtering
create policy "Deals viewable with territory filtering" 
    on "public"."deals" 
    for select 
    using (
        auth.role() = 'authenticated' and (
            get_user_role() in ('admin', 'manager') or
            (get_user_role() = 'broker' and can_access_organization("organizationId"))
        )
    );

create policy "Deals editable with territory filtering" 
    on "public"."deals" 
    for all 
    using (
        auth.role() = 'authenticated' and (
            get_user_role() in ('admin', 'manager') or
            (get_user_role() = 'broker' and can_access_organization("organizationId"))
        )
    );

-- Enhanced RLS policies for products (read-only for brokers, full access for admin/manager)
create policy "Products viewable by authenticated users" 
    on "public"."products" 
    for select 
    using (auth.role() = 'authenticated');

create policy "Products editable by admin and manager only" 
    on "public"."products" 
    for all 
    using (
        auth.role() = 'authenticated' and 
        get_user_role() in ('admin', 'manager')
    );

-- Create audit trigger function
create or replace function "public"."audit_trigger_function"()
returns trigger as $$
declare
    old_values jsonb;
    new_values jsonb;
    changed_fields text[];
    user_id text;
    user_email text;
begin
    -- Get user information from auth context
    user_id := coalesce(auth.jwt() ->> 'sub', 'system');
    user_email := coalesce(auth.jwt() ->> 'email', 'system@forkflow.com');
    
    -- Handle different operations
    if TG_OP = 'DELETE' then
        old_values := to_jsonb(OLD);
        new_values := null;
        changed_fields := array(select jsonb_object_keys(old_values));
        
        perform log_audit_event(
            TG_TABLE_NAME, OLD.id::text, TG_OP, user_id, user_email,
            old_values, new_values, changed_fields
        );
        
        return OLD;
    elsif TG_OP = 'UPDATE' then
        old_values := to_jsonb(OLD);
        new_values := to_jsonb(NEW);
        
        -- Find changed fields
        changed_fields := array(
            select key from jsonb_each(new_values) 
            where new_values->key != old_values->key
        );
        
        -- Only log if there are actual changes
        if array_length(changed_fields, 1) > 0 then
            perform log_audit_event(
                TG_TABLE_NAME, NEW.id::text, TG_OP, user_id, user_email,
                old_values, new_values, changed_fields
            );
        end if;
        
        return NEW;
    elsif TG_OP = 'INSERT' then
        old_values := null;
        new_values := to_jsonb(NEW);
        changed_fields := array(select jsonb_object_keys(new_values));
        
        perform log_audit_event(
            TG_TABLE_NAME, NEW.id::text, TG_OP, user_id, user_email,
            old_values, new_values, changed_fields
        );
        
        return NEW;
    end if;
    
    return null;
end;
$$ language plpgsql security definer;

-- Create audit triggers for all main tables
create trigger "organizations_audit_trigger"
    after insert or update or delete on "public"."organizations"
    for each row execute function "public"."audit_trigger_function"();

create trigger "contacts_audit_trigger"
    after insert or update or delete on "public"."contacts"
    for each row execute function "public"."audit_trigger_function"();

create trigger "interactions_audit_trigger"
    after insert or update or delete on "public"."interactions"
    for each row execute function "public"."audit_trigger_function"();

create trigger "deals_audit_trigger"
    after insert or update or delete on "public"."deals"
    for each row execute function "public"."audit_trigger_function"();

create trigger "products_audit_trigger"
    after insert or update or delete on "public"."products"
    for each row execute function "public"."audit_trigger_function"();

create trigger "settings_audit_trigger"
    after insert or update or delete on "public"."settings"
    for each row execute function "public"."audit_trigger_function"();

-- Create function to validate data integrity
create or replace function "public"."validate_data_integrity"()
returns trigger as $$
begin
    -- Validate phone numbers (basic E.164 format)
    if NEW.phone is not null and NEW.phone !~ '^\+?[1-9]\d{1,14}$' then
        raise exception 'Invalid phone number format. Must be E.164 format.';
    end if;
    
    -- Validate email addresses
    if NEW.email is not null and NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' then
        raise exception 'Invalid email address format.';
    end if;
    
    -- Validate URLs
    if NEW.website is not null and NEW.website !~ '^https?://' then
        NEW.website := 'https://' || NEW.website;
    end if;
    
    return NEW;
end;
$$ language plpgsql;

-- Add data validation triggers
create trigger "organizations_data_validation"
    before insert or update on "public"."organizations"
    for each row execute function "public"."validate_data_integrity"();

create trigger "contacts_data_validation"
    before insert or update on "public"."contacts"
    for each row execute function "public"."validate_data_integrity"();

-- Create function to encrypt sensitive data
create or replace function "public"."encrypt_sensitive_data"()
returns trigger as $$
begin
    -- Note: In production, use proper encryption with keys stored securely
    -- This is a simplified example for demonstration
    
    if NEW.phone is not null then
        -- Store phone with basic obfuscation (replace with proper encryption)
        NEW.phone := '***-***-' || right(NEW.phone, 4);
    end if;
    
    return NEW;
end;
$$ language plpgsql;

-- Create function to check for suspicious activity
create or replace function "public"."check_suspicious_activity"()
returns trigger as $$
declare
    recent_failures int;
    risk_score int := 0;
begin
    -- Check for rapid multiple failures from same IP
    select count(*) into recent_failures
    from security_events 
    where "ipAddress" = NEW."ipAddress" 
      and success = false 
      and "createdAt" > now() - interval '5 minutes';
    
    -- Calculate risk score based on various factors
    if recent_failures > 3 then
        risk_score := risk_score + 50;
    end if;
    
    if NEW."userAgent" is null or length(NEW."userAgent") < 10 then
        risk_score := risk_score + 20;
    end if;
    
    -- Update risk score
    NEW."riskScore" := least(risk_score, 100);
    
    -- Log high-risk events immediately
    if NEW."riskScore" >= 80 then
        -- In production, this would trigger alerting systems
        raise notice 'High-risk security event detected: % (Risk Score: %)', NEW."eventType", NEW."riskScore";
    end if;
    
    return NEW;
end;
$$ language plpgsql;

-- Add suspicious activity trigger
create trigger "security_events_risk_check"
    before insert on "public"."security_events"
    for each row execute function "public"."check_suspicious_activity"();