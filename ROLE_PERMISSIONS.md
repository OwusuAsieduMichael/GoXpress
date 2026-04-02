# GoXpress POS - Role Permissions Guide

## User Roles

The system has three user roles with different permission levels:

1. **Admin** - Full system access
2. **Manager** - Most operations except user management
3. **Cashier** - Limited to sales and basic operations

---

## Detailed Permissions by Module

### 🔐 AUTHENTICATION
| Action | Admin | Manager | Cashier |
|--------|-------|---------|---------|
| Login | ✅ | ✅ | ✅ |
| Logout | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |

---

### 📦 PRODUCTS
| Action | Admin | Manager | Cashier |
|--------|-------|---------|---------|
| View products | ✅ | ✅ | ✅ |
| Create product | ✅ | ✅ | ❌ |
| Update product | ✅ | ✅ | ❌ |
| Delete product | ✅ | ✅ | ❌ |
| View categories | ✅ | ✅ | ✅ |
| Create category | ✅ | ✅ | ❌ |
| Update category | ✅ | ✅ | ❌ |
| Delete category | ✅ | ✅ | ❌ |

**Routes:**
- `GET /api/products` - All roles (public)
- `POST /api/products` - Admin, Manager only
- `PUT /api/products/:id` - Admin, Manager only
- `DELETE /api/products/:id` - Admin, Manager only
- `GET /api/products/categories/list` - All roles
- `POST /api/products/categories` - Admin, Manager only
- `PUT /api/products/categories/:id` - Admin, Manager only
- `DELETE /api/products/categories/:id` - Admin, Manager only

---

### 📊 INVENTORY
| Action | Admin | Manager | Cashier |
|--------|-------|---------|---------|
| View inventory | ✅ | ✅ | ✅ |
| Adjust stock | ✅ | ✅ | ❌ |
| View adjustment history | ✅ | ✅ | ❌ |

**Routes:**
- `GET /api/inventory` - All authenticated users
- `POST /api/inventory/adjust` - Admin, Manager only
- `GET /api/inventory/adjustments` - Admin, Manager only

**Notes:**
- Stock is automatically reduced when sales are completed
- Only Admin and Manager can manually adjust stock levels
- All adjustments are logged with user information

---

### 💰 SALES (POS)
| Action | Admin | Manager | Cashier |
|--------|-------|---------|---------|
| Create sale | ✅ | ✅ | ✅ |
| View sales | ✅ | ✅ | ✅ |
| Process payment | ✅ | ✅ | ✅ |

**Routes:**
- `POST /api/sales` - All authenticated users
- `GET /api/sales` - All authenticated users
- `POST /api/payments` - All authenticated users

**Notes:**
- All roles can process sales and payments
- Sales are automatically linked to the logged-in user (cashier)
- Stock is automatically reduced upon sale completion

---

### 👥 CUSTOMERS
| Action | Admin | Manager | Cashier |
|--------|-------|---------|---------|
| View customers | ✅ | ✅ | ✅ |
| Create customer | ✅ | ✅ | ✅ |
| View customer history | ✅ | ✅ | ✅ |

**Routes:**
- `GET /api/customers` - All authenticated users
- `POST /api/customers` - All authenticated users
- `GET /api/customers/:id/history` - All authenticated users

**Notes:**
- All roles can manage customers
- Customer data is shared across all users

---

### 📈 REPORTS
| Action | Admin | Manager | Cashier |
|--------|-------|---------|---------|
| View sales reports | ✅ | ✅ | ✅ |
| View product reports | ✅ | ✅ | ✅ |
| View transaction reports | ✅ | ✅ | ✅ |
| View inventory reports | ✅ | ✅ | ✅ |
| View summary report | ✅ | ✅ | ✅ |
| View daily sales | ✅ | ✅ | ✅ |
| View product performance | ✅ | ✅ | ✅ |

**Routes:**
- `GET /api/reports/sales` - All authenticated users
- `GET /api/reports/products` - All authenticated users
- `GET /api/reports/transactions` - All authenticated users
- `GET /api/reports/inventory` - All authenticated users
- `GET /api/reports/summary` - All authenticated users
- `GET /api/reports/daily-sales` - All authenticated users
- `GET /api/reports/product-performance` - All authenticated users

**Notes:**
- All roles have full access to reports
- Reports show data based on date range filters
- No role restrictions on viewing analytics

---

### 📊 DASHBOARD
| Action | Admin | Manager | Cashier |
|--------|-------|---------|---------|
| View dashboard summary | ✅ | ✅ | ✅ |
| View sales trends | ✅ | ✅ | ✅ |
| View top products | ✅ | ✅ | ✅ |

**Routes:**
- `GET /api/dashboard/summary` - All authenticated users
- `GET /api/dashboard/sales-trend` - All authenticated users
- `GET /api/dashboard/top-products` - All authenticated users

**Notes:**
- Dashboard is accessible to all authenticated users
- Shows real-time business metrics

---

## Permission Summary

### 🔴 Admin Only
Currently, there are no Admin-exclusive features. Admin has the same permissions as Manager.

### 🟡 Admin + Manager Only
- Create, update, delete products
- Create, update, delete categories
- Adjust inventory stock levels
- View inventory adjustment history

### 🟢 All Roles (Admin + Manager + Cashier)
- Process sales (POS)
- Process payments
- Manage customers
- View all reports
- View dashboard
- View products and inventory (read-only for Cashier)

---

## Frontend Route Protection

The frontend uses `ProtectedRoute` component to restrict access based on authentication status. Currently, role-based UI restrictions are not enforced on the frontend, but the backend API enforces all permissions.

**Recommendation:** Consider adding role-based UI hiding for:
- Product management buttons (for Cashiers)
- Inventory adjustment buttons (for Cashiers)
- Category management (for Cashiers)

---

## Security Notes

1. **All routes require authentication** - Users must be logged in
2. **JWT tokens** are used for authentication
3. **Role validation** happens on the backend for all protected operations
4. **Passwords** are hashed using bcrypt
5. **SQL injection** protection via parameterized queries
6. **CORS** is configured to allow only specific origins

---

## Default Admin Account

```
Username: admin
Password: Admin@1234
Role: admin
```

**⚠️ IMPORTANT:** Change the default admin password immediately in production!

---

## Adding New Permissions

To add role restrictions to a route:

```javascript
import { requireRole } from "../middleware/authMiddleware.js";

// Restrict to specific roles
router.post("/endpoint", requireRole("admin", "manager"), controller);

// All authenticated users
router.get("/endpoint", requireAuth, controller);
```

---

*Last Updated: March 2026*
