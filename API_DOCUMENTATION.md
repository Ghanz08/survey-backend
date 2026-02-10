# Survey Backend API Documentation

## Table of Contents

1. [System Status Survey](#system-status-survey)
2. [Admin User Management](#admin-user-management)
3. [Survey Endpoints](#survey-endpoints)
4. [Authentication](#authentication)

---

# System Status Survey

## Overview

Sistem survey memiliki 3 status dengan aturan akses yang berbeda:

- **TERSIMPAN**: Status default saat survey dibuat
- **TERKIRIM**: Status setelah survey di-submit
- **TERVERIFIKASI**: Status setelah admin memverifikasi (status final)

## Status Flow

```
TERSIMPAN → TERKIRIM → TERVERIFIKASI
(Alur satu arah, tidak bisa kembali ke status sebelumnya)
```

## CRUD Rules by Status

### Status: TERSIMPAN

| Action       | Surveyor | Admin |
| ------------ | -------- | ----- |
| Create       | ✅       | ✅    |
| Read (own)   | ✅       | ✅    |
| Read (all)   | ❌       | ✅    |
| Update (own) | ✅       | ✅    |
| Update (all) | ❌       | ✅    |
| Delete (own) | ✅       | ✅    |
| Delete (all) | ❌       | ✅    |
| Submit       | ✅       | ✅    |

### Status: TERKIRIM

| Action     | Surveyor | Admin |
| ---------- | -------- | ----- |
| Read (own) | ✅       | ✅    |
| Read (all) | ❌       | ✅    |
| Update     | ❌       | ❌    |
| Delete     | ❌       | ✅    |
| Verify     | ❌       | ✅    |

### Status: TERVERIFIKASI

| Action     | Surveyor | Admin |
| ---------- | -------- | ----- |
| Read (own) | ✅       | ✅    |
| Read (all) | ❌       | ✅    |
| Update     | ❌       | ❌    |
| Delete     | ❌       | ❌    |

🔒 **Survey TERVERIFIKASI tidak bisa diubah/dihapus oleh siapapun (data protection)**

---

# Admin User Management

## User Roles

- **role_user = 1**: Admin (dapat mengelola user)
- **role_user = 2**: Surveyor (user biasa)

## User Management Endpoints

### 1. GET /api/user

List semua user dengan pagination

**Authorization:** Admin only

**Query Parameters:**

```
page=1          # Nomor halaman (default: 1)
limit=10        # Data per halaman (default: 10)
search=keyword  # Cari by username/no_hp/alamat
role_user=2     # Filter by role (1=Admin, 2=Surveyor)
```

**Response Success:**

```json
{
  "success": true,
  "message": "User berhasil diambil",
  "data": {
    "users": [
      {
        "id_user": 1,
        "username": "admin",
        "no_hp": "081234567890",
        "alamat": "Jakarta Pusat",
        "ktp": "3174012345678901",
        "keterangan": "Administrator sistem",
        "role_user": 1,
        "create_user_date": "2026-02-10T12:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

### 2. GET /api/user/:id

Detail user by ID

**Authorization:** Admin only

**Response:**

```json
{
  "success": true,
  "message": "User berhasil diambil",
  "data": {
    "id_user": 2,
    "username": "surveyor1",
    "no_hp": "081234567891",
    "alamat": "Bandung",
    "ktp": "3273012345678902",
    "keterangan": "Surveyor lapangan",
    "role_user": 2,
    "create_user_date": "2026-02-10T12:00:00.000Z"
  }
}
```

---

### 3. POST /api/user

Create user baru (surveyor)

**Authorization:** Admin only

**Request Body:**

```json
{
  "username": "surveyor2",
  "password": "password123",
  "no_hp": "081234567892",
  "alamat": "Surabaya",
  "ktp": "3578012345678903",
  "keterangan": "Surveyor wilayah Surabaya",
  "role_user": 2
}
```

**Field Validations:**

- `username`: Required, unique, 3-50 karakter
- `password`: Required, minimum 6 karakter
- `no_hp`: Required, 10-15 digit
- `alamat`: Required, max 1000 karakter
- `ktp`: Optional, 16 digit, unique
- `keterangan`: Optional, max 1000 karakter
- `role_user`: Required, 1 atau 2

**Response Success (201):**

```json
{
  "success": true,
  "message": "User berhasil dibuat",
  "data": {
    "id_user": 3,
    "username": "surveyor2",
    "no_hp": "081234567892",
    "alamat": "Surabaya",
    "role_user": 2
  }
}
```

---

### 4. PUT /api/user/:id

Update user data

**Authorization:** Admin only

**Request Body:** (semua field optional)

```json
{
  "username": "surveyor2_updated",
  "password": "newpassword123",
  "no_hp": "081234567899",
  "alamat": "Surabaya Timur",
  "ktp": "3578012345678904",
  "keterangan": "Surveyor wilayah Surabaya Timur",
  "role_user": 2
}
```

**Notes:**

- Password hanya diupdate jika dikirim
- Password akan di-hash otomatis
- Username dan KTP harus unique

---

### 5. DELETE /api/user/:id

Delete user

**Authorization:** Admin only

**Business Rules:**

- ❌ Admin tidak bisa delete diri sendiri
- ⚠️ Cek apakah user memiliki survey aktif
- ⚠️ Jika ada survey, berikan warning atau prevent deletion

**Response Success:**

```json
{
  "success": true,
  "message": "User berhasil dihapus"
}
```

**Response Error:**

```json
{
  "success": false,
  "message": "Tidak dapat menghapus user sendiri"
}
```

---

# Survey Endpoints

### 1. POST /api/survey

Create survey baru (status: TERSIMPAN)

**Authorization:** Surveyor & Admin

**Request Body:**

```json
{
  "longitude_x": 106.8456,
  "latitude_y": -6.2088,
  "alamat_google": "Jl. Sudirman, Jakarta",
  "alamat_keterangan": "Gedung perkantoran 10 lantai",
  "dokumen_keterangan": "Dokumen IMB dan sertifikat"
}
```

**With File Upload:**

- `foto`: Image file (max 2MB)
- `dokumen`: PDF/Image file (max 2MB)

---

### 2. GET /api/survey

List surveys dengan filter

**Authorization:** Surveyor & Admin

**Query Parameters:**

```
page=1
limit=10
status=TERSIMPAN     # TERSIMPAN/TERKIRIM/TERVERIFIKASI
id_user=1            # Filter by user (admin only)
search=keyword       # Search alamat_keterangan
startDate=2026-01-01
endDate=2026-12-31
```

---

### 3. GET /api/survey/:id

Detail survey by ID

**Authorization:** Surveyor (own) & Admin (all)

---

### 4. PUT /api/survey/:id

Update survey (hanya jika status TERSIMPAN)

**Authorization:** Surveyor (own) & Admin (all)

**Request Body:** (semua optional)

```json
{
  "longitude_x": 106.85,
  "latitude_y": -6.21,
  "alamat_google": "Updated address",
  "alamat_keterangan": "Updated description",
  "dokumen_keterangan": "Updated document info"
}
```

**Error jika:**

- Status sudah TERKIRIM atau TERVERIFIKASI

---

### 5. POST /api/survey/:id/submit

Submit survey (TERSIMPAN → TERKIRIM)

**Authorization:** Surveyor (own) & Admin (all)

**Response:**

```json
{
  "success": true,
  "message": "Survey berhasil disubmit",
  "data": {
    "id_survey": 1,
    "status": "TERKIRIM",
    "tgl_submit": "2026-02-10T13:00:00.000Z"
  }
}
```

---

### 6. POST /api/survey/:id/verify

Verify survey (TERKIRIM → TERVERIFIKASI)

**Authorization:** Admin only

**Response:**

```json
{
  "success": true,
  "message": "Survey berhasil diverifikasi",
  "data": {
    "id_survey": 1,
    "status": "TERVERIFIKASI"
  }
}
```

**Business Rules:**

- ✅ Survey harus status TERKIRIM
- ✅ Hanya admin yang bisa verify
- ✅ Setelah verify → status TERVERIFIKASI (final, immutable)

---

### 7. DELETE /api/survey/:id

Delete survey

**Authorization:**

- TERSIMPAN: Surveyor (own) & Admin
- TERKIRIM: Admin only
- TERVERIFIKASI: Nobody

**Response Error (TERVERIFIKASI):**

```json
{
  "success": false,
  "message": "Survey yang sudah terverifikasi tidak dapat dihapus"
}
```

---

# Authentication

### POST /api/auth/login

Login user

**Request Body:**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response Success:**

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id_user": 1,
      "username": "admin",
      "role_user": 1
    }
  }
}
```

---

### GET /api/auth/me

Get current user profile

**Authorization:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "id_user": 1,
    "username": "admin",
    "no_hp": "081234567890",
    "alamat": "Jakarta Pusat",
    "role_user": 1
  }
}
```

---

# Admin Tasks & Workflows

## Task 1: Tambah Surveyor Baru

```
1. POST /api/user
   Body: {username, password, no_hp, alamat, role_user: 2}
2. Berikan credentials ke surveyor
3. Instruksikan surveyor untuk login dan ganti password
```

## Task 2: Reset Password User

```
1. PUT /api/user/:id
   Body: {password: "newpassword123"}
2. Informasikan password baru ke user
```

## Task 3: Verifikasi Survey

```
1. GET /api/survey?status=TERKIRIM (lihat survey yang siap diverifikasi)
2. GET /api/survey/:id (review detail survey)
3. POST /api/survey/:id/verify (jika sudah ok)
```

## Task 4: Monitoring User Activity

```
1. GET /api/survey?id_user=:id (lihat survey per user)
2. Evaluasi produktivitas dan kualitas data
```

## Task 5: Nonaktifkan User

```
1. GET /api/survey?id_user=:id (cek survey aktif)
2. Jika aman: DELETE /api/user/:id
3. Atau: PUT /api/user/:id untuk soft disable
```

---

# Error Messages Reference

## Survey Errors

```
"Survey tidak ditemukan"
"Anda tidak memiliki akses untuk mengubah survey ini"
"Survey yang sudah disubmit tidak dapat diubah"
"Survey yang sudah terverifikasi tidak dapat diubah"
"Survey yang sudah disubmit tidak dapat dihapus" (surveyor)
"Survey yang sudah terverifikasi tidak dapat dihapus" (semua)
"Survey sudah disubmit sebelumnya"
"Hanya admin yang dapat memverifikasi survey"
"Hanya survey yang sudah disubmit yang dapat diverifikasi"
"Survey sudah terverifikasi sebelumnya"
"Koordinat GPS wajib diisi"
"Longitude tidak valid (harus antara -180 sampai 180)"
"Latitude tidak valid (harus antara -90 sampai 90)"
```

## User Management Errors

```
"Akses ditolak. Hanya admin yang dapat mengakses endpoint ini"
"Username sudah digunakan"
"KTP sudah terdaftar"
"Password minimal 6 karakter"
"User tidak ditemukan"
"Tidak dapat menghapus user sendiri"
"User memiliki survey aktif, tidak dapat dihapus"
```

## Authentication Errors

```
"Username atau password salah"
"Token tidak valid"
"Token expired"
"Authorization header tidak ditemukan"
```

---

# Best Practices

## Security

✅ Hash passwords dengan bcrypt  
✅ Validate JWT token di setiap request  
✅ Check role authorization (admin vs surveyor)  
✅ Sanitize input untuk prevent SQL injection  
✅ Rate limiting untuk prevent abuse  
✅ Audit logging untuk track admin actions

## Data Management

✅ Gunakan pagination untuk list endpoints  
✅ Implement search functionality  
✅ Validate GPS coordinates  
✅ Check file size dan format untuk uploads  
✅ Backup database secara berkala

## Survey Management

✅ Survey TERVERIFIKASI adalah immutable  
✅ Cek status sebelum update/delete  
✅ Prevent self-deletion (admin)  
✅ Check dependencies sebelum delete user

---

# Database Schema

## t_user

```sql
id_user         INTEGER PRIMARY KEY AUTO_INCREMENT
username        VARCHAR(50) UNIQUE NOT NULL
password        VARCHAR(255) NOT NULL
no_hp           VARCHAR(15) NOT NULL
alamat          VARCHAR(1000) NOT NULL
ktp             VARCHAR(16) UNIQUE
keterangan      VARCHAR(1000)
role_user       INTEGER NOT NULL DEFAULT 2  -- 1=Admin, 2=Surveyor
create_user_date TIMESTAMP DEFAULT NOW()
```

## t_data_survey

```sql
id_survey           INTEGER PRIMARY KEY AUTO_INCREMENT
id_user             INTEGER NOT NULL REFERENCES t_user(id_user)
tgl_survey          TIMESTAMP DEFAULT NOW()
foto                VARCHAR(255) NOT NULL
longitude_x         DECIMAL(13,10) NOT NULL
latitude_y          DECIMAL(13,10) NOT NULL
alamat_google       TEXT
alamat_keterangan   VARCHAR(1000) NOT NULL
dokumen             VARCHAR(255)
dokumen_keterangan  VARCHAR(1000)
tgl_simpan_edit     TIMESTAMP
tgl_submit          TIMESTAMP
status              VARCHAR(20) DEFAULT 'TERSIMPAN'
                    -- Values: TERSIMPAN, TERKIRIM, TERVERIFIKASI
```

---

# Testing

## Default Credentials

```
Admin:
  username: admin
  password: admin123

Surveyor:
  username: surveyor1
  password: surveyor123
```

## Test Endpoints

```bash
# Health Check
curl http://localhost:3000

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get Profile
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create Survey
curl -X POST http://localhost:3000/api/survey \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "longitude_x": 106.8456,
    "latitude_y": -6.2088,
    "alamat_keterangan": "Test survey"
  }'
```

---

**Last Updated:** February 10, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
