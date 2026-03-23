-- 新增通知追蹤欄位至 reservations 表
ALTER TABLE reservations ADD COLUMN confirmation_sent INTEGER NOT NULL DEFAULT 0;
ALTER TABLE reservations ADD COLUMN cancellation_sent INTEGER NOT NULL DEFAULT 0;
ALTER TABLE reservations ADD COLUMN reminder_sent     INTEGER NOT NULL DEFAULT 0;
