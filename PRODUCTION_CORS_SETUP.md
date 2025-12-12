# 🚨 CRITICAL: Production CORS Setup

## The Problem You Encountered
Frontend on Netlify cannot connect to backend on Railway due to CORS restrictions.

## Immediate Fix

### 1. Update Railway Backend Environment Variables
Add these to your Railway backend:

```
CORS_ORIGIN=https://your-netlify-app.netlify.app,https://bookbyblock.netlify.app
```

### 2. If Using Custom Domain
```
CORS_ORIGIN=https://bookbyblock.com,https://www.bookbyblock.com
```

### 3. For Multiple Deployments
```
CORS_ORIGIN=https://bookbyblock.netlify.app,https://bookbyblock-staging.netlify.app,https://bookbyblock.vercel.app
```

## Backend Code Already Fixed
The backend now supports:
- Multiple origins (comma-separated)
- Wildcard domains (*.netlify.app)
- Proper credentials handling
- All HTTP methods

## Test Your Fix
1. Deploy backend to Railway with correct CORS_ORIGIN
2. Deploy frontend to Netlify
3. Check browser console - no CORS errors
4. API calls should work

## Emergency Fallback
If still blocked, temporarily use:
```
CORS_ORIGIN=*
```
**⚠️ Only for testing - NOT for production!**
