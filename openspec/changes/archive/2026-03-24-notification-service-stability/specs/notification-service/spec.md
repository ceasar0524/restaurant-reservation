## ADDED Requirements

### Requirement: Notification service loops start after a startup delay

The notification service (poller, scheduler, queue worker) SHALL delay the start of all polling loops by at least 5 seconds after process initialization, to allow database migrations to complete before any queries are executed.

#### Scenario: Service starts without crash

- **WHEN** the application starts and database migrations run
- **THEN** the notification service loops SHALL NOT execute any database queries during the migration window
- **THEN** all loops SHALL start executing after the delay period

### Requirement: Notification service loops are error-isolated

Each notification loop function (poller, scheduler, queue worker) SHALL wrap its body in a try/catch block so that a single iteration failure does not terminate the loop or crash the service.

#### Scenario: Loop iteration throws an error

- **WHEN** a polling, scheduling, or job-processing iteration encounters an error
- **THEN** the error SHALL be logged to stderr
- **THEN** the loop SHALL continue executing on the next scheduled interval

### Requirement: notification_jobs table supports modification type

The `notification_jobs` table's `type` column CHECK constraint SHALL include `modification` as a valid value, in addition to `confirmation`, `cancellation`, and `reminder`.

#### Scenario: Modification notification job is inserted

- **WHEN** a modification notification job is enqueued with `type = 'modification'`
- **THEN** the INSERT SHALL succeed without a constraint violation

### Requirement: Notification service database connection has a timeout

The SQLite database connection used by the notification service SHALL be configured with a connection timeout (minimum 5000ms) to prevent indefinite blocking when the database is locked.

#### Scenario: Database is temporarily locked

- **WHEN** the notification service attempts a database operation while the database is locked
- **THEN** the connection SHALL timeout after the configured duration
- **THEN** the error SHALL be catchable by the surrounding try/catch
