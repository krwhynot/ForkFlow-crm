-- Create Interactions table for B2B Food Service CRM
create table "public"."interactions" (
  "id" bigint primary key generated always as identity,
  "organizationId" bigint not null references "public"."organizations"("id") on delete cascade,
  "contactId" bigint references "public"."contacts"("id") on delete set null,
  "opportunityId" bigint references "public"."deals"("id") on delete set null,
  "typeId" bigint not null references "public"."settings"("id"),
  "subject" text not null,
  "description" text,
  "scheduledDate" timestamptz,
  "completedDate" timestamptz,
  "isCompleted" boolean not null default false,
  "duration" integer, -- Duration in minutes
  "outcome" text,
  "followUpRequired" boolean not null default false,
  "followUpDate" timestamptz,
  "followUpNotes" text,
  
  -- GPS location for in-person interactions
  "latitude" numeric(10, 8),
  "longitude" numeric(11, 8),
  "locationNotes" text,
  
  -- File attachments stored as JSON array of file metadata
  "attachments" jsonb default '[]'::jsonb,
  
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  "createdBy" uuid references auth.users(id)
);

-- Create indexes for performance
create index "interactions_organization_idx" on "public"."interactions" ("organizationId");
create index "interactions_contact_idx" on "public"."interactions" ("contactId");
create index "interactions_opportunity_idx" on "public"."interactions" ("opportunityId");
create index "interactions_type_idx" on "public"."interactions" ("typeId");
create index "interactions_scheduled_date_idx" on "public"."interactions" ("scheduledDate");
create index "interactions_completed_date_idx" on "public"."interactions" ("completedDate");
create index "interactions_is_completed_idx" on "public"."interactions" ("isCompleted");
create index "interactions_follow_up_required_idx" on "public"."interactions" ("followUpRequired");
create index "interactions_follow_up_date_idx" on "public"."interactions" ("followUpDate");
create index "interactions_created_by_idx" on "public"."interactions" ("createdBy");
create index "interactions_created_at_idx" on "public"."interactions" ("createdAt");

-- Spatial index for GPS coordinates
create index "interactions_location_idx" on "public"."interactions" 
  using gist (point("longitude", "latitude"))
  where "latitude" is not null and "longitude" is not null;

-- Composite indexes for common queries
create index "interactions_org_date_idx" on "public"."interactions" ("organizationId", "scheduledDate");
create index "interactions_contact_date_idx" on "public"."interactions" ("contactId", "scheduledDate");
create index "interactions_type_date_idx" on "public"."interactions" ("typeId", "scheduledDate");
create index "interactions_completed_date_org_idx" on "public"."interactions" ("isCompleted", "scheduledDate", "organizationId");

-- Enable Row Level Security
alter table "public"."interactions" enable row level security;

-- Create RLS policies for Interactions
-- Users can only see interactions for organizations they have access to
create policy "Interactions are viewable by organization access" 
  on "public"."interactions" 
  for select 
  using (
    exists (
      select 1 from "public"."organizations" o 
      where o."id" = "interactions"."organizationId" 
      and (
        auth.uid() = o."createdBy" OR 
        auth.jwt() ->> 'email' = o."accountManager" OR
        auth.role() = 'service_role'
      )
    )
  );

-- Users can insert interactions for organizations they have access to
create policy "Interactions are insertable by organization access" 
  on "public"."interactions" 
  for insert 
  with check (
    auth.uid() = "createdBy" and
    exists (
      select 1 from "public"."organizations" o 
      where o."id" = "interactions"."organizationId" 
      and (
        auth.uid() = o."createdBy" OR 
        auth.jwt() ->> 'email' = o."accountManager" OR
        auth.role() = 'service_role'
      )
    )
  );

-- Users can update interactions for organizations they have access to
create policy "Interactions are updatable by organization access" 
  on "public"."interactions" 
  for update 
  using (
    exists (
      select 1 from "public"."organizations" o 
      where o."id" = "interactions"."organizationId" 
      and (
        auth.uid() = o."createdBy" OR 
        auth.jwt() ->> 'email' = o."accountManager" OR
        auth.role() = 'service_role'
      )
    )
  );

-- Users can delete interactions for organizations they have access to
create policy "Interactions are deletable by organization access" 
  on "public"."interactions" 
  for delete 
  using (
    exists (
      select 1 from "public"."organizations" o 
      where o."id" = "interactions"."organizationId" 
      and (
        auth.uid() = o."createdBy" OR 
        auth.jwt() ->> 'email' = o."accountManager" OR
        auth.role() = 'service_role'
      )
    )
  );

-- Create updated_at trigger for Interactions
create trigger "update_interactions_updated_at" 
  before update on "public"."interactions"
  for each row execute function "public"."update_updated_at_column"();

-- Add foreign key constraints with proper validation
alter table "public"."interactions" 
  add constraint "interactions_organization_fk" 
  foreign key ("organizationId") references "public"."organizations"("id")
  on delete cascade;

alter table "public"."interactions" 
  add constraint "interactions_contact_fk" 
  foreign key ("contactId") references "public"."contacts"("id")
  on delete set null;

alter table "public"."interactions" 
  add constraint "interactions_opportunity_fk" 
  foreign key ("opportunityId") references "public"."deals"("id")
  on delete set null;

alter table "public"."interactions" 
  add constraint "interactions_type_fk" 
  foreign key ("typeId") references "public"."settings"("id")
  on delete restrict;

-- Add validation constraints
alter table "public"."interactions" 
  add constraint "interactions_subject_not_empty" 
  check (trim("subject") != '');

alter table "public"."interactions" 
  add constraint "interactions_duration_positive" 
  check ("duration" is null or "duration" > 0);

alter table "public"."interactions" 
  add constraint "interactions_completed_date_logic" 
  check (
    ("isCompleted" = false and "completedDate" is null) or
    ("isCompleted" = true and "completedDate" is not null)
  );

alter table "public"."interactions" 
  add constraint "interactions_follow_up_date_logic" 
  check (
    ("followUpRequired" = false) or
    ("followUpRequired" = true and "followUpDate" is not null)
  );

alter table "public"."interactions" 
  add constraint "interactions_scheduled_before_completed" 
  check (
    "scheduledDate" is null or "completedDate" is null or 
    "scheduledDate" <= "completedDate"
  );

-- GPS coordinate validation (basic range checks)
alter table "public"."interactions" 
  add constraint "interactions_latitude_range" 
  check ("latitude" is null or ("latitude" >= -90 and "latitude" <= 90));

alter table "public"."interactions" 
  add constraint "interactions_longitude_range" 
  check ("longitude" is null or ("longitude" >= -180 and "longitude" <= 180));

-- Ensure both latitude and longitude are provided together
alter table "public"."interactions" 
  add constraint "interactions_coordinates_complete" 
  check (
    ("latitude" is null and "longitude" is null) or
    ("latitude" is not null and "longitude" is not null)
  );

-- Validate attachments JSON structure
alter table "public"."interactions" 
  add constraint "interactions_attachments_valid_json" 
  check (jsonb_typeof("attachments") = 'array');

-- Comment the table
comment on table "public"."interactions" is 'Interaction tracking for B2B food service sales activities';
comment on column "public"."interactions"."organizationId" is 'Reference to Organizations table (cascade delete)';
comment on column "public"."interactions"."contactId" is 'Reference to Contacts table (optional, set null on delete)';
comment on column "public"."interactions"."opportunityId" is 'Reference to Deals/Opportunities table (optional, set null on delete)';
comment on column "public"."interactions"."typeId" is 'Reference to Settings table with category=interaction_type (Email, Call, In Person, etc.)';
comment on column "public"."interactions"."subject" is 'Brief description of the interaction purpose';
comment on column "public"."interactions"."scheduledDate" is 'When the interaction is scheduled to occur';
comment on column "public"."interactions"."completedDate" is 'When the interaction was actually completed';
comment on column "public"."interactions"."duration" is 'Duration of the interaction in minutes';
comment on column "public"."interactions"."latitude" is 'GPS latitude coordinate for in-person interactions';
comment on column "public"."interactions"."longitude" is 'GPS longitude coordinate for in-person interactions';
comment on column "public"."interactions"."locationNotes" is 'Additional notes about the interaction location';
comment on column "public"."interactions"."attachments" is 'JSON array of file attachment metadata (filename, size, type, url)';
comment on column "public"."interactions"."followUpRequired" is 'Whether this interaction requires a follow-up';
comment on column "public"."interactions"."followUpDate" is 'When the follow-up should occur';
comment on column "public"."interactions"."followUpNotes" is 'Notes for the follow-up interaction';