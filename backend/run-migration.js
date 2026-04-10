import { pool } from './src/config/db.js';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const runMigration = async () => {
  try {
    const sql = fs.readFileSync('./sql/013_add_user_active_status.sql', 'utf8');
    await pool.query(sql);
    console.log('✅ Migration 013 completed successfully');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
};

runMigration();
