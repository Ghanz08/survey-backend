#!/bin/bash

# Test Script untuk Fitur Status Verifikasi Survey
# Testing 3 status: TERSIMPAN, TERKIRIM, TERVERIFIKASI

BASE_URL="http://localhost:3000"
ADMIN_TOKEN=""
SURVEYOR_TOKEN=""
SURVEY_ID=""

echo "=========================================="
echo "TEST: FITUR STATUS VERIFIKASI SURVEY"
echo "=========================================="
echo ""

# Test 1: Login sebagai Admin
echo "✅ Test 1: Login sebagai Admin"
ADMIN_LOGIN=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }')

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Admin Token: ${ADMIN_TOKEN:0:20}..."
echo ""

# Test 2: Login sebagai Surveyor
echo "✅ Test 2: Login sebagai Surveyor"
SURVEYOR_LOGIN=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "surveyor1",
    "password": "surveyor123"
  }')

SURVEYOR_TOKEN=$(echo $SURVEYOR_LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Surveyor Token: ${SURVEYOR_TOKEN:0:20}..."
echo ""

# Test 3: Create Survey dengan status TERSIMPAN
echo "✅ Test 3: Create Survey - Status TERSIMPAN (Surveyor)"
CREATE_SURVEY=$(curl -s -X POST $BASE_URL/api/survey \
  -H "Authorization: Bearer $SURVEYOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "longitude_x": 106.8456,
    "latitude_y": -6.2088,
    "alamat_keterangan": "Test Survey untuk Verifikasi"
  }')

echo $CREATE_SURVEY | jq '.'
SURVEY_ID=$(echo $CREATE_SURVEY | grep -o '"id_survey":[0-9]*' | grep -o '[0-9]*')
echo "Survey ID: $SURVEY_ID"
echo ""

# Test 4: Update Survey (harus berhasil - status TERSIMPAN)
echo "✅ Test 4: Update Survey dengan Status TERSIMPAN (harus BERHASIL)"
curl -s -X PUT $BASE_URL/api/survey/$SURVEY_ID \
  -H "Authorization: Bearer $SURVEYOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "alamat_keterangan": "Survey diupdate - masih TERSIMPAN"
  }' | jq '.'
echo ""

# Test 5: Submit Survey (TERSIMPAN -> TERKIRIM)
echo "✅ Test 5: Submit Survey (TERSIMPAN → TERKIRIM)"
curl -s -X POST $BASE_URL/api/survey/$SURVEY_ID/submit \
  -H "Authorization: Bearer $SURVEYOR_TOKEN" | jq '.'
echo ""

# Test 6: Update Survey setelah Submit (harus gagal - status TERKIRIM)
echo "❌ Test 6: Update Survey dengan Status TERKIRIM (harus GAGAL)"
curl -s -X PUT $BASE_URL/api/survey/$SURVEY_ID \
  -H "Authorization: Bearer $SURVEYOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "alamat_keterangan": "Mencoba update setelah submit"
  }' | jq '.'
echo ""

# Test 7: Delete Survey oleh Surveyor (harus gagal - sudah TERKIRIM)
echo "❌ Test 7: Delete Survey oleh Surveyor dengan Status TERKIRIM (harus GAGAL)"
curl -s -X DELETE $BASE_URL/api/survey/$SURVEY_ID \
  -H "Authorization: Bearer $SURVEYOR_TOKEN" | jq '.'
echo ""

# Test 8: Verify Survey oleh Surveyor (harus gagal - bukan admin)
echo "❌ Test 8: Verify Survey oleh Surveyor (harus GAGAL - bukan admin)"
curl -s -X POST $BASE_URL/api/survey/$SURVEY_ID/verify \
  -H "Authorization: Bearer $SURVEYOR_TOKEN" | jq '.'
echo ""

# Test 9: Verify Survey oleh Admin (harus berhasil)
echo "✅ Test 9: Verify Survey oleh Admin (TERKIRIM → TERVERIFIKASI)"
curl -s -X POST $BASE_URL/api/survey/$SURVEY_ID/verify \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo ""

# Test 10: Update Survey setelah Verifikasi (harus gagal)
echo "❌ Test 10: Update Survey dengan Status TERVERIFIKASI (harus GAGAL)"
curl -s -X PUT $BASE_URL/api/survey/$SURVEY_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "alamat_keterangan": "Mencoba update setelah verifikasi"
  }' | jq '.'
echo ""

# Test 11: Delete Survey TERVERIFIKASI oleh Admin (harus gagal)
echo "❌ Test 11: Delete Survey TERVERIFIKASI oleh Admin (harus GAGAL)"
curl -s -X DELETE $BASE_URL/api/survey/$SURVEY_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo ""

# Test 12: Create Survey TERSIMPAN untuk test delete
echo "✅ Test 12: Create Survey baru untuk test delete"
CREATE_SURVEY2=$(curl -s -X POST $BASE_URL/api/survey \
  -H "Authorization: Bearer $SURVEYOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "longitude_x": 106.8500,
    "latitude_y": -6.2100,
    "alamat_keterangan": "Survey untuk test delete"
  }')

SURVEY_ID2=$(echo $CREATE_SURVEY2 | grep -o '"id_survey":[0-9]*' | grep -o '[0-9]*')
echo "Survey ID 2: $SURVEY_ID2"
echo ""

# Test 13: Delete Survey TERSIMPAN oleh Surveyor (harus berhasil)
echo "✅ Test 13: Delete Survey TERSIMPAN oleh Surveyor (harus BERHASIL)"
curl -s -X DELETE $BASE_URL/api/survey/$SURVEY_ID2 \
  -H "Authorization: Bearer $SURVEYOR_TOKEN" | jq '.'
echo ""

# Test 14: Create Survey untuk test delete TERKIRIM oleh Admin
echo "✅ Test 14: Create Survey untuk test delete TERKIRIM"
CREATE_SURVEY3=$(curl -s -X POST $BASE_URL/api/survey \
  -H "Authorization: Bearer $SURVEYOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "longitude_x": 106.8600,
    "latitude_y": -6.2200,
    "alamat_keterangan": "Survey untuk test delete TERKIRIM"
  }')

SURVEY_ID3=$(echo $CREATE_SURVEY3 | grep -o '"id_survey":[0-9]*' | grep -o '[0-9]*')
echo "Survey ID 3: $SURVEY_ID3"

# Submit dulu
curl -s -X POST $BASE_URL/api/survey/$SURVEY_ID3/submit \
  -H "Authorization: Bearer $SURVEYOR_TOKEN" > /dev/null
echo ""

# Test 15: Delete Survey TERKIRIM oleh Admin (harus berhasil)
echo "✅ Test 15: Delete Survey TERKIRIM oleh Admin (harus BERHASIL)"
curl -s -X DELETE $BASE_URL/api/survey/$SURVEY_ID3 \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo ""

# Test 16: Get Survey List untuk cek hasil akhir
echo "✅ Test 16: Get Survey List - Cek hasil akhir"
curl -s -X GET "$BASE_URL/api/survey?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data.surveys[] | {id: .id_survey, status: .status, alamat: .alamat_keterangan}'
echo ""

echo "=========================================="
echo "✅ TEST SELESAI!"
echo "=========================================="
echo ""
echo "📋 Ringkasan Test:"
echo "  ✅ TERSIMPAN: Bisa diupdate & dihapus oleh surveyor"
echo "  ✅ TERKIRIM: Tidak bisa diupdate, bisa dihapus oleh admin"
echo "  ✅ TERVERIFIKASI: Tidak bisa diupdate & dihapus oleh siapapun"
echo ""
