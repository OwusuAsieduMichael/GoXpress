import express from 'express';
import { sendSupportEmail } from '../controllers/contactController.js';

const router = express.Router();

// POST /api/contact/support - Send support email
router.post('/support', sendSupportEmail);

export default router;
