-- Update product image URLs to point to real uploaded images
-- Run this after uploading product images to frontend/public/products/

-- Update Food category images (FD001-FD020)
UPDATE products
SET image_url = CONCAT('/products/food/', sku, '.jpg')
WHERE sku ~ '^FD[0-9]{3}$' AND sku BETWEEN 'FD001' AND 'FD020';

-- Update Groceries category images (GR001-GR020)
UPDATE products
SET image_url = CONCAT('/products/groceries/', sku, '.jpg')
WHERE sku ~ '^GR[0-9]{3}$' AND sku BETWEEN 'GR001' AND 'GR020';

-- Update Home Gadgets category images (HG001-HG020)
UPDATE products
SET image_url = CONCAT('/products/gadgets/', sku, '.jpg')
WHERE sku ~ '^HG[0-9]{3}$' AND sku BETWEEN 'HG001' AND 'HG020';

-- If you used PNG format instead of JPG, run these instead:
-- UPDATE products SET image_url = CONCAT('/products/food/', sku, '.png') WHERE sku ~ '^FD[0-9]{3}$' AND sku BETWEEN 'FD001' AND 'FD020';
-- UPDATE products SET image_url = CONCAT('/products/groceries/', sku, '.png') WHERE sku ~ '^GR[0-9]{3}$' AND sku BETWEEN 'GR001' AND 'GR020';
-- UPDATE products SET image_url = CONCAT('/products/gadgets/', sku, '.png') WHERE sku ~ '^HG[0-9]{3}$' AND sku BETWEEN 'HG001' AND 'HG020';
