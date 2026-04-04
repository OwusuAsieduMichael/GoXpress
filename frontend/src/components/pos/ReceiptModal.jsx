import jsPDF from "jspdf";
import Modal from "../common/Modal.jsx";
import { currency, dateTime } from "../../utils/format.js";

// Custom currency formatter for PDF (to ensure proper symbol display)
const currencyForPdf = (value) => {
  const amount = Number(value || 0).toFixed(2);
  return `GH₵${amount}`;
};

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
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Add logo (centered)
    const logoImg = new Image();
    logoImg.src = '/logo.png';
    
    // Try to add logo, but continue if it fails
    try {
      doc.addImage(logoImg, 'PNG', (pageWidth - 30) / 2, y, 30, 15);
      y += 20;
    } catch (e) {
      // Logo failed to load, continue without it
      y += 5;
    }

    // Company name and subtitle (centered)
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text("GoXpress POS", pageWidth / 2, y, { align: 'center' });
    y += 6;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text("Point of Sale System", pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Divider line
    doc.setLineWidth(0.5);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    // Receipt details
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text("Receipt #:", 14, y);
    doc.setFont(undefined, 'normal');
    doc.text(receipt.id, 50, y);
    y += 6;

    doc.setFont(undefined, 'bold');
    doc.text("Date:", 14, y);
    doc.setFont(undefined, 'normal');
    doc.text(dateTime(receipt.createdAt), 50, y);
    y += 6;

    doc.setFont(undefined, 'bold');
    doc.text("Customer:", 14, y);
    doc.setFont(undefined, 'normal');
    doc.text(receipt.customerName ?? "Walk-in", 50, y);
    y += 6;

    doc.setFont(undefined, 'bold');
    doc.text("Cashier:", 14, y);
    doc.setFont(undefined, 'normal');
    doc.text(receipt.cashierName, 50, y);
    y += 6;

    doc.setFont(undefined, 'bold');
    doc.text("Payment Method:", 14, y);
    doc.setFont(undefined, 'normal');
    doc.text(paymentMethodLabel(receipt.payment.method), 50, y);
    y += 8;

    // Divider line
    doc.setLineWidth(0.3);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    // Items table header
    doc.setFont(undefined, 'bold');
    doc.text("Item", 14, y);
    doc.text("Qty", 110, y);
    doc.text("Unit", 135, y);
    doc.text("Total", 170, y, { align: 'right' });
    y += 6;

    // Items
    doc.setFont(undefined, 'normal');
    receipt.items.forEach((item) => {
      doc.text(item.productName, 14, y);
      doc.text(item.quantity.toString(), 110, y);
      doc.text(currencyForPdf(item.unitPrice), 135, y);
      doc.text(currencyForPdf(item.subtotal), 170, y, { align: 'right' });
      y += 6;
    });

    y += 4;
    // Divider line
    doc.setLineWidth(0.3);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    // Totals
    doc.text("Subtotal", 14, y);
    doc.text(currencyForPdf(receipt.subtotal), 170, y, { align: 'right' });
    y += 6;

    doc.text("Discount", 14, y);
    doc.text(currencyForPdf(receipt.discountAmount), 170, y, { align: 'right' });
    y += 6;

    doc.text("Tax", 14, y);
    doc.text(currencyForPdf(receipt.taxAmount), 170, y, { align: 'right' });
    y += 6;

    doc.setFont(undefined, 'bold');
    doc.text("Total", 14, y);
    doc.text(currencyForPdf(receipt.totalAmount), 170, y, { align: 'right' });
    y += 6;

    doc.setFont(undefined, 'normal');
    doc.text("Paid", 14, y);
    doc.text(currencyForPdf(receipt.payment.amountReceived), 170, y, { align: 'right' });
    y += 6;

    doc.text("Change", 14, y);
    doc.text(currencyForPdf(receipt.payment.changeDue), 170, y, { align: 'right' });
    y += 10;

    // Divider line
    doc.setLineWidth(0.5);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    // Footer
    doc.setFontSize(11);
    doc.text("Thank you for your business!", pageWidth / 2, y, { align: 'center' });
    y += 5;
    
    doc.setFontSize(9);
    doc.text("Visit us again soon", pageWidth / 2, y, { align: 'center' });

    doc.save(`receipt-${receipt.id}.pdf`);
  };

  return (
    <Modal open={open} title="Receipt" onClose={onClose} width="600px">
      <div className="receipt">
        <div className="receipt-header">
          <img 
            src="/logo.png" 
            alt="GoXpress Logo" 
            className="receipt-logo"
            style={{ width: '120px', height: 'auto', marginBottom: '16px' }}
          />
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>GoXpress POS</h2>
          <p style={{ margin: '0 0 16px 0', color: '#666' }}>Point of Sale System</p>
        </div>
        
        <div className="receipt-divider" style={{ borderTop: '2px solid #000', margin: '16px 0' }}></div>
        
        <p>
          <strong>Receipt #:</strong> {receipt.id}
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

        <div className="receipt-divider" style={{ borderTop: '1px solid #ddd', margin: '16px 0' }}></div>

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

        <div className="receipt-divider" style={{ borderTop: '2px solid #000', margin: '16px 0' }}></div>
        
        <div className="receipt-footer" style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>Thank you for your business!</p>
          <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>Visit us again soon</p>
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
