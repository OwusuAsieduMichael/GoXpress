import { pool, withTransaction } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const asNumber = (value) => Number(value ?? 0);
const round2 = (value) => Math.round(value * 100) / 100;

export const createSale = asyncHandler(async (req, res) => {
  const { customerId, discount = 0, tax = 0, notes = "", items, payment } = req.body;

  const receipt = await withTransaction(async (client) => {
    const productIds = [...new Set(items.map((item) => item.productId))];

    const inventoryResult = await client.query(
      `SELECT
         p.id,
         p.name,
         p.price,
         p.is_active,
         i.stock_quantity
       FROM products p
       JOIN inventory i ON i.product_id = p.id
       WHERE p.id = ANY($1::uuid[])
       FOR UPDATE`,
      [productIds]
    );

    const productMap = new Map(inventoryResult.rows.map((row) => [row.id, row]));
    const saleItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new ApiError(404, `Product not found: ${item.productId}`);
      }
      if (!product.is_active) {
        throw new ApiError(400, `Product is inactive: ${product.name}`);
      }
      if (product.stock_quantity < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}`
        );
      }

      const unitPrice = asNumber(product.price);
      const lineTotal = round2(unitPrice * item.quantity - asNumber(item.discount ?? 0));
      subtotal += lineTotal;

      saleItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        discount: asNumber(item.discount ?? 0),
        subtotal: lineTotal
      });
    }

    subtotal = round2(subtotal);
    const discountAmount = round2(asNumber(discount));
    const taxAmount = round2(asNumber(tax));
    const totalAmount = round2(subtotal - discountAmount + taxAmount);

    if (totalAmount < 0) {
      throw new ApiError(400, "Invalid totals: total cannot be negative");
    }

    const received = round2(asNumber(payment.amountReceived));
    if (received < totalAmount) {
      throw new ApiError(400, "Amount received is less than total amount");
    }
    const changeDue = round2(received - totalAmount);

    const saleResult = await client.query(
      `INSERT INTO sales
       (cashier_id, customer_id, subtotal, discount_amount, tax_amount, total_amount, notes)
       VALUES ($1, $2, $3, $4, $5, $6, NULLIF($7, ''))
       RETURNING id, sale_number, created_at`,
      [req.user.sub, customerId, subtotal, discountAmount, taxAmount, totalAmount, notes]
    );
    const sale = saleResult.rows[0];

    for (const item of saleItems) {
      await client.query(
        `INSERT INTO sales_items
         (sale_id, product_id, quantity, unit_price, discount_amount, line_total)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [sale.id, item.productId, item.quantity, item.unitPrice, item.discount, item.subtotal]
      );

      await client.query(
        `UPDATE inventory
         SET stock_quantity = stock_quantity - $1
         WHERE product_id = $2`,
        [item.quantity, item.productId]
      );

      await client.query(
        `UPDATE products SET sold_count = sold_count + $1 WHERE id = $2`,
        [item.quantity, item.productId]
      );
    }

    await client.query(
      `INSERT INTO payments
       (sale_id, method, amount_paid, amount_received, change_due, status)
       VALUES ($1, $2, $3, $4, $5, 'completed')`,
      [sale.id, payment.method, totalAmount, received, changeDue]
    );

    const saleMeta = await client.query(
      `SELECT
         s.id,
         s.sale_number,
         s.created_at,
         s.subtotal,
         s.discount_amount,
         s.tax_amount,
         s.total_amount,
         s.notes,
         c.full_name AS customer_name,
         u.full_name AS cashier_name,
         p.method AS payment_method,
         p.amount_paid,
         p.amount_received,
         p.change_due
       FROM sales s
       LEFT JOIN customers c ON c.id = s.customer_id
       LEFT JOIN users u ON u.id = s.cashier_id
       LEFT JOIN payments p ON p.sale_id = s.id
       WHERE s.id = $1`,
      [sale.id]
    );

    return {
      ...saleMeta.rows[0],
      items: saleItems
    };
  });

  res.status(201).json({
    sale: {
      id: receipt.id,
      saleNumber: receipt.sale_number,
      createdAt: receipt.created_at,
      subtotal: asNumber(receipt.subtotal),
      discountAmount: asNumber(receipt.discount_amount),
      taxAmount: asNumber(receipt.tax_amount),
      totalAmount: asNumber(receipt.total_amount),
      notes: receipt.notes,
      customerName: receipt.customer_name,
      cashierName: receipt.cashier_name,
      payment: {
        method: receipt.payment_method,
        amountPaid: asNumber(receipt.amount_paid),
        amountReceived: asNumber(receipt.amount_received),
        changeDue: asNumber(receipt.change_due)
      },
      items: receipt.items
    }
  });
});

export const getSales = asyncHandler(async (req, res) => {
  const { dateFrom, dateTo, cashierId } = req.query;

  const result = await pool.query(
    `SELECT
      s.id,
      s.sale_number,
      s.created_at,
      s.total_amount,
      s.discount_amount,
      s.tax_amount,
      c.full_name AS customer_name,
      u.full_name AS cashier_name,
      p.method AS payment_method
     FROM sales s
     LEFT JOIN customers c ON c.id = s.customer_id
     LEFT JOIN users u ON u.id = s.cashier_id
     LEFT JOIN payments p ON p.sale_id = s.id
     WHERE ($1::timestamptz IS NULL OR s.created_at >= $1::timestamptz)
       AND ($2::timestamptz IS NULL OR s.created_at <= $2::timestamptz)
       AND ($3::uuid IS NULL OR s.cashier_id = $3::uuid)
     ORDER BY s.created_at DESC`,
    [dateFrom || null, dateTo || null, cashierId || null]
  );

  res.json({
    sales: result.rows.map((row) => ({
      id: row.id,
      saleNumber: row.sale_number,
      createdAt: row.created_at,
      totalAmount: asNumber(row.total_amount),
      discountAmount: asNumber(row.discount_amount),
      taxAmount: asNumber(row.tax_amount),
      customerName: row.customer_name,
      cashierName: row.cashier_name,
      paymentMethod: row.payment_method
    }))
  });
});

/**
 * Delete sale (Admin only)
 * DELETE /api/sales/:id
 */
export const deleteSale = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await withTransaction(async (client) => {
    // Check if sale exists
    const saleResult = await client.query(
      'SELECT id, status FROM sales WHERE id = $1',
      [id]
    );

    if (saleResult.rowCount === 0) {
      throw new ApiError(404, 'Sale not found');
    }

    const sale = saleResult.rows[0];

    // Get sale items to restore stock
    const itemsResult = await client.query(
      'SELECT product_id, quantity FROM sale_items WHERE sale_id = $1',
      [id]
    );

    // Restore stock for each item
    for (const item of itemsResult.rows) {
      await client.query(
        `UPDATE inventory 
         SET stock_quantity = stock_quantity + $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE product_id = $2`,
        [item.quantity, item.product_id]
      );

      // Log the stock adjustment
      await client.query(
        `INSERT INTO inventory_adjustments 
          (product_id, quantity_change, reason, adjusted_by, notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          item.product_id,
          item.quantity,
          'sale_deletion',
          req.user.userId,
          `Stock restored from deleted sale #${id}`
        ]
      );
    }

    // Delete payment record
    await client.query('DELETE FROM payments WHERE sale_id = $1', [id]);

    // Delete sale items
    await client.query('DELETE FROM sale_items WHERE sale_id = $1', [id]);

    // Delete sale
    await client.query('DELETE FROM sales WHERE id = $1', [id]);
  });

  res.status(200).json({
    success: true,
    message: 'Sale deleted successfully and stock restored'
  });
});
