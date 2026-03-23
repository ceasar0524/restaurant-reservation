const db = require('./db');
const { enqueue } = require('./queue');

// time_slot 格式：「午餐 12:00」→ 取 HH:MM
function parseTimeSlot(timeSlot) {
  const match = timeSlot.match(/(\d{2}:\d{2})$/);
  return match ? match[1] : '12:00';
}

// 將 date（YYYY-MM-DD）+ time_slot 組合為台灣時間 Date 物件
function reservationDate(date, timeSlot) {
  const time = parseTimeSlot(timeSlot);
  return new Date(`${date}T${time}:00+08:00`);
}

function scheduleReminders() {
  const now = Date.now();
  const windowMin = 23 * 60 * 60 * 1000; // 23 小時
  const windowMax = 25 * 60 * 60 * 1000; // 25 小時（24 ± 1）

  // 5.2 只掃描 pending / confirmed（排除 terminal status）
  const reservations = db.prepare(`
    SELECT * FROM reservations
    WHERE status IN ('pending', 'confirmed') AND reminder_sent = 0
  `).all();

  for (const r of reservations) {
    const resTime = reservationDate(r.date, r.time_slot).getTime();
    const diff = resTime - now;

    if (diff >= windowMin && diff <= windowMax) {
      enqueue(r.id, 'reminder', {
        reservation_id: r.id,
        customer_email: r.customer_email,
        customer_name: r.customer_name,
        confirmation_code: r.confirmation_code,
        date: r.date,
        time_slot: r.time_slot,
        party_size: r.party_size,
      });
      db.prepare(`UPDATE reservations SET reminder_sent = 1 WHERE id = ?`).run(r.id);
    }
  }
}

function startScheduler() {
  scheduleReminders();
  setInterval(scheduleReminders, 60 * 60 * 1000); // 每小時
}

module.exports = { startScheduler };
