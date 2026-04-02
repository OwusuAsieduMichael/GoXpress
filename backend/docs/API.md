# POS API Documentation

Base URL: `http://localhost:5000/api`

Auth is cookie-based (`token` HTTP-only cookie) and also returns token in JSON for non-cookie clients.

## Auth

- `POST /auth/signup`
  - Body: `{ "fullName": "Admin", "email": "admin@pos.local", "username": "admin", "password": "Admin@1234", "role": "admin" }`
- `POST /auth/login`
  - Body: `{ "username": "admin", "password": "Admin@1234" }`
- `POST /auth/logout`
- `GET /auth/me`

## Products

- `GET /products?search=&categoryId=&lowStock=true|false&includeInactive=true|false`
- `POST /products`
  - Body:
    ```json
    {
      "sku": "SKU-001",
      "barcode": "1234567890",
      "name": "Cola Can",
      "description": "330ml",
      "categoryId": null,
      "price": 2.5,
      "costPrice": 1.1,
      "isActive": true,
      "stockQuantity": 50,
      "lowStockThreshold": 10
    }
    ```
- `PUT /products/:id`
- `DELETE /products/:id` (archives product)

### Category Management

- `GET /products/categories/list`
- `POST /products/categories`
- `PUT /products/categories/:id`
- `DELETE /products/categories/:id`

## Sales

- `POST /sales`
  - Body:
    ```json
    {
      "customerId": null,
      "discount": 0,
      "tax": 0,
      "notes": "",
      "items": [
        { "productId": "uuid", "quantity": 2, "discount": 0 }
      ],
      "payment": {
        "method": "mobile_money",
        "amountReceived": 10
      }
    }
    ```
- `GET /sales?dateFrom=&dateTo=&cashierId=`

## Payments

- `POST /payments`
  - Body:
    ```json
    {
      "sale_id": "uuid",
      "amount": 120.5,
      "payment_method": "cash",
      "status": "success",
      "amount_received": 130,
      "reference": ""
    }
    ```
  - `payment_method`: `cash`, `momo`, `mobile_money`, or `card`
  - `status`: `success`, `pending`, `failed`, or `completed`

## Customers

- `POST /customers`
- `GET /customers?search=`
- `GET /customers/:id/history`

## Inventory

- `GET /inventory?search=&lowStock=true|false`
- `POST /inventory/adjust`
  - Body: `{ "productId": "uuid", "change": 10, "reason": "Restock" }`
- `GET /inventory/adjustments`

## Reports

- `GET /dashboard/summary?recentLimit=8&lowStockLimit=6`
- `GET /dashboard/sales-trend?preset=weekly|monthly|today|custom&from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /dashboard/top-products?preset=weekly|monthly|today|custom&from=YYYY-MM-DD&to=YYYY-MM-DD&limit=5`

- `GET /reports/sales?preset=monthly|weekly|today|custom&from=YYYY-MM-DD&to=YYYY-MM-DD&productId=&categoryId=`
- `GET /reports/products?preset=monthly|weekly|today|custom&from=YYYY-MM-DD&to=YYYY-MM-DD&productId=&categoryId=&page=1&pageSize=10`
- `GET /reports/transactions?preset=monthly|weekly|today|custom&from=YYYY-MM-DD&to=YYYY-MM-DD&productId=&categoryId=&page=1&pageSize=12`
- `GET /reports/inventory?productId=&categoryId=&lowStockOnly=true|false&page=1&pageSize=12`

Legacy report endpoints (still available):
- `GET /reports/summary?from=&to=`
- `GET /reports/daily-sales?days=30`
- `GET /reports/product-performance?limit=10`
- `GET /reports/inventory-legacy`
