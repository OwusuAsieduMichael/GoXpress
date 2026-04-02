import { pool } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toNumber = (value) => Number(value ?? 0);
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toIso = (date) => date.toISOString();

const parseDateInput = (value, { endExclusive = false } = {}) => {
  if (!value) return null;
  const normalized = String(value).trim();
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;

  if (endExclusive && DATE_ONLY_REGEX.test(normalized)) {
    date.setUTCDate(date.getUTCDate() + 1);
  }

  return date;
};

const resolveDateRange = (query, defaultPreset = "monthly") => {
  const rawPreset = String(query.preset || "").toLowerCase();
  const preset = ["today", "weekly", "monthly", "custom"].includes(rawPreset)
    ? rawPreset
    : defaultPreset;

  const hasExplicitRange = Boolean(query.from || query.to);
  const now = new Date();
  const tomorrowStart = new Date(now);
  tomorrowStart.setHours(0, 0, 0, 0);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  let from = parseDateInput(query.from);
  let to = parseDateInput(query.to, { endExclusive: true });

  if (!hasExplicitRange && preset !== "custom") {
    to = tomorrowStart;
    from = new Date(tomorrowStart);
    if (preset === "today") {
      from.setDate(from.getDate() - 1);
    } else if (preset === "weekly") {
      from.setDate(from.getDate() - 7);
    } else {
      from.setDate(from.getDate() - 30);
    }
  } else {
    if (!to) {
      to = tomorrowStart;
    }
    if (!from) {
      from = new Date(to);
      from.setDate(from.getDate() - 30);
    }
  }

  if (from >= to) {
    const adjusted = new Date(from);
    adjusted.setDate(adjusted.getDate() + 1);
    to = adjusted;
  }

  return {
    preset: hasExplicitRange ? "custom" : preset,
    from: toIso(from),
    to: toIso(to)
  };
};

const parsePagination = (query, defaults = { page: 1, pageSize: 10 }) => {
  const page = clamp(Number(query.page) || defaults.page, 1, 100000);
  const pageSize = clamp(Number(query.pageSize) || defaults.pageSize, 1, 100);
  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset };
};

const buildSalesWhere = ({ from, to, productId, categoryId }, alias = "s") => {
  const params = [from || null, to || null, productId || null, categoryId || null];
  const clause = `
      ($1::timestamptz IS NULL OR ${alias}.created_at >= $1::timestamptz)
      AND ($2::timestamptz IS NULL OR ${alias}.created_at < $2::timestamptz)
      AND (
        $3::uuid IS NULL OR EXISTS (
          SELECT 1
          FROM sales_items sfp
          WHERE sfp.sale_id = ${alias}.id
            AND sfp.product_id = $3::uuid
        )
      )
      AND (
        $4::uuid IS NULL OR EXISTS (
          SELECT 1
          FROM sales_items sfc
          JOIN products pfc ON pfc.id = sfc.product_id
          WHERE sfc.sale_id = ${alias}.id
            AND pfc.category_id = $4::uuid
        )
      )
  `;

  return { clause, params };
};

const normalizeRangeAndFilters = (req, defaultPreset = "monthly") => {
  const range = resolveDateRange(req.query, defaultPreset);
  const productId = req.query.productId || null;
  const categoryId = req.query.categoryId || null;
  return { range, productId, categoryId };
};

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const recentLimit = clamp(Number(req.query.recentLimit) || 8, 1, 25);
  const lowStockPreviewLimit = clamp(Number(req.query.lowStockLimit) || 6, 1, 25);

  const [totalsResult, lowStockCountResult, lowStockItemsResult, recentTransactionsResult] =
    await Promise.all([
      pool.query(
        `SELECT
          COALESCE(SUM(total_amount), 0)::numeric(12,2) AS total_revenue,
          COUNT(*)::int AS total_transactions,
          COALESCE(SUM(total_amount) FILTER (WHERE created_at >= DATE_TRUNC('day', NOW())), 0)::numeric(12,2) AS total_sales_today,
          COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('day', NOW()))::int AS transactions_today
         FROM sales`
      ),
      pool.query(
        `SELECT COUNT(*)::int AS low_stock_count
         FROM inventory i
         JOIN products p ON p.id = i.product_id
         WHERE p.is_active = true
           AND i.stock_quantity <= i.low_stock_threshold`
      ),
      pool.query(
        `SELECT
          p.id,
          p.name,
          p.sku,
          i.stock_quantity,
          i.low_stock_threshold
         FROM inventory i
         JOIN products p ON p.id = i.product_id
         WHERE p.is_active = true
           AND i.stock_quantity <= i.low_stock_threshold
         ORDER BY i.stock_quantity ASC, p.name ASC
         LIMIT $1`,
        [lowStockPreviewLimit]
      ),
      pool.query(
        `SELECT
          s.id,
          s.total_amount,
          s.created_at,
          COALESCE(pay.method, 'unknown') AS payment_method
         FROM sales s
         LEFT JOIN payments pay ON pay.sale_id = s.id
         ORDER BY s.created_at DESC
         LIMIT $1`,
        [recentLimit]
      )
    ]);

  const totalsRow = totalsResult.rows[0];

  res.json({
    kpis: {
      totalSalesToday: toNumber(totalsRow.total_sales_today),
      totalRevenue: toNumber(totalsRow.total_revenue),
      transactionsToday: Number(totalsRow.transactions_today ?? 0),
      totalTransactions: Number(totalsRow.total_transactions ?? 0),
      lowStockCount: Number(lowStockCountResult.rows[0]?.low_stock_count ?? 0)
    },
    lowStockProducts: lowStockItemsResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      sku: row.sku,
      stockQuantity: row.stock_quantity,
      lowStockThreshold: row.low_stock_threshold
    })),
    recentTransactions: recentTransactionsResult.rows.map((row) => ({
      id: row.id,
      totalAmount: toNumber(row.total_amount),
      createdAt: row.created_at,
      paymentMethod: row.payment_method
    }))
  });
});

export const getDashboardSalesTrend = asyncHandler(async (req, res) => {
  const range = resolveDateRange(req.query, "weekly");

  const result = await pool.query(
    `WITH series AS (
      SELECT generate_series(
        DATE_TRUNC('day', $1::timestamptz),
        DATE_TRUNC('day', $2::timestamptz - INTERVAL '1 day'),
        INTERVAL '1 day'
      ) AS day
    ),
    agg AS (
      SELECT
        DATE_TRUNC('day', s.created_at) AS day,
        COUNT(*)::int AS transactions,
        COALESCE(SUM(s.total_amount), 0)::numeric(12,2) AS revenue
      FROM sales s
      WHERE s.created_at >= $1::timestamptz
        AND s.created_at < $2::timestamptz
      GROUP BY DATE_TRUNC('day', s.created_at)
    )
    SELECT
      series.day::date AS day,
      COALESCE(agg.transactions, 0)::int AS transactions,
      COALESCE(agg.revenue, 0)::numeric(12,2) AS revenue
    FROM series
    LEFT JOIN agg ON agg.day = series.day
    ORDER BY series.day ASC`,
    [range.from, range.to]
  );

  res.json({
    range,
    points: result.rows.map((row) => ({
      day: row.day,
      transactions: row.transactions,
      revenue: toNumber(row.revenue)
    }))
  });
});

export const getDashboardTopProducts = asyncHandler(async (req, res) => {
  const range = resolveDateRange(req.query, "weekly");
  const limit = clamp(Number(req.query.limit) || 5, 1, 20);

  const result = await pool.query(
    `SELECT
      p.id,
      p.name,
      p.sku,
      SUM(si.quantity)::int AS units_sold,
      COALESCE(SUM(si.line_total), 0)::numeric(12,2) AS revenue
    FROM sales_items si
    JOIN sales s ON s.id = si.sale_id
    JOIN products p ON p.id = si.product_id
    WHERE s.created_at >= $1::timestamptz
      AND s.created_at < $2::timestamptz
    GROUP BY p.id
    ORDER BY revenue DESC, units_sold DESC
    LIMIT $3`,
    [range.from, range.to, limit]
  );

  res.json({
    range,
    products: result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      sku: row.sku,
      unitsSold: row.units_sold,
      revenue: toNumber(row.revenue)
    }))
  });
});

export const getReportsSales = asyncHandler(async (req, res) => {
  const { range, productId, categoryId } = normalizeRangeAndFilters(req, "monthly");
  const { clause, params } = buildSalesWhere(
    {
      from: range.from,
      to: range.to,
      productId,
      categoryId
    },
    "s"
  );

  const [totalsResult, trendResult, paymentMethodsResult, cashierPerformanceResult] =
    await Promise.all([
      pool.query(
        `SELECT
          COUNT(*)::int AS total_transactions,
          COALESCE(SUM(s.total_amount), 0)::numeric(12,2) AS total_revenue,
          COALESCE(SUM(s.discount_amount), 0)::numeric(12,2) AS total_discount,
          COALESCE(SUM(s.tax_amount), 0)::numeric(12,2) AS total_tax,
          COALESCE(AVG(s.total_amount), 0)::numeric(12,2) AS avg_ticket
         FROM sales s
         WHERE ${clause}`,
        params
      ),
      pool.query(
        `WITH series AS (
          SELECT generate_series(
            DATE_TRUNC('day', $1::timestamptz),
            DATE_TRUNC('day', $2::timestamptz - INTERVAL '1 day'),
            INTERVAL '1 day'
          ) AS day
        ),
        filtered AS (
          SELECT s.id, s.created_at, s.total_amount
          FROM sales s
          WHERE ${clause}
        ),
        agg AS (
          SELECT
            DATE_TRUNC('day', created_at) AS day,
            COUNT(*)::int AS transactions,
            COALESCE(SUM(total_amount), 0)::numeric(12,2) AS revenue
          FROM filtered
          GROUP BY DATE_TRUNC('day', created_at)
        )
        SELECT
          series.day::date AS day,
          COALESCE(agg.transactions, 0)::int AS transactions,
          COALESCE(agg.revenue, 0)::numeric(12,2) AS revenue
        FROM series
        LEFT JOIN agg ON agg.day = series.day
        ORDER BY series.day ASC`,
        params
      ),
      pool.query(
        `SELECT
          COALESCE(pay.method, 'unknown') AS method,
          COUNT(*)::int AS transactions,
          COALESCE(SUM(pay.amount_paid), 0)::numeric(12,2) AS amount
         FROM sales s
         LEFT JOIN payments pay ON pay.sale_id = s.id
         WHERE ${clause}
         GROUP BY COALESCE(pay.method, 'unknown')
         ORDER BY amount DESC`,
        params
      ),
      pool.query(
        `SELECT
          u.id,
          u.full_name,
          u.username,
          COUNT(s.id)::int AS transactions,
          COALESCE(SUM(s.total_amount), 0)::numeric(12,2) AS revenue
         FROM sales s
         JOIN users u ON u.id = s.cashier_id
         WHERE ${clause}
         GROUP BY u.id
         ORDER BY revenue DESC, transactions DESC`,
        params
      )
    ]);

  const totals = totalsResult.rows[0];

  res.json({
    range,
    filters: { productId, categoryId },
    summary: {
      totalTransactions: Number(totals.total_transactions ?? 0),
      totalRevenue: toNumber(totals.total_revenue),
      totalDiscount: toNumber(totals.total_discount),
      totalTax: toNumber(totals.total_tax),
      avgTicket: toNumber(totals.avg_ticket)
    },
    trend: trendResult.rows.map((row) => ({
      day: row.day,
      transactions: row.transactions,
      revenue: toNumber(row.revenue)
    })),
    paymentMethods: paymentMethodsResult.rows.map((row) => ({
      method: row.method,
      transactions: row.transactions,
      amount: toNumber(row.amount)
    })),
    cashierPerformance: cashierPerformanceResult.rows.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      username: row.username,
      transactions: row.transactions,
      revenue: toNumber(row.revenue)
    }))
  });
});

export const getReportsProducts = asyncHandler(async (req, res) => {
  const { range, productId, categoryId } = normalizeRangeAndFilters(req, "monthly");
  const { page, pageSize, offset } = parsePagination(req.query, { page: 1, pageSize: 10 });

  const params = [range.from, range.to, productId || null, categoryId || null];

  const where = `
      ($1::timestamptz IS NULL OR s.created_at >= $1::timestamptz)
      AND ($2::timestamptz IS NULL OR s.created_at < $2::timestamptz)
      AND ($3::uuid IS NULL OR p.id = $3::uuid)
      AND ($4::uuid IS NULL OR p.category_id = $4::uuid)
  `;

  const [countResult, summaryResult, dataResult] = await Promise.all([
    pool.query(
      `SELECT COUNT(DISTINCT p.id)::int AS total_count
       FROM sales_items si
       JOIN sales s ON s.id = si.sale_id
       JOIN products p ON p.id = si.product_id
       WHERE ${where}`,
      params
    ),
    pool.query(
      `SELECT
        COALESCE(SUM(si.quantity), 0)::int AS total_units_sold,
        COALESCE(SUM(si.line_total), 0)::numeric(12,2) AS total_revenue
       FROM sales_items si
       JOIN sales s ON s.id = si.sale_id
       JOIN products p ON p.id = si.product_id
       WHERE ${where}`,
      params
    ),
    pool.query(
      `SELECT
        p.id,
        p.name,
        p.sku,
        c.name AS category_name,
        SUM(si.quantity)::int AS units_sold,
        COALESCE(SUM(si.line_total), 0)::numeric(12,2) AS revenue,
        COUNT(DISTINCT s.id)::int AS transactions
       FROM sales_items si
       JOIN sales s ON s.id = si.sale_id
       JOIN products p ON p.id = si.product_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE ${where}
       GROUP BY p.id, c.name
       ORDER BY revenue DESC, units_sold DESC
       LIMIT $5 OFFSET $6`,
      [...params, pageSize, offset]
    )
  ]);

  const totalCount = Number(countResult.rows[0]?.total_count ?? 0);
  const summary = summaryResult.rows[0];

  res.json({
    range,
    filters: { productId, categoryId },
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / pageSize))
    },
    summary: {
      totalUnitsSold: Number(summary.total_units_sold ?? 0),
      totalRevenue: toNumber(summary.total_revenue)
    },
    products: dataResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      sku: row.sku,
      categoryName: row.category_name,
      unitsSold: row.units_sold,
      transactions: row.transactions,
      revenue: toNumber(row.revenue)
    }))
  });
});

export const getReportsTransactions = asyncHandler(async (req, res) => {
  const { range, productId, categoryId } = normalizeRangeAndFilters(req, "monthly");
  const { page, pageSize, offset } = parsePagination(req.query, { page: 1, pageSize: 12 });

  const { clause, params } = buildSalesWhere(
    {
      from: range.from,
      to: range.to,
      productId,
      categoryId
    },
    "s"
  );

  const [countResult, summaryResult, dataResult] = await Promise.all([
    pool.query(
      `SELECT COUNT(*)::int AS total_count
       FROM sales s
       WHERE ${clause}`,
      params
    ),
    pool.query(
      `SELECT
        COUNT(*)::int AS total_transactions,
        COALESCE(SUM(s.total_amount), 0)::numeric(12,2) AS total_revenue
       FROM sales s
       WHERE ${clause}`,
      params
    ),
    pool.query(
      `SELECT
        s.id,
        s.created_at,
        s.subtotal,
        s.discount_amount,
        s.tax_amount,
        s.total_amount,
        COALESCE(pay.method, 'unknown') AS payment_method,
        u.full_name AS cashier_name,
        COALESCE(c.full_name, 'Walk-in') AS customer_name,
        COUNT(si.id)::int AS line_items,
        COALESCE(SUM(si.quantity), 0)::int AS item_count,
        COALESCE(STRING_AGG(DISTINCT p.name, ', ' ORDER BY p.name), '') AS items_purchased
       FROM sales s
       LEFT JOIN payments pay ON pay.sale_id = s.id
       LEFT JOIN users u ON u.id = s.cashier_id
       LEFT JOIN customers c ON c.id = s.customer_id
       LEFT JOIN sales_items si ON si.sale_id = s.id
       LEFT JOIN products p ON p.id = si.product_id
       WHERE ${clause}
       GROUP BY s.id, pay.method, u.full_name, c.full_name
       ORDER BY s.created_at DESC
       LIMIT $5 OFFSET $6`,
      [...params, pageSize, offset]
    )
  ]);

  const totalCount = Number(countResult.rows[0]?.total_count ?? 0);
  const summary = summaryResult.rows[0];

  res.json({
    range,
    filters: { productId, categoryId },
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / pageSize))
    },
    summary: {
      totalTransactions: Number(summary.total_transactions ?? 0),
      totalRevenue: toNumber(summary.total_revenue)
    },
    transactions: dataResult.rows.map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      subtotal: toNumber(row.subtotal),
      discountAmount: toNumber(row.discount_amount),
      taxAmount: toNumber(row.tax_amount),
      totalAmount: toNumber(row.total_amount),
      paymentMethod: row.payment_method,
      cashierName: row.cashier_name,
      customerName: row.customer_name,
      lineItems: row.line_items,
      itemCount: row.item_count,
      itemsPurchased: row.items_purchased
    }))
  });
});

export const getReportsInventory = asyncHandler(async (req, res) => {
  const productId = req.query.productId || null;
  const categoryId = req.query.categoryId || null;
  const lowStockOnly = String(req.query.lowStockOnly || "false").toLowerCase() === "true";
  const { page, pageSize, offset } = parsePagination(req.query, { page: 1, pageSize: 12 });

  const where = `
      p.is_active = true
      AND ($1::uuid IS NULL OR p.id = $1::uuid)
      AND ($2::uuid IS NULL OR p.category_id = $2::uuid)
      AND ($3::boolean = false OR i.stock_quantity <= i.low_stock_threshold)
  `;
  const params = [productId, categoryId, lowStockOnly];

  const [countResult, summaryResult, dataResult] = await Promise.all([
    pool.query(
      `SELECT COUNT(*)::int AS total_count
       FROM products p
       JOIN inventory i ON i.product_id = p.id
       WHERE ${where}`,
      params
    ),
    pool.query(
      `SELECT
        COUNT(*)::int AS total_products,
        COUNT(*) FILTER (WHERE i.stock_quantity <= i.low_stock_threshold)::int AS low_stock_count,
        COALESCE(SUM(i.stock_quantity * p.price), 0)::numeric(12,2) AS stock_retail_value
       FROM products p
       JOIN inventory i ON i.product_id = p.id
       WHERE ${where}`,
      params
    ),
    pool.query(
      `SELECT
        p.id,
        p.name,
        p.sku,
        c.name AS category_name,
        p.price,
        p.sold_count,
        i.stock_quantity,
        i.low_stock_threshold,
        (i.stock_quantity <= i.low_stock_threshold) AS is_low_stock
       FROM products p
       JOIN inventory i ON i.product_id = p.id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE ${where}
       ORDER BY is_low_stock DESC, i.stock_quantity ASC, p.name ASC
       LIMIT $4 OFFSET $5`,
      [...params, pageSize, offset]
    )
  ]);

  const totalCount = Number(countResult.rows[0]?.total_count ?? 0);
  const summary = summaryResult.rows[0];

  res.json({
    filters: { productId, categoryId, lowStockOnly },
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / pageSize))
    },
    summary: {
      totalProducts: Number(summary.total_products ?? 0),
      lowStockCount: Number(summary.low_stock_count ?? 0),
      stockRetailValue: toNumber(summary.stock_retail_value)
    },
    inventory: dataResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      sku: row.sku,
      categoryName: row.category_name,
      price: toNumber(row.price),
      soldCount: Number(row.sold_count ?? 0),
      stockQuantity: row.stock_quantity,
      lowStockThreshold: row.low_stock_threshold,
      isLowStock: row.is_low_stock
    }))
  });
});

export const getSummaryReport = asyncHandler(async (req, res) => {
  const from = req.query.from || null;
  const toRaw = req.query.to || null;
  const toDate = parseDateInput(toRaw, { endExclusive: true });
  const to = toDate ? toIso(toDate) : null;

  const totals = await pool.query(
    `SELECT
      COUNT(*)::int AS total_transactions,
      COALESCE(SUM(total_amount), 0)::numeric(12,2) AS total_revenue,
     COALESCE(AVG(total_amount), 0)::numeric(12,2) AS avg_ticket
     FROM sales
     WHERE ($1::timestamptz IS NULL OR created_at >= $1::timestamptz)
       AND ($2::timestamptz IS NULL OR created_at < $2::timestamptz)`,
    [from || null, to || null]
  );

  const methods = await pool.query(
    `SELECT
      method,
      COUNT(*)::int AS count,
      COALESCE(SUM(amount_paid), 0)::numeric(12,2) AS amount
     FROM payments p
     JOIN sales s ON s.id = p.sale_id
     WHERE ($1::timestamptz IS NULL OR s.created_at >= $1::timestamptz)
       AND ($2::timestamptz IS NULL OR s.created_at < $2::timestamptz)
     GROUP BY method
     ORDER BY amount DESC`,
    [from || null, to || null]
  );

  res.json({
    totals: {
      totalTransactions: totals.rows[0].total_transactions,
      totalRevenue: toNumber(totals.rows[0].total_revenue),
      avgTicket: toNumber(totals.rows[0].avg_ticket)
    },
    paymentMethods: methods.rows.map((row) => ({
      method: row.method,
      count: row.count,
      amount: toNumber(row.amount)
    }))
  });
});

export const getDailySalesReport = asyncHandler(async (req, res) => {
  const { days = "14" } = req.query;
  const windowDays = Math.min(Math.max(Number(days), 1), 90);

  const result = await pool.query(
    `SELECT
      DATE_TRUNC('day', created_at)::date AS day,
      COUNT(*)::int AS transactions,
      COALESCE(SUM(total_amount), 0)::numeric(12,2) AS revenue
     FROM sales
     WHERE created_at >= NOW() - (($1 || ' days')::interval)
     GROUP BY day
     ORDER BY day ASC`,
    [windowDays]
  );

  res.json({
    days: result.rows.map((row) => ({
      day: row.day,
      transactions: row.transactions,
      revenue: toNumber(row.revenue)
    }))
  });
});

export const getInventoryReport = asyncHandler(async (req, res) => {
  const lowStockOnly = String(req.query.lowStockOnly || "false").toLowerCase() === "true";

  const result = await pool.query(
    `SELECT
      p.id,
      p.name,
      p.sku,
      i.stock_quantity,
      i.low_stock_threshold,
      (i.stock_quantity <= i.low_stock_threshold) AS is_low_stock
     FROM products p
     JOIN inventory i ON i.product_id = p.id
     WHERE p.is_active = true
       AND ($1::boolean = false OR i.stock_quantity <= i.low_stock_threshold)
     ORDER BY is_low_stock DESC, i.stock_quantity ASC, p.name ASC`,
    [lowStockOnly]
  );

  res.json({
    inventory: result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      sku: row.sku,
      stockQuantity: row.stock_quantity,
      lowStockThreshold: row.low_stock_threshold,
      isLowStock: row.is_low_stock
    }))
  });
});

export const getProductPerformance = asyncHandler(async (req, res) => {
  const { limit = "20" } = req.query;
  const size = Math.min(Math.max(Number(limit), 1), 100);

  const result = await pool.query(
    `SELECT
      p.id,
      p.name,
      p.sku,
      SUM(si.quantity)::int AS units_sold,
      COALESCE(SUM(si.line_total), 0)::numeric(12,2) AS revenue
     FROM sales_items si
     JOIN products p ON p.id = si.product_id
     GROUP BY p.id
     ORDER BY revenue DESC
     LIMIT $1`,
    [size]
  );

  res.json({
    products: result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      sku: row.sku,
      unitsSold: row.units_sold,
      revenue: toNumber(row.revenue)
    }))
  });
});
