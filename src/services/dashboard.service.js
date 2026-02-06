const { User, Survey, sequelize } = require("../models");
const { Op } = require("sequelize");

class DashboardService {
  // Get overall statistics
  async getOverallStats() {
    try {
      // Total users by role
      const totalAdmin = await User.count({ where: { role_user: 1 } });
      const totalSurveyor = await User.count({ where: { role_user: 2 } });
      const totalUsers = totalAdmin + totalSurveyor;

      // Total surveys by status
      const totalSurveys = await Survey.count();
      const submittedSurveys = await Survey.count({
        where: { tgl_submit: { [Op.ne]: null } },
      });
      const draftSurveys = await Survey.count({
        where: { tgl_submit: null },
      });

      // Today's surveys
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaySurveys = await Survey.count({
        where: {
          tgl_survey: { [Op.gte]: today },
        },
      });

      // This week's surveys
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekSurveys = await Survey.count({
        where: {
          tgl_survey: { [Op.gte]: weekAgo },
        },
      });

      // This month's surveys
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const monthSurveys = await Survey.count({
        where: {
          tgl_survey: { [Op.gte]: monthStart },
        },
      });

      return {
        users: {
          total: totalUsers,
          admin: totalAdmin,
          surveyor: totalSurveyor,
        },
        surveys: {
          total: totalSurveys,
          submitted: submittedSurveys,
          draft: draftSurveys,
          today: todaySurveys,
          this_week: weekSurveys,
          this_month: monthSurveys,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get recent surveys
  async getRecentSurveys(limit = 10) {
    try {
      const surveys = await Survey.findAll({
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id_user", "username", "role_user"],
          },
        ],
        order: [["tgl_survey", "DESC"]],
        limit: parseInt(limit),
      });

      return surveys;
    } catch (error) {
      throw error;
    }
  }

  // Get surveys by date range (for charts)
  async getSurveysByDateRange(startDate, endDate) {
    try {
      const surveys = await Survey.findAll({
        where: {
          tgl_survey: {
            [Op.between]: [new Date(startDate), new Date(endDate)],
          },
        },
        attributes: [
          [sequelize.fn("DATE", sequelize.col("tgl_survey")), "date"],
          [sequelize.fn("COUNT", sequelize.col("id_survey")), "count"],
        ],
        group: [sequelize.fn("DATE", sequelize.col("tgl_survey"))],
        order: [[sequelize.fn("DATE", sequelize.col("tgl_survey")), "ASC"]],
        raw: true,
      });

      return surveys;
    } catch (error) {
      throw error;
    }
  }

  // Get top surveyors (by survey count)
  async getTopSurveyors(limit = 5) {
    try {
      const surveyors = await User.findAll({
        where: { role_user: 2 },
        attributes: [
          "id_user",
          "username",
          "no_hp",
          [
            sequelize.fn("COUNT", sequelize.col("surveys.id_survey")),
            "survey_count",
          ],
        ],
        include: [
          {
            model: Survey,
            as: "surveys",
            attributes: [],
          },
        ],
        group: ["User.id_user"],
        order: [
          [sequelize.fn("COUNT", sequelize.col("surveys.id_survey")), "DESC"],
        ],
        limit: parseInt(limit),
        subQuery: false,
      });

      return surveyors;
    } catch (error) {
      throw error;
    }
  }

  // Get surveys by status distribution
  async getSurveyStatusDistribution() {
    try {
      const submitted = await Survey.count({
        where: { tgl_submit: { [Op.ne]: null } },
      });
      const draft = await Survey.count({
        where: { tgl_submit: null },
      });

      return [
        { status: "submitted", count: submitted },
        { status: "draft", count: draft },
      ];
    } catch (error) {
      throw error;
    }
  }

  // Get monthly survey trends (last 6 months)
  async getMonthlySurveyTrends() {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const surveys = await Survey.findAll({
        where: {
          tgl_survey: { [Op.gte]: sixMonthsAgo },
        },
        attributes: [
          [
            sequelize.fn("DATE_TRUNC", "month", sequelize.col("tgl_survey")),
            "month",
          ],
          [sequelize.fn("COUNT", sequelize.col("id_survey")), "count"],
        ],
        group: [
          sequelize.fn("DATE_TRUNC", "month", sequelize.col("tgl_survey")),
        ],
        order: [
          [
            sequelize.fn("DATE_TRUNC", "month", sequelize.col("tgl_survey")),
            "ASC",
          ],
        ],
        raw: true,
      });

      return surveys;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new DashboardService();
