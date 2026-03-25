## Context

通知服務（`notification/`）原本透過 nodemailer 使用 SMTP 協議發送 email。在 Railway 部署環境中，SMTP 設定複雜、且原本的 `sendMail` 在失敗時靜默忽略錯誤，導致 email 未送達時無從察覺。

## Goals / Non-Goals

**Goals:**
- 使用 Resend SDK 取代 nodemailer，簡化 email 發送介面
- 確保 Resend API 回傳錯誤時會拋出例外，使 queue 的重試機制能正確運作
- 新增送達與失敗的 log，方便追蹤問題

**Non-Goals:**
- 不更動 email 樣板或內容
- 不改變 notification queue 的重試邏輯
- 不引入 webhook 或送達回報機制

## Decisions

### 使用 Resend SDK 取代 nodemailer

直接使用官方 `resend` npm package，透過 API Key 認證。相較 SMTP，不需設定 host/port/auth，環境變數只需一個 `RESEND_API_KEY`。

### 錯誤時拋出例外而非靜默失敗

Resend SDK 回傳 `{ data, error }` 結構。若 `error` 存在，主動 `throw new Error(JSON.stringify(error))`，使 queue worker 的 try/catch 能捕捉並觸發重試邏輯。

### 保留 SMTP_FROM 環境變數

sender address 維持從 `SMTP_FROM` 讀取，避免現有部署環境需要更改設定。若未設定則 fallback 到 `onboarding@resend.dev`（Resend 測試用預設 sender）。

## Risks / Trade-offs

- [風險] Resend 為外部第三方服務，有服務中斷可能 → queue 重試機制（最多 3 次）可緩解短暫中斷
- [Trade-off] Resend 免費方案有每日/每月寄送上限 → 餐廳規模下不成問題，未來可升級方案

## Migration Plan

1. 新增 `RESEND_API_KEY` 環境變數（Railway Dashboard）
2. 部署新版本（`resend` 已加入 `package.json`）
3. 舊的 SMTP 相關環境變數可保留（不會被讀取）或移除
4. Rollback：還原 `notification/mailer.js` 至舊版並移除 `resend` 依賴
