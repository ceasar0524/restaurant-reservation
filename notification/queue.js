const db = require('./db');

const BACKOFF_MINUTES = [1, 4, 16]; // 指數退避：第 1/2/3 次重試間隔

// 2.1 enqueue：插入 job（non-blocking）
function enqueue(reservationId, type, payload) {
  db.prepare(`
    INSERT INTO notification_jobs (reservation_id, type, payload)
    VALUES (?, ?, ?)
  `).run(reservationId, type, JSON.stringify(payload));
}

// 2.2 worker loop：每 30 秒處理 pending jobs
const workers = {};

function registerWorker(type, fn) {
  workers[type] = fn;
}

async function processJobs() {
  try {
  const now = new Date().toISOString();
  const jobs = db.prepare(`
    SELECT * FROM notification_jobs
    WHERE status = 'pending' AND next_run_at <= ?
    ORDER BY next_run_at ASC
  `).all(now);

  for (const job of jobs) {
    const worker = workers[job.type];
    if (!worker) continue;

    try {
      await worker(JSON.parse(job.payload));
      console.log(`[queue] job ${job.id} (${job.type}) delivered`);
      // 6.1 成功：標記 delivered
      db.prepare(`UPDATE notification_jobs SET status = 'delivered' WHERE id = ?`).run(job.id);
    } catch (err) {
      const attempts = job.attempts + 1;
      console.error(`[queue] job ${job.id} (${job.type}) failed (attempt ${attempts}):`, err.message);

      if (attempts >= 3) {
        // 2.4 / 6.2 超過 3 次：標記 failed
        db.prepare(`
          UPDATE notification_jobs SET status = 'failed', attempts = ?, error = ? WHERE id = ?
        `).run(attempts, err.message, job.id);
      } else {
        // 2.3 重試：指數退避
        const delayMs = BACKOFF_MINUTES[attempts - 1] * 60 * 1000;
        const nextRun = new Date(Date.now() + delayMs).toISOString();
        db.prepare(`
          UPDATE notification_jobs SET attempts = ?, next_run_at = ?, error = ? WHERE id = ?
        `).run(attempts, nextRun, err.message, job.id);
      }
    }
  }
  } catch (err) {
    console.error('[queue] error:', err.message);
  }
}

function startWorkerLoop() {
  setTimeout(() => {
    processJobs();
    setInterval(processJobs, 30 * 1000);
  }, 5000);
}

module.exports = { enqueue, registerWorker, startWorkerLoop };
