# 🚀 Render Deployment - Quick Guide for GoXpress

Deploy your backend to Render in 10 minutes!

---

## ⚠️ BEFORE YOU START

### Prerequisites Checklist:
- [ ] Code pushed to GitHub
- [ ] GitHub repository is public (or Render has access)
- [ ] Supabase database is running
- [ ] You have your database connection string

**If not pushed to GitHub yet, do this first**:
```bash
git add .
git commit -m "feat: Complete GoXpress POS with Paystack integration"
git push origin main
```

---

## 🎯 Step-by-Step Deployment

### Step 1: Create Render Account (2 minutes)

1. Go to https://render.com
2. Click "Get Started" or "Sign Up"
3. Sign up with GitHub (recommended)
4. Authorize Render to access your repositories

### Step 2: Create New Web Service (3 minutes)

1. Click "New +" button (top right)
2. Select "Web Service"
3. Connect your GitHub repository:
   - If not connected, click "Connect GitHub"
   - Find your repository: `goxpress-pos-system` (or your repo name)
   - Click "Connect"

### Step 3: Configure Service (5 minutes)

Fill in these settings:

**Basic Settings**:
```
Name: goxpress-backend
Region: Choose closest to Ghana (e.g., Frankfurt, London)
Branch: main
Root Directory: backend
```

**Build & Deploy**:
```
Runtime: Node
Build Command: npm install
Start Command: npm start
```

**Instance Type**:
```
Free (for testing)
or
Starter ($7/month - recommended for production)
```

### Step 4: Add Environment Variables (CRITICAL!)

Click "Advanced" → "Add Environment Variable"

Add these ONE BY ONE:

```env
NODE_ENV=production

PORT=5000

DATABASE_URL=postgresql://postgres.ykctczksbcjdqxroeokc:28ljyZJ47FV8vagY@aws-1-eu-north-1.pooler.supabase.com:6543/postgres

JWT_SECRET=QTcVRVSueWBR01eOfqdLTFwwZ6K+9qBd0oTDOhjlTvY6vLoBQXOP0i7mgvc6zpt1uiDL92z9EHwFEdMEe7V2Ow==

JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173,https://your-frontend-url.vercel.app

PAYSTACK_SECRET_KEY=sk_test_your_key_here

PAYSTACK_PUBLIC_KEY=pk_test_your_key_here

PAYSTACK_WEBHOOK_SECRET=your_webhook_secret_here
```

**⚠️ IMPORTANT**: 
- Copy these from your `backend/.env` file
- Don't include quotes around values
- Update `CORS_ORIGIN` after deploying frontend

### Step 5: Deploy! (2 minutes)

1. Click "Create Web Service"
2. Wait for deployment (2-5 minutes)
3. Watch the logs for any errors

**You'll see**:
```
==> Installing dependencies
==> Building...
==> Starting server
POS backend running on port 5000
Database connection established.
```

### Step 6: Get Your Backend URL

After deployment succeeds:
```
Your backend URL: https://goxpress-backend.onrender.com
```

**Copy this URL!** You'll need it for:
- Frontend configuration
- Paystack webhook
- Testing

---

## ✅ Verify Deployment

### Test 1: Health Check
```bash
curl https://goxpress-backend.onrender.com/api/health
```

Expected: `{"status": "ok"}` or similar

### Test 2: Database Connection
Check Render logs for:
```
Database connection established.
```

### Test 3: API Endpoint
```bash
curl https://goxpress-backend.onrender.com/api/products
```

Expected: 401 Unauthorized (means API is working, just needs auth)

---

## 🔧 Common Issues & Fixes

### Issue 1: "Build Failed"

**Check**:
- Is `backend/package.json` in your repo?
- Is Root Directory set to `backend`?
- Are all dependencies in `package.json`?

**Fix**:
```bash
# Locally test build
cd backend
npm install
npm start
```

### Issue 2: "Database Connection Failed"

**Check**:
- Is `DATABASE_URL` correct?
- Is Supabase database running?
- Does connection string include `?sslmode=require`?

**Fix**:
- Go to Supabase → Settings → Database
- Copy connection string (Pooler)
- Update `DATABASE_URL` in Render

### Issue 3: "Port Already in Use"

**Fix**:
- Render automatically assigns port
- Make sure your code uses `process.env.PORT`
- Check `backend/src/server.js`:
  ```javascript
  const PORT = process.env.PORT || 5000;
  ```

### Issue 4: "CORS Error"

**Fix**:
- Update `CORS_ORIGIN` environment variable
- Add your frontend URL
- Redeploy

---

## 🎨 Next: Deploy Frontend to Vercel

### Quick Vercel Deployment:

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Select your repository
5. Configure:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```
6. Add environment variable:
   ```
   VITE_API_URL=https://goxpress-backend.onrender.com/api
   ```
7. Deploy!

### Update Backend CORS:

After frontend deploys, update Render:
1. Go to Render dashboard
2. Select your service
3. Environment → Edit `CORS_ORIGIN`
4. Add: `https://your-app.vercel.app`
5. Save (auto-redeploys)

---

## 📊 Monitoring Your Deployment

### Render Dashboard:
- **Logs**: Real-time server logs
- **Metrics**: CPU, Memory usage
- **Events**: Deployment history

### Check Logs:
1. Go to your service
2. Click "Logs" tab
3. Watch for errors

### Common Log Messages:
```
✅ "POS backend running on port 5000"
✅ "Database connection established"
❌ "Error: connect ECONNREFUSED" (database issue)
❌ "Error: Cannot find module" (missing dependency)
```

---

## 🔐 Security Checklist

After deployment:
- [ ] All environment variables set
- [ ] No secrets in GitHub
- [ ] CORS configured correctly
- [ ] Database connection secure (SSL)
- [ ] JWT secret is strong
- [ ] Paystack keys are correct

---

## 💰 Pricing

**Free Tier**:
- ✅ Good for testing
- ⚠️ Spins down after 15 min inactivity
- ⚠️ Cold starts (slow first request)

**Starter ($7/month)**:
- ✅ Always on
- ✅ No cold starts
- ✅ Better performance
- ✅ Recommended for production

---

## 🎉 Success Checklist

- [ ] Backend deployed to Render
- [ ] Logs show "Database connection established"
- [ ] API responds to requests
- [ ] Environment variables set
- [ ] Backend URL copied
- [ ] Ready to deploy frontend

---

## 📞 Need Help?

**Render Support**:
- Docs: https://render.com/docs
- Community: https://community.render.com

**Common Commands**:
```bash
# View logs
# Go to Render dashboard → Your service → Logs

# Redeploy
# Render dashboard → Manual Deploy → Deploy latest commit

# Check environment variables
# Render dashboard → Environment
```

---

## 🚀 You're Almost Done!

**Current Status**: Backend deploying to Render ✅

**Next Steps**:
1. ✅ Wait for deployment to complete
2. ✅ Copy backend URL
3. ✅ Deploy frontend to Vercel
4. ✅ Update CORS settings
5. ✅ Test the application
6. ✅ Celebrate! 🎉

---

**Deployment Time**: ~10 minutes  
**Status**: In Progress  
**Next**: Deploy Frontend to Vercel
