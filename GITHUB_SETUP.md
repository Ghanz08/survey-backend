# 📦 GitHub Setup & Push Guide

## 🎯 Setup Repository GitHub

### 1️⃣ Create GitHub Repository (Di Browser)

1. **Login** ke https://github.com
2. Klik **"+"** di pojok kanan atas → **"New repository"**
3. **Repository name**: `survey-backend` (atau nama lain)
4. **Description**: `Backend REST API - Survey Lokasi Objek`
5. **Visibility**: 
   - ✅ **Private** (recommended untuk production)
   - atau Public (jika mau open source)
6. **Initialize repository**: 
   - ❌ JANGAN centang "Add a README file"
   - ❌ JANGAN centang "Add .gitignore"
   - ❌ JANGAN centang "Choose a license"
7. Klik **"Create repository"**

**Setelah dibuat, akan muncul URL:**
```
https://github.com/YOUR_USERNAME/survey-backend.git
```

---

## 2️⃣ Push Code ke GitHub (Di Mac Terminal)

```bash
# Pindah ke folder project
cd /Users/ghanizulhusnibahri/dev/survey-backend

# Initialize Git (jika belum)
git init

# Check status
git status

# Add all files
git add .

# Commit
git commit -m "Initial commit: Survey Lokasi Backend API"

# Add remote repository (ganti YOUR_USERNAME dengan username GitHub Anda)
git remote add origin https://github.com/YOUR_USERNAME/survey-backend.git

# Verify remote
git remote -v

# Push to GitHub
git push -u origin main
```

**Jika diminta login:**
- **Username**: GitHub username Anda
- **Password**: Gunakan **Personal Access Token** (bukan password GitHub)

---

## 3️⃣ Setup Personal Access Token (PAT)

**Jika belum punya token:**

1. Buka https://github.com/settings/tokens
2. Klik **"Generate new token"** → **"Generate new token (classic)"**
3. **Note**: `survey-backend-deploy`
4. **Expiration**: `90 days` (atau No expiration untuk production)
5. **Scopes** - centang:
   - ✅ `repo` (full control)
   - ✅ `workflow` (jika butuh CI/CD)
6. Klik **"Generate token"**
7. **COPY TOKEN** dan simpan di tempat aman!

**Format token:**
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Gunakan token sebagai password saat push:**
```bash
Username: your_github_username
Password: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 4️⃣ Save Credentials (Optional - Agar Tidak Perlu Login Terus)

```bash
# Cache credentials untuk 1 jam
git config --global credential.helper cache

# Cache credentials untuk 8 jam (28800 detik)
git config --global credential.helper 'cache --timeout=28800'

# Atau simpan permanent (OSX Keychain)
git config --global credential.helper osxkeychain
```

---

## 5️⃣ Verify Repository

```bash
# Check remote
git remote -v

# Output seharusnya:
# origin  https://github.com/YOUR_USERNAME/survey-backend.git (fetch)
# origin  https://github.com/YOUR_USERNAME/survey-backend.git (push)

# Check current branch
git branch

# Output seharusnya:
# * main
```

**Buka browser ke:**
```
https://github.com/YOUR_USERNAME/survey-backend
```

Seharusnya semua file sudah ter-upload! ✅

---

## 6️⃣ Update Dokumentasi Deploy

Setelah repo ready, update **DEPLOY_DOCKER.md Step 4** untuk clone dari GitHub instead of rsync.

**File yang akan ter-upload:**
```
✅ app.js
✅ package.json
✅ config/
✅ controllers/
✅ middleware/
✅ models/
✅ routes/
✅ src/utils/
✅ Dockerfile
✅ docker-compose.yml
✅ .gitignore
✅ README.md
✅ DEPLOY_DOCKER.md
✅ FLUTTER_APP_GUIDE.md
❌ node_modules/ (ignored)
❌ .env (ignored)
❌ src/uploads/* (ignored, akan dibuat di VPS)
```

---

## 🔄 Future Updates Workflow

**Setiap ada perubahan code:**

```bash
# Di Mac
cd /Users/ghanizulhusnibahri/dev/survey-backend

# Check what changed
git status

# Add changes
git add .

# Commit with message
git commit -m "feat: add new feature X"
# atau
git commit -m "fix: resolve bug Y"

# Push to GitHub
git push

# Tunggu sampai selesai
```

**Deploy ke VPS:**

```bash
# SSH ke VPS
ssh root@31.97.107.110

# Pull latest code
cd /var/www/survey-backend
git pull

# Rebuild & restart container
docker compose build backend
docker compose up -d backend

# Check logs
docker compose logs -f backend
```

---

## 📝 Git Commit Message Best Practices

```bash
# Format:
git commit -m "type: description"

# Types:
feat:     New feature
fix:      Bug fix
refactor: Code refactoring
docs:     Documentation
style:    Formatting
test:     Add tests
chore:    Maintenance
perf:     Performance improvement

# Examples:
git commit -m "feat: add survey photo upload compression"
git commit -m "fix: resolve file path issue in survey detail"
git commit -m "refactor: cleanup survey controller code"
git commit -m "docs: update deployment guide"
```

---

## 🔒 Security - JANGAN PUSH FILE INI!

**File yang HARUS di .gitignore:**

```gitignore
# PENTING! Jangan sampai ter-push
.env                    # Database password, JWT secret
.env.production         # Production secrets
node_modules/           # Dependencies (besar, tidak perlu)
src/uploads/*           # User uploaded files
*.log                   # Log files
.DS_Store              # Mac OS files
```

**Check jika sudah benar:**

```bash
# Verify .gitignore working
git status

# Seharusnya TIDAK muncul:
# - .env
# - node_modules/
# - src/uploads/*
```

---

## 🐛 Troubleshooting

### "fatal: not a git repository"

```bash
# Initialize git first
git init
```

### "fatal: remote origin already exists"

```bash
# Remove old remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/survey-backend.git
```

### "rejected - non-fast-forward"

```bash
# Force push (HATI-HATI!)
git push -f origin main

# Atau pull dulu lalu push
git pull origin main --allow-unrelated-histories
git push origin main
```

### "Authentication failed"

```bash
# Use Personal Access Token instead of password
# Generate token di: https://github.com/settings/tokens

# Or use SSH instead of HTTPS
git remote set-url origin git@github.com:YOUR_USERNAME/survey-backend.git
```

### File .env ter-push (URGENT!)

```bash
# Remove from Git history
git rm --cached .env
git commit -m "chore: remove .env from git"
git push

# THEN: Change all passwords/secrets immediately!
# - JWT_SECRET
# - DB_PASSWORD
```

---

## 📞 Quick Reference

```bash
# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "message"

# Push
git push

# Pull latest
git pull

# View commit history
git log --oneline

# View remote URL
git remote -v

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes
git reset --hard HEAD
```

---

**Repository Ready! 🚀**

Next Step: Update Step 4 di **DEPLOY_DOCKER.md** untuk clone dari GitHub!
