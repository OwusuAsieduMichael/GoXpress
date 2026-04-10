import { Router } from "express";
import { createSale, getSales, deleteSale } from "../controllers/salesController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { saleSchema } from "../models/schemas.js";

const router = Router();

router.use(requireAuth);
router.post("/", validate(saleSchema), createSale);
router.get("/", getSales);
router.delete("/:id", requireRole("admin"), deleteSale); // Admin only

export default router;
