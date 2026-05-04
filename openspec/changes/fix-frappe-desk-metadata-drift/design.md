## Context

Rakhtety's Frappe container currently contains a working Desk customization:

- Custom Pages under `rakhtety/page/rakhtety_*`.
- Shared Desk renderer assets under `public/rakhtety`.
- A `create_v16_desk_metadata` patch that creates Pages, Workspace entries, shortcuts, sidebar records, and app home metadata.
- An alias Page named `rakhtety-financial` that redirects to `rakhtety-finance`.

The repository is missing those files and hook entries. This is metadata drift: the database/container knows something the source tree does not.

## Decisions

1. Source control owns all standard Desk metadata.

   Rationale: Frappe deployments are recreated from app files, patches, fixtures, and migration hooks. Local container-only files are not durable.

2. Use a migration function plus `after_install` and `after_migrate`.

   Rationale: `patches.txt` handles first application for existing sites, while hooks keep metadata repaired after install or future migrations.

3. Keep `rakhtety-financial` as a compatibility alias.

   Rationale: Existing bookmarks or old links should not break. The alias has no business logic; it only routes users to the canonical `rakhtety-finance` page.

4. Store Arabic titles directly in UTF-8 source files.

   Rationale: The UI is Arabic RTL. The safest source of truth is readable Arabic in JSON/Python/JS files, with tests scanning for common mojibake markers.

## Risks

- Patch re-run risk: the metadata function must be idempotent, meaning it can run many times without creating duplicates.
- Route drift risk: page JSON, page JS, workspace shortcuts, and shared route arrays must use the same canonical route names.
- Encoding risk: Windows tooling can introduce mojibake. Tests scan for common broken markers in the Frappe app source.
