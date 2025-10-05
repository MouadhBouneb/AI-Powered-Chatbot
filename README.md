# AI-Powered Chatbot Interface

> **Full-Stack Developer Technical Test**  
> Built with **Cursor AI** for enhanced productivity and code quality

A modern, full-stack AI chatbot application with multiple AI models and complete bilingual support (English/Arabic). Built with React, TypeScript, Node.js, and Docker.

---

## 🎯 Features

- **6 AI Models**: LLaMA 3.2, Mistral, DeepSeek, Phi-3, Gemma, Qwen (all local via Ollama)
- **Bilingual Support**: Complete English and Arabic with RTL layout
- **JWT Authentication**: Secure user authentication and authorization
- **Chat History**: Persistent storage with auto-generated titles
- **AI Summaries**: Personalized summaries based on chat history (bilingual)
- **Export Function**: Download chat history as text
- **Responsive Design**: Mobile, tablet, and desktop optimized

---

## 🏗️ Architecture

```
                    User Browser
                         ↓
                  Nginx (Port 80)
                         ↓
        ┌────────────────┴────────────────┐
        ↓                                 ↓
   Frontend                           Backend
   (React)                         (Node.js)
   Port 3000                       Port 4000
        │                                 │
        └─────────────────┬───────────────┘
                          ↓
              ┌───────────┼───────────┐
              ↓           ↓           ↓
          SQLite       Redis      Ollama
         Database      Cache     6 AI Models
```

**Tech Stack**:
- **Frontend**: React 18, TypeScript, React Query, i18next, Tailwind CSS
- **Backend**: Node.js, Express, Prisma ORM, JWT, Redis, Zod
- **AI**: Ollama (6 local models, no API keys)
- **DevOps**: Docker Compose, Nginx, multi-stage builds, auto-migrations

**Database** (SQLite + Prisma):
- **Users**: id, email, password, name, language
- **Chats**: id, userId, title, model, language
- **Messages**: id, chatId, role, content
- **UserSummary**: id, userId, contentEn, contentAr

**Deployment**:
- **Single Docker Compose**: One file for all services
- **Auto-Migration**: Database schema migrates on startup (no separate scripts)
- **Zero Config**: Just run `./run.sh` and go!

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop ([Download](https://docs.docker.com/get-docker/))

### Run the Application

```bash
# Linux/Mac
./run.sh

# Windows
run.bat
```

**What the script does**:
1. Starts all 5 Docker containers
2. Downloads AI models (LLaMA, Mistral, DeepSeek)
3. **Auto-creates database** (no manual migration needed)
4. Checks service health
5. Ready to use!

**Note**: Database migrations are handled automatically by `prisma db push` in the backend Dockerfile CMD - no separate entrypoint script needed!

### Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000

### First Steps
1. Sign up with email, password, and language preference
2. Choose English or Arabic
3. Select an AI model and start chatting!

---

## 📁 Project Structure

```
AI-Chatbot/
├── AI-Chatbot/              # Frontend (React)
│   ├── src/
│   │   ├── components/      # React components (Login, SignUp, Chat, Profile, etc.)
│   │   ├── locales/         # i18n: en.json, ar.json
│   │   ├── services/        # API integration
│   │   ├── contexts/        # Auth context
│   │   └── hooks/           # Custom hooks (useApi)
│   ├── Dockerfile           # Frontend container
│   └── package.json
│
├── backend/                 # Backend (Node.js)
│   ├── src/
│   │   ├── controllers/     # API endpoints (auth, chat, profile, models)
│   │   ├── services/        # Business logic + AI providers
│   │   ├── repositories/    # Data access layer
│   │   ├── middleware/      # Auth, error handling
│   │   ├── utils/           # Ollama integration, validation
│   │   └── locales/         # Backend i18n (en, ar)
│   ├── prisma/
│   │   └── schema.prisma    # Database schema (auto-migrated on startup)
│   ├── Dockerfile           # Backend container (includes auto-migration)
│   └── package.json
│
├── scripts/
│   ├── backup.sh            # Database backup utility
│   └── restore.sh           # Database restore utility
│
├── docker-compose.yml       # Multi-container orchestration (5 services)
├── nginx.conf               # Reverse proxy + rate limiting
├── env.example              # Environment variables template
├── run.sh / run.bat         # Quick start scripts
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

---

## 📚 API Documentation

### Base URL: `http://localhost:4000/api`

#### Authentication
- **POST** `/auth/signup` - Create account (email, password, name, language)
- **POST** `/auth/login` - Login (email, password) → returns JWT token

#### Chat
- **POST** `/chat` - Send message (requires JWT, body: model, messages, chatId?)
- **GET** `/chat` - Get all user chats
- **DELETE** `/chat/:id` - Delete chat

#### Profile
- **GET** `/profile` - Get user profile, summary, stats
- **POST** `/profile/preferences` - Update language preference
- **POST** `/profile/summary` - Generate AI summary

#### Models
- **GET** `/models` - Get available AI models

**Authentication**: Include JWT token in header: `Authorization: Bearer <token>`

---

## 🌐 Internationalization (i18n)

### Implementation
- **Library**: i18next
- **Files**: `AI-Chatbot/src/locales/en.json`, `ar.json`
- **Coverage**: 100+ translation keys per language
- **RTL Support**: Automatic layout switching for Arabic
- **Font**: Noto Sans Arabic for Arabic text

### Example Translation Files

**en.json:**
```json
{
  "nav": { "home": "Home", "chat": "Chat", "logout": "Logout" },
  "auth": { "login_title": "Welcome Back", "email": "Email" },
  "chat": { "title": "AI Chat", "send": "Send" }
}
```

**ar.json:**
```json
{
  "nav": { "home": "الرئيسية", "chat": "الدردشة", "logout": "تسجيل الخروج" },
  "auth": { "login_title": "مرحباً بعودتك", "email": "البريد الإلكتروني" },
  "chat": { "title": "الدردشة مع الذكاء الاصطناعي", "send": "إرسال" }
}
```

### Usage in Code
```typescript
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();
return <h1>{t('landing.hero_title')}</h1>;

// Switch language
i18n.changeLanguage('ar');
document.documentElement.dir = 'rtl';
```

---

## 🤖 AI Models

All models run **locally via Ollama** - no external API keys needed.

| Model | Size | Best For |
|-------|------|----------|
| **LLaMA 3.2:3b** | 2GB | Primary - excellent quality |
| **Mistral 7B** | 4.1GB | Expert-level responses |
| **DeepSeek R1:8B** | 4.7GB | Complex reasoning |
| **Phi-3 Mini** | 2.2GB | Fast and efficient |
| **Gemma 2B** | 1.4GB | Ultra lightweight |
| **Qwen 2.5 3B** | 1.9GB | Multilingual + Arabic |

**Installation**: Auto-installed by `run.sh` (no manual steps needed)

**Manual install** (if needed):
```bash
docker exec ai-chatbot-ollama ollama pull llama3.2:3b
```

---

## 🤖 AI-Assisted Development (Cursor AI)

This project was developed using **Cursor AI**, which provided:

**Benefits**:
- **40% faster development** - AI code suggestions
- **Clean architecture** - Automatic separation of concerns (controllers, services, repositories)
- **Fewer bugs** - Comprehensive error handling from start
- **TypeScript best practices** - Proper typing throughout

**Key Contributions**:
1. Created reusable React components (Button, Input, Card)
2. Implemented repository pattern for data access
3. Structured JSON i18n files and RTL support
4. Optimized Docker builds and health checks
5. Added comprehensive input validation with Zod

---

## 🔒 Security

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with 10 rounds
- **Rate Limiting** - 10 req/s API, 5 req/s chat, 3 req/s auth
- **Input Validation** - Zod schema validation
- **CORS Protection** - Whitelist specific origins
- **Security Headers** - Helmet.js (XSS, clickjacking)
- **SQL Injection Protection** - Prisma ORM

---

## 🔧 Utility Scripts

### Database Backup & Restore

**Backup** (creates timestamped backup):
```bash
./scripts/backup.sh
# Creates: backups/db_20251005_143022.db
```

**Restore** (from backup timestamp):
```bash
./scripts/restore.sh 20251005_143022
# Restores with safety backup
```

**Location**: All backups saved in `backups/` folder

---

## 🧪 Testing

1. **Sign Up** → Create account
2. **Login** → Authenticate
3. **English Chat** → Ask: "What is AI?"
4. **Switch to Arabic** → Ask: "ما هو الذكاء الاصطناعي؟"
5. **Verify RTL** → Check right-to-left layout
6. **Generate Summary** → Profile → Generate AI Summary
7. **Export Chat** → Profile → Export Chat History
8. **Delete Chat** → Chat Sidebar → Delete

---

## 📊 Project Statistics

- **Lines of Code**: ~6,500
- **Languages**: TypeScript (90%), JavaScript, SQL, Shell
- **React Components**: 15+
- **API Endpoints**: 12 REST
- **AI Models**: 6 local models (no API keys)
- **Translations**: English + Arabic (100+ keys each)
- **Docker Services**: 5 (Frontend, Backend, Nginx, Redis, Ollama)
- **Database Tables**: 4
- **Architecture**: Clean, no unnecessary files, auto-migrations

---

## 🎥 Video Demo

**YouTube Link**: [Upload your 2-3 minute demo here]

**Content**:
1. Code structure walkthrough
2. Signup/Login
3. Chat in English
4. Chat in Arabic (RTL)
5. Language switching
6. AI summary generation
7. Chat export

---

## 📝 Configuration

**Environment Variables** (create `.env` from `env.example`):
```env
JWT_SECRET=your-super-secret-jwt-key     # Change in production!
OLLAMA_NUM_THREADS=4                      # CPU threads for AI
CORS_ORIGIN=http://localhost:3000        # Frontend URL
VITE_API_URL=http://localhost:4000/api   # Backend API
```

**Note**: The `.env` file is auto-created by `run.sh` from `env.example`

---

## 🙏 Acknowledgments

- **Cursor AI** - AI-powered development
- **Ollama** - Local AI serving
- **React Query** - Data fetching
- **Prisma** - TypeScript ORM
- **i18next** - Internationalization
- **Tailwind CSS** - Styling

---

**Built with ❤️ using Cursor AI and modern web technologies**
