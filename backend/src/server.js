import app from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./config/db.js";

const start = async () => {
  // Bind to 0.0.0.0 for Render deployment (allows external connections)
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
  
  app.listen(env.port, host, async () => {
    // eslint-disable-next-line no-console
    console.log(`POS backend running on ${host}:${env.port}`);
    try {
      await pool.query("SELECT 1");
      // eslint-disable-next-line no-console
      console.log("Database connection established.");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        "Database unavailable at startup. API is running, but DB-dependent routes will fail until connectivity is restored.",
        { code: error?.code, message: error?.message }
      );
    }
  });
};

start();
