## 1. 依賴套件替換（使用 Resend SDK 取代 nodemailer）

- [x] 1.1 安裝 `resend` npm package，移除 `nodemailer`
- [x] 1.2 新增 `RESEND_API_KEY` 環境變數至 Railway 設定
- [x] 1.3 確認保留 SMTP_FROM 環境變數作為 sender address fallback

## 2. 核心實作：System sends transactional email via Resend API

- [x] 2.1 實作 System sends transactional email via Resend API：將 `notification/mailer.js` 改用 `resend` SDK，移除 SMTP transporter
- [x] 2.2 錯誤時拋出例外而非靜默失敗：讀取 `{ data, error }`，若 error 存在則 `throw new Error(JSON.stringify(error))`
- [x] 2.3 送達成功時 log email ID 與收件人

## 3. Email job outcomes are logged

- [x] 3.1 實作 Email job outcomes are logged：在 `notification/queue.js` 成功路徑新增 log（job ID、type）
- [x] 3.2 在失敗路徑新增 error log（job ID、type、attempt、錯誤訊息）
