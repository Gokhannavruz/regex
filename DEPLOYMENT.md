# 🚀 Deployment Guide

## ✅ Frontend (Vercel) - DEPLOYED!

**URL**: https://backend-b8p7hkdw1-gokhans-projects-95a5e32e.vercel.app

### Frontend Configuration:
- ✅ Vercel'de deploy edildi
- ✅ Static build kullanıyor
- ✅ Environment variables ayarlandı

## 🔧 Backend (Railway) - Manual Setup Required

### Step 1: Railway Web Interface
1. Go to https://railway.app
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Select the `backend` folder

### Step 2: Environment Variables
Railway dashboard'da şu environment variables'ları ekleyin:

```env
NODE_ENV=production
DB_HOST=postgres
DB_PORT=5432
DB_NAME=regex_tester
DB_USER=postgres
DB_PASSWORD=your-secure-password
JWT_SECRET=your-super-secure-jwt-secret
OPENAI_API_KEY=sk-your-openai-key
FRONTEND_URL=https://backend-b8p7hkdw1-gokhans-projects-95a5e32e.vercel.app
```

### Step 3: Database Setup
1. Railway'de "Add Service" → "Database" → "PostgreSQL"
2. Database otomatik olarak oluşturulacak
3. Connection string'i environment variables'a ekleyin

### Step 4: Update Frontend API URL
Backend deploy edildikten sonra:

1. Railway'den backend URL'ini alın (örn: `https://your-backend.railway.app`)
2. Vercel dashboard'a gidin
3. Project Settings → Environment Variables
4. `VITE_API_URL` değerini güncelleyin: `https://your-backend.railway.app/api`

## 🎯 Alternative: Full Docker Deployment

### Option 1: DigitalOcean App Platform
```bash
# 1. GitHub'a push edin
git add .
git commit -m "Production ready"
git push origin main

# 2. DigitalOcean'da:
# - New App → GitHub repo seçin
# - Backend: Node.js auto-detect
# - Database: PostgreSQL ekleyin
# - Environment variables ayarlayın
```

### Option 2: AWS/GCP/Azure
```bash
# Docker ile deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 🔗 Final URLs

After complete deployment:
- **Frontend**: https://backend-b8p7hkdw1-gokhans-projects-95a5e32e.vercel.app
- **Backend**: https://your-backend.railway.app
- **Database**: Railway PostgreSQL

## 🛠️ Management Commands

### Vercel
```bash
# Redeploy frontend
vercel --prod

# View logs
vercel logs

# Update environment variables
vercel env add VITE_API_URL
```

### Railway
```bash
# Deploy backend (after login)
railway up

# View logs
railway logs

# Connect to database
railway connect postgres
```

## 🔒 Security Checklist

- [ ] Environment variables secured
- [ ] Database password strong
- [ ] JWT secret random and secure
- [ ] OpenAI API key valid
- [ ] CORS configured correctly
- [ ] Rate limiting enabled

## 📊 Monitoring

### Health Checks
- Frontend: https://backend-b8p7hkdw1-gokhans-projects-95a5e32e.vercel.app
- Backend: https://your-backend.railway.app/health

### Logs
- Vercel: Dashboard → Functions → Logs
- Railway: Dashboard → Deployments → Logs

---

**🎉 Your Regex Tester Pro is now live!**
