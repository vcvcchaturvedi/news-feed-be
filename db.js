const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();
const pool = new Pool({
  user: "postgres",
  database: "feeds",
  password: process.env.DB_PASSWORD,
  port: 5432,
  host: process.env.DB_HOST,
});
module.exports = { pool };
