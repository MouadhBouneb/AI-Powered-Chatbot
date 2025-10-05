#!/bin/bash

# Database and Configuration Backup Script
# This script backs up the SQLite database and environment configuration

set -e

echo "🔄 AI Chatbot - Backup Script"
echo "============================="
echo ""

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="ai-chatbot-backend"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ Error: Backend container is not running"
    echo "   Start the application first: ./run.sh"
    exit 1
fi

echo "📦 Creating backup..."

# Backup SQLite database
echo "📊 Backing up database..."
docker cp "$CONTAINER_NAME:/app/data/prisma/dev.db" "$BACKUP_DIR/db_$DATE.db"
if [ $? -eq 0 ]; then
    echo "✅ Database backup created: $BACKUP_DIR/db_$DATE.db"
else
    echo "❌ Failed to backup database"
    exit 1
fi

# Backup environment file (if exists)
if [ -f ".env" ]; then
    echo "⚙️  Backing up environment configuration..."
    cp ".env" "$BACKUP_DIR/env_$DATE.backup"
    echo "✅ Environment backup created: $BACKUP_DIR/env_$DATE.backup"
fi

# Create backup metadata
cat > "$BACKUP_DIR/backup_$DATE.info" <<EOF
Backup Date: $(date)
Database File: db_$DATE.db
Environment File: env_$DATE.backup
Container: $CONTAINER_NAME
EOF

echo ""
echo "✅ Backup completed successfully!"
echo ""
echo "📁 Backup location: $BACKUP_DIR/"
echo "📊 Database: db_$DATE.db"
echo "⚙️  Environment: env_$DATE.backup"
echo "📝 Info: backup_$DATE.info"
echo ""
echo "💡 To restore this backup, run:"
echo "   ./scripts/restore.sh $DATE"
echo ""

# Cleanup old backups (keep last 10)
echo "🧹 Cleaning up old backups (keeping last 10)..."
cd "$BACKUP_DIR"
ls -t db_*.db | tail -n +11 | xargs -r rm
ls -t env_*.backup | tail -n +11 | xargs -r rm
ls -t backup_*.info | tail -n +11 | xargs -r rm
echo "✅ Cleanup completed"
echo ""

