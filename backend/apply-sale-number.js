import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function applySaleNumber() {
  try {
    console.log('Applying sale_number migration...\n');

    const sql = fs.readFileSync('sql/011_add_sale_number.sql', 'utf8');
    
    await pool.query(sql);

    console.log('✓ Migration applied successfully!');

    // Verify the changes
    const result = await pool.query(`
      SELECT sale_number, id, created_at, total_amount 
      FROM sales 
      ORDER BY sale_number 
      LIMIT 5
    `);

    if (result.rows.length > 0) {
      console.log('\nSample sales with new sale_number:');
      result.rows.forEach(row => {
        console.log(`  Sale #${row.sale_number}: ${row.total_amount} (${new Date(row.created_at).toLocaleString()})`);
      });
    } else {
      console.log('\nNo sales in database yet. New sales will start from #10001');
    }

    await pool.end();
  } catch (error) {
    console.error('Error applying migration:', error);
    await pool.end();
    process.exit(1);
  }
}

applySaleNumber();
