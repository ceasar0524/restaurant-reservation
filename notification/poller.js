const db = require('./db');
const { enqueue } = require('./queue');

function buildPayload(r) {
  return {
    reservation_id: r.id,
    customer_email: r.customer_email,
    customer_name: r.customer_name,
    confirmation_code: r.confirmation_code,
    date: r.date,
    time_slot: r.time_slot,
    party_size: r.party_size,
  };
}

function poll() {
  // 4.1 確認信：新訂位（pending，尚未寄確認）
  const newReservations = db.prepare(`
    SELECT * FROM reservations
    WHERE status = 'pending' AND confirmation_sent = 0
  `).all();

  for (const r of newReservations) {
    enqueue(r.id, 'confirmation', buildPayload(r));
    db.prepare(`UPDATE reservations SET confirmation_sent = 1 WHERE id = ?`).run(r.id);
  }

  // 4.2 取消信：已取消（不論是顧客 DELETE 或管理員 PATCH），尚未寄取消通知
  const cancelled = db.prepare(`
    SELECT * FROM reservations
    WHERE status = 'cancelled' AND cancellation_sent = 0
  `).all();

  for (const r of cancelled) {
    enqueue(r.id, 'cancellation', buildPayload(r));
    db.prepare(`UPDATE reservations SET cancellation_sent = 1 WHERE id = ?`).run(r.id);
  }
}

function startPoller() {
  poll();
  setInterval(poll, 10 * 1000);
}

module.exports = { startPoller };
