## 1. 建立 Repository 層結構

- [x] 1.1 建立 `api/db/repositories/` 目錄，確認 repository layer isolates database access 架構就位
- [x] 1.2 建立 `api/db/repositories/reservationRepository.js`（reservation repository covers all reservation queries），三個 repository 對應三個資料域，不建立共用 BaseRepository
- [x] 1.3 建立 `api/db/repositories/adminRepository.js`（admin repository covers authentication queries）
- [x] 1.4 建立 `api/db/repositories/notificationRepository.js`（notification repository covers queue operations）

## 2. 實作 Reservation Repository

- [x] 2.1 從 `api/routes/reservations.js` 抽出所有 SQL，實作 `reservationRepository.create()`（public reservation creation）
- [x] 2.2 從 `api/routes/admin/reservations.js` 抽出所有 SQL，實作 `reservationRepository.findAll()`（admin reservation listing）
- [x] 2.3 實作其餘訂位查詢函式（findById、updateStatus、cancel 等）
- [x] 2.4 Repository 以模組匯出函式（非 class），直接 require `api/db/index.js`

## 3. 實作 Admin Repository

- [x] 3.1 從 `api/routes/admin/` 抽出管理員帳號查詢，實作 `adminRepository.findByUsername()`（admin login lookup）

## 4. 實作 Notification Repository

- [x] 4.1 從 `notification/db.js` 抽出查詢，實作 `notificationRepository.enqueue()`（enqueue notification）
- [x] 4.2 實作 `notificationRepository.findPending()`（fetch pending jobs）
- [x] 4.3 實作 `notificationRepository.updateStatus()` 等其餘佇列操作

## 5. 更新 Routes 使用 Repository

- [x] 5.1 更新 `api/routes/reservations.js`，移除直接 SQL，改呼叫 `reservationRepository`
- [x] 5.2 更新 `api/routes/admin/reservations.js`，移除直接 SQL，改呼叫 `reservationRepository` 與 `adminRepository`
- [x] 5.3 更新 `notification/db.js`，移除直接 SQL，改呼叫 `notificationRepository`

## 6. 驗證

- [x] 6.1 確認所有 routes 中已無 `db.prepare()` 直接呼叫
- [x] 6.2 啟動服務，手動測試訂位建立、查詢、管理端功能正常
