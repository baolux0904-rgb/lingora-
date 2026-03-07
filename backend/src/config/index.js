require("dotenv").config();

const env = process.env.NODE_ENV || "development";

module.exports = {
  env,
  db: {
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/lingora_dev",
  },
};