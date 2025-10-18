#!/bin/bash

# Production Deployment Script for Regex Tester Pro

echo "🚀 Starting Production Deployment..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ .env.production file not found!"
    echo "📝 Please create .env.production from env.production.example"
    echo "   cp env.production.example .env.production"
    echo "   # Then edit .env.production with your production values"
    exit 1
fi

# Load production environment
export $(cat .env.production | grep -v '^#' | xargs)

# Check required environment variables
if [ -z "$DB_PASSWORD" ] || [ -z "$JWT_SECRET" ] || [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Missing required environment variables!"
    echo "   Please set: DB_PASSWORD, JWT_SECRET, OPENAI_API_KEY"
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Remove old images
echo "🧹 Cleaning up old images..."
docker system prune -f

# Build and start production services
echo "🔨 Building and starting production services..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Health check
echo "🏥 Performing health checks..."

# Check backend
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    docker-compose -f docker-compose.prod.yml logs frontend
    exit 1
fi

# Check database
if docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ Database is healthy"
else
    echo "❌ Database health check failed"
    docker-compose -f docker-compose.prod.yml logs postgres
    exit 1
fi

echo "🎉 Production deployment successful!"
echo ""
echo "🌐 Services:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "   Database: localhost:5432"
echo ""
echo "📊 Management commands:"
echo "   View logs:    docker-compose -f docker-compose.prod.yml logs -f"
echo "   Stop services: docker-compose -f docker-compose.prod.yml down"
echo "   Restart:      docker-compose -f docker-compose.prod.yml restart"
echo ""
echo "🔒 Security reminders:"
echo "   - Update SSL certificates in ./ssl/"
echo "   - Configure firewall rules"
echo "   - Set up monitoring and backups"
echo "   - Update domain names in nginx.prod.conf"
