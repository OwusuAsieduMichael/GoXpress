import app from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./config/db.js";

const start = async () => {
  app.listen(env.port, async () => {
    // eslint-disable-next-line no-console
    console.log(`POS backend running on port ${env.port}`);
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
