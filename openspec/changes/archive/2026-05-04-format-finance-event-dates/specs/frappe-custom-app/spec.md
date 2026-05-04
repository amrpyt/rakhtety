## ADDED Requirements

### Requirement: Readable finance event timestamps
The Rakhtety Frappe Desk finance page SHALL show finance event timestamps as human-readable Arabic Egypt date/time text using a 12-hour clock.

#### Scenario: Payment events show readable dates
- **GIVEN** the finance API returns a payment event with `created_at` set to `2026-05-04T16:43:00.201112`
- **WHEN** the user opens `/desk/rakhtety-finance`
- **THEN** the payment events table shows a formatted date/time
- **AND** the cell does not show the raw `T16:43:00.201112` timestamp shape
- **AND** the time is displayed using a 12-hour clock
