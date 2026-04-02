import { Router } from "express";
import {
  getDailySalesReport,
  getInventoryReport,
  getProductPerformance,
  getReportsInventory,
  getReportsProducts,
  getReportsSales,
  getReportsTransactions,
  getSummaryReport
} from "../controllers/reportController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);
router.get("/sales", requireRole("admin", "manager", "cashier"), getReportsSales);
router.get("/products", requireRole("admin", "manager", "cashier"), getReportsProducts);
router.get(
  "/transactions",
  requireRole("admin", "manager", "cashier"),
  getReportsTransactions
);
router.get("/inventory", requireRole("admin", "manager", "cashier"), getReportsInventory);

// Backward compatible endpoints
router.get("/summary", requireRole("admin", "manager", "cashier"), getSummaryReport);
router.get("/daily-sales", requireRole("admin", "manager", "cashier"), getDailySalesReport);
router.get(
  "/product-performance",
  requireRole("admin", "manager", "cashier"),
  getProductPerformance
);
router.get("/inventory-legacy", requireRole("admin", "manager", "cashier"), getInventoryReport);

export default router;
