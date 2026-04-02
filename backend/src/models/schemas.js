import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(40)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string().min(8).max(64),
  role: z.enum(["admin", "cashier", "manager"]).optional()
});

export const loginSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(40)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string().min(1),
  role: z.enum(["admin", "cashier", "manager"]).optional()
});

export const categorySchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(255).optional().or(z.literal(""))
});

export const productSchema = z.object({
  sku: z.string().min(1).max(40),
  barcode: z.string().max(64).optional().or(z.literal("")),
  name: z.string().min(2).max(150),
  description: z.string().max(255).optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().uuid().optional().nullable(),
  price: z.number().positive(),
  costPrice: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
  stockQuantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5)
});

export const updateProductSchema = productSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one field is required"
);

export const customerSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal(""))
});

export const saleSchema = z.object({
  customerId: z.string().uuid().optional().nullable(),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  notes: z.string().max(255).optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
        discount: z.number().min(0).default(0)
      })
    )
    .min(1),
  payment: z.object({
    method: z.enum(["cash", "mobile_money", "card"]),
    amountReceived: z.number().positive()
  })
});

export const paymentCreateSchema = z
  .object({
    saleId: z.string().uuid().optional(),
    sale_id: z.string().uuid().optional(),
    amount: z.number().positive(),
    amountReceived: z.number().positive().optional(),
    amount_received: z.number().positive().optional(),
    paymentMethod: z.enum(["cash", "momo", "mobile_money", "card"]).optional(),
    payment_method: z.enum(["cash", "momo", "mobile_money", "card"]).optional(),
    status: z.enum(["success", "pending", "failed", "completed"]).default("success"),
    reference: z.string().max(100).optional().or(z.literal(""))
  })
  .refine((payload) => payload.saleId || payload.sale_id, {
    message: "sale_id is required"
  })
  .refine((payload) => payload.paymentMethod || payload.payment_method, {
    message: "payment_method is required"
  })
  .transform((payload) => ({
    saleId: payload.saleId || payload.sale_id,
    amount: payload.amount,
    amountReceived: payload.amountReceived || payload.amount_received || payload.amount,
    paymentMethod: payload.paymentMethod || payload.payment_method,
    status: payload.status,
    reference: payload.reference || ""
  }));

export const stockAdjustmentSchema = z.object({
  productId: z.string().uuid(),
  change: z.number().int(),
  reason: z.string().max(255).optional().or(z.literal(""))
});
