import { pool } from "../config/db.js";

const run = async () => {
  try {
    const result = await pool.query("SELECT NOW() as now");
    // eslint-disable-next-line no-console
    console.log("DB connection OK:", result.rows[0].now);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("DB connection failed:", {
      message: error.message,
      code: error.code,
      severity: error.severity,
      hint: error.hint
    });
    process.exit(1);
  } finally {
    await pool.end();
  }
};

run();
