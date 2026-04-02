# 📱 Mobile Money Not Working - Troubleshooting Checklist

## Issue: Customer Not Receiving MoMo Prompt

Your payment is being initiated successfully (backend returns 200), but customers aren't receiving prompts on their phones.

---

## ✅ Checklist: Fix MoMo Prompts

### 1. Check Paystack Dashboard Settings

Go to: https://dashboard.paystack.com/settings/preferences

#### A. Verify You're in LIVE Mode
- [ ] Toggle at top shows "LIVE" (not "TEST")
- [ ] You're using LIVE API keys (sk_live_xxx)

#### B. Enable Mobile Money
1. Go to: **Settings** → **Payment Channels**
2. Find **"Mobile Money"** section
3. Check if it's **ENABLED** for LIVE mode
4. Verify these networks are checked:
   - [ ] MTN Mobile Money
   - [ ] Vodafone Cash
   - [ ] AirtelTigo Money

#### C. Business Verification Status
1. Go to: **Settings** → **Business Profile**
2. Check verification status:
   - [ ] Business name verified
   - [ ] Business documents submitted
   - [ ] Bank account added
   - [ ] Status shows "Verified" or "Active"

⚠️ **IMPORTANT**: Mobile Money in LIVE mode only works if your business is fully verified!

---

### 2. Check Transaction in Paystack Dashboard

1. Go to: https://dashboard.paystack.com/transactions
2. Make sure you're in **LIVE** mode
3. Look for your recent transaction (reference: `GXP-1775147735376-HFOZ4DX`)
4. Click on it to see details

**What to check:**
- [ ] Transaction exists in dashboard
- [ ] Status shows what? (pending/failed/success)
- [ ] Any error messages?
- [ ] Channel shows "mobile_money"?

---

### 3. Verify Phone Number Format

The phone number must be:
- [ ] Ghana number (starts with 0 or +233)
- [ ] Valid network: MTN (024, 054, 055, 059), Vodafone (020, 050), AirtelTigo (027, 057, 026, 056)
- [ ] Registered for Mobile Money
- [ ] Has sufficient balance (for testing)

---

### 4. Check Paystack Mobile Money Requirements

Paystack Mobile Money for Ghana has specific requirements:

#### For LIVE Mode:
- ✅ Business must be verified
- ✅ Mobile Money must be enabled
- ✅ Customer phone must be registered for MoMo
- ✅ Transaction must be above minimum amount (usually GHS 1)

#### Common Issues:
- **Business not verified**: MoMo won't work in LIVE mode
- **MoMo not enabled**: Check payment channels settings
- **Network issues**: Customer's network might be down
- **Phone not registered**: Customer must have active MoMo account

---

### 5. Test with Paystack Test Mode First

Before using LIVE mode, test with TEST mode:

1. Switch back to TEST keys in `backend/.env`:
   ```env
   PAYSTACK_SECRET_KEY=sk_test_b0f27ce39f928686f54bc538711822357727ee48
   PAYSTACK_PUBLIC_KEY=pk_test_a7334eb40d4921b2026793e9ced3006ca298fcf1
   ```

2. Restart backend
3. Try a payment
4. Check Paystack TEST dashboard

**In TEST mode:**
- You won't receive real prompts
- But you can see if the API calls work
- You can manually mark transactions as successful

---

### 6. Alternative: Use Paystack Charge API

Paystack has two ways to charge Mobile Money:

#### Method 1: Initialize Transaction (Current)
- Creates a payment link
- Customer visits link to pay
- ❌ Doesn't send direct MoMo prompt

#### Method 2: Charge API (Direct Charge)
- Directly charges customer's MoMo
- ✅ Sends prompt to customer's phone
- Requires additional Paystack permissions

**To use Charge API:**
1. Contact Paystack support
2. Request "Direct Charge" permission for Mobile Money
3. Update code to use `/charge` endpoint instead of `/initialize`

---

### 7. Check Paystack API Response

Let me add logging to see what Paystack is returning:

The backend logs show:
```
POST /api/payments/momo/initiate 200 1449.913 ms - 303
```

This means Paystack accepted the request. But we need to see the actual response.

**Action**: Check your Paystack dashboard for the transaction details.

---

### 8. Verify Mobile Money is Available in Your Region

Paystack Mobile Money availability:
- ✅ Ghana: MTN, Vodafone, AirtelTigo
- ✅ Nigeria: Not available (use bank transfer)
- ✅ South Africa: Not available

Make sure you're in Ghana and using a Ghana phone number.

---

## 🎯 Most Likely Issues

Based on the symptoms, here are the most likely causes:

### Issue #1: Business Not Fully Verified (90% likely)
**Symptom**: API works, but no prompts sent
**Cause**: Paystack requires full business verification for LIVE MoMo
**Fix**: Complete verification in Paystack dashboard

### Issue #2: Mobile Money Not Enabled for LIVE (80% likely)
**Symptom**: API works, but no prompts sent
**Cause**: MoMo enabled for TEST but not LIVE
**Fix**: Enable in Settings → Payment Channels

### Issue #3: Using Initialize Instead of Charge (70% likely)
**Symptom**: Transaction created but customer not charged
**Cause**: `/initialize` creates payment link, doesn't charge directly
**Fix**: Use `/charge` endpoint (requires Paystack permission)

### Issue #4: Phone Number Not Registered (50% likely)
**Symptom**: No prompt received
**Cause**: Phone number not registered for MoMo
**Fix**: Use a different phone number that has active MoMo

---

## 🔧 Quick Fixes to Try

### Fix #1: Check Paystack Dashboard
1. Go to https://dashboard.paystack.com/transactions
2. Switch to LIVE mode
3. Find your transaction
4. See what status/error it shows

### Fix #2: Contact Paystack Support
Email: support@paystack.com
Ask: "I'm trying to use Mobile Money in LIVE mode but customers aren't receiving prompts. My business is verified. Can you help?"

### Fix #3: Try a Different Phone Number
- Use a different Ghana number
- Make sure it's registered for MoMo
- Try MTN first (most reliable)

### Fix #4: Check Minimum Amount
- Some networks have minimum amounts
- Try GHS 5 or GHS 10 instead of GHS 1

---

## 📞 Next Steps

1. **Check Paystack Dashboard** (5 minutes)
   - Go to transactions
   - Find your payment
   - See what it says

2. **Verify Business Status** (2 minutes)
   - Go to Settings → Business Profile
   - Check if fully verified

3. **Enable Mobile Money** (1 minute)
   - Go to Settings → Payment Channels
   - Enable Mobile Money for LIVE

4. **Contact Paystack** (if above doesn't work)
   - Email support@paystack.com
   - Share your transaction reference
   - Ask about Mobile Money setup

---

## 💡 Important Note

**Paystack's `/initialize` endpoint** creates a payment session but doesn't directly charge the customer. The customer needs to:
1. Visit the authorization URL
2. Enter their details
3. Approve the payment

For **direct MoMo charging** (prompt sent to phone automatically), you need:
- Paystack's "Direct Charge" feature
- Special permission from Paystack
- Use `/charge` endpoint instead

This might be why you're not receiving prompts!

---

## ✅ What to Share with Me

After checking your Paystack dashboard, tell me:

1. **Business verification status**: Verified? Pending? Not started?
2. **Mobile Money enabled**: Yes/No for LIVE mode?
3. **Transaction status**: What does the dashboard show for the transaction?
4. **Any error messages**: What errors (if any) appear in dashboard?

With this info, I can help you fix the exact issue!

---

**Let's get those MoMo prompts working!** 🚀📱
