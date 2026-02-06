require("express-async-errors");
const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger");
const {
  helmetMiddleware,
  apiLimiter,
  sanitizeData,
  preventXSS,
  preventPollution,
} = require("./src/middlewares/security");

const app = express();

// Security Middlewares
app.use(helmetMiddleware); // Set security headers
app.use(cors()); // Enable CORS

// Rate limiting untuk semua routes
app.use("/api/", apiLimiter);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Data sanitization
app.use(sanitizeData); // Against NoSQL injection
app.use(preventXSS); // Against XSS attacks
app.use(preventPollution); // Against HPP

// Static files untuk uploads
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Survey Lokasi API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    documentation: "/api-docs",
  });
});

// API Documentation (Swagger)
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Survey Lokasi API Documentation",
  })
);

// Routes
app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/survey", require("./src/routes/survey.routes"));
app.use("/api/users", require("./src/routes/user.routes"));
app.use("/api/dashboard", require("./src/routes/dashboard.routes"));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
    errors: [],
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error("Error:", error);

  // Sequelize validation errors
  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validasi gagal",
      errors: error.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Sequelize unique constraint error
  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({
      success: false,
      message: "Data sudah ada",
      errors: error.errors.map((e) => ({
        field: e.path,
        message: `${e.path} sudah digunakan`,
      })),
    });
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || "Terjadi kesalahan pada server";

  res.status(statusCode).json({
    success: false,
    message,
    errors: [],
  });
});

module.exports = app;
