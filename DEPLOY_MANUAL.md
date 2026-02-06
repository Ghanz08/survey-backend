# 📘 Manual Deploy Guide - Survey Backend ke VPS

## 🎯 Overview

Deploy backend Survey Lokasi Objek ke VPS Ubuntu 24.04 secara manual step-by-step.

**VPS Info:**

- IP: 31.97.107.110
- OS: Ubuntu 24.04.3 LTS
- RAM: 7.8GB
- Disk: 96GB
- PostgreSQL: Sudah terinstall

---

## 📋 Step-by-Step Deployment

### 1️⃣ SSH ke VPS

```bash
# Dari Mac
ssh root@31.97.107.110
```

### 2️⃣ Install Node.js 20.x (LTS)

```bash
# Install Node.js 20.x (LTS - Long Term Support)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verify installation
node --version   # Should show v20.x.x
npm --version    # Should show npm version
```

**Note:** Node.js 20.x adalah versi LTS (Long Term Support) yang akan didukung hingga April 2026. Jangan pakai Node.js 18.x karena sudah End of Life.

### 3️⃣ Install PM2 (Process Manager)

```bash
npm install -g pm2

# Verify
pm2 --version
```

### 4️⃣ Setup Database PostgreSQL

**PostgreSQL sudah terinstall. Kita akan pakai user `postgres` (superuser default).**

#### **Setup via Terminal (RECOMMENDED)**

```bash
# Di VPS - Login sebagai postgres user (no password needed)
sudo -u postgres psql
```

**Di dalam psql, create database:**

```sql
-- Drop database jika sudah ada (opsional, untuk clean install)
DROP DATABASE IF EXISTS survey_lokasi;

-- Create database untuk survey app
CREATE DATABASE survey_lokasi OWNER postgres;

-- Lihat semua databases
\l

-- Keluar dari psql
\q
```

**Verify database:**

```bash
# Test koneksi
sudo -u postgres psql -d survey_lokasi -c "SELECT version();"
```

---

**Note:** Menggunakan user `postgres` (superuser default PostgreSQL).

### 5️⃣ Create Application Directory

```bash
# Buat directory untuk aplikasi
mkdir -p /var/www/survey-backend
cd /var/www/survey-backend

# Buat directory untuk uploads
mkdir -p src/uploads/foto
mkdir -p src/uploads/dokumen
```

### 6️⃣ Upload Files dari Mac ke VPS

**Di Mac (terminal baru, jangan close SSH VPS):**

```bash
# Dari Mac, pindah ke folder backend
cd /Users/ghanizulhusnibahri/dev/survey-backend

# Upload ke VPS menggunakan rsync
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env' \
  --exclude 'src/uploads/*' \
  --exclude 'deploy-*.sh' \
  --exclude 'Dockerfile*' \
  --exclude 'docker-compose.yml' \
  ./ root@31.97.107.110:/var/www/survey-backend/

# Tunggu sampai selesai upload
```

**Alternatif jika rsync error, pakai scp:**

```bash
# Dari Mac
cd /Users/ghanizulhusnibahri/dev/survey-backend

# Zip dulu
tar -czf backend.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.env' \
  --exclude='src/uploads/*' \
  .

# Upload
scp backend.tar.gz root@31.97.107.110:/tmp/

# Di VPS, extract
cd /var/www/survey-backend
tar -xzf /tmp/backend.tar.gz
```

### 7️⃣ Create .env File di VPS

**Di VPS:**

```bash
cd /var/www/survey-backend

# Generate JWT secret random
JWT_SECRET=$(openssl rand -base64 32)

# Create .env file (using existing PostgreSQL credentials)
cat > .env << 'EOF'
# Node Environment
NODE_ENV=production
PORT=3000

# Database Configuration (existing PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=survey_lokasi
DB_USERNAME=postgres
DB_PASSWORD=

# JWT Secret (randomly generated)
JWT_SECRET=PLACEHOLDER_JWT_SECRET
JWT_EXPIRES_IN=7d

# Upload Configuration
MAX_FILE_SIZE=2097152

# API Rate Limit
API_RATE_LIMIT_WINDOW=15
API_RATE_LIMIT_MAX_REQUESTS=100
EOF

# Replace placeholder with actual JWT secret
sed -i "s|PLACEHOLDER_JWT_SECRET|$JWT_SECRET|g" .env

# Verify .env
cat .env
```

**Note:** Menggunakan user `postgres` tanpa password (peer authentication). Database `survey_lokasi` sudah dibuat di step sebelumnya.

### 8️⃣ Install Dependencies

```bash
cd /var/www/survey-backend

# Install production dependencies
npm install --production

# Tunggu sampai selesai (might take a few minutes)
```

### 9️⃣ Run Database Migrations

```bash
cd /var/www/survey-backend

# Run migrations
npx sequelize-cli db:migrate

# Check hasil
# Seharusnya table t_user dan t_data_survey sudah terbuat
```

**Verify tables:**

```bash
sudo -u postgres psql -d survey_lokasi -c "\dt"
```

Output seharusnya ada:

- t_user
- t_data_survey
- SequelizeMeta

### 🔟 Run Database Seeders

```bash
cd /var/www/survey-backend

# Run seeders (create demo users)
npx sequelize-cli db:seed:all
```

**Verify users:**

```bash
sudo -u postgres psql -d survey_lokasi -c "SELECT username, role_user FROM t_user;"
```

Output seharusnya ada:

- admin (role_user: 1)
- surveyor1 (role_user: 2)

### 1️⃣1️⃣ Test Run Application

```bash
cd /var/www/survey-backend

# Test run (sementara)
NODE_ENV=production npm start
```

**Buka browser atau test dari Mac:**

```bash
# Dari Mac
curl http://31.97.107.110:3000/

# Seharusnya return JSON:
# {"success":true,"message":"Survey Lokasi API is running",...}
```

**Stop test dengan CTRL+C di VPS**

### 1️⃣2️⃣ Start dengan PM2 (Production)

```bash
cd /var/www/survey-backend

# Start dengan PM2
pm2 start npm --name "survey-backend" -- run start

# Save PM2 config
pm2 save

# Setup PM2 auto-start on reboot
pm2 startup systemd
# (akan muncul command, copy & jalankan command tersebut)

# Check status
pm2 status
pm2 logs survey-backend --lines 50
```

### 1️⃣3️⃣ Setup Firewall

```bash
# Install UFW
apt-get install -y ufw

# Allow SSH (PENTING!)
ufw allow 22/tcp

# Allow HTTP & HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow Node.js port
ufw allow 3000/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status
```

### 1️⃣4️⃣ Setup Nginx Reverse Proxy (Optional)

**Install Nginx:**

```bash
apt-get update
apt-get install -y nginx
```

**Create Nginx config:**

```bash
cat > /etc/nginx/sites-available/survey-backend << 'EOF'
server {
    listen 80;
    server_name _;  # Ganti dengan domain jika punya

    # Increase upload size
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
```

**Enable site:**

```bash
# Enable site
ln -sf /etc/nginx/sites-available/survey-backend /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

# Check status
systemctl status nginx
```

---

## ✅ Testing & Verification

### Test dari Mac:

```bash
# 1. Health check
curl http://31.97.107.110:3000/

# 2. Login
curl -X POST http://31.97.107.110:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq

# 3. API Documentation
# Buka browser: http://31.97.107.110:3000/api-docs

# 4. Get surveys (with token dari step 2)
TOKEN="your_token_here"
curl -X GET http://31.97.107.110:3000/api/survey \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Test dari Flutter:

```dart
// lib/config/api_config.dart
class ApiConfig {
  static const String baseUrl = 'http://31.97.107.110:3000';

  static const String login = '/api/auth/login';
  static const String surveys = '/api/survey';
  // ...
}
```

---

## 🔧 Useful Commands di VPS

### PM2 Commands:

```bash
# Lihat status
pm2 status

# Lihat logs
pm2 logs survey-backend

# Restart aplikasi
pm2 restart survey-backend

# Stop aplikasi
pm2 stop survey-backend

# Start aplikasi
pm2 start survey-backend

# Delete dari PM2
pm2 delete survey-backend

# Monitor resource usage
pm2 monit
```

### Application Management:

```bash
# Lihat directory
ls -lah /var/www/survey-backend

# Lihat logs aplikasi
tail -f /root/.pm2/logs/survey-backend-out.log
tail -f /root/.pm2/logs/survey-backend-error.log

# Check disk usage
df -h

# Check memory
free -h

# Check running processes
ps aux | grep node
```

### Database Commands:

```bash
# Login ke PostgreSQL
sudo -u postgres psql -d survey_lokasi

# List tables
\dt

# Query users
SELECT * FROM t_user;

# Query surveys
SELECT * FROM t_data_survey;

# Exit
\q
```

### Nginx Commands:

```bash
# Test config
nginx -t

# Restart
systemctl restart nginx

# Status
systemctl status nginx

# Logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🔄 Update Backend (Deploy Ulang)

Kalau ada perubahan code dan mau deploy ulang:

```bash
# 1. Di Mac, upload lagi
cd /Users/ghanizulhusnibahri/dev/survey-backend
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env' \
  --exclude 'src/uploads/*' \
  ./ root@31.97.107.110:/var/www/survey-backend/

# 2. Di VPS, restart
ssh root@31.97.107.110
cd /var/www/survey-backend
npm install --production  # Jika ada dependency baru
pm2 restart survey-backend
pm2 logs survey-backend
```

---

## 🐛 Troubleshooting

### Backend tidak start:

```bash
# Check logs
pm2 logs survey-backend --lines 100

# Check .env file
cat /var/www/survey-backend/.env

# Test database connection
sudo -u postgres psql -d survey_lokasi -c "SELECT 1;"
```

### Port 3000 tidak accessible:

```bash
# Check if port listening
netstat -tuln | grep :3000

# Check firewall
ufw status

# Check if PM2 running
pm2 status
```

### Database error:

```bash
# Reset database (HATI-HATI!)
sudo -u postgres psql << EOF
DROP DATABASE survey_lokasi;
CREATE DATABASE survey_lokasi OWNER survey_user;
EOF

# Run migrations lagi
cd /var/www/survey-backend
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

---

## 📞 Backend URLs

- **API Base**: `http://31.97.107.110:3000`
- **Health Check**: `http://31.97.107.110:3000/`
- **API Docs**: `http://31.97.107.110:3000/api-docs`
- **Login**: `POST http://31.97.107.110:3000/api/auth/login`
- **Surveys**: `GET http://31.97.107.110:3000/api/survey`

## 🔐 Demo Accounts

- **Admin**: `admin` / `admin123`
- **Surveyor**: `surveyor1` / `surveyor123`

## 🗄️ Database Info

- **Host**: localhost
- **Port**: 5432
- **Database**: survey_lokasi
- **User**: survey_user
- **Password**: SurveyPass2024!

---

**Selamat! Backend sudah production-ready! 🚀**
