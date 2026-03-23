process.env.TZ = 'Asia/Taipei';
require('dotenv').config();

const { registerWorker, startWorkerLoop } = require('./queue');
const { startPoller } = require('./poller');
const { startScheduler } = require('./scheduler');
const confirmationWorker = require('./workers/confirmation');
const cancellationWorker = require('./workers/cancellation');
const reminderWorker = require('./workers/reminder');
const modificationWorker = require('./workers/modification');

// 註冊 email workers
registerWorker('confirmation', confirmationWorker);
registerWorker('cancellation', cancellationWorker);
registerWorker('reminder', reminderWorker);
registerWorker('modification', modificationWorker);

// 啟動
startPoller();
startScheduler();
startWorkerLoop();

console.log('[notification-service] 啟動完成（TZ: Asia/Taipei）');
console.log('  poller:    每 10 秒掃描新訂位 / 取消訂位');
console.log('  scheduler: 每小時掃描 24 小時提醒');
console.log('  worker:    每 30 秒處理 pending jobs');
