# Backend Dockerfile - Multi-stage build for production
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    libc6-compat \
    curl \
    dumb-init \
    su-exec

# Set working directory
WORKDIR /app

# Dependencies stage
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

# Set environment
ENV NODE_ENV=production
ENV PORT=4000
ENV DATABASE_URL=file:/app/data/prisma/dev.db

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Generate Prisma client in production stage
RUN npx prisma generate

# Create data directory for SQLite database
RUN mkdir -p /app/data/prisma

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4000/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Auto-apply schema changes on startup (creates DB or updates schema), then start the application
CMD ["sh", "-c", "echo '🔄 Checking database schema...' && npx prisma db push --skip-generate && echo '✅ Database schema is up to date' && node dist/index.js"]