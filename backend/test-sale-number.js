import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
  try {
    // Check if column exists
    const colCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'sales' AND column_name = 'sale_number'
    `);
    
    if (colCheck.rows.length === 0) {
      console.log('❌ sale_number column does NOT exist in sales table');
    } else {
      console.log('✓ sale_number column exists:', colCheck.rows[0]);
      
      // Get a sample sale
      const sampleSale = await pool.query(`
        SELECT id, sale_number, total_amount, created_at 
        FROM sales 
        ORDER BY created_at DESC 
        LIMIT 1
      `);
      
      if (sampleSale.rows.length > 0) {
        console.log('\n✓ Sample sale from database:');
        console.log(`  Sale #${sampleSale.rows[0].sale_number}`);
        console.log(`  Amount: ${sampleSale.rows[0].total_amount}`);
        console.log(`  Date: ${sampleSale.rows[0].created_at}`);
      }
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

test();
