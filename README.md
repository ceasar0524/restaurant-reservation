# 餐廳訂位系統

線上餐廳訂位管理系統，提供顧客預約、後台管理，並自動發送訂位確認通知。

**Demo：** https://restaurant-reservation-production-6854.up.railway.app/

## 開發方式

本專案透過 [Claude Code](https://claude.ai/code)（AI 編程助理）與 [Spectra](https://github.com/spectra-ai/spectra)（Spec-Driven Development 工具）協作完成。由人主導需求與決策，AI 協助實作與規格管理。

## 適用情境

專為**小型餐廳或個人店家**設計，適合每日訂位量不大、不需要複雜排班系統的場景。以免費或低成本工具為主（SQLite 資料庫、Railway 免費方案），無需額外基礎建設費用，開箱即用。

## 系統架構

```
顧客（瀏覽器）
    │
    │  HTTP
    ▼
Express API（api/index.js）
    ├── 訂位管理（建立／查詢／取消）
    ├── 使用者認證（JWT）
    └── 後台管理介面
    │
    ├── SQLite 資料庫
    │
    └── 通知服務（notification/index.js）
            └── 寄送訂位確認信（Resend）
```

## 資料庫設計

使用 SQLite 搭配完整的 Migration 系統，並透過 **Repository 層**隔離資料存取邏輯：

```
routes → repository → db
```

- 所有 SQL 查詢集中在 `api/db/repositories/`，routes 不直接接觸資料庫
- 新增欄位或表格只需新增 migration 檔案（`database/*.sql`），自動追蹤執行
- 未來若需更換資料庫（如 SQLite → PostgreSQL），只需修改 repository 層，業務邏輯不受影響

## 使用工具

| 工具 | 用途 |
|------|------|
| [Node.js](https://nodejs.org) + [Express](https://expressjs.com) | 後端 API 伺服器 |
| [SQLite](https://www.sqlite.org) + [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | 資料庫 |
| [JWT](https://jwt.io) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 使用者認證與密碼加密 |
| [Resend](https://resend.com) | 訂位確認 Email 通知 |
| [Railway](https://railway.app) | 雲端部署 |

## 功能

- 顧客線上填寫訂位（姓名、人數、日期、時間、聯絡方式）
- 訂位成功後自動寄送確認信
- 後台管理介面（查看、確認、取消訂位）
- JWT 登入驗證保護後台

## 環境設定

1. 複製 `.env.example` 為 `.env` 並填入各項變數
2. 安裝相依套件：

```bash
npm install
```

## 啟動

```bash
npm start
```

## 部署

本專案使用 [Railway](https://railway.app) 部署，設定檔為 `railway.toml`。
