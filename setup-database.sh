#!/bin/bash

# Survey Backend - Database Setup Script
# Script untuk membuat database dan user PostgreSQL

echo "=================================="
echo "SETUP DATABASE POSTGRESQL"
echo "=================================="
echo ""

# Database credentials dari .env
DB_NAME="survey_lokasi"
DB_USER="survey_user"
DB_PASSWORD="password123"

echo "📦 Database Name: $DB_NAME"
echo "👤 Database User: $DB_USER"
echo "🔑 Database Password: $DB_PASSWORD"
echo ""

# Cek apakah PostgreSQL sudah running
echo "🔍 Checking PostgreSQL status..."
if ! pg_isready > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running!"
    echo "Please start PostgreSQL first:"
    echo "  - macOS: brew services start postgresql"
    echo "  - Linux: sudo systemctl start postgresql"
    exit 1
fi
echo "✅ PostgreSQL is running"
echo ""

# Create database user
echo "👤 Creating database user..."
psql postgres << EOF
-- Drop user if exists
DROP USER IF EXISTS $DB_USER;

-- Create new user with password
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Grant necessary privileges
ALTER USER $DB_USER WITH CREATEDB;

\du $DB_USER
EOF

if [ $? -eq 0 ]; then
    echo "✅ User created successfully"
else
    echo "❌ Failed to create user"
    exit 1
fi
echo ""

# Create database
echo "📦 Creating database..."
psql postgres << EOF
-- Drop database if exists
DROP DATABASE IF EXISTS $DB_NAME;

-- Create new database
CREATE DATABASE $DB_NAME;

-- Grant all privileges to user
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Connect to database and grant schema privileges
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;

\l $DB_NAME
EOF

if [ $? -eq 0 ]; then
    echo "✅ Database created successfully"
else
    echo "❌ Failed to create database"
    exit 1
fi
echo ""

# Run migrations
echo "🔄 Running database migrations..."
npx sequelize-cli db:migrate

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
else
    echo "❌ Failed to run migrations"
    exit 1
fi
echo ""

# Run seeders
echo "🌱 Running database seeders..."
npx sequelize-cli db:seed:all

if [ $? -eq 0 ]; then
    echo "✅ Seeders completed successfully"
else
    echo "⚠️  Seeders failed (might be already seeded)"
fi
echo ""

echo "=================================="
echo "✅ DATABASE SETUP COMPLETE!"
echo "=================================="
echo ""
echo "You can now start the server with:"
echo "  npm start"
echo ""
echo "Default users:"
echo "  Admin:"
echo "    username: admin"
echo "    password: admin123"
echo "  Surveyor:"
echo "    username: surveyor1"
echo "    password: surveyor123"
echo ""
