# 餐廳訂位系統

線上餐廳訂位管理系統，提供顧客預約、後台管理，並自動發送訂位確認通知。

**Demo：** https://restaurant-reservation-production-6854.up.railway.app/

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
