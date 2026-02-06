/**
 * Clean file path untuk response API
 * Convert server path menjadi URL path yang accessible
 */
function cleanFilePath(filePath) {
  if (!filePath || filePath === "") {
    return null;
  }

  // Remove absolute path: /Users/.../src/uploads/... -> /uploads/...
  if (filePath.includes("/src/uploads/")) {
    const uploadIndex = filePath.indexOf("/uploads/");
    return filePath.substring(uploadIndex);
  }

  // Remove relative path: src/uploads/... -> /uploads/...
  if (filePath.startsWith("src/uploads/")) {
    return "/" + filePath.substring(4); // Remove 'src/' prefix
  }

  // Already correct format /uploads/...
  if (filePath.startsWith("/uploads/")) {
    return filePath;
  }

  // Default case: uploads/... -> /uploads/...
  if (filePath.startsWith("uploads/")) {
    return "/" + filePath;
  }

  // Fallback: assume it's just filename
  return "/uploads/" + filePath;
}

/**
 * Clean survey object sebelum send response
 */
function cleanSurveyResponse(survey) {
  if (!survey) return null;

  // Handle Sequelize model instance
  const surveyData = survey.toJSON ? survey.toJSON() : survey;

  return {
    ...surveyData,
    foto: cleanFilePath(surveyData.foto),
    dokumen: cleanFilePath(surveyData.dokumen),
  };
}

/**
 * Clean array of surveys
 */
function cleanSurveysResponse(surveys) {
  if (!Array.isArray(surveys)) return [];
  return surveys.map((survey) => cleanSurveyResponse(survey));
}

module.exports = {
  cleanFilePath,
  cleanSurveyResponse,
  cleanSurveysResponse,
};
