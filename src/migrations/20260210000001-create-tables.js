"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create t_user table
    await queryInterface.createTable("t_user", {
      id_user: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      no_hp: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      alamat: {
        type: Sequelize.STRING(1000),
        allowNull: false,
      },
      ktp: {
        type: Sequelize.STRING(16),
        allowNull: true,
        unique: true,
      },
      keterangan: {
        type: Sequelize.STRING(1000),
        allowNull: true,
      },
      role_user: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2,
        comment: "1=Admin, 2=Surveyor",
      },
      create_user_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create t_data_survey table
    await queryInterface.createTable("t_data_survey", {
      id_survey: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_user: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "t_user",
          key: "id_user",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      tgl_survey: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      foto: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      longitude_x: {
        type: Sequelize.DECIMAL(13, 10),
        allowNull: false,
      },
      latitude_y: {
        type: Sequelize.DECIMAL(13, 10),
        allowNull: false,
      },
      alamat_google: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      alamat_keterangan: {
        type: Sequelize.STRING(1000),
        allowNull: false,
      },
      dokumen: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      dokumen_keterangan: {
        type: Sequelize.STRING(1000),
        allowNull: true,
      },
      tgl_simpan_edit: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      tgl_submit: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "TERSIMPAN",
      },
    });

    // Add indexes
    await queryInterface.addIndex("t_data_survey", ["id_user"]);
    await queryInterface.addIndex("t_data_survey", ["status"]);
    await queryInterface.addIndex("t_data_survey", ["tgl_survey"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("t_data_survey");
    await queryInterface.dropTable("t_user");
  },
};
