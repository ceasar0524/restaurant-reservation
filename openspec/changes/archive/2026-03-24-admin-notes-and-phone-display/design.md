## Context

目前管理後台（`public/dashboard.html`）的訂位列表僅顯示確認碼、姓名、日期、時段、人數、狀態與操作按鈕。資料庫 `reservations` 資料表已儲存 `customer_phone`，但未在前端呈現。管理員若需記錄內部備註（特殊安排、VIP 標記等），目前沒有任何欄位可用，需另開資料庫工具。

## Goals / Non-Goals

**Goals:**

- 在管理後台訂位列表中顯示顧客手機號碼
- 允許管理員針對每筆訂位新增/編輯 `admin_notes`（內部備註）
- 備註更新即時反映，不需重新整理頁面

**Non-Goals:**

- 不對顧客公開備註內容
- 不新增備註歷史版本或 audit log
- 不支援富文字（plain text 即可）

## Decisions

### 資料庫：新增 migration 加入 admin_notes 欄位

新增 `database/005_add_admin_notes.sql` migration，對 `reservations` 表加入 `admin_notes TEXT` 欄位（nullable）。

不修改 `001_init.sql`，以維持 migration 線性歷史。

### 後端：擴充 PATCH endpoint 支援 admin_notes

現有 `PATCH /api/admin/reservations/:id` 只接受 `status`。擴充其接受 `admin_notes`（optional string）：
- 若 body 帶有 `admin_notes`，一併更新該欄位
- 若未帶，則不更改（允許單獨更新狀態或單獨更新備註）

Validation schema 需更新以允許 `admin_notes: string | null`。

### 前端：inline 備註編輯，點擊進入編輯模式

備註欄位採「點擊顯示 textarea → blur/Enter 儲存」的 inline 編輯模式，避免加入額外 modal 增加複雜度。

手機欄位直接在 `buildRow` 中新增一個 `<td>` 顯示 `r.customer_phone`。

## Risks / Trade-offs

- [風險] Migration 需手動執行：SQLite 無自動 migration runner → 緩解：startup script 載入所有 `database/*.sql` 或文件說明手動執行步驟（確認現有 db init 機制）
- [取捨] PATCH endpoint 同時接受 `status` 與 `admin_notes` 讓 API 稍微複雜，但避免新增一個 endpoint 增加路由維護負擔
