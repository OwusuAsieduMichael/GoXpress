import dotenv from "dotenv";

dotenv.config();

const required = ["DATABASE_URL", "JWT_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (!/^postgres(ql)?:\/\//i.test(databaseUrl)) {
  throw new Error(
    "Invalid DATABASE_URL. Use a PostgreSQL connection string from Supabase (postgresql://...), not the project HTTPS URL."
  );
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  databaseUrl,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  corsOrigins: (process.env.CORS_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  isProduction: (process.env.NODE_ENV ?? "development") === "production",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  apiUrl: process.env.API_URL ?? "http://localhost:3000/api"
};
