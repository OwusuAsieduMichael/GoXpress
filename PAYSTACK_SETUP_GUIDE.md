# 💳 Paystack Mobile Money Integration Guide

Complete guide to setting up real Mobile Money payments with Paystack in GoXpress.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Paystack Account Setup](#paystack-account-setup)
3. [Database Migration](#database-migration)
4. [Environment Configuration](#environment-configuration)
5. [Testing the Integration](#testing-the-integration)
6. [Going Live](#going-live)
7. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

Before starting, ensure you have:
- ✅ A Ghanaian business or personal account
- ✅ Valid identification (Ghana Card, Passport, or Driver's License)
- ✅ Business registration documents (for business accounts)
- ✅ Bank account details
- ✅ Mobile Money account (MTN, Vodafone, or AirtelTigo)

---

## 2. Paystack Account Setup

### Step 1: Create Paystack Account

1. Go to https://paystack.com
2. Click "Get Started" or "Sign Up"
3. Fill in your details:
   - Business name: "GoXpress POS" (or your business name)
   - Email address
   - Password
4. Verify your email address

### Step 2: Complete KYC (Know Your Customer)

1. Log in to your Paystack dashboard
2. Go to **Settings** → **Account**
3. Complete business verification:
   - Upload business registration documents
   - Provide business address
   - Add bank account details
4. Wait for approval (usually 1-3 business days)

### Step 3: Get API Keys

1. Go to **Settings** → **API Keys & Webhooks**
2. You'll see two sets of keys:
   - **Test Keys** (for development)
   - **Live Keys** (for production)

3. Copy your **Test Secret Key** (starts with `sk_test_`)
4. Copy your **Test Public Key** (starts with `pk_test_`)

**⚠️ IMPORTANT**: Never share your secret keys or commit them to Git!

### Step 4: Setup Webhook

1. Still in **API Keys & Webhooks** section
2. Scroll to "Webhook URL"
3. Enter your webhook URL:
   - **Development**: `http://localhost:5000/api/payments/webhook`
   - **Production**: `https://your-domain.com/api/payments/webhook`
4. Click "Save"
5. Copy the **Webhook Secret** (you'll need this)

---

## 3. Database Migration

Run the Paystack database migration:

```bash
# Connect to your Supabase database
psql "your-database-connection-string"

# Run the migration
\i backend/sql/012_update_payments_for_paystack.sql
```

Or using Supabase SQL Editor:
1. Go to your Supabase project
2. Click "SQL Editor"
3. Copy contents of `backend/sql/012_update_payments_for_paystack.sql`
4. Paste and run

**What this does**:
- Adds `reference` column for Paystack transaction reference
- Adds `provider` column (paystack, manual, etc.)
- Adds `provider_response` column for full Paystack response
- Adds `customer_phone` and `customer_email` columns
- Adds indexes for faster lookups

---

## 4. Environment Configuration

### Backend Configuration

Edit `backend/.env`:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_actual_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_actual_public_key_here
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret_here
```

**How to get these**:
1. **Secret Key**: Paystack Dashboard → Settings → API Keys → Test Secret Key
2. **Public Key**: Paystack Dashboard → Settings → API Keys → Test Public Key
3. **Webhook Secret**: Paystack Dashboard → Settings → API Keys → Webhook Secret

### Frontend Configuration

No changes needed! The frontend uses the backend API.

---

## 5. Testing the Integration

### Test Mode (Using Paystack Test Keys)

Paystack provides test phone numbers for testing:

**Test Phone Numbers**:
- MTN: `0551234567`
- Vodafone: `0201234567`
- AirtelTigo: `0271234567`

**Test Flow**:

1. **Start your servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Create a sale in POS**:
   - Add products to cart
   - Select customer
   - Click "Checkout"

3. **Select Mobile Money payment**:
   - Enter test phone number: `0551234567`
   - Enter amount
   - Click "Charge Customer"

4. **Simulate approval**:
   - In test mode, Paystack automatically approves after a few seconds
   - Watch the status change from "pending" to "success"

5. **Verify in database**:
   ```sql
   SELECT * FROM payments WHERE provider = 'paystack' ORDER BY created_at DESC LIMIT 1;
   ```

### Test Scenarios

**Successful Payment**:
```javascript
Phone: 0551234567
Amount: 50.00
Expected: Payment succeeds after 3-5 seconds
```

**Failed Payment**:
```javascript
Phone: 0551234568 (invalid test number)
Amount: 50.00
Expected: Payment fails immediately
```

**Timeout**:
```javascript
// Payment will timeout after 5 minutes if not approved
```

---

## 6. Going Live

### Prerequisites for Live Mode

1. ✅ Paystack account fully verified
2. ✅ Business documents approved
3. ✅ Bank account linked
4. ✅ Test transactions successful
5. ✅ Webhook tested and working

### Switch to Live Keys

1. **Get Live Keys**:
   - Go to Paystack Dashboard → Settings → API Keys
   - Switch to "Live" tab
   - Copy Live Secret Key (starts with `sk_live_`)
   - Copy Live Public Key (starts with `pk_live_`)

2. **Update Production Environment**:
   ```env
   # Production .env
   PAYSTACK_SECRET_KEY=sk_live_your_actual_live_key_here
   PAYSTACK_PUBLIC_KEY=pk_live_your_actual_live_key_here
   PAYSTACK_WEBHOOK_SECRET=your_live_webhook_secret_here
   ```

3. **Update Webhook URL**:
   - Go to Paystack Dashboard → Settings → API Keys
   - Update webhook URL to your production URL
   - Example: `https://api.goxpress.com/api/payments/webhook`

4. **Test with Real Money**:
   - Start with small amounts (GH₵ 1.00)
   - Use your own phone number
   - Verify payment completes successfully
   - Check database records

### Production Checklist

- [ ] Live API keys configured
- [ ] Webhook URL updated to production
- [ ] SSL certificate active (HTTPS)
- [ ] Database backups enabled
- [ ] Error monitoring setup (Sentry, etc.)
- [ ] Test transaction successful
- [ ] Customer support ready
- [ ] Refund process documented

---

## 7. Troubleshooting

### Common Issues

#### Issue: "Paystack is not configured"

**Solution**:
```bash
# Check if environment variables are set
echo $PAYSTACK_SECRET_KEY

# If empty, add to .env file
PAYSTACK_SECRET_KEY=sk_test_your_key_here
```

#### Issue: "Invalid phone number format"

**Solution**:
- Phone must be 10 digits
- Must start with 0
- Valid prefixes: 024, 054, 055, 059 (MTN), 020, 050 (Vodafone), 027, 057 (AirtelTigo)
- Example: `0244123456`

#### Issue: "Webhook not receiving events"

**Solution**:
1. Check webhook URL is correct
2. Ensure webhook endpoint is publicly accessible
3. Verify webhook secret matches
4. Check server logs for incoming requests
5. Use ngrok for local testing:
   ```bash
   ngrok http 5000
   # Use ngrok URL as webhook: https://abc123.ngrok.io/api/payments/webhook
   ```

#### Issue: "Payment stuck in pending"

**Possible causes**:
1. Customer didn't approve on phone
2. Insufficient balance
3. Network issues
4. Webhook not configured

**Solution**:
- Check Paystack dashboard for transaction status
- Manually verify transaction:
  ```bash
  GET /api/payments/verify/:reference
  ```

#### Issue: "Amount mismatch"

**Solution**:
- Paystack uses pesewas (smallest unit)
- GH₵ 50.00 = 5000 pesewas
- Backend automatically converts (amount × 100)

### Testing Webhooks Locally

Use ngrok to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok
ngrok http 5000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update Paystack webhook URL to: https://abc123.ngrok.io/api/payments/webhook
```

### Verify Webhook Signature

The webhook handler automatically verifies signatures. To test manually:

```javascript
import crypto from 'crypto';

const signature = req.headers['x-paystack-signature'];
const body = JSON.stringify(req.body);
const secret = process.env.PAYSTACK_WEBHOOK_SECRET;

const hash = crypto
  .createHmac('sha512', secret)
  .update(body)
  .digest('hex');

if (hash === signature) {
  console.log('✅ Valid signature');
} else {
  console.log('❌ Invalid signature');
}
```

---

## 📊 Payment Flow Diagram

```
┌─────────────┐
│   Cashier   │
│  Selects    │
│ Mobile Money│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Enters    │
│   Phone &   │
│   Amount    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Backend   │
│   Calls     │
│  Paystack   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Customer   │
│  Receives   │
│ MoMo Prompt │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Customer   │
│  Approves   │
│  Payment    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Paystack   │
│   Sends     │
│  Webhook    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Backend   │
│   Updates   │
│  Database   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Frontend   │
│   Shows     │
│  Success    │
└─────────────┘
```

---

## 🔐 Security Best Practices

1. **Never expose secret keys**:
   - Don't commit to Git
   - Don't log in console
   - Don't send to frontend

2. **Always verify webhooks**:
   - Check signature
   - Verify transaction with Paystack
   - Prevent replay attacks

3. **Validate all inputs**:
   - Phone number format
   - Amount is positive
   - Sale exists

4. **Use HTTPS in production**:
   - Webhook URL must be HTTPS
   - API calls are encrypted

5. **Monitor transactions**:
   - Set up alerts for failed payments
   - Track unusual patterns
   - Regular reconciliation

---

## 📞 Support

**Paystack Support**:
- Email: support@paystack.com
- Phone: +234 1 888 3888
- Docs: https://paystack.com/docs

**GoXpress Support**:
- Check logs: `backend/logs/`
- Database: Check `payments` table
- API: Test endpoints with Postman

---

## 🎉 Success Checklist

- [ ] Paystack account created and verified
- [ ] API keys obtained and configured
- [ ] Database migration completed
- [ ] Test payment successful
- [ ] Webhook receiving events
- [ ] Frontend showing payment status
- [ ] Error handling working
- [ ] Ready for production!

---

**Last Updated**: April 1, 2026  
**Version**: 1.0  
**Status**: Production Ready 🚀
