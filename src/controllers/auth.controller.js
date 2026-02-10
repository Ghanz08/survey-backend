const jwt = require("jsonwebtoken");
const config = require("../config");
const { User } = require("../models");
const { successResponse, errorResponse } = require("../utils/response");

/**
 * Login Controller
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
      return errorResponse(
        res,
        "Username dan password harus diisi.",
        [
          { field: "username", message: "Username is required" },
          { field: "password", message: "Password is required" },
        ],
        400
      );
    }

    // Cari user berdasarkan username
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return errorResponse(res, "Username atau password salah.", [], 401);
    }

    // Validasi password
    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      return errorResponse(res, "Username atau password salah.", [], 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id_user: user.id_user,
        username: user.username,
        role_user: user.role_user,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Response
    return successResponse(
      res,
      "Login berhasil",
      {
        token,
        user: {
          id_user: user.id_user,
          username: user.username,
          no_hp: user.no_hp,
          alamat: user.alamat,
          ktp: user.ktp,
          role_user: user.role_user,
          role_name: user.role_user === 1 ? "Admin" : "Surveyor",
        },
      },
      200
    );
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(res, "Terjadi kesalahan saat login.", [], 500);
  }
};

/**
 * Get Current User Profile
 * GET /api/auth/me
 */
const getProfile = async (req, res) => {
  try {
    const user = req.user;

    return successResponse(
      res,
      "Berhasil mengambil data profile",
      {
        id_user: user.id_user,
        username: user.username,
        no_hp: user.no_hp,
        alamat: user.alamat,
        ktp: user.ktp,
        keterangan: user.keterangan,
        role_user: user.role_user,
        role_name: user.role_user === 1 ? "Admin" : "Surveyor",
        create_user_date: user.create_user_date,
      },
      200
    );
  } catch (error) {
    console.error("Get profile error:", error);
    return errorResponse(
      res,
      "Terjadi kesalahan saat mengambil profile.",
      [],
      500
    );
  }
};

module.exports = {
  login,
  getProfile,
};
