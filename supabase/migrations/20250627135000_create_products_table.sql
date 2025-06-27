-- Create Products table for B2B Food Service CRM
create table "public"."products" (
  "id" bigint primary key generated always as identity,
  "name" text not null,
  "principalId" bigint not null references "public"."settings"("id") on delete restrict,
  "category" text,
  "description" text,
  "sku" text not null,
  "unitOfMeasure" text,
  "packageSize" text,
  "price" decimal(10,2) default 0,
  "active" boolean not null default true,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now(),
  "createdBy" uuid references auth.users(id)
);

-- Create indexes for performance
create index "products_principal_idx" on "public"."products" ("principalId");
create index "products_name_idx" on "public"."products" ("name");
create index "products_sku_idx" on "public"."products" ("sku");
create index "products_category_idx" on "public"."products" ("category");
create index "products_active_idx" on "public"."products" ("active");
create index "products_price_idx" on "public"."products" ("price");
create index "products_created_by_idx" on "public"."products" ("createdBy");

-- Enable Row Level Security
alter table "public"."products" enable row level security;

-- Create RLS policies for Products
-- Users can only see products accessible to their organization/tenant
create policy "Products are viewable by organization access" 
  on "public"."products" 
  for select 
  using (
    auth.role() = 'service_role' OR
    auth.uid() = "createdBy" OR
    auth.uid() is not null  -- For now, allow authenticated users to see products
  );

-- Users can insert products if they are authenticated
create policy "Products are insertable by authenticated users" 
  on "public"."products" 
  for insert 
  with check (
    auth.uid() = "createdBy" and
    auth.uid() is not null
  );

-- Users can update products they created or if they have admin access
create policy "Products are updatable by creators or admins" 
  on "public"."products" 
  for update 
  using (
    auth.role() = 'service_role' OR
    auth.uid() = "createdBy"
  );

-- Users can delete products they created or if they have admin access
create policy "Products are deletable by creators or admins" 
  on "public"."products" 
  for delete 
  using (
    auth.role() = 'service_role' OR
    auth.uid() = "createdBy"
  );

-- Create updated_at trigger for Products
create trigger "update_products_updated_at" 
  before update on "public"."products"
  for each row execute function "public"."update_updated_at_column"();

-- Add foreign key constraints with proper validation
alter table "public"."products" 
  add constraint "products_principal_fk" 
  foreign key ("principalId") references "public"."settings"("id")
  on delete restrict;

-- Add validation constraints
alter table "public"."products" 
  add constraint "products_name_not_empty" 
  check (trim("name") != '');

alter table "public"."products" 
  add constraint "products_sku_not_empty" 
  check (trim("sku") != '');

alter table "public"."products" 
  add constraint "products_price_non_negative" 
  check ("price" >= 0);

alter table "public"."products" 
  add constraint "products_sku_format" 
  check ("sku" ~ '^[A-Za-z0-9\-_]+$');

-- Ensure unique SKU per principal (prevent duplicate SKUs within same principal)
create unique index "products_sku_principal_unique" 
  on "public"."products" ("sku", "principalId");

-- Add constraint to ensure principalId references a Setting with category='principal'
alter table "public"."products" 
  add constraint "products_principal_category_check" 
  check (
    exists (
      select 1 from "public"."settings" s 
      where s."id" = "principalId" 
      and s."category" = 'principal' 
      and s."active" = true
    )
  );

-- Comment the table
comment on table "public"."products" is 'Products catalog for the B2B food service CRM system';
comment on column "public"."products"."principalId" is 'Reference to Settings table with category=principal (Sysco, US Foods, etc.)';
comment on column "public"."products"."category" is 'Product category (dairy, meat, produce, frozen, dry goods, etc.)';
comment on column "public"."products"."sku" is 'Stock Keeping Unit - unique identifier per principal';
comment on column "public"."products"."unitOfMeasure" is 'Unit of measure (case, each, lb, gallon, etc.)';
comment on column "public"."products"."packageSize" is 'Package size specification (12/1lb, 6/4oz, etc.)';
comment on column "public"."products"."price" is 'Current list price in USD';
comment on column "public"."products"."active" is 'Whether product is available for sale';