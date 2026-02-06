/**
 * Success Response Helper
 * @param {Object} res - Express response object
 * @param {String} message - Success message
 * @param {Object} data - Response data
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (
  res,
  message = "Success",
  data = null,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Error Response Helper
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Array} errors - Array of error details
 * @param {Number} statusCode - HTTP status code (default: 400)
 */
const errorResponse = (
  res,
  message = "Error occurred",
  errors = [],
  statusCode = 400
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
