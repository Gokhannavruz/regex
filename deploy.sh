#!/bin/bash

# Regex Tester Pro Deployment Script

echo "🚀 Starting Regex Tester Pro deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cat > .env << EOF
# Database
DB_PASSWORD=your_secure_password_here

# JWT Secret
JWT_SECRET=$(openssl rand -base64 32)

# OpenAI API Key
OPENAI_API_KEY=sk-your-openai-key

# Frontend URL
FRONTEND_URL=http://localhost:3000

# API URL
VITE_API_URL=http://localhost:5000/api
EOF
    echo "⚠️  Please edit .env file with your actual values before continuing."
    echo "Press Enter to continue after editing .env..."
    read
fi

# Build and start services
echo "🔨 Building and starting services..."

# Stop existing containers
docker-compose down

# Build and start
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running!"
    echo ""
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:5000"
    echo "🗄️  Database: localhost:5432"
    echo ""
    echo "📊 View logs: docker-compose logs -f"
    echo "🛑 Stop services: docker-compose down"
else
    echo "❌ Some services failed to start. Check logs:"
    docker-compose logs
    exit 1
fi

echo "🎉 Deployment complete!"
