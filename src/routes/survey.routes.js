const express = require("express");
const router = express.Router();
const surveyController = require("../controllers/survey.controller");
const { authenticate } = require("../middlewares/auth");
const {
  uploadFiles,
  compressFoto,
  handleUploadError,
} = require("../middlewares/upload");

/**
 * @route   POST /api/survey
 * @desc    Create new survey
 * @access  Private (Surveyor & Admin)
 */
router.post(
  "/",
  authenticate,
  uploadFiles,
  handleUploadError,
  compressFoto,
  surveyController.createSurvey
);

/**
 * @route   GET /api/survey
 * @desc    Get survey list with filters & pagination
 * @access  Private (Surveyor & Admin)
 */
router.get("/", authenticate, surveyController.getSurveyList);

/**
 * @route   GET /api/survey/:id
 * @desc    Get survey detail by ID
 * @access  Private (Surveyor & Admin)
 */
router.get("/:id", authenticate, surveyController.getSurveyById);

/**
 * @route   PUT /api/survey/:id
 * @desc    Update survey (only if status = TERSIMPAN)
 * @access  Private (Surveyor & Admin)
 */
router.put(
  "/:id",
  authenticate,
  uploadFiles,
  handleUploadError,
  compressFoto,
  surveyController.updateSurvey
);

/**
 * @route   POST /api/survey/:id/submit
 * @desc    Submit survey (change status to TERKIRIM)
 * @access  Private (Surveyor & Admin)
 */
router.post("/:id/submit", authenticate, surveyController.submitSurvey);

/**
 * @route   DELETE /api/survey/:id
 * @desc    Delete survey (only if status = TERSIMPAN)
 * @access  Private (Surveyor & Admin)
 */
router.delete("/:id", authenticate, surveyController.deleteSurvey);

module.exports = router;
