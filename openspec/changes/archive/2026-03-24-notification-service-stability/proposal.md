## Problem

通知服務（`notification/`）在 Railway 部署後存在多個穩定性問題：

1. **啟動 race condition**：poller、scheduler、queue worker 在 DB migration 完成前就開始執行，導致服務 crash
2. **錯誤無隔離**：poller、scheduler、queue worker 的迴圈函式沒有 try/catch，單一錯誤會讓整個服務崩潰
3. **DB schema 缺失**：`notification_jobs.type` 的 CHECK constraint 缺少 `modification` 類型，導致修改通知無法寫入
4. **DB 連線無 timeout**：notification service 的 DB 連線未設定 timeout，在 DB 鎖定時無限等待
5. **管理員 seeding 欄位錯誤**：`admins` table 的 INSERT 使用了舊欄位名稱（`username`/`password_hash`），導致 seeding 失敗

## Root Cause

- 啟動序列沒有等待 migration 完成：API 與 notification service 是同一 process，migration 在 API 啟動時執行，但通知服務的 loop 幾乎同時啟動
- 迴圈函式沒有防禦性 error handling
- `notification_jobs` schema 在新增 `modification` 通知類型時未同步更新 CHECK constraint
- `admins` table schema 更新後 seeding 程式碼未同步

## Proposed Solution

- 所有通知服務 loop（poller、scheduler、queue worker）改用 5 秒 `setTimeout` 延遲啟動，讓 migration 有時間完成
- 在 `poller.js`、`scheduler.js`、`queue.js` 的主要函式加上 try/catch
- 新增 migration `004_add_modification_type.sql` 以重建 `notification_jobs` table，加入 `modification` 到 CHECK constraint
- `notification/db.js` 設定 10 秒連線 timeout
- 修正 `api/app.js` 的 admin seeding INSERT 語句

## Success Criteria

- 服務啟動後不因 race condition crash
- 任何單一 job 或輪詢失敗不影響其他 job 繼續處理
- `modification` 類型的通知 job 可正常寫入 `notification_jobs`
- 管理員 seeding 可正確建立預設帳號

## Impact

- Affected code:
  - `notification/poller.js` — 延遲啟動 + try/catch
  - `notification/scheduler.js` — 延遲啟動 + try/catch
  - `notification/queue.js` — 延遲啟動 + try/catch
  - `notification/db.js` — 連線 timeout 設定
  - `database/004_add_modification_type.sql` — 新增 migration
  - `api/app.js` — 修正 admin seeding 欄位
