# 🚀 Local Development - Quick Start

## Start Your App (2 Commands)

### Terminal 1 - Backend
```bash
cd backend
npm start
```
✅ Running at: http://localhost:3000

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
✅ Running at: http://localhost:5173

---

## Open App

Go to: **http://localhost:5173**

---

## Test MoMo Payment

1. **Sign up** → Create account
2. **Login** → Use your credentials
3. **POS** → Add products to cart
4. **Checkout** → Select "Mobile Money"
5. **Enter phone**: `0551234567`
6. **Charge** → Click "Charge Customer"

### What Happens:
- ✅ Paystack API called (test mode)
- ✅ Transaction created
- ✅ Payment stored in database
- ⚠️ No real MoMo prompt (test mode)

### Complete Test Payment:
1. Go to https://dashboard.paystack.com/
2. Transactions → Test Mode
3. Find your transaction
4. Mark as "Successful"
5. Your app updates automatically!

---

## Your Test Keys (Already Configured)

```env
PAYSTACK_SECRET_KEY=sk_test_b0f27ce39f928686f54bc538711822357727ee48
PAYSTACK_PUBLIC_KEY=pk_test_a7334eb40d4921b2026793e9ced3006ca298fcf1
```

These work perfectly for local testing!

---

## Troubleshooting

### Backend won't start?
```bash
cd backend
npm install
npm start
```

### Frontend won't start?
```bash
cd frontend
npm install
npm run dev
```

### Can't connect?
- Make sure BOTH terminals are running
- Check backend shows: "POS backend running on 0.0.0.0:3000"
- Check frontend shows: "Local: http://localhost:5173/"

---

## Stop Servers

Press `Ctrl + C` in each terminal

---

## Why Local is Better for Testing

✅ Instant changes - no deployment
✅ Easy debugging - see all logs
✅ Free - no hosting costs
✅ Full control - test everything
✅ Paystack test mode works perfectly

---

## When Ready for Production

1. Test everything locally first
2. Push code to GitHub
3. Deploy backend to Render
4. Deploy frontend to Vercel
5. Switch to Paystack LIVE keys

---

**Need detailed guide?** See `LOCAL_DEVELOPMENT_GUIDE.md`
