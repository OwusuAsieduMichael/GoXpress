import { useEffect, useMemo, useState } from "react";
import { inventoryService } from "../services/inventoryService.js";
import { productsService } from "../services/productsService.js";
import { currency } from "../utils/format.js";
import Modal from "../components/common/Modal.jsx";
import { usePermissions } from "../hooks/usePermissions.js";

const InventoryPage = () => {
  const permissions = usePermissions();
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentForm, setAdjustmentForm] = useState({ quantity: "", reason: "", type: "add" });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [invRows, catRows] = await Promise.all([
        inventoryService.getAll({ search }),
        productsService.getCategories()
      ]);
      setInventory(invRows);
      setCategories(catRows);
    } catch (err) {
      setError(err.message);
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { label: "Out of Stock", class: "danger" };
    if (quantity <= 10) return { label: "Low Stock", class: "warning" };
    return { label: "In Stock", class: "ok" };
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesCategory = categoryFilter === "all" || item.categoryId === categoryFilter;
      const status = getStockStatus(item.stockQuantity);
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "out" && item.stockQuantity === 0) ||
        (statusFilter === "low" && item.stockQuantity > 0 && item.stockQuantity <= 10) ||
        (statusFilter === "in" && item.stockQuantity > 10);
      
      return matchesCategory && matchesStatus;
    });
  }, [inventory, categoryFilter, statusFilter]);

  const lowStockCount = useMemo(
    () => inventory.filter((item) => item.stockQuantity > 0 && item.stockQuantity <= 10).length,
    [inventory]
  );

  const outOfStockCount = useMemo(
    () => inventory.filter((item) => item.stockQuantity === 0).length,
    [inventory]
  );

  const openUpdateModal = (product) => {
    console.log('Opening modal for product:', product);
    setSelectedProduct(product);
    setAdjustmentForm({ quantity: "", reason: "", type: "add" });
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setAdjustmentForm({ quantity: "", reason: "", type: "add" });
    setError("");
    setSuccess("");
  };

  const handleStockUpdate = async (event) => {
    event.preventDefault();
    console.log('Submitting stock update:', adjustmentForm, selectedProduct);
    setError("");
    setSuccess("");

    const quantity = Number(adjustmentForm.quantity);
    if (!quantity || quantity <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    const change = adjustmentForm.type === "add" ? quantity : -quantity;
    const newQuantity = selectedProduct.stockQuantity + change;

    if (newQuantity < 0) {
      setError("Cannot reduce stock below zero");
      return;
    }

    try {
      console.log('Calling adjust API with:', {
        productId: selectedProduct.productId,
        change,
        reason: adjustmentForm.reason || `Stock ${adjustmentForm.type === "add" ? "restock" : "adjustment"}`
      });
      
      const result = await inventoryService.adjust({
        productId: selectedProduct.productId,
        change,
        reason: adjustmentForm.reason || `Stock ${adjustmentForm.type === "add" ? "restock" : "adjustment"}`
      });

      console.log('Adjust result:', result);
      setSuccess(`Stock updated successfully!`);
      await load();
      
      setTimeout(() => {
        closeModal();
      }, 1000);
    } catch (err) {
      console.error('Adjust error:', err);
      setError(err.message);
    }
  };

  return (
    <section className="stack">
      <header className="page-head">
        <div>
          <h1>Inventory Management</h1>
          {!permissions.canAdjustStock && (
            <span className="muted-text" style={{ fontSize: "0.9rem", display: "block", marginTop: "4px" }}>
              Read-Only Access
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ 
            padding: "8px 16px", 
            background: "#fff", 
            border: "1px solid #ffe2ce", 
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span className="material-icons-outlined" style={{ fontSize: "20px", color: "#ff8d2f" }}>
              inventory_2
            </span>
            <div>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#8d97a8" }}>Total Products</p>
              <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700", color: "#1f2a44" }}>
                {inventory.length}
              </p>
            </div>
          </div>
        </div>
      </header>

      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div style={{ 
          background: "linear-gradient(135deg, #fff3cd 0%, #ffe8b8 100%)", 
          border: "1px solid #ffc107",
          borderRadius: "12px",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          boxShadow: "0 2px 8px rgba(255, 193, 7, 0.15)"
        }}>
          <span className="material-icons-outlined" style={{ fontSize: "24px", color: "#f57c00" }}>
            warning
          </span>
          <div>
            <p style={{ margin: "0 0 4px 0", fontWeight: "600", color: "#7d5a00", fontSize: "0.95rem" }}>
              Stock Alert
            </p>
            <p style={{ margin: 0, color: "#856404", fontSize: "0.9rem" }}>
              {lowStockCount > 0 && `${lowStockCount} product${lowStockCount > 1 ? "s" : ""} running low`}
              {lowStockCount > 0 && outOfStockCount > 0 && " • "}
              {outOfStockCount > 0 && `${outOfStockCount} product${outOfStockCount > 1 ? "s" : ""} out of stock`}
            </p>
          </div>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      <article className="panel">
        <header className="panel-header">
          <h2>Stock Levels</h2>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span className="material-icons-outlined" style={{ fontSize: "18px", color: "#8d97a8" }}>
              filter_list
            </span>
            <span style={{ fontSize: "0.85rem", color: "#8d97a8" }}>
              {filteredInventory.length} of {inventory.length} products
            </span>
          </div>
        </header>

        <div className="grid three" style={{ marginBottom: "20px", gap: "12px" }}>
          <label style={{ margin: 0 }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", fontSize: "0.9rem", fontWeight: "600" }}>
              <span className="material-icons-outlined" style={{ fontSize: "16px" }}>search</span>
              Search Products
            </span>
            <input
              placeholder="Search by name, SKU..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ margin: 0 }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", fontSize: "0.9rem", fontWeight: "600" }}>
              <span className="material-icons-outlined" style={{ fontSize: "16px" }}>category</span>
              Category
            </span>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ width: "100%" }}>
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>

          <label style={{ margin: 0 }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", fontSize: "0.9rem", fontWeight: "600" }}>
              <span className="material-icons-outlined" style={{ fontSize: "16px" }}>inventory</span>
              Stock Status
            </span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: "100%" }}>
              <option value="all">All Status</option>
              <option value="in">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </label>
        </div>

        {loading ? (
          <p>Loading inventory...</p>
        ) : filteredInventory.length === 0 ? (
          <p className="muted-text">No products found</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Price</th>
                  <th>Stock Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const status = getStockStatus(item.stockQuantity);
                  return (
                    <tr key={item.productId}>
                      <td>
                        <strong>{item.productName}</strong>
                        <br />
                        <span className="muted-text" style={{ fontSize: "0.85rem" }}>
                          SKU: {item.sku}
                        </span>
                      </td>
                      <td>{item.categoryName || "-"}</td>
                      <td>
                        <strong style={{ fontSize: "1.1rem" }}>{item.stockQuantity}</strong>
                      </td>
                      <td>{currency(item.price)}</td>
                      <td>
                        <span className={`status-chip ${status.class}`}>{status.label}</span>
                      </td>
                      <td>
                        {permissions.canAdjustStock ? (
                          <button
                            type="button"
                            className="primary-btn"
                            onClick={() => openUpdateModal(item)}
                            style={{ 
                              padding: "8px 16px", 
                              fontSize: "0.9rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              margin: "0 auto"
                            }}
                          >
                            <span className="material-icons-outlined" style={{ fontSize: "16px" }}>
                              edit
                            </span>
                            Update
                          </button>
                        ) : (
                          <span style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "6px",
                            justifyContent: "center",
                            color: "#8d97a8",
                            fontSize: "0.85rem"
                          }}>
                            <span className="material-icons-outlined" style={{ fontSize: "16px" }}>
                              visibility
                            </span>
                            View Only
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {showModal && selectedProduct && (
        <Modal open={showModal} title={`Update Stock: ${selectedProduct.productName}`} onClose={closeModal}>
          <div className="stack">
            <div style={{ padding: "12px", background: "#f8f9fa", borderRadius: "8px" }}>
              <p style={{ margin: "0 0 8px 0" }}>
                <strong>Current Stock:</strong> {selectedProduct.stockQuantity} units
              </p>
              <p style={{ margin: 0 }}>
                <strong>SKU:</strong> {selectedProduct.sku}
              </p>
            </div>

            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}

            <form onSubmit={handleStockUpdate} className="stack">
              <label>
                Action Type
                <select
                  value={adjustmentForm.type}
                  onChange={(e) =>
                    setAdjustmentForm((prev) => ({ ...prev, type: e.target.value }))
                  }
                  required
                >
                  <option value="add">Add Stock (Restock)</option>
                  <option value="reduce">Reduce Stock (Adjustment)</option>
                </select>
              </label>

              <label>
                Quantity
                <input
                  type="number"
                  min="1"
                  value={adjustmentForm.quantity}
                  onChange={(e) =>
                    setAdjustmentForm((prev) => ({ ...prev, quantity: e.target.value }))
                  }
                  placeholder="Enter quantity"
                  required
                />
              </label>

              <label>
                Reason (Optional)
                <input
                  type="text"
                  value={adjustmentForm.reason}
                  onChange={(e) =>
                    setAdjustmentForm((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  placeholder="e.g., New shipment, Damaged goods, etc."
                />
              </label>

              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button type="submit" className="primary-btn large">
                  {adjustmentForm.type === "add" ? "Add Stock" : "Reduce Stock"}
                </button>
                <button type="button" className="ghost-btn large" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </section>
  );
};

export default InventoryPage;
