## 1. 資料庫：新增 migration 加入 admin_notes 欄位

- [x] 1.1 新增 `database/005_add_admin_notes.sql`，對 `reservations` 表加入 `admin_notes TEXT` 欄位（nullable，default NULL），實作「Database stores admin_notes per reservation」需求
- [x] 1.2 確認 `api/db/index.js`（或 db 初始化邏輯）會自動執行新 migration，或於文件說明手動執行步驟

## 2. 後端：擴充 PATCH endpoint 支援 admin_notes

- [x] 2.1 更新 `api/middleware/validate.js` 的 `updateStatusSchema`，允許 body 中包含 optional `admin_notes`（string 或 null），實作「PATCH endpoint accepts admin_notes」需求
- [x] 2.2 更新 `api/routes/admin/reservations.js` 的 `PATCH /:id`，若 request body 帶有 `admin_notes` 欄位則一併更新至資料庫
- [x] 2.3 確保 `GET /api/admin/reservations` 回傳結果包含 `admin_notes` 欄位（目前使用 `SELECT *`，新增欄位後自動包含）

## 3. 前端：顯示手機號碼

- [x] 3.1 在 `public/dashboard.html` 的 table `<thead>` 新增「手機」欄位標題，實作「Display customer phone in admin reservation list」需求
- [x] 3.2 更新 `buildRow` 函式，在對應位置插入 `<td>${r.customer_phone}</td>`
- [x] 3.3 更新所有 `colspan` 的數值（loading row、empty state）以符合新的欄位數

## 4. 前端：Inline 備註編輯，點擊進入編輯模式

- [x] 4.1 在 table `<thead>` 新增「備註」欄位標題
- [x] 4.2 更新 `buildRow`，新增備註 `<td>`：顯示現有 `admin_notes` 文字，若為空則顯示 placeholder（例如「— 點擊新增備註」），實作「Admin can add or edit internal notes on a reservation」需求
- [x] 4.3 實作 `buildNoteCell(r)` 函式：點擊備註 cell 切換為 `<textarea>`，blur 或 Enter 觸發儲存
- [x] 4.4 實作 `saveNote(tr, id, newNote)` 函式：發送 `PATCH /api/admin/reservations/:id` 帶 `{ admin_notes: newNote }`，成功後更新 UI，失敗則顯示 inline 錯誤並還原舊值，實作「Save failure is handled gracefully」需求
- [x] 4.5 新增備註相關 CSS 樣式（textarea、hover 提示、placeholder 色調），符合現有設計風格
