import { ApiError } from "../utils/apiError.js";

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const dbConnectionCodes = new Set([
    "EACCES",
    "ETIMEDOUT",
    "ECONNREFUSED",
    "ENOTFOUND",
    "EHOSTUNREACH"
  ]);

  if (dbConnectionCodes.has(err?.code)) {
    return res.status(503).json({
      message:
        "Database is unreachable right now. Check Supabase connection/network and retry."
    });
  }

  if (err?.code === "28P01") {
    return res.status(500).json({
      message:
        "Database authentication failed. Verify DATABASE_URL username/password."
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details
    });
  }

  const statusCode = err.statusCode ?? 500;
  return res.status(statusCode).json({
    message: statusCode === 500 ? "Internal server error" : err.message
  });
};
