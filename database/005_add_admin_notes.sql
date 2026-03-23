-- 005_add_admin_notes.sql
-- 新增管理員備註欄位

ALTER TABLE reservations ADD COLUMN admin_notes TEXT;
