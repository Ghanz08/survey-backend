# 🐳 Docker Deployment Guide - Survey Backend

## 🎯 Overview

Deploy backend Survey Lokasi Objek ke VPS menggunakan **Docker & Docker Compose** (Best Practice).

**Kenapa Docker?**

- ✅ **Isolated Environment** - Aplikasi dan dependencies terisolasi dalam container
- ✅ **Consistent** - Sama di development, staging, dan production
- ✅ **Easy Rollback** - Bisa rollback ke versi sebelumnya dengan cepat
- ✅ **Scalable** - Mudah scale up/down dengan orchestration
- ✅ **Portable** - Bisa deploy ke cloud mana saja (AWS, Azure, GCP, etc.)

**Database Safety dengan Docker:**

- ✅ **Data Persistence** - PostgreSQL data disimpan di Docker volume (persistent storage)
- ✅ **Backup Easy** - Volume bisa di-backup dengan mudah
- ✅ **Isolated Network** - Database hanya accessible dari backend container (security)
- ✅ **Health Checks** - Auto-restart jika container unhealthy
- ✅ **Environment Variables** - Password dan secrets tersimpan aman di .env

---

## 📋 Quick Start Deployment

### 1️⃣ SSH ke VPS

```bash
# Dari Mac
ssh root@31.97.107.110
```

### 2️⃣ Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt-get update
apt-get install -y docker-compose-plugin

# Verify installation
docker --version
docker compose version

# Enable Docker service
systemctl enable docker
systemctl start docker
```

### 3️⃣ Setup GitHub Repository (FIRST TIME ONLY)

**Di Mac - Push code ke GitHub:**

Lihat **[GITHUB_SETUP.md](GITHUB_SETUP.md)** untuk tutorial lengkap.

**Quick commands:**

```bash
# Di Mac
cd /Users/ghanizulhusnibahri/dev/survey-backend

# Initialize & push (jika belum)
git init
git add .
git commit -m "Initial commit: Survey Backend API"
git remote add origin https://github.com/YOUR_USERNAME/survey-backend.git
git push -u origin main
```

### 4️⃣ Clone Repository ke VPS

**Di VPS:**

```bash
# Clone dari GitHub
cd /var/www
git clone https://github.com/YOUR_USERNAME/survey-backend.git
cd survey-backend

# Verify files
ls -la
```

**Note:** Ganti `YOUR_USERNAME` dengan GitHub username Anda.

# Tunggu sampai selesai upload

````

### 5️⃣ Setup Environment Variables

**Di VPS:**

```bash
cd /var/www/survey-backend

# Generate JWT secret only (DB password kosong untuk peer auth)
JWT_SECRET=$(openssl rand -base64 32)

# Create .env file
cat > .env << EOF
# Database Password (kosong - menggunakan peer authentication VPS PostgreSQL)
DB_PASSWORD=

# JWT Secret
JWT_SECRET=$JWT_SECRET
EOF

# Verify .env
cat .env
````

**PENTING:** Simpan JWT secret ini di tempat aman!

**Note:** Backend akan connect ke PostgreSQL VPS yang sudah ada (`survey_lokasi` database, `postgres` user).

### 6️⃣ Build & Start Containers

```bash
cd /var/www/survey-backend

# Build backend image
docker compose build

# Start all services (detached mode)
docker compose up -d

# Check status
docker compose ps
```

Output seharusnya:

```
NAME                IMAGE                  STATUS         PORTS
survey-backend      survey-backend         Up (healthy)   0.0.0.0:3000->3000/tcp
survey-postgres     postgres:15-alpine     Up (healthy)   0.0.0.0:5432->5432/tcp
```

### 7️⃣ Run Database Migrations

```bash
cd /var/www/survey-backend

# Run migrations
docker compose exec backend npx sequelize-cli db:migrate

# Run seeders (create demo users)
docker compose exec backend npx sequelize-cli db:seed:all
```

### 8️⃣ Verify Deployment

**Check logs:**

```bash
# View all logs
docker compose logs -f

# View backend logs only
docker compose logs -f backend

# View last 50 lines
docker compose logs --tail=50 backend
```

**Test API dari Mac:**

```bash
# Health check
curl http://31.97.107.110:3000/

# Login
curl -X POST http://31.97.107.110:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq

# Get surveys (gunakan token dari login)
TOKEN="your_token_here"
curl -X GET http://31.97.107.110:3000/api/survey \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 9️⃣ Setup Firewall (Optional tapi Recommended)

```bash
# Allow SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status
```

### 🔟 Setup Nginx Reverse Proxy (Optional)

```bash
# Install Nginx
apt-get update
apt-get install -y nginx

# Create Nginx config
cat > /etc/nginx/sites-available/survey-backend << 'EOF'
server {
    listen 80;
    server_name _;

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

# Test & restart
nginx -t
systemctl restart nginx
systemctl enable nginx
```

---

## 🔧 Docker Management Commands

### Container Management

```bash
# Start services
docker compose up -d

# Stop services
docker compose stop

# Restart services
docker compose restart

# Stop & remove containers (data tetap aman di volume)
docker compose down

# Stop & remove containers + volumes (HATI-HATI: data hilang!)
docker compose down -v
```

### View Logs

```bash
# All logs (real-time)
docker compose logs -f

# Backend only
docker compose logs -f backend

# PostgreSQL only
docker compose logs -f postgres

# Last 100 lines
docker compose logs --tail=100
```

### Execute Commands Inside Container

```bash
# Backend shell
docker compose exec backend sh

# PostgreSQL shell
docker compose exec postgres psql -U survey_user -d survey_lokasi

# Run migrations
docker compose exec backend npx sequelize-cli db:migrate

# Run seeders
docker compose exec backend npx sequelize-cli db:seed:all
```

### Container Health & Status

```bash
# List running containers
docker compose ps

# Detailed info
docker compose ps -a

# Resource usage
docker stats

# Inspect container
docker inspect survey-backend
```

---

## 🗄️ Database Management

### Backup Database

```bash
# Backup ke file
docker compose exec postgres pg_dump -U survey_user survey_lokasi > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup with gzip compression
docker compose exec postgres pg_dump -U survey_user survey_lokasi | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Restore Database

```bash
# Restore from backup
cat backup_20260206_120000.sql | docker compose exec -T postgres psql -U survey_user survey_lokasi

# Restore from gzip
gunzip -c backup_20260206_120000.sql.gz | docker compose exec -T postgres psql -U survey_user survey_lokasi
```

### Database Queries

```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U survey_user -d survey_lokasi

# Direct query
docker compose exec postgres psql -U survey_user -d survey_lokasi -c "SELECT * FROM t_user;"

# List tables
docker compose exec postgres psql -U survey_user -d survey_lokasi -c "\dt"
```

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect postgres data volume
docker volume inspect survey-backend_postgres_data

# Backup volume (recommended sebelum update major)
docker run --rm -v survey-backend_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_data_backup.tar.gz -C /data .

# Restore volume
docker run --rm -v survey-backend_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_data_backup.tar.gz -C /data
```

---

## 🔄 Update & Redeploy

### Update Code (Minor Changes)

```bash
# 1. Di Mac - commit & push changes
cd /Users/ghanizulhusnibahri/dev/survey-backend
git add .
git commit -m "feat: add new feature"
git push

# 2. Di VPS - pull latest code
cd /var/www/survey-backend
git pull

# 3. Rebuild & restart backend
docker compose build backend
docker compose up -d backend

# 4. Check logs
docker compose logs -f backend
```

### Full Redeploy (Major Changes)

```bash
# Di VPS
cd /var/www/survey-backend

# Stop all services
docker compose down

# Rebuild all images
docker compose build --no-cache

# Start services
docker compose up -d

# Run migrations jika ada
docker compose exec backend npx sequelize-cli db:migrate

# Check status
docker compose ps
docker compose logs -f
```

### Rollback ke Versi Sebelumnya

```bash
# Di VPS
cd /var/www/survey-backend

# Stop current
docker compose down

# Check commit history
git log --oneline

# Rollback ke commit tertentu (ganti COMMIT_HASH dengan hash yang mau di-rollback)
git checkout COMMIT_HASH

# Atau rollback 1 commit sebelumnya
git checkout HEAD~1

# Rebuild & start
docker compose build
docker compose up -d

# Jika sudah OK, update branch (optional)
git checkout -b rollback-temp
git push origin rollback-temp
```

---

## 🔐 Security Best Practices

### 1. Environment Variables

```bash
# Generate strong passwords
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 48)

# Update .env file
nano .env
```

### 2. Network Isolation

Docker Compose sudah setup isolated network `survey-network`:

- Backend bisa akses PostgreSQL via hostname `postgres`
- PostgreSQL **tidak** exposed ke public (kecuali port 5432 yang dibuka untuk development)
- Untuk production: hapus port mapping di postgres service

**Edit docker-compose.yml untuk production:**

```yaml
postgres:
  # ... config lain ...
  # ports:                    # COMMENT atau HAPUS line ini
  #   - "5432:5432"           # untuk production
```

### 3. File Permissions

```bash
# Protect .env file
chmod 600 .env

# Check ownership
chown -R root:root /var/www/survey-backend
```

### 4. Regular Updates

```bash
# Update base images
docker compose pull

# Rebuild dengan image terbaru
docker compose build --pull

# Restart services
docker compose up -d
```

---

## 📊 Monitoring & Health Checks

### Container Health

```bash
# Check health status
docker compose ps

# Detailed health
docker inspect survey-backend | jq '.[0].State.Health'
docker inspect survey-postgres | jq '.[0].State.Health'
```

### Resource Usage

```bash
# Real-time stats
docker stats

# Specific container
docker stats survey-backend survey-postgres
```

### Disk Usage

```bash
# Docker disk usage
docker system df

# Detailed view
docker system df -v

# Clean unused data (HATI-HATI!)
docker system prune -a
```

---

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs backend
docker compose logs postgres

# Check container status
docker compose ps -a

# Inspect container
docker inspect survey-backend
```

### Database Connection Error

```bash
# Check if postgres is healthy
docker compose ps postgres

# Check postgres logs
docker compose logs postgres

# Test connection
docker compose exec backend nc -zv postgres 5432

# Verify credentials
docker compose exec postgres psql -U survey_user -d survey_lokasi -c "SELECT 1;"
```

### Port Already in Use

```bash
# Check what's using port 3000
netstat -tuln | grep :3000
lsof -i :3000

# Kill process if needed
kill -9 <PID>

# Or change port in docker-compose.yml
# ports:
#   - "3001:3000"  # Use different external port
```

### Out of Disk Space

```bash
# Check disk usage
df -h
docker system df

# Clean unused containers/images
docker system prune -a

# Clean volumes (HATI-HATI: backup dulu!)
docker volume prune
```

### Container Keeps Restarting

```bash
# Check logs
docker compose logs --tail=100 backend

# Check health check
docker inspect survey-backend | jq '.[0].State.Health'

# Disable auto-restart temporarily
docker compose up --no-start
docker compose start backend
```

---

## 📞 Quick Reference

### URLs

- **API Base**: `http://31.97.107.110:3000`
- **Health Check**: `http://31.97.107.110:3000/`
- **API Docs**: `http://31.97.107.110:3000/api-docs`

### Demo Accounts

- **Admin**: `admin` / `admin123`
- **Surveyor**: `surveyor1` / `surveyor123`

### Important Commands

```bash
# Start
docker compose up -d

# Stop
docker compose stop

# Logs
docker compose logs -f

# Status
docker compose ps

# Restart
docker compose restart

# Rebuild
docker compose build

# Clean restart
docker compose down && docker compose up -d
```

---

## 🆚 Docker vs PM2 Comparison

| Feature            | Docker                     | PM2                         |
| ------------------ | -------------------------- | --------------------------- |
| **Setup**          | Butuh install Docker       | Butuh install Node.js + PM2 |
| **Isolation**      | ✅ Full isolation          | ❌ Share host system        |
| **Database**       | ✅ Bundled in compose      | Manual setup                |
| **Portability**    | ✅ Run anywhere            | Host-dependent              |
| **Resource**       | Sedikit overhead           | Lightweight                 |
| **Scaling**        | ✅ Easy with orchestration | Manual                      |
| **Updates**        | ✅ Easy rollback           | Manual backup               |
| **Production**     | ✅ Industry standard       | Good for simple apps        |
| **Learning Curve** | Moderate                   | Easy                        |

**Recommendation:** Docker untuk production serious, PM2 untuk quick testing.

---

**Database Anda AMAN dengan Docker! 🔒**

- Data persistent di volume
- Isolated network
- Easy backup & restore
- Health checks auto-restart
- Environment variables secure

**Selamat Deploy dengan Docker! 🐳🚀**
