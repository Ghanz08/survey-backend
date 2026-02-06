const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middlewares/auth");

/**
 * @route   GET /api/users
 * @desc    Get all users with filters & pagination
 * @access  Private (Admin only)
 */
router.get("/", authenticate, authorize(1), userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user detail by ID
 * @access  Private (Admin only)
 */
router.get("/:id", authenticate, authorize(1), userController.getUserById);

/**
 * @route   GET /api/users/:id/stats
 * @desc    Get user statistics (surveys count)
 * @access  Private (Admin only)
 */
router.get(
  "/:id/stats",
  authenticate,
  authorize(1),
  userController.getUserStats
);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Private (Admin only)
 */
router.post("/", authenticate, authorize(1), userController.createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin only)
 */
router.put("/:id", authenticate, authorize(1), userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete("/:id", authenticate, authorize(1), userController.deleteUser);

module.exports = router;
