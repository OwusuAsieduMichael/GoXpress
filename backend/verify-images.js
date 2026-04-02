import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function verifyAndUpdateImages() {
  try {
    console.log('Checking product image URLs...\n');

    // Check current image URLs
    const result = await pool.query(
      'SELECT id, name, sku, image_url FROM products ORDER BY sku LIMIT 10'
    );

    console.log('Sample products:');
    result.rows.forEach(row => {
      console.log(`${row.sku}: ${row.name} -> ${row.image_url || 'NULL'}`);
    });

    console.log('\nUpdating image URLs...\n');

    // Update Food images
    await pool.query(`
      UPDATE products
      SET image_url = CONCAT('/products/food/', sku, '.jpg')
      WHERE sku LIKE 'FD%'
    `);

    // Update Groceries images
    await pool.query(`
      UPDATE products
      SET image_url = CONCAT('/products/groceries/', sku, '.jpg')
      WHERE sku LIKE 'GR%'
    `);

    // Update Home Gadgets images
    await pool.query(`
      UPDATE products
      SET image_url = CONCAT('/products/gadgets/', sku, '.jpg')
      WHERE sku LIKE 'HG%'
    `);

    console.log('Image URLs updated successfully!');

    // Verify updates
    const verifyResult = await pool.query(
      'SELECT id, name, sku, image_url FROM products ORDER BY sku LIMIT 10'
    );

    console.log('\nUpdated products:');
    verifyResult.rows.forEach(row => {
      console.log(`${row.sku}: ${row.name} -> ${row.image_url}`);
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

verifyAndUpdateImages();
