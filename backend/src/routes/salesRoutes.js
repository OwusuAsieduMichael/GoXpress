import { Router } from "express";
import { createSale, getSales } from "../controllers/salesController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { saleSchema } from "../models/schemas.js";

const router = Router();

router.use(requireAuth);
router.post("/", validate(saleSchema), createSale);
router.get("/", getSales);

export default router;
