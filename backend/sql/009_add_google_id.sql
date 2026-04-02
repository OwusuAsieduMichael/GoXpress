-- Add google_id column for OAuth authentication
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Allow password_hash to be nullable for OAuth users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
