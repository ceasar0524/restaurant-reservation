## Why

原本使用 nodemailer + SMTP 發送 email，在部署環境（Railway）設定複雜且難以監控送達狀態。改用 Resend API 可簡化設定、獲得更可靠的錯誤回報，並方便日後追蹤寄送記錄。

## What Changes

- 移除 `nodemailer` 依賴，改用 `resend` SDK
- `notification/mailer.js` 以 Resend API 取代 SMTP transporter
- `sendMail` 函式現在會在 Resend 回傳錯誤時拋出例外，不再靜默失敗
- 寄送成功時記錄 email ID 與收件人（`[mailer] sent: <id> to: <email>`）
- `notification/queue.js` 新增 job 成功與失敗的 log 輸出

## Capabilities

### New Capabilities

- `email-delivery`: 透過 Resend API 發送 transactional email，包含錯誤處理與送達 logging

### Modified Capabilities

（無）

## Impact

- Affected code:
  - `notification/mailer.js` — 核心變更，SMTP → Resend
  - `notification/queue.js` — 新增 job 狀態 logging
  - `package.json` / `package-lock.json` — 新增 `resend` 依賴，移除 `nodemailer`
- Affected env vars:
  - 新增：`RESEND_API_KEY`
  - 原有 `SMTP_FROM` 繼續使用（sender address）
  - 不再需要：`SMTP_HOST`、`SMTP_PORT`、`SMTP_USER`、`SMTP_PASS`
