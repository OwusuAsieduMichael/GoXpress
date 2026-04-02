import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkSales() {
  try {
    const result = await pool.query(`
      SELECT sale_number, id, total_amount, created_at 
      FROM sales 
      ORDER BY sale_number
    `);

    console.log('All sales with sale numbers:\n');
    
    if (result.rows.length === 0) {
      console.log('No sales found in database.');
    } else {
      result.rows.forEach(row => {
        console.log(`Sale #${row.sale_number}: ${row.total_amount} GHS (${new Date(row.created_at).toLocaleString()})`);
      });
      
      console.log(`\nTotal: ${result.rows.length} sales`);
      console.log(`Next sale will be: #${Math.max(...result.rows.map(r => r.sale_number)) + 1}`);
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkSales();
