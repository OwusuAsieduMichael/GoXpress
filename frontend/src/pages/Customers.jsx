import { useEffect, useState } from "react";
import Modal from "../components/common/Modal.jsx";
import { customersService } from "../services/customersService.js";
import { currency, dateTime } from "../utils/format.js";

const initialCustomer = {
  fullName: "",
  email: "",
  phone: "",
  address: ""
};

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(initialCustomer);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await customersService.getAll({ search });
      setCustomers(rows);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await customersService.create(form);
      setForm(initialCustomer);
      setAddCustomerOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const openHistory = async (id) => {
    setError("");
    setHistoryLoading(true);
    setHistoryData(null);
    setHistoryOpen(true);
    try {
      const data = await customersService.getHistory(id);
      setHistoryData(data);
    } catch (err) {
      setError(err.message);
      setHistoryOpen(false);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <section className="stack">
      <header className="page-head">
        <h1>Customers</h1>
        <button 
          type="button" 
          className="primary-btn"
          onClick={() => setAddCustomerOpen(true)}
        >
          <span className="material-icons-outlined" style={{ fontSize: "20px", marginRight: "6px" }}>
            person_add
          </span>
          Add Customer
        </button>
      </header>

      {error ? <p className="error-text">{error}</p> : null}

      <article className="panel">
        <header className="panel-header">
          <h2>Customer List</h2>
          <input
            placeholder="Search customer..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </header>
        {loading ? (
          <p>Loading customers...</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Purchases</th>
                  <th>Total Spent</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.fullName}</td>
                    <td>{customer.email || "-"}</td>
                    <td>{customer.phone || "-"}</td>
                    <td>{customer.purchaseCount}</td>
                    <td>{currency(customer.totalSpent)}</td>
                    <td>
                      <button type="button" className="ghost-btn" onClick={() => openHistory(customer.id)}>
                        View History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {/* Add Customer Modal */}
      <Modal
        open={addCustomerOpen}
        title="Add New Customer"
        onClose={() => {
          setAddCustomerOpen(false);
          setForm(initialCustomer);
          setError("");
        }}
        width="560px"
      >
        <form className="stack" onSubmit={onSubmit} style={{ gap: "16px" }}>
          <label>
            Full Name
            <input
              value={form.fullName}
              onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              required
              placeholder="Enter customer's full name"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="customer@example.com"
            />
          </label>
          <label>
            Phone
            <input
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="+233 XX XXX XXXX"
            />
          </label>
          <label>
            Address
            <input
              value={form.address}
              onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
              placeholder="Customer's address"
            />
          </label>
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button type="submit" className="primary-btn" style={{ flex: 1 }}>
              Save Customer
            </button>
            <button 
              type="button" 
              className="ghost-btn" 
              onClick={() => {
                setAddCustomerOpen(false);
                setForm(initialCustomer);
                setError("");
              }}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Purchase History Modal */}
      <Modal
        open={historyOpen}
        title={`Purchase History - ${historyData?.customer?.fullName ?? "Customer"}`}
        onClose={() => {
          setHistoryOpen(false);
          setHistoryData(null);
        }}
        width="780px"
      >
        {historyLoading ? (
          <p>Loading purchase history...</p>
        ) : !historyData ? (
          <p>No data available</p>
        ) : historyData.purchases.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <span className="material-icons-outlined" style={{ fontSize: "48px", color: "var(--muted)", marginBottom: "12px" }}>
              shopping_cart
            </span>
            <p style={{ color: "var(--muted)" }}>No purchase history yet</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Discount</th>
                  <th>Tax</th>
                  <th>Payment</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {historyData.purchases.map((sale) => (
                  <tr key={sale.id}>
                    <td>{dateTime(sale.createdAt)}</td>
                    <td>{currency(sale.totalAmount)}</td>
                    <td>{currency(sale.discountAmount)}</td>
                    <td>{currency(sale.taxAmount)}</td>
                    <td>
                      <span style={{ 
                        textTransform: "capitalize",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        background: sale.paymentMethod === "cash" ? "#dcfce7" : 
                                   sale.paymentMethod === "card" ? "#dbeafe" : "#fef3c7",
                        color: sale.paymentMethod === "cash" ? "#166534" : 
                               sale.paymentMethod === "card" ? "#1e40af" : "#854d0e"
                      }}>
                        {sale.paymentMethod || "N/A"}
                      </span>
                    </td>
                    <td>
                      {sale.paymentMethod === "cash" && sale.changeDue !== null ? (
                        <span style={{ color: "var(--brand)", fontWeight: "600" }}>
                          {currency(sale.changeDue)}
                        </span>
                      ) : (
                        <span style={{ color: "var(--muted)" }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </section>
  );
};

export default CustomersPage;
