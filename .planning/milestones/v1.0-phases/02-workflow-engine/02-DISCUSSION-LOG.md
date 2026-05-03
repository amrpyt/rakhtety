# Phase 2: Workflow Engine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-28
**Phase:** 02-workflow-engine
**Areas discussed:** State Machine Enforcement, Step Completion Criteria, Dependency Gate Behavior, Financial Config Per Step

---

## 1. State Machine Enforcement

Researched web best practices for database-enforced state transitions.

| Option | Description | Selected |
|--------|-------------|----------|
| PostgreSQL Triggers | Strongest enforcement — DB is source of truth; catches invalid transitions from ANY client | ✓ |
| Supabase Edge Functions + RLS | Supabase-native; JS/TS logic; easy to debug | |
| Application-level checks | Easy but only catches app code — scripts/backfills can bypass | |
| pg-workflows / pgflow | Purpose-built for Postgres; durable execution | |
| DBOS | Production-ready; transaction decorator | |

**User's choice:** PostgreSQL triggers
**Rationale:** DB is source of truth — catches violations from ALL clients (app, API, scripts, backfills). App-level validation as UX layer only.

---

## 2. Step Completion Criteria

Researched step completion patterns from modern workflow engines.

| Option | Description | Selected |
|--------|-------------|----------|
| Manual "Mark Complete" button | Employee clicks → validates prerequisites → advances | ✓ |
| Automatic on document upload | Upload required docs → system auto-advances | |
| Requires employee assignment | Step only completable after assignment | |
| Conditional gates | Multiple completion paths based on outcome | |

**User's choice:** Manual "Mark Complete" button initially
**Rationale:** Simplest, most controllable. Upgrade to automatic later if users find it tedious. Automatic advancement can be added when Phase 4 (Document Management) is implemented.

---

## 3. Dependency Gate Behavior

Researched UX patterns for blocked states.

| Option | Description | Selected |
|--------|-------------|----------|
| Grayed out + lock icon + tooltip | Step visible but not interactive; shows why blocked | ✓ |
| Hidden | Step completely invisible until dependency met | |
| Shown with warning + confirmation modal | Visible but action shows modal explaining block | |
| Break-glass override | Emergency path for privileged users with audit trail | |

**User's choice:** Grayed out + lock icon + tooltip
**Rationale:** Transparent — users see full workflow scope without hidden steps. Not blocking for routine operations (stakes are high for government permits — visibility matters).

---

## 4. Financial Config Per Step

Researched database schema patterns for per-step fee/profit configuration.

| Option | Description | Selected |
|--------|-------------|----------|
| Per-step config table (`workflow_step_configs`) | step_id, government_fee, office_profit, currency | ✓ |
| Per-workflow-type defaults | Workflow type defines standard fees; steps inherit | |
| Per-client override | Client-specific fee adjustments | |
| JSON metadata on step | Flexible JSON for arbitrary financial metadata | |

**User's choice:** Per-step config table
**Rationale:** Flexible, centralizes all financial settings. Default values can inherit from workflow type (DEVICE_LICENSE, EXCAVATION_PERMIT). Admin can override per step instance if needed.

---

## Deferred Ideas

- **Phase 4+:** Automatic step advancement when required documents uploaded (extends D-02)
- **Phase 6+:** Break-glass override with audit trail for privileged users
- **Phase 6+:** Financial summary per workflow (total fees, profit, outstanding debt)

---

*Phase: 02-workflow-engine*
*Discussion date: 2026-04-28*