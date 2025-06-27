-- Create Organizations table for B2B Food Service CRM
create table "public"."organizations" (
  "id" bigint primary key generated always as identity,
  "name" text not null,
  "priorityId" bigint references "public"."settings"("id"),
  "segmentId" bigint references "public"."settings"("id"),
  "distributorId" bigint references "public"."settings"("id"),
  "accountManager" text,
  "address" text,
  "city" text,
  "state" text,
  "zipCode" text,
  "phone" text,
  "website" text,
  "notes" text,
  "latitude" decimal(10,8),
  "longitude" decimal(11,8),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  "createdBy" uuid references auth.users(id)
);

-- Create indexes for performance
create index "organizations_name_idx" on "public"."organizations" ("name");
create index "organizations_priority_idx" on "public"."organizations" ("priorityId");
create index "organizations_segment_idx" on "public"."organizations" ("segmentId");
create index "organizations_distributor_idx" on "public"."organizations" ("distributorId");
create index "organizations_account_manager_idx" on "public"."organizations" ("accountManager");
create index "organizations_created_by_idx" on "public"."organizations" ("createdBy");
create index "organizations_city_state_idx" on "public"."organizations" ("city", "state");

-- Enable Row Level Security
alter table "public"."organizations" enable row level security;

-- Create RLS policies for Organizations
-- Users can only see organizations they created or are assigned as account manager
create policy "Organizations are viewable by owner and account manager" 
  on "public"."organizations" 
  for select 
  using (
    auth.uid() = "createdBy" OR 
    auth.jwt() ->> 'email' = "accountManager" OR
    auth.role() = 'service_role'
  );

-- Users can insert organizations and become the creator
create policy "Organizations are insertable by authenticated users" 
  on "public"."organizations" 
  for insert 
  with check (auth.uid() = "createdBy");

-- Users can update organizations they created or manage
create policy "Organizations are updatable by owner and account manager" 
  on "public"."organizations" 
  for update 
  using (
    auth.uid() = "createdBy" OR 
    auth.jwt() ->> 'email' = "accountManager" OR
    auth.role() = 'service_role'
  );

-- Users can delete organizations they created
create policy "Organizations are deletable by owner" 
  on "public"."organizations" 
  for delete 
  using (auth.uid() = "createdBy" OR auth.role() = 'service_role');

-- Create updated_at trigger for Organizations
create trigger "update_organizations_updated_at" 
  before update on "public"."organizations"
  for each row execute function "public"."update_updated_at_column"();

-- Add foreign key constraints with proper validation
alter table "public"."organizations" 
  add constraint "organizations_priority_fk" 
  foreign key ("priorityId") references "public"."settings"("id")
  on delete set null;

alter table "public"."organizations" 
  add constraint "organizations_segment_fk" 
  foreign key ("segmentId") references "public"."settings"("id")
  on delete set null;

alter table "public"."organizations" 
  add constraint "organizations_distributor_fk" 
  foreign key ("distributorId") references "public"."settings"("id")
  on delete set null;

-- Note: Settings validation will be handled by triggers instead of check constraints
-- since PostgreSQL doesn't allow subqueries in check constraints

-- Add validation constraints
alter table "public"."organizations" 
  add constraint "organizations_name_not_empty" 
  check (trim("name") != '');

alter table "public"."organizations" 
  add constraint "organizations_phone_format" 
  check ("phone" is null or "phone" ~ '^[\d\s\-\.\(\)\+]+$');

alter table "public"."organizations" 
  add constraint "organizations_website_format" 
  check ("website" is null or "website" ~ '^https?://');

alter table "public"."organizations" 
  add constraint "organizations_zipcode_format" 
  check ("zipCode" is null or "zipCode" ~ '^\d{5}(-\d{4})?$');

-- Comment the table
comment on table "public"."organizations" is 'Organizations (restaurants, businesses) in the B2B food service CRM system';
comment on column "public"."organizations"."priorityId" is 'Reference to Settings table with category=priority (A-D)';
comment on column "public"."organizations"."segmentId" is 'Reference to Settings table with category=segment (Fine Dining, Fast Food, etc.)';
comment on column "public"."organizations"."distributorId" is 'Reference to Settings table with category=distributor (Sysco, USF, etc.)';
comment on column "public"."organizations"."accountManager" is 'Email of assigned account manager/sales rep';
comment on column "public"."organizations"."latitude" is 'GPS latitude for organization location';
comment on column "public"."organizations"."longitude" is 'GPS longitude for organization location';