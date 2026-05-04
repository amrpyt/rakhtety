## ADDED Requirements

### Requirement: Durable Rakhtety Desk metadata
The Rakhtety Frappe app SHALL keep its custom Desk Page, Workspace, sidebar, and app-home metadata in source-controlled app files and migration hooks.

#### Scenario: Rebuild from source keeps Desk pages
- **GIVEN** the Frappe app is installed or migrated from the repository
- **WHEN** Desk metadata is synchronized
- **THEN** the Rakhtety pages `rakhtety-command-center`, `rakhtety-clients`, `rakhtety-workflows`, `rakhtety-finance`, `rakhtety-employees`, and `rakhtety-documents` exist with Arabic titles
- **AND** the Rakhtety Workspace links to those pages

#### Scenario: Old finance route still works
- **GIVEN** a user or bookmark opens the old `rakhtety-financial` page route
- **WHEN** the Page script loads
- **THEN** it routes the user to `rakhtety-finance`

#### Scenario: Arabic Desk metadata is not mojibake
- **WHEN** the source-controlled Frappe app metadata is checked
- **THEN** Arabic page titles and labels MUST be readable Arabic
- **AND** common broken-encoding markers such as `Ø`, `Ù`, `Ã`, `Â`, `â`, and `�` MUST NOT appear in Rakhtety Desk metadata files
