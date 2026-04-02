import { currency } from "../../utils/format.js";

const CartPanel = ({
  cart,
  onChangeQty,
  onRemove,
  saleDiscount,
  onSaleDiscountChange,
  tax,
  onTaxChange,
  totals,
  onCheckout,
  customers,
  selectedCustomerId,
  onCustomerChange,
  onAddCustomer
}) => (
  <aside className="panel">
    <header className="panel-header">
      <h2>Cart</h2>
    </header>

    <div className="cart-list">
      {cart.map((item) => (
        <article key={item.productId} className="cart-item">
          <div>
            <h4>{item.name}</h4>
            <p>{currency(item.price)}</p>
          </div>
          <div className="qty-controls">
            <button type="button" onClick={() => onChangeQty(item.productId, -1)}>
              -
            </button>
            <span>{item.quantity}</span>
            <button type="button" onClick={() => onChangeQty(item.productId, 1)}>
              +
            </button>
          </div>
          <button type="button" className="danger-btn ghost-style" onClick={() => onRemove(item.productId)}>
            Remove
          </button>
        </article>
      ))}
      {cart.length === 0 ? <p>Cart is empty.</p> : null}
    </div>

    <div className="customer-section" style={{ marginTop: "16px", marginBottom: "16px" }}>
      <label style={{ marginBottom: "8px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <span className="material-icons-outlined" style={{ fontSize: "18px" }}>person</span>
          Customer
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <select
            value={selectedCustomerId}
            onChange={(event) => onCustomerChange(event.target.value)}
            style={{ flex: 1 }}
          >
            <option value="">Walk-in Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.fullName}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="ghost-btn"
            onClick={onAddCustomer}
            title="Add new customer"
            style={{ padding: "8px 12px" }}
          >
            <span className="material-icons-outlined" style={{ fontSize: "20px" }}>
              person_add
            </span>
          </button>
        </div>
      </label>
    </div>

    <div className="grid two">
      <label>
        Discount
        <input
          type="number"
          min="0"
          step="0.01"
          value={saleDiscount}
          onChange={(event) => onSaleDiscountChange(Number(event.target.value || 0))}
        />
      </label>
      <label>
        Tax
        <input
          type="number"
          min="0"
          step="0.01"
          value={tax}
          onChange={(event) => onTaxChange(Number(event.target.value || 0))}
        />
      </label>
    </div>

    <div className="totals">
      <p>
        <span>Subtotal</span>
        <strong>{currency(totals.subtotal)}</strong>
      </p>
      <p>
        <span>Discount</span>
        <strong>- {currency(totals.discount)}</strong>
      </p>
      <p>
        <span>Tax</span>
        <strong>{currency(totals.tax)}</strong>
      </p>
      <p className="grand">
        <span>Total</span>
        <strong>{currency(totals.total)}</strong>
      </p>
    </div>

    <button
      type="button"
      className="primary-btn large"
      onClick={onCheckout}
      disabled={cart.length === 0}
    >
      <span className="material-icons-outlined" style={{ fontSize: "20px", marginRight: "8px" }}>
        payment
      </span>
      Process Payment
    </button>
  </aside>
);

export default CartPanel;
