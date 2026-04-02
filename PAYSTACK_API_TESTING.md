# 🧪 Paystack API Testing Guide

Test your Paystack integration using these API calls.

---

## 🔧 Tools Needed

- **Postman** (recommended): https://www.postman.com/downloads/
- **cURL** (command line)
- **Thunder Client** (VS Code extension)
- **REST Client** (VS Code extension)

---

## 🔑 Authentication

All protected endpoints require a JWT token.

### Get Token (Login First)

```bash
POST http://localhost:5000/api/auth/login

Body:
{
  "username": "admin",
  "password": "your_password",
  "role": "admin"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

Copy the token and use it in subsequent requests:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📱 Mobile Money Endpoints

### 1. Initiate Mobile Money Payment

```bash
POST http://localhost:5000/api/payments/momo/initiate
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "saleId": 1,
  "amount": 50.00,
  "phone": "0551234567",
  "email": "customer@example.com"
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Mobile Money payment initiated. Customer will receive a prompt on their phone.",
  "payment": {
    "id": 123,
    "reference": "GXP-1711234567890-ABC123",
    "status": "pending",
    "amount": 50.00,
    "accessCode": "abc123xyz",
    "authorizationUrl": "https://checkout.paystack.com/abc123xyz"
  }
}
```

**Copy the `reference`** for next steps!

---

### 2. Check Payment Status (Polling)

```bash
GET http://localhost:5000/api/payments/status/GXP-1711234567890-ABC123
Authorization: Bearer YOUR_TOKEN
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "status": "pending",  // or "completed", "failed"
  "amount": 50.00,
  "paymentMethod": "mobile_money",
  "lastUpdated": "2026-04-01T10:30:00Z"
}
```

**Poll this endpoint every 3 seconds** until status changes to "completed" or "failed".

---

### 3. Verify Payment

```bash
GET http://localhost:5000/api/payments/verify/GXP-1711234567890-ABC123
Authorization: Bearer YOUR_TOKEN
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "status": "success",
  "payment": {
    "reference": "GXP-1711234567890-ABC123",
    "amount": 50.00,
    "status": "completed",
    "paidAt": "2026-04-01T10:30:00Z",
    "channel": "mobile_money",
    "customer": {
      "email": "customer@example.com",
      "phone": "+233551234567"
    }
  },
  "message": "Payment verified successfully"
}
```

---

### 4. Get Payment by Sale ID

```bash
GET http://localhost:5000/api/payments/sale/1
Authorization: Bearer YOUR_TOKEN
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "payment": {
    "id": 123,
    "sale_id": 1,
    "amount": "50.00",
    "payment_method": "mobile_money",
    "status": "completed",
    "reference": "GXP-1711234567890-ABC123",
    "customer_phone": "0551234567",
    "customer_email": "customer@example.com",
    "provider": "paystack",
    "created_at": "2026-04-01T10:30:00Z",
    "updated_at": "2026-04-01T10:31:00Z"
  }
}
```

---

## 🔔 Webhook Testing

### Simulate Webhook (For Testing)

```bash
POST http://localhost:5000/api/payments/webhook
Content-Type: application/json
x-paystack-signature: YOUR_WEBHOOK_SIGNATURE

{
  "event": "charge.success",
  "data": {
    "reference": "GXP-1711234567890-ABC123",
    "amount": 5000,
    "currency": "GHS",
    "status": "success",
    "paid_at": "2026-04-01T10:30:00Z",
    "channel": "mobile_money",
    "customer": {
      "email": "customer@example.com",
      "phone": "+233551234567"
    }
  }
}
```

**Note**: Webhook signature verification is required. In production, Paystack sends this automatically.

---

## 📋 Complete Test Flow

### Step-by-Step Test

1. **Create a Sale** (if you don't have one):
```bash
POST http://localhost:5000/api/sales
Authorization: Bearer YOUR_TOKEN

{
  "customerId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 25.00
    }
  ],
  "totalAmount": 50.00,
  "paymentMethod": "mobile_money"
}

# Copy the sale ID from response
```

2. **Initiate Payment**:
```bash
POST http://localhost:5000/api/payments/momo/initiate
Authorization: Bearer YOUR_TOKEN

{
  "saleId": 1,  # Use sale ID from step 1
  "amount": 50.00,
  "phone": "0551234567"
}

# Copy the reference from response
```

3. **Poll Status** (every 3 seconds):
```bash
GET http://localhost:5000/api/payments/status/GXP-...
Authorization: Bearer YOUR_TOKEN

# Repeat until status is "completed" or "failed"
```

4. **Verify Payment**:
```bash
GET http://localhost:5000/api/payments/verify/GXP-...
Authorization: Bearer YOUR_TOKEN

# Confirm payment is successful
```

5. **Check Database**:
```sql
SELECT * FROM payments WHERE reference = 'GXP-...';
SELECT * FROM sales WHERE id = 1;
```

---

## 🧪 Test Scenarios

### Scenario 1: Successful Payment

```bash
# 1. Initiate with test phone
Phone: 0551234567
Amount: 50.00

# 2. Expected: Auto-approves in 3-5 seconds (test mode)
# 3. Status changes: pending → completed
# 4. Sale status updates to "completed"
```

### Scenario 2: Invalid Phone Number

```bash
# 1. Initiate with invalid phone
Phone: 1234567890  # Wrong format

# 2. Expected: Error response
{
  "success": false,
  "message": "Invalid phone number format"
}
```

### Scenario 3: Payment Timeout

```bash
# 1. Initiate payment
# 2. Don't approve on phone
# 3. Wait 5 minutes
# 4. Expected: Status remains "pending"
# 5. Frontend shows timeout message
```

### Scenario 4: Duplicate Payment

```bash
# 1. Initiate payment for sale ID 1
# 2. Try to initiate again for same sale ID
# 3. Expected: Error response
{
  "success": false,
  "message": "Payment already completed for this sale"
}
```

---

## 📊 Postman Collection

### Import This Collection

```json
{
  "info": {
    "name": "GoXpress Paystack API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"admin\",\n  \"password\": \"password\",\n  \"role\": \"admin\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:5000/api/auth/login",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "auth", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "Payments",
      "item": [
        {
          "name": "Initiate MoMo",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}",
                "type": "text"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"saleId\": 1,\n  \"amount\": 50.00,\n  \"phone\": \"0551234567\",\n  \"email\": \"customer@example.com\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:5000/api/payments/momo/initiate",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "payments", "momo", "initiate"]
            }
          }
        },
        {
          "name": "Check Status",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}",
                "type": "text"
              }
            ],
            "url": {
              "raw": "http://localhost:5000/api/payments/status/{{reference}}",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "payments", "status", "{{reference}}"]
            }
          }
        },
        {
          "name": "Verify Payment",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}",
                "type": "text"
              }
            ],
            "url": {
              "raw": "http://localhost:5000/api/payments/verify/{{reference}}",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "payments", "verify", "{{reference}}"]
            }
          }
        }
      ]
    }
  ]
}
```

**To use**:
1. Copy the JSON above
2. Open Postman
3. Click "Import" → "Raw text"
4. Paste and import
5. Set variables: `token`, `reference`

---

## 🔍 Debugging Tips

### Check Backend Logs

```bash
# Watch backend logs in real-time
cd backend
npm start

# Look for:
# - "📥 Webhook received: charge.success"
# - "✅ Payment completed: GXP-..."
# - "❌ Payment failed: GXP-..."
```

### Check Database

```sql
-- Check payment record
SELECT * FROM payments 
WHERE reference = 'GXP-1711234567890-ABC123';

-- Check sale status
SELECT s.*, p.status as payment_status, p.reference
FROM sales s
LEFT JOIN payments p ON p.sale_id = s.id
WHERE s.id = 1;

-- Check recent payments
SELECT * FROM payments 
WHERE provider = 'paystack' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check Paystack Dashboard

1. Go to https://dashboard.paystack.com
2. Click "Transactions"
3. Search for your reference
4. View transaction details
5. Check webhook delivery

---

## ✅ Success Criteria

Your integration is working if:

- [ ] Initiate endpoint returns `success: true`
- [ ] Reference is generated (format: `GXP-TIMESTAMP-RANDOM`)
- [ ] Payment record created in database with status "pending"
- [ ] Status endpoint returns current status
- [ ] Status changes from "pending" to "completed" (test mode: 3-5 seconds)
- [ ] Verify endpoint confirms payment success
- [ ] Sale status updates to "completed"
- [ ] Webhook receives `charge.success` event
- [ ] Database has complete payment record

---

## 🚨 Common Errors

### Error: "Paystack is not configured"
**Fix**: Add `PAYSTACK_SECRET_KEY` to `backend/.env`

### Error: "Sale not found"
**Fix**: Create a sale first or use existing sale ID

### Error: "Invalid phone number format"
**Fix**: Use format `0XXXXXXXXX` (10 digits, starts with 0)

### Error: "Amount must match sale total"
**Fix**: Ensure payment amount equals sale total_amount

### Error: "Payment already completed"
**Fix**: This sale already has a completed payment

---

## 📞 Need Help?

- **Paystack Docs**: https://paystack.com/docs
- **Paystack Support**: support@paystack.com
- **Setup Guide**: `PAYSTACK_SETUP_GUIDE.md`
- **Integration Guide**: `PAYSTACK_INTEGRATION_EXAMPLE.md`

---

**Happy Testing!** 🚀
