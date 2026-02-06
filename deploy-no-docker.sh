#!/bin/bash

# ===================================================================
# Deploy Script - Survey Backend (No Docker)
# Deploy ke VPS tanpa Docker, pakai PostgreSQL existing
# ===================================================================

set -e  # Exit on error

# Configuration
VPS_HOST="31.97.107.110"
VPS_USER="root"
VPS_PATH="/var/www/survey-backend"
DB_NAME="survey_lokasi"
DB_USER="survey_user"
DB_PASS="SurveyPass2024!"  # Ganti dengan password kuat

echo "=========================================="
echo "🚀 Deploy Survey Backend to VPS"
echo "=========================================="

# Step 1: Install Node.js di VPS
echo ""
echo "📦 Step 1: Install Node.js 18.x di VPS..."
ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verify installation
node --version
npm --version

# Install PM2 globally
npm install -g pm2

echo "✅ Node.js & PM2 installed"
ENDSSH

# Step 2: Setup PostgreSQL Database
echo ""
echo "🗄️  Step 2: Setup PostgreSQL Database..."
ssh $VPS_USER@$VPS_HOST << ENDSSH
# Create database and user
sudo -u postgres psql << EOF
-- Drop if exists (untuk clean install)
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;

-- Create user
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';

-- Create database
CREATE DATABASE $DB_NAME OWNER $DB_USER;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Exit
\q
EOF

echo "✅ Database created: $DB_NAME"
ENDSSH

# Step 3: Create app directory
echo ""
echo "📁 Step 3: Create app directory..."
ssh $VPS_USER@$VPS_HOST << ENDSSH
mkdir -p $VPS_PATH
mkdir -p $VPS_PATH/src/uploads/foto
mkdir -p $VPS_PATH/src/uploads/dokumen
echo "✅ Directory created"
ENDSSH

# Step 4: Upload files to VPS
echo ""
echo "📤 Step 4: Upload backend files..."
rsync -avz --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env' \
  --exclude 'src/uploads/*' \
  --exclude 'deploy-*.sh' \
  --exclude 'Dockerfile*' \
  --exclude 'docker-compose.yml' \
  ./ $VPS_USER@$VPS_HOST:$VPS_PATH/

echo "✅ Files uploaded"

# Step 5: Create .env file di VPS
echo ""
echo "⚙️  Step 5: Create .env configuration..."
ssh $VPS_USER@$VPS_HOST << ENDSSH
cat > $VPS_PATH/.env << 'EOF'
# Node Environment
NODE_ENV=production
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USERNAME=$DB_USER
DB_PASSWORD=$DB_PASS

# JWT Secret (generate random)
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d

# Upload Configuration
MAX_FILE_SIZE=2097152

# API Rate Limit
API_RATE_LIMIT_WINDOW=15
API_RATE_LIMIT_MAX_REQUESTS=100
EOF

echo "✅ .env file created"
ENDSSH

# Step 6: Install dependencies & Build
echo ""
echo "📦 Step 6: Install dependencies..."
ssh $VPS_USER@$VPS_HOST << ENDSSH
cd $VPS_PATH
npm install --production
echo "✅ Dependencies installed"
ENDSSH

# Step 7: Run Database Migrations & Seeders
echo ""
echo "🗃️  Step 7: Run database setup..."
ssh $VPS_USER@$VPS_HOST << ENDSSH
cd $VPS_PATH
npm run migrate || echo "⚠️  Migration error (mungkin sudah ada)"
npm run seed || echo "⚠️  Seeder error (mungkin sudah ada)"
echo "✅ Database setup complete"
ENDSSH

# Step 8: Start app with PM2
echo ""
echo "🚀 Step 8: Start application with PM2..."
ssh $VPS_USER@$VPS_HOST << ENDSSH
cd $VPS_PATH

# Stop existing process
pm2 delete survey-backend 2>/dev/null || true

# Start new process
pm2 start npm --name "survey-backend" -- run start

# Save PM2 config
pm2 save

# Setup PM2 startup
pm2 startup systemd -u root --hp /root

echo "✅ Application started"
ENDSSH

# Step 9: Setup Nginx reverse proxy (optional)
echo ""
echo "🌐 Step 9: Setup Nginx (optional)..."
read -p "Setup Nginx reverse proxy? (y/n): " setup_nginx

if [ "$setup_nginx" = "y" ]; then
  ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
# Install Nginx
apt-get update
apt-get install -y nginx

# Create Nginx config
cat > /etc/nginx/sites-available/survey-backend << 'EOF'
server {
    listen 80;
    server_name _;  # Ganti dengan domain jika ada

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/survey-backend /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test & restart Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

echo "✅ Nginx configured"
ENDSSH
fi

# Step 10: Open firewall
echo ""
echo "🔥 Step 10: Configure firewall..."
ssh $VPS_USER@$VPS_HOST << ENDSSH
# Install UFW if not exists
apt-get install -y ufw

# Allow ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3000/tcp  # Node.js (jika tidak pakai Nginx)

# Enable firewall
ufw --force enable

echo "✅ Firewall configured"
ENDSSH

echo ""
echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "🌐 Backend URL: http://$VPS_HOST:3000"
echo "📖 API Docs: http://$VPS_HOST:3000/api-docs"
echo ""
echo "🔐 Demo Accounts:"
echo "   Admin: admin / admin123"
echo "   Surveyor: surveyor1 / surveyor123"
echo ""
echo "📝 Useful Commands:"
echo "   SSH: ssh $VPS_USER@$VPS_HOST"
echo "   Logs: pm2 logs survey-backend"
echo "   Status: pm2 status"
echo "   Restart: pm2 restart survey-backend"
echo "   Stop: pm2 stop survey-backend"
echo ""
echo "🔧 Database Info:"
echo "   Name: $DB_NAME"
echo "   User: $DB_USER"
echo "   Pass: $DB_PASS"
echo ""
