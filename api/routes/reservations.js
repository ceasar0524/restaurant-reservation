const crypto = require('crypto');
const router = require('express').Router();
const db = require('../db');
const { validate, createReservationSchema, modifyReservationSchema } = require('../middleware/validate');
const { createError } = require('../middleware/errorHandler');
const ERRORS = require('../constants/errors');
const notification = require('../services/notification');

function nowISO() {
  return new Date().toISOString().replace('T', ' ').split('.')[0];
}

function getCancellationDeadline(reservationDate) {
  const [y, m, d] = reservationDate.split('-').map(Number);
  // 前一天 23:59:59 台灣時間（TZ=Asia/Taipei 已在 .env 設定）
  return new Date(y, m - 1, d - 1, 23, 59, 59);
}

const TIME_SLOTS = [
  '午餐 11:30', '午餐 12:00', '午餐 12:30', '午餐 13:00', '午餐 13:30',
  '晚餐 17:30', '晚餐 18:00', '晚餐 18:30', '晚餐 19:00', '晚餐 19:30',
  '晚餐 20:00', '晚餐 20:30',
];
const MAX_GROUPS = 5;
const MAX_PEOPLE = 15;

// GET /api/reservations/daily-availability?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/daily-availability', (req, res) => {
  const { from, to } = req.query;
  if (!from || !to || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'from 和 to 為必填（YYYY-MM-DD）' } });
  }

  const rows = db.prepare(`
    SELECT date, time_slot, COUNT(*) as groups, COALESCE(SUM(party_size), 0) as people
    FROM reservations
    WHERE date >= ? AND date <= ? AND status NOT IN ('cancelled')
    GROUP BY date, time_slot
  `).all(from, to);

  const usage = {};
  for (const r of rows) {
    if (!usage[r.date]) usage[r.date] = {};
    usage[r.date][r.time_slot] = { groups: r.groups, people: r.people };
  }

  const LUNCH  = TIME_SLOTS.filter(s => s.startsWith('午餐'));
  const DINNER = TIME_SLOTS.filter(s => s.startsWith('晚餐'));

  const dates = [];
  const cur = new Date(from + 'T00:00:00');
  const end = new Date(to + 'T00:00:00');
  while (cur <= end) {
    const d = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`;
    const dayUsage = usage[d] || {};
    let lunch = 0, dinner = 0;
    for (const slot of LUNCH) {
      const u = dayUsage[slot] || { groups: 0, people: 0 };
      if (u.groups < MAX_GROUPS && u.people < MAX_PEOPLE) lunch++;
    }
    for (const slot of DINNER) {
      const u = dayUsage[slot] || { groups: 0, people: 0 };
      if (u.groups < MAX_GROUPS && u.people < MAX_PEOPLE) dinner++;
    }
    dates.push({ date: d, lunch_available: lunch, dinner_available: dinner });
    cur.setDate(cur.getDate() + 1);
  }

  return res.json({ dates });
});

// GET /api/reservations/availability?date=YYYY-MM-DD&exclude_code=LT-XXX
router.get('/availability', (req, res) => {
  const { date, exclude_code } = req.query;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'date 為必填（YYYY-MM-DD）' } });
  }

  const rows = db.prepare(`
    SELECT time_slot, COUNT(*) as groups, SUM(party_size) as people
    FROM reservations
    WHERE date = ?
      AND status NOT IN ('cancelled')
      AND (? IS NULL OR confirmation_code != ?)
    GROUP BY time_slot
  `).all(date, exclude_code ?? null, exclude_code ?? null);

  const usage = Object.fromEntries(rows.map(r => [r.time_slot, r]));

  const slots = TIME_SLOTS.map(slot => {
    const u = usage[slot] || { groups: 0, people: 0 };
    const available = u.groups < MAX_GROUPS && u.people < MAX_PEOPLE;
    return {
      slot,
      available,
      remaining: available ? MAX_PEOPLE - u.people : 0,
    };
  });

  return res.json({ date, slots });
});

// POST /api/reservations — 建立訂位
router.post('/', validate(createReservationSchema), (req, res, next) => {
  const { customer_name, customer_email, customer_phone, date, time_slot, party_size, special_requests } = req.body;

  // 容量檢查
  const usage = db.prepare(`
    SELECT COUNT(*) as groups, COALESCE(SUM(party_size), 0) as people
    FROM reservations
    WHERE date = ? AND time_slot = ? AND status NOT IN ('cancelled')
  `).get(date, time_slot);

  if (usage.groups >= MAX_GROUPS || usage.people + party_size > MAX_PEOPLE) {
    return next(createError(409, ERRORS.SLOT_FULL, '此時段已滿'));
  }

  const id = crypto.randomUUID();
  const confirmation_code = 'LT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  const ts = nowISO();

  try {
    db.prepare(`
      INSERT INTO reservations
        (id, customer_name, customer_phone, customer_email, date, time_slot,
         party_size, special_requests, status, confirmation_code, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
    `).run(id, customer_name, customer_phone, customer_email, date, time_slot,
           party_size, special_requests ?? null, confirmation_code, ts, ts);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return next(createError(409, ERRORS.CONFLICT, '此 email 在該日期時段已有訂位'));
    }
    return next(err);
  }

  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id);

  // 非阻塞：推入通知佇列
  notification.enqueue({ type: 'reservation_created', confirmation_code });

  return res.status(201).json(reservation);
});

// GET /api/reservations/:confirmationCode — 查詢訂位
router.get('/:confirmationCode', (req, res, next) => {
  const reservation = db
    .prepare('SELECT * FROM reservations WHERE confirmation_code = ?')
    .get(req.params.confirmationCode);

  if (!reservation) {
    return next(createError(404, ERRORS.NOT_FOUND, '找不到此確認碼的訂位'));
  }

  return res.json(reservation);
});

// PATCH /api/reservations/:confirmationCode — 修改日期/時段
router.patch('/:confirmationCode', validate(modifyReservationSchema), (req, res, next) => {
  const reservation = db
    .prepare('SELECT * FROM reservations WHERE confirmation_code = ?')
    .get(req.params.confirmationCode);

  if (!reservation) {
    return next(createError(404, ERRORS.NOT_FOUND, '找不到此確認碼的訂位'));
  }

  const date = req.body.date ?? reservation.date;
  const time_slot = req.body.time_slot ?? reservation.time_slot;
  const party_size = req.body.party_size ?? reservation.party_size;
  const ts = nowISO();

  // 容量檢查（排除自己這筆，使用新人數）
  const usage = db.prepare(`
    SELECT COUNT(*) as groups, COALESCE(SUM(party_size), 0) as people
    FROM reservations
    WHERE date = ? AND time_slot = ? AND status NOT IN ('cancelled')
      AND confirmation_code != ?
  `).get(date, time_slot, req.params.confirmationCode);

  if (usage.groups >= MAX_GROUPS || usage.people + party_size > MAX_PEOPLE) {
    return next(createError(409, ERRORS.SLOT_FULL, '此時段已滿'));
  }

  try {
    db.prepare(`
      UPDATE reservations SET date = ?, time_slot = ?, party_size = ?, updated_at = ?, reminder_sent = 0
      WHERE confirmation_code = ?
    `).run(date, time_slot, party_size, ts, req.params.confirmationCode);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return next(createError(409, ERRORS.CONFLICT, '此 email 在該日期時段已有訂位'));
    }
    return next(err);
  }

  const updated = db
    .prepare('SELECT * FROM reservations WHERE confirmation_code = ?')
    .get(req.params.confirmationCode);

  // 直接寫入 notification_jobs，通知服務 worker 會自動處理
  db.prepare(`
    INSERT INTO notification_jobs (reservation_id, type, payload)
    VALUES (?, 'modification', ?)
  `).run(updated.id, JSON.stringify({
    customer_email: updated.customer_email,
    customer_name: updated.customer_name,
    confirmation_code: updated.confirmation_code,
    date: updated.date,
    time_slot: updated.time_slot,
    party_size: updated.party_size,
  }));

  return res.json(updated);
});

// DELETE /api/reservations/:confirmationCode — 取消訂位
router.delete('/:confirmationCode', (req, res, next) => {
  const reservation = db
    .prepare('SELECT * FROM reservations WHERE confirmation_code = ?')
    .get(req.params.confirmationCode);

  if (!reservation) {
    return next(createError(404, ERRORS.NOT_FOUND, '找不到此確認碼的訂位'));
  }

  const deadline = getCancellationDeadline(reservation.date);
  if (new Date() > deadline) {
    return next(createError(422, ERRORS.CANCELLATION_DEADLINE_PASSED, '已超過取消截止時間（訂位日前一天 23:59）'));
  }

  const ts = nowISO();
  db.prepare(`
    UPDATE reservations SET status = 'cancelled', updated_at = ?
    WHERE confirmation_code = ?
  `).run(ts, req.params.confirmationCode);

  const updated = db
    .prepare('SELECT * FROM reservations WHERE confirmation_code = ?')
    .get(req.params.confirmationCode);

  return res.json(updated);
});

module.exports = router;
