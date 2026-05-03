## Why

Placeholder workflow steps currently display default accounting values even when the backend did not create real step rows. That makes mock numbers look official and can confuse office finance decisions.

## What Changes

- Stop showing fees/profit on placeholder workflow steps.
- Keep fees/profit visible only for real workflow steps returned by the backend.
- Keep document-upload accounting inputs available on real in-progress steps.
- Audit nearby static UI/data fallbacks and report which ones are still not tied to live system records.

## Capabilities

### New Capabilities
- `workflow-data-truthfulness`: Ensures workflow UI does not present template or placeholder values as live operational data.

### Modified Capabilities

## Impact

- Affects workflow tab placeholder rendering and step finance display behavior.
- Does not change Frappe API contracts.
- Does not migrate existing accounting data.
- Produces a static-data audit for follow-up product decisions.
