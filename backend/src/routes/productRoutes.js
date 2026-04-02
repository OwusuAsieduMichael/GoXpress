import { Router } from "express";
import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  getCategories,
  getProducts,
  updateCategory,
  updateProduct
} from "../controllers/productController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  categorySchema,
  productSchema,
  updateProductSchema
} from "../models/schemas.js";

const router = Router();

router.use(requireAuth);

router.get("/", getProducts);
router.post("/", requireRole("admin", "manager"), validate(productSchema), createProduct);
router.put(
  "/:id",
  requireRole("admin", "manager"),
  validate(updateProductSchema),
  updateProduct
);
router.delete("/:id", requireRole("admin", "manager"), deleteProduct);

router.get("/categories/list", getCategories);
router.post(
  "/categories",
  requireRole("admin", "manager"),
  validate(categorySchema),
  createCategory
);
router.put(
  "/categories/:id",
  requireRole("admin", "manager"),
  validate(categorySchema),
  updateCategory
);
router.delete("/categories/:id", requireRole("admin", "manager"), deleteCategory);

export default router;
