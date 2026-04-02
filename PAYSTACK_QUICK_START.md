# ⚡ Paystack Mobile Money - Quick Start

Get Mobile Money payments working in 5 minutes!

---

## 🎯 Prerequisites

- ✅ Backend running (`npm start` in `backend/`)
- ✅ Frontend running (`npm run dev` in `frontend/`)
- ✅ Paystack account (create at https://paystack.com)

---

## 🚀 5-Minute Setup

### Step 1: Get Paystack Test Keys (2 minutes)

1. Go to https://paystack.com and sign up
2. Go to **Settings** → **API Keys & Webhooks**
3. Copy your **Test Secret Key** (starts with `sk_test_`)
4. Copy your **Test Public Key** (starts with `pk_test_`)

### Step 2: Add Keys to Environment (1 minute)

Edit `backend/.env`:

```env
PAYSTACK_SECRET_KEY=sk_test_paste_your_key_here
PAYSTACK_PUBLIC_KEY=pk_test_paste_your_key_here
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret_here
```

### Step 3: Run Database Migration (1 minute)

```bash
# Option 1: Using psql
psql "your-supabase-connection-string"
\i backend/sql/012_update_payments_for_paystack.sql

# Option 2: Using Supabase SQL Editor
# 1. Go to Supabase project → SQL Editor
# 2. Copy contents of backend/sql/012_update_payments_for_paystack.sql
# 3. Paste and run
```

### Step 4: Restart Backend (30 seconds)

```bash
# Stop backend (Ctrl+C)
# Start again
cd backend
npm start
```

### Step 5: Test Payment (30 seconds)

1. Open your POS page
2. Add items to cart
3. Select "Mobile Money" payment
4. Enter test phone: `0551234567`
5. Click "Charge Customer"
6. Watch it approve automatically! ✅

---

## 🧪 Test Phone Numbers

Paystack provides these test numbers (auto-approve in test mode):

```
MTN:        0551234567
Vodafone:   0201234567
AirtelTigo: 0271234567
```

---

## ✅ Verification Checklist

- [ ] Paystack keys added to `.env`
- [ ] Backend restarted
- [ ] Database migration run
- [ ] Test payment successful
- [ ] Payment status updates automatically
- [ ] Success message shows

---

## 🎉 You're Done!

Mobile Money payments are now working!

**Next Steps**:
- Read `PAYSTACK_SETUP_GUIDE.md` for production setup
- Read `PAYSTACK_INTEGRATION_EXAMPLE.md` to integrate into your POS
- Test with different amounts and scenarios

---

## 🐛 Quick Troubleshooting

**"Paystack is not configured"**
```bash
# Check if keys are set
cat backend/.env | grep PAYSTACK

# If empty, add keys and restart backend
```

**"Invalid phone number"**
```
Use format: 0XXXXXXXXX (10 digits)
Example: 0244123456
```

**"Payment not updating"**
```
# Check backend logs
# Payment should update within 3-5 seconds in test mode
```

---

## 📚 Full Documentation

- **Complete Setup**: `PAYSTACK_SETUP_GUIDE.md`
- **Integration Guide**: `PAYSTACK_INTEGRATION_EXAMPLE.md`
- **Implementation Details**: `PAYSTACK_IMPLEMENTATION_SUMMARY.md`

---

**Need Help?** Check the full guides or contact Paystack support!

🚀 Happy coding!
