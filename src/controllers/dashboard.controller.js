const dashboardService = require("../services/dashboard.service");
const { successResponse, errorResponse } = require("../utils/response");

// Get overall statistics
exports.getStats = async (req, res) => {
  try {
    const stats = await dashboardService.getOverallStats();

    return successResponse(res, stats, "Statistik berhasil diambil");
  } catch (error) {
    console.error("Error getting stats:", error);
    return errorResponse(res, error.message, 400);
  }
};

// Get recent surveys
exports.getRecentSurveys = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const surveys = await dashboardService.getRecentSurveys(limit);

    return successResponse(res, { surveys }, "Survey terbaru berhasil diambil");
  } catch (error) {
    console.error("Error getting recent surveys:", error);
    return errorResponse(res, error.message, 400);
  }
};

// Get surveys by date range
exports.getSurveysByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return errorResponse(
        res,
        "Parameter startDate dan endDate wajib diisi",
        400
      );
    }

    const surveys = await dashboardService.getSurveysByDateRange(
      startDate,
      endDate
    );

    return successResponse(res, { surveys }, "Data survey berhasil diambil");
  } catch (error) {
    console.error("Error getting surveys by date range:", error);
    return errorResponse(res, error.message, 400);
  }
};

// Get top surveyors
exports.getTopSurveyors = async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    const surveyors = await dashboardService.getTopSurveyors(limit);

    return successResponse(res, { surveyors }, "Top surveyor berhasil diambil");
  } catch (error) {
    console.error("Error getting top surveyors:", error);
    return errorResponse(res, error.message, 400);
  }
};

// Get survey status distribution
exports.getStatusDistribution = async (req, res) => {
  try {
    const distribution = await dashboardService.getSurveyStatusDistribution();

    return successResponse(
      res,
      { distribution },
      "Distribusi status berhasil diambil"
    );
  } catch (error) {
    console.error("Error getting status distribution:", error);
    return errorResponse(res, error.message, 400);
  }
};

// Get monthly survey trends
exports.getMonthlyTrends = async (req, res) => {
  try {
    const trends = await dashboardService.getMonthlySurveyTrends();

    return successResponse(res, { trends }, "Trend bulanan berhasil diambil");
  } catch (error) {
    console.error("Error getting monthly trends:", error);
    return errorResponse(res, error.message, 400);
  }
};
