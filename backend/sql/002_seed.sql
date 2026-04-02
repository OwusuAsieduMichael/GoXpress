-- Optional seed data for local development
-- Default admin login:
-- username: admin
-- password: Admin@1234

INSERT INTO users (full_name, email, username, password_hash, role)
VALUES (
  'System Admin',
  'admin@pos.local',
  'admin',
  crypt('Admin@1234', gen_salt('bf')),
  'admin'
)
ON CONFLICT (username) DO NOTHING;

INSERT INTO categories (name, description)
VALUES
  ('Food', 'Prepared and packaged food items'),
  ('Groceries', 'Everyday grocery essentials'),
  ('Home Gadgets', 'Small electronics and home gadgets')
ON CONFLICT (name) DO NOTHING;
