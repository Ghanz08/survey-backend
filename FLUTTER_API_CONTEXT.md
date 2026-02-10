# Context untuk Flutter App Development - Survey Lokasi API

## System Overview

Backend REST API untuk aplikasi survey lokasi dengan 2 role (Admin & Surveyor) dan 3 status survey (TERSIMPAN, TERKIRIM, TERVERIFIKASI). API sudah production-ready dan deployed di VPS.

---

## API Configuration

**Base URL:** `http://31.97.107.110:3000`

**Authentication:**

- Type: JWT Bearer Token
- Header: `Authorization: Bearer <token>`
- Token expiry: 7 hari
- Login endpoint: `POST /api/auth/login`

**Response Format:**

```json
{
  "success": true/false,
  "message": "...",
  "data": {...}
}
```

---

## User Roles & Permissions

### Role 1: Admin

- Dapat melihat semua survey
- Dapat mengelola user (CRUD)
- Dapat verifikasi survey (TERKIRIM → TERVERIFIKASI)
- Dapat delete survey TERSIMPAN & TERKIRIM
- Tidak dapat delete survey TERVERIFIKASI

### Role 2: Surveyor

- Hanya melihat survey milik sendiri
- Dapat create, update (jika TERSIMPAN), submit survey
- Dapat delete survey milik sendiri (jika TERSIMPAN)
- Tidak dapat verifikasi survey
- Tidak dapat mengelola user

---

## Survey Status System (Critical Business Logic)

### Status Flow (One-Way):

```
TERSIMPAN → TERKIRIM → TERVERIFIKASI
```

### Status Rules:

#### TERSIMPAN (Draft)

- **Create:** ✅ Surveyor & Admin
- **Read:** ✅ Surveyor (own) & Admin (all)
- **Update:** ✅ Surveyor (own) & Admin (all)
- **Delete:** ✅ Surveyor (own) & Admin (all)
- **Submit:** ✅ Surveyor (own) & Admin (all) → status jadi TERKIRIM

#### TERKIRIM (Submitted)

- **Read:** ✅ Surveyor (own) & Admin (all)
- **Update:** ❌ Tidak bisa diedit
- **Delete:** ❌ Surveyor tidak bisa, ✅ Admin bisa
- **Verify:** ✅ Admin only → status jadi TERVERIFIKASI

#### TERVERIFIKASI (Verified - Final)

- **Read:** ✅ Surveyor (own) & Admin (all)
- **Update:** ❌ Tidak bisa diedit (immutable)
- **Delete:** ❌ Tidak bisa dihapus oleh siapapun (data protection)

**Error Messages:**

- Update TERKIRIM/TERVERIFIKASI: "Survey yang sudah disubmit tidak dapat diubah"
- Delete TERVERIFIKASI: "Survey yang sudah terverifikasi tidak dapat dihapus"
- Verify non-TERKIRIM: "Hanya survey yang sudah disubmit yang dapat diverifikasi"

---

## Authentication Endpoints

### 1. POST /api/auth/login

Login user

**Request:**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id_user": 1,
      "username": "admin",
      "no_hp": "081234567890",
      "alamat": "Jakarta Pusat",
      "role_user": 1,
      "role_name": "Admin"
    }
  }
}
```

**Response Error (401):**

```json
{
  "success": false,
  "message": "Username atau password salah"
}
```

**Flutter Implementation Notes:**

- Simpan token di secure storage (flutter_secure_storage)
- Simpan user data untuk cek role (Admin/Surveyor)
- Auto-login jika token masih valid
- Logout = hapus token & user data

---

### 2. GET /api/auth/me

Get current user profile

**Headers:** `Authorization: Bearer <token>`

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "id_user": 1,
    "username": "admin",
    "no_hp": "081234567890",
    "alamat": "Jakarta Pusat",
    "role_user": 1,
    "create_user_date": "2026-02-06T09:26:34.010Z"
  }
}
```

**Response Error (401):**

```json
{
  "success": false,
  "message": "Token tidak valid"
}
```

---

## Survey Endpoints

### 1. GET /api/survey

List surveys dengan filter & pagination

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `page` (int): Nomor halaman, default 1
- `limit` (int): Data per halaman, default 10
- `status` (string): TERSIMPAN / TERKIRIM / TERVERIFIKASI
- `id_user` (int): Filter by user ID (admin only)
- `search` (string): Cari di alamat_keterangan
- `startDate` (string): Format YYYY-MM-DD
- `endDate` (string): Format YYYY-MM-DD

**Response Success (200):**

```json
{
  "success": true,
  "message": "Survey berhasil diambil",
  "data": {
    "surveys": [
      {
        "id_survey": 1,
        "id_user": 2,
        "tgl_survey": "2026-02-10T10:00:00.000Z",
        "foto": "1707562800000-foto.jpg",
        "longitude_x": "106.845600",
        "latitude_y": "-6.208800",
        "alamat_google": "Jl. Sudirman, Jakarta",
        "alamat_keterangan": "Gedung perkantoran 10 lantai",
        "dokumen": "1707562800000-dokumen.pdf",
        "dokumen_keterangan": "Dokumen IMB dan sertifikat",
        "tgl_simpan_edit": "2026-02-10T10:30:00.000Z",
        "tgl_submit": "2026-02-10T11:00:00.000Z",
        "status": "TERKIRIM",
        "user": {
          "id_user": 2,
          "username": "surveyor1",
          "role_user": 2
        }
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
}
```

**Flutter Implementation Notes:**

- Gunakan ListView dengan pagination (infinite scroll)
- Filter by status untuk tab navigation (Draft/Submitted/Verified)
- Untuk surveyor: auto-filter id_user = current user
- Tampilkan badge status dengan warna berbeda

---

### 2. GET /api/survey/:id

Detail survey by ID

**Headers:** `Authorization: Bearer <token>`

**Response Success (200):**

```json
{
  "success": true,
  "message": "Survey berhasil diambil",
  "data": {
    "id_survey": 1,
    "id_user": 2,
    "tgl_survey": "2026-02-10T10:00:00.000Z",
    "foto": "1707562800000-foto.jpg",
    "longitude_x": "106.845600",
    "latitude_y": "-6.208800",
    "alamat_google": "Jl. Sudirman, Jakarta",
    "alamat_keterangan": "Gedung perkantoran 10 lantai",
    "dokumen": "1707562800000-dokumen.pdf",
    "dokumen_keterangan": "Dokumen IMB dan sertifikat",
    "status": "TERKIRIM",
    "user": {
      "id_user": 2,
      "username": "surveyor1"
    }
  }
}
```

**Response Error (404):**

```json
{
  "success": false,
  "message": "Survey tidak ditemukan"
}
```

**Response Error (403):**

```json
{
  "success": false,
  "message": "Anda tidak memiliki akses untuk melihat survey ini"
}
```

**Flutter Implementation Notes:**

- Tampilkan foto & dokumen dengan preview
- Tampilkan map dengan marker di koordinat
- Disable edit button jika status != TERSIMPAN
- Disable delete button jika TERVERIFIKASI atau (TERKIRIM && surveyor)

---

### 3. POST /api/survey

Create survey baru (status: TERSIMPAN)

**Headers:**

- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**

- `foto` (file, required): Image file, max 2MB
- `longitude_x` (number, required): -180 to 180
- `latitude_y` (number, required): -90 to 90
- `alamat_google` (string, optional): Dari reverse geocoding
- `alamat_keterangan` (string, required): Deskripsi lokasi
- `dokumen` (file, optional): PDF/Image, max 2MB
- `dokumen_keterangan` (string, optional): Deskripsi dokumen

**Response Success (201):**

```json
{
  "success": true,
  "message": "Survey berhasil dibuat",
  "data": {
    "id_survey": 1,
    "id_user": 2,
    "foto": "1707562800000-foto.jpg",
    "longitude_x": "106.845600",
    "latitude_y": "-6.208800",
    "alamat_keterangan": "Gedung perkantoran 10 lantai",
    "status": "TERSIMPAN",
    "tgl_survey": "2026-02-10T10:00:00.000Z"
  }
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "Koordinat GPS wajib diisi"
}
```

**Flutter Implementation Notes:**

- Gunakan image_picker untuk foto
- Gunakan file_picker untuk dokumen
- Gunakan geolocator untuk GPS
- Gunakan geocoding untuk alamat_google (reverse geocoding dari lat/long)
- Validasi: foto required, koordinat required
- Compress image sebelum upload (max 2MB)

---

### 4. PUT /api/survey/:id

Update survey (hanya jika status TERSIMPAN)

**Headers:**

- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:** (semua optional kecuali yang mau diubah)

- `foto` (file): Image file, max 2MB
- `longitude_x` (number): -180 to 180
- `latitude_y` (number): -90 to 90
- `alamat_google` (string)
- `alamat_keterangan` (string)
- `dokumen` (file): PDF/Image, max 2MB
- `dokumen_keterangan` (string)

**Response Success (200):**

```json
{
  "success": true,
  "message": "Survey berhasil diupdate",
  "data": {
    "id_survey": 1,
    "status": "TERSIMPAN",
    "tgl_simpan_edit": "2026-02-10T10:30:00.000Z"
  }
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "Survey yang sudah disubmit tidak dapat diubah"
}
```

**Response Error (403):**

```json
{
  "success": false,
  "message": "Anda tidak memiliki akses untuk mengubah survey ini"
}
```

**Flutter Implementation Notes:**

- Cek status sebelum navigate ke edit screen
- Jika status != TERSIMPAN, tampilkan alert "Survey tidak dapat diubah"
- Jika surveyor & survey bukan milik sendiri, hide edit button

---

### 5. POST /api/survey/:id/submit

Submit survey (TERSIMPAN → TERKIRIM)

**Headers:** `Authorization: Bearer <token>`

**Response Success (200):**

```json
{
  "success": true,
  "message": "Survey berhasil disubmit",
  "data": {
    "id_survey": 1,
    "status": "TERKIRIM",
    "tgl_submit": "2026-02-10T11:00:00.000Z"
  }
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "Survey sudah disubmit sebelumnya"
}
```

**Flutter Implementation Notes:**

- Tampilkan confirmation dialog: "Yakin submit? Survey tidak bisa diedit lagi"
- Setelah submit, navigate back & refresh list
- Button submit hanya muncul jika status TERSIMPAN

---

### 6. POST /api/survey/:id/verify

Verify survey (TERKIRIM → TERVERIFIKASI) - Admin Only

**Headers:** `Authorization: Bearer <token>`

**Response Success (200):**

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

**Response Error (403):**

```json
{
  "success": false,
  "message": "Hanya admin yang dapat memverifikasi survey"
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "Hanya survey yang sudah disubmit yang dapat diverifikasi"
}
```

**Flutter Implementation Notes:**

- Button verify hanya muncul untuk Admin
- Hanya tampil jika status TERKIRIM
- Tampilkan confirmation dialog: "Yakin verifikasi? Survey tidak bisa diubah/dihapus lagi"
- Setelah verify, navigate back & refresh list

---

### 7. DELETE /api/survey/:id

Delete survey

**Headers:** `Authorization: Bearer <token>`

**Authorization Rules:**

- TERSIMPAN: Surveyor (own) & Admin
- TERKIRIM: Admin only
- TERVERIFIKASI: Nobody

**Response Success (200):**

```json
{
  "success": true,
  "message": "Survey berhasil dihapus"
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "Survey yang sudah terverifikasi tidak dapat dihapus"
}
```

**Response Error (403):**

```json
{
  "success": false,
  "message": "Survey yang sudah disubmit tidak dapat dihapus"
}
```

**Flutter Implementation Notes:**

- Tampilkan confirmation dialog: "Yakin hapus survey ini?"
- Hide delete button jika:
  - TERVERIFIKASI (semua role)
  - TERKIRIM && surveyor
  - Survey bukan milik sendiri && surveyor
- Setelah delete, navigate back & refresh list

---

## User Management Endpoints (Admin Only)

### 1. GET /api/users

List semua user dengan filter & pagination

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `page` (int): Nomor halaman, default 1
- `limit` (int): Data per halaman, default 10
- `search` (string): Cari di username/no_hp/alamat
- `role_user` (int): 1=Admin, 2=Surveyor

**Response Success (200):**

```json
{
  "success": true,
  "message": "Data user berhasil diambil",
  "data": {
    "users": [
      {
        "id_user": 1,
        "username": "admin",
        "no_hp": "081234567890",
        "alamat": "Jakarta Pusat",
        "keterangan": "Administrator sistem",
        "role_user": 1,
        "create_user_date": "2026-02-06T09:26:34.010Z"
      }
    ],
    "pagination": {
      "total": 3,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

**Flutter Implementation Notes:**

- Screen hanya accessible untuk Admin
- Tab navigation: All / Admin / Surveyor
- Search bar dengan debounce
- ListView dengan pagination

---

### 2. GET /api/users/:id

Detail user by ID

**Headers:** `Authorization: Bearer <token>`

**Response Success (200):**

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
    "create_user_date": "2026-02-10T12:00:00.000Z",
    "surveys": []
  }
}
```

---

### 3. GET /api/users/:id/stats

Get statistik user (jumlah survey)

**Headers:** `Authorization: Bearer <token>`

**Response Success (200):**

```json
{
  "success": true,
  "message": "Statistik user berhasil diambil",
  "data": {
    "user": {
      "id_user": 2,
      "username": "surveyor1",
      "role_user": 2
    },
    "stats": {
      "total_surveys": 10,
      "submitted_surveys": 7,
      "draft_surveys": 3
    }
  }
}
```

**Flutter Implementation Notes:**

- Tampilkan card dengan stats di user detail screen
- Gunakan chart/graph untuk visualisasi

---

### 4. POST /api/users

Create user baru

**Headers:**

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

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

**Response Error (400):**

```json
{
  "success": false,
  "message": "Data sudah ada",
  "errors": [
    {
      "field": "username",
      "message": "username sudah digunakan"
    }
  ]
}
```

**Flutter Implementation Notes:**

- Form dengan validasi client-side
- Password field dengan show/hide toggle
- Dropdown untuk role_user
- Handle error dari server (username duplicate, dll)

---

### 5. PUT /api/users/:id

Update user data

**Headers:**

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

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

**Response Success (200):**

```json
{
  "success": true,
  "message": "User berhasil diupdate",
  "data": {
    "id_user": 3,
    "username": "surveyor2_updated",
    "no_hp": "081234567899",
    "alamat": "Surabaya Timur",
    "role_user": 2
  }
}
```

**Flutter Implementation Notes:**

- Pre-fill form dengan data existing
- Password optional (hanya isi jika mau ganti)
- Tampilkan loading indicator saat save

---

### 6. DELETE /api/users/:id

Delete user

**Headers:** `Authorization: Bearer <token>`

**Business Rules:**

- ❌ Admin tidak bisa delete diri sendiri

**Response Success (200):**

```json
{
  "success": true,
  "message": "User berhasil dihapus"
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "Tidak dapat menghapus user sendiri"
}
```

**Flutter Implementation Notes:**

- Confirmation dialog: "Yakin hapus user ini?"
- Cek apakah user punya survey aktif (tampilkan warning)
- Hide delete button jika user = current user

---

## Dashboard Endpoints (Admin Only)

### GET /api/dashboard/stats

Get statistik overview

**Headers:** `Authorization: Bearer <token>`

**Response Success (200):**

```json
{
  "success": true,
  "message": "Statistik berhasil diambil",
  "data": {
    "total_users": 10,
    "total_surveyors": 8,
    "total_admins": 2,
    "total_surveys": 150,
    "draft_surveys": 30,
    "submitted_surveys": 80,
    "verified_surveys": 40,
    "surveys_today": 5,
    "surveys_this_month": 45
  }
}
```

**Flutter Implementation Notes:**

- Dashboard screen dengan cards
- Chart untuk visualisasi data
- Hanya accessible untuk Admin

---

## File Upload URLs

**Base URL untuk akses file:** `http://31.97.107.110:3000/uploads/`

**Foto:** `http://31.97.107.110:3000/uploads/foto/{filename}`
**Dokumen:** `http://31.97.107.110:3000/uploads/dokumen/{filename}`

**Flutter Implementation Notes:**

- Gunakan CachedNetworkImage untuk foto
- Gunakan flutter_pdfview atau url_launcher untuk dokumen
- Handle 404 jika file tidak ditemukan

---

## Error Handling

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (token invalid/expired)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

### Common Error Messages

```
"Token tidak valid"
"Token expired"
"Authorization header tidak ditemukan"
"Akses ditolak. Hanya admin yang dapat mengakses endpoint ini"
"Survey tidak ditemukan"
"Anda tidak memiliki akses untuk mengubah survey ini"
"Survey yang sudah disubmit tidak dapat diubah"
"Survey yang sudah terverifikasi tidak dapat dihapus"
"Username atau password salah"
"Username sudah digunakan"
"Koordinat GPS wajib diisi"
```

**Flutter Implementation Notes:**

- Intercept 401: Auto logout & navigate ke login
- Intercept 403: Tampilkan "Access Denied" dialog
- Intercept 500: Tampilkan "Server Error" dengan retry button
- Show SnackBar untuk error messages

---

## Flutter App Architecture Recommendations

### State Management

- Gunakan Provider / Riverpod / Bloc
- AuthProvider: untuk manage auth state & token
- SurveyProvider: untuk manage survey list & CRUD
- UserProvider: untuk manage user list & CRUD (admin only)

### Folder Structure

```
lib/
  models/
    user_model.dart
    survey_model.dart
    api_response_model.dart
  services/
    api_service.dart
    auth_service.dart
    survey_service.dart
    user_service.dart
  providers/
    auth_provider.dart
    survey_provider.dart
    user_provider.dart
  screens/
    auth/
      login_screen.dart
    surveyor/
      survey_list_screen.dart
      survey_detail_screen.dart
      survey_form_screen.dart
    admin/
      admin_dashboard_screen.dart
      user_list_screen.dart
      user_form_screen.dart
      survey_list_admin_screen.dart
  widgets/
    survey_card.dart
    status_badge.dart
    custom_button.dart
  utils/
    constants.dart
    validators.dart
```

### Required Packages

```yaml
dependencies:
  http: ^1.1.0
  flutter_secure_storage: ^9.0.0
  provider: ^6.1.1
  image_picker: ^1.0.5
  file_picker: ^6.1.1
  geolocator: ^10.1.0
  geocoding: ^2.1.1
  cached_network_image: ^3.3.0
  intl: ^0.18.1
  flutter_pdfview: ^1.3.2
  url_launcher: ^6.2.2
```

### API Service Example

```dart
class ApiService {
  static const String baseUrl = 'http://31.97.107.110:3000';

  Future<String?> getToken() async {
    final storage = FlutterSecureStorage();
    return await storage.read(key: 'auth_token');
  }

  Future<Map<String, String>> getHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<dynamic> get(String endpoint) async {
    final headers = await getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
    );
    return _handleResponse(response);
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode == 401) {
      // Auto logout
      throw UnauthorizedException();
    }

    final data = json.decode(response.body);
    if (data['success'] == false) {
      throw ApiException(data['message']);
    }

    return data;
  }
}
```

---

## UI/UX Recommendations

### Login Screen

- Logo aplikasi
- Username & password field
- "Login" button
- Remember me (optional)
- Loading indicator saat login

### Surveyor App Flow

1. **Survey List Screen**
   - Tab: Draft / Submitted / Verified
   - FAB (+) untuk create survey baru
   - Card per survey dengan: foto, alamat, status badge, tanggal
   - Pull to refresh
   - Infinite scroll pagination

2. **Survey Form Screen**
   - Ambil GPS otomatis
   - Map preview dengan marker
   - Upload foto (required)
   - Input alamat keterangan
   - Upload dokumen (optional)
   - Input dokumen keterangan (optional)
   - Button: Save (status TERSIMPAN) & Submit (status TERKIRIM)

3. **Survey Detail Screen**
   - Foto preview (zoom-able)
   - Map dengan marker
   - Info lengkap survey
   - Status badge
   - Buttons: Edit (jika TERSIMPAN), Submit (jika TERSIMPAN), Delete (sesuai rules)

### Admin App Flow

1. **Dashboard Screen**
   - Stats cards: Total surveys, draft, submitted, verified
   - Chart: Survey per bulan
   - Recent surveys list
   - Navigation ke User Management & Survey List

2. **User List Screen**
   - Tab: All / Admin / Surveyor
   - Search bar
   - Card per user dengan stats
   - FAB (+) untuk create user baru

3. **User Form Screen**
   - Form create/edit user
   - Role dropdown
   - Password field (optional untuk edit)

4. **Survey List Admin Screen**
   - Filter by: Status, User, Date range
   - Card per survey dengan user info
   - Actions: View, Verify (jika TERKIRIM), Delete (sesuai rules)

### Status Badge Colors

- **TERSIMPAN**: 🟡 Yellow / Amber
- **TERKIRIM**: 🔵 Blue / Primary
- **TERVERIFIKASI**: 🟢 Green / Success

---

## Testing Credentials

**Admin:**

```
Username: admin
Password: admin123
```

**Surveyor:**

```
Username: surveyor1
Password: surveyor123
```

---

## Important Notes

1. **GPS Coordinates:**
   - Gunakan Geolocator untuk ambil current location
   - Longitude: -180 to 180
   - Latitude: -90 to 90
   - Validasi di client-side sebelum submit

2. **File Upload:**
   - Max size: 2MB per file
   - Foto: JPG/PNG
   - Dokumen: PDF/JPG/PNG
   - Compress image sebelum upload

3. **Offline Support (Optional):**
   - Simpan draft survey di local database (SQLite)
   - Sync ke server saat online
   - Show indicator jika offline

4. **Security:**
   - Token disimpan di secure storage (NEVER di SharedPreferences)
   - Logout hapus token & user data
   - Auto logout jika 401 Unauthorized

5. **Performance:**
   - Gunakan pagination untuk list
   - Cache images dengan CachedNetworkImage
   - Lazy load images di list
   - Debounce untuk search

6. **User Experience:**
   - Loading indicators untuk semua API calls
   - Error messages yang jelas
   - Confirmation dialogs untuk destructive actions
   - Pull to refresh untuk list screens

---

## Database Schema (FYI)

### t_user

```sql
id_user         INTEGER PRIMARY KEY
username        VARCHAR(50) UNIQUE NOT NULL
password        VARCHAR(255) NOT NULL
no_hp           VARCHAR(15) NOT NULL
alamat          VARCHAR(1000) NOT NULL
ktp             VARCHAR(16) UNIQUE
keterangan      VARCHAR(1000)
role_user       INTEGER NOT NULL DEFAULT 2  -- 1=Admin, 2=Surveyor
create_user_date TIMESTAMP DEFAULT NOW()
```

### t_data_survey

```sql
id_survey           INTEGER PRIMARY KEY
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

**API Version:** 1.0.0  
**Status:** Production Ready ✅  
**Last Updated:** February 10, 2026

---

## Quick Start Checklist untuk Flutter Development

- [ ] Setup project Flutter baru
- [ ] Install dependencies (http, flutter_secure_storage, provider, dll)
- [ ] Create models (User, Survey, ApiResponse)
- [ ] Create API service dengan base URL & auth headers
- [ ] Implement login & token management
- [ ] Create AuthProvider dengan state management
- [ ] Build login screen
- [ ] Build survey list screen dengan pagination
- [ ] Build survey form screen dengan GPS & file upload
- [ ] Build survey detail screen
- [ ] Implement status rules (edit/delete conditions)
- [ ] Build admin dashboard (jika Admin)
- [ ] Build user management screens (jika Admin)
- [ ] Test semua flow (surveyor & admin)
- [ ] Handle error & edge cases
- [ ] Polish UI/UX

---

**Good luck with Flutter development! 🚀**
