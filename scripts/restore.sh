#!/bin/bash

# Database and Configuration Restore Script
# This script restores the SQLite database from a backup

set -e

echo "🔄 AI Chatbot - Restore Script"
echo "==============================="
echo ""

# Configuration
BACKUP_DIR="./backups"
CONTAINER_NAME="ai-chatbot-backend"

# Check if backup timestamp is provided
if [ -z "$1" ]; then
    echo "❌ Error: Backup timestamp required"
    echo ""
    echo "Usage: ./scripts/restore.sh YYYYMMDD_HHMMSS"
    echo ""
    echo "Available backups:"
    ls -1 "$BACKUP_DIR"/db_*.db 2>/dev/null | sed 's/.*db_\(.*\)\.db/  \1/' || echo "  No backups found"
    echo ""
    exit 1
fi

TIMESTAMP=$1
DB_BACKUP="$BACKUP_DIR/db_$TIMESTAMP.db"
ENV_BACKUP="$BACKUP_DIR/env_$TIMESTAMP.backup"

# Verify backup exists
if [ ! -f "$DB_BACKUP" ]; then
    echo "❌ Error: Backup not found: $DB_BACKUP"
    echo ""
    echo "Available backups:"
    ls -1 "$BACKUP_DIR"/db_*.db 2>/dev/null | sed 's/.*db_\(.*\)\.db/  \1/' || echo "  No backups found"
    exit 1
fi

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ Error: Backend container is not running"
    echo "   Start the application first: ./run.sh"
    exit 1
fi

# Confirmation
echo "⚠️  WARNING: This will replace the current database!"
echo ""
echo "📊 Backup file: $DB_BACKUP"
echo "📅 Backup date: $(stat -f%Sm -t "%Y-%m-%d %H:%M:%S" "$DB_BACKUP" 2>/dev/null || stat -c%y "$DB_BACKUP" 2>/dev/null || echo "Unknown")"
echo ""
read -p "Are you sure you want to restore this backup? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Restore cancelled"
    exit 0
fi

# Create a backup of current database before restore
echo "📦 Creating safety backup of current database..."
SAFETY_DATE=$(date +%Y%m%d_%H%M%S)
docker cp "$CONTAINER_NAME:/app/data/prisma/dev.db" "$BACKUP_DIR/db_before_restore_$SAFETY_DATE.db"
echo "✅ Safety backup created: db_before_restore_$SAFETY_DATE.db"
echo ""

# Stop the backend container
echo "⏸️  Stopping backend container..."
docker-compose stop backend

# Restore database
echo "📊 Restoring database..."
docker cp "$DB_BACKUP" "$CONTAINER_NAME:/app/data/prisma/dev.db"
if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully"
else
    echo "❌ Failed to restore database"
    echo "   Safety backup available at: $BACKUP_DIR/db_before_restore_$SAFETY_DATE.db"
    exit 1
fi

# Restore environment file if exists
if [ -f "$ENV_BACKUP" ]; then
    echo "⚙️  Restoring environment configuration..."
    read -p "Restore environment file? (yes/no): " -r
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        cp ".env" ".env.backup_$SAFETY_DATE" 2>/dev/null || true
        cp "$ENV_BACKUP" ".env"
        echo "✅ Environment restored"
    fi
fi

# Start the backend container
echo "▶️  Starting backend container..."
docker-compose start backend

echo ""
echo "✅ Restore completed successfully!"
echo ""
echo "🔍 Verify the restore:"
echo "   docker-compose logs backend"
echo ""
echo "💡 If something went wrong, restore the safety backup:"
echo "   ./scripts/restore.sh before_restore_$SAFETY_DATE"
echo ""

