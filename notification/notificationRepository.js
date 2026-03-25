const db = require('./db');

function enqueue(reservationId, type, payload) {
  return db.prepare(`
    INSERT INTO notification_jobs (reservation_id, type, payload)
    VALUES (?, ?, ?)
  `).run(reservationId, type, JSON.stringify(payload));
}

function findPending(now) {
  return db.prepare(`
    SELECT * FROM notification_jobs
    WHERE status = 'pending' AND next_run_at <= ?
    ORDER BY next_run_at ASC
  `).all(now);
}

function markDelivered(id) {
  return db.prepare(`UPDATE notification_jobs SET status = 'delivered' WHERE id = ?`).run(id);
}

function markFailed(id, attempts, errorMsg) {
  return db.prepare(`
    UPDATE notification_jobs SET status = 'failed', attempts = ?, error = ? WHERE id = ?
  `).run(attempts, errorMsg, id);
}

function scheduleRetry(id, attempts, nextRun, errorMsg) {
  return db.prepare(`
    UPDATE notification_jobs SET attempts = ?, next_run_at = ?, error = ? WHERE id = ?
  `).run(attempts, nextRun, errorMsg, id);
}

module.exports = { enqueue, findPending, markDelivered, markFailed, scheduleRetry };
