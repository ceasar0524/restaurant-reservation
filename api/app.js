require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const reservationsRouter = require('./routes/reservations');
const adminReservationsRouter = require('./routes/admin/reservations');
const authRouter = require('./routes/auth');
const { requireAdmin } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

// 自動執行資料庫 migrations
const migrationsDir = path.join(__dirname, '../database');
if (fs.existsSync(migrationsDir)) {
  db.exec(`CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY)`);
  const applied = new Set(db.prepare('SELECT name FROM _migrations').all().map(r => r.name));
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    if (!applied.has(file)) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      db.exec(sql);
      db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);
      console.log(`Migration applied: ${file}`);
    }
  }
}

// 若無管理員帳號則自動建立預設帳號
const bcrypt = require('bcryptjs');
const adminCount = db.prepare('SELECT COUNT(*) as c FROM admins').get();
if (adminCount.c === 0) {
  const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin1234', 10);
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', hash);
  console.log('預設管理員已建立：admin / ' + (process.env.ADMIN_PASSWORD || 'admin1234'));
}

const app = express();

// CORS：允許同源（Railway）和本機開發
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:8081'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(null, true); // Railway 上 same-origin，直接允許
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// API 路由
app.use('/api/reservations', reservationsRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', requireAdmin);
app.use('/api/admin/reservations', adminReservationsRouter);

// 靜態前端（public/ 資料夾）
app.use(express.static(path.join(__dirname, '../public')));

// SPA fallback：找不到的路徑都回傳 index.html
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 全域錯誤處理（必須最後掛載）
app.use(errorHandler);

module.exports = app;
