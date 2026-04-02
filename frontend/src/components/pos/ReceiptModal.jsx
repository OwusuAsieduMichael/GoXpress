import jsPDF from "jspdf";
import Modal from "../common/Modal.jsx";
import { currency, dateTime } from "../../utils/format.js";

const paymentMethodLabel = (method) => {
  if (method === "mobile_money") return "Mobile Money";
  if (method === "card") return "Card";
  return "Cash";
};

const ReceiptModal = ({ open, receipt, onClose }) => {
  if (!receipt) return null;

  const onPrint = () => {
    window.print();
  };

  const onDownloadPdf = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(14);
    doc.text("POS RECEIPT", 14, y);
    y += 10;

    doc.setFontSize(10);
    doc.text(`Receipt: ${receipt.id}`, 14, y);
    y += 6;
    doc.text(`Date: ${dateTime(receipt.createdAt)}`, 14, y);
    y += 6;
    doc.text(`Cashier: ${receipt.cashierName ?? "-"}`, 14, y);
    y += 10;

    receipt.items.forEach((item) => {
      doc.text(
        `${item.productName} x${item.quantity} - ${currency(item.subtotal)}`,
        14,
        y
      );
      y += 6;
    });

    y += 6;
    doc.text(`Total: ${currency(receipt.totalAmount)}`, 14, y);
    y += 6;
    doc.text(`Paid: ${currency(receipt.payment.amountReceived)}`, 14, y);
    y += 6;
    doc.text(`Change: ${currency(receipt.payment.changeDue)}`, 14, y);
    y += 6;
    doc.text(`Method: ${paymentMethodLabel(receipt.payment.method)}`, 14, y);

    doc.save(`receipt-${receipt.id}.pdf`);
  };

  return (
    <Modal open={open} title="Receipt" onClose={onClose} width="600px">
      <div className="receipt">
        <p>
          <strong>ID:</strong> {receipt.id}
        </p>
        <p>
          <strong>Date:</strong> {dateTime(receipt.createdAt)}
        </p>
        <p>
          <strong>Customer:</strong> {receipt.customerName ?? "Walk-in"}
        </p>
        <p>
          <strong>Cashier:</strong> {receipt.cashierName}
        </p>
        <p>
          <strong>Payment Method:</strong> {paymentMethodLabel(receipt.payment.method)}
        </p>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item) => (
              <tr key={item.productId}>
                <td>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>{currency(item.unitPrice)}</td>
                <td>{currency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="totals">
          <p>
            <span>Subtotal</span>
            <strong>{currency(receipt.subtotal)}</strong>
          </p>
          <p>
            <span>Discount</span>
            <strong>{currency(receipt.discountAmount)}</strong>
          </p>
          <p>
            <span>Tax</span>
            <strong>{currency(receipt.taxAmount)}</strong>
          </p>
          <p className="grand">
            <span>Total</span>
            <strong>{currency(receipt.totalAmount)}</strong>
          </p>
          <p>
            <span>Paid</span>
            <strong>{currency(receipt.payment.amountReceived)}</strong>
          </p>
          <p>
            <span>Change</span>
            <strong>{currency(receipt.payment.changeDue)}</strong>
          </p>
        </div>

        <div className="actions-row">
          <button type="button" className="ghost-btn" onClick={onPrint}>
            Print
          </button>
          <button type="button" className="primary-btn" onClick={onDownloadPdf}>
            Download PDF
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptModal;
