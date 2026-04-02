import { Router } from "express";
import {
  adjustStock,
  getAdjustments,
  getInventory
} from "../controllers/inventoryController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { stockAdjustmentSchema } from "../models/schemas.js";

const router = Router();

router.use(requireAuth);
router.get("/", getInventory);
router.get("/adjustments", requireRole("admin", "manager"), getAdjustments);
router.post(
  "/adjust",
  requireRole("admin", "manager"),
  validate(stockAdjustmentSchema),
  adjustStock
);

export default router;
