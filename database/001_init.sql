-- 001_init.sql
-- 如如的創意料理訂位系統 - 初始 Schema（v2）
-- 需 SQLite 3.8.9+（支援 Partial Index）

PRAGMA foreign_keys = ON;

-- reservations：訪客訂位記錄，直接儲存顧客資訊（非正規化設計）
CREATE TABLE IF NOT EXISTS reservations (
    id                TEXT PRIMARY KEY,
    customer_name     TEXT NOT NULL,
    customer_phone    TEXT NOT NULL,
    customer_email    TEXT NOT NULL,
    date              TEXT NOT NULL,
    time_slot         TEXT NOT NULL CHECK (time_slot IN (
                          '午餐 11:30', '午餐 12:00', '午餐 12:30', '午餐 13:00', '午餐 13:30',
                          '晚餐 17:30', '晚餐 18:00', '晚餐 18:30', '晚餐 19:00', '晚餐 19:30',
                          '晚餐 20:00', '晚餐 20:30'
                      )),
    party_size        INTEGER NOT NULL CHECK (party_size >= 1 AND party_size <= 8),
    special_requests  TEXT,
    status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
                          'pending', 'confirmed', 'cancelled', 'completed', 'no_show'
                      )),
    confirmation_code TEXT UNIQUE NOT NULL,
    created_at        TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now')),
    updated_at        TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now'))
);

-- admins：管理員帳號，密碼以 bcrypt hash 儲存
CREATE TABLE IF NOT EXISTS admins (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    email           TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    created_at      TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now'))
);

-- 防止同一顧客在同一時段重複訂位（取消後可重新預訂）
CREATE UNIQUE INDEX IF NOT EXISTS idx_no_duplicate_reservation
    ON reservations (customer_email, date, time_slot)
    WHERE status != 'cancelled';
