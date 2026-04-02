-- Update payments table for Paystack integration
-- Run this migration to add Paystack-specific fields

-- Add new columns to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS reference VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS provider_response JSONB,
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS authorization_code VARCHAR(255),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update status column to include more states
ALTER TABLE payments 
ALTER COLUMN status TYPE VARCHAR(50);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_sale_id ON payments(sale_id);

-- Add comments for documentation
COMMENT ON COLUMN payments.reference IS 'Paystack transaction reference';
COMMENT ON COLUMN payments.provider IS 'Payment provider: manual, paystack, etc.';
COMMENT ON COLUMN payments.provider_response IS 'Full response from payment provider';
COMMENT ON COLUMN payments.customer_phone IS 'Customer phone number for mobile money';
COMMENT ON COLUMN payments.customer_email IS 'Customer email for payment receipt';
COMMENT ON COLUMN payments.authorization_code IS 'Paystack authorization code for recurring payments';

-- Update existing records to have provider = 'manual'
UPDATE payments SET provider = 'manual' WHERE provider IS NULL;
