# 🚀 Render Deployment Guide - GoXpress POS

Complete step-by-step guide to deploy your GoXpress backend to Render.

---

## 📋 Prerequisites

Before starting:
- ✅ GitHub repository with your code pushed
- ✅ Supabase database already set up
- ✅ Render account (free tier available)

---

## 🎯 Quick Deployment (10 Minutes)

### Step 1: Push Code to GitHub (If Not Done)

```bash
# Make sure all changes are committed
git add .
git commit -m "feat: Prepare for Render deployment"
git push origin main
```

### Step 2: Sign Up for Render

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended)
4. Authorize Render to access your repositories

### Step 3: Create New Web Service

1. Click "New +" button (top right)
2. Select "Web Service"
3. Connect your GitHub repository
4. Select your GoXpress repository

### Step 4: Configure Web Service

**Basic Settings**:
```
Name: goxpress-backend
Region: Choose closest to you (e.g., Frankfurt for Europe)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

**Instance Type**:
```
Free (or Starter if you need better performance)
```

### Step 5: Add Environment Variables

Click "Advanced" → "Add Environment Variable"

Add these one by one:

```env
NODE_ENV=production

PORT=5000

DATABASE_URL=postgresql://postgres.ykctczksbcjdqxroeokc:28ljyZJ47FV8vagY@aws-1-eu-north-1.pooler.supabase.com:6543/postgres

JWT_SECRET=QTcVRVSueWBR01eOfqdLTFwwZ6K+9qBd0oTDOhjlTvY6vLoBQXOP0i7mgvc6zpt1uiDL92z9EHwFEdMEe7V2Ow==

JWT_EXPIRES_IN=7d

CORS_ORIGIN=https://your-frontend-url.vercel.app,http://localhost:5173

PAYSTACK_SECRET_KEY=sk_test_your_key_here

PAYSTACK_PUBLIC_KEY=pk_test_your_key_here

PAYSTACK_WEBHOOK_SECRET=your_webhook_secret_here
```

**⚠️ IMPORTANT**: 
- Use your actual Supabase DATABASE_URL
- Use your actual JWT_SECRET
- Add your Paystack keys when ready
- Update CORS_ORIGIN after deploying frontend

### Step 6: Deploy!

1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. Watch the logs for any errors

---

## ✅ Verify Deployment

### Check Deployment Status

1. Go to your service dashboard
2. Look for "Live" status (green)
3. Note your service URL: `https://goxpress-backend.onrender.com`

### Test API Endpoints

```bash
# Test health check
curl https://goxpress-backend.onrender.com/api/health

# Test login endpoint
curl -X POST https://goxpress-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password","role":"admin"}'
```

---

## 🔧 Configuration Details

### Build Command Explained

```bash
npm install
```
- Installs all dependencies from package.json
- Runs automatically on each deployment

### Start Command Explained

```bash
npm start
```
- Runs `node src/server.js`
- Starts your Express server on PORT 5000

### Root Directory

```
backend
```
- Tells Render to look in the `backend/` folder
- Important because your repo has both frontend and backend

---

## 🌐 Update Frontend to Use Render Backend

After backend is deployed, update your frontend:

### Update Frontend .env

```env
# frontend/.env
VITE_API_URL=https://goxpress-backend.onrender.com/api
```

### Commit and Redeploy Frontend

```bash
cd frontend
# Update .env
git add .env
git commit -m "Update API URL to Render backend"
git push origin main
```

---

## 🔄 Update CORS After Frontend Deployment

Once your frontend is deployed (e.g., on Vercel):

1. Go to Render dashboard
2. Click on your web service
3. Go to "Environment"
4. Update `CORS_ORIGIN`:
   ```
   https://your-frontend.vercel.app,http://localhost:5173
   ```
5. Click "Save Changes"
6. Service will automatically redeploy

---

## 📊 Monitor Your Deployment

### View Logs

1. Go to Render dashboard
2. Click on your service
3. Click "Logs" tab
4. Watch real-time logs

**Look for**:
```
POS backend running on port 5000
Database connection established.
```

### Check Metrics

1. Click "Metrics" tab
2. Monitor:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

---

## 🐛 Troubleshooting

### Issue: "Build Failed"

**Check**:
1. Build logs for errors
2. package.json has correct dependencies
3. Node version compatibility

**Solution**:
```bash
# Add engines to package.json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Issue: "Database Connection Failed"

**Check**:
1. DATABASE_URL is correct
2. Supabase allows connections from Render IPs
3. SSL mode is set correctly

**Solution**:
- Verify DATABASE_URL in environment variables
- Check Supabase connection pooler settings

### Issue: "Service Keeps Restarting"

**Check**:
1. Logs for error messages
2. Environment variables are set
3. PORT is set to 5000

**Solution**:
- Fix any code errors shown in logs
- Ensure all required env vars are set

### Issue: "CORS Errors"

**Check**:
1. CORS_ORIGIN includes your frontend URL
2. Frontend is using correct backend URL

**Solution**:
```env
CORS_ORIGIN=https://your-frontend.vercel.app,http://localhost:5173
```

### Issue: "Cold Starts (Free Tier)"

**Problem**: Free tier spins down after 15 minutes of inactivity

**Solutions**:
1. Upgrade to paid tier ($7/month)
2. Use a ping service (e.g., UptimeRobot)
3. Accept 30-second cold start delay

---

## 💰 Pricing

### Free Tier
- ✅ 750 hours/month
- ✅ Automatic SSL
- ✅ Custom domains
- ❌ Spins down after 15 min inactivity
- ❌ 512 MB RAM
- ❌ 0.1 CPU

### Starter Tier ($7/month)
- ✅ Always on (no cold starts)
- ✅ 512 MB RAM
- ✅ 0.5 CPU
- ✅ Better performance

### Pro Tier ($25/month)
- ✅ 2 GB RAM
- ✅ 1 CPU
- ✅ Priority support

---

## 🔐 Security Best Practices

### Environment Variables

✅ **DO**:
- Use environment variables for secrets
- Rotate secrets regularly
- Use different secrets for dev/prod

❌ **DON'T**:
- Commit secrets to Git
- Share secrets in logs
- Use weak JWT secrets

### Database

✅ **DO**:
- Use connection pooling
- Enable SSL
- Use strong passwords

❌ **DON'T**:
- Expose database publicly
- Use default passwords
- Skip SSL verification

---

## 📈 Performance Optimization

### Enable Caching

Add to your Express app:

```javascript
// backend/src/app.js
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  next();
});
```

### Connection Pooling

Already configured in `backend/src/config/db.js`:

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Compression

Add compression middleware:

```bash
npm install compression
```

```javascript
import compression from 'compression';
app.use(compression());
```

---

## 🔄 Continuous Deployment

### Automatic Deployments

Render automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Render automatically:
# 1. Detects push
# 2. Runs build
# 3. Deploys new version
# 4. Zero-downtime deployment
```

### Manual Deployments

1. Go to Render dashboard
2. Click "Manual Deploy"
3. Select branch
4. Click "Deploy"

---

## 📱 Custom Domain (Optional)

### Add Custom Domain

1. Go to service settings
2. Click "Custom Domains"
3. Add your domain (e.g., api.goxpress.com)
4. Update DNS records:
   ```
   Type: CNAME
   Name: api
   Value: goxpress-backend.onrender.com
   ```
5. Wait for SSL certificate (automatic)

---

## 🎯 Post-Deployment Checklist

- [ ] Backend deployed successfully
- [ ] Service shows "Live" status
- [ ] API endpoints responding
- [ ] Database connection working
- [ ] Environment variables set
- [ ] CORS configured correctly
- [ ] Logs show no errors
- [ ] Frontend updated with backend URL
- [ ] Test login works
- [ ] Test creating a sale
- [ ] Test Paystack payment (if configured)
- [ ] Monitor for 24 hours

---

## 📞 Support

**Render Support**:
- Docs: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

**Common Issues**:
- Build failures: Check logs
- Connection errors: Verify env vars
- Performance: Consider upgrading tier

---

## 🎉 Success!

Your backend is now live at:
```
https://goxpress-backend.onrender.com
```

**Next Steps**:
1. ✅ Deploy frontend to Vercel
2. ✅ Update frontend API URL
3. ✅ Update CORS settings
4. ✅ Test complete flow
5. ✅ Set up monitoring
6. ✅ Configure Paystack webhook

---

## 📊 Deployment Summary

```
Repository: GitHub
Platform: Render
Service Type: Web Service
Runtime: Node.js
Region: [Your chosen region]
URL: https://goxpress-backend.onrender.com
Status: Live ✅
```

**Deployment Time**: ~10 minutes  
**Cost**: Free (or $7/month for always-on)  
**SSL**: Automatic  
**Deployments**: Automatic on push

---

**Last Updated**: April 1, 2026  
**Status**: Production Ready 🚀
