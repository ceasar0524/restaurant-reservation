## Context

通知服務與 API 共用同一個 SQLite 資料庫，並在同一個 Node.js process 內啟動。API 在啟動時執行 DB migration，migration 完成後資料庫 schema 才達到最新狀態。通知服務的三個 loop（poller、scheduler、queue worker）幾乎與 API 同時啟動，在 migration 完成前查詢資料庫會觸發 schema 不符或資料庫鎖定錯誤。

## Goals / Non-Goals

**Goals:**
- 消除啟動 race condition（通知服務 loop 需等待 migration 完成）
- 確保任何單一 loop iteration 的錯誤不會讓整個服務崩潰
- 修正 notification_jobs schema，讓 modification 類型可正常使用
- 修正 admin seeding

**Non-Goals:**
- 不重構成多 process 架構
- 不引入 health check 或 readiness probe 機制
- 不改變通知 loop 的執行頻率

## Decisions

### 延遲啟動：setTimeout 5 秒

所有通知服務 loop 改以 `setTimeout(() => { ... }, 5000)` 包裹，讓 API migration 有時間完成。這是最簡單的修法，不需引入 IPC 或事件機制。5 秒是保守估計，實際 migration 通常在 1 秒內完成。

### 錯誤隔離：各 loop 加 try/catch

在 `poller.js`、`scheduler.js`、`queue.js` 的主迴圈函式外層加 try/catch，catch 時只 log 錯誤不 rethrow，確保 setInterval 不因例外停止。

### migration 004 重建 notification_jobs

由於 SQLite 不支援 ALTER TABLE ADD CONSTRAINT，改用 CREATE TABLE + INSERT + DROP + RENAME 的方式重建 table，加入 `modification` 到 CHECK constraint。

### DB 連線 timeout 10 秒

設定 `{ timeout: 10000 }`，避免 DB 鎖定時無限等待，讓錯誤可被 try/catch 捕捉。

## Risks / Trade-offs

- [Trade-off] 5 秒硬編碼延遲在 migration 極慢時仍可能不夠 → 接受，此環境下 migration 不可能超過 5 秒
- [風險] migration 004 重建 table 時若中途失敗會遺失資料 → 此 table 為 transient job queue，重建無資料損失風險
