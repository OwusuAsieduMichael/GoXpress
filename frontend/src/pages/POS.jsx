import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductSearch from "../components/pos/ProductSearch.jsx";
import CartPanel from "../components/pos/CartPanel.jsx";
import PaymentModal from "../components/pos/PaymentModal.jsx";
import PaymentConfirmedModal from "../components/pos/PaymentConfirmedModal.jsx";
import ReceiptModal from "../components/pos/ReceiptModal.jsx";
import Modal from "../components/common/Modal.jsx";
import { useOfflineCart } from "../hooks/useOfflineCart.js";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts.js";
import { productsService } from "../services/productsService.js";
import { customersService } from "../services/customersService.js";
import { salesService } from "../services/salesService.js";
import { paymentsService } from "../services/paymentsService.js";

const calculateTotals = (cart, discount, tax) => {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = Math.max(0, subtotal - discount + tax);
  return { subtotal, discount, tax, total };
};

const initialCustomerForm = {
  fullName: "",
  email: "",
  phone: "",
  address: ""
};

const POSPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [cart, setCart] = useOfflineCart();
  const [saleDiscount, setSaleDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [pendingReceipt, setPendingReceipt] = useState(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(null);
  const [error, setError] = useState("");
  const [cartNotice, setCartNotice] = useState("");
  const [cartPulse, setCartPulse] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState(initialCustomerForm);
  const searchRef = useRef(null);
  const cartRef = useRef(null);
  const pulseTimerRef = useRef(null);

  const focusCartDashboard = useCallback((notice = "") => {
    cartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setCartPulse(true);
    if (notice) {
      setCartNotice(notice);
    }
    window.clearTimeout(pulseTimerRef.current);
    pulseTimerRef.current = window.setTimeout(() => setCartPulse(false), 800);
  }, []);

  const loadProducts = useCallback(async (search = "") => {
    const rows = await productsService.getAll({ search });
    setProducts(rows);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [productRows, customerRows] = await Promise.all([
          productsService.getAll(),
          customersService.getAll()
        ]);
        setProducts(productRows);
        setCustomers(customerRows);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      loadProducts(searchTerm).catch((err) => setError(err.message));
    }, 250);
    return () => clearTimeout(handle);
  }, [searchTerm, loadProducts]);

  const addToCart = (product, options = {}) => {
    const { focusCart = false, notice = "" } = options;
    setError("");
    let added = false;

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          setError(`Stock limit reached for ${product.name}`);
          return prev;
        }
        added = true;
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      added = true;
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1
        }
      ];
    });

    if (added && focusCart) {
      window.requestAnimationFrame(() => {
        focusCartDashboard(notice || `${product.name} added to cart`);
      });
    }

    return added;
  };

  const onBarcodeSubmit = async () => {
    const code = barcodeInput.trim().toUpperCase();
    if (!code) return;
    
    // Search for product by barcode or SKU
    let match = products.find((item) => 
      item.barcode === code || item.sku?.toUpperCase() === code
    );
    
    if (!match) {
      const remote = await productsService.getAll({ search: code });
      match = remote.find((item) => 
        item.barcode === code || item.sku?.toUpperCase() === code
      );
    }
    
    if (match) {
      addToCart(match);
      setBarcodeInput("");
      return;
    }
    setError(`No product found with barcode/SKU: ${code}`);
  };

  const changeQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const totals = useMemo(
    () => calculateTotals(cart, Number(saleDiscount || 0), Number(tax || 0)),
    [cart, saleDiscount, tax]
  );

  useKeyboardShortcuts({
    onFocusSearch: () => searchRef.current?.focus(),
    onCheckout: () => {
      if (cart.length > 0) {
        setCheckoutOpen(true);
      }
    },
    onEscape: () => setCheckoutOpen(false)
  });

  useEffect(() => {
    if (!cartNotice) {
      return undefined;
    }
    const timer = setTimeout(() => setCartNotice(""), 1600);
    return () => clearTimeout(timer);
  }, [cartNotice]);

  useEffect(() => {
    if (!location.state?.focusCart) {
      return;
    }

    window.requestAnimationFrame(() => {
      focusCartDashboard(location.state?.notice || "Item added to cart");
      navigate("/pos", { replace: true });
    });
  }, [focusCartDashboard, location.state, navigate]);

  useEffect(
    () => () => {
      window.clearTimeout(pulseTimerRef.current);
    },
    []
  );

  const submitSale = async (payment) => {
    setLoading(true);
    setError("");

    try {
      const sale = await salesService.create({
        customerId: selectedCustomerId || null,
        discount: totals.discount,
        tax: totals.tax,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          discount: 0
        })),
        payment
      });

      try {
        await paymentsService.create({
          saleId: sale.id,
          amount: Number(payment.amount || sale.totalAmount),
          amountReceived: Number(payment.amountReceived || payment.amount || sale.totalAmount),
          paymentMethod: payment.method,
          status: payment.status || "success",
          reference: payment.reference || ""
        });
      } catch {
        // Sale endpoint already writes payment. Secondary payment upsert is best-effort only.
      }

      const amountPaid = Number(payment.amount || sale.totalAmount);
      const amountReceived = Number(payment.amountReceived || amountPaid);
      const changeDue =
        sale?.payment?.changeDue ??
        (payment.method === "cash" ? Math.max(0, amountReceived - Number(sale.totalAmount)) : 0);

      setPendingReceipt(sale);
      setPaymentConfirmed({
        saleId: sale.id,
        saleNumber: sale.saleNumber,
        paymentMethod: payment.method,
        totalAmount: Number(sale.totalAmount),
        amount: amountPaid,
        amountReceived,
        changeDue: Number(changeDue),
        reference: payment.reference || "",
        createdAt: new Date().toISOString()
      });

      setCart([]);
      setSaleDiscount(0);
      setTax(0);
      setSelectedCustomerId("");
      setCheckoutOpen(false);
      await loadProducts(searchTerm);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const newCustomer = await customersService.create(customerForm);
      setCustomers((prev) => [newCustomer, ...prev]);
      setSelectedCustomerId(newCustomer.id);
      setCustomerForm(initialCustomerForm);
      setAddCustomerOpen(false);
      setCartNotice(`Customer ${newCustomer.fullName} added successfully`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="stack">
      <header className="page-head">
        <h1>POS Terminal</h1>
      </header>

      {error ? <p className="error-text">{error}</p> : null}
      {cartNotice ? <p className="success-text">{cartNotice}</p> : null}
      {loading ? <p>Processing sale...</p> : null}

      <div className="pos-layout">
        <ProductSearch
          products={products}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          barcodeInput={barcodeInput}
          onBarcodeChange={setBarcodeInput}
          onBarcodeSubmit={() => onBarcodeSubmit().catch((err) => setError(err.message))}
          onAddToCart={(product) =>
            addToCart(product, { focusCart: true, notice: `${product.name} added to cart` })
          }
          searchRef={searchRef}
        />
        <div
          id="cart-dashboard"
          ref={cartRef}
          className={`cart-dashboard ${cartPulse ? "pulse" : ""}`}
        >
          <CartPanel
            cart={cart}
            onChangeQty={changeQty}
            onRemove={(productId) => changeQty(productId, -999)}
            saleDiscount={saleDiscount}
            onSaleDiscountChange={setSaleDiscount}
            tax={tax}
            onTaxChange={setTax}
            totals={totals}
            onCheckout={() => setCheckoutOpen(true)}
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onCustomerChange={setSelectedCustomerId}
            onAddCustomer={() => setAddCustomerOpen(true)}
          />
        </div>
      </div>

      <PaymentModal
        open={checkoutOpen}
        total={totals.total}
        onClose={() => setCheckoutOpen(false)}
        onConfirm={submitSale}
      />

      <PaymentConfirmedModal
        open={Boolean(paymentConfirmed)}
        details={paymentConfirmed}
        onDone={() => {
          setPendingReceipt(null);
          setPaymentConfirmed(null);
        }}
        onPrintReceipt={() => {
          if (pendingReceipt) {
            setReceipt(pendingReceipt);
          }
          setPendingReceipt(null);
          setPaymentConfirmed(null);
          window.setTimeout(() => {
            window.print();
          }, 200);
        }}
      />

      <ReceiptModal open={Boolean(receipt)} receipt={receipt} onClose={() => setReceipt(null)} />

      {/* Quick Add Customer Modal */}
      <Modal
        open={addCustomerOpen}
        title="Add New Customer"
        onClose={() => {
          setAddCustomerOpen(false);
          setCustomerForm(initialCustomerForm);
        }}
        width="500px"
      >
        <form className="stack" onSubmit={handleAddCustomer} style={{ gap: "16px" }}>
          <label>
            Full Name
            <input
              value={customerForm.fullName}
              onChange={(e) => setCustomerForm((prev) => ({ ...prev, fullName: e.target.value }))}
              required
              placeholder="Enter customer's full name"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={customerForm.email}
              onChange={(e) => setCustomerForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="customer@example.com"
            />
          </label>
          <label>
            Phone
            <input
              value={customerForm.phone}
              onChange={(e) => setCustomerForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="+233 XX XXX XXXX"
            />
          </label>
          <label>
            Address
            <input
              value={customerForm.address}
              onChange={(e) => setCustomerForm((prev) => ({ ...prev, address: e.target.value }))}
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
                setCustomerForm(initialCustomerForm);
              }}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
};

export default POSPage;
