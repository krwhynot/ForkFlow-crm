-- Create Settings table for configurable dropdowns throughout the B2B Food Service CRM
create table "public"."settings" (
  "id" bigint primary key generated always as identity,
  "category" text not null,
  "key" text not null,
  "label" text not null,
  "color" text,
  "sortOrder" int not null default 0,
  "active" boolean not null default true,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now()
);

-- Create unique constraint to prevent duplicate keys within categories
alter table "public"."settings" 
  add constraint "settings_category_key_unique" unique ("category", "key");

-- Enable Row Level Security
alter table "public"."settings" enable row level security;

-- Create RLS policies for Settings
-- Allow all authenticated users to read settings
create policy "Settings are viewable by authenticated users" 
  on "public"."settings" 
  for select 
  using (auth.role() = 'authenticated');

-- Only service role can modify settings (admin only)
create policy "Settings are modifiable by service role only" 
  on "public"."settings" 
  for all 
  using (auth.role() = 'service_role');

-- Insert default settings data for B2B Food Service CRM

-- Priority Settings (A-D with color coding)
insert into "public"."settings" ("category", "key", "label", "color", "sortOrder") values
  ('priority', 'A', 'A Priority', '#22c55e', 1),  -- Green
  ('priority', 'B', 'B Priority', '#eab308', 2),  -- Yellow  
  ('priority', 'C', 'C Priority', '#f97316', 3),  -- Orange
  ('priority', 'D', 'D Priority', '#ef4444', 4);  -- Red

-- Segment Settings (Food service industry segments)
insert into "public"."settings" ("category", "key", "label", "color", "sortOrder") values
  ('segment', 'fine_dining', 'Fine Dining', '#8b5cf6', 1),
  ('segment', 'fast_food', 'Fast Food', '#f59e0b', 2),
  ('segment', 'healthcare', 'Healthcare', '#10b981', 3),
  ('segment', 'catering', 'Catering', '#3b82f6', 4),
  ('segment', 'institutional', 'Institutional', '#6b7280', 5);

-- Distributor Settings (Major food distributors)
insert into "public"."settings" ("category", "key", "label", "color", "sortOrder") values
  ('distributor', 'sysco', 'Sysco', '#dc2626', 1),
  ('distributor', 'usf', 'US Foods', '#2563eb', 2),
  ('distributor', 'pfg', 'Performance Food Group', '#059669', 3),
  ('distributor', 'direct', 'Direct', '#7c3aed', 4),
  ('distributor', 'other', 'Other', '#6b7280', 5);

-- Contact Role Settings (Roles within restaurant organizations)
insert into "public"."settings" ("category", "key", "label", "color", "sortOrder") values
  ('role', 'chef', 'Chef', '#ef4444', 1),
  ('role', 'manager', 'Manager', '#3b82f6', 2),
  ('role', 'owner', 'Owner', '#8b5cf6', 3),
  ('role', 'purchasing', 'Purchasing', '#059669', 4),
  ('role', 'other', 'Other', '#6b7280', 5);

-- Influence Level Settings (Decision making influence)
insert into "public"."settings" ("category", "key", "label", "color", "sortOrder") values
  ('influence', 'high', 'High Influence', '#dc2626', 1),
  ('influence', 'medium', 'Medium Influence', '#f59e0b', 2),
  ('influence', 'low', 'Low Influence', '#6b7280', 3);

-- Decision Role Settings (Role in decision making process)
insert into "public"."settings" ("category", "key", "label", "color", "sortOrder") values
  ('decision', 'decision_maker', 'Decision Maker', '#dc2626', 1),
  ('decision', 'influencer', 'Influencer', '#f59e0b', 2),
  ('decision', 'gatekeeper', 'Gatekeeper', '#3b82f6', 3),
  ('decision', 'user', 'User', '#6b7280', 4);

-- Pipeline Stage Settings (Sales pipeline stages)
insert into "public"."settings" ("category", "key", "label", "color", "sortOrder") values
  ('stage', 'lead_discovery', 'Lead Discovery', '#6b7280', 1),
  ('stage', 'contacted', 'Contacted', '#3b82f6', 2),
  ('stage', 'sampled_visited', 'Sampled/Visited', '#f59e0b', 3),
  ('stage', 'follow_up', 'Follow-up', '#8b5cf6', 4),
  ('stage', 'close', 'Close', '#059669', 5);

-- Interaction Type Settings (6 types of customer interactions)
insert into "public"."settings" ("category", "key", "label", "color", "sortOrder") values
  ('interaction_type', 'email', 'Email', '#3b82f6', 1),
  ('interaction_type', 'call', 'Call', '#059669', 2),
  ('interaction_type', 'in_person', 'In Person', '#dc2626', 3),
  ('interaction_type', 'demo', 'Demo/Sampled', '#f59e0b', 4),
  ('interaction_type', 'quote', 'Quoted Price', '#8b5cf6', 5),
  ('interaction_type', 'follow_up', 'Follow-up', '#6b7280', 6);

-- Principal Settings (Food service brand principals - placeholders for now)
insert into "public"."settings" ("category", "key", "label", "color", "sortOrder") values
  ('principal', 'principal_1', 'Principal Brand 1', '#dc2626', 1),
  ('principal', 'principal_2', 'Principal Brand 2', '#f59e0b', 2),
  ('principal', 'principal_3', 'Principal Brand 3', '#059669', 3),
  ('principal', 'principal_4', 'Principal Brand 4', '#3b82f6', 4),
  ('principal', 'principal_5', 'Principal Brand 5', '#8b5cf6', 5),
  ('principal', 'principal_6', 'Principal Brand 6', '#ec4899', 6),
  ('principal', 'principal_7', 'Principal Brand 7', '#f97316', 7),
  ('principal', 'principal_8', 'Principal Brand 8', '#84cc16', 8),
  ('principal', 'principal_9', 'Principal Brand 9', '#06b6d4', 9),
  ('principal', 'principal_10', 'Principal Brand 10', '#a855f7', 10),
  ('principal', 'principal_11', 'Principal Brand 11', '#14b8a6', 11);

-- Create indexes for performance
create index "settings_category_idx" on "public"."settings" ("category");
create index "settings_active_idx" on "public"."settings" ("active");
create index "settings_sort_order_idx" on "public"."settings" ("sortOrder");

-- Create updated_at trigger
create or replace function "public"."update_updated_at_column"()
returns trigger as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$ language plpgsql;

create trigger "update_settings_updated_at" 
  before update on "public"."settings"
  for each row execute function "public"."update_updated_at_column"();