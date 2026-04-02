# 📸 Render Deployment - Visual Step-by-Step Guide

Complete visual guide with what you'll see at each step.

---

## 🎯 Overview

You'll deploy your backend in these steps:
1. Sign up on Render
2. Connect GitHub
3. Create Web Service
4. Configure settings
5. Add environment variables
6. Deploy!

**Total Time**: 10-15 minutes

---

## Step 1: Sign Up on Render

### What to do:
1. Go to https://render.com
2. Click "Get Started" (blue button, top right)
3. Choose "Sign up with GitHub" (recommended)

### What you'll see:
```
┌─────────────────────────────────────┐
│         Welcome to Render           │
│                                     │
│  [Sign up with GitHub]              │
│  [Sign up with GitLab]              │
│  [Sign up with Email]               │
│                                     │
│  Already have an account? Sign in   │
└─────────────────────────────────────┘
```

### After clicking "Sign up with GitHub":
- GitHub will ask for permission
- Click "Authorize Render"
- You'll be redirected to Render dashboard

---

## Step 2: Render Dashboard

### What you'll see:
```
┌─────────────────────────────────────────────────┐
│  Render Dashboard                    [New +]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  You don't have any services yet                │
│                                                 │
│  [Create your first service]                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### What to do:
Click the **"New +"** button (top right corner)

---

## Step 3: Choose Service Type

### What you'll see:
```
┌─────────────────────────────────────┐
│  Create a new...                    │
├─────────────────────────────────────┤
│  Web Service                        │
│  Deploy a web app or API            │
│                                     │
│  Static Site                        │
│  Deploy a static website            │
│                                     │
│  Private Service                    │
│  Internal service                   │
│                                     │
│  Background Worker                  │
│  Run background jobs                │
│                                     │
│  Cron Job                          │
│  Scheduled tasks                    │
└─────────────────────────────────────┘
```

### What to do:
Click **"Web Service"**

---

## Step 4: Connect Repository

### What you'll see:
```
┌─────────────────────────────────────────────────┐
│  Create a new Web Service                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  Connect a repository                           │
│                                                 │
│  [Connect GitHub]                               │
│                                                 │
│  Or use a public Git repository                 │
│  [Public Git repository URL]                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### What to do:
1. Click **"Connect GitHub"** (if not already connected)
2. You'll see a list of your repositories
3. Find your repository (e.g., `goxpress-pos-system`)
4. Click **"Connect"** next to it

### After connecting:
```
┌─────────────────────────────────────────────────┐
│  ✓ Connected: your-username/goxpress-pos-system │
│                                                 │
│  [Continue]                                     │
└─────────────────────────────────────────────────┘
```

Click **"Continue"**

---

## Step 5: Configure Service

### What you'll see:
```
┌─────────────────────────────────────────────────┐
│  Configure your Web Service                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  Name *                                         │
│  [goxpress-backend                    ]         │
│                                                 │
│  Region                                         │
│  [Frankfurt (EU Central)        ▼]              │
│                                                 │
│  Branch                                         │
│  [main                          ▼]              │
│                                                 │
│  Root Directory                                 │
│  [backend                           ]           │
│                                                 │
│  Runtime                                        │
│  [Node                          ▼]              │
│                                                 │
│  Build Command                                  │
│  [npm install                       ]           │
│                                                 │
│  Start Command                                  │
│  [npm start                         ]           │
│                                                 │
│  [Advanced ▼]                                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### What to fill in:

| Field | Value |
|-------|-------|
| **Name** | `goxpress-backend` |
| **Region** | Choose closest to you (Frankfurt, London, etc.) |
| **Branch** | `main` |
| **Root Directory** | `backend` ⚠️ IMPORTANT! |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

### ⚠️ CRITICAL:
- **Root Directory MUST be `backend`** (not empty!)
- This tells Render to look in the `backend/` folder

---

## Step 6: Add Environment Variables

### What to do:
1. Click **"Advanced"** (at the bottom)
2. Scroll to "Environment Variables"
3. Click **"Add Environment Variable"**

### What you'll see:
```
┌─────────────────────────────────────────────────┐
│  Environment Variables                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Add Environment Variable]                     │
│                                                 │
│  Key                    Value                   │
│  [                ] [                      ]    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Add these variables ONE BY ONE:

Click "Add Environment Variable" for each:

```
Key: NODE_ENV
Value: production

Key: PORT
Value: 5000

Key: DATABASE_URL
Value: postgresql://postgres.ykctczksbcjdqxroeokc:28ljyZJ47FV8vagY@aws-1-eu-north-1.pooler.supabase.com:6543/postgres

Key: JWT_SECRET
Value: QTcVRVSueWBR01eOfqdLTFwwZ6K+9qBd0oTDOhjlTvY6vLoBQXOP0i7mgvc6zpt1uiDL92z9EHwFEdMEe7V2Ow==

Key: JWT_EXPIRES_IN
Value: 7d

Key: CORS_ORIGIN
Value: http://localhost:5173,https://your-frontend-url.vercel.app

Key: PAYSTACK_SECRET_KEY
Value: sk_test_your_key_here

Key: PAYSTACK_PUBLIC_KEY
Value: pk_test_your_key_here

Key: PAYSTACK_WEBHOOK_SECRET
Value: your_webhook_secret_here
```

**⚠️ Copy these from your `backend/.env` file!**

### After adding all variables:
```
┌─────────────────────────────────────────────────┐
│  Environment Variables                    (10)  │
├─────────────────────────────────────────────────┤
│  NODE_ENV              production               │
│  PORT                  5000                     │
│  DATABASE_URL          postgresql://...         │
│  JWT_SECRET            QTcVRVSu...              │
│  JWT_EXPIRES_IN        7d                       │
│  CORS_ORIGIN           http://localhost...      │
│  PAYSTACK_SECRET_KEY   sk_test_...              │
│  PAYSTACK_PUBLIC_KEY   pk_test_...              │
│  PAYSTACK_WEBHOOK_...  your_webhook...          │
└─────────────────────────────────────────────────┘
```

---

## Step 7: Choose Plan

### What you'll see:
```
┌─────────────────────────────────────────────────┐
│  Select Instance Type                           │
├─────────────────────────────────────────────────┤
│                                                 │
│  ○ Free                                         │
│     $0/month                                    │
│     • 512 MB RAM                                │
│     • Spins down after 15 min inactivity        │
│     • Good for testing                          │
│                                                 │
│  ○ Starter                                      │
│     $7/month                                    │
│     • 512 MB RAM                                │
│     • Always on                                 │
│     • No cold starts                            │
│     • Recommended for production                │
│                                                 │
└─────────────────────────────────────────────────┘
```

### What to choose:
- **Free**: For testing (spins down after 15 min)
- **Starter ($7/month)**: For production (always on)

**Recommendation**: Start with Free, upgrade later

---

## Step 8: Create Service

### What to do:
Scroll to bottom and click **"Create Web Service"**

### What you'll see:
```
┌─────────────────────────────────────────────────┐
│  Creating goxpress-backend...                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ⏳ Initializing...                             │
│                                                 │
└─────────────────────────────────────────────────┘
```

Then deployment starts!

---

## Step 9: Watch Deployment

### What you'll see (Logs):
```
┌─────────────────────────────────────────────────┐
│  goxpress-backend                    [Logs]     │
├─────────────────────────────────────────────────┤
│                                                 │
│  ==> Cloning from https://github.com/...        │
│  ==> Checking out commit 456af3b                │
│  ==> Installing dependencies                    │
│      npm install                                │
│      added 131 packages in 12s                  │
│  ==> Build successful                           │
│  ==> Starting server                            │
│      > pos-backend@1.0.0 start                  │
│      > node src/server.js                       │
│                                                 │
│      POS backend running on port 5000           │
│      Database connection established.           │
│                                                 │
│  ==> Your service is live 🎉                    │
│      https://goxpress-backend.onrender.com      │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Success indicators:
- ✅ "Build successful"
- ✅ "POS backend running on port 5000"
- ✅ "Database connection established"
- ✅ "Your service is live"

### If you see errors:
- ❌ "Build failed" → Check Root Directory is `backend`
- ❌ "Database connection failed" → Check DATABASE_URL
- ❌ "Module not found" → Check package.json

---

## Step 10: Get Your URL

### What you'll see:
```
┌─────────────────────────────────────────────────┐
│  goxpress-backend                    [Live]     │
├─────────────────────────────────────────────────┤
│                                                 │
│  🟢 Live                                        │
│                                                 │
│  https://goxpress-backend.onrender.com          │
│  [Copy URL]                                     │
│                                                 │
│  Last deployed: 2 minutes ago                   │
│  Deploy time: 1m 23s                            │
│                                                 │
└─────────────────────────────────────────────────┘
```

### What to do:
1. **Copy the URL**: `https://goxpress-backend.onrender.com`
2. Save it somewhere (you'll need it for frontend)

---

## Step 11: Test Your Deployment

### Test in browser:
Open: `https://goxpress-backend.onrender.com/api/products`

**Expected**: 
```json
{
  "message": "No token provided"
}
```
This means API is working! (Just needs authentication)

### Test with curl:
```bash
curl https://goxpress-backend.onrender.com/api/health
```

**Expected**:
```json
{
  "status": "ok"
}
```

---

## 🎉 Success!

### You should see:
```
┌─────────────────────────────────────────────────┐
│  ✅ Backend deployed successfully!              │
│                                                 │
│  URL: https://goxpress-backend.onrender.com     │
│                                                 │
│  Status: 🟢 Live                                │
│  Region: Frankfurt                              │
│  Plan: Free                                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📋 Post-Deployment Checklist

- [ ] Service shows "Live" status (green dot)
- [ ] Logs show "Database connection established"
- [ ] URL is accessible
- [ ] API responds (even if 401 error)
- [ ] Backend URL copied

---

## 🔄 Next Steps

### 1. Update Paystack Webhook
Go to Paystack dashboard:
```
Settings → API Keys & Webhooks
Webhook URL: https://goxpress-backend.onrender.com/api/payments/webhook
```

### 2. Deploy Frontend to Vercel
1. Go to https://vercel.com
2. Import your repository
3. Set Root Directory: `frontend`
4. Add environment variable:
   ```
   VITE_API_URL=https://goxpress-backend.onrender.com/api
   ```
5. Deploy!

### 3. Update CORS
After frontend deploys:
1. Go to Render dashboard
2. Select your service
3. Environment → Edit CORS_ORIGIN
4. Add your Vercel URL
5. Save (auto-redeploys)

---

## 🆘 Troubleshooting

### Service won't start:
1. Check logs for errors
2. Verify Root Directory is `backend`
3. Check all environment variables are set

### Database connection failed:
1. Verify DATABASE_URL is correct
2. Check Supabase is running
3. Test connection locally first

### Build failed:
1. Check package.json exists in backend/
2. Verify all dependencies are listed
3. Test `npm install` locally

---

## 💡 Tips

**Free Tier**:
- Spins down after 15 min inactivity
- First request after spin-down takes 30-60 seconds
- Good for testing, not production

**Upgrade to Starter**:
- Always on, no cold starts
- Better for production
- Only $7/month

**Monitoring**:
- Check logs regularly
- Set up email alerts
- Monitor performance

---

**Deployment Complete!** 🎉

Your backend is now live at: `https://goxpress-backend.onrender.com`

Next: Deploy frontend to Vercel!
