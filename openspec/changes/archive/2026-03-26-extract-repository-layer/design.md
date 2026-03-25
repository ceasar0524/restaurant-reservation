## Context

目前 `api/routes/reservations.js`、`api/routes/admin/reservations.js` 和 `notification/db.js` 直接使用 `db.prepare()` 執行 SQL，資料存取邏輯與 HTTP 路由邏輯混在同一層。DB 連線已集中在 `api/db/index.js`，是良好的基礎。

## Goals / Non-Goals

**Goals:**
- 將所有 DB 查詢從 routes 抽出，集中至 `api/db/repositories/`
- Routes 只負責 HTTP 處理，不直接接觸 SQL
- 未來更換資料庫時只需修改 repository 層

**Non-Goals:**
- 不引入 ORM 或 query builder
- 不改變 API 行為或回傳格式
- 不修改 migration 系統
- 不更換資料庫

## Decisions

### Repository 以模組匯出函式（非 class）

直接匯出函式比 class 更簡單，適合此規模的專案。每個 repository 接收 `db` 實例作為參數或直接 require `api/db/index.js`。

選擇直接 require db 而非注入：專案單一 DB 實例，注入只增加複雜度。

### 三個 Repository 對應三個資料域

- `reservationRepository.js`：訂位 CRUD（公開訂位 + 管理端查詢）
- `adminRepository.js`：管理員帳號驗證
- `notificationRepository.js`：通知佇列操作

### 不建立共用 BaseRepository

只有三個 repository，共用基底類別屬於過度設計。

## Risks / Trade-offs

- [函式命名不一致] → 在 repository 內使用語意化命名（如 `findById`、`create`、`updateStatus`），routes 中對應調整呼叫名稱
- [搬移過程漏掉查詢] → 逐支檔案處理，完成後對照原始 routes 確認無遺漏
