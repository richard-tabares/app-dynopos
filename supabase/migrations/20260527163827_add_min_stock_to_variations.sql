ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS min_stock bigint DEFAULT 0;
