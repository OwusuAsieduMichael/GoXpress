import express from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getUserStats
} from '../controllers/userController.js';

const router = express.Router();

// All user management routes require admin role
router.use(requireAuth);
router.use(requireRole('admin'));

// Get user statistics
router.get('/stats', getUserStats);

// CRUD operations
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// Password reset
router.post('/:id/reset-password', resetUserPassword);

export default router;
