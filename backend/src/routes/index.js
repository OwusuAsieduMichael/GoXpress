import { Router } from "express";
import authRoutes from "./authRoutes.js";
import productRoutes from "./productRoutes.js";
import customerRoutes from "./customerRoutes.js";
import salesRoutes from "./salesRoutes.js";
import reportRoutes from "./reportRoutes.js";
import inventoryRoutes from "./inventoryRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import paymentRoutes from "./paymentRoutes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/customers", customerRoutes);
router.use("/sales", salesRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/payments", paymentRoutes);

export default router;
