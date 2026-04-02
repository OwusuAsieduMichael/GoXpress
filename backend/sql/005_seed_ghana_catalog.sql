-- Ghana-market demo product catalog
-- 20 Food + 20 Groceries + 20 Home Gadgets
-- Curated from Ghana e-commerce listings (Jumia Ghana, GoShop Ghana categories, Ghana Mall Online).
-- Safe to run multiple times (upsert by SKU).

INSERT INTO categories (name, description)
VALUES
  ('Food', 'Prepared and packaged food items'),
  ('Groceries', 'Everyday grocery essentials'),
  ('Home Gadgets', 'Small electronics and home gadgets')
ON CONFLICT (name) DO NOTHING;

WITH product_seed (
  sku,
  barcode,
  name,
  description,
  category_name,
  price,
  stock_quantity,
  low_stock_threshold
) AS (
  VALUES
    -- Food (20)
    ('FD001','6201000000001','Jollof Rice Pack','Ready-to-heat jollof rice meal pack','Food',18.50,70,10),
    ('FD002','6201000000002','Waakye Combo','Waakye combo with sauce and gari','Food',22.00,55,8),
    ('FD003','6201000000003','Banku Mix','Fermented corn and cassava banku mix','Food',12.00,90,12),
    ('FD004','6201000000004','Fufu Mix','Plantain and cassava fufu flour blend','Food',16.00,85,12),
    ('FD005','6201000000005','Kenkey Balls Pack','Packed ready kenkey balls','Food',14.00,60,10),
    ('FD006','6201000000006','Kelewele Spice Chips','Spiced plantain chips snack','Food',9.00,120,18),
    ('FD007','6201000000007','Shito Sauce Mild','Mild Ghana black pepper sauce','Food',15.00,80,10),
    ('FD008','6201000000008','Shito Sauce Hot','Hot Ghana black pepper sauce','Food',15.50,75,10),
    ('FD009','6201000000009','Plantain Chips Salted','Salted plantain chips snack','Food',8.50,140,20),
    ('FD010','6201000000010','Plantain Chips Spicy','Spicy plantain chips snack','Food',8.50,140,20),
    ('FD011','6201000000011','Coconut Toffee Bites','Traditional coconut toffee candy','Food',7.00,100,15),
    ('FD012','6201000000012','Groundnut Brittle','Roasted groundnut brittle snack','Food',7.50,110,15),
    ('FD013','6201000000013','Sobolo Drink 500ml','Hibiscus sobolo ready drink','Food',6.50,160,25),
    ('FD014','6201000000014','Asaana Drink 500ml','Fermented corn asaana drink','Food',6.50,150,25),
    ('FD015','6201000000015','Tigernut Drink 500ml','Natural tigernut milk drink','Food',7.50,130,20),
    ('FD016','6201000000016','Milo Ready Drink 250ml','Chocolate malt ready drink','Food',8.00,145,20),
    ('FD017','6201000000017','Tom Brown Cereal 500g','Roasted cereal porridge blend','Food',13.00,95,14),
    ('FD018','6201000000018','Hausa Koko Mix 500g','Spiced millet porridge mix','Food',11.50,100,14),
    ('FD019','6201000000019','Koose Bean Mix 400g','Bean paste mix for koose','Food',10.50,90,14),
    ('FD020','6201000000020','Gari Soakings Pack 350g','Instant gari soakings combo','Food',8.00,105,15),

    -- Groceries (20)
    ('GR001','6202000000001','Nhyira Jasmine Perfumed Rice 5kg','Jasmine perfumed rice bag','Groceries',120.00,48,8),
    ('GR002','6202000000002','KDM Viet Fragrant Rice 5kg','Fragrant long grain rice bag','Groceries',115.00,44,8),
    ('GR003','6202000000003','Daibon Viet Long Grain Rice 5kg','Long grain rice bag','Groceries',105.00,42,8),
    ('GR004','6202000000004','Royal Umbrella Jasmine Rice 5kg','Thai jasmine rice pack','Groceries',135.00,36,7),
    ('GR005','6202000000005','Tilemsi Basmati Rice 5kg','Premium basmati rice bag','Groceries',150.00,30,6),
    ('GR006','6202000000006','Peacock Thai Jasmine Rice 5kg','Fragrant jasmine rice bag','Groceries',145.00,30,6),
    ('GR007','6202000000007','Frytol Vegetable Oil 4L','Refined vegetable cooking oil','Groceries',98.00,40,8),
    ('GR008','6202000000008','Nkulenu Palm Soup Base 780g','Palm soup concentrate','Groceries',32.00,55,10),
    ('GR009','6202000000009','Tasty Tom Tomato Mix 210g','Tomato seasoning mix sachet','Groceries',3.50,240,30),
    ('GR010','6202000000010','Lele Corned Beef 340g','Canned corned beef','Groceries',22.00,70,10),
    ('GR011','6202000000011','Cowbell Milk Powder 400g','Instant milk powder','Groceries',39.00,60,10),
    ('GR012','6202000000012','Tetley Green Tea 100s','Green tea bag pack','Groceries',29.00,52,10),
    ('GR013','6202000000013','3Hands Ghana Groundnuts 500g','Roasted groundnuts pack','Groceries',15.00,85,12),
    ('GR014','6202000000014','Golden Morn Cereal 800g','Maize and soybean cereal','Groceries',24.00,68,10),
    ('GR015','6202000000015','Tigernut Gari 1kg','Fortified tigernut gari blend','Groceries',20.00,72,12),
    ('GR016','6202000000016','Sweet Potato Gari 1kg','Sweet potato enriched gari','Groceries',21.00,70,12),
    ('GR017','6202000000017','Gevans Natural Mineral Water 1.5L x6','Natural mineral water pack','Groceries',30.00,88,15),
    ('GR018','6202000000018','Kitchen Maxi Roll 2pcs','Kitchen tissue maxi roll pack','Groceries',28.00,66,10),
    ('GR019','6202000000019','T-Roll Tissue 4pcs','Soft toilet tissue roll pack','Groceries',22.00,72,12),
    ('GR020','6202000000020','Oyster Sauce 700ml','Savory oyster cooking sauce','Groceries',26.00,58,10),

    -- Home Gadgets (20)
    ('HG001','6203000000001','Samsung 32" N5000 FHD TV','32-inch Samsung Full HD TV','Home Gadgets',1850.00,10,3),
    ('HG002','6203000000002','Samsung 32" T5300 Smart TV','32-inch Samsung smart TV','Home Gadgets',2350.00,8,2),
    ('HG003','6203000000003','LG 32LQ630B6LA Smart TV','32-inch LG webOS smart TV','Home Gadgets',2490.00,8,2),
    ('HG004','6203000000004','Nasco 43" Smart TV','43-inch Nasco smart television','Home Gadgets',2990.00,6,2),
    ('HG005','6203000000005','TCL 43" Frameless Android TV','43-inch TCL Android TV','Home Gadgets',3250.00,6,2),
    ('HG006','6203000000006','Asano 32" Digital Satellite TV','32-inch Asano digital TV','Home Gadgets',1699.00,10,3),
    ('HG007','6203000000007','Acutec 32" Digital Satellite TV','32-inch Acutec digital TV','Home Gadgets',1299.00,10,3),
    ('HG008','6203000000008','Smeco 32" Digital Satellite TV','32-inch Smeco digital TV','Home Gadgets',1399.00,10,3),
    ('HG009','6203000000009','Vizio 32" Smart LED TV','32-inch Vizio smart LED TV','Home Gadgets',1999.00,8,2),
    ('HG010','6203000000010','Starlife 32" TV','32-inch Starlife digital TV','Home Gadgets',1499.00,10,3),
    ('HG011','6203000000011','M8 4G LTE Mobile WiFi Hotspot','Portable 4G WiFi hotspot router','Home Gadgets',149.00,32,8),
    ('HG012','6203000000012','MTN 4G Broadband Router','Fixed 4G broadband router','Home Gadgets',899.00,12,4),
    ('HG013','6203000000013','Samsung 32GB USB Type-C Flash Drive','USB-C high speed flash drive','Home Gadgets',159.00,36,8),
    ('HG014','6203000000014','Samsung 64GB USB Type-C Flash Drive','USB-C high speed flash drive','Home Gadgets',219.00,30,8),
    ('HG015','6203000000015','Wireless Keyboard and Mouse Combo','2.4G keyboard and mouse set','Home Gadgets',199.00,28,6),
    ('HG016','6203000000016','Electric Kettle 2L','Fast-boil electric kettle','Home Gadgets',180.00,28,6),
    ('HG017','6203000000017','Blender 1.5L','High-speed kitchen blender','Home Gadgets',310.00,22,5),
    ('HG018','6203000000018','Air Fryer 4L','Digital air fryer 4-liter','Home Gadgets',420.00,18,4),
    ('HG019','6203000000019','Microwave Oven 20L','Countertop microwave oven','Home Gadgets',950.00,8,2),
    ('HG020','6203000000020','Rechargeable Standing Fan 16in','16-inch rechargeable standing fan','Home Gadgets',550.00,14,4)
),
upsert_products AS (
  INSERT INTO products (
    sku,
    barcode,
    name,
    description,
    image_url,
    category_id,
    price,
    cost_price,
    is_active
  )
  SELECT
    ps.sku,
    ps.barcode,
    ps.name,
    ps.description,
    CASE
      WHEN ps.sku = 'FD001' THEN '/products/ghana-foods/food-01.svg'
      WHEN ps.sku = 'FD002' THEN '/products/ghana-foods/food-02.svg'
      WHEN ps.sku = 'FD003' THEN '/products/ghana-foods/food-03.svg'
      WHEN ps.sku = 'FD004' THEN '/products/ghana-foods/food-04.svg'
      WHEN ps.sku = 'FD005' THEN '/products/ghana-foods/food-05.svg'
      WHEN ps.sku = 'FD006' THEN '/products/ghana-foods/food-06.svg'
      WHEN ps.sku = 'FD007' THEN '/products/ghana-foods/food-07.svg'
      WHEN ps.sku = 'FD008' THEN '/products/ghana-foods/food-08.svg'
      WHEN ps.sku = 'FD009' THEN '/products/ghana-foods/food-09.svg'
      WHEN ps.sku = 'FD010' THEN '/products/ghana-foods/food-10.svg'
      WHEN ps.sku = 'FD011' THEN '/products/ghana-foods/food-11.svg'
      WHEN ps.sku = 'FD012' THEN '/products/ghana-foods/food-12.svg'
      WHEN ps.sku = 'FD013' THEN '/products/ghana-foods/food-13.svg'
      WHEN ps.sku = 'FD014' THEN '/products/ghana-foods/food-14.svg'
      WHEN ps.sku = 'FD015' THEN '/products/ghana-foods/food-15.svg'
      WHEN ps.sku = 'FD016' THEN '/products/ghana-foods/food-16.svg'
      WHEN ps.sku = 'FD017' THEN '/products/ghana-foods/food-17.svg'
      WHEN ps.sku = 'FD018' THEN '/products/ghana-foods/food-18.svg'
      WHEN ps.sku = 'FD019' THEN '/products/ghana-foods/food-19.svg'
      WHEN ps.sku = 'FD020' THEN '/products/ghana-foods/food-20.svg'
      ELSE CONCAT(
        'https://placehold.co/600x450/FFF1E6/FF8D2F?text=',
        REPLACE(REPLACE(ps.name, ' ', '+'), '&', 'and')
      )
    END,
    c.id,
    ps.price::numeric(12,2),
    ROUND((ps.price * 0.72)::numeric, 2),
    TRUE
  FROM product_seed ps
  JOIN categories c ON c.name = ps.category_name
  ON CONFLICT (sku) DO UPDATE
  SET
    barcode = EXCLUDED.barcode,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    category_id = EXCLUDED.category_id,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    is_active = TRUE
  RETURNING id, sku
)
INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold)
SELECT
  p.id,
  ps.stock_quantity,
  ps.low_stock_threshold
FROM product_seed ps
JOIN products p ON p.sku = ps.sku
ON CONFLICT (product_id) DO UPDATE
SET
  stock_quantity = EXCLUDED.stock_quantity,
  low_stock_threshold = EXCLUDED.low_stock_threshold;

-- If an older 50x3 seed was used before, mark extra legacy seed SKUs inactive
-- so the catalog reflects exactly 20 per category.
UPDATE products p
SET is_active = FALSE
WHERE p.sku ~ '^(FD|GR|HG)[0-9]{3}$'
  AND substring(p.sku from 3 for 3)::int > 20;
