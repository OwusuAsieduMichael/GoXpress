# 🚀 Deployment Quick Reference Card

One-page reference for deploying GoXpress.

---

## 📋 Pre-Deployment Checklist

```bash
# 1. Push to GitHub
git add .
git commit -m "feat: Complete GoXpress POS"
git push origin main

# 2. Verify files
✓ backend/package.json exists
✓ backend/src/server.js exists
✓ frontend/package.json exists
✓ .env files NOT in Git
✓ .env.example files ARE in Git
```

---

## 🎯 Render Backend Deployment

### Quick Settings:
```
URL: https://render.com
Service Type: Web Service
Name: goxpress-backend
Region: Frankfurt/London
Branch: main
Root Directory: backend          ⚠️ CRITICAL!
Runtime: Node
Build: npm install
Start: npm start
Plan: Free (or Starter $7/month)
```

### Environment Variables:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173,https://your-frontend.vercel.app
PAYSTACK_SECRET_KEY=sk_test_your_key
PAYSTACK_PUBLIC_KEY=pk_test_your_key
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret
```

### Success Indicators:
```
✅ "Build successful"
✅ "POS backend running on port 5000"
✅ "Database connection established"
✅ Status: 🟢 Live
```

### Your Backend URL:
```
https://goxpress-backend.onrender.com
```

---

## 🎨 Vercel Frontend Deployment

### Quick Settings:
```
URL: https://vercel.com
Framework: Vite
Root Directory: frontend
Build: npm run build
Output: dist
```

### Environment Variable:
```env
VITE_API_URL=https://goxpress-backend.onrender.com/api
```

### Your Frontend URL:
```
https://goxpress.vercel.app
```

---

## 🔄 Post-Deployment Updates

### 1. Update Backend CORS:
```
Render → goxpress-backend → Environment
Edit CORS_ORIGIN:
http://localhost:5173,https://goxpress.vercel.app
Save (auto-redeploys)
```

### 2. Update Paystack Webhook:
```
Paystack Dashboard → Settings → API Keys
Webhook URL:
https://goxpress-backend.onrender.com/api/payments/webhook
```

### 3. Test Everything:
```bash
# Test backend
curl https://goxpress-backend.onrender.com/api/health

# Test frontend
Open: https://goxpress.vercel.app

# Test login
Username: admin
Password: your_password
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Build failed | Check Root Directory = `backend` |
| Database error | Verify DATABASE_URL |
| CORS error | Update CORS_ORIGIN with frontend URL |
| 404 on API | Check backend URL in frontend .env |
| Slow first load | Free tier spins down (upgrade to Starter) |

---

## 📊 Deployment Status

### Backend (Render):
```
Status: [ ] Deploying  [ ] Live  [ ] Error
URL: _________________________________
Logs: Check for "Database connection established"
```

### Frontend (Vercel):
```
Status: [ ] Deploying  [ ] Live  [ ] Error
URL: _________________________________
Preview: Open URL in browser
```

---

## 🔗 Important URLs

```
GitHub Repo:     https://github.com/YOUR-USERNAME/goxpress-pos-system
Render Dashboard: https://dashboard.render.com
Vercel Dashboard: https://vercel.com/dashboard
Supabase:        https://supabase.com/dashboard
Paystack:        https://dashboard.paystack.com

Backend API:     https://goxpress-backend.onrender.com
Frontend App:    https://goxpress.vercel.app
```

---

## ⏱️ Deployment Timeline

```
Total Time: ~20 minutes

Backend (Render):     10 min
├─ Sign up:           2 min
├─ Configure:         5 min
└─ Deploy:            3 min

Frontend (Vercel):    5 min
├─ Sign up:           1 min
├─ Configure:         2 min
└─ Deploy:            2 min

Post-deployment:      5 min
├─ Update CORS:       2 min
├─ Update webhook:    2 min
└─ Test:              1 min
```

---

## 💰 Cost Summary

```
Supabase:    Free (or $25/month Pro)
Render:      Free (or $7/month Starter)
Vercel:      Free (or $20/month Pro)
Paystack:    Free (2.9% + GH₵0.30 per transaction)

Total Free:  $0/month
Total Paid:  $32-52/month (recommended for production)
```

---

## 🎯 Success Criteria

Your deployment is successful when:

- [ ] Backend shows 🟢 Live on Render
- [ ] Frontend shows ✓ Ready on Vercel
- [ ] Can open frontend URL in browser
- [ ] Can login to the application
- [ ] Can create a sale
- [ ] Can process payment (if Paystack configured)
- [ ] No CORS errors in browser console
- [ ] Database queries work

---

## 📞 Support Links

```
Render Docs:   https://render.com/docs
Vercel Docs:   https://vercel.com/docs
Supabase Docs: https://supabase.com/docs
Paystack Docs: https://paystack.com/docs

Render Support:   support@render.com
Vercel Support:   support@vercel.com
Supabase Support: support@supabase.com
Paystack Support: support@paystack.com
```

---

## 🔐 Security Reminders

- ✅ Never commit .env files
- ✅ Use environment variables for secrets
- ✅ Enable HTTPS (automatic on Render/Vercel)
- ✅ Use strong JWT secret
- ✅ Verify Paystack webhooks
- ✅ Keep dependencies updated

---

## 📝 Quick Commands

```bash
# Redeploy backend (Render)
git push origin main
# (Render auto-deploys on push)

# Redeploy frontend (Vercel)
git push origin main
# (Vercel auto-deploys on push)

# View logs
# Render: Dashboard → Service → Logs
# Vercel: Dashboard → Project → Deployments → View Logs

# Rollback
# Render: Dashboard → Service → Events → Redeploy previous
# Vercel: Dashboard → Project → Deployments → Promote to Production
```

---

**Print this page for quick reference during deployment!** 📄
