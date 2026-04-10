import { pool } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";

/**
 * Get all users (Admin only)
 * GET /api/users
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { search = '', role = '' } = req.query;

  let query = `
    SELECT 
      id, username, email, role, 
      created_at, updated_at, is_active
    FROM users
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (username ILIKE $${params.length} OR email ILIKE $${params.length})`;
  }

  if (role) {
    params.push(role);
    query += ` AND role = $${params.length}`;
  }

  query += ` ORDER BY created_at DESC`;

  const result = await pool.query(query, params);

  res.status(200).json({
    success: true,
    users: result.rows.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }))
  });
});

/**
 * Get user by ID (Admin only)
 * GET /api/users/:id
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    `SELECT id, username, email, role, created_at, updated_at, is_active
     FROM users WHERE id = $1`,
    [id]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, 'User not found');
  }

  const user = result.rows[0];

  res.status(200).json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }
  });
});

/**
 * Create new user (Admin only)
 * POST /api/users
 */
export const createUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  // Validation
  if (!username || !password || !role) {
    throw new ApiError(400, 'Username, password, and role are required');
  }

  if (!['admin', 'manager', 'cashier'].includes(role)) {
    throw new ApiError(400, 'Invalid role. Must be admin, manager, or cashier');
  }

  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  // Check if username already exists
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE username = $1',
    [username]
  );

  if (existingUser.rowCount > 0) {
    throw new ApiError(400, 'Username already exists');
  }

  // Check if email already exists (if provided)
  if (email) {
    const existingEmail = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingEmail.rowCount > 0) {
      throw new ApiError(400, 'Email already exists');
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const result = await pool.query(
    `INSERT INTO users (username, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, email, role, created_at`,
    [username, email || null, hashedPassword, role]
  );

  const newUser = result.rows[0];

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.created_at
    }
  });
});

/**
 * Update user (Admin only)
 * PUT /api/users/:id
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, email, role, isActive } = req.body;

  // Check if user exists
  const existingUser = await pool.query(
    'SELECT id, username FROM users WHERE id = $1',
    [id]
  );

  if (existingUser.rowCount === 0) {
    throw new ApiError(404, 'User not found');
  }

  // Prevent admin from deactivating themselves
  if (req.user.userId === id && isActive === false) {
    throw new ApiError(400, 'You cannot deactivate your own account');
  }

  // Build update query dynamically
  const updates = [];
  const params = [];
  let paramCount = 1;

  if (username !== undefined) {
    // Check if new username is taken by another user
    const usernameCheck = await pool.query(
      'SELECT id FROM users WHERE username = $1 AND id != $2',
      [username, id]
    );
    if (usernameCheck.rowCount > 0) {
      throw new ApiError(400, 'Username already taken');
    }
    params.push(username);
    updates.push(`username = $${paramCount++}`);
  }

  if (email !== undefined) {
    if (email) {
      // Check if new email is taken by another user
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );
      if (emailCheck.rowCount > 0) {
        throw new ApiError(400, 'Email already taken');
      }
    }
    params.push(email || null);
    updates.push(`email = $${paramCount++}`);
  }

  if (role !== undefined) {
    if (!['admin', 'manager', 'cashier'].includes(role)) {
      throw new ApiError(400, 'Invalid role');
    }
    params.push(role);
    updates.push(`role = $${paramCount++}`);
  }

  if (isActive !== undefined) {
    params.push(isActive);
    updates.push(`is_active = $${paramCount++}`);
  }

  if (updates.length === 0) {
    throw new ApiError(400, 'No fields to update');
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  params.push(id);

  const query = `
    UPDATE users 
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id, username, email, role, is_active, updated_at
  `;

  const result = await pool.query(query, params);
  const updatedUser = result.rows[0];

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.is_active,
      updatedAt: updatedUser.updated_at
    }
  });
});

/**
 * Delete user (Admin only)
 * DELETE /api/users/:id
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (req.user.userId === id) {
    throw new ApiError(400, 'You cannot delete your own account');
  }

  // Check if user exists
  const existingUser = await pool.query(
    'SELECT id, username FROM users WHERE id = $1',
    [id]
  );

  if (existingUser.rowCount === 0) {
    throw new ApiError(404, 'User not found');
  }

  // Soft delete - deactivate instead of hard delete
  await pool.query(
    'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [id]
  );

  res.status(200).json({
    success: true,
    message: 'User deactivated successfully'
  });
});

/**
 * Reset user password (Admin only)
 * POST /api/users/:id/reset-password
 */
export const resetUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  // Check if user exists
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE id = $1',
    [id]
  );

  if (existingUser.rowCount === 0) {
    throw new ApiError(404, 'User not found');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await pool.query(
    'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [hashedPassword, id]
  );

  res.status(200).json({
    success: true,
    message: 'Password reset successfully'
  });
});

/**
 * Get user statistics (Admin only)
 * GET /api/users/stats
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const stats = await pool.query(`
    SELECT 
      COUNT(*) as total_users,
      COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
      COUNT(*) FILTER (WHERE role = 'manager') as manager_count,
      COUNT(*) FILTER (WHERE role = 'cashier') as cashier_count,
      COUNT(*) FILTER (WHERE is_active = true) as active_users,
      COUNT(*) FILTER (WHERE is_active = false) as inactive_users
    FROM users
  `);

  res.status(200).json({
    success: true,
    stats: stats.rows[0]
  });
});
