## ADDED Requirements

### Requirement: System sends transactional email via Resend API

The notification service SHALL use the Resend API (via `resend` npm package) to send transactional emails. The `RESEND_API_KEY` environment variable MUST be set for the service to authenticate.

#### Scenario: Email is sent successfully

- **WHEN** `sendMail` is called with valid `to`, `subject`, `text`, and `html` parameters
- **THEN** the system SHALL send the email via Resend API
- **THEN** the system SHALL log the Resend email ID and recipient address

#### Scenario: Resend API returns an error

- **WHEN** the Resend API responds with an error object
- **THEN** `sendMail` SHALL throw an Error containing the error details
- **THEN** the queue worker SHALL catch the error and apply the retry logic

### Requirement: Email job outcomes are logged

The notification queue SHALL log the outcome of each email job to stdout/stderr.

#### Scenario: Job delivered successfully

- **WHEN** an email job is processed and `sendMail` resolves without error
- **THEN** the system SHALL log a success message including the job ID and type

#### Scenario: Job fails

- **WHEN** an email job throws an error during processing
- **THEN** the system SHALL log an error message including the job ID, type, attempt number, and error message
