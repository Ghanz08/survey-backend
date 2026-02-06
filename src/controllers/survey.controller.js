const surveyService = require("../services/survey.service");
const { successResponse, errorResponse } = require("../utils/response");
const {
  cleanSurveyResponse,
  cleanSurveysResponse,
} = require("../utils/fileHelper");

// Create new survey
exports.createSurvey = async (req, res) => {
  try {
    const filePaths = {
      foto: req.files?.foto?.[0]?.path || null,
      dokumen: req.files?.dokumen?.[0]?.path || null,
    };

    const survey = await surveyService.createSurvey(
      req.user.id_user,
      req.body,
      filePaths,
    );

    // Clean file paths before response
    const cleanedSurvey = cleanSurveyResponse(survey);

    return successResponse(res, cleanedSurvey, "Survey berhasil dibuat", 201);
  } catch (error) {
    console.error("Error creating survey:", error);
    return errorResponse(res, error.message, 400);
  }
};

// Get all surveys with filters
exports.getSurveyList = async (req, res) => {
  try {
    const filters = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      status: req.query.status,
      id_user: req.query.id_user,
      search: req.query.search,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    // If surveyor, only show their own surveys
    if (req.user.role_user === 2) {
      filters.id_user = req.user.id_user;
    }

    const result = await surveyService.getSurveyList(filters);

    // Clean file paths in survey list
    const cleanedResult = {
      surveys: cleanSurveysResponse(result.surveys),
      pagination: result.pagination,
    };

    return successResponse(res, cleanedResult, "Survey berhasil diambil");
  } catch (error) {
    console.error("Error getting surveys:", error);
    return errorResponse(res, error.message, 400);
  }
};

// Get survey by ID
exports.getSurveyById = async (req, res) => {
  try {
    const survey = await surveyService.getSurveyById(req.params.id);

    // If surveyor, can only view their own survey
    if (req.user.role_user === 2 && survey.id_user !== req.user.id_user) {
      return errorResponse(res, "Anda tidak memiliki akses ke survey ini", 403);
    }

    // Clean file paths before response
    const cleanedSurvey = cleanSurveyResponse(survey);

    return successResponse(res, cleanedSurvey, "Survey berhasil diambil");
  } catch (error) {
    console.error("Error getting survey:", error);
    return errorResponse(res, error.message, 404);
  }
};

// Update survey
exports.updateSurvey = async (req, res) => {
  try {
    const filePaths = {
      foto: req.files?.foto?.[0]?.path || null,
      dokumen: req.files?.dokumen?.[0]?.path || null,
    };

    const survey = await surveyService.updateSurvey(
      req.params.id,
      req.user.id_user,
      req.user.role_user,
      req.body,
      filePaths,
    );

    // Clean file paths before response
    const cleanedSurvey = cleanSurveyResponse(survey);

    return successResponse(res, cleanedSurvey, "Survey berhasil diupdate");
  } catch (error) {
    console.error("Error updating survey:", error);
    return errorResponse(res, error.message, 400);
  }
};

// Submit survey
exports.submitSurvey = async (req, res) => {
  try {
    const survey = await surveyService.submitSurvey(
      req.params.id,
      req.user.id_user,
      req.user.role_user,
    );

    // Clean file paths before response
    const cleanedSurvey = cleanSurveyResponse(survey);

    return successResponse(res, cleanedSurvey, "Survey berhasil disubmit");
  } catch (error) {
    console.error("Error submitting survey:", error);
    return errorResponse(res, error.message, 400);
  }
};

// Delete survey
exports.deleteSurvey = async (req, res) => {
  try {
    const result = await surveyService.deleteSurvey(
      req.params.id,
      req.user.id_user,
      req.user.role_user,
    );

    return successResponse(res, result, result.message);
  } catch (error) {
    console.error("Error deleting survey:", error);
    return errorResponse(res, error.message, 400);
  }
};
