-- Security Audit and Logging Tables for ForkFlow-CRM
-- This migration creates comprehensive security audit logging

-- Create security events table for audit logging
create table "public"."security_events" (
    "id" bigint primary key generated always as identity,
    "userId" text,
    "userEmail" text,
    "eventType" text not null,
    "eventCategory" text not null check (eventCategory in ('authentication', 'authorization', 'data_access', 'security_violation', 'admin_action')),
    "resource" text,
    "resourceId" text,
    "action" text not null,
    "ipAddress" inet,
    "userAgent" text,
    "sessionId" text,
    "deviceFingerprint" text,
    "riskScore" int default 0 check (riskScore >= 0 and riskScore <= 100),
    "details" jsonb default '{}',
    "success" boolean not null default true,
    "errorMessage" text,
    "createdAt" timestamptz default now()
);

-- Create audit log table for data changes
create table "public"."audit_logs" (
    "id" bigint primary key generated always as identity,
    "tableName" text not null,
    "recordId" text not null,
    "operation" text not null check (operation in ('INSERT', 'UPDATE', 'DELETE')),
    "userId" text,
    "userEmail" text,
    "oldValues" jsonb,
    "newValues" jsonb,
    "changedFields" text[],
    "ipAddress" inet,
    "userAgent" text,
    "sessionId" text,
    "createdAt" timestamptz default now()
);

-- Create user sessions table for session management
create table "public"."user_sessions" (
    "id" text primary key,
    "userId" text not null,
    "deviceFingerprint" text,
    "ipAddress" inet not null,
    "userAgent" text,
    "location" text,
    "isActive" boolean not null default true,
    "lastActivity" timestamptz default now(),
    "createdAt" timestamptz default now(),
    "expiresAt" timestamptz not null,
    "revokedAt" timestamptz,
    "revokedReason" text
);

-- Create security settings table for configuration
create table "public"."security_settings" (
    "id" bigint primary key generated always as identity,
    "category" text not null,
    "key" text not null,
    "value" text not null,
    "description" text,
    "lastModifiedBy" text,
    "createdAt" timestamptz default now(),
    "updatedAt" timestamptz default now()
);

-- Create unique constraint for security settings
alter table "public"."security_settings" 
    add constraint "security_settings_category_key_unique" unique ("category", "key");

-- Create password policy table
create table "public"."password_policies" (
    "id" bigint primary key generated always as identity,
    "userId" text not null unique,
    "passwordHash" text not null,
    "lastChanged" timestamptz default now(),
    "expiresAt" timestamptz,
    "isBreached" boolean default false,
    "breachCheckDate" timestamptz,
    "failedAttempts" int default 0,
    "lockedUntil" timestamptz,
    "mustChange" boolean default false,
    "previousHashes" text[] default '{}',
    "createdAt" timestamptz default now(),
    "updatedAt" timestamptz default now()
);

-- Enable Row Level Security on all new tables
alter table "public"."security_events" enable row level security;
alter table "public"."audit_logs" enable row level security;
alter table "public"."user_sessions" enable row level security;
alter table "public"."security_settings" enable row level security;
alter table "public"."password_policies" enable row level security;

-- Create RLS policies for security_events
-- Only admins can view all security events, users can view their own
create policy "Security events viewable by admins and own user" 
    on "public"."security_events" 
    for select 
    using (
        auth.role() = 'service_role' OR
        auth.jwt() ->> 'role' = 'admin' OR
        userId = (auth.jwt() ->> 'sub')
    );

-- Only system can insert security events
create policy "Security events insertable by system only" 
    on "public"."security_events" 
    for insert 
    with check (auth.role() = 'service_role');

-- Create RLS policies for audit_logs
-- Only admins can view audit logs, users can view logs for their own actions
create policy "Audit logs viewable by admins and own user" 
    on "public"."audit_logs" 
    for select 
    using (
        auth.role() = 'service_role' OR
        auth.jwt() ->> 'role' = 'admin' OR
        userId = (auth.jwt() ->> 'sub')
    );

-- Only system can insert audit logs
create policy "Audit logs insertable by system only" 
    on "public"."audit_logs" 
    for insert 
    with check (auth.role() = 'service_role');

-- Create RLS policies for user_sessions
-- Users can view their own sessions, admins can view all
create policy "User sessions viewable by owner and admins" 
    on "public"."user_sessions" 
    for select 
    using (
        auth.role() = 'service_role' OR
        auth.jwt() ->> 'role' = 'admin' OR
        userId = (auth.jwt() ->> 'sub')
    );

-- Users can update their own sessions, system can insert/update all
create policy "User sessions manageable by owner and system" 
    on "public"."user_sessions" 
    for all 
    using (
        auth.role() = 'service_role' OR
        userId = (auth.jwt() ->> 'sub')
    );

-- Create RLS policies for security_settings
-- Only admins can view and modify security settings
create policy "Security settings manageable by admins only" 
    on "public"."security_settings" 
    for all 
    using (
        auth.role() = 'service_role' OR
        auth.jwt() ->> 'role' = 'admin'
    );

-- Create RLS policies for password_policies
-- Users can view their own password policy, admins can view all
create policy "Password policies viewable by owner and admins" 
    on "public"."password_policies" 
    for select 
    using (
        auth.role() = 'service_role' OR
        auth.jwt() ->> 'role' = 'admin' OR
        userId = (auth.jwt() ->> 'sub')
    );

-- Only system can manage password policies
create policy "Password policies manageable by system only" 
    on "public"."password_policies" 
    for all 
    using (auth.role() = 'service_role');

-- Create indexes for performance
create index "security_events_user_id_idx" on "public"."security_events" ("userId");
create index "security_events_event_type_idx" on "public"."security_events" ("eventType");
create index "security_events_created_at_idx" on "public"."security_events" ("createdAt");
create index "security_events_risk_score_idx" on "public"."security_events" ("riskScore");

create index "audit_logs_table_name_idx" on "public"."audit_logs" ("tableName");
create index "audit_logs_record_id_idx" on "public"."audit_logs" ("recordId");
create index "audit_logs_user_id_idx" on "public"."audit_logs" ("userId");
create index "audit_logs_created_at_idx" on "public"."audit_logs" ("createdAt");

create index "user_sessions_user_id_idx" on "public"."user_sessions" ("userId");
create index "user_sessions_is_active_idx" on "public"."user_sessions" ("isActive");
create index "user_sessions_last_activity_idx" on "public"."user_sessions" ("lastActivity");
create index "user_sessions_expires_at_idx" on "public"."user_sessions" ("expiresAt");

create index "security_settings_category_idx" on "public"."security_settings" ("category");

create index "password_policies_user_id_idx" on "public"."password_policies" ("userId");
create index "password_policies_expires_at_idx" on "public"."password_policies" ("expiresAt");
create index "password_policies_failed_attempts_idx" on "public"."password_policies" ("failedAttempts");

-- Create updated_at triggers for relevant tables
create trigger "update_security_settings_updated_at" 
    before update on "public"."security_settings"
    for each row execute function "public"."update_updated_at_column"();

create trigger "update_password_policies_updated_at" 
    before update on "public"."password_policies"
    for each row execute function "public"."update_updated_at_column"();

-- Insert default security settings
insert into "public"."security_settings" ("category", "key", "value", "description") values
    ('session', 'idle_timeout_minutes', '30', 'Session idle timeout in minutes'),
    ('session', 'max_session_hours', '8', 'Maximum session duration in hours'),
    ('session', 'max_concurrent_sessions', '3', 'Maximum concurrent sessions per user'),
    ('password', 'min_length', '12', 'Minimum password length'),
    ('password', 'require_uppercase', 'true', 'Require uppercase characters'),
    ('password', 'require_lowercase', 'true', 'Require lowercase characters'),
    ('password', 'require_numbers', 'true', 'Require numeric characters'),
    ('password', 'require_symbols', 'true', 'Require special characters'),
    ('password', 'expiry_days', '90', 'Password expiration in days'),
    ('password', 'history_count', '5', 'Number of previous passwords to remember'),
    ('security', 'max_failed_attempts', '5', 'Maximum failed login attempts before lockout'),
    ('security', 'lockout_duration_minutes', '15', 'Account lockout duration in minutes'),
    ('security', 'require_mfa_admin', 'true', 'Require MFA for admin users'),
    ('security', 'require_mfa_all', 'false', 'Require MFA for all users'),
    ('monitoring', 'log_retention_days', '365', 'Security log retention period in days'),
    ('monitoring', 'risk_threshold_high', '80', 'High risk threshold score'),
    ('monitoring', 'risk_threshold_medium', '50', 'Medium risk threshold score');

-- Create function to log security events
create or replace function "public"."log_security_event"(
    p_user_id text,
    p_user_email text,
    p_event_type text,
    p_event_category text,
    p_resource text default null,
    p_resource_id text default null,
    p_action text default '',
    p_ip_address inet default null,
    p_user_agent text default null,
    p_session_id text default null,
    p_device_fingerprint text default null,
    p_risk_score int default 0,
    p_details jsonb default '{}',
    p_success boolean default true,
    p_error_message text default null
)
returns bigint as $$
declare
    event_id bigint;
begin
    insert into "public"."security_events" (
        "userId", "userEmail", "eventType", "eventCategory", "resource", "resourceId",
        "action", "ipAddress", "userAgent", "sessionId", "deviceFingerprint",
        "riskScore", "details", "success", "errorMessage"
    ) values (
        p_user_id, p_user_email, p_event_type, p_event_category, p_resource, p_resource_id,
        p_action, p_ip_address, p_user_agent, p_session_id, p_device_fingerprint,
        p_risk_score, p_details, p_success, p_error_message
    ) returning id into event_id;
    
    return event_id;
end;
$$ language plpgsql security definer;

-- Create function to log audit events
create or replace function "public"."log_audit_event"(
    p_table_name text,
    p_record_id text,
    p_operation text,
    p_user_id text,
    p_user_email text,
    p_old_values jsonb default null,
    p_new_values jsonb default null,
    p_changed_fields text[] default '{}',
    p_ip_address inet default null,
    p_user_agent text default null,
    p_session_id text default null
)
returns bigint as $$
declare
    audit_id bigint;
begin
    insert into "public"."audit_logs" (
        "tableName", "recordId", "operation", "userId", "userEmail",
        "oldValues", "newValues", "changedFields", "ipAddress", "userAgent", "sessionId"
    ) values (
        p_table_name, p_record_id, p_operation, p_user_id, p_user_email,
        p_old_values, p_new_values, p_changed_fields, p_ip_address, p_user_agent, p_session_id
    ) returning id into audit_id;
    
    return audit_id;
end;
$$ language plpgsql security definer;

-- Create function to clean up expired sessions
create or replace function "public"."cleanup_expired_sessions"()
returns int as $$
declare
    cleaned_count int;
begin
    -- Update expired sessions as inactive
    update "public"."user_sessions" 
    set "isActive" = false, "revokedAt" = now(), "revokedReason" = 'expired'
    where "isActive" = true and "expiresAt" < now();
    
    get diagnostics cleaned_count = row_count;
    
    -- Log cleanup event
    perform "public"."log_security_event"(
        null, null, 'session_cleanup', 'authentication', 'user_sessions', null,
        'cleanup_expired', null, null, null, null, 0,
        jsonb_build_object('cleaned_sessions', cleaned_count), true, null
    );
    
    return cleaned_count;
end;
$$ language plpgsql security definer;