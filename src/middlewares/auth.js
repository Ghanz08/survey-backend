const jwt = require("jsonwebtoken");
const config = require("../config");
const { errorResponse } = require("../utils/response");
const { User } = require("../models");

/**
 * Middleware untuk verify JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(
        res,
        "Token tidak ditemukan. Silakan login terlebih dahulu.",
        [],
        401
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Get user from database
    const user = await User.findByPk(decoded.id_user);

    if (!user) {
      return errorResponse(
        res,
        "User tidak ditemukan. Token tidak valid.",
        [],
        401
      );
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return errorResponse(res, "Token tidak valid.", [], 401);
    }
    if (error.name === "TokenExpiredError") {
      return errorResponse(
        res,
        "Token telah kadaluarsa. Silakan login kembali.",
        [],
        401
      );
    }
    return errorResponse(res, "Authentication gagal.", [], 401);
  }
};

/**
 * Middleware untuk check role user
 * @param  {...number} allowedRoles - Array of allowed role_user (1 = Admin, 2 = Surveyor)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(
        res,
        "Unauthorized. User tidak terautentikasi.",
        [],
        401
      );
    }

    if (!allowedRoles.includes(req.user.role_user)) {
      return errorResponse(
        res,
        "Forbidden. Anda tidak memiliki akses ke resource ini.",
        [],
        403
      );
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
