const db = require('../index');

function getUsageByDateRange(from, to) {
  return db.prepare(`
    SELECT date, time_slot, COUNT(*) as groups, COALESCE(SUM(party_size), 0) as people
    FROM reservations
    WHERE date >= ? AND date <= ? AND status NOT IN ('cancelled')
    GROUP BY date, time_slot
  `).all(from, to);
}

function getSlotUsage(date, excludeCode) {
  return db.prepare(`
    SELECT time_slot, COUNT(*) as groups, SUM(party_size) as people
    FROM reservations
    WHERE date = ?
      AND status NOT IN ('cancelled')
      AND (? IS NULL OR confirmation_code != ?)
    GROUP BY time_slot
  `).all(date, excludeCode ?? null, excludeCode ?? null);
}

function checkCapacity(date, timeSlot) {
  return db.prepare(`
    SELECT COUNT(*) as groups, COALESCE(SUM(party_size), 0) as people
    FROM reservations
    WHERE date = ? AND time_slot = ? AND status NOT IN ('cancelled')
  `).get(date, timeSlot);
}

function checkCapacityExcluding(date, timeSlot, confirmationCode) {
  return db.prepare(`
    SELECT COUNT(*) as groups, COALESCE(SUM(party_size), 0) as people
    FROM reservations
    WHERE date = ? AND time_slot = ? AND status NOT IN ('cancelled')
      AND confirmation_code != ?
  `).get(date, timeSlot, confirmationCode);
}

function create({ id, customerName, customerPhone, customerEmail, date, timeSlot, partySize, specialRequests, confirmationCode, ts }) {
  return db.prepare(`
    INSERT INTO reservations
      (id, customer_name, customer_phone, customer_email, date, time_slot,
       party_size, special_requests, status, confirmation_code, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
  `).run(id, customerName, customerPhone, customerEmail, date, timeSlot,
         partySize, specialRequests ?? null, confirmationCode, ts, ts);
}

function findById(id) {
  return db.prepare('SELECT * FROM reservations WHERE id = ?').get(id);
}

function findByConfirmationCode(code) {
  return db.prepare('SELECT * FROM reservations WHERE confirmation_code = ?').get(code);
}

function update(confirmationCode, { date, timeSlot, partySize, ts }) {
  return db.prepare(`
    UPDATE reservations SET date = ?, time_slot = ?, party_size = ?, updated_at = ?, reminder_sent = 0
    WHERE confirmation_code = ?
  `).run(date, timeSlot, partySize, ts, confirmationCode);
}

function cancel(confirmationCode, ts) {
  return db.prepare(`
    UPDATE reservations SET status = 'cancelled', updated_at = ?
    WHERE confirmation_code = ?
  `).run(ts, confirmationCode);
}

function findAll({ date, status } = {}, { limitNum, offset } = {}) {
  const conditions = [];
  const params = [];
  if (date) { conditions.push('date = ?'); params.push(date); }
  if (status) { conditions.push('status = ?'); params.push(status); }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  return db.prepare(`SELECT * FROM reservations ${where} ORDER BY date, time_slot LIMIT ? OFFSET ?`)
    .all(...params, limitNum, offset);
}

function countAll({ date, status } = {}) {
  const conditions = [];
  const params = [];
  if (date) { conditions.push('date = ?'); params.push(date); }
  if (status) { conditions.push('status = ?'); params.push(status); }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  return db.prepare(`SELECT COUNT(*) as count FROM reservations ${where}`).get(...params).count;
}

function updateById(id, { status, admin_notes }, ts) {
  const setClauses = [];
  const params = [];
  if (status !== undefined) { setClauses.push('status = ?'); params.push(status); }
  if (admin_notes !== undefined) { setClauses.push('admin_notes = ?'); params.push(admin_notes === '' ? null : admin_notes); }
  setClauses.push('updated_at = ?');
  params.push(ts);
  params.push(id);
  return db.prepare(`UPDATE reservations SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);
}

module.exports = {
  getUsageByDateRange,
  getSlotUsage,
  checkCapacity,
  checkCapacityExcluding,
  create,
  findById,
  findByConfirmationCode,
  update,
  cancel,
  findAll,
  countAll,
  updateById,
};
