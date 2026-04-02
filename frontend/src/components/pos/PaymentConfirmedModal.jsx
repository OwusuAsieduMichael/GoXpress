import Modal from "../common/Modal.jsx";
import { currency, dateTime } from "../../utils/format.js";

const methodLabel = (method) => {
  if (method === "mobile_money") return "Mobile Money";
  if (method === "card") return "Card";
  return "Cash";
};

const PaymentConfirmedModal = ({ open, details, onDone, onPrintReceipt }) => {
  if (!details) return null;

  return (
    <Modal open={open} title="Payment Status" onClose={onDone} width="420px">
      <div className="payment-complete-sheet">
        <article className="payment-complete-main">
          <div className="payment-check-icon" aria-hidden="true">
            <span>✓</span>
          </div>
          <h3>Payment complete</h3>
          {details.saleNumber && (
            <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: "8px" }}>
              Sale #{details.saleNumber}
            </p>
          )}
          <p className="payment-complete-amount">{currency(details.totalAmount)}</p>
          <p className="payment-complete-change">Change due {currency(details.changeDue)}</p>
          <p className="payment-complete-meta">
            {methodLabel(details.paymentMethod)} • {dateTime(details.createdAt)}
          </p>
          {details.reference ? (
            <p className="payment-complete-meta">Ref: {details.reference}</p>
          ) : null}
        </article>

        <div className="payment-complete-actions">
          <button type="button" className="payment-done-btn" onClick={onDone}>
            Done
          </button>

          <button type="button" className="ghost-btn payment-print-btn" onClick={onPrintReceipt}>
            Print receipt
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentConfirmedModal;
