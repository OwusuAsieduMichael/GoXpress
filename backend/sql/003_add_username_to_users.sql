-- Migration for existing projects created before username support.
-- Run this once in Supabase SQL editor.

ALTER TABLE users
ADD COLUMN IF NOT EXISTS username VARCHAR(40);

UPDATE users
SET username = CONCAT('user_', SUBSTRING(REPLACE(id::text, '-', '') FROM 1 FOR 10))
WHERE username IS NULL OR username = '';

ALTER TABLE users
ALTER COLUMN username SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_username_key'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT users_username_key UNIQUE (username);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
