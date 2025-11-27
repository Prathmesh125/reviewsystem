# Review System Deployment Guide

## Overview
This guide will help you deploy your Review System to production using:
- **Backend**: Railway (Node.js + PostgreSQL)
- **Frontend**: Vercel (React/Vite)

## 🚀 Backend Deployment (Railway)

### Option 1: Deploy via Railway Web Interface (Recommended)

1. **Go to Railway**: https://railway.app/new
2. **Connect GitHub**: 
   - Click "Deploy from GitHub repo"
   - Select your repository: `Prathmesh125/reviewsystem`
   - Choose the `backend` folder as the root directory
3. **Configure Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=[Railway will provide this automatically]
   JWT_SECRET=your-super-secure-jwt-secret-key-change-this
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=30d
   GOOGLE_GEMINI_API_KEY=your-gemini-api-key
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   SENTRY_DSN=your-sentry-dsn-optional
   ```
4. **Add PostgreSQL Database**:
   - In your Railway project, click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set the DATABASE_URL

### Option 2: Deploy via Railway CLI

```bash
cd backend
railway login
railway init
railway add postgresql
railway deploy
```

## 🌐 Frontend Deployment (Vercel)

### Option 1: Deploy via Vercel Web Interface (Recommended)

1. **Go to Vercel**: https://vercel.com/new
2. **Import Repository**:
   - Click "Import Git Repository"
   - Select your repository: `Prathmesh125/reviewsystem`
   - Set **Root Directory** to `frontend`
3. **Configure Build Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables**:
   ```env
   VITE_API_URL=https://your-backend-domain.railway.app
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

### Option 2: Deploy via Vercel CLI

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

## 🔧 Post-Deployment Configuration

### 1. Update CORS Settings
After getting your frontend URL from Vercel, update the backend environment:
```env
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### 2. Database Setup
Railway will automatically handle the database, but you may need to run migrations:
```bash
# In Railway console or via CLI
npm run db:push
npm run db:seed
```

### 3. Test Your Deployment
- Backend: `https://your-backend-domain.railway.app/health`
- Frontend: `https://your-frontend-domain.vercel.app`

## 🛡️ Security Checklist

- [ ] JWT_SECRET is secure and different from development
- [ ] All API keys are set correctly
- [ ] CORS is configured properly
- [ ] Database URL is secure
- [ ] Environment variables are not exposed in frontend build

## 📊 Monitoring

- **Railway**: Built-in monitoring and logs
- **Vercel**: Analytics and performance monitoring
- **Sentry**: Error tracking (if configured)

## 🔄 Continuous Deployment

Both Railway and Vercel support automatic deployments:
- **Railway**: Auto-deploys on push to main branch (backend)
- **Vercel**: Auto-deploys on push to main branch (frontend)

## Troubleshooting

### Common Issues:

1. **Database Connection**: Ensure DATABASE_URL is correctly set
2. **CORS Errors**: Verify FRONTEND_URL matches your Vercel domain
3. **Build Failures**: Check Node.js version compatibility
4. **Environment Variables**: Ensure all required vars are set

### Logs:
- **Railway**: View logs in Railway dashboard
- **Vercel**: View build logs in Vercel dashboard

## Custom Domains (Optional)

### Railway (Backend)
1. Go to your Railway project → Settings → Domains
2. Add your custom domain
3. Configure DNS records

### Vercel (Frontend)
1. Go to your Vercel project → Settings → Domains
2. Add your custom domain
3. Configure DNS records

---

## Quick Start Commands

Deploy everything in one go:

```bash
# 1. Push to GitHub (already done)
git push origin main

# 2. Deploy Backend to Railway
# Visit: https://railway.app/new

# 3. Deploy Frontend to Vercel  
# Visit: https://vercel.com/new

# 4. Configure environment variables on both platforms
```

Your Review System will be live at:
- **Backend**: `https://[project-name].railway.app`
- **Frontend**: `https://[project-name].vercel.app`