const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

/**
 * Helmet - Set security HTTP headers
 */
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
});

/**
 * Rate Limiter untuk Login endpoint
 * Max 5 attempts per 15 minutes
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: {
    success: false,
    message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
    errors: [],
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiter untuk API endpoints umum
 * Max 100 requests per 15 minutes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: {
    success: false,
    message: "Terlalu banyak request. Coba lagi nanti.",
    errors: [],
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limit for successful responses (optional)
  skip: (req, res) => res.statusCode < 400,
});

/**
 * Data Sanitization against NoSQL Injection
 */
const sanitizeData = mongoSanitize({
  replaceWith: "_",
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized field ${key} in request`);
  },
});

/**
 * Data Sanitization against XSS
 */
const preventXSS = xss();

/**
 * Prevent HTTP Parameter Pollution
 */
const preventPollution = hpp({
  whitelist: ["status", "sortBy", "sortOrder"], // Allow duplicate params for these fields
});

module.exports = {
  helmetMiddleware,
  loginLimiter,
  apiLimiter,
  sanitizeData,
  preventXSS,
  preventPollution,
};
