import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixSaleNumbers() {
  try {
    console.log('Fixing sale numbers...\n');
    
    // Get all sales ordered by creation date
    const allSales = await pool.query(`
      SELECT id, sale_number, created_at 
      FROM sales 
      ORDER BY created_at ASC
    `);
    
    console.log(`Found ${allSales.rows.length} sales`);
    
    // Update each sale with proper sequential number starting from 10001
    for (let i = 0; i < allSales.rows.length; i++) {
      const newNumber = 10001 + i;
      await pool.query(
        'UPDATE sales SET sale_number = $1 WHERE id = $2',
        [newNumber, allSales.rows[i].id]
      );
    }
    
    console.log(`✓ Updated all sales to sequential numbers from 10001 to ${10000 + allSales.rows.length}`);
    
    // Set the sequence to continue from the last number
    const nextNumber = 10001 + allSales.rows.length;
    await pool.query(`SELECT setval(pg_get_serial_sequence('sales', 'sale_number'), $1)`, [nextNumber - 1]);
    
    console.log(`✓ Set sequence to continue from ${nextNumber}`);
    
    // Verify
    const verify = await pool.query(`
      SELECT sale_number, created_at 
      FROM sales 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('\nLatest 5 sales:');
    verify.rows.forEach(row => {
      console.log(`  Sale #${row.sale_number} - ${new Date(row.created_at).toLocaleString()}`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

fixSaleNumbers();
