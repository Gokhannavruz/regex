# Regex Tester Pro - Full Stack Application

A comprehensive regex testing application with AI assistance, user authentication, and pattern management.

## 🏗️ Architecture

```
Frontend (React/Vite) → Backend (Node.js/Express) → Database (PostgreSQL) → AI Service (OpenAI)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb regex_tester

# Run schema
psql regex_tester < backend/schema.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials and OpenAI API key
npm run dev
```

### 3. Frontend Setup

```bash
# In the root directory
npm install
npm run dev
```

### 4. Docker Setup (Alternative)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## 📁 Project Structure

```
regex-tester/
├── src/                    # React frontend
│   ├── services/          # API service layer
│   └── App.tsx            # Main application
├── backend/               # Node.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth & rate limiting
│   │   ├── utils/         # Regex utilities
│   │   └── server.js      # Main server
│   ├── schema.sql         # Database schema
│   └── Dockerfile
├── docker-compose.yml     # Container orchestration
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=regex_tester
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRE=7d

# OpenAI (for AI features)
OPENAI_API_KEY=sk-your-openai-key

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
```

## 🎯 Features

### Free Tier
- ✅ Real-time regex testing
- ✅ Pattern explanation
- ✅ Multiple language support
- ✅ 100 tests per day (rate limited)

### Pro Tier ($5/month)
- ✅ Unlimited testing
- ✅ AI regex generation (10/day)
- ✅ Save unlimited patterns
- ✅ Community library access
- ✅ Team sharing

### Enterprise ($50/month)
- ✅ API access
- ✅ Custom integrations
- ✅ Priority support
- ✅ Team collaboration

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Regex Testing
- `POST /api/regex/test` - Test regex pattern
- `POST /api/regex/explain` - Explain regex pattern
- `POST /api/regex/save` - Save pattern (authenticated)
- `GET /api/regex/saved` - Get saved patterns
- `DELETE /api/regex/saved/:id` - Delete saved pattern
- `GET /api/regex/library` - Community library

### AI Features
- `POST /api/ai/generate` - Generate regex from description
- `POST /api/ai/improve` - Improve existing regex

## 🚀 Deployment

### Option 1: Railway.app (Recommended)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy backend
cd backend
railway login
railway init
railway up

# Deploy frontend to Vercel
cd ..
vercel
```

### Option 2: DigitalOcean App Platform

1. Connect GitHub repository
2. Auto-detect Node.js backend
3. Add PostgreSQL database
4. Deploy frontend separately

### Option 3: Docker Production

```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 🛠️ Development

### Backend Development

```bash
cd backend
npm run dev          # Start with nodemon
npm start           # Production start
```

### Frontend Development

```bash
npm run dev         # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Database Management

```bash
# Connect to database
psql regex_tester

# Run migrations
psql regex_tester < backend/schema.sql

# Reset database
dropdb regex_tester && createdb regex_tester
psql regex_tester < backend/schema.sql
```

## 📊 Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email
- `password_hash` - Hashed password
- `username` - Display name
- `created_at` - Timestamp

### Saved Regex Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `title` - Pattern title
- `pattern` - Regex pattern
- `flags` - Regex flags
- `description` - Pattern description
- `test_string` - Example test string
- `language` - Programming language
- `is_public` - Public visibility
- `usage_count` - Usage statistics

### Regex Library Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `title` - Pattern title
- `pattern` - Regex pattern
- `category` - Pattern category
- `tags` - Search tags
- `upvotes` - Community votes
- `views` - View count

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention

## 🎨 UI Features

- Real-time regex testing
- Syntax highlighting
- Pattern explanation
- AI-powered generation
- User authentication
- Pattern management
- Community library
- Responsive design

## 📈 Performance

- Rate limiting (100 requests/15min)
- Database indexing
- Response compression
- Caching strategies
- Error handling

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
npm test
```

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

- Documentation: [GitHub Wiki](https://github.com/your-repo/wiki)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)
- Email: support@regextester.com
