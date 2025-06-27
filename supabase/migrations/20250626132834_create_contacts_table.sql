-- Create Contacts table for B2B Food Service CRM
create table "public"."contacts" (
  "id" bigint primary key generated always as identity,
  "organizationId" bigint not null references "public"."organizations"("id") on delete cascade,
  "firstName" text not null,
  "lastName" text not null,
  "email" text,
  "phone" text,
  "roleId" bigint references "public"."settings"("id"),
  "influenceLevelId" bigint references "public"."settings"("id"),
  "decisionRoleId" bigint references "public"."settings"("id"),
  "linkedInUrl" text,
  "isPrimary" boolean not null default false,
  "notes" text,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  "createdBy" uuid references auth.users(id)
);

-- Create indexes for performance
create index "contacts_organization_idx" on "public"."contacts" ("organizationId");
create index "contacts_email_idx" on "public"."contacts" ("email");
create index "contacts_name_idx" on "public"."contacts" ("firstName", "lastName");
create index "contacts_role_idx" on "public"."contacts" ("roleId");
create index "contacts_influence_idx" on "public"."contacts" ("influenceLevelId");
create index "contacts_decision_role_idx" on "public"."contacts" ("decisionRoleId");
create index "contacts_is_primary_idx" on "public"."contacts" ("isPrimary");
create index "contacts_created_by_idx" on "public"."contacts" ("createdBy");

-- Enable Row Level Security
alter table "public"."contacts" enable row level security;

-- Create RLS policies for Contacts
-- Users can only see contacts for organizations they have access to
create policy "Contacts are viewable by organization access" 
  on "public"."contacts" 
  for select 
  using (
    exists (
      select 1 from "public"."organizations" o 
      where o."id" = "contacts"."organizationId" 
      and (
        auth.uid() = o."createdBy" OR 
        auth.jwt() ->> 'email' = o."accountManager" OR
        auth.role() = 'service_role'
      )
    )
  );

-- Users can insert contacts for organizations they have access to
create policy "Contacts are insertable by organization access" 
  on "public"."contacts" 
  for insert 
  with check (
    auth.uid() = "createdBy" and
    exists (
      select 1 from "public"."organizations" o 
      where o."id" = "contacts"."organizationId" 
      and (
        auth.uid() = o."createdBy" OR 
        auth.jwt() ->> 'email' = o."accountManager" OR
        auth.role() = 'service_role'
      )
    )
  );

-- Users can update contacts for organizations they have access to
create policy "Contacts are updatable by organization access" 
  on "public"."contacts" 
  for update 
  using (
    exists (
      select 1 from "public"."organizations" o 
      where o."id" = "contacts"."organizationId" 
      and (
        auth.uid() = o."createdBy" OR 
        auth.jwt() ->> 'email' = o."accountManager" OR
        auth.role() = 'service_role'
      )
    )
  );

-- Users can delete contacts for organizations they have access to
create policy "Contacts are deletable by organization access" 
  on "public"."contacts" 
  for delete 
  using (
    exists (
      select 1 from "public"."organizations" o 
      where o."id" = "contacts"."organizationId" 
      and (
        auth.uid() = o."createdBy" OR 
        auth.jwt() ->> 'email' = o."accountManager" OR
        auth.role() = 'service_role'
      )
    )
  );

-- Create updated_at trigger for Contacts
create trigger "update_contacts_updated_at" 
  before update on "public"."contacts"
  for each row execute function "public"."update_updated_at_column"();

-- Add foreign key constraints with proper validation
alter table "public"."contacts" 
  add constraint "contacts_organization_fk" 
  foreign key ("organizationId") references "public"."organizations"("id")
  on delete cascade;

alter table "public"."contacts" 
  add constraint "contacts_role_fk" 
  foreign key ("roleId") references "public"."settings"("id")
  on delete set null;

alter table "public"."contacts" 
  add constraint "contacts_influence_fk" 
  foreign key ("influenceLevelId") references "public"."settings"("id")
  on delete set null;

alter table "public"."contacts" 
  add constraint "contacts_decision_role_fk" 
  foreign key ("decisionRoleId") references "public"."settings"("id")
  on delete set null;

-- Add validation constraints
alter table "public"."contacts" 
  add constraint "contacts_first_name_not_empty" 
  check (trim("firstName") != '');

alter table "public"."contacts" 
  add constraint "contacts_last_name_not_empty" 
  check (trim("lastName") != '');

alter table "public"."contacts" 
  add constraint "contacts_email_format" 
  check ("email" is null or "email" ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

alter table "public"."contacts" 
  add constraint "contacts_phone_format" 
  check ("phone" is null or "phone" ~ '^[\d\s\-\.\(\)\+]+$');

alter table "public"."contacts" 
  add constraint "contacts_linkedin_format" 
  check ("linkedInUrl" is null or "linkedInUrl" ~ '^https?://(www\.)?linkedin\.com/');

-- Ensure only one primary contact per organization
create unique index "contacts_one_primary_per_org" 
  on "public"."contacts" ("organizationId") 
  where "isPrimary" = true;

-- Comment the table
comment on table "public"."contacts" is 'Contacts within organizations in the B2B food service CRM system';
comment on column "public"."contacts"."organizationId" is 'Reference to Organizations table (cascade delete)';
comment on column "public"."contacts"."roleId" is 'Reference to Settings table with category=role (Chef, Manager, Owner, etc.)';
comment on column "public"."contacts"."influenceLevelId" is 'Reference to Settings table with category=influence (High, Medium, Low)';
comment on column "public"."contacts"."decisionRoleId" is 'Reference to Settings table with category=decision (Decision Maker, Influencer, etc.)';
comment on column "public"."contacts"."isPrimary" is 'Whether this contact is the primary contact for the organization (unique per org)';
comment on column "public"."contacts"."linkedInUrl" is 'LinkedIn profile URL for professional networking';