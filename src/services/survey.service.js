const { Survey, User } = require("../models");
const { Op } = require("sequelize");

class SurveyService {
  // Create new survey
  async createSurvey(userId, surveyData, filePaths) {
    try {
      // Validate required fields
      if (!surveyData.longitude_x || !surveyData.latitude_y) {
        throw new Error(
          "Koordinat GPS (longitude_x dan latitude_y) wajib diisi"
        );
      }

      if (!surveyData.alamat_keterangan) {
        throw new Error("Alamat keterangan wajib diisi");
      }

      // Validate GPS coordinates
      const longitude = parseFloat(surveyData.longitude_x);
      const latitude = parseFloat(surveyData.latitude_y);

      if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        throw new Error("Longitude tidak valid (harus antara -180 sampai 180)");
      }

      if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        throw new Error("Latitude tidak valid (harus antara -90 sampai 90)");
      }

      const survey = await Survey.create({
        id_user: userId,
        tgl_survey: new Date(),
        foto: filePaths.foto || "uploads/default-foto.jpg",
        longitude_x: longitude,
        latitude_y: latitude,
        alamat_google: surveyData.alamat_google || null,
        alamat_keterangan: surveyData.alamat_keterangan,
        dokumen: filePaths.dokumen || null,
        dokumen_keterangan: surveyData.dokumen_keterangan || null,
        tgl_simpan_edit: new Date(),
        tgl_submit: null,
      });

      return await Survey.findByPk(survey.id_survey, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id_user", "username", "no_hp", "alamat", "role_user"],
          },
        ],
      });
    } catch (error) {
      throw error;
    }
  }

  // Get survey list with filters
  async getSurveyList(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        id_user,
        search,
        startDate,
        endDate,
      } = filters;

      const offset = (page - 1) * limit;
      const where = {};

      // Filter by status (submitted or draft)
      if (status === "submitted") {
        where.tgl_submit = { [Op.ne]: null };
      } else if (status === "draft") {
        where.tgl_submit = null;
      }

      // Filter by user
      if (id_user) {
        where.id_user = id_user;
      }

      // Search by alamat_keterangan or dokumen_keterangan
      if (search) {
        where[Op.or] = [
          { alamat_keterangan: { [Op.iLike]: `%${search}%` } },
          { dokumen_keterangan: { [Op.iLike]: `%${search}%` } },
          { alamat_google: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Filter by date range
      if (startDate || endDate) {
        where.tgl_survey = {};
        if (startDate) {
          where.tgl_survey[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          where.tgl_survey[Op.lte] = new Date(endDate);
        }
      }

      const { count, rows } = await Survey.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id_user", "username", "no_hp", "alamat", "role_user"],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["tgl_survey", "DESC"]],
      });

      return {
        surveys: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get survey by ID
  async getSurveyById(surveyId) {
    try {
      const survey = await Survey.findByPk(surveyId, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id_user", "username", "no_hp", "alamat", "role_user"],
          },
        ],
      });

      if (!survey) {
        throw new Error("Survey tidak ditemukan");
      }

      return survey;
    } catch (error) {
      throw error;
    }
  }

  // Update survey (only if not submitted)
  async updateSurvey(surveyId, userId, userRole, surveyData, filePaths) {
    try {
      const survey = await Survey.findByPk(surveyId);

      if (!survey) {
        throw new Error("Survey tidak ditemukan");
      }

      // Check ownership (surveyor can only edit their own surveys)
      if (userRole === 2 && survey.id_user !== userId) {
        throw new Error("Anda tidak memiliki akses untuk mengubah survey ini");
      }

      // Can only edit if not submitted
      if (survey.tgl_submit) {
        throw new Error("Survey yang sudah disubmit tidak dapat diubah");
      }

      // Validate GPS coordinates if provided
      if (surveyData.longitude_x || surveyData.latitude_y) {
        const longitude = parseFloat(
          surveyData.longitude_x || survey.longitude_x
        );
        const latitude = parseFloat(surveyData.latitude_y || survey.latitude_y);

        if (isNaN(longitude) || longitude < -180 || longitude > 180) {
          throw new Error(
            "Longitude tidak valid (harus antara -180 sampai 180)"
          );
        }

        if (isNaN(latitude) || latitude < -90 || latitude > 90) {
          throw new Error("Latitude tidak valid (harus antara -90 sampai 90)");
        }

        surveyData.longitude_x = longitude;
        surveyData.latitude_y = latitude;
      }

      // Update fields
      const updateData = {
        tgl_simpan_edit: new Date(),
      };

      if (surveyData.longitude_x)
        updateData.longitude_x = surveyData.longitude_x;
      if (surveyData.latitude_y) updateData.latitude_y = surveyData.latitude_y;
      if (surveyData.alamat_google)
        updateData.alamat_google = surveyData.alamat_google;
      if (surveyData.alamat_keterangan)
        updateData.alamat_keterangan = surveyData.alamat_keterangan;
      if (surveyData.dokumen_keterangan)
        updateData.dokumen_keterangan = surveyData.dokumen_keterangan;
      if (filePaths.foto) updateData.foto = filePaths.foto;
      if (filePaths.dokumen) updateData.dokumen = filePaths.dokumen;

      await survey.update(updateData);

      return await Survey.findByPk(surveyId, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id_user", "username", "no_hp", "alamat", "role_user"],
          },
        ],
      });
    } catch (error) {
      throw error;
    }
  }

  // Submit survey
  async submitSurvey(surveyId, userId, userRole) {
    try {
      const survey = await Survey.findByPk(surveyId);

      if (!survey) {
        throw new Error("Survey tidak ditemukan");
      }

      // Check ownership
      if (userRole === 2 && survey.id_user !== userId) {
        throw new Error("Anda tidak memiliki akses untuk submit survey ini");
      }

      // Can only submit if not already submitted
      if (survey.tgl_submit) {
        throw new Error("Survey sudah disubmit sebelumnya");
      }

      await survey.update({
        status: "TERKIRIM",
        tgl_submit: new Date(),
      });

      return await Survey.findByPk(surveyId, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id_user", "username", "no_hp", "alamat", "role_user"],
          },
        ],
      });
    } catch (error) {
      throw error;
    }
  }

  // Delete survey (only admin or owner if not submitted)
  async deleteSurvey(surveyId, userId, userRole) {
    try {
      const survey = await Survey.findByPk(surveyId);

      if (!survey) {
        throw new Error("Survey tidak ditemukan");
      }

      // Admin can delete any survey
      if (userRole === 1) {
        await survey.destroy();
        return { message: "Survey berhasil dihapus" };
      }

      // Surveyor can only delete their own survey if not submitted
      if (userRole === 2) {
        if (survey.id_user !== userId) {
          throw new Error(
            "Anda tidak memiliki akses untuk menghapus survey ini"
          );
        }

        if (survey.tgl_submit) {
          throw new Error("Survey yang sudah disubmit tidak dapat dihapus");
        }

        await survey.destroy();
        return { message: "Survey berhasil dihapus" };
      }

      throw new Error("Anda tidak memiliki akses untuk menghapus survey");
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new SurveyService();
