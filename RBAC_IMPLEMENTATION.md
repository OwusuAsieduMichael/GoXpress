# Role-Based Access Control (RBAC) Implementation

## ✅ Implementation Complete

The GoXpress POS system now has a fully functional Role-Based Access Control system with both backend enforcement and frontend UI adaptation.

---

## 🎯 System Architecture

### Backend (Node.js + PostgreSQL)
- JWT-based authentication with role embedded in token
- Middleware for role validation
- Protected API routes
- Database-level role storage

### Frontend (React)
- Context-based auth state management
- Custom permissions hook
- Dynamic UI rendering based on role
- Role-aware navigation

---

## 👥 User Roles & Permissions

### 🔴 Admin & Manager
**Full Management Access:**
- ✅ Create, update, delete products
- ✅ Create, update, delete categories
- ✅ Adjust inventory (add/reduce stock)
- ✅ View inventory adjustment history
- ✅ All cashier permissions

### 🟢 Cashier
**Operational Access:**
- ✅ Process sales (POS)
- ✅ Process payments
- ✅ Manage customers
- ✅ View dashboard
- ✅ View reports & analytics
- ✅ View products (read-only)
- ✅ View inventory (read-only)
- ❌ Cannot edit/delete products
- ❌ Cannot adjust stock manually

---

## 🔧 Backend Implementation

### 1. Authentication Middleware
**File:** `backend/src/middleware/authMiddleware.js`

```javascript
// Require authentication
export const requireAuth = (req, res, next) => {
  // Validates JWT token
  // Attaches user info to req.user
}

// Require specific roles
export const requireRole = (...roles) => (req, res, next) => {
  // Checks if user.role is in allowed roles
  // Returns 403 if insufficient permissions
}
```

### 2. Protected Routes Example

```javascript
// Admin/Manager only
router.post("/products", requireRole("admin", "manager"), createProduct);
router.post("/inventory/adjust", requireRole("admin", "manager"), adjustStock);

// All authenticated users
router.post("/sales", requireAuth, createSale);
router.get("/dashboard/summary", requireAuth, getDashboardSummary);
```

### 3. JWT Token Structure

```javascript
{
  sub: userId,
  role: "admin" | "manager" | "cashier",
  email: userEmail,
  username: username
}
```

---

## ⚛️ Frontend Implementation

### 1. Permissions Hook
**File:** `frontend/src/hooks/usePermissions.js`

```javascript
const permissions = usePermissions();

// Usage:
permissions.canCreateProduct    // true for admin/manager
permissions.canAdjustStock      // true for admin/manager
permissions.isCashier           // true for cashier
permissions.isAdminOrManager    // true for admin/manager
```

### 2. Dynamic Sidebar
**File:** `frontend/src/components/common/Sidebar.jsx`

- Automatically filters navigation items based on role
- All roles see all menu items (Products and Inventory are view-only for cashiers)
- Role displayed in topbar

### 3. Conditional UI Rendering

**Products Page:**
```javascript
{!permissions.isCashier && (
  <button onClick={handleEdit}>Edit Product</button>
)}
```

**Inventory Page:**
```javascript
{permissions.canAdjustStock ? (
  <button onClick={openUpdateModal}>Update Stock</button>
) : (
  <span>View Only</span>
)}
```

### 4. Role Display
**Topbar shows:**
- User's full name
- User's role (Admin/Manager/Cashier)
- Logout button

---

## 🔒 Security Features

### Backend Security
1. **JWT Validation** - Every protected route validates token
2. **Role Enforcement** - Middleware checks role before allowing access
3. **HTTP-Only Cookies** - Token stored securely
4. **Password Hashing** - bcrypt with salt rounds
5. **SQL Injection Protection** - Parameterized queries
6. **CORS Configuration** - Restricted origins

### Frontend Security
1. **No Sensitive Logic** - All permissions enforced on backend
2. **UI Hints Only** - Frontend hiding is UX, not security
3. **Token Management** - Automatic token refresh
4. **Protected Routes** - React Router guards

---

## 📋 API Endpoints by Role

### 🔴 Admin/Manager Only

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/products/categories` | Create category |
| PUT | `/api/products/categories/:id` | Update category |
| DELETE | `/api/products/categories/:id` | Delete category |
| POST | `/api/inventory/adjust` | Adjust stock |
| GET | `/api/inventory/adjustments` | View adjustment history |

### 🟢 All Roles (Authenticated)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/products` | View products |
| GET | `/api/products/categories/list` | View categories |
| GET | `/api/inventory` | View inventory |
| POST | `/api/sales` | Create sale |
| GET | `/api/sales` | View sales |
| POST | `/api/payments` | Process payment |
| GET | `/api/customers` | View customers |
| POST | `/api/customers` | Create customer |
| GET | `/api/reports/*` | View reports |
| GET | `/api/dashboard/*` | View dashboard |

---

## 🎨 UI/UX Features

### Role Indicators
1. **Topbar** - Shows "Logged in as: [Role]"
2. **Inventory Page** - Shows "(Read-Only Access)" for cashiers
3. **Action Buttons** - Disabled/hidden based on permissions

### User Experience
- **Smooth Transitions** - No page reloads
- **Clear Feedback** - Permission errors show friendly messages
- **Intuitive Design** - Disabled buttons have tooltips
- **Consistent Behavior** - Same UI patterns across pages

---

## 🧪 Testing Scenarios

### Test as Admin/Manager
1. Login with admin credentials
2. Navigate to Products → Should see full catalog
3. Navigate to Inventory → Should see "Update Stock" buttons
4. Click "Update Stock" → Modal should open
5. Submit stock adjustment → Should succeed

### Test as Cashier
1. Login with cashier credentials
2. Navigate to Products → Should see catalog (read-only)
3. Navigate to Inventory → Should see "View Only" instead of buttons
4. Try to adjust stock via API → Should get 403 Forbidden
5. Process a sale → Should succeed
6. View reports → Should succeed

---

## 🔄 Automatic Behaviors

### Stock Management
- **After Sale:** Stock automatically reduces
- **Manual Adjustment:** Only admin/manager can adjust
- **Audit Trail:** All adjustments logged with user info

### Session Management
- **Token Expiry:** 7 days (configurable)
- **Auto Logout:** On token expiration
- **Role Persistence:** Role stored in JWT and database

---

## 📝 Default Accounts

```
Admin Account:
Username: admin
Password: Admin@1234
Role: admin

⚠️ Change default password in production!
```

---

## 🚀 Future Enhancements

### Potential Additions:
1. **User Management Page** - Admin-only user CRUD
2. **Permission Groups** - Custom permission sets
3. **Activity Logs** - Track all user actions
4. **Role Hierarchy** - Inherit permissions
5. **Two-Factor Auth** - Enhanced security
6. **Session Management** - View/revoke active sessions

---

## 📚 Code Files Modified

### Backend
- `backend/src/middleware/authMiddleware.js` - Role validation
- `backend/src/controllers/authController.js` - Login returns role
- `backend/src/routes/*Routes.js` - Protected with requireRole

### Frontend
- `frontend/src/hooks/usePermissions.js` - NEW: Permission hook
- `frontend/src/components/common/Sidebar.jsx` - Role-aware navigation
- `frontend/src/components/common/Topbar.jsx` - Role display
- `frontend/src/pages/Inventory.jsx` - Conditional buttons
- `frontend/src/pages/Products.jsx` - Role-aware UI
- `frontend/src/context/AuthContext.jsx` - User state management

---

## ✅ Checklist

- [x] Backend role validation middleware
- [x] JWT includes role information
- [x] Protected API routes
- [x] Frontend permissions hook
- [x] Dynamic sidebar navigation
- [x] Role display in topbar
- [x] Conditional UI rendering (Inventory)
- [x] Conditional UI rendering (Products)
- [x] Read-only indicators for cashiers
- [x] Automatic stock reduction on sales
- [x] Audit trail for stock adjustments
- [x] Error handling for permission denials
- [x] Documentation complete

---

## 🎯 Summary

The RBAC system is now fully implemented with:
- ✅ **Secure backend** enforcement
- ✅ **Dynamic frontend** UI adaptation
- ✅ **Clear role indicators**
- ✅ **Intuitive user experience**
- ✅ **Comprehensive documentation**

All roles can access the system, but cashiers have read-only access to products and inventory while maintaining full access to sales operations.

---

*Implementation completed: March 2026*
