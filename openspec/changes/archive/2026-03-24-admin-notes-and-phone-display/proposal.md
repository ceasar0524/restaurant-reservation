## Why

管理員在訂位列表中無法看到顧客的手機號碼，也沒有地方記錄內部備註（例如特殊安排、VIP 標記），導致需要另開資料庫工具查詢，降低營運效率。

## What Changes

- 訂位列表新增「手機」欄位，直接顯示 `customer_phone`
- 新增「備註」欄位，管理員可對每筆訂位新增或編輯內部備註（`admin_notes`）
- 資料庫新增 migration 加入 `admin_notes` 欄位
- 後端 PATCH endpoint 支援更新 `admin_notes`
- 前端列表列顯示手機號碼，並提供 inline 備註輸入介面

## Capabilities

### New Capabilities

- `admin-reservation-notes`: 管理員對訂位記錄新增/編輯內部備註的能力

### Modified Capabilities

（無）

## Impact

- Affected code:
  - `database/` — 新增 migration SQL 加入 `admin_notes` 欄位
  - `api/routes/admin/reservations.js` — PATCH 支援 `admin_notes`，GET 回傳包含此欄位
  - `api/middleware/validate.js` — `updateStatusSchema` 或新增 schema 支援 `admin_notes`
  - `public/dashboard.html` — 表格新增手機欄位、備註顯示與編輯 UI
