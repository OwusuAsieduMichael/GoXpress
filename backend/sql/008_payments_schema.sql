-- Payments module schema reference
-- Note: existing project table uses "id" as primary key; this is the payment_id field.

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- payment_id
  sale_id UUID NOT NULL UNIQUE REFERENCES sales(id) ON DELETE CASCADE,
  method VARCHAR(20) NOT NULL CHECK (method IN ('cash', 'mobile_money', 'card')),
  amount_paid NUMERIC(12,2) NOT NULL CHECK (amount_paid >= 0), -- amount
  amount_received NUMERIC(12,2) NOT NULL CHECK (amount_received >= 0),
  change_due NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (change_due >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  reference VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
