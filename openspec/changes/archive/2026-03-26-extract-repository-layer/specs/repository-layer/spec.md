## ADDED Requirements

### Requirement: Repository layer isolates database access

The system SHALL provide a repository layer in `api/db/repositories/` that encapsulates all SQL queries. Routes and services SHALL NOT call `db.prepare()` directly.

#### Scenario: Route delegates query to repository

- **WHEN** a route handler needs to read or write data
- **THEN** it SHALL call a repository function instead of executing SQL directly

### Requirement: Reservation repository covers all reservation queries

The system SHALL provide `reservationRepository.js` with functions covering all reservation CRUD operations used by both public and admin routes.

#### Scenario: Public reservation creation

- **WHEN** a customer submits a reservation
- **THEN** `reservationRepository.create()` SHALL insert the record and return the new reservation

#### Scenario: Admin reservation listing

- **WHEN** an admin requests all reservations
- **THEN** `reservationRepository.findAll()` SHALL return reservations ordered by date

### Requirement: Admin repository covers authentication queries

The system SHALL provide `adminRepository.js` with functions for admin account lookup and authentication.

#### Scenario: Admin login lookup

- **WHEN** an admin submits login credentials
- **THEN** `adminRepository.findByUsername()` SHALL return the matching admin record or null

### Requirement: Notification repository covers queue operations

The system SHALL provide `notificationRepository.js` with functions for enqueuing, dequeuing, and updating notification jobs.

#### Scenario: Enqueue notification

- **WHEN** a reservation event triggers a notification
- **THEN** `notificationRepository.enqueue()` SHALL insert a job into `notification_jobs`

#### Scenario: Fetch pending jobs

- **WHEN** the notification worker polls for work
- **THEN** `notificationRepository.findPending()` SHALL return unprocessed jobs
