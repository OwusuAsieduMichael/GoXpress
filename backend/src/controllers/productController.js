import { pool, withTransaction } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const mapProduct = (row) => ({
  id: row.id,
  sku: row.sku,
  barcode: row.barcode,
  name: row.name,
  description: row.description,
  imageUrl: row.image_url,
  categoryId: row.category_id,
  categoryName: row.category_name,
  price: Number(row.price),
  costPrice: Number(row.cost_price),
  isActive: row.is_active,
  stockQuantity: row.stock_quantity,
  lowStockThreshold: row.low_stock_threshold,
  soldCount: row.sold_count,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const getProducts = asyncHandler(async (req, res) => {
  const {
    search = "",
    categoryId,
    lowStock = "false",
    includeInactive = "false"
  } = req.query;

  const query = `
    SELECT p.*, c.name AS category_name, i.stock_quantity, i.low_stock_threshold
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN inventory i ON i.product_id = p.id
    WHERE (
      $1 = '' OR
      p.name ILIKE '%' || $1 || '%' OR
      p.sku ILIKE '%' || $1 || '%' OR
      COALESCE(p.barcode, '') ILIKE '%' || $1 || '%'
    )
    AND ($2::uuid IS NULL OR p.category_id = $2::uuid)
    AND ($3::boolean = true OR p.is_active = true)
    AND ($4::boolean = false OR i.stock_quantity <= i.low_stock_threshold)
    ORDER BY p.created_at DESC
  `;

  const result = await pool.query(query, [
    search.trim(),
    categoryId || null,
    includeInactive === "true",
    lowStock === "true"
  ]);

  res.json({ products: result.rows.map(mapProduct) });
});

export const createProduct = asyncHandler(async (req, res) => {
  const {
    sku,
    barcode,
    name,
    description,
    imageUrl,
    categoryId,
    price,
    costPrice,
    isActive,
    stockQuantity,
    lowStockThreshold
  } = req.body;

  const payload = await withTransaction(async (client) => {
    const productResult = await client.query(
      `INSERT INTO products
        (sku, barcode, name, description, image_url, category_id, price, cost_price, is_active)
       VALUES ($1, NULLIF($2, ''), $3, NULLIF($4, ''), NULLIF($5, ''), $6, $7, $8, $9)
       RETURNING *`,
      [
        sku,
        barcode,
        name,
        description,
        imageUrl ?? "",
        categoryId,
        price,
        costPrice,
        isActive
      ]
    );

    const product = productResult.rows[0];

    await client.query(
      `INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold)
       VALUES ($1, $2, $3)`,
      [product.id, stockQuantity, lowStockThreshold]
    );

    const details = await client.query(
      `SELECT p.*, c.name AS category_name, i.stock_quantity, i.low_stock_threshold
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN inventory i ON i.product_id = p.id
       WHERE p.id = $1`,
      [product.id]
    );

    return mapProduct(details.rows[0]);
  });

  res.status(201).json({ product: payload });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  const payload = await withTransaction(async (client) => {
    const existing = await client.query("SELECT id FROM products WHERE id = $1", [id]);
    if (existing.rowCount === 0) {
      throw new ApiError(404, "Product not found");
    }

    const updateClauses = [];
    const values = [];
    let index = 1;

    const map = {
      sku: "sku",
      barcode: "barcode",
      name: "name",
      description: "description",
      imageUrl: "image_url",
      categoryId: "category_id",
      price: "price",
      costPrice: "cost_price",
      isActive: "is_active"
    };

    for (const [key, column] of Object.entries(map)) {
      if (Object.prototype.hasOwnProperty.call(fields, key)) {
        updateClauses.push(`${column} = $${index}`);
        if (key === "barcode" || key === "description" || key === "imageUrl") {
          values.push(fields[key] || null);
        } else {
          values.push(fields[key]);
        }
        index += 1;
      }
    }

    if (updateClauses.length > 0) {
      values.push(id);
      await client.query(
        `UPDATE products SET ${updateClauses.join(", ")} WHERE id = $${index}`,
        values
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(fields, "stockQuantity") ||
      Object.prototype.hasOwnProperty.call(fields, "lowStockThreshold")
    ) {
      const current = await client.query(
        "SELECT stock_quantity, low_stock_threshold FROM inventory WHERE product_id = $1",
        [id]
      );
      const row = current.rows[0] || { stock_quantity: 0, low_stock_threshold: 5 };

      const newStock = Object.prototype.hasOwnProperty.call(fields, "stockQuantity")
        ? fields.stockQuantity
        : row.stock_quantity;
      const newThreshold = Object.prototype.hasOwnProperty.call(
        fields,
        "lowStockThreshold"
      )
        ? fields.lowStockThreshold
        : row.low_stock_threshold;

      await client.query(
        `INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold)
         VALUES ($1, $2, $3)
         ON CONFLICT (product_id)
         DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity,
                       low_stock_threshold = EXCLUDED.low_stock_threshold`,
        [id, newStock, newThreshold]
      );
    }

    const details = await client.query(
      `SELECT p.*, c.name AS category_name, i.stock_quantity, i.low_stock_threshold
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN inventory i ON i.product_id = p.id
       WHERE p.id = $1`,
      [id]
    );

    return mapProduct(details.rows[0]);
  });

  res.json({ product: payload });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    `UPDATE products
     SET is_active = false
     WHERE id = $1
     RETURNING id`,
    [id]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Product not found");
  }

  res.json({ message: "Product archived successfully" });
});

export const getCategories = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT c.id, c.name, c.description, c.created_at,
            COUNT(p.id)::int AS product_count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id
     GROUP BY c.id
     ORDER BY c.name ASC`
  );

  res.json({
    categories: result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      productCount: row.product_count,
      createdAt: row.created_at
    }))
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const result = await pool.query(
    `INSERT INTO categories (name, description)
     VALUES ($1, NULLIF($2, ''))
     RETURNING id, name, description, created_at`,
    [name, description]
  );

  res.status(201).json({
    category: {
      id: result.rows[0].id,
      name: result.rows[0].name,
      description: result.rows[0].description,
      createdAt: result.rows[0].created_at
    }
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const result = await pool.query(
    `UPDATE categories
     SET name = $1, description = NULLIF($2, '')
     WHERE id = $3
     RETURNING id, name, description, created_at`,
    [name, description, id]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Category not found");
  }

  res.json({
    category: {
      id: result.rows[0].id,
      name: result.rows[0].name,
      description: result.rows[0].description,
      createdAt: result.rows[0].created_at
    }
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const inUse = await pool.query("SELECT id FROM products WHERE category_id = $1 LIMIT 1", [
    id
  ]);
  if (inUse.rowCount > 0) {
    throw new ApiError(400, "Cannot delete category with attached products");
  }

  const result = await pool.query("DELETE FROM categories WHERE id = $1 RETURNING id", [id]);
  if (result.rowCount === 0) {
    throw new ApiError(404, "Category not found");
  }

  res.json({ message: "Category deleted successfully" });
});
