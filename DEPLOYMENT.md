# Lagronite Deployment Guide

## Environment Setup

Your app is configured to work on both **localhost** and **production** (Railway). 

### Local Development (Localhost)

#### Backend
1. Ensure `.env` has:
   ```
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   DATABASE_URL=<your MongoDB URI>
   JWT_SECRET=lagronite_dev_secret_change_me
   ```

2. Start the backend:
   ```bash
   cd backend
   npm install
   npm run prisma:generate
   npm run dev
   ```
   Backend runs on `http://localhost:5000`

#### Frontend
1. Ensure `frontend/.env.local` has:
   ```
   VITE_API_URL=http://localhost:5000
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

---

## Railway Production Deployment

### Step 1: Prepare Your Repository

Make sure your repo structure is:
```
Lagronite/
├── backend/
│   ├── index.js
│   ├── package.json
│   ├── prisma/
│   ├── routes/
│   └── ... (all backend files)
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   └── ... (all frontend files)
├── .env (development)
└── .env.production
```

### Step 2: Deploy Backend to Railway

1. **Create a new project** on Railway
2. **Connect your GitHub repository**
3. **Create a service** for the backend:
   - Select "Deploy from GitHub"
   - Choose your Lagronite repo
   - Railway auto-detects Node.js + Express

4. **Configure Root Directory** (Important!)
   - In Railway service settings → Deployment
   - Set `Root Directory` to `backend`

5. **Add Environment Variables**
   - Go to Railway Dashboard → Select Backend Service → Variables
   - Click "Add Variable" and copy these from `.env.production`:
     ```
     MONGODB_URI (or DATABASE_URL)
     JWT_SECRET (⚠️ CHANGE THIS - use a strong secret!)
     CLOUDINARY_CLOUD_NAME
     CLOUDINARY_API_KEY
     CLOUDINARY_API_SECRET
     FRONTEND_URL=https://lagroniteplatform.site
     NODE_ENV=production
     ```

6. **Railway Auto-assigns a Public URL**
   - After deployment, Railway gives you a URL like `https://your-app.up.railway.app`
   - Save this URL for the frontend

### Step 3: Deploy Frontend to Railway (or Vercel)

**Option A: Deploy Frontend on Railway**

1. Create a new service in the same Railway project
2. Connect GitHub repo again
3. Set `Root Directory` to `frontend`
4. Add build command in settings:
   ```
   npm run build
   ```
5. Set start command:
   ```
   npx serve -s dist -l 3000
   ```
6. Add Variables:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app
   VITE_CLOUDINARY_CLOUD_NAME=278966646742181
   VITE_CLOUDINARY_UPLOAD_PRESET=lagronite_unsigned
   ```
7. Railway assigns a public URL (e.g., `https://frontend-app.up.railway.app`)

**Option B: Deploy Frontend on Vercel** (Recommended)

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" → Import Git Repository
4. Select your Lagronite repo
5. Configure:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app
   VITE_CLOUDINARY_CLOUD_NAME=278966646742181
   VITE_CLOUDINARY_UPLOAD_PRESET=lagronite_unsigned
   ```
7. Deploy!

### Step 4: Connect Your Domain

1. **Purchase/Verify Domain:** Ensure you own `lagroniteplatform.site`

2. **Point Domain to Your Apps:**
   - **Backend:** Add Railway backend URL as a custom domain
   - **Frontend:** Add Vercel/Railway frontend URL as a custom domain

3. **Update Environment Variables:**
   - Backend Railway: `FRONTEND_URL=https://lagroniteplatform.site`
   - Frontend: `VITE_API_URL=https://lagroniteplatform.site` (or your backend domain)

### Step 5: Final Configuration in Code

The backend already supports multiple origins:
- ✅ `http://localhost:5173` (dev)
- ✅ `http://localhost:3000` (dev)
- ✅ `https://lagroniteplatform.site` (production)
- ✅ `https://www.lagroniteplatform.site` (production with www)

The frontend automatically uses `VITE_API_URL` environment variable.

---

## Testing

### Local Test
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev

# Visit http://localhost:5173
```

### Production Test
After deployment, visit your domain:
```
https://lagroniteplatform.site
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| **CORS error** | Ensure `FRONTEND_URL` is set correctly in Railway backend variables |
| **API 404 errors** | Check `VITE_API_URL` points to correct backend URL |
| **MongoDB connection fails** | Verify `DATABASE_URL` is in Railway variables and IP whitelist allows Railway IPs |
| **Files not found** | Ensure `Root Directory` is set correctly in Railway service settings |
| **Domain not working** | Update DNS records to point to Railway/Vercel, then update env variables |

---

## Environment Variable Checklist

### Backend (Railway)
- [ ] `DATABASE_URL` (MongoDB)
- [ ] `JWT_SECRET` (production secret!)
- [ ] `FRONTEND_URL=https://lagroniteplatform.site`
- [ ] `CLOUDINARY_*` variables
- [ ] `NODE_ENV=production`

### Frontend (Vercel/Railway)
- [ ] `VITE_API_URL=https://your-backend-url`
- [ ] `VITE_CLOUDINARY_CLOUD_NAME`
- [ ] `VITE_CLOUDINARY_UPLOAD_PRESET`

---

## Redeploy After Changes

After code changes:
1. Push to GitHub
2. Railway/Vercel auto-deploys from main branch
3. Monitor deployment logs in dashboard

