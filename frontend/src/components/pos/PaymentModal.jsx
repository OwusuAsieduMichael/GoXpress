import { useEffect, useMemo, useState } from "react";
import Modal from "../common/Modal.jsx";
import MobileMoneyPayment from "../MobileMoneyPayment.jsx";
import { currency } from "../../utils/format.js";

const PaymentModal = ({ open, total, onClose, onConfirm, onCreateSaleForMomo }) => {
  const [method, setMethod] = useState("cash");
  const [cashReceived, setCashReceived] = useState(total);
  const [momoPhone, setMomoPhone] = useState("");
  const [momoAmount, setMomoAmount] = useState(total);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (open) {
      setCashReceived(total);
      setMomoAmount(total);
      setMethod("cash");
      setMomoPhone("");
      setProcessing(false);
      setError("");
      setSuccess("");
    }
  }, [open, total]);

  const cashChange = useMemo(
    () => Math.max(0, Number(cashReceived || 0) - Number(total || 0)),
    [cashReceived, total]
  );

  const validateCash = () => {
    if (Number(cashReceived || 0) < Number(total || 0)) {
      return "Amount received cannot be less than total.";
    }
    return "";
  };

  const validateMomo = () => {
    const phone = String(momoPhone || "").trim();
    const isPhoneValid = /^(\+233|0)\d{9}$/.test(phone);
    if (!isPhoneValid) {
      return "Enter a valid Ghana mobile number (e.g. 024xxxxxxx or +23324xxxxxxx).";
    }
    if (Number(momoAmount || 0) < Number(total || 0)) {
      return "Mobile Money amount cannot be less than total.";
    }
    return "";
  };

  const buildPayload = () => {
    if (method === "cash") {
      return {
        method: "cash",
        amount: Number(total || 0),
        amountReceived: Number(cashReceived || 0),
        status: "success"
      };
    }

    return {
      method: "mobile_money",
      amount: Number(momoAmount || 0),
      amountReceived: Number(momoAmount || 0),
      status: "success",
      reference: `MOMO-${String(momoPhone || "").slice(-4)}`
    };
  };

  const handleConfirm = async () => {
    setError("");
    setSuccess("");

    // For Mobile Money, don't validate here - let the MobileMoneyPayment component handle it
    if (method === "mobile_money") {
      return;
    }

    const validationError = validateCash();

    if (validationError) {
      setError(validationError);
      return;
    }

    setProcessing(true);

    try {
      await onConfirm(buildPayload());
    } catch (err) {
      setError(err.message || "Payment failed. Please retry.");
    } finally {
      setProcessing(false);
    }
  };

  const confirmLabel = processing
    ? "Processing..."
    : method === "cash"
      ? "Confirm Cash Payment"
      : "Confirm Mobile Money";

  const change = useMemo(
    () => Math.max(0, Number(cashReceived || 0) - Number(total || 0)),
    [cashReceived, total]
  );

  return (
    <Modal
      open={open}
      title="Checkout Payment"
      onClose={() => {
        if (!processing) {
          onClose();
        }
      }}
      width="520px"
    >
      <div className="stack payment-stack">
        <div className="payment-method-tabs">
          <button
            type="button"
            className={method === "cash" ? "payment-tab active" : "payment-tab"}
            onClick={() => setMethod("cash")}
            disabled={processing}
          >
            Cash
          </button>
          <button
            type="button"
            className={method === "mobile_money" ? "payment-tab active" : "payment-tab"}
            onClick={() => setMethod("mobile_money")}
            disabled={processing}
          >
            Mobile Money
          </button>
        </div>

        <article className="payment-summary-card">
          <p>Total Amount</p>
          <h3>{currency(total)}</h3>
          {method === "cash" ? (
            <p className="payment-change-text">Change: {currency(cashChange)}</p>
          ) : null}
        </article>

        {method === "cash" ? (
          <label>
            Amount Received
            <input
              type="number"
              min={total}
              step="0.01"
              value={cashReceived}
              onChange={(event) => setCashReceived(Number(event.target.value || 0))}
            />
          </label>
        ) : null}

        {method === "mobile_money" ? (
          <div className="momo-payment-wrapper">
            <MobileMoneyPayment
              saleId={null}
              amount={total}
              onSuccess={(paymentData) => {
                setSuccess("Payment successful!");
                setTimeout(() => {
                  onConfirm({
                    method: "mobile_money",
                    amount: Number(total),
                    amountReceived: Number(total),
                    status: "success",
                    reference: paymentData.reference || paymentData
                  });
                }, 500);
              }}
              onCancel={() => {
                onClose();
              }}
              onError={(errorMsg) => {
                setError(errorMsg);
              }}
            />
          </div>
        ) : null}

        {success ? <p className="success-text">{success}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        {method !== "mobile_money" && (
          <>
            <div className="totals">
              <p>
                <span>Total payable</span>
                <strong>{currency(total)}</strong>
              </p>
              {method === "cash" ? (
                <p>
                  <span>Change</span>
                  <strong>{currency(change)}</strong>
                </p>
              ) : null}
            </div>

            <button type="button" className="primary-btn" disabled={processing} onClick={handleConfirm}>
              {confirmLabel}
            </button>
          </>
        )}
      </div>
    </Modal>
  );
};

export default PaymentModal;
