import { Router } from "express";
import {
  getDashboardSalesTrend,
  getDashboardSummary,
  getDashboardTopProducts
} from "../controllers/reportController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);
router.get("/summary", requireRole("admin", "manager", "cashier"), getDashboardSummary);
router.get(
  "/sales-trend",
  requireRole("admin", "manager", "cashier"),
  getDashboardSalesTrend
);
router.get(
  "/top-products",
  requireRole("admin", "manager", "cashier"),
  getDashboardTopProducts
);

export default router;
