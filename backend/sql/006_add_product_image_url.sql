-- Migration for existing databases:
-- Adds image_url column to products so frontend can render product images.

ALTER TABLE products
ADD COLUMN IF NOT EXISTS image_url TEXT;
