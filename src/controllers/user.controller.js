const userService = require("../services/user.service");
const { successResponse, errorResponse } = require("../utils/response");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const filters = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      role_user: req.query.role_user,
      search: req.query.search,
    };

    const result = await userService.getAllUsers(filters);

    return successResponse(res, "Data user berhasil diambil", result);
  } catch (error) {
    console.error("Error getting users:", error);
    return errorResponse(res, error.message, 400);
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);

    return successResponse(res, "User berhasil diambil", user);
  } catch (error) {
    console.error("Error getting user:", error);
    return errorResponse(res, error.message, 404);
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);

    return successResponse(res, "User berhasil dibuat", user, 201);
  } catch (error) {
    console.error("Error creating user:", error);
    return errorResponse(res, error.message, 400);
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);

    return successResponse(res, "User berhasil diupdate", user);
  } catch (error) {
    console.error("Error updating user:", error);
    return errorResponse(res, error.message, 400);
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const result = await userService.deleteUser(
      parseInt(req.params.id),
      req.user.id_user
    );

    return successResponse(res, result, result.message);
  } catch (error) {
    console.error("Error deleting user:", error);
    return errorResponse(res, error.message, 400);
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const stats = await userService.getUserStats(req.params.id);

    return successResponse(res, stats, "Statistik user berhasil diambil");
  } catch (error) {
    console.error("Error getting user stats:", error);
    return errorResponse(res, error.message, 404);
  }
};
