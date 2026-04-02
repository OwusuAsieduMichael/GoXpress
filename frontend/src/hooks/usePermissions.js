import { useAuth } from "../context/AuthContext.jsx";

export const usePermissions = () => {
  const { user } = useAuth();
  const role = user?.role || "cashier";

  const permissions = {
    // Product permissions
    canCreateProduct: role === "admin" || role === "manager",
    canUpdateProduct: role === "admin" || role === "manager",
    canDeleteProduct: role === "admin" || role === "manager",
    
    // Category permissions
    canManageCategories: role === "admin" || role === "manager",
    
    // Inventory permissions
    canAdjustStock: role === "admin" || role === "manager",
    canViewAdjustments: role === "admin" || role === "manager",
    
    // Sales permissions (all roles)
    canProcessSales: true,
    canViewSales: true,
    
    // Customer permissions (all roles)
    canManageCustomers: true,
    
    // Reports permissions (all roles)
    canViewReports: true,
    
    // Dashboard permissions (all roles)
    canViewDashboard: true,
    
    // Role info
    role,
    isAdmin: role === "admin",
    isManager: role === "manager",
    isCashier: role === "cashier",
    isAdminOrManager: role === "admin" || role === "manager"
  };

  return permissions;
};
