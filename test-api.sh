#!/bin/bash

# Survey Lokasi Backend - API Test Script
# Pastikan server sudah running di port 3000

BASE_URL="http://localhost:3000"
TOKEN=""

echo "=================================="
echo "SURVEY LOKASI API - TEST SCRIPT"
echo "=================================="
echo ""

# Test 1: Health Check
echo "✅ Test 1: Health Check"
curl -s $BASE_URL/ | json_pp
echo ""
echo ""

# Test 2: Login (Admin)
echo "✅ Test 2: Login sebagai Admin"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }')

echo $LOGIN_RESPONSE | json_pp
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo ""
echo "Token: $TOKEN"
echo ""
echo ""

# Test 3: Get Profile
echo "✅ Test 3: Get Current User Profile"
curl -s -X GET $BASE_URL/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | json_pp
echo ""
echo ""

# Test 4: Create Survey (TERSIMPAN)
echo "✅ Test 4: Create Survey - Status TERSIMPAN"
curl -s -X POST $BASE_URL/api/survey \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_objek": "Gedung Perkantoran A",
    "jenis_objek": "Gedung",
    "longitude_x": 106.8456,
    "latitude_y": -6.2088,
    "alamat_manual": "Jl. Sudirman No.123, Jakarta Pusat",
    "keterangan": "Gedung 10 lantai dengan parkir basement",
    "status": "TERSIMPAN"
  }' | json_pp
echo ""
echo ""

# Test 5: Create Survey (TERKIRIM)
echo "✅ Test 5: Create Survey - Status TERKIRIM"
SURVEY_RESPONSE=$(curl -s -X POST $BASE_URL/api/survey \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_objek": "Taman Kota B",
    "jenis_objek": "Taman",
    "longitude_x": 106.8123,
    "latitude_y": -6.2145,
    "alamat_manual": "Jl. Thamrin No.45, Jakarta Pusat",
    "keterangan": "Taman dengan area jogging",
    "status": "TERKIRIM"
  }')

echo $SURVEY_RESPONSE | json_pp
SURVEY_ID=$(echo $SURVEY_RESPONSE | grep -o '"id_data_survey":[0-9]*' | grep -o '[0-9]*')
echo ""
echo "Survey ID: $SURVEY_ID"
echo ""
echo ""

# Test 6: Get Survey List
echo "✅ Test 6: Get Survey List"
curl -s -X GET "$BASE_URL/api/survey?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | json_pp
echo ""
echo ""

# Test 7: Get Survey Detail
if [ ! -z "$SURVEY_ID" ]; then
  echo "✅ Test 7: Get Survey Detail (ID: $SURVEY_ID)"
  curl -s -X GET "$BASE_URL/api/survey/$SURVEY_ID" \
    -H "Authorization: Bearer $TOKEN" | json_pp
  echo ""
  echo ""
fi

# Test 8: Update Survey
if [ ! -z "$SURVEY_ID" ]; then
  echo "✅ Test 8: Update Survey (ID: $SURVEY_ID) - Should FAIL (already TERKIRIM)"
  curl -s -X PUT "$BASE_URL/api/survey/$SURVEY_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "nama_objek": "Taman Kota B (Updated)",
      "keterangan": "Updated description"
    }' | json_pp
  echo ""
  echo ""
fi

# Test 9: Search Survey
echo "✅ Test 9: Search Survey by Alamat"
curl -s -X GET "$BASE_URL/api/survey?search=Jakarta" \
  -H "Authorization: Bearer $TOKEN" | json_pp
echo ""
echo ""

# Test 10: Filter by Status
echo "✅ Test 10: Filter Survey by Status TERKIRIM"
curl -s -X GET "$BASE_URL/api/survey?status=TERKIRIM" \
  -H "Authorization: Bearer $TOKEN" | json_pp
echo ""
echo ""

# Test 11: Login Failed
echo "✅ Test 11: Login Failed - Wrong Password"
curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "wrongpassword"
  }' | json_pp
echo ""
echo ""

# Test 12: Create Survey Without Auth
echo "✅ Test 12: Create Survey Without Authorization - Should FAIL"
curl -s -X POST $BASE_URL/api/survey \
  -H "Content-Type: application/json" \
  -d '{
    "nama_objek": "Test",
    "jenis_objek": "Test"
  }' | json_pp
echo ""
echo ""

# Test 13: Create Survey Missing Required Fields
echo "✅ Test 13: Create Survey Missing alamat_manual - Should FAIL"
curl -s -X POST $BASE_URL/api/survey \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nama_objek": "Test Object",
    "jenis_objek": "Test",
    "longitude_x": 106.8456,
    "latitude_y": -6.2088
  }' | json_pp
echo ""
echo ""

echo "=================================="
echo "✅ ALL TESTS COMPLETED"
echo "=================================="
