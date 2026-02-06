const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const { authenticate, authorize } = require("../middlewares/auth");

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get overall statistics
 * @access  Private (Admin only)
 */
router.get("/stats", authenticate, authorize(1), dashboardController.getStats);

/**
 * @route   GET /api/dashboard/recent-surveys
 * @desc    Get recent surveys
 * @access  Private (Admin only)
 */
router.get(
  "/recent-surveys",
  authenticate,
  authorize(1),
  dashboardController.getRecentSurveys
);

/**
 * @route   GET /api/dashboard/surveys-by-date
 * @desc    Get surveys by date range (for charts)
 * @access  Private (Admin only)
 */
router.get(
  "/surveys-by-date",
  authenticate,
  authorize(1),
  dashboardController.getSurveysByDateRange
);

/**
 * @route   GET /api/dashboard/top-surveyors
 * @desc    Get top surveyors by survey count
 * @access  Private (Admin only)
 */
router.get(
  "/top-surveyors",
  authenticate,
  authorize(1),
  dashboardController.getTopSurveyors
);

/**
 * @route   GET /api/dashboard/status-distribution
 * @desc    Get survey status distribution
 * @access  Private (Admin only)
 */
router.get(
  "/status-distribution",
  authenticate,
  authorize(1),
  dashboardController.getStatusDistribution
);

/**
 * @route   GET /api/dashboard/monthly-trends
 * @desc    Get monthly survey trends (last 6 months)
 * @access  Private (Admin only)
 */
router.get(
  "/monthly-trends",
  authenticate,
  authorize(1),
  dashboardController.getMonthlyTrends
);

module.exports = router;
