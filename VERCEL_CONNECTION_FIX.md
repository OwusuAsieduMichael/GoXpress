# 🔧 Vercel Connection Issue - Complete Fix Guide

## Problem
Frontend deployed on Vercel shows "Unable to connect" when trying to sign up because it's calling `localhost:5000` instead of your production backend at `https://goxpress.onrender.com`.

## Root Cause
Environment variable `VITE_API_URL` is NOT set in Vercel deployment settings.

---

## ✅ SOLUTION: Step-by-Step Fix

### Step 1: Run Diagnostics (IMPORTANT!)

Before making changes, let's verify what's happening:

1. Open your Vercel deployed site
2. Add `/diagnostic` to the URL:
   ```
   https://your-app.vercel.app/diagnostic
   ```
3. Click "Run Diagnostics"
4. Check the results:
   - **VITE_API_URL**: Should show "NOT SET" (this is the problem!)
   - **apiBaseUrl**: Will show `http://localhost:5000/api` (wrong!)
   - **backendStatus**: Will show "❌ Failed to connect"

### Step 2: Add Environment Variable in Vercel

1. Go to https://vercel.com/dashboard
2. Click on your project
3. Click **"Settings"** tab (top navigation)
4. Click **"Environment Variables"** in left sidebar
5. Click **"Add New"** button
6. Enter the following:
   ```
   Key:   VITE_API_URL
   Value: https://goxpress.onrender.com/api
   ```
7. **IMPORTANT**: Check ALL THREE boxes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
8. Click **"Save"**

### Step 3: Redeploy Frontend

Environment variables only take effect after redeployment:

1. Go to **"Deployments"** tab
2. Find the latest deployment (top of the list)
3. Click the **"..."** menu button on the right
4. Click **"Redeploy"**
5. Confirm the redeployment
6. Wait 1-2 minutes for deployment to complete

### Step 4: Verify the Fix

1. Once redeployment is done, go back to:
   ```
   https://your-app.vercel.app/diagnostic
   ```
2. Click "Run Diagnostics" again
3. Verify the results:
   - ✅ **VITE_API_URL**: `https://goxpress.onrender.com/api`
   - ✅ **apiBaseUrl**: `https://goxpress.onrender.com/api`
   - ✅ **backendStatus**: "✅ Connected"

### Step 5: Update Backend CORS

Now that frontend is calling the correct URL, update backend CORS:

1. Go to https://dashboard.render.com
2. Click on your backend service (`goxpress`)
3. Click **"Environment"** in left sidebar
4. Find `CORS_ORIGIN` variable
5. Click **"Edit"**
6. Update the value to include your Vercel URL:
   ```
   https://your-app-name.vercel.app
   ```
   (Replace `your-app-name` with your actual Vercel URL)
7. Click **"Save Changes"**
8. Backend will auto-redeploy (takes 2-3 minutes)

### Step 6: Test Signup

1. Go to your Vercel frontend
2. Click "Sign Up"
3. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Role: Cashier
4. Click "Sign Up"
5. Should see: "Account created successfully"

---

## 🚨 Common Issues

### Issue 1: Still showing localhost after redeployment

**Cause**: Browser cache

**Fix**:
1. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Or clear browser cache completely

### Issue 2: CORS error after fixing environment variable

**Cause**: Backend CORS_ORIGIN doesn't include your Vercel URL

**Fix**:
1. Check Step 5 above
2. Make sure CORS_ORIGIN in Render includes your exact Vercel URL
3. Wait for backend to redeploy

### Issue 3: Backend takes 30-60 seconds to respond

**Cause**: Render free tier spins down after 15 minutes

**Fix**:
1. This is normal for free tier
2. First request wakes up the service
3. Subsequent requests will be fast
4. Or upgrade to Starter plan ($7/month) for always-on

### Issue 4: "502 Bad Gateway" error

**Cause**: Backend crashed or not running

**Fix**:
1. Go to Render dashboard
2. Check service status (should be green)
3. Check logs for errors
4. Manually redeploy if needed

---

## 📋 Quick Checklist

Before asking for help, verify:

- [ ] Ran diagnostics at `/diagnostic` route
- [ ] Added `VITE_API_URL` in Vercel settings
- [ ] Checked all three environment boxes (Production, Preview, Development)
- [ ] Redeployed frontend after adding variable
- [ ] Waited for deployment to complete
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Updated `CORS_ORIGIN` in Render backend
- [ ] Backend shows green status in Render
- [ ] Ran diagnostics again to verify fix

---

## 🎯 Expected Values

After completing all steps, diagnostics should show:

```
envViteApiUrl: "https://goxpress.onrender.com/api"
envViteApiBaseUrl: "NOT SET" (or same as above)
apiBaseUrl: "https://goxpress.onrender.com/api"
backendStatus: "✅ Connected"
backendResponse: {"message":"No token provided"} (or similar)
```

---

## 🆘 Still Not Working?

Share these details:

1. **Vercel URL**: https://your-app.vercel.app
2. **Diagnostic Results**: (screenshot or copy-paste from `/diagnostic`)
3. **Browser Console Errors**: (F12 → Console tab)
4. **Network Tab**: (F12 → Network tab → try signup → screenshot failed request)
5. **Render Backend Status**: (green/yellow/red)
6. **Render Logs**: (last 10 lines from Render dashboard)

---

## 💡 Why This Happens

Vite (your frontend build tool) uses environment variables that start with `VITE_`:
- These variables are embedded into the build at BUILD TIME
- They are NOT read from `.env` files in production
- You MUST set them in Vercel's dashboard
- You MUST redeploy after adding them

This is different from backend environment variables which are read at runtime.

---

## ✨ After Fix

Once working, you can:
1. Remove the `/diagnostic` route if you want (optional)
2. Test all features (login, signup, POS, etc.)
3. Monitor Render logs for any issues
4. Consider upgrading Render to avoid spin-down delays

---

**Need help?** Run the diagnostics and share the results!
