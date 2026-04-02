# 🏠 Local Development Guide - Complete Setup

## Why Run Locally?

Running your POS system locally is the BEST way to develop and test:

✅ Instant feedback - no deployment delays
✅ Easy debugging with console logs
✅ Paystack test mode works perfectly
✅ No CORS issues
✅ Free - no hosting costs
✅ Full control over environment

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites

Make sure you have installed:
- Node.js (v18 or higher)
- npm (comes with Node.js)

### Step 1: Start Backend

Open terminal in project root:

```bash
cd backend
npm install  # Only needed first time
npm start
```

**Expected Output:**
```
POS backend running on 0.0.0.0:3000
Database connection established
```

✅ Backend is now running at `http://localhost:3000`

### Step 2: Start Frontend

Open a NEW terminal (keep backend running):

```bash
cd frontend
npm install  # Only needed first time
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

✅ Frontend is now running at `http://localhost:5173`

### Step 3: Open in Browser

Go to: **http://localhost:5173**

You should see your POS landing page!

---

## 💳 Testing Mobile Money Payments Locally

### Your Test Credentials

Your `backend/.env` already has Paystack TEST keys:

```env
PAYSTACK_SECRET_KEY=sk_test_b0f27ce39f928686f54bc538711822357727ee48
PAYSTACK_PUBLIC_KEY=pk_test_a7334eb40d4921b2026793e9ced3006ca298fcf1
```

These are LIVE test keys that work with Paystack's test environment.

### Complete Payment Test Flow

#### 1. Create Account
1. Go to http://localhost:5173
2. Click "Sign Up"
3. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Role: Cashier
4. Click "Sign Up"
5. Login with the credentials

#### 2. Make a Sale
1. Click "POS" in sidebar
2. Add some products to cart
3. Click "Checkout"

#### 3. Test Mobile Money Payment
1. Select "Mobile Money" as payment method
2. Enter test phone number: `0551234567`
3. Click "Charge Customer"

#### 4. What Happens in Test Mode

**Backend will:**
- ✅ Call Paystack API with test credentials
- ✅ Create a transaction reference
- ✅ Return payment initialization data
- ✅ Store payment in database as "pending"

**Frontend will:**
- ✅ Show "Waiting for customer approval..."
- ✅ Poll for payment status
- ⚠️ In test mode, customer won't receive actual MoMo prompt

**To Complete Test Payment:**

You have two options:

**Option A: Use Paystack Dashboard (Recommended)**
1. Go to https://dashboard.paystack.com/
2. Login with your Paystack account
3. Go to "Transactions" → "Test Mode"
4. Find your transaction
5. Click "Mark as Successful"
6. Your app will detect the success!

**Option B: Manual Verification**

Open a new terminal and test the verify endpoint:

```bash
# Get the reference from the payment response
curl http://localhost:3000/api/payments/verify/YOUR_REFERENCE_HERE
```

---

## 🧪 Testing Different Scenarios

### Test Successful Payment

```bash
# In backend terminal, you'll see:
POST /api/payments/momo/initiate 200
GET /api/payments/verify/ref_xxx 200
```

### Test Failed Payment

Use an invalid phone number format:
- Phone: `123` (too short)
- Should show validation error

### Test Network Issues

Stop the backend (Ctrl+C) and try to make a payment:
- Should show "Unable to connect" error
- Restart backend to continue

---

## 🔍 Debugging Tips

### View Backend Logs

Backend terminal shows all API requests:
```
POST /api/auth/signup 201
POST /api/auth/login 200
GET /api/products 200
POST /api/payments/momo/initiate 200
```

### View Frontend Logs

Open browser console (F12):
- Network tab: See all API calls
- Console tab: See any errors

### Check Database

Your app uses Supabase. To view data:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to "Table Editor"
4. View: sales, payments, products, etc.

---

## 🌐 Testing Webhooks Locally

Paystack webhooks need a public URL. For local testing:

### Option 1: Use ngrok (Recommended)

1. Install ngrok: https://ngrok.com/download
2. Start ngrok:
   ```bash
   ngrok http 3000
   ```
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Go to Paystack Dashboard → Settings → Webhooks
5. Add webhook URL: `https://abc123.ngrok.io/api/payments/webhook`
6. Now Paystack can send real webhook events to your local backend!

### Option 2: Skip Webhooks for Now

Webhooks are optional for testing. You can:
- Manually verify payments using the verify endpoint
- Test the full flow in production later

---

## 📁 Project Structure

```
POS PROJECT/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── paymentController.js  ← MoMo payment logic
│   │   ├── services/
│   │   │   └── paystackService.js    ← Paystack API calls
│   │   └── routes/
│   │       └── paymentRoutes.js      ← Payment endpoints
│   ├── .env                          ← Your config (Paystack keys)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── MobileMoneyPayment.jsx  ← MoMo UI
│   │   ├── pages/
│   │   │   └── POS.jsx                 ← POS page
│   │   └── services/
│   │       └── api.js                  ← API client
│   └── package.json
```

---

## 🔧 Common Issues & Fixes

### Issue 1: "Port 3000 already in use"

**Fix:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=3001
```

### Issue 2: "Database connection failed"

**Fix:**
Check `backend/.env` has correct `DATABASE_URL`:
```env
DATABASE_URL=postgresql://postgres.xxx:password@xxx.supabase.com:6543/postgres
```

### Issue 3: "CORS error"

**Fix:**
Make sure `backend/.env` has:
```env
CORS_ORIGIN=http://localhost:5173
```

### Issue 4: Frontend shows "Unable to connect"

**Fix:**
1. Check backend is running (terminal should show "POS backend running")
2. Check `frontend/.env` has:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
3. Restart frontend: Ctrl+C, then `npm run dev`

### Issue 5: "Paystack API error"

**Fix:**
1. Check `backend/.env` has valid Paystack keys
2. Make sure you're using TEST keys (start with `sk_test_`)
3. Check Paystack dashboard for API status

---

## 🎯 Development Workflow

### Making Changes

1. **Edit code** in your IDE
2. **Backend**: Restart server (Ctrl+C, then `npm start`)
3. **Frontend**: Auto-reloads (just save the file)
4. **Test** in browser

### Testing Payment Changes

1. Edit `backend/src/services/paystackService.js`
2. Restart backend
3. Make a test payment
4. Check backend logs for API responses

### Before Deploying

1. Test all features locally
2. Test MoMo payment flow
3. Check for console errors
4. Commit your changes
5. Push to GitHub
6. Deploy to Render/Vercel

---

## 📊 Monitoring Local Development

### Backend Health Check

```bash
curl http://localhost:3000/api/products
```

Should return: `{"message":"No token provided"}` (means API is working)

### Frontend Health Check

Open: http://localhost:5173

Should show landing page

### Database Health Check

```bash
# In backend directory
node -e "require('./src/config/db.js')"
```

Should show: "Database connection established"

---

## 🚀 Next Steps

Once everything works locally:

1. ✅ Test all POS features
2. ✅ Test MoMo payments thoroughly
3. ✅ Add more products
4. ✅ Test different user roles
5. ✅ When ready, deploy to production

---

## 💡 Pro Tips

### Tip 1: Use Two Monitors
- Left: Code editor
- Right: Browser with app open

### Tip 2: Keep Terminals Visible
- Watch backend logs for API calls
- Catch errors immediately

### Tip 3: Use Browser DevTools
- F12 → Network tab: See all API requests
- F12 → Console tab: See errors and logs

### Tip 4: Test with Real Phone Numbers
- Use your actual Ghana phone number
- In test mode, you won't be charged
- See how the flow works

### Tip 5: Check Paystack Dashboard
- View all test transactions
- See payment status
- Debug issues

---

## 📞 Need Help?

If something doesn't work:

1. Check backend terminal for errors
2. Check browser console (F12) for errors
3. Check `backend/.env` has all required variables
4. Make sure both backend and frontend are running
5. Try restarting both servers

---

## ✨ You're All Set!

Your POS system is now running locally with full MoMo payment support. You can:

- ✅ Make sales
- ✅ Process MoMo payments
- ✅ Test the full flow
- ✅ Debug easily
- ✅ Develop new features

When you're ready to go live, just deploy to Render/Vercel and switch to Paystack LIVE keys!

Happy coding! 🎉
