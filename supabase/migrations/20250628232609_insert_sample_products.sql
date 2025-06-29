-- Insert sample products data for B2B Food Service CRM
-- This provides realistic sample data for testing and development

-- Insert sample products with variety across categories
INSERT INTO "public"."products" ("name", "principalId", "category", "description", "sku", "unitOfMeasure", "packageSize", "price", "active", "createdBy") VALUES

-- Dairy Products (Principal 1 & 2)
('Whole Milk Grade A', (SELECT id FROM "public"."settings" WHERE category = 'principal' AND key = 'principal_1' LIMIT 1), 'Dairy', 'Premium whole milk from local farms, perfect for restaurants and cafeterias.', 'PR1-DAI-0001', 'gallon', '4/1 gallon', 12.50, true, null),
('Heavy Cream 36%', (SELECT id FROM "public"."settings" WHERE category = 'principal' AND key = 'principal_1' LIMIT 1), 'Dairy', 'Restaurant-grade heavy cream for cooking and desserts.', 'PR1-DAI-0002', 'quart', '12/1 quart', 45.75, true, null),
('Cheddar Cheese Block', (SELECT id FROM "public"."settings" WHERE category = 'principal' AND key = 'principal_2' LIMIT 1), 'Dairy', 'Aged white cheddar cheese, excellent melting properties.', 'PR2-DAI-0001', 'lb', '8/5 lb', 89.95, true, null),

-- Meat Products (Principal 1 & 3)
('Ground Beef 80/20', (SELECT id FROM "public"."settings" WHERE category = 'principal' AND key = 'principal_1' LIMIT 1), 'Meat', 'Fresh ground beef, 80% lean, perfect for burgers and tacos.', 'PR1-MEA-0001', 'lb', '10 lb chub', 65.00, true, null),
('Chicken Breast Boneless', (SELECT id FROM "public"."settings" WHERE category = 'principal' AND key = 'principal_3' LIMIT 1), 'Meat', 'Fresh boneless chicken breast fillets, individually quick frozen.', 'PR3-MEA-0001', 'lb', '4/5 lb', 45.80, true, null),
('Bacon Strips Thick Cut', (SELECT id FROM "public"."settings" WHERE category = 'principal' AND key = 'principal_1' LIMIT 1), 'Meat', 'Premium thick-cut bacon strips, perfect for breakfast service.', 'PR1-MEA-0002', 'lb', '12/1 lb', 85.20, true, null),

-- Produce Products (Principal 2 & 4)
('Romaine Lettuce Hearts', (SELECT id FROM "public"."settings" WHERE category = 'principal' AND key = 'principal_2' LIMIT 1), 'Produce', 'Fresh romaine lettuce hearts, triple washed and ready to use.', 'PR2-PRO-0001', 'case', '24 ct case', 28.50, true, null),
('Roma Tomatoes', (SELECT id FROM "public"."settings" WHERE category = 'principal' AND key = 'principal_4' LIMIT 1), 'Produce', 'Vine-ripened Roma tomatoes, perfect for slicing and sauces.', 'PR4-PRO-0001', 'lb', '25 lb case', 35.75, true, null),

-- Frozen Products (Principal 3 & 5)
('French Fries Straight Cut', (SELECT id FROM "public"."settings" WHERE category = 'principal' AND key = 'principal_3' LIMIT 1), 'Frozen', 'Premium straight-cut french fries, restaurant quality.', 'PR3-FRO-0001', 'case', '6/5 lb', 32.90, true, null),
('Chicken Wings IQF', (SELECT id FROM "public"."settings" WHERE category = 'principal' AND key = 'principal_5' LIMIT 1), 'Frozen', 'Individually quick frozen chicken wings, perfect for buffalo wings.', 'PR5-FRO-0001', 'lb', '4/5 lb', 55.60, true, null),

-- Dry Goods (Principal 6 & 7)
('All Purpose Flour', (SELECT id FROM "public"."settings" WHERE category = 'principal' AND key = 'principal_6' LIMIT 1), 'Dry Goods', 'High-quality all-purpose flour for baking and cooking.', 'PR6-DRY-0001', 'lb', '50 lb bag', 18.75, true, null),
('White Rice Long Grain', (SELECT id FROM "public"."settings" WHERE category = 'principal' AND key = 'principal_7' LIMIT 1), 'Dry Goods', 'Premium long grain white rice, perfect for side dishes.', 'PR7-DRY-0001', 'lb', '50 lb bag', 25.50, true, null),

-- Beverages (Principal 8 & 9)
('Colombian Coffee Grounds', (SELECT id FROM "public"."settings" WHERE category = 'principal' AND key = 'principal_8' LIMIT 1), 'Beverages', 'Premium Colombian coffee, medium roast, for restaurants and cafes.', 'PR8-BEV-0001', 'lb', '6/2 lb', 68.40, true, null),
('Orange Juice Concentrate', (SELECT id FROM "public"."settings" WHERE category = 'principal' AND key = 'principal_9' LIMIT 1), 'Beverages', 'Fresh orange juice concentrate, makes 1 gallon per container.', 'PR9-BEV-0001', 'case', '12/1 qt', 42.95, true, null),

-- Cleaning Supplies (Principal 10 & 11)
('Commercial Dish Soap', (SELECT id FROM "public"."settings" WHERE category = 'principal' AND key = 'principal_10' LIMIT 1), 'Cleaning', 'Heavy-duty commercial dish soap for restaurant dishwashing.', 'PR10-CLE-0001', 'gallon', '4/1 gallon', 28.95, true, null),
('Sanitizer Solution', (SELECT id FROM "public"."settings" WHERE category = 'principal' AND key = 'principal_11' LIMIT 1), 'Cleaning', 'Food-safe sanitizer solution for kitchen surfaces and equipment.', 'PR11-CLE-0001', 'case', '6/32 oz', 35.20, true, null),

-- A few inactive products for testing
('Discontinued Butter', (SELECT id FROM "public"."settings" WHERE category = 'principal' AND key = 'principal_1' LIMIT 1), 'Dairy', 'This product has been discontinued.', 'PR1-DAI-0999', 'lb', '36/1 lb', 95.00, false, null),
('Old Pasta Recipe', (SELECT id FROM "public"."settings" WHERE category = 'principal' AND key = 'principal_7' LIMIT 1), 'Dry Goods', 'Old pasta formulation, no longer available.', 'PR7-DRY-0999', 'case', '12/1 lb', 22.50, false, null);

-- Comment on the sample data
COMMENT ON TABLE "public"."products" IS 'Products catalog for the B2B food service CRM system with sample data for development and testing';

-- Verify the insert worked
DO $$
DECLARE
    product_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO product_count FROM "public"."products";
    RAISE NOTICE 'Successfully inserted sample products. Total products in database: %', product_count;
END $$;