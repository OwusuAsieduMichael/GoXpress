import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import emailService from '../services/emailService.js';

/**
 * Send contact/support email
 * POST /api/contact/support
 */
export const sendSupportEmail = asyncHandler(async (req, res) => {
  const { name, email, category, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    throw new ApiError(400, 'Name, email, and message are required');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, 'Invalid email format');
  }

  try {
    await emailService.sendSupportEmail({
      name,
      email,
      category,
      message
    });

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We will respond within 24 hours.'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    throw new ApiError(500, 'Failed to send message. Please try again later.');
  }
});
