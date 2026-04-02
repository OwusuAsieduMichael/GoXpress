# 🔌 Paystack Integration Example for POS Page

How to integrate the Mobile Money payment component into your existing POS page.

---

## Quick Integration

### Step 1: Import the Component

```javascript
// In your POSSales.jsx or similar file
import MobileMoneyPayment from '../components/MobileMoneyPayment';
```

### Step 2: Add State Management

```javascript
const [showMoMoPayment, setShowMoMoPayment] = useState(false);
const [currentSaleId, setCurrentSaleId] = useState(null);
const [paymentAmount, setPaymentAmount] = useState(0);
```

### Step 3: Handle Payment Method Selection

```javascript
const handlePaymentMethodSelect = (method) => {
  if (method === 'mobile_money' || method === 'momo') {
    // Show Mobile Money payment modal
    setShowMoMoPayment(true);
    setPaymentAmount(calculateTotal());
  } else if (method === 'cash') {
    // Handle cash payment as before
    handleCashPayment();
  } else if (method === 'card') {
    // Handle card payment
    handleCardPayment();
  }
};
```

### Step 4: Render the Component

```javascript
return (
  <div className="pos-container">
    {/* Your existing POS UI */}
    
    {/* Mobile Money Payment Modal */}
    {showMoMoPayment && (
      <div className="payment-modal-overlay">
        <div className="payment-modal">
          <MobileMoneyPayment
            saleId={currentSaleId}
            amount={paymentAmount}
            onSuccess={(reference) => {
              console.log('Payment successful!', reference);
              setShowMoMoPayment(false);
              // Refresh sale data, print receipt, etc.
              handlePaymentSuccess(reference);
            }}
            onCancel={() => {
              setShowMoMoPayment(false);
            }}
          />
        </div>
      </div>
    )}
  </div>
);
```

---

## Complete Example

```javascript
import { useState } from 'react';
import MobileMoneyPayment from '../components/MobileMoneyPayment';
import api from '../api';

const POSSales = () => {
  const [cart, setCart] = useState([]);
  const [showMoMoPayment, setShowMoMoPayment] = useState(false);
  const [currentSaleId, setCurrentSaleId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const createSale = async () => {
    try {
      const response = await api.post('/sales', {
        items: cart,
        customerId: selectedCustomer?.id,
        totalAmount: calculateTotal(),
        paymentMethod: paymentMethod
      });
      
      return response.data.sale.id;
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  };

  const handleCheckout = async (method) => {
    setPaymentMethod(method);
    
    try {
      // Create the sale first
      const saleId = await createSale();
      setCurrentSaleId(saleId);
      
      if (method === 'mobile_money' || method === 'momo') {
        // Show Mobile Money payment
        setShowMoMoPayment(true);
      } else if (method === 'cash') {
        // Handle cash payment
        await handleCashPayment(saleId);
      } else if (method === 'card') {
        // Handle card payment
        await handleCardPayment(saleId);
      }
    } catch (error) {
      alert('Error processing checkout: ' + error.message);
    }
  };

  const handlePaymentSuccess = async (reference) => {
    try {
      // Verify payment
      const response = await api.get(`/payments/verify/${reference}`);
      
      if (response.data.success) {
        // Payment successful
        alert('Payment successful! 🎉');
        
        // Print receipt
        printReceipt(currentSaleId);
        
        // Clear cart
        setCart([]);
        setCurrentSaleId(null);
        setShowMoMoPayment(false);
        
        // Refresh sales list
        fetchSales();
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Error verifying payment. Please check payment status.');
    }
  };

  const handleCashPayment = async (saleId) => {
    // Your existing cash payment logic
    const amountReceived = prompt('Enter amount received:');
    
    try {
      await api.post('/payments', {
        saleId: saleId,
        amount: calculateTotal(),
        amountReceived: parseFloat(amountReceived),
        paymentMethod: 'cash',
        status: 'completed'
      });
      
      alert('Cash payment recorded!');
      setCart([]);
    } catch (error) {
      alert('Error recording payment: ' + error.message);
    }
  };

  return (
    <div className="pos-container">
      {/* Product Selection */}
      <div className="pos-products">
        {/* Your product grid */}
      </div>

      {/* Cart */}
      <div className="pos-cart">
        <h3>Cart</h3>
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <span>{item.name}</span>
            <span>GH₵ {item.price}</span>
            <span>x {item.quantity}</span>
          </div>
        ))}
        
        <div className="cart-total">
          <strong>Total: GH₵ {calculateTotal().toFixed(2)}</strong>
        </div>

        {/* Payment Method Selection */}
        <div className="payment-methods">
          <button 
            onClick={() => handleCheckout('cash')}
            className="payment-btn cash-btn"
          >
            💵 Cash
          </button>
          <button 
            onClick={() => handleCheckout('mobile_money')}
            className="payment-btn momo-btn"
          >
            📱 Mobile Money
          </button>
          <button 
            onClick={() => handleCheckout('card')}
            className="payment-btn card-btn"
          >
            💳 Card
          </button>
        </div>
      </div>

      {/* Mobile Money Payment Modal */}
      {showMoMoPayment && (
        <div className="payment-modal-overlay" onClick={() => setShowMoMoPayment(false)}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <MobileMoneyPayment
              saleId={currentSaleId}
              amount={calculateTotal()}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setShowMoMoPayment(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default POSSales;
```

---

## Modal Overlay Styles

Add these styles to your `global.css`:

```css
.payment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.payment-modal {
  background: var(--panel);
  border-radius: 16px;
  padding: 0;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.payment-methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.payment-btn {
  padding: 16px 24px;
  border: 2px solid var(--border);
  border-radius: 8px;
  background: var(--panel);
  color: var(--text);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.momo-btn:hover {
  border-color: var(--brand);
  background: rgba(255, 141, 47, 0.1);
}

.cash-btn:hover {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.card-btn:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}
```

---

## API Endpoints Reference

### Initiate Mobile Money Payment
```javascript
POST /api/payments/momo/initiate

Body:
{
  "saleId": 123,
  "amount": 50.00,
  "phone": "0244123456",
  "email": "customer@example.com" // optional
}

Response:
{
  "success": true,
  "message": "Mobile Money payment initiated...",
  "payment": {
    "id": 456,
    "reference": "GXP-1234567890-ABC123",
    "status": "pending",
    "amount": 50.00
  }
}
```

### Verify Payment
```javascript
GET /api/payments/verify/:reference

Response:
{
  "success": true,
  "status": "success",
  "payment": {
    "reference": "GXP-1234567890-ABC123",
    "amount": 50.00,
    "status": "completed",
    "paidAt": "2026-04-01T10:30:00Z",
    "channel": "mobile_money",
    "customer": {
      "email": "customer@example.com",
      "phone": "+233244123456"
    }
  }
}
```

### Check Payment Status (Polling)
```javascript
GET /api/payments/status/:reference

Response:
{
  "success": true,
  "status": "pending", // or "completed", "failed"
  "amount": 50.00,
  "paymentMethod": "mobile_money",
  "lastUpdated": "2026-04-01T10:30:00Z"
}
```

---

## Testing Checklist

- [ ] Import component successfully
- [ ] Modal opens when Mobile Money selected
- [ ] Phone number validation works
- [ ] Payment initiates successfully
- [ ] Pending state shows correctly
- [ ] Status polling works
- [ ] Success state displays
- [ ] Failed state handles errors
- [ ] Cancel button works
- [ ] Modal closes after success
- [ ] Cart clears after payment
- [ ] Receipt prints correctly

---

## Common Customizations

### Custom Success Callback
```javascript
onSuccess={(reference) => {
  // Custom logic
  showNotification('Payment received!');
  sendReceiptEmail(reference);
  updateInventory();
  logTransaction(reference);
}}
```

### Custom Styling
```javascript
<MobileMoneyPayment
  saleId={currentSaleId}
  amount={paymentAmount}
  onSuccess={handleSuccess}
  onCancel={handleCancel}
  className="custom-momo-payment" // Add custom class
/>
```

### Pre-fill Customer Data
```javascript
<MobileMoneyPayment
  saleId={currentSaleId}
  amount={paymentAmount}
  defaultPhone={customer.phone} // Pre-fill phone
  defaultEmail={customer.email} // Pre-fill email
  onSuccess={handleSuccess}
  onCancel={handleCancel}
/>
```

---

**Need help?** Check `PAYSTACK_SETUP_GUIDE.md` for detailed setup instructions!
