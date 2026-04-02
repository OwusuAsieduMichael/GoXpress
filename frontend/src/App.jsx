import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import Landing from "./pages/Landing.jsx";
import LoginPage from "./pages/Login.jsx";
import DashboardPage from "./pages/Dashboard.jsx";
import POSPage from "./pages/POS.jsx";
import ProductsPage from "./pages/Products.jsx";
import CustomersPage from "./pages/Customers.jsx";
import ReportsPage from "./pages/Reports.jsx";
import InventoryPage from "./pages/Inventory.jsx";
import HelpPage from "./pages/Help.jsx";
import DiagnosticPage from "./pages/DiagnosticPage.jsx";

const App = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<LoginPage mode="login" />} />
    <Route path="/signup" element={<LoginPage mode="signup" />} />
    <Route path="/diagnostic" element={<DiagnosticPage />} />
    <Route
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/app" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/pos" element={<POSPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/help" element={<HelpPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default App;
