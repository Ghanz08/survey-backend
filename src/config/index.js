require("dotenv-safe").config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 2097152, // 2MB
    allowedImageTypes: ["image/jpeg", "image/jpg"],
    allowedDocTypes: ["application/pdf", "image/jpeg", "image/jpg"],
  },
};
