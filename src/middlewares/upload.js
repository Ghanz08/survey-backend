const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const config = require("../config");

// Create uploads directories if not exist
const uploadsDir = path.join(__dirname, "../uploads");
const fotoDir = path.join(uploadsDir, "foto");
const dokumenDir = path.join(uploadsDir, "dokumen");

[fotoDir, dokumenDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "foto") {
      cb(null, fotoDir);
    } else if (file.fieldname === "dokumen") {
      cb(null, dokumenDir);
    } else {
      cb(new Error("Invalid fieldname"), null);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "foto") {
    // Hanya accept jpg/jpeg untuk foto
    if (!config.upload.allowedImageTypes.includes(file.mimetype)) {
      return cb(new Error("Foto harus berformat JPG atau JPEG"), false);
    }
  } else if (file.fieldname === "dokumen") {
    // Accept pdf dan jpg/jpeg untuk dokumen
    if (!config.upload.allowedDocTypes.includes(file.mimetype)) {
      return cb(
        new Error("Dokumen harus berformat PDF, JPG, atau JPEG"),
        false
      );
    }
  }

  cb(null, true);
};

// Multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize, // 2MB
  },
});

/**
 * Middleware untuk upload foto dan dokumen
 */
const uploadFiles = upload.fields([
  { name: "foto", maxCount: 1 },
  { name: "dokumen", maxCount: 1 },
]);

/**
 * Middleware untuk compress foto menggunakan Sharp
 */
const compressFoto = async (req, res, next) => {
  try {
    if (!req.files || !req.files.foto) {
      return next();
    }

    const fotoFile = req.files.foto[0];
    const originalPath = fotoFile.path;
    const compressedFilename = `compressed-${fotoFile.filename}`;
    const compressedPath = path.join(fotoDir, compressedFilename);

    // Compress foto dengan Sharp
    await sharp(originalPath)
      .jpeg({ quality: 80, progressive: true })
      .resize(1920, 1920, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toFile(compressedPath);

    // Delete original file
    fs.unlinkSync(originalPath);

    // Update file path in request
    req.files.foto[0].path = `src/uploads/foto/${compressedFilename}`;
    req.files.foto[0].filename = compressedFilename;

    next();
  } catch (error) {
    console.error("Compress foto error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal memproses foto",
      errors: [],
    });
  }
};

/**
 * Error handler untuk multer
 */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Ukuran file terlalu besar. Maksimal 2MB",
        errors: [{ field: err.field, message: "File size exceeds 2MB" }],
      });
    }
    return res.status(400).json({
      success: false,
      message: "Error saat upload file",
      errors: [{ field: err.field, message: err.message }],
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
      errors: [],
    });
  }

  next();
};

module.exports = {
  uploadFiles,
  compressFoto,
  handleUploadError,
};
