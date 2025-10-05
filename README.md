# AI-Powered Chatbot Interface
> **Full-Stack Developer Technical Test**  
> Built with **Cursor AI** for enhanced productivity and code quality

A modern, full-stack AI chatbot application with multiple AI models and complete bilingual support (English/Arabic). Built with React, TypeScript, Node.js, and Docker.

---

## 🎯 Features

- **5 AI Models**: LLaMA 3.2, Phi-3, Gemma, Qwen, TinyLlama (all local via Ollama)
- **Real-time Streaming**: Server-Sent Events for instant AI responses
- **Bilingual Support**: Complete English and Arabic with RTL layout
- **JWT Authentication**: Secure user authentication and authorization
- **Chat History**: Persistent storage with auto-generated titles
- **AI Summaries**: Personalized bilingual summaries based on chat history
- **Export Function**: Download chat history as text
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Clean Architecture**: Modular, reusable components and services

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
- **AI**: Ollama (5 local models, no API keys) with Server-Sent Events streaming
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

### Setup & Run

**Step 1: Configure Environment (Optional)**
```bash
# The run script will auto-create .env from env.example
# But you can customize it first if needed:
cp env.example .env
# Edit .env and change JWT_SECRET (recommended for production)
```

**Step 2: Run the Application**
```bash
# Linux/Mac
./run.sh

# Windows
run.bat
```

**What the script does**:
1. Starts all 5 Docker containers
2. Downloads AI models (LLaMA, Phi-3, Gemma, Qwen, TinyLlama)
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
- **POST** `/chat/stream` - Stream AI response (Server-Sent Events)
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

All models run **locally via Ollama** with **real-time streaming** - no external API keys needed.

| Model | Size | Best For |
|-------|------|----------|
| **LLaMA 3.2:3b** | 2GB | Primary - excellent quality |
| **Phi-3 Mini** | 2.2GB | Fast and efficient |
| **Gemma 2B** | 1.7GB | Ultra lightweight |
| **Qwen 2.5 3B** | 1.9GB | Multilingual + Arabic |
| **TinyLlama** | 637MB | Ultra fast responses |

**Installation**: Auto-installed by `run.sh` (no manual steps needed)

**Manual install** (if needed):
```bash
docker exec ai-chatbot-ollama ollama pull llama3.2:3b
docker exec ai-chatbot-ollama ollama pull phi3:mini
docker exec ai-chatbot-ollama ollama pull gemma:2b
docker exec ai-chatbot-ollama ollama pull qwen2.5:3b
docker exec ai-chatbot-ollama ollama pull tinyllama:latest
```

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
3. **English Chat** → Ask: "What is AI?" (see real-time streaming)
4. **Switch to Arabic** → Ask: "ما هو الذكاء الاصطناعي؟"
5. **Verify RTL** → Check right-to-left layout
6. **Test Streaming** → Watch responses appear in real-time
7. **Generate Summary** → Profile → Generate AI Summary
8. **Export Chat** → Profile → Export Chat History
9. **Delete Chat** → Chat Sidebar → Delete

---

## 📊 Project Statistics

- **Lines of Code**: ~7,000
- **Languages**: TypeScript (90%), JavaScript, SQL, Shell
- **React Components**: 20+ (modular, reusable)
- **API Endpoints**: 13 REST + 1 SSE streaming
- **AI Models**: 5 local models with real-time streaming
- **Translations**: English + Arabic (100+ keys each)
- **Docker Services**: 5 (Frontend, Backend, Nginx, Redis, Ollama)
- **Database Tables**: 4
- **Architecture**: Clean, modular, streaming-enabled, auto-migrations

---

## 🎥 Video Demo

**YouTube Link**: [Upload your 2-3 minute demo here]

**Required Content** (2-3 minutes):
1. Code structure walkthrough
2. Signup/Login flow
3. Chat in English with AI
4. Switch language to Arabic
5. Chat in Arabic (RTL layout)
6. AI summary generation
7. Model selection & features

📝 **See [VIDEO_SCRIPT.md](VIDEO_SCRIPT.md) for detailed recording guide**

---

## 📝 Configuration

All configuration is done via the `.env` file (auto-created from `env.example`).

**Key Variables**:

| Variable | Description | Default | Change Needed? |
|----------|-------------|---------|----------------|
| `JWT_SECRET` | Authentication secret key | Random string | ⚠️ **YES** for production |
| `CORS_ORIGIN` | Frontend URL | `http://localhost:3000` | Only if different port |
| `OLLAMA_BASE_URL` | Ollama AI server URL | `http://ollama:11434` | Only for external Ollama |
| `OLLAMA_NUM_THREADS` | AI processing threads | `4` | Optional (4-16) |
| `VITE_API_URL` | Backend API URL | `http://localhost:4000/api` | Only if different port |

**Setup**:
```bash
# Auto-created by run.sh, or manually:
cp env.example .env

# Generate secure JWT_SECRET:
openssl rand -base64 32
```

See `env.example` for detailed comments and instructions.

---

## 🙏 Acknowledgments

- **Ollama** - Local AI model serving
- **React Query** - Powerful data fetching
- **Prisma** - TypeScript ORM
- **i18next** - Internationalization framework
- **Tailwind CSS** - Utility-first CSS
- **Redis** - High-performance caching

---

**Built with ❤️ using modern web technologies**
