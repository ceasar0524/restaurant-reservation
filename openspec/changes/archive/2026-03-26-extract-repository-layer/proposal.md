## Why

目前資料庫查詢 SQL 直接散落在 routes 層，導致資料存取邏輯與業務邏輯耦合。透過抽出 Repository 層，未來更換資料庫（如 SQLite → PostgreSQL）只需修改 repository，routes 完全不需動。

## What Changes

- 新增 `api/db/repositories/` 資料夾
- 新增 `reservationRepository.js`：封裝所有訂位相關查詢
- 新增 `adminRepository.js`：封裝管理員相關查詢
- 新增 `notificationRepository.js`：封裝通知佇列相關查詢
- `api/routes/reservations.js` 改為呼叫 repository，移除直接 SQL
- `api/routes/admin/reservations.js` 改為呼叫 repository，移除直接 SQL
- `notification/db.js` 查詢邏輯移入 notificationRepository

## Capabilities

### New Capabilities

- `repository-layer`：資料存取抽象層，集中管理所有 DB 查詢，隔離業務邏輯與資料庫實作

### Modified Capabilities

（無規格層級的行為變更，純實作搬移）

## Impact

- Affected specs: `repository-layer`（新增）
- Affected code:
  - `api/routes/reservations.js`
  - `api/routes/admin/reservations.js`
  - `notification/db.js`
  - 新增 `api/db/repositories/reservationRepository.js`
  - 新增 `api/db/repositories/adminRepository.js`
  - 新增 `api/db/repositories/notificationRepository.js`
