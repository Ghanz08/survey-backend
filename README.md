# Survey Lokasi Objek - Backend API

Backend REST API production-ready untuk aplikasi Survey Lokasi Objek dengan fitur lengkap User Management dan Dashboard Analytics.

## 📋 Tech Stack

- **Runtime**: Node.js v16+
- **Framework**: Express v4
- **Database**: PostgreSQL 15
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Token)
- **File Upload**: Multer + Sharp (image compression)
- **Security**: Helmet, Rate Limiting, XSS Protection, NoSQL Injection Protection
- **Validation**: express-validator

## ✨ Features

### 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control (Admin & Surveyor)
- Secure password hashing with bcrypt
- Token expiration (7 days)

### � API Documentation

- **Swagger/OpenAPI UI** - Interactive API documentation
- Endpoint: `http://localhost:3000/api-docs`
- Try endpoints directly from browser
- Complete request/response schemas
- Authentication examples

### �📝 Survey Management

- Create, Read, Update, Delete surveys
- GPS coordinate validation
- Manual address input
- Photo & document upload with compression
- Draft (TERSIMPAN) & Submitted (TERKIRIM) status
- Edit restrictions after submission

### 👥 User Management (Admin Only)

- CRUD operations for users
- Create surveyor accounts
- User detail with survey count
- Delete user protection (cannot delete self)

### 📊 Dashboard Analytics (Admin Only)

- Overall statistics (users, surveys)
- Recent surveys list
- Top surveyors ranking
- Status distribution
- Monthly trends chart
- Surveys by date range filter

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16
- PostgreSQL 15

### Installation

1. Clone repository

```bash
git clone <repository-url>
cd survey-backend
```

2. Install dependencies

```bash
npm install
```

3. Setup environment variables

```bash
cp .env.example .env
```

Edit `.env` file dengan konfigurasi Anda:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=survey_lokasi
DB_USERNAME=survey_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
```

4. Setup Database

Pastikan PostgreSQL sudah running dan database `survey_lokasi` sudah dibuat dengan tabel:

- `t_user` (id_user, username, password, nama_user, role_user, tgl_buat, tgl_update)
- `t_data_survey` (id_data_survey, id_user, nama_objek, jenis_objek, longitude_x, latitude_y, alamat_google, keterangan, foto_path, dokumen_path, status, tgl_buat, tgl_update, tgl_submit)

5. Run development server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## 📁 Project Structure

```
survey-backend/
├── src/
│   ├── config/          # Database & app configuration
│   ├── models/          # Sequelize models (User, Survey)
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   ├── middlewares/     # Auth, upload, security middlewares
│   ├── utils/           # Helper functions
│   └── uploads/         # Uploaded files storage
│       ├── foto/        # Survey photos
│       └── dokumen/     # Survey documents
├── app.js               # Express app setup
├── server.js            # Server entry point
├── .env                 # Environment variables (not committed)
├── .env.example         # Environment variables template
└── package.json
```

## 🔐 Authentication

API menggunakan JWT Bearer Token untuk autentikasi.

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

Response:

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id_user": 1,
      "username": "surveyor1",
      "nama_user": "John Doe",
      "role_user": 2,
      "role_name": "Surveyor"
    }
  }
}
```

### Authenticated Requests

Untuk endpoint yang membutuhkan autentikasi, tambahkan header:

```
Authorization: Bearer <your_token>
```

## 📡 API Endpoints

### 🔐 Authentication

| Method | Endpoint          | Description              | Auth | Role |
| ------ | ----------------- | ------------------------ | ---- | ---- |
| POST   | `/api/auth/login` | Login user               | No   | All  |
| GET    | `/api/auth/me`    | Get current user profile | Yes  | All  |

### 📝 Survey Management

| Method | Endpoint                 | Description                     | Auth | Role      |
| ------ | ------------------------ | ------------------------------- | ---- | --------- |
| POST   | `/api/survey`            | Create new survey (draft)       | Yes  | All       |
| GET    | `/api/survey`            | Get survey list (with filters)  | Yes  | All       |
| GET    | `/api/survey/:id`        | Get survey detail               | Yes  | All       |
| PUT    | `/api/survey/:id`        | Update survey (if TERSIMPAN)    | Yes  | All       |
| POST   | `/api/survey/:id/submit` | Submit survey (status→TERKIRIM) | Yes  | All       |
| DELETE | `/api/survey/:id`        | Delete survey                   | Yes  | All/Admin |

### 👥 User Management

| Method | Endpoint         | Description     | Auth | Role  |
| ------ | ---------------- | --------------- | ---- | ----- |
| GET    | `/api/users`     | List all users  | Yes  | Admin |
| GET    | `/api/users/:id` | Get user detail | Yes  | Admin |
| POST   | `/api/users`     | Create new user | Yes  | Admin |
| PUT    | `/api/users/:id` | Update user     | Yes  | Admin |
| DELETE | `/api/users/:id` | Delete user     | Yes  | Admin |

### 📊 Dashboard Analytics

| Method | Endpoint                             | Description             | Auth | Role  |
| ------ | ------------------------------------ | ----------------------- | ---- | ----- |
| GET    | `/api/dashboard/stats`               | Overall statistics      | Yes  | Admin |
| GET    | `/api/dashboard/recent-surveys`      | Recent surveys (limit)  | Yes  | Admin |
| GET    | `/api/dashboard/top-surveyors`       | Top surveyors ranking   | Yes  | Admin |
| GET    | `/api/dashboard/status-distribution` | Survey status breakdown | Yes  | Admin |
| GET    | `/api/dashboard/monthly-trends`      | Monthly survey trends   | Yes  | Admin |
| GET    | `/api/dashboard/surveys-by-date`     | Surveys by date range   | Yes  | Admin |

## 📝 API Usage Examples

### 1. Create Survey (Draft)

```bash
curl -X POST http://localhost:3000/api/survey \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "longitude_x": "106.845599",
    "latitude_y": "-6.208763",
    "alamat_keterangan": "Kantor PLN Pusat Jakarta",
    "alamat_google": "Jl. Trunojoyo Blok M-I/135, Jakarta Selatan",
    "dokumen_keterangan": "Survey lokasi gardu induk"
  }'
```

> **PENTING:** Koordinat `longitude_x` dan `latitude_y` harus didapat dari GPS device (Flutter Geolocator), bukan input manual!

### 2. Submit Survey

```bash
curl -X POST http://localhost:3000/api/survey/5/submit \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Get Dashboard Stats (Admin)

```bash
curl -X GET http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Response:

```json
{
  "success": true,
  "message": {
    "users": {
      "total": 5,
      "admin": 2,
      "surveyor": 3
    },
    "surveys": {
      "total": 24,
      "submitted": 18,
      "draft": 6,
      "today": 3,
      "this_week": 12,
      "this_month": 24
    }
  }
}
```

### 4. Create New User (Admin)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "surveyor2",
    "password": "surveyor123",
    "no_hp": "081234567892",
    "alamat": "Surabaya",
    "ktp": "3578012345678903",
    "keterangan": "Surveyor Surabaya",
    "role_user": 2
  }'
```

### 5. Get Survey List with Filters

```bash
curl -X GET "http://localhost:3000/api/survey?page=1&limit=10&status=submitted&search=Jakarta" \
  -H "Authorization: Bearer $TOKEN"
```

Response:

```json
{
  "success": true,
  "message": "Berhasil mengambil data survey",
  "data": {
    "surveys": [...],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
}
```

### Submit Survey

```http
POST /api/survey/123/submit
Authorization: Bearer <token>
```

## 🔒 Security Features

- **Helmet**: Security HTTP headers
- **Rate Limiting**:
  - Login: 5 attempts per 15 minutes
  - API: 100 requests per 15 minutes
- **XSS Protection**: Cross-site scripting prevention
- **NoSQL Injection Protection**: Input sanitization
- **HPP Protection**: HTTP Parameter Pollution prevention
- **CORS**: Cross-Origin Resource Sharing enabled
- **JWT**: Secure token-based authentication
- **Bcrypt**: Password hashing

## 📤 File Upload

### Foto (Survey Photo)

- Format: JPG/JPEG only
- Max size: 2MB
- Auto-compressed to max 1920x1920px, quality 80%
- Saved to: `src/uploads/foto/`

### Dokumen (Document)

- Format: PDF, JPG, JPEG
- Max size: 2MB
- Saved to: `src/uploads/dokumen/`

## 🗂️ User Roles

| Role ID | Role Name | Permissions                      |
| ------- | --------- | -------------------------------- |
| 1       | Admin     | Full access to all features      |
| 2       | Surveyor  | Create, read, update own surveys |

## 📍 GPS & Location Handling

**PENTING - Koordinat GPS:**

- ✅ Koordinat `longitude_x` dan `latitude_y` **WAJIB** didapat otomatis dari GPS device
- ❌ Tidak boleh input manual atau dimanipulasi oleh user
- 🎯 Flutter app harus menggunakan package `geolocator` atau sejenisnya untuk ambil koordinat real-time

**Alamat Manual:**

- ✅ User input alamat secara manual di form
- 🔍 Admin dapat memverifikasi apakah alamat sesuai dengan koordinat GPS
- 📝 Field yang digunakan: `alamat_manual` (tersimpan di kolom `alamat_google` di database)

**Keuntungan:**

- 💰 Tidak ada biaya Google Maps API
- 🔒 Koordinat terjamin akurat dari GPS device
- ✅ Verifikasi manual koordinat vs alamat oleh admin

**Contoh Flow di Flutter:**

```dart
// 1. Ambil koordinat GPS otomatis
Position position = await Geolocator.getCurrentPosition();
double lat = position.latitude;
double lng = position.longitude;

// 2. User input alamat manual
String alamatManual = "Jl. Sudirman No.123, Jakarta";

// 3. Kirim ke backend
{
  "longitude_x": lng,
  "latitude_y": lat,
  "alamat_manual": alamatManual
}
```

## 📊 Survey Status

| Status    | Description | Can Edit? |
| --------- | ----------- | --------- |
| TERSIMPAN | Draft/Saved | ✅ Yes    |
| TERKIRIM  | Submitted   | ❌ No     |

## 🛠️ Development

### Run in development mode

```bash
npm run dev
```

### Run in production mode

```bash
npm start
```

## 📦 Environment Variables

| Variable       | Description             | Example                   |
| -------------- | ----------------------- | ------------------------- |
| NODE_ENV       | Environment             | development/production    |
| PORT           | Server port             | 3000                      |
| DB_HOST        | PostgreSQL host         | localhost                 |
| DB_PORT        | PostgreSQL port         | 5432                      |
| DB_NAME        | Database name           | survey_lokasi             |
| DB_USERNAME    | Database user           | survey_user               |
| DB_PASSWORD    | Database password       | your_password             |
| JWT_SECRET     | JWT secret key          | min_32_char_random_string |
| JWT_EXPIRES_IN | Token expiration        | 7d                        |
| MAX_FILE_SIZE  | Max upload size (bytes) | 2097152 (2MB)             |

## 🐛 Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "field_name",
      "message": "Field error message"
    }
  ]
}
```

## 📄 License

ISC

## 👨‍💻 Author

Survey Lokasi Backend Team
