# admin-reservation-notes Specification

## Purpose

Improve operational efficiency for restaurant admins by surfacing customer contact information and special requests directly in the reservations list, and by providing a place for admins to record internal notes per reservation.

## Requirements

### Requirement: Display customer phone in admin reservation list

The admin dashboard SHALL display the customer's phone number (`customer_phone`) for each reservation row in the reservations table.

#### Scenario: Phone number is shown in the table

- **WHEN** an admin loads the reservations list
- **THEN** each row SHALL include the customer's phone number

#### Scenario: Phone number is present in API response

- **WHEN** the admin API returns reservation data via `GET /api/admin/reservations`
- **THEN** each reservation object SHALL include the `customer_phone` field


<!-- @trace
source: admin-notes-and-phone-display
updated: 2026-03-24
code:
  - api/middleware/validate.js
  - .github/prompts/spectra-propose.prompt.md
  - .agents/skills/spectra-apply/SKILL.md
  - .github/skills/spectra-ingest/SKILL.md
  - .github/prompts/spectra-apply.prompt.md
  - .agents/skills/spectra-ask/SKILL.md
  - api/routes/admin/reservations.js
  - .github/prompts/spectra-audit.prompt.md
  - .github/prompts/spectra-ingest.prompt.md
  - .agents/skills/spectra-debug/SKILL.md
  - .github/skills/spectra-audit/SKILL.md
  - .github/skills/spectra-propose/SKILL.md
  - .github/skills/spectra-archive/SKILL.md
  - .github/skills/spectra-debug/SKILL.md
  - database/005_add_admin_notes.sql
  - .github/skills/spectra-discuss/SKILL.md
  - .agents/skills/spectra-ingest/SKILL.md
  - .DS_Store
  - .agents/skills/spectra-archive/SKILL.md
  - .agents/skills/spectra-propose/SKILL.md
  - .github/prompts/spectra-ask.prompt.md
  - .github/skills/spectra-ask/SKILL.md
  - .agents/skills/spectra-audit/SKILL.md
  - .github/prompts/spectra-archive.prompt.md
  - AGENTS.md
  - CLAUDE.md
  - .github/skills/spectra-apply/SKILL.md
  - public/dashboard.html
  - .agents/skills/spectra-discuss/SKILL.md
  - .github/prompts/spectra-debug.prompt.md
  - .github/prompts/spectra-discuss.prompt.md
-->

---
### Requirement: Admin can add or edit internal notes on a reservation

The system SHALL allow an admin to add or edit a plain-text internal note (`admin_notes`) for any reservation. Notes are internal only and SHALL NOT be visible to customers.

#### Scenario: Admin edits a note inline

- **WHEN** an admin clicks on the notes cell for a reservation
- **THEN** an editable text input SHALL appear, pre-filled with the existing note (or empty if none)

#### Scenario: Admin saves a note

- **WHEN** an admin finishes editing a note (blur or Enter key)
- **THEN** the system SHALL send a PATCH request with the updated `admin_notes` value
- **THEN** the note SHALL be persisted in the database and reflected in the UI without a full page reload

#### Scenario: Admin clears a note

- **WHEN** an admin saves an empty string as the note
- **THEN** the system SHALL store an empty/null value for `admin_notes`
- **THEN** the notes cell SHALL display a placeholder indicating no note

#### Scenario: Save failure is handled gracefully

- **WHEN** the PATCH request to update `admin_notes` fails
- **THEN** the system SHALL display an inline error message in the notes cell
- **THEN** the previous note value SHALL be restored in the UI


<!-- @trace
source: admin-notes-and-phone-display
updated: 2026-03-24
code:
  - api/middleware/validate.js
  - .github/prompts/spectra-propose.prompt.md
  - .agents/skills/spectra-apply/SKILL.md
  - .github/skills/spectra-ingest/SKILL.md
  - .github/prompts/spectra-apply.prompt.md
  - .agents/skills/spectra-ask/SKILL.md
  - api/routes/admin/reservations.js
  - .github/prompts/spectra-audit.prompt.md
  - .github/prompts/spectra-ingest.prompt.md
  - .agents/skills/spectra-debug/SKILL.md
  - .github/skills/spectra-audit/SKILL.md
  - .github/skills/spectra-propose/SKILL.md
  - .github/skills/spectra-archive/SKILL.md
  - .github/skills/spectra-debug/SKILL.md
  - database/005_add_admin_notes.sql
  - .github/skills/spectra-discuss/SKILL.md
  - .agents/skills/spectra-ingest/SKILL.md
  - .DS_Store
  - .agents/skills/spectra-archive/SKILL.md
  - .agents/skills/spectra-propose/SKILL.md
  - .github/prompts/spectra-ask.prompt.md
  - .github/skills/spectra-ask/SKILL.md
  - .agents/skills/spectra-audit/SKILL.md
  - .github/prompts/spectra-archive.prompt.md
  - AGENTS.md
  - CLAUDE.md
  - .github/skills/spectra-apply/SKILL.md
  - public/dashboard.html
  - .agents/skills/spectra-discuss/SKILL.md
  - .github/prompts/spectra-debug.prompt.md
  - .github/prompts/spectra-discuss.prompt.md
-->

---
### Requirement: Database stores admin_notes per reservation

The `reservations` table SHALL include an `admin_notes` column of type TEXT, nullable, with default NULL.

#### Scenario: Migration adds admin_notes column

- **WHEN** migration `005_add_admin_notes.sql` is applied
- **THEN** the `reservations` table SHALL have a new nullable `admin_notes` column
- **THEN** existing rows SHALL have `admin_notes` set to NULL


<!-- @trace
source: admin-notes-and-phone-display
updated: 2026-03-24
code:
  - api/middleware/validate.js
  - .github/prompts/spectra-propose.prompt.md
  - .agents/skills/spectra-apply/SKILL.md
  - .github/skills/spectra-ingest/SKILL.md
  - .github/prompts/spectra-apply.prompt.md
  - .agents/skills/spectra-ask/SKILL.md
  - api/routes/admin/reservations.js
  - .github/prompts/spectra-audit.prompt.md
  - .github/prompts/spectra-ingest.prompt.md
  - .agents/skills/spectra-debug/SKILL.md
  - .github/skills/spectra-audit/SKILL.md
  - .github/skills/spectra-propose/SKILL.md
  - .github/skills/spectra-archive/SKILL.md
  - .github/skills/spectra-debug/SKILL.md
  - database/005_add_admin_notes.sql
  - .github/skills/spectra-discuss/SKILL.md
  - .agents/skills/spectra-ingest/SKILL.md
  - .DS_Store
  - .agents/skills/spectra-archive/SKILL.md
  - .agents/skills/spectra-propose/SKILL.md
  - .github/prompts/spectra-ask.prompt.md
  - .github/skills/spectra-ask/SKILL.md
  - .agents/skills/spectra-audit/SKILL.md
  - .github/prompts/spectra-archive.prompt.md
  - AGENTS.md
  - CLAUDE.md
  - .github/skills/spectra-apply/SKILL.md
  - public/dashboard.html
  - .agents/skills/spectra-discuss/SKILL.md
  - .github/prompts/spectra-debug.prompt.md
  - .github/prompts/spectra-discuss.prompt.md
-->

---
### Requirement: PATCH endpoint accepts admin_notes

The `PATCH /api/admin/reservations/:id` endpoint SHALL accept an optional `admin_notes` field (string or null) in the request body, in addition to the existing `status` field.

#### Scenario: Update admin_notes only

- **WHEN** a PATCH request is sent with only `admin_notes` (no `status`)
- **THEN** only the `admin_notes` field SHALL be updated
- **THEN** the response SHALL include the updated reservation with the new `admin_notes` value

#### Scenario: Update status and admin_notes together

- **WHEN** a PATCH request is sent with both `status` and `admin_notes`
- **THEN** both fields SHALL be updated atomically

#### Scenario: admin_notes is not sent

- **WHEN** a PATCH request is sent without `admin_notes`
- **THEN** the existing `admin_notes` value SHALL remain unchanged

<!-- @trace
source: admin-notes-and-phone-display
updated: 2026-03-24
code:
  - api/middleware/validate.js
  - .github/prompts/spectra-propose.prompt.md
  - .agents/skills/spectra-apply/SKILL.md
  - .github/skills/spectra-ingest/SKILL.md
  - .github/prompts/spectra-apply.prompt.md
  - .agents/skills/spectra-ask/SKILL.md
  - api/routes/admin/reservations.js
  - .github/prompts/spectra-audit.prompt.md
  - .github/prompts/spectra-ingest.prompt.md
  - .agents/skills/spectra-debug/SKILL.md
  - .github/skills/spectra-audit/SKILL.md
  - .github/skills/spectra-propose/SKILL.md
  - .github/skills/spectra-archive/SKILL.md
  - .github/skills/spectra-debug/SKILL.md
  - database/005_add_admin_notes.sql
  - .github/skills/spectra-discuss/SKILL.md
  - .agents/skills/spectra-ingest/SKILL.md
  - .DS_Store
  - .agents/skills/spectra-archive/SKILL.md
  - .agents/skills/spectra-propose/SKILL.md
  - .github/prompts/spectra-ask.prompt.md
  - .github/skills/spectra-ask/SKILL.md
  - .agents/skills/spectra-audit/SKILL.md
  - .github/prompts/spectra-archive.prompt.md
  - AGENTS.md
  - CLAUDE.md
  - .github/skills/spectra-apply/SKILL.md
  - public/dashboard.html
  - .agents/skills/spectra-discuss/SKILL.md
  - .github/prompts/spectra-debug.prompt.md
  - .github/prompts/spectra-discuss.prompt.md
-->
---
### Requirement: Display customer special requests in admin reservation list

The admin dashboard SHALL display the customer's `special_requests` field for each reservation row in the reservations table as a read-only value.

#### Scenario: Special requests are shown in the table

- **WHEN** an admin loads the reservations list
- **THEN** each row SHALL display the customer's `special_requests` value if present
- **THEN** rows with no `special_requests` SHALL display a placeholder (e.g. `—`)

#### Scenario: Special requests are present in API response

- **WHEN** the admin API returns reservation data via `GET /api/admin/reservations`
- **THEN** each reservation object SHALL include the `special_requests` field

<!-- @trace
source: code-sync-2026-03-24
updated: 2026-03-24
code:
  - api/routes/admin/reservations.js
  - public/dashboard.html
-->
