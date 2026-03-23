require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.resolve(__dirname, '../database/restaurant.db');

const db = new Database(dbPath, { timeout: 10000 });
db.pragma('journal_mode = WAL');

module.exports = db;
