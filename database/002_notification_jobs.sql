-- notification_jobs：非同步通知佇列
CREATE TABLE IF NOT EXISTS notification_jobs (
    id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    reservation_id TEXT NOT NULL,
    type          TEXT NOT NULL CHECK (type IN ('confirmation', 'cancellation', 'reminder')),
    payload       TEXT NOT NULL,  -- JSON
    status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed')),
    attempts      INTEGER NOT NULL DEFAULT 0,
    next_run_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now')),
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now')),
    error         TEXT
);
