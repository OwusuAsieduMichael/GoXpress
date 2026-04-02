# 🔴 Paystack LIVE Mode Setup - Real MoMo Payments

## Goal
Enable REAL Mobile Money payments where customers receive actual MoMo prompts on their phones.

---

## ⚠️ Important: Test vs Live Mode

### TEST Mode (Current)
- ✅ Good for development
- ✅ No real money involved
- ✅ Free to test
- ❌ Customers DON'T receive MoMo prompts
- ❌ No real transactions

### LIVE Mode (What You Need)
- ✅ Real MoMo prompts sent to customer phones
- ✅ Real money transactions
- ✅ Customers can approve/decline on their phones
- ⚠️ Requires verified Paystack business account
- ⚠️ Real money is processed

---

## 🚀 Step-by-Step: Go Live

### Step 1: Complete Paystack Business Verification

1. **Go to**: https://dashboard.paystack.com/
2. **Login** to your account
3. **Click** "Settings" → "Business Profile"
4. **Complete** all required information:
   - Business name
   - Business type
   - Business address
   - Tax ID / Business registration number
   - Bank account details (for settlements)
   - Director/Owner information

5. **Submit** for verification
6. **Wait** for Paystack approval (usually 1-3 business days)

### Step 2: Enable Mobile Money

1. In Paystack Dashboard, go to **"Settings"** → **"Payment Channels"**
2. Find **"Mobile Money"**
3. Click **"Enable"**
4. Select networks:
   - ✅ MTN Mobile Money
   - ✅ Vodafone Cash
   - ✅ AirtelTigo Money
5. **Save** settings

### Step 3: Get Your LIVE API Keys

1. Go to **"Settings"** → **"API Keys & Webhooks"**
2. Switch to **"LIVE"** mode (toggle at top)
3. Copy your LIVE keys:
   - **Secret Key**: `sk_live_xxxxxxxxxxxxx`
   - **Public Key**: `pk_live_xxxxxxxxxxxxx`

⚠️ **IMPORTANT**: Keep these keys SECRET! Never commit to GitHub!

### Step 4: Update Your Environment Variables

#### For Local Development:

Edit `backend/.env`:

```env
# Switch from TEST to LIVE keys
PAYSTACK_SECRET_KEY=sk_live_YOUR_ACTUAL_LIVE_KEY_HERE
PAYSTACK_PUBLIC_KEY=pk_live_YOUR_ACTUAL_LIVE_KEY_HERE
```

#### For Production (Render):

1. Go to https://dashboard.render.com
2. Click your backend service
3. Click **"Environment"**
4. Update these variables:
   ```
   PAYSTACK_SECRET_KEY=sk_live_YOUR_ACTUAL_LIVE_KEY_HERE
   PAYSTACK_PUBLIC_KEY=pk_live_YOUR_ACTUAL_LIVE_KEY_HERE
   ```
5. Click **"Save Changes"** (auto-redeploys)

### Step 5: Test with Real Phone Number

1. **Start your app** (local or production)
2. **Make a sale** in POS
3. **Select** "Mobile Money"
4. **Enter REAL Ghana phone number**: `0551234567` (your actual number)
5. **Click** "Charge Customer"

### Step 6: Customer Receives Prompt

The customer will now receive:
- 📱 MoMo prompt on their phone
- 💰 Amount to approve
- ✅ Option to approve or decline
- 🔔 SMS notification

### Step 7: Customer Approves

Customer:
1. Opens MoMo app or dials USSD code
2. Sees payment request
3. Enters PIN to approve
4. Payment is processed

Your app:
1. Receives webhook from Paystack
2. Updates payment status to "success"
3. Completes the sale
4. Generates receipt

---

## 🧪 Testing LIVE Mode Safely

### Option 1: Test with Small Amounts

Start with very small amounts to test:
- GHS 1.00 (1 cedi)
- Use your own phone number
- Approve the payment
- Verify it works end-to-end

### Option 2: Test with Staff Phone Numbers

- Use staff/team member phone numbers
- They approve the test payments
- Refund them later if needed

### Option 3: Use Paystack Test Numbers (if available)

Check Paystack documentation for test numbers that work in LIVE mode.

---

## 🔐 Security Best Practices

### 1. Protect Your LIVE Keys

❌ **NEVER** do this:
```env
# DON'T commit .env to GitHub
PAYSTACK_SECRET_KEY=sk_live_xxxxx
```

✅ **DO** this:
- Keep `.env` in `.gitignore`
- Store LIVE keys only in:
  - Local `.env` file (not committed)
  - Render environment variables
  - Vercel environment variables

### 2. Use Environment Variables

Your code already does this correctly:

```javascript
// backend/src/services/paystackService.js
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
```

### 3. Validate Webhooks

Your code should verify webhook signatures (already implemented):

```javascript
// Verify Paystack webhook signature
const hash = crypto
  .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
  .update(JSON.stringify(req.body))
  .digest('hex');
```

---

## 📊 Monitoring Live Payments

### Paystack Dashboard

1. Go to https://dashboard.paystack.com/
2. Switch to **"LIVE"** mode
3. View:
   - **Transactions**: All payments
   - **Customers**: Customer details
   - **Settlements**: Money paid to your bank
   - **Disputes**: Any chargebacks

### Your App Database

Check `payments` table in Supabase:
- Payment status
- Transaction references
- Amounts
- Customer details

---

## 💰 Settlement (Getting Your Money)

### How Paystack Settlements Work

1. **Customer pays** via MoMo
2. **Paystack holds** the money
3. **Settlement period**: T+1 or T+2 days (configurable)
4. **Paystack transfers** to your bank account
5. **You receive** money minus Paystack fees

### Paystack Fees (Ghana)

- **Local cards**: 1.95% capped at GHS 10
- **Mobile Money**: 1.95% + GHS 0.50
- **International cards**: 3.9%

Example:
- Customer pays: GHS 100
- Paystack fee: GHS 2.45 (1.95% + 0.50)
- You receive: GHS 97.55

### Configure Settlement

1. Go to **"Settings"** → **"Settlements"**
2. Add your **bank account**
3. Choose **settlement schedule**:
   - Daily (T+1)
   - Weekly
   - Monthly
4. **Save** settings

---

## 🔄 Switching Between Test and Live

### For Development: Use TEST

```env
PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
```

### For Production: Use LIVE

```env
PAYSTACK_SECRET_KEY=sk_live_xxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
```

### Best Practice

- **Local development**: TEST keys
- **Staging/Demo**: TEST keys
- **Production**: LIVE keys

---

## ✅ Pre-Launch Checklist

Before going live with real payments:

- [ ] Paystack business account verified
- [ ] Mobile Money enabled in Paystack
- [ ] LIVE API keys obtained
- [ ] LIVE keys added to production environment
- [ ] Bank account added for settlements
- [ ] Tested with small amount (GHS 1)
- [ ] Webhook URL configured
- [ ] SSL certificate on production domain
- [ ] Error handling tested
- [ ] Receipt generation working
- [ ] Refund process understood

---

## 🚨 Common Issues & Solutions

### Issue 1: "Mobile Money not enabled"

**Solution**: 
- Go to Paystack Dashboard → Settings → Payment Channels
- Enable Mobile Money
- Select all networks (MTN, Vodafone, AirtelTigo)

### Issue 2: "Business not verified"

**Solution**:
- Complete business verification in Paystack
- Submit all required documents
- Wait for approval (1-3 days)

### Issue 3: "Invalid phone number"

**Solution**:
- Use Ghana format: `0XXXXXXXXX` or `+233XXXXXXXXX`
- Supported networks: MTN, Vodafone, AirtelTigo
- Phone must be registered for MoMo

### Issue 4: "Customer doesn't receive prompt"

**Possible causes**:
- Still using TEST keys (switch to LIVE)
- Phone number not registered for MoMo
- Network issues
- Customer's MoMo account suspended

**Solution**:
- Verify using LIVE keys
- Ask customer to check MoMo registration
- Try different phone number
- Check Paystack dashboard for error details

### Issue 5: "Payment stuck in pending"

**Solution**:
- Customer may not have approved yet
- Check Paystack dashboard for status
- Implement timeout (e.g., 5 minutes)
- Allow customer to retry

---

## 📱 Customer Experience (LIVE Mode)

### What Customer Sees:

1. **Cashier enters phone number** in POS
2. **Cashier clicks "Charge Customer"**
3. **Customer receives**:
   - SMS notification
   - MoMo app notification
   - USSD prompt (if applicable)

4. **Customer opens MoMo app**:
   - Sees: "Pay GHS 50.00 to [Your Business Name]"
   - Enters PIN
   - Confirms payment

5. **Payment processed**:
   - Customer sees: "Payment successful"
   - Cashier sees: "Payment confirmed"
   - Receipt generated

### Typical Timeline:

- **0s**: Cashier initiates payment
- **2-5s**: Customer receives prompt
- **10-30s**: Customer approves
- **2-5s**: Webhook received
- **Total**: ~20-40 seconds

---

## 🎯 Next Steps

1. **Complete Paystack verification** (if not done)
2. **Get LIVE API keys**
3. **Test with GHS 1** payment
4. **Verify webhook works**
5. **Train staff** on the process
6. **Go live** with confidence!

---

## 📞 Support

### Paystack Support
- Email: support@paystack.com
- Phone: +234 1 888 3888
- Docs: https://paystack.com/docs

### Your App Issues
- Check backend logs
- Check Paystack dashboard
- Verify environment variables
- Test with small amounts first

---

## 🎉 You're Ready!

Once you have LIVE keys configured, customers will receive REAL MoMo prompts on their phones. The payment flow will work exactly as designed!

**Remember**: Start with small test amounts before processing large transactions.

Good luck! 🚀
