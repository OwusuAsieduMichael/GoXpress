import { useEffect, useMemo, useState } from "react";
import Modal from "../common/Modal.jsx";
import { currency } from "../../utils/format.js";

const PaymentModal = ({ open, total, onClose, onConfirm }) => {
  const [method, setMethod] = useState("cash");
  const [cashReceived, setCashReceived] = useState(total);
  const [momoPhone, setMomoPhone] = useState("");
  const [momoAmount, setMomoAmount] = useState(total);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (open) {
      setCashReceived(total);
      setMomoAmount(total);
      setMethod("cash");
      setMomoPhone("");
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
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

  const validateCard = () => {
    const normalizedNumber = String(cardNumber || "").replace(/\s+/g, "");
    const normalizedExpiry = String(cardExpiry || "").trim();
    const normalizedCvv = String(cardCvv || "").trim();

    if (!/^\d{12,19}$/.test(normalizedNumber)) {
      return "Enter a valid card number.";
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(normalizedExpiry)) {
      return "Expiry date must be in MM/YY format.";
    }
    if (!/^\d{3,4}$/.test(normalizedCvv)) {
      return "CVV must be 3 or 4 digits.";
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

    if (method === "mobile_money") {
      return {
        method: "mobile_money",
        amount: Number(momoAmount || 0),
        amountReceived: Number(momoAmount || 0),
        status: "success",
        reference: `MOMO-${String(momoPhone || "").slice(-4)}`
      };
    }

    const normalizedNumber = String(cardNumber || "").replace(/\s+/g, "");
    return {
      method: "card",
      amount: Number(total || 0),
      amountReceived: Number(total || 0),
      status: "success",
      reference: `CARD-****${normalizedNumber.slice(-4)}`
    };
  };

  const handleConfirm = async () => {
    setError("");
    setSuccess("");

    const validationError =
      method === "cash" ? validateCash() : method === "mobile_money" ? validateMomo() : validateCard();

    if (validationError) {
      setError(validationError);
      return;
    }

    setProcessing(true);

    try {
      if (method === "mobile_money") {
        setSuccess("Confirming Mobile Money transfer...");
        await new Promise((resolve) => setTimeout(resolve, 900));
        setSuccess("Payment successful.");
      } else if (method === "card") {
        setSuccess("Processing card payment securely...");
        await new Promise((resolve) => setTimeout(resolve, 900));
        setSuccess("Payment successful.");
      }

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
      : method === "mobile_money"
        ? "Confirm Mobile Money"
        : "Confirm Card Payment";

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
          <button
            type="button"
            className={method === "card" ? "payment-tab active" : "payment-tab"}
            onClick={() => setMethod("card")}
            disabled={processing}
          >
            Card
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
          <div className="grid two">
            <label>
              Phone Number
              <input
                type="tel"
                placeholder="024xxxxxxx"
                value={momoPhone}
                onChange={(event) => setMomoPhone(event.target.value)}
              />
            </label>
            <label>
              Amount
              <input
                type="number"
                min={total}
                step="0.01"
                value={momoAmount}
                onChange={(event) => setMomoAmount(Number(event.target.value || 0))}
              />
            </label>
          </div>
        ) : null}

        {method === "card" ? (
          <div className="grid two">
            <label className="payment-card-number">
              Card Number
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="4111 1111 1111 1111"
                value={cardNumber}
                onChange={(event) => setCardNumber(event.target.value)}
              />
            </label>
            <label>
              Expiry Date (MM/YY)
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={(event) => setCardExpiry(event.target.value)}
              />
            </label>
            <label>
              CVV
              <input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                placeholder="123"
                value={cardCvv}
                onChange={(event) => setCardCvv(event.target.value)}
              />
            </label>
          </div>
        ) : null}

        {success ? <p className="success-text">{success}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

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
      </div>
    </Modal>
  );
};

export default PaymentModal;
