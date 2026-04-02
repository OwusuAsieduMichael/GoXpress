import { Router } from "express";
import { 
  createPayment,
  initiateMoMoPayment,
  submitMoMoOTP,
  verifyPayment,
  handlePaystackWebhook,
  getPaymentBySaleId,
  checkPaymentStatus
} from "../controllers/paymentController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { paymentCreateSchema } from "../models/schemas.js";

const router = Router();

// Webhook route (no auth required - Paystack calls this)
router.post("/webhook", handlePaystackWebhook);

// Protected routes (require authentication)
router.use(requireAuth);
router.post("/", validate(paymentCreateSchema), createPayment);

// Paystack Mobile Money routes
router.post("/momo/initiate", initiateMoMoPayment);
router.post("/momo/submit-otp", submitMoMoOTP);
router.get("/verify/:reference", verifyPayment);
router.get("/sale/:saleId", getPaymentBySaleId);
router.get("/status/:reference", checkPaymentStatus);

export default router;
