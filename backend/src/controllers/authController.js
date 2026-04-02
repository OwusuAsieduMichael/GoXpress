import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/jwt.js";

const tokenCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "lax"
};

const sanitizeUser = (row) => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  username: row.username,
  role: row.role,
  isActive: row.is_active,
  createdAt: row.created_at
});

export const signup = asyncHandler(async (req, res) => {
  const { fullName, email, username, password, role = "cashier" } = req.body;

  const exists = await pool.query(
    `SELECT id
     FROM users
     WHERE email = LOWER($1) OR LOWER(username) = LOWER($2)`,
    [email, username]
  );
  if (exists.rowCount > 0) {
    throw new ApiError(409, "Email or username already in use");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await pool.query(
    `INSERT INTO users (full_name, email, username, password_hash, role)
     VALUES ($1, LOWER($2), LOWER($3), $4, $5)
     RETURNING id, full_name, email, username, role, is_active, created_at`,
    [fullName, email, username, passwordHash, role]
  );

  const user = sanitizeUser(result.rows[0]);
  res.status(201).json({ user, message: "Signup successful. Please log in." });
});

export const login = asyncHandler(async (req, res) => {
  const { username, password, role } = req.body;

  const result = await pool.query(
    `SELECT id, full_name, email, username, role, is_active, password_hash, created_at
     FROM users
     WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)`,
    [username]
  );

  if (result.rowCount === 0) {
    throw new ApiError(401, "Invalid credentials");
  }

  const user = result.rows[0];
  if (!user.is_active) {
    throw new ApiError(403, "Account disabled");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (role && user.role !== role) {
    throw new ApiError(403, "Selected role does not match this account");
  }

  const token = signToken({
    sub: user.id,
    role: user.role,
    email: user.email,
    username: user.username
  });
  res.cookie("token", token, tokenCookieOptions);

  res.json({
    user: sanitizeUser(user),
    token
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax"
  });
  res.json({ message: "Logged out successfully" });
});

export const me = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT id, full_name, email, username, role, is_active, created_at
     FROM users WHERE id = $1`,
    [req.user.sub]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "User not found");
  }

  res.json({ user: sanitizeUser(result.rows[0]) });
});


export const googleCallback = asyncHandler(async (req, res) => {
  const user = req.user;
  
  if (!user) {
    return res.redirect(`${env.corsOrigins[0]}/login?error=auth_failed`);
  }

  const token = signToken({
    sub: user.id,
    role: user.role,
    email: user.email,
    username: user.username
  });

  res.cookie("token", token, tokenCookieOptions);
  res.redirect(`${env.corsOrigins[0]}/dashboard`);
});
