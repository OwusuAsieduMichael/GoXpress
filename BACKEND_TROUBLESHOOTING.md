# 🔧 Backend Connection Troubleshooting

## Quick Diagnostics

### Step 1: Check if Backend is Running

Open these URLs in your browser:

1. **Backend Root**:
   ```
   https://goxpress.onrender.com
   ```
   Expected: 404 error (this is normal - no route at root)

2. **API Endpoint**:
   ```
   https://goxpress.onrender.com/api/products
   ```
   Expected: `{"message": "No token provided"}` or similar

3. **Health Check** (if you have one):
   ```
   https://goxpress.onrender.com/api/health
   ```

### Step 2: Check Render Service Status

1. Go to https://dashboard.render.com
2. Find your service: `goxpress-backend`
3. Check the status indicator:
   - 🟢 Green = Running
   - 🟡 Yellow = Deploying
   - 🔴 Red = Failed

### Step 3: Check Render Logs

1. In Render dashboard, click on your service
2. Click "Logs" tab
3. Look for:
   - ✅ "POS backend running on 0.0.0.0:3000"
   - ✅ "Database connection established"
   - ❌ Any error messages

---

## Common Issues & Fixes

### Issue 1: Service Spun Down (Free Tier)

**Symptom**: First request takes 30-60 seconds

**Cause**: Render free tier spins down after 15 minutes of inactivity

**Solution**: 
- Wait 30-60 seconds for service to wake up
- Or upgrade to Starter plan ($7/month) for always-on

**Test**:
```bash
# This will wake up the service
curl https://goxpress.onrender.com/api/products
# Wait 30 seconds, then try again
```

### Issue 2: CORS Blocking Requests

**Symptom**: Frontend shows "CORS error" or "Network error"

**Cause**: Backend CORS_ORIGIN doesn't include frontend URL

**Solution**:
1. Go to Render → Your Service → Environment
2. Find `CORS_ORIGIN`
3. Make sure it includes your Vercel URL:
   ```
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```
4. Save (auto-redeploys)

### Issue 3: Wrong API URL in Frontend

**Symptom**: "Failed to fetch" or "Network error"

**Cause**: Frontend is calling wrong backend URL

**Solution**:
1. Go to Vercel → Your Project → Settings → Environment Variables
2. Check `VITE_API_URL`:
   ```
   VITE_API_URL=https://goxpress.onrender.com/api
   ```
3. If wrong, update and redeploy

### Issue 4: Backend Crashed

**Symptom**: Service shows red/failed status

**Cause**: Error in code or missing environment variables

**Solution**:
1. Check Render logs for error messages
2. Common errors:
   - Missing DATABASE_URL
   - Missing JWT_SECRET
   - Database connection failed
3. Fix the issue and redeploy

---

## Quick Tests

### Test 1: Backend Alive?
```bash
curl https://goxpress.onrender.com/api/products
```

**Good Response**:
```json
{"message": "No token provided"}
```

**Bad Response**:
- Timeout
- Connection refused
- 502 Bad Gateway

### Test 2: CORS Working?
Open browser console on your frontend and check for:
```
Access-Control-Allow-Origin header
```

### Test 3: Environment Variables Set?
In Render dashboard, verify these are set:
- ✅ NODE_ENV=production
- ✅ DATABASE_URL=your_supabase_url
- ✅ JWT_SECRET=your_secret
- ✅ CORS_ORIGIN=your_frontend_url

---

## Step-by-Step Fix

### 1. Wake Up Backend (if spun down)
```bash
# Open in browser or run:
curl https://goxpress.onrender.com/api/products
# Wait 30-60 seconds
```

### 2. Check Render Logs
Look for errors in logs. Common issues:
- Database connection failed
- Missing environment variables
- Port binding issues

### 3. Verify Environment Variables
Make sure these are set in Render:
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
CORS_ORIGIN=https://your-frontend.vercel.app
```

### 4. Test API Directly
```bash
# Should return 401 or similar (means API is working)
curl https://goxpress.onrender.com/api/products

# Should return 404 (normal - no root route)
curl https://goxpress.onrender.com/
```

### 5. Check Frontend API URL
In Vercel, verify:
```
VITE_API_URL=https://goxpress.onrender.com/api
```
Note: Must end with `/api`

---

## What's Your Exact Error?

Tell me what you see:

### Option A: "Failed to fetch"
- Check if backend is awake (free tier spins down)
- Check VITE_API_URL in Vercel
- Check CORS_ORIGIN in Render

### Option B: "CORS error"
- Update CORS_ORIGIN in Render
- Include your Vercel URL
- Redeploy backend

### Option C: "Network error"
- Backend might be down
- Check Render service status
- Check Render logs for errors

### Option D: "502 Bad Gateway"
- Backend crashed
- Check Render logs
- Fix error and redeploy

---

## Emergency Fix

If nothing works, try this:

### 1. Redeploy Backend
In Render dashboard:
1. Click "Manual Deploy"
2. Select "Deploy latest commit"
3. Wait for deployment

### 2. Redeploy Frontend
In Vercel dashboard:
1. Go to Deployments
2. Click "..." on latest deployment
3. Click "Redeploy"

### 3. Clear Browser Cache
```
Ctrl + Shift + Delete (Windows)
Cmd + Shift + Delete (Mac)
```
Clear cache and reload

---

## Get Help

Share these details:

1. **Backend URL**: https://goxpress.onrender.com
2. **Frontend URL**: https://your-frontend.vercel.app
3. **Error Message**: (exact error from browser console)
4. **Render Status**: (green/yellow/red)
5. **Render Logs**: (last 10 lines)

---

## Quick Checklist

- [ ] Backend shows 🟢 green in Render
- [ ] Render logs show "POS backend running"
- [ ] Render logs show "Database connection established"
- [ ] Can access https://goxpress.onrender.com/api/products
- [ ] CORS_ORIGIN includes frontend URL
- [ ] VITE_API_URL is correct in Vercel
- [ ] No errors in browser console

---

**Need immediate help?** Share your error message and I'll help you fix it!
