"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const hashedPasswordSurveyor = await bcrypt.hash("surveyor123", 10);

    await queryInterface.bulkInsert(
      "t_user",
      [
        {
          username: "admin",
          password: hashedPassword,
          no_hp: "081234567890",
          alamat: "Jakarta Pusat",
          ktp: "3174012345678901",
          keterangan: "Administrator sistem",
          role_user: 1, // Admin
          create_user_date: new Date(),
        },
        {
          username: "surveyor1",
          password: hashedPasswordSurveyor,
          no_hp: "081234567891",
          alamat: "Bandung",
          ktp: "3273012345678902",
          keterangan: "Surveyor lapangan",
          role_user: 2, // Surveyor
          create_user_date: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "t_user",
      {
        username: ["admin", "surveyor1"],
      },
      {}
    );
  },
};
