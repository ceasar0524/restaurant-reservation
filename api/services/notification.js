// Notification stub — 第 6 層通知服務實作時替換此檔案
function enqueue(event) {
  // TODO: 推入非同步通知佇列（第 6 層實作）
  console.log('[notification] event enqueued:', JSON.stringify(event));
}

module.exports = { enqueue };
