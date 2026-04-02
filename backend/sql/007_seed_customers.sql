-- Seed 10 demo customers for local/testing use.
-- Safe to run multiple times (upsert by email).

INSERT INTO customers (full_name, email, phone, address)
VALUES
  ('Kwame Mensah', 'kwame.mensah@goxpress.demo', '+233244101001', 'East Legon, Accra'),
  ('Ama Serwaa', 'ama.serwaa@goxpress.demo', '+233501112223', 'Adenta, Accra'),
  ('Kofi Boateng', 'kofi.boateng@goxpress.demo', '+233552223334', 'Santasi, Kumasi'),
  ('Akosua Asante', 'akosua.asante@goxpress.demo', '+233209990011', 'Asokwa, Kumasi'),
  ('Yaw Ofori', 'yaw.ofori@goxpress.demo', '+233546667778', 'Takoradi Market Circle'),
  ('Efua Owusu', 'efua.owusu@goxpress.demo', '+233275551212', 'Cape Coast, Central Region'),
  ('Nana Kwaku', 'nana.kwaku@goxpress.demo', '+233245556789', 'Tema Community 25'),
  ('Abena Nti', 'abena.nti@goxpress.demo', '+233503334455', 'Kasoa, Central Region'),
  ('Kojo Addo', 'kojo.addo@goxpress.demo', '+233266778899', 'Madina Zongo Junction'),
  ('Mavis Adjei', 'mavis.adjei@goxpress.demo', '+233208887766', 'Spintex Road, Accra')
ON CONFLICT (email) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address;
