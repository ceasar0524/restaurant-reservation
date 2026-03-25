const db = require('../index');

function enqueue(reservationId, type, payload) {
  return db.prepare(`
    INSERT INTO notification_jobs (reservation_id, type, payload)
    VALUES (?, ?, ?)
  `).run(reservationId, type, JSON.stringify(payload));
}

module.exports = { enqueue };
