-- Create Deals/Opportunities table for B2B Food Service CRM
create table "public"."deals" (
  "id" bigint primary key generated always as identity,
  "organizationId" bigint not null references "public"."organizations"("id") on delete cascade,
  "contactId" bigint references "public"."contacts"("id") on delete set null,
  "productId" bigint references "public"."products"("id") on delete set null,
  "stageId" bigint references "public"."settings"("id") on delete set null,
  "stage" text not null default 'lead_discovery',
  "status" text not null default 'active',
  "probability" integer not null default 0, -- 0-100% chance of closing
  "amount" numeric(15,2) not null default 0.00, -- Deal value
  "expectedClosingDate" timestamptz,
  "name" text,
  "description" text,
  "notes" text,
  "index" integer not null default 0, -- For kanban ordering
  "archivedAt" timestamptz,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  "createdBy" uuid references auth.users(id)
);

-- Create indexes for performance
create index "deals_organization_idx" on "public"."deals" ("organizationId");
create index "deals_contact_idx" on "public"."deals" ("contactId");
create index "deals_product_idx" on "public"."deals" ("productId");
create index "deals_stage_id_idx" on "public"."deals" ("stageId");
create index "deals_stage_idx" on "public"."deals" ("stage");
create index "deals_status_idx" on "public"."deals" ("status");
create index "deals_probability_idx" on "public"."deals" ("probability");
create index "deals_amount_idx" on "public"."deals" ("amount");
create index "deals_expected_closing_date_idx" on "public"."deals" ("expectedClosingDate");
create index "deals_archived_at_idx" on "public"."deals" ("archivedAt");
create index "deals_created_by_idx" on "public"."deals" ("createdBy");
create index "deals_created_at_idx" on "public"."deals" ("createdAt");

-- Composite indexes for common queries
create index "deals_org_stage_idx" on "public"."deals" ("organizationId", "stage");
create index "deals_status_stage_idx" on "public"."deals" ("status", "stage");
create index "deals_probability_amount_idx" on "public"."deals" ("probability", "amount");
create index "deals_active_expected_closing_idx" on "public"."deals" ("status", "expectedClosingDate") 
  where "status" = 'active' and "archivedAt" is null;

-- Index for kanban ordering
create index "deals_stage_index_order_idx" on "public"."deals" ("stage", "index");

-- Enable Row Level Security
alter table "public"."deals" enable row level security;

-- Create RLS policies for Deals
-- Users can only see deals for organizations they have access to
create policy "Deals are viewable by organization access" 
  on "public"."deals" 
  for select 
  using (
    exists (
      select 1 from "public"."organizations" o 
      where o."id" = "deals"."organizationId" 
      and (
        auth.uid() = o."createdBy" OR 
        auth.jwt() ->> 'email' = o."accountManager" OR
        auth.role() = 'service_role'
      )
    )
  );

-- Users can insert deals for organizations they have access to
create policy "Deals are insertable by organization access" 
  on "public"."deals" 
  for insert 
  with check (
    auth.uid() = "createdBy" and
    exists (
      select 1 from "public"."organizations" o 
      where o."id" = "deals"."organizationId" 
      and (
        auth.uid() = o."createdBy" OR 
        auth.jwt() ->> 'email' = o."accountManager" OR
        auth.role() = 'service_role'
      )
    )
  );

-- Users can update deals for organizations they have access to
create policy "Deals are updatable by organization access" 
  on "public"."deals" 
  for update 
  using (
    exists (
      select 1 from "public"."organizations" o 
      where o."id" = "deals"."organizationId" 
      and (
        auth.uid() = o."createdBy" OR 
        auth.jwt() ->> 'email' = o."accountManager" OR
        auth.role() = 'service_role'
      )
    )
  );

-- Users can delete deals for organizations they have access to
create policy "Deals are deletable by organization access" 
  on "public"."deals" 
  for delete 
  using (
    exists (
      select 1 from "public"."organizations" o 
      where o."id" = "deals"."organizationId" 
      and (
        auth.uid() = o."createdBy" OR 
        auth.jwt() ->> 'email' = o."accountManager" OR
        auth.role() = 'service_role'
      )
    )
  );

-- Create updated_at trigger for Deals
create trigger "update_deals_updated_at" 
  before update on "public"."deals"
  for each row execute function "public"."update_updated_at_column"();

-- Add foreign key constraints with proper validation
alter table "public"."deals" 
  add constraint "deals_organization_fk" 
  foreign key ("organizationId") references "public"."organizations"("id")
  on delete cascade;

alter table "public"."deals" 
  add constraint "deals_contact_fk" 
  foreign key ("contactId") references "public"."contacts"("id")
  on delete set null;

alter table "public"."deals" 
  add constraint "deals_product_fk" 
  foreign key ("productId") references "public"."products"("id")
  on delete set null;

alter table "public"."deals" 
  add constraint "deals_stage_fk" 
  foreign key ("stageId") references "public"."settings"("id")
  on delete set null;

-- Add validation constraints
alter table "public"."deals" 
  add constraint "deals_stage_valid" 
  check ("stage" in ('lead_discovery', 'contacted', 'sampled_visited', 'follow_up', 'close'));

alter table "public"."deals" 
  add constraint "deals_status_valid" 
  check ("status" in ('active', 'won', 'lost', 'on-hold'));

alter table "public"."deals" 
  add constraint "deals_probability_range" 
  check ("probability" >= 0 and "probability" <= 100);

alter table "public"."deals" 
  add constraint "deals_amount_positive" 
  check ("amount" >= 0);

alter table "public"."deals" 
  add constraint "deals_index_positive" 
  check ("index" >= 0);

-- Ensure archived deals have archivedAt timestamp
alter table "public"."deals" 
  add constraint "deals_archived_logic" 
  check (
    ("status" != 'won' and "status" != 'lost') or
    ("archivedAt" is not null)
  );

-- Comment the table
comment on table "public"."deals" is 'Sales opportunities/deals in the B2B food service CRM pipeline';
comment on column "public"."deals"."organizationId" is 'Reference to Organizations table (cascade delete)';
comment on column "public"."deals"."contactId" is 'Reference to Contacts table (optional, set null on delete)';
comment on column "public"."deals"."productId" is 'Reference to Products table (optional, set null on delete)';
comment on column "public"."deals"."stageId" is 'Reference to Settings table with category=stage (optional for stage name lookup)';
comment on column "public"."deals"."stage" is 'Current pipeline stage (lead_discovery, contacted, sampled_visited, follow_up, close)';
comment on column "public"."deals"."status" is 'Deal status (active, won, lost, on-hold)';
comment on column "public"."deals"."probability" is 'Percentage chance of closing (0-100)';
comment on column "public"."deals"."amount" is 'Expected deal value in USD';
comment on column "public"."deals"."expectedClosingDate" is 'Expected date for deal closure';
comment on column "public"."deals"."name" is 'Deal name or title for identification';
comment on column "public"."deals"."index" is 'Order index for kanban board display';
comment on column "public"."deals"."archivedAt" is 'Timestamp when deal was archived (won/lost deals)';