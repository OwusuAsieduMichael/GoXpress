import { pool } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createCustomer = asyncHandler(async (req, res) => {
  const { fullName, email, phone, address } = req.body;

  const result = await pool.query(
    `INSERT INTO customers (full_name, email, phone, address)
     VALUES ($1, NULLIF(LOWER($2), ''), NULLIF($3, ''), NULLIF($4, ''))
     RETURNING id, full_name, email, phone, address, created_at`,
    [fullName, email ?? "", phone ?? "", address ?? ""]
  );

  const row = result.rows[0];
  res.status(201).json({
    customer: {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      createdAt: row.created_at
    }
  });
});

export const getCustomers = asyncHandler(async (req, res) => {
  const { search = "" } = req.query;

  const result = await pool.query(
    `SELECT
      c.id,
      c.full_name,
      c.email,
      c.phone,
      c.address,
      c.created_at,
      COUNT(s.id)::int AS purchase_count,
      COALESCE(SUM(s.total_amount), 0)::numeric(12,2) AS total_spent
     FROM customers c
     LEFT JOIN sales s ON s.customer_id = c.id
     WHERE (
       $1 = '' OR
       c.full_name ILIKE '%' || $1 || '%' OR
       COALESCE(c.email, '') ILIKE '%' || $1 || '%' OR
       COALESCE(c.phone, '') ILIKE '%' || $1 || '%'
     )
     GROUP BY c.id
     ORDER BY c.created_at DESC`,
    [search.trim()]
  );

  res.json({
    customers: result.rows.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      purchaseCount: row.purchase_count,
      totalSpent: Number(row.total_spent),
      createdAt: row.created_at
    }))
  });
});

export const getCustomerHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customer = await pool.query(
    `SELECT id, full_name, email, phone, address, created_at FROM customers WHERE id = $1`,
    [id]
  );
  if (customer.rowCount === 0) {
    throw new ApiError(404, "Customer not found");
  }

  const sales = await pool.query(
    `SELECT
      s.id,
      s.created_at,
      s.total_amount,
      s.discount_amount,
      s.tax_amount,
      p.method AS payment_method,
      p.amount_paid,
      p.amount_received,
      p.change_due
     FROM sales s
     LEFT JOIN payments p ON p.sale_id = s.id
     WHERE s.customer_id = $1
     ORDER BY s.created_at DESC`,
    [id]
  );

  res.json({
    customer: {
      id: customer.rows[0].id,
      fullName: customer.rows[0].full_name,
      email: customer.rows[0].email,
      phone: customer.rows[0].phone,
      address: customer.rows[0].address,
      createdAt: customer.rows[0].created_at
    },
    purchases: sales.rows.map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      totalAmount: Number(row.total_amount),
      discountAmount: Number(row.discount_amount),
      taxAmount: Number(row.tax_amount),
      paymentMethod: row.payment_method,
      amountPaid: row.amount_paid ? Number(row.amount_paid) : null,
      amountReceived: row.amount_received ? Number(row.amount_received) : null,
      changeDue: row.change_due ? Number(row.change_due) : null
    }))
  });
});
