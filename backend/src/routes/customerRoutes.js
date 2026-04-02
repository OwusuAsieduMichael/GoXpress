import { Router } from "express";
import {
  createCustomer,
  getCustomerHistory,
  getCustomers
} from "../controllers/customerController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { customerSchema } from "../models/schemas.js";

const router = Router();

router.use(requireAuth);
router.post("/", validate(customerSchema), createCustomer);
router.get("/", getCustomers);
router.get("/:id/history", getCustomerHistory);

export default router;
