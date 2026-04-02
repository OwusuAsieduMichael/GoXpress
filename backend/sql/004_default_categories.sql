-- Ensure required default categories exist:
-- Food, Groceries, Home Gadgets
-- Safe to run multiple times.

INSERT INTO categories (name, description)
VALUES
  ('Food', 'Prepared and packaged food items'),
  ('Groceries', 'Everyday grocery essentials'),
  ('Home Gadgets', 'Small electronics and home gadgets')
ON CONFLICT (name) DO NOTHING;

-- Optional cleanup for legacy starter categories if they are unused.
DELETE FROM categories c
WHERE LOWER(c.name) IN ('beverages', 'snacks')
  AND NOT EXISTS (
    SELECT 1 FROM products p WHERE p.category_id = c.id
  );
