# 🧪 API Testing Guide

## Cara Test Backend API

### 1. Jalankan Server (Terminal 1)

```bash
npm run dev
```

### 2. Jalankan Test Script (Terminal 2)

```bash
./test-api.sh
```

Atau test manual dengan curl:

---

## 📋 Manual Test Commands

### ✅ Test 1: Health Check

```bash
curl http://localhost:3000/
```

### ✅ Test 2: Login Admin

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Simpan token dari response!**

### ✅ Test 3: Get Profile

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### ✅ Test 4: Create Survey (TERSIMPAN)

```bash
curl -X POST http://localhost:3000/api/survey \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_objek": "Gedung Perkantoran A",
    "jenis_objek": "Gedung",
    "longitude_x": 106.8456,
    "latitude_y": -6.2088,
    "alamat_manual": "Jl. Sudirman No.123, Jakarta Pusat",
    "keterangan": "Gedung 10 lantai",
    "status": "TERSIMPAN"
  }'
```

### ✅ Test 5: Create Survey (TERKIRIM)

```bash
curl -X POST http://localhost:3000/api/survey \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_objek": "Taman Kota B",
    "jenis_objek": "Taman",
    "longitude_x": 106.8123,
    "latitude_y": -6.2145,
    "alamat_manual": "Jl. Thamrin No.45, Jakarta Pusat",
    "keterangan": "Taman dengan jogging track",
    "status": "TERKIRIM"
  }'
```

### ✅ Test 6: Get Survey List

```bash
curl -X GET "http://localhost:3000/api/survey?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### ✅ Test 7: Get Survey Detail

```bash
curl -X GET http://localhost:3000/api/survey/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### ✅ Test 8: Update Survey

```bash
curl -X PUT http://localhost:3000/api/survey/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_objek": "Gedung Perkantoran A (Updated)",
    "keterangan": "Updated description"
  }'
```

### ✅ Test 9: Submit Survey

```bash
curl -X POST http://localhost:3000/api/survey/1/submit \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### ✅ Test 10: Search Survey

```bash
curl -X GET "http://localhost:3000/api/survey?search=Jakarta" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### ✅ Test 11: Filter by Status

```bash
curl -X GET "http://localhost:3000/api/survey?status=TERKIRIM" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### ✅ Test 12: Filter by Date Range

```bash
curl -X GET "http://localhost:3000/api/survey?dateFrom=2026-02-01&dateTo=2026-02-05" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔴 Negative Test Cases

### ❌ Login dengan Password Salah

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "wrongpassword"
  }'
```

### ❌ Create Survey Tanpa Authorization

```bash
curl -X POST http://localhost:3000/api/survey \
  -H "Content-Type: application/json" \
  -d '{
    "nama_objek": "Test"
  }'
```

### ❌ Create Survey Tanpa alamat_manual (Required Field)

```bash
curl -X POST http://localhost:3000/api/survey \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_objek": "Test",
    "jenis_objek": "Test",
    "longitude_x": 106.8456,
    "latitude_y": -6.2088
  }'
```

### ❌ Update Survey dengan Status TERKIRIM (Should Fail)

```bash
# Submit dulu
curl -X POST http://localhost:3000/api/survey/1/submit \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Coba update (harus gagal)
curl -X PUT http://localhost:3000/api/survey/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_objek": "Updated Name"
  }'
```

---

## 📊 Test dengan Postman

Import collection ini ke Postman:

**Base URL:** `http://localhost:3000`

**Environment Variables:**

- `baseUrl`: `http://localhost:3000`
- `token`: (didapat dari login response)

---

## ⚠️ Prerequisites

1. **Database harus sudah running:**

   ```bash
   # Check PostgreSQL status
   pg_isready -h localhost -p 5432
   ```

2. **Seed demo users (jika belum):**

   ```bash
   npm run seed
   ```

   Demo users:

   - Username: `admin` / Password: `admin123` (Admin)
   - Username: `surveyor1` / Password: `surveyor123` (Surveyor)

---

## 📝 Expected Responses

### Success Response Format:

```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response Format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "field_name",
      "message": "Field error"
    }
  ]
}
```
