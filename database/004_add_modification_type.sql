-- 004_add_modification_type.sql
-- 新增 modification 到 notification_jobs.type CHECK constraint

CREATE TABLE notification_jobs_new (
    id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    reservation_id TEXT NOT NULL,
    type          TEXT NOT NULL CHECK (type IN ('confirmation', 'cancellation', 'reminder', 'modification')),
    payload       TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed')),
    attempts      INTEGER NOT NULL DEFAULT 0,
    next_run_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now')),
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now')),
    error         TEXT
);

INSERT INTO notification_jobs_new SELECT * FROM notification_jobs;
DROP TABLE notification_jobs;
ALTER TABLE notification_jobs_new RENAME TO notification_jobs;
