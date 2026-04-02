# 🔴 Switch to LIVE Mode - Instructions

## ✅ You're Ready!

You've completed Paystack business verification and have your LIVE API keys. Now let's enable REAL MoMo payments!

---

## 📝 Step-by-Step Instructions

### Step 1: Get Your LIVE Keys from Paystack

1. Go to: https://dashboard.paystack.com/
2. Login to your account
3. Click **"Settings"** (bottom left)
4. Click **"API Keys & Webhooks"**
5. **Toggle to "LIVE" mode** (switch at the top)
6. You'll see:
   - **Secret Key**: `sk_live_xxxxxxxxxxxxxxxxxxxxx`
   - **Public Key**: `pk_live_xxxxxxxxxxxxxxxxxxxxx`

⚠️ Keep these keys SECRET! Never share them or commit to GitHub!

### Step 2: Update Your Local Environment

Open the file: `backend/.env`

Find these lines:
```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_b0f27ce39f928686f54bc538711822357727ee48
PAYSTACK_PUBLIC_KEY=pk_test_a7334eb40d4921b2026793e9ced3006ca298fcf1
```

Replace with your LIVE keys:
```env
# Paystack Configuration (LIVE MODE - Real Payments!)
PAYSTACK_SECRET_KEY=sk_live_YOUR_ACTUAL_SECRET_KEY_HERE
PAYSTACK_PUBLIC_KEY=pk_live_YOUR_ACTUAL_PUBLIC_KEY_HERE
```

**Example** (use YOUR actual keys from Paystack dashboard):
```env
PAYSTACK_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
PAYSTACK_PUBLIC_KEY=pk_live_YOUR_PUBLIC_KEY_HERE
```

### Step 3: Save the File

Save `backend/.env` after updating the keys.

### Step 4: Restart Backend Server

The backend needs to restart to load the new LIVE keys.

**Tell me when you're ready, and I'll restart the backend for you!**

---

## 🧪 Step 5: Test with Real Phone Number

Once backend restarts:

1. Open: http://localhost:5173
2. Login to your account
3. Go to **POS** page
4. Add products to cart
5. Click **"Checkout"**
6. Select **"Mobile Money"**
7. Enter **YOUR REAL Ghana phone number**: `0551234567`
8. Click **"Charge Customer"**

### What Will Happen:

1. ✅ Backend calls Paystack with LIVE keys
2. ✅ Paystack sends MoMo prompt to the phone
3. 📱 **Customer receives prompt on their phone!**
4. ✅ Customer approves with PIN
5. ✅ Payment confirmed in your app
6. ✅ Sale completed!

---

## ⚠️ Important Notes

### Start with Small Amount

For your first test:
- Use a small amount like **GHS 1.00** or **GHS 5.00**
- Use your own phone number
- This way you can verify everything works

### Real Money Warning

⚠️ **LIVE mode processes REAL money!**
- Customers will be charged
- Money goes to your Paystack account
- Paystack fees apply (1.95% + GHS 0.50 for MoMo)
- Settlements go to your bank account

### Paystack Fees

Example transaction:
- Customer pays: **GHS 100.00**
- Paystack fee: **GHS 2.45** (1.95% + 0.50)
- You receive: **GHS 97.55**

---

## 🔄 Switching Back to TEST Mode

If you want to switch back to test mode later:

1. Open `backend/.env`
2. Replace LIVE keys with TEST keys:
   ```env
   PAYSTACK_SECRET_KEY=sk_test_b0f27ce39f928686f54bc538711822357727ee48
   PAYSTACK_PUBLIC_KEY=pk_test_a7334eb40d4921b2026793e9ced3006ca298fcf1
   ```
3. Restart backend

I've created a backup at `backend/.env.backup` with your TEST keys.

---

## 📊 Monitoring Live Payments

### Paystack Dashboard

View all transactions:
1. Go to https://dashboard.paystack.com/
2. Make sure you're in **LIVE** mode
3. Click **"Transactions"**
4. See all payments in real-time

### Your App Database

Check Supabase:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **"Table Editor"**
4. View **"payments"** table
5. See all payment records

---

## ✅ Checklist Before Going Live

- [x] Paystack business verified
- [x] LIVE API keys obtained
- [ ] LIVE keys added to `backend/.env`
- [ ] Backend restarted
- [ ] Tested with small amount (GHS 1-5)
- [ ] Verified customer receives MoMo prompt
- [ ] Verified payment completes successfully
- [ ] Checked Paystack dashboard shows transaction
- [ ] Checked app database shows payment record

---

## 🚀 Ready to Go Live?

Once you've updated `backend/.env` with your LIVE keys, tell me and I'll:

1. ✅ Restart the backend server
2. ✅ Verify it's using LIVE keys
3. ✅ Help you test the first payment

---

## 🆘 Troubleshooting

### "Invalid API key" error

- Check you copied the LIVE keys correctly
- Make sure there are no extra spaces
- Verify you're using `sk_live_` and `pk_live_` (not `sk_test_`)

### Customer doesn't receive prompt

- Verify you're using LIVE keys (not TEST)
- Check phone number is correct Ghana format
- Ensure phone is registered for MoMo
- Check Paystack dashboard for error details

### Payment stuck in "pending"

- Customer may not have approved yet
- Check Paystack dashboard for status
- Wait up to 5 minutes for customer to approve
- Customer can check their MoMo app

---

## 📞 Support

### Paystack Support
- Email: support@paystack.com
- Phone: +234 1 888 3888
- Dashboard: https://dashboard.paystack.com/

### Need Help?
Just ask me! I'm here to help you get this working.

---

**Update your `backend/.env` file now, then let me know when you're ready to restart!** 🚀
