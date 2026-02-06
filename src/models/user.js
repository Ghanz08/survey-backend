"use strict";

const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_user",
      },
      username: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
        field: "username",
        validate: {
          notEmpty: true,
          notContains: {
            args: " ",
            msg: "Username tidak boleh mengandung spasi",
          },
        },
        comment: "tanpa spasi",
      },
      password: {
        type: DataTypes.STRING(64),
        allowNull: false,
        field: "password",
        validate: {
          notEmpty: true,
        },
      },
      no_hp: {
        type: DataTypes.STRING(64),
        allowNull: false,
        field: "no_hp",
      },
      alamat: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        field: "alamat",
      },
      ktp: {
        type: DataTypes.STRING(16),
        allowNull: false,
        field: "ktp",
        validate: {
          isNumeric: true,
          len: [16, 16],
        },
      },
      keterangan: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        field: "keterangan",
      },
      role_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2,
        field: "role_user",
        validate: {
          isIn: [[1, 2]], // 1 = Admin, 2 = Surveyor
        },
        comment: "1.Admin 2. Surveyor",
      },
      create_user_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "create_user_date",
      },
    },
    {
      tableName: "t_user",
      timestamps: false,
      hooks: {
        // Hash password sebelum create
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        // Hash password sebelum update (jika password berubah)
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );

  // Instance method untuk validasi password
  User.prototype.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  // Instance method untuk hide password dan KTP dari response
  User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    delete values.ktp; // Hide KTP untuk keamanan
    return values;
  };

  // Associations
  User.associate = function (models) {
    // User has many surveys
    User.hasMany(models.Survey, {
      foreignKey: "id_user",
      as: "surveys",
    });
  };

  return User;
};
