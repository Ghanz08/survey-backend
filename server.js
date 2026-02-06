require("dotenv-safe").config();
const app = require("./app");
const { sequelize } = require("./src/models");

const PORT = process.env.PORT || 3000;

// Test database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connection established successfully");

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => {
    console.error("❌ Unable to connect to database:", err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  await sequelize.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing HTTP server");
  await sequelize.close();
  process.exit(0);
});
