const { User, Survey } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

class UserService {
  // Get all users with filters
  async getAllUsers(filters = {}) {
    try {
      const { page = 1, limit = 10, role_user, search } = filters;

      const offset = (page - 1) * limit;
      const where = {};

      // Filter by role
      if (role_user) {
        where.role_user = parseInt(role_user);
      }

      // Search by username, no_hp, or alamat
      if (search) {
        where[Op.or] = [
          { username: { [Op.iLike]: `%${search}%` } },
          { no_hp: { [Op.iLike]: `%${search}%` } },
          { alamat: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        attributes: [
          "id_user",
          "username",
          "no_hp",
          "alamat",
          "ktp",
          "keterangan",
          "role_user",
          "create_user_date",
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["create_user_date", "DESC"]],
      });

      return {
        users: rows,
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

  // Get user by ID
  async getUserById(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: [
          "id_user",
          "username",
          "no_hp",
          "alamat",
          "ktp",
          "keterangan",
          "role_user",
          "create_user_date",
        ],
        include: [
          {
            model: Survey,
            as: "surveys",
            attributes: ["id_survey", "tgl_survey", "status"],
            limit: 5,
            order: [["tgl_survey", "DESC"]],
          },
        ],
      });

      if (!user) {
        throw new Error("User tidak ditemukan");
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  // Create new user
  async createUser(userData) {
    try {
      // Validate required fields
      if (
        !userData.username ||
        !userData.password ||
        !userData.no_hp ||
        !userData.ktp ||
        !userData.role_user
      ) {
        throw new Error(
          "Username, password, no_hp, ktp, dan role_user wajib diisi"
        );
      }

      // Check if username already exists
      const existingUser = await User.findOne({
        where: { username: userData.username },
      });
      if (existingUser) {
        throw new Error("Username sudah digunakan");
      }

      // Validate role
      if (![1, 2].includes(parseInt(userData.role_user))) {
        throw new Error("Role harus 1 (Admin) atau 2 (Surveyor)");
      }

      // Create user
      const user = await User.create({
        username: userData.username,
        password: userData.password, // Will be hashed by model hook
        no_hp: userData.no_hp,
        alamat: userData.alamat || null,
        ktp: userData.ktp,
        keterangan: userData.keterangan || null,
        role_user: parseInt(userData.role_user),
        create_user_date: new Date(),
      });

      // Return user without password
      const userResponse = await User.findByPk(user.id_user, {
        attributes: [
          "id_user",
          "username",
          "no_hp",
          "alamat",
          "ktp",
          "keterangan",
          "role_user",
          "create_user_date",
        ],
      });

      return userResponse;
    } catch (error) {
      throw error;
    }
  }

  // Update user
  async updateUser(userId, userData) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error("User tidak ditemukan");
      }

      // Check if username is being changed and if it's already taken
      if (userData.username && userData.username !== user.username) {
        const existingUser = await User.findOne({
          where: { username: userData.username },
        });
        if (existingUser) {
          throw new Error("Username sudah digunakan");
        }
      }

      // Validate role if provided
      if (
        userData.role_user &&
        ![1, 2].includes(parseInt(userData.role_user))
      ) {
        throw new Error("Role harus 1 (Admin) atau 2 (Surveyor)");
      }

      // Update fields
      const updateData = {};
      if (userData.username) updateData.username = userData.username;
      if (userData.password) updateData.password = userData.password; // Will be hashed by model hook
      if (userData.no_hp) updateData.no_hp = userData.no_hp;
      if (userData.alamat !== undefined) updateData.alamat = userData.alamat;
      if (userData.ktp) updateData.ktp = userData.ktp;
      if (userData.keterangan !== undefined)
        updateData.keterangan = userData.keterangan;
      if (userData.role_user)
        updateData.role_user = parseInt(userData.role_user);

      await user.update(updateData);

      // Return updated user without password
      const updatedUser = await User.findByPk(userId, {
        attributes: [
          "id_user",
          "username",
          "no_hp",
          "alamat",
          "ktp",
          "keterangan",
          "role_user",
          "create_user_date",
        ],
      });

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  // Delete user
  async deleteUser(userId, currentUserId) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error("User tidak ditemukan");
      }

      // Prevent deleting own account
      if (userId === currentUserId) {
        throw new Error("Tidak dapat menghapus akun sendiri");
      }

      // Check if user has surveys
      const surveyCount = await Survey.count({ where: { id_user: userId } });

      if (surveyCount > 0) {
        throw new Error(
          `User ini memiliki ${surveyCount} survey. Hapus survey terlebih dahulu atau transfer ke user lain`
        );
      }

      await user.destroy();

      return { message: "User berhasil dihapus" };
    } catch (error) {
      throw error;
    }
  }

  // Get user statistics
  async getUserStats(userId) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error("User tidak ditemukan");
      }

      const totalSurveys = await Survey.count({ where: { id_user: userId } });
      const submittedSurveys = await Survey.count({
        where: {
          id_user: userId,
          tgl_submit: { [Op.ne]: null },
        },
      });
      const draftSurveys = await Survey.count({
        where: {
          id_user: userId,
          tgl_submit: null,
        },
      });

      return {
        user: {
          id_user: user.id_user,
          username: user.username,
          role_user: user.role_user,
        },
        stats: {
          total_surveys: totalSurveys,
          submitted_surveys: submittedSurveys,
          draft_surveys: draftSurveys,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();
