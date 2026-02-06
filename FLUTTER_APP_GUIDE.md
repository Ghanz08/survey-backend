# 📱 Flutter App Development - Survey Lokasi Objek

## 🎯 PROMPT UNTUK AI DEVELOPER FLUTTER

Copy prompt di bawah ini dan berikan ke AI untuk develop Flutter app:

---

# PROMPT: Develop Flutter App - Survey Lokasi Objek

Saya butuh bantuan untuk develop Flutter app bernama **"Survey Lokasi Objek"** dengan koneksi ke backend REST API yang sudah jadi. Berikut requirement lengkapnya:

## 📋 Overview Project

**Nama Aplikasi:** Survey Lokasi Objek  
**Platform:** Android (Flutter)  
**Backend API:** REST API dengan JWT Authentication (sudah production-ready)  
**User Roles:** Admin dan Surveyor

## 🎨 Design Reference & UI/UX

### Design System:

- **Material Design 3** - Modern, clean, professional
- **Color Scheme:**
  - Primary: Blue (#2196F3) - representasi teknologi & trust
  - Secondary: Green (#4CAF50) - success actions
  - Accent: Orange (#FF9800) - important actions
  - Background: White (#FFFFFF) / Light Gray (#F5F5F5)
  - Error: Red (#F44336)

### Typography:

- **Font Family:** Google Fonts - Roboto (default Material)
- **Heading:** Bold, 24-28sp
- **Body:** Regular, 14-16sp
- **Caption:** Light, 12sp

### UI Components Style:

- Rounded corners (8-12dp border radius)
- Elevation/Shadow untuk cards
- Smooth transitions dan animations
- Bottom Navigation Bar untuk navigasi utama
- Floating Action Button untuk create survey
- Pull-to-refresh untuk list data
- Loading indicators (Circular Progress Indicator)
- Snackbar untuk notifications

### Reference Apps untuk Inspirasi:

1. **Google Maps** - Untuk map integration dan location picking
2. **Google Forms** - Untuk form input yang clean
3. **Todoist** - Untuk list management yang smooth
4. **Microsoft To Do** - Untuk status management (draft vs submitted)

## 📦 Required Packages/Libraries

### Core Packages:

```yaml
dependencies:
  flutter:
    sdk: flutter

  # State Management
  provider: ^6.1.1 # State management (recommended untuk beginner-friendly)
  # Atau gunakan: bloc: ^8.1.3  # Jika prefer BLoC pattern

  # HTTP & API
  http: ^1.1.0 # HTTP requests ke backend
  dio: ^5.4.0 # Alternative HTTP client (lebih powerful)

  # Local Storage
  shared_preferences: ^2.2.2 # Simpan JWT token & user data
  flutter_secure_storage: ^9.0.0 # Secure storage untuk sensitive data

  # Location & GPS
  geolocator: ^10.1.0 # Get GPS coordinates (WAJIB!)
  geocoding: ^2.1.1 # Reverse geocoding (optional)
  google_maps_flutter: ^2.5.0 # Google Maps integration (optional tapi recommended)

  # Image & Camera
  image_picker: ^1.0.5 # Pick foto dari camera/gallery
  image_cropper: ^5.0.1 # Crop foto sebelum upload
  cached_network_image: ^3.3.0 # Cache images dari server

  # File Management
  file_picker: ^6.1.1 # Pick dokumen (PDF, JPG, etc)
  path_provider: ^2.1.1 # Get app directory path

  # UI Components
  flutter_svg: ^2.0.9 # SVG icons support
  shimmer: ^3.0.0 # Loading skeleton
  pull_to_refresh: ^2.0.0 # Pull to refresh functionality
  flutter_spinkit: ^5.2.0 # Loading indicators

  # Forms & Validation
  flutter_form_builder: ^9.1.1 # Form builder
  form_field_validator: ^1.1.0 # Form validation

  # Date & Time
  intl: ^0.18.1 # Date formatting

  # Utils
  permission_handler: ^11.0.1 # Handle permissions (GPS, Camera, Storage)
  connectivity_plus: ^5.0.2 # Check internet connection
  url_launcher: ^6.2.2 # Open URLs (untuk ke Swagger docs)

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_launcher_icons: ^0.13.1 # Generate app icons
```

## 🏗️ Project Architecture

### Folder Structure:

```
lib/
├── main.dart
├── app.dart                          # MaterialApp setup
├── config/
│   ├── api_config.dart              # Base URL, endpoints
│   ├── app_theme.dart               # Theme configuration
│   └── constants.dart               # App constants
├── models/
│   ├── user_model.dart              # User data model
│   ├── survey_model.dart            # Survey data model
│   └── api_response_model.dart      # Standard API response
├── services/
│   ├── api_service.dart             # Base API service
│   ├── auth_service.dart            # Authentication service
│   ├── survey_service.dart          # Survey CRUD service
│   ├── user_service.dart            # User management service
│   ├── dashboard_service.dart       # Dashboard data service
│   └── location_service.dart        # GPS & Location service
├── providers/
│   ├── auth_provider.dart           # Auth state management
│   ├── survey_provider.dart         # Survey state management
│   └── user_provider.dart           # User state management
├── screens/
│   ├── splash_screen.dart           # Splash screen
│   ├── auth/
│   │   └── login_screen.dart        # Login page
│   ├── surveyor/
│   │   ├── surveyor_home_screen.dart       # Surveyor dashboard
│   │   ├── survey_list_screen.dart         # List surveys
│   │   ├── survey_create_screen.dart       # Create survey (form)
│   │   ├── survey_edit_screen.dart         # Edit survey
│   │   ├── survey_detail_screen.dart       # View survey detail
│   │   └── profile_screen.dart             # User profile
│   └── admin/
│       ├── admin_home_screen.dart          # Admin dashboard
│       ├── admin_survey_list_screen.dart   # All surveys list
│       ├── user_management_screen.dart     # Manage users
│       ├── user_create_screen.dart         # Create new user
│       ├── user_edit_screen.dart           # Edit user
│       ├── dashboard_analytics_screen.dart # Charts & stats
│       └── admin_profile_screen.dart       # Admin profile
├── widgets/
│   ├── custom_app_bar.dart          # Reusable app bar
│   ├── custom_button.dart           # Custom buttons
│   ├── custom_text_field.dart       # Custom input fields
│   ├── survey_card.dart             # Survey list item card
│   ├── user_card.dart               # User list item card
│   ├── loading_widget.dart          # Loading indicators
│   ├── empty_state_widget.dart      # Empty data state
│   ├── error_widget.dart            # Error display
│   └── stat_card.dart               # Dashboard stat card
└── utils/
    ├── validators.dart              # Form validators
    ├── date_formatter.dart          # Date utilities
    ├── permission_handler.dart      # Handle permissions
    └── app_logger.dart              # Logging utility
```

## 📱 Screens & Features Detail

### 1. **Splash Screen** (splash_screen.dart)

- Logo aplikasi
- Loading indicator
- Auto check JWT token di local storage
- Navigate ke Login (jika belum login) atau Home (jika sudah login)

### 2. **Login Screen** (login_screen.dart)

**Fitur:**

- Input username & password
- Remember me checkbox (optional)
- Login button dengan loading state
- Error message handling
- Detect role (Admin/Surveyor) dari response
- Save JWT token ke secure storage
- Navigate berdasarkan role

**API:**

```
POST /api/auth/login
Body: { username, password }
Response: { token, user: { role_user } }
```

### 3. **Surveyor Home Screen** (surveyor_home_screen.dart)

**Layout:** Bottom Navigation (Home, Surveys, Profile)

**Fitur:**

- Welcome message dengan nama user
- Quick stats: Total Surveys, Draft, Submitted
- Recent surveys (5 terakhir)
- FAB untuk create survey baru
- Pull to refresh

**API:**

```
GET /api/survey?limit=5
GET /api/auth/me (untuk user info)
```

### 4. **Survey List Screen** (survey_list_screen.dart)

**Fitur:**

- List semua surveys milik surveyor
- Filter: All / Draft / Submitted
- Search by alamat_keterangan
- Pull to refresh
- Each item show: alamat, tanggal, status badge
- Tap item → Survey Detail
- Swipe to delete (hanya draft)

**API:**

```
GET /api/survey?status=TERSIMPAN&search=keyword
DELETE /api/survey/:id
```

### 5. **Survey Create Screen** (survey_create_screen.dart)

**Form Fields:**

1. **Auto GPS Button** → Ambil longitude_x & latitude_y (WAJIB!)
   - Show current coordinates
   - Validate GPS accuracy
   - Show map preview (optional)
2. **Foto** → Camera / Gallery (max 2MB, auto compress)
3. **Alamat Google Maps** (optional) → TextField
4. **Alamat Keterangan** (required) → TextField multiline
5. **Dokumen** (optional) → File picker (PDF/Image)
6. **Dokumen Keterangan** → TextField multiline

**Buttons:**

- **Simpan** (Draft) → Status TERSIMPAN
- **Submit** → Langsung status TERKIRIM
- **Cancel**

**Validations:**

- GPS coordinates wajib (latitude & longitude)
- alamat_keterangan wajib
- Foto wajib (atau set default)

**API:**

```
POST /api/survey
Body: {
  longitude_x: "106.845599",
  latitude_y: "-6.208763",
  alamat_keterangan: "...",
  alamat_google: "...",
  dokumen_keterangan: "..."
}
Files: foto, dokumen (multipart/form-data)
```

### 6. **Survey Edit Screen** (survey_edit_screen.dart)

- Form sama seperti Create
- Pre-fill dengan data existing
- Hanya bisa edit jika status = TERSIMPAN
- Show error jika sudah TERKIRIM

**API:**

```
PUT /api/survey/:id
```

### 7. **Survey Detail Screen** (survey_detail_screen.dart)

**Fitur:**

- Show semua data survey
- Display foto & dokumen
- Show map dengan marker (optional)
- Status badge (TERSIMPAN/TERKIRIM)
- Action buttons (berdasarkan status):
  - TERSIMPAN: Edit, Submit, Delete
  - TERKIRIM: View only

**API:**

```
GET /api/survey/:id
POST /api/survey/:id/submit
```

### 8. **Admin Home Screen** (admin_home_screen.dart)

**Layout:** Bottom Navigation (Dashboard, Surveys, Users, Profile)

**Fitur:**

- Overall statistics cards:
  - Total Users (Admin & Surveyor)
  - Total Surveys
  - Submitted Today/Week/Month
- Chart: Monthly trends (line chart)
- Chart: Status distribution (pie chart)
- Top 5 Surveyors leaderboard
- Recent surveys

**API:**

```
GET /api/dashboard/stats
GET /api/dashboard/monthly-trends
GET /api/dashboard/status-distribution
GET /api/dashboard/top-surveyors
GET /api/dashboard/recent-surveys
```

### 9. **Admin Survey List Screen** (admin_survey_list_screen.dart)

**Fitur:**

- List SEMUA surveys (dari semua surveyor)
- Filter: By surveyor, by status, by date range
- Search by alamat
- Export to Excel/CSV (optional)
- Tap → Survey Detail (read-only)
- Admin bisa delete any survey

**API:**

```
GET /api/survey (admin lihat semua)
DELETE /api/survey/:id (admin only)
```

### 10. **User Management Screen** (user_management_screen.dart)

**Fitur:**

- List semua users (Admin & Surveyor)
- Show: username, role badge, no_hp, total surveys
- Search by username
- FAB untuk create user baru
- Tap → Edit User
- Swipe to delete (cannot delete self)

**API:**

```
GET /api/users
DELETE /api/users/:id
```

### 11. **User Create/Edit Screen** (user_create_screen.dart, user_edit_screen.dart)

**Form Fields:**

- Username (required)
- Password (required untuk create)
- No HP (required)
- Alamat
- KTP (required)
- Keterangan
- Role: Dropdown (Admin/Surveyor)

**API:**

```
POST /api/users (create)
PUT /api/users/:id (update)
GET /api/users/:id (get detail)
```

### 12. **Profile Screen** (profile_screen.dart)

**Fitur:**

- Display user info (read-only)
- Change password (optional)
- App version
- Logout button
- Link ke API documentation (Swagger)

**API:**

```
GET /api/auth/me
```

## 🔗 Backend Integration Guide

### 1. **API Configuration** (api_config.dart)

```dart
class ApiConfig {
  // Ganti dengan IP server Anda
  static const String baseUrl = 'http://192.168.1.100:3000';

  // Endpoints
  static const String login = '/api/auth/login';
  static const String profile = '/api/auth/me';
  static const String surveys = '/api/survey';
  static const String users = '/api/users';
  static const String dashboardStats = '/api/dashboard/stats';
  // ... dst
}
```

### 2. **API Service Base** (api_service.dart)

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = ApiConfig.baseUrl;

  // Get JWT Token from storage
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }

  // GET Request
  Future<Map<String, dynamic>> get(String endpoint) async {
    final token = await getToken();
    final response = await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else if (response.statusCode == 401) {
      // Token expired, logout
      throw Exception('Unauthorized');
    } else {
      throw Exception('Failed to load data');
    }
  }

  // POST Request
  Future<Map<String, dynamic>> post(
    String endpoint,
    Map<String, dynamic> data
  ) async {
    final token = await getToken();
    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode(data),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return json.decode(response.body);
    } else {
      final error = json.decode(response.body);
      throw Exception(error['message'] ?? 'Request failed');
    }
  }

  // POST Multipart (untuk upload foto/dokumen)
  Future<Map<String, dynamic>> postMultipart(
    String endpoint,
    Map<String, String> fields,
    Map<String, String> files, // {fieldName: filePath}
  ) async {
    final token = await getToken();
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$baseUrl$endpoint'),
    );

    request.headers['Authorization'] = 'Bearer $token';
    request.fields.addAll(fields);

    // Add files
    for (var entry in files.entries) {
      request.files.add(
        await http.MultipartFile.fromPath(entry.key, entry.value)
      );
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return json.decode(response.body);
    } else {
      throw Exception('Upload failed');
    }
  }

  // PUT, DELETE methods... (similar structure)
}
```

### 3. **Authentication Service** (auth_service.dart)

```dart
class AuthService {
  final ApiService _api = ApiService();

  Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await _api.post('/api/auth/login', {
      'username': username,
      'password': password,
    });

    // Save token
    if (response['success']) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('jwt_token', response['data']['token']);
      await prefs.setString('user_data', json.encode(response['data']['user']));
    }

    return response;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
    await prefs.remove('user_data');
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token') != null;
  }

  Future<Map<String, dynamic>?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('user_data');
    if (userData != null) {
      return json.decode(userData);
    }
    return null;
  }
}
```

### 4. **Survey Service** (survey_service.dart)

```dart
class SurveyService {
  final ApiService _api = ApiService();

  // Create Survey dengan foto & dokumen
  Future<Map<String, dynamic>> createSurvey({
    required double longitudeX,
    required double latitudeY,
    required String alamatKeterangan,
    String? alamatGoogle,
    String? dokumenKeterangan,
    String? fotoPath,
    String? dokumenPath,
  }) async {
    final fields = {
      'longitude_x': longitudeX.toString(),
      'latitude_y': latitudeY.toString(),
      'alamat_keterangan': alamatKeterangan,
      if (alamatGoogle != null) 'alamat_google': alamatGoogle,
      if (dokumenKeterangan != null) 'dokumen_keterangan': dokumenKeterangan,
    };

    final files = <String, String>{};
    if (fotoPath != null) files['foto'] = fotoPath;
    if (dokumenPath != null) files['dokumen'] = dokumenPath;

    return await _api.postMultipart('/api/survey', fields, files);
  }

  // Get Survey List
  Future<List<dynamic>> getSurveys({
    String? status,
    String? search,
    int page = 1,
    int limit = 10,
  }) async {
    String endpoint = '/api/survey?page=$page&limit=$limit';
    if (status != null) endpoint += '&status=$status';
    if (search != null) endpoint += '&search=$search';

    final response = await _api.get(endpoint);
    return response['message']['surveys'];
  }

  // Submit Survey
  Future<Map<String, dynamic>> submitSurvey(int surveyId) async {
    return await _api.post('/api/survey/$surveyId/submit', {});
  }

  // Delete Survey
  Future<void> deleteSurvey(int surveyId) async {
    await _api.delete('/api/survey/$surveyId');
  }

  // ... methods lainnya
}
```

### 5. **Location Service** (location_service.dart)

```dart
import 'package:geolocator/geolocator.dart';

class LocationService {
  // Check & Request GPS Permission
  Future<bool> checkPermission() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return false;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return false;
    }

    return true;
  }

  // Get Current Position (GPS Coordinates)
  Future<Position?> getCurrentPosition() async {
    try {
      bool hasPermission = await checkPermission();
      if (!hasPermission) {
        throw Exception('Location permission denied');
      }

      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      return position;
    } catch (e) {
      print('Error getting location: $e');
      return null;
    }
  }

  // Validate GPS Accuracy
  bool isAccuracyGood(Position position) {
    // Accuracy dalam meter, < 20m dianggap bagus
    return position.accuracy < 20;
  }
}
```

## 🎨 UI/UX Implementation Examples

### Survey Card Widget (survey_card.dart)

```dart
class SurveyCard extends StatelessWidget {
  final Survey survey;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.location_on, color: Colors.blue),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      survey.alamatKeterangan,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  _buildStatusBadge(survey.status),
                ],
              ),
              SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.calendar_today, size: 16, color: Colors.grey),
                  SizedBox(width: 4),
                  Text(
                    DateFormat('dd MMM yyyy').format(survey.tglSurvey),
                    style: TextStyle(color: Colors.grey[600], fontSize: 14),
                  ),
                  Spacer(),
                  Icon(Icons.gps_fixed, size: 16, color: Colors.grey),
                  SizedBox(width: 4),
                  Text(
                    '${survey.latitudeY.toStringAsFixed(4)}, ${survey.longitudeX.toStringAsFixed(4)}',
                    style: TextStyle(color: Colors.grey[600], fontSize: 12),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color = status == 'TERSIMPAN' ? Colors.orange : Colors.green;
    String text = status == 'TERSIMPAN' ? 'Draft' : 'Submitted';

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
```

## 🔒 Security Implementation

### 1. **Secure Token Storage**

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorage {
  final _storage = FlutterSecureStorage();

  Future<void> saveToken(String token) async {
    await _storage.write(key: 'jwt_token', value: token);
  }

  Future<String?> getToken() async {
    return await _storage.read(key: 'jwt_token');
  }

  Future<void> deleteToken() async {
    await _storage.delete(key: 'jwt_token');
  }
}
```

### 2. **Auto Logout on Token Expire**

```dart
// Di API Service, handle 401 response
if (response.statusCode == 401) {
  // Clear token & navigate to login
  await AuthService().logout();
  Navigator.pushNamedAndRemoveUntil(
    context,
    '/login',
    (route) => false
  );
  throw Exception('Session expired. Please login again.');
}
```

## 📊 State Management Implementation (Provider)

### Auth Provider (auth_provider.dart)

```dart
import 'package:flutter/foundation.dart';

class AuthProvider with ChangeNotifier {
  bool _isLoggedIn = false;
  Map<String, dynamic>? _user;
  bool _isLoading = false;

  bool get isLoggedIn => _isLoggedIn;
  Map<String, dynamic>? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAdmin => _user?['role_user'] == 1;
  bool get isSurveyor => _user?['role_user'] == 2;

  final AuthService _authService = AuthService();

  Future<void> login(String username, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _authService.login(username, password);
      _isLoggedIn = true;
      _user = response['data']['user'];
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _isLoggedIn = false;
    _user = null;
    notifyListeners();
  }

  Future<void> checkLoginStatus() async {
    _isLoggedIn = await _authService.isLoggedIn();
    if (_isLoggedIn) {
      _user = await _authService.getCurrentUser();
    }
    notifyListeners();
  }
}
```

### Usage in main.dart

```dart
void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => SurveyProvider()),
        // ... providers lainnya
      ],
      child: MyApp(),
    ),
  );
}
```

## 🧪 Testing & Debugging

### 1. **Test Backend Connection**

Buat screen khusus untuk test koneksi:

```dart
// Test GET request
final response = await http.get(Uri.parse('http://YOUR_IP:3000/'));
print(response.body); // Should return API info

// Test Login
final loginResponse = await http.post(
  Uri.parse('http://YOUR_IP:3000/api/auth/login'),
  headers: {'Content-Type': 'application/json'},
  body: json.encode({'username': 'admin', 'password': 'admin123'}),
);
print(loginResponse.body);
```

### 2. **Debug GPS**

```dart
Position position = await Geolocator.getCurrentPosition();
print('Lat: ${position.latitude}, Lng: ${position.longitude}');
print('Accuracy: ${position.accuracy} meters');
```

### 3. **Enable HTTP Logging**

```dart
// Di API Service
print('Request: $endpoint');
print('Headers: $headers');
print('Body: $body');
print('Response: ${response.body}');
```

## 📱 Android Permissions (android/app/src/main/AndroidManifest.xml)

```xml
<manifest>
    <!-- Internet -->
    <uses-permission android:name="android.permission.INTERNET"/>

    <!-- Location/GPS -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <!-- Camera -->
    <uses-permission android:name="android.permission.CAMERA" />

    <!-- Storage -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>

    <application
        android:usesCleartextTraffic="true"
        ...
    </application>
</manifest>
```

## 🚀 Build & Deployment Steps

### 1. Development

```bash
flutter pub get
flutter run
```

### 2. Build APK

```bash
flutter build apk --release
# APK ada di: build/app/outputs/flutter-apk/app-release.apk
```

### 3. Testing di Real Device

- Enable USB Debugging
- Connect device via USB
- `flutter devices` untuk cek device
- `flutter run` untuk install & run

## ✅ Implementation Checklist

### Phase 1: Basic Setup (Week 1)

- [ ] Setup Flutter project dengan dependencies
- [ ] Buat folder structure
- [ ] Setup API Service base
- [ ] Implement Authentication (Login & Token storage)
- [ ] Create Splash Screen
- [ ] Test backend connection

### Phase 2: Surveyor Features (Week 2)

- [ ] Surveyor Home Screen dengan stats
- [ ] Survey List Screen
- [ ] Survey Detail Screen
- [ ] Implement GPS Location Service
- [ ] Survey Create Form (tanpa upload dulu)
- [ ] Test create survey basic

### Phase 3: Image & File Upload (Week 3)

- [ ] Implement Image Picker & Camera
- [ ] Image compression
- [ ] File Picker untuk dokumen
- [ ] Upload to backend (multipart)
- [ ] Survey Edit functionality
- [ ] Submit survey feature

### Phase 4: Admin Features (Week 4)

- [ ] Admin Dashboard dengan charts
- [ ] User Management screens
- [ ] Admin Survey List (view all)
- [ ] Analytics & Statistics
- [ ] Top Surveyors leaderboard

### Phase 5: Polish & Testing (Week 5)

- [ ] Error handling & validation
- [ ] Loading states & animations
- [ ] Pull to refresh
- [ ] Offline detection
- [ ] Testing semua flow
- [ ] Bug fixes & optimization

## 🎯 Success Criteria

1. ✅ Surveyor bisa create survey dengan GPS otomatis
2. ✅ Surveyor bisa edit survey (jika TERSIMPAN)
3. ✅ Surveyor bisa submit survey (TERKIRIM)
4. ✅ Admin bisa lihat dashboard analytics
5. ✅ Admin bisa kelola users (CRUD)
6. ✅ Admin bisa lihat semua surveys
7. ✅ Foto & dokumen berhasil di-upload
8. ✅ JWT authentication bekerja dengan baik
9. ✅ GPS coordinates akurat (< 20m accuracy)
10. ✅ App responsive & smooth (no lag)

## 📚 Learning Resources

### Flutter:

- [Flutter Documentation](https://flutter.dev/docs)
- [Flutter Cookbook](https://docs.flutter.dev/cookbook)
- [Provider Package](https://pub.dev/packages/provider)

### Backend Integration:

- API Documentation: `http://localhost:3000/api-docs` (Swagger)
- Backend README: Lihat file `README.md` di backend folder

### Maps & Location:

- [Geolocator Plugin](https://pub.dev/packages/geolocator)
- [Google Maps Flutter](https://pub.dev/packages/google_maps_flutter)

## 🐛 Common Issues & Solutions

### Issue 1: Cannot connect to backend

**Solution:**

- Pastikan backend running di `npm run dev`
- Ganti `localhost` dengan IP address komputer (cek di terminal: `ipconfig` atau `ifconfig`)
- Tambahkan `android:usesCleartextTraffic="true"` di AndroidManifest.xml

### Issue 2: GPS tidak berfungsi

**Solution:**

- Check permissions di AndroidManifest.xml
- Test di real device (emulator GPS sering tidak akurat)
- Enable High Accuracy mode di device settings

### Issue 3: Image upload failed

**Solution:**

- Check file size (max 2MB)
- Compress image sebelum upload
- Pastikan content-type: multipart/form-data

### Issue 4: Token expired

**Solution:**

- Handle 401 response → auto logout
- Token expire setelah 7 hari
- Implement refresh token (optional)

---

## 🎯 DELIVERABLES YANG DIHARAPKAN

Setelah development selesai, pastikan aplikasi memiliki:

1. ✅ **19 API endpoints** terkoneksi dengan baik
2. ✅ **2 user roles** (Admin & Surveyor) dengan UI berbeda
3. ✅ **GPS integration** dengan validasi akurasi
4. ✅ **Photo & document upload** dengan compression
5. ✅ **Smooth UX** dengan loading states & error handling
6. ✅ **Clean code** dengan architecture yang jelas
7. ✅ **Responsive UI** yang mengikuti Material Design
8. ✅ **Working authentication** dengan JWT token
9. ✅ **Admin dashboard** dengan charts & analytics
10. ✅ **Production-ready APK** yang bisa di-install di device

---

**Backend API Endpoint:** `http://YOUR_SERVER_IP:3000`  
**API Documentation:** `http://YOUR_SERVER_IP:3000/api-docs`  
**Demo Accounts:**

- Admin: username=`admin`, password=`admin123`
- Surveyor: username=`surveyor1`, password=`surveyor123`

---

Tolong develop Flutter app sesuai spesifikasi di atas. Jika ada yang tidak jelas, tanyakan dulu sebelum coding. Prioritaskan Phase 1 & 2 dulu untuk MVP (Minimum Viable Product).
