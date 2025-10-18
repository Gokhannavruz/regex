# 🚀 Production Deployment Guide

## 📋 Prerequisites

- Docker & Docker Compose
- Domain name with SSL certificate
- PostgreSQL database (or use Docker)
- OpenAI API key
- Server with at least 2GB RAM

## 🔧 Environment Setup

### 1. Create Production Environment File

```bash
cp env.production.example .env.production
```

### 2. Configure Environment Variables

Edit `.env.production` with your production values:

```env
# Database
DB_HOST=your-production-db-host
DB_PASSWORD=your-secure-db-password

# Security
JWT_SECRET=your-super-secure-jwt-secret-for-production

# OpenAI
OPENAI_API_KEY=sk-your-production-openai-key

# URLs
FRONTEND_URL=https://your-domain.com
VITE_API_URL=https://api.your-domain.com/api
```

## 🐳 Docker Production Deployment

### Option 1: Full Docker Stack

```bash
# Deploy with production script
./deploy-prod.sh

# Or manually
docker-compose -f docker-compose.prod.yml up -d --build
```

### Option 2: Individual Services

```bash
# Database only
docker run -d --name postgres-prod \
  -e POSTGRES_DB=regex_tester_prod \
  -e POSTGRES_PASSWORD=your-password \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15

# Backend only
docker build -f backend/Dockerfile.prod -t regex-backend-prod ./backend
docker run -d --name backend-prod \
  --env-file .env.production \
  -p 5000:5000 \
  regex-backend-prod

# Frontend only
docker build -f Dockerfile.prod -t regex-frontend-prod .
docker run -d --name frontend-prod \
  -e VITE_API_URL=https://api.your-domain.com/api \
  -p 3000:3000 \
  regex-frontend-prod
```

## ☁️ Cloud Deployment Options

### Railway.app (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel):**
```bash
npm install -g vercel
vercel --prod
```

**Backend (Railway):**
```bash
cd backend
railway init
railway up
```

### DigitalOcean App Platform

1. Connect GitHub repository
2. Auto-detect Node.js backend
3. Add PostgreSQL database
4. Configure environment variables
5. Deploy

## 🔒 Security Configuration

### SSL Certificate Setup

```bash
# Create SSL directory
mkdir ssl

# Copy your SSL certificates
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem
```

### Nginx Configuration

Update `nginx.prod.conf` with your domain:
- Replace `your-domain.com` with your actual domain
- Update SSL certificate paths
- Configure rate limiting as needed

### Firewall Rules

```bash
# Allow only necessary ports
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Check all services
curl https://your-domain.com/api/health
curl https://your-domain.com

# Check Docker containers
docker-compose -f docker-compose.prod.yml ps
```

### Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Backup Database

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U postgres regex_tester_prod > backup.sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U postgres regex_tester_prod < backup.sql
```

## 🔄 Updates & Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

### Database Migrations

```bash
# Run schema updates
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U postgres regex_tester_prod -f /docker-entrypoint-initdb.d/schema.sql
```

## 📈 Performance Optimization

### Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX CONCURRENTLY idx_regex_usage_user_id ON regex_usage(user_id);
CREATE INDEX CONCURRENTLY idx_saved_regex_created_at ON saved_regex(created_at);
```

### Caching

- Configure Redis for session storage
- Enable CDN for static assets
- Set up database connection pooling

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in docker-compose.prod.yml
2. **Database connection**: Check DB_HOST and credentials
3. **SSL issues**: Verify certificate paths and permissions
4. **Memory issues**: Increase server RAM or optimize containers

### Debug Commands

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check resource usage
docker stats

# Check logs for errors
docker-compose -f docker-compose.prod.yml logs --tail=100
```

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/your-repo/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Email**: support@your-domain.com

---

**🎉 Your Regex Tester Pro is now production-ready!**
