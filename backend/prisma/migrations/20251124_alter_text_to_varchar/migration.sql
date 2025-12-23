-- Alter text columns to varchar with safe casting
-- This migration converts existing TEXT columns to bounded VARCHAR types
-- USING SUBSTRING to avoid runtime errors if any value exceeds target length

-- Customers
ALTER TABLE "customers"
  ALTER COLUMN "name" TYPE VARCHAR(255) USING SUBSTRING("name" FROM 1 FOR 255);

ALTER TABLE "customers"
  ALTER COLUMN "phone" TYPE VARCHAR(20) USING SUBSTRING("phone" FROM 1 FOR 20);

-- Suppliers
ALTER TABLE "suppliers"
  ALTER COLUMN "name" TYPE VARCHAR(255) USING SUBSTRING("name" FROM 1 FOR 255);

ALTER TABLE "suppliers"
  ALTER COLUMN "contact" TYPE VARCHAR(255) USING SUBSTRING("contact" FROM 1 FOR 255);

ALTER TABLE "suppliers"
  ALTER COLUMN "phone" TYPE VARCHAR(20) USING SUBSTRING("phone" FROM 1 FOR 20);

ALTER TABLE "suppliers"
  ALTER COLUMN "email" TYPE VARCHAR(255) USING SUBSTRING("email" FROM 1 FOR 255);