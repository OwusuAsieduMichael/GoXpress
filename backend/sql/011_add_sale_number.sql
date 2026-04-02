-- Add sequential sale number to sales table
-- This creates a human-readable 5-digit sale ID

-- Add sale_number column
ALTER TABLE sales ADD COLUMN IF NOT EXISTS sale_number SERIAL;

-- Create a unique index on sale_number
CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_sale_number ON sales(sale_number);

-- Update existing sales to have sequential numbers (if any exist)
-- This will assign numbers starting from 10001
DO $$
DECLARE
  start_number INT := 10001;
BEGIN
  -- Only update if there are sales without sale_number
  IF EXISTS (SELECT 1 FROM sales WHERE sale_number IS NULL LIMIT 1) THEN
    WITH numbered_sales AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
      FROM sales
      WHERE sale_number IS NULL
    )
    UPDATE sales s
    SET sale_number = start_number + ns.row_num - 1
    FROM numbered_sales ns
    WHERE s.id = ns.id;
  END IF;
END $$;

-- Set the sequence to start from 10001 for new sales
SELECT setval(pg_get_serial_sequence('sales', 'sale_number'), 
              COALESCE((SELECT MAX(sale_number) FROM sales), 10000));

-- Make sale_number NOT NULL after populating existing records
ALTER TABLE sales ALTER COLUMN sale_number SET NOT NULL;

-- Add a comment
COMMENT ON COLUMN sales.sale_number IS 'Human-readable sequential sale number starting from 10001';
