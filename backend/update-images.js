import { pool } from './src/config/db.js';
import fs from 'fs';

async function updateProductImages() {
  try {
    console.log('Updating product image URLs...');
    
    const sql = fs.readFileSync('./sql/010_update_product_images.sql', 'utf8');
    await pool.query(sql);
    
    console.log('✓ Product images updated successfully!');
    console.log('✓ All products now point to your uploaded images');
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating images:', error.message);
    process.exit(1);
  }
}

updateProductImages();
