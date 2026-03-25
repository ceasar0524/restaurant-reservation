## Requirements

### Requirement: Repository layer isolates database access

The system SHALL provide a repository layer in `api/db/repositories/` that encapsulates all SQL queries. Routes and services SHALL NOT call `db.prepare()` directly.

#### Scenario: Route delegates query to repository

- **WHEN** a route handler needs to read or write data
- **THEN** it SHALL call a repository function instead of executing SQL directly


<!-- @trace
source: extract-repository-layer
updated: 2026-03-26
code:
  - .agents/skills/spectra-ask/SKILL.md
  - .agents/skills/spectra-archive/SKILL.md
  - .agents/skills/spectra-propose/SKILL.md
  - .agents/skills/spectra-ingest/SKILL.md
  - .github/skills/spectra-archive/SKILL.md
  - api/db/repositories/reservationRepository.js
  - .github/prompts/spectra-apply.prompt.md
  - api/db/repositories/adminRepository.js
  - .github/skills/spectra-propose/SKILL.md
  - .github/skills/spectra-ask/SKILL.md
  - .DS_Store
  - .agents/skills/spectra-audit/SKILL.md
  - .github/skills/spectra-debug/SKILL.md
  - .github/skills/spectra-discuss/SKILL.md
  - api/routes/auth.js
  - .agents/skills/spectra-apply/SKILL.md
  - api/routes/admin/reservations.js
  - .github/skills/spectra-ingest/SKILL.md
  - .github/skills/spectra-audit/SKILL.md
  - api/routes/reservations.js
  - .agents/skills/spectra-debug/SKILL.md
  - .github/prompts/spectra-discuss.prompt.md
  - .github/prompts/spectra-audit.prompt.md
  - .github/prompts/spectra-ingest.prompt.md
  - api/db/repositories/notificationRepository.js
  - notification/notificationRepository.js
  - .agents/skills/spectra-discuss/SKILL.md
  - .github/prompts/spectra-ask.prompt.md
  - CLAUDE.md
  - notification/queue.js
  - AGENTS.md
  - .github/prompts/spectra-debug.prompt.md
  - .env.example
  - .github/prompts/spectra-propose.prompt.md
  - .github/prompts/spectra-archive.prompt.md
  - .github/skills/spectra-apply/SKILL.md
-->

---
### Requirement: Reservation repository covers all reservation queries

The system SHALL provide `reservationRepository.js` with functions covering all reservation CRUD operations used by both public and admin routes.

#### Scenario: Public reservation creation

- **WHEN** a customer submits a reservation
- **THEN** `reservationRepository.create()` SHALL insert the record and return the new reservation

#### Scenario: Admin reservation listing

- **WHEN** an admin requests all reservations
- **THEN** `reservationRepository.findAll()` SHALL return reservations ordered by date


<!-- @trace
source: extract-repository-layer
updated: 2026-03-26
code:
  - .agents/skills/spectra-ask/SKILL.md
  - .agents/skills/spectra-archive/SKILL.md
  - .agents/skills/spectra-propose/SKILL.md
  - .agents/skills/spectra-ingest/SKILL.md
  - .github/skills/spectra-archive/SKILL.md
  - api/db/repositories/reservationRepository.js
  - .github/prompts/spectra-apply.prompt.md
  - api/db/repositories/adminRepository.js
  - .github/skills/spectra-propose/SKILL.md
  - .github/skills/spectra-ask/SKILL.md
  - .DS_Store
  - .agents/skills/spectra-audit/SKILL.md
  - .github/skills/spectra-debug/SKILL.md
  - .github/skills/spectra-discuss/SKILL.md
  - api/routes/auth.js
  - .agents/skills/spectra-apply/SKILL.md
  - api/routes/admin/reservations.js
  - .github/skills/spectra-ingest/SKILL.md
  - .github/skills/spectra-audit/SKILL.md
  - api/routes/reservations.js
  - .agents/skills/spectra-debug/SKILL.md
  - .github/prompts/spectra-discuss.prompt.md
  - .github/prompts/spectra-audit.prompt.md
  - .github/prompts/spectra-ingest.prompt.md
  - api/db/repositories/notificationRepository.js
  - notification/notificationRepository.js
  - .agents/skills/spectra-discuss/SKILL.md
  - .github/prompts/spectra-ask.prompt.md
  - CLAUDE.md
  - notification/queue.js
  - AGENTS.md
  - .github/prompts/spectra-debug.prompt.md
  - .env.example
  - .github/prompts/spectra-propose.prompt.md
  - .github/prompts/spectra-archive.prompt.md
  - .github/skills/spectra-apply/SKILL.md
-->

---
### Requirement: Admin repository covers authentication queries

The system SHALL provide `adminRepository.js` with functions for admin account lookup and authentication.

#### Scenario: Admin login lookup

- **WHEN** an admin submits login credentials
- **THEN** `adminRepository.findByUsername()` SHALL return the matching admin record or null


<!-- @trace
source: extract-repository-layer
updated: 2026-03-26
code:
  - .agents/skills/spectra-ask/SKILL.md
  - .agents/skills/spectra-archive/SKILL.md
  - .agents/skills/spectra-propose/SKILL.md
  - .agents/skills/spectra-ingest/SKILL.md
  - .github/skills/spectra-archive/SKILL.md
  - api/db/repositories/reservationRepository.js
  - .github/prompts/spectra-apply.prompt.md
  - api/db/repositories/adminRepository.js
  - .github/skills/spectra-propose/SKILL.md
  - .github/skills/spectra-ask/SKILL.md
  - .DS_Store
  - .agents/skills/spectra-audit/SKILL.md
  - .github/skills/spectra-debug/SKILL.md
  - .github/skills/spectra-discuss/SKILL.md
  - api/routes/auth.js
  - .agents/skills/spectra-apply/SKILL.md
  - api/routes/admin/reservations.js
  - .github/skills/spectra-ingest/SKILL.md
  - .github/skills/spectra-audit/SKILL.md
  - api/routes/reservations.js
  - .agents/skills/spectra-debug/SKILL.md
  - .github/prompts/spectra-discuss.prompt.md
  - .github/prompts/spectra-audit.prompt.md
  - .github/prompts/spectra-ingest.prompt.md
  - api/db/repositories/notificationRepository.js
  - notification/notificationRepository.js
  - .agents/skills/spectra-discuss/SKILL.md
  - .github/prompts/spectra-ask.prompt.md
  - CLAUDE.md
  - notification/queue.js
  - AGENTS.md
  - .github/prompts/spectra-debug.prompt.md
  - .env.example
  - .github/prompts/spectra-propose.prompt.md
  - .github/prompts/spectra-archive.prompt.md
  - .github/skills/spectra-apply/SKILL.md
-->

---
### Requirement: Notification repository covers queue operations

The system SHALL provide `notificationRepository.js` with functions for enqueuing, dequeuing, and updating notification jobs.

#### Scenario: Enqueue notification

- **WHEN** a reservation event triggers a notification
- **THEN** `notificationRepository.enqueue()` SHALL insert a job into `notification_jobs`

#### Scenario: Fetch pending jobs

- **WHEN** the notification worker polls for work
- **THEN** `notificationRepository.findPending()` SHALL return unprocessed jobs

<!-- @trace
source: extract-repository-layer
updated: 2026-03-26
code:
  - .agents/skills/spectra-ask/SKILL.md
  - .agents/skills/spectra-archive/SKILL.md
  - .agents/skills/spectra-propose/SKILL.md
  - .agents/skills/spectra-ingest/SKILL.md
  - .github/skills/spectra-archive/SKILL.md
  - api/db/repositories/reservationRepository.js
  - .github/prompts/spectra-apply.prompt.md
  - api/db/repositories/adminRepository.js
  - .github/skills/spectra-propose/SKILL.md
  - .github/skills/spectra-ask/SKILL.md
  - .DS_Store
  - .agents/skills/spectra-audit/SKILL.md
  - .github/skills/spectra-debug/SKILL.md
  - .github/skills/spectra-discuss/SKILL.md
  - api/routes/auth.js
  - .agents/skills/spectra-apply/SKILL.md
  - api/routes/admin/reservations.js
  - .github/skills/spectra-ingest/SKILL.md
  - .github/skills/spectra-audit/SKILL.md
  - api/routes/reservations.js
  - .agents/skills/spectra-debug/SKILL.md
  - .github/prompts/spectra-discuss.prompt.md
  - .github/prompts/spectra-audit.prompt.md
  - .github/prompts/spectra-ingest.prompt.md
  - api/db/repositories/notificationRepository.js
  - notification/notificationRepository.js
  - .agents/skills/spectra-discuss/SKILL.md
  - .github/prompts/spectra-ask.prompt.md
  - CLAUDE.md
  - notification/queue.js
  - AGENTS.md
  - .github/prompts/spectra-debug.prompt.md
  - .env.example
  - .github/prompts/spectra-propose.prompt.md
  - .github/prompts/spectra-archive.prompt.md
  - .github/skills/spectra-apply/SKILL.md
-->