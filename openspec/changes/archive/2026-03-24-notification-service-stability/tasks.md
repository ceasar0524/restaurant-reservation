## 1. 啟動 race condition 修復

- [x] 1.1 實作 Notification service loops start after a startup delay（延遲啟動：setTimeout 5 秒）：`notification/poller.js` `startPoller` 改用 setTimeout 5 秒延遲啟動
- [x] 1.2 `notification/scheduler.js`：`startScheduler` 改用 setTimeout 5 秒延遲啟動
- [x] 1.3 `notification/queue.js`：`startWorkerLoop` 改用 setTimeout 5 秒延遲啟動

## 2. 錯誤隔離：各 loop 加 try/catch

- [x] 2.1 實作 Notification service loops are error-isolated：`notification/poller.js` `poll()` 加上 try/catch，catch 時 log 錯誤
- [x] 2.2 `notification/scheduler.js`：`scheduleReminders()` 加上 try/catch，catch 時 log 錯誤
- [x] 2.3 `notification/queue.js`：`processJobs()` 加上 try/catch，catch 時 log 錯誤

## 3. DB schema 修復：migration 004 重建 notification_jobs

- [x] 3.1 實作 notification_jobs table supports modification type：新增 `database/004_add_modification_type.sql`，重建 table 加入 `modification` 到 CHECK constraint

## 4. DB 連線穩定性：DB 連線 timeout 10 秒

- [x] 4.1 實作 Notification service database connection has a timeout：`notification/db.js` 加上 `{ timeout: 10000 }` 設定

## 5. Admin seeding 修復

- [x] 5.1 `api/app.js`：修正 admin seeding INSERT 使用正確欄位（`id`、`name`、`email`、`hashed_password`）
- [x] 5.2 支援 `ADMIN_EMAIL` 環境變數作為預設管理員 email
