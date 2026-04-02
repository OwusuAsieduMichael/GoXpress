import { pool, withTransaction } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getInventory = asyncHandler(async (req, res) => {
  const { lowStock = "false", search = "" } = req.query;

  const result = await pool.query(
    `SELECT
      i.product_id,
      p.name AS product_name,
      p.sku,
      p.barcode,
      p.price,
      p.category_id,
      c.name AS category_name,
      i.stock_quantity,
      i.low_stock_threshold,
      (i.stock_quantity <= i.low_stock_threshold) AS is_low_stock,
      i.updated_at
     FROM inventory i
     JOIN products p ON p.id = i.product_id
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.is_active = true
       AND ($1::boolean = false OR i.stock_quantity <= i.low_stock_threshold)
       AND (
         $2 = '' OR
         p.name ILIKE '%' || $2 || '%' OR
         p.sku ILIKE '%' || $2 || '%' OR
         COALESCE(p.barcode, '') ILIKE '%' || $2 || '%'
       )
     ORDER BY is_low_stock DESC, p.name ASC`,
    [lowStock === "true", search.trim()]
  );

  res.json({
    inventory: result.rows.map((row) => ({
      productId: row.product_id,
      productName: row.product_name,
      sku: row.sku,
      barcode: row.barcode,
      price: row.price,
      categoryId: row.category_id,
      categoryName: row.category_name,
      stockQuantity: row.stock_quantity,
      lowStockThreshold: row.low_stock_threshold,
      isLowStock: row.is_low_stock,
      updatedAt: row.updated_at
    }))
  });
});

export const adjustStock = asyncHandler(async (req, res) => {
  const { productId, change, reason } = req.body;

  const adjustment = await withTransaction(async (client) => {
    const inv = await client.query(
      `SELECT i.stock_quantity, p.name
       FROM inventory i
       JOIN products p ON p.id = i.product_id
       WHERE i.product_id = $1
       FOR UPDATE`,
      [productId]
    );

    if (inv.rowCount === 0) {
      throw new ApiError(404, "Inventory record not found");
    }

    const current = inv.rows[0].stock_quantity;
    const next = current + change;
    if (next < 0) {
      throw new ApiError(400, "Stock cannot be negative");
    }

    await client.query(
      `UPDATE inventory
       SET stock_quantity = $1
       WHERE product_id = $2`,
      [next, productId]
    );

    const adjustmentResult = await client.query(
      `INSERT INTO inventory_adjustments
       (product_id, changed_by, change_amount, reason, previous_quantity, new_quantity)
       VALUES ($1, $2, $3, NULLIF($4, ''), $5, $6)
       RETURNING id, created_at`,
      [productId, req.user.sub, change, reason, current, next]
    );

    return {
      id: adjustmentResult.rows[0].id,
      createdAt: adjustmentResult.rows[0].created_at,
      productId,
      productName: inv.rows[0].name,
      previousQuantity: current,
      newQuantity: next,
      changeAmount: change
    };
  });

  res.status(201).json({ adjustment });
});

export const getAdjustments = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT
      ia.id,
      ia.created_at,
      ia.product_id,
      p.name AS product_name,
      ia.change_amount,
      ia.previous_quantity,
      ia.new_quantity,
      ia.reason,
      u.full_name AS changed_by_name
     FROM inventory_adjustments ia
     JOIN products p ON p.id = ia.product_id
     JOIN users u ON u.id = ia.changed_by
     ORDER BY ia.created_at DESC
     LIMIT 200`
  );

  res.json({
    adjustments: result.rows.map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      productId: row.product_id,
      productName: row.product_name,
      changeAmount: row.change_amount,
      previousQuantity: row.previous_quantity,
      newQuantity: row.new_quantity,
      reason: row.reason,
      changedByName: row.changed_by_name
    }))
  });
});
