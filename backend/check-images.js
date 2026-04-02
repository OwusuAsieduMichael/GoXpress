import { pool } from './src/config/db.js';

async function checkImages() {
  try {
    const result = await pool.query(`
      SELECT sku, name, image_url 
      FROM products 
      WHERE sku IN ('FD001', 'FD002', 'GR001', 'HG001')
      ORDER BY sku
    `);
    
    console.log('Sample product image URLs:');
    result.rows.forEach(row => {
      console.log(`${row.sku}: ${row.name}`);
      console.log(`  → ${row.image_url}\n`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkImages();
