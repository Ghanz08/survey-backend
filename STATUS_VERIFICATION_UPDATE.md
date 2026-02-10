# Update Status Verifikasi Survey

## Ringkasan Perubahan

Sistem status survey telah diperbarui untuk menambahkan status baru **TERVERIFIKASI** dan logika proteksi penghapusan.

## Status Survey

### Status yang Tersedia:

1. **TERSIMPAN** - Status default saat survey dibuat
2. **TERKIRIM** - Status setelah survey disubmit
3. **TERVERIFIKASI** - Status setelah survey diverifikasi oleh admin (baru)

## Alur Status

```
TERSIMPAN → TERKIRIM → TERVERIFIKASI
```

## Fitur Baru

### 1. Verifikasi Survey (Admin Only)

**Endpoint:** `POST /api/survey/:id/verify`

**Akses:** Hanya Admin (role_user = 1)

**Deskripsi:** Admin dapat memverifikasi survey yang sudah disubmit

**Response:**

```json
{
  "success": true,
  "message": "Survey berhasil diverifikasi",
  "data": {
    "id_survey": 1,
    "status": "TERVERIFIKASI",
    ...
  }
}
```

**Error Handling:**

- Survey harus sudah disubmit (status TERKIRIM)
- Hanya admin yang bisa melakukan verifikasi
- Survey yang sudah terverifikasi tidak bisa diverifikasi lagi

## Perubahan Logika Penghapusan

### Status TERSIMPAN

- ✅ Dapat dihapus oleh surveyor (owner)
- ✅ Dapat dihapus oleh admin

### Status TERKIRIM

- ❌ Tidak dapat dihapus oleh surveyor
- ✅ Dapat dihapus oleh admin

### Status TERVERIFIKASI

- ❌ Tidak dapat dihapus oleh surveyor
- ❌ **TIDAK dapat dihapus oleh admin** (PROTEKSI)

## Perubahan Logika Update

### Status TERSIMPAN

- ✅ Dapat diupdate oleh surveyor (owner)
- ✅ Dapat diupdate oleh admin

### Status TERKIRIM

- ❌ Tidak dapat diupdate oleh siapapun

### Status TERVERIFIKASI

- ❌ **Tidak dapat diupdate oleh siapapun** (PROTEKSI)

## Files Modified

1. **src/models/survey.js**
   - Menambahkan "TERVERIFIKASI" ke validasi status
   - Update comment field status

2. **src/services/survey.service.js**
   - Update `deleteSurvey()`: Cek status TERVERIFIKASI sebelum delete
   - Update `updateSurvey()`: Cek status TERVERIFIKASI sebelum update
   - Tambah method baru `verifySurvey()`: Untuk memverifikasi survey

3. **src/controllers/survey.controller.js**
   - Tambah controller `verifySurvey()`: Handler untuk endpoint verifikasi

4. **src/routes/survey.routes.js**
   - Tambah route `POST /api/survey/:id/verify`: Endpoint verifikasi

## Testing Checklist

- [ ] Test create survey (status default TERSIMPAN)
- [ ] Test submit survey (status berubah ke TERKIRIM)
- [ ] Test verify survey as admin (status berubah ke TERVERIFIKASI)
- [ ] Test verify survey as surveyor (harus error)
- [ ] Test delete survey dengan status TERSIMPAN (berhasil)
- [ ] Test delete survey dengan status TERKIRIM oleh admin (berhasil)
- [ ] Test delete survey dengan status TERKIRIM oleh surveyor (error)
- [ ] Test delete survey dengan status TERVERIFIKASI oleh admin (error)
- [ ] Test delete survey dengan status TERVERIFIKASI oleh surveyor (error)
- [ ] Test update survey dengan status TERSIMPAN (berhasil)
- [ ] Test update survey dengan status TERKIRIM (error)
- [ ] Test update survey dengan status TERVERIFIKASI (error)

## API Endpoints Summary

| Method | Endpoint               | Role  | Status Required      | Description                               |
| ------ | ---------------------- | ----- | -------------------- | ----------------------------------------- |
| POST   | /api/survey            | All   | -                    | Create survey (status: TERSIMPAN)         |
| PUT    | /api/survey/:id        | All   | TERSIMPAN            | Update survey                             |
| POST   | /api/survey/:id/submit | All   | TERSIMPAN            | Submit survey (→ TERKIRIM)                |
| POST   | /api/survey/:id/verify | Admin | TERKIRIM             | Verify survey (→ TERVERIFIKASI)           |
| DELETE | /api/survey/:id        | All   | TERSIMPAN/TERKIRIM\* | Delete survey (\*admin only for TERKIRIM) |

## Migration Notes

Jika ada data existing di database:

1. Survey dengan status lama akan tetap valid
2. Untuk menggunakan fitur verifikasi, survey harus di-submit ulang
3. Tidak perlu migration script karena status lama masih kompatibel

## Security Notes

- Status TERVERIFIKASI memberikan proteksi penuh terhadap penghapusan dan perubahan
- Hanya admin yang dapat memverifikasi survey
- Survey yang terverifikasi dianggap sebagai data final dan tidak boleh diubah
