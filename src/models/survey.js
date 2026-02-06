"use strict";

module.exports = (sequelize, DataTypes) => {
  const Survey = sequelize.define(
    "Survey",
    {
      id_survey: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_survey",
        comment: "Auto Increment",
      },
      id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "id_user",
        references: {
          model: "t_user",
          key: "id_user",
        },
        comment: "1 - M from T_User.id_user",
      },
      tgl_survey: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "tgl_survey",
        comment: "Muncul otomatis saat form isi terbuka",
      },
      foto: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "foto",
        comment: "Simpan direktori file dengan Thumbnail",
      },
      longitude_x: {
        type: DataTypes.DECIMAL(13, 10),
        allowNull: false,
        field: "longitude_x",
        validate: {
          min: -180,
          max: 180,
        },
        comment: "diambil dari posisi GPS di HP / Google Maps",
      },
      latitude_y: {
        type: DataTypes.DECIMAL(13, 10),
        allowNull: false,
        field: "latitude_y",
        validate: {
          min: -90,
          max: 90,
        },
        comment: "diambil dari posisi GPS di HP / Google Maps",
      },
      alamat_google: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "alamat_google",
        comment: "Dimbil dari keterangan posisi Google Maps",
      },
      alamat_keterangan: {
        type: DataTypes.STRING(1000),
        allowNull: false,
        field: "alamat_keterangan",
        validate: {
          notEmpty: true,
        },
        comment: "Diisi wajib oleh surveyor",
      },
      dokumen: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "dokumen",
        comment: "Upload Dokumen pdf/jpg jpeg",
      },
      dokumen_keterangan: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        field: "dokumen_keterangan",
        comment: "Diisi oleh surveyor",
      },
      tgl_simpan_edit: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "tgl_simpan_edit",
        comment: "Jika user memilih simpan (edit - simpan)",
      },
      tgl_submit: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "tgl_submit",
        comment:
          "Jika user memilih Submit (dari simpan dulu atau langsung Submit)",
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "TERSIMPAN",
        field: "status",
        validate: {
          isIn: [["TERSIMPAN", "TERKIRIM"]],
        },
        comment: "Status survey: TERSIMPAN atau TERKIRIM",
      },
    },
    {
      tableName: "t_data_survey",
      timestamps: false,
    }
  );

  // Associations
  Survey.associate = function (models) {
    // Survey belongs to User
    Survey.belongsTo(models.User, {
      foreignKey: "id_user",
      as: "user",
    });
  };

  return Survey;
};
