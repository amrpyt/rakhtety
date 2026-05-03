# Phase 05: Dashboard & Analytics - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md; this log preserves the alternatives considered.

**Date:** 2026-04-29
**Phase:** 05-dashboard-analytics
**Areas discussed:** KPI source, bottleneck rules, employee workload, alerts
**Mode:** `--auto`

---

## KPI Source

| Option | Description | Selected |
|--------|-------------|----------|
| Live data | Replace dashboard placeholders with real workflow, financial, and employee data | yes |
| Static demo data | Keep sample numbers for now | no |
| Analytics warehouse | Build a separate analytics store | no |

**User's choice:** Auto-selected live data as the recommended default.
**Notes:** This keeps Phase 05 focused on the roadmap promise without adding a separate analytics system.

---

## Bottleneck Rules

| Option | Description | Selected |
|--------|-------------|----------|
| 7-day stuck step | In-progress or blocked step older than 7 days | yes |
| Manual flag only | Managers manually mark bottlenecks | no |
| Configurable threshold now | Add settings UI for thresholds | no |

**User's choice:** Auto-selected 7-day stuck step as the roadmap default.
**Notes:** Configurable thresholds can come later if the team needs them.

---

## Employee Workload

| Option | Description | Selected |
|--------|-------------|----------|
| Assigned active work | Count active workflows and non-completed assigned steps | yes |
| Time tracking | Track hours per case | no |
| Manual workload score | Let managers manually score workload | no |

**User's choice:** Auto-selected assigned active work.
**Notes:** Time tracking is already listed as a future financial idea, not Phase 05.

---

## Alerts

| Option | Description | Selected |
|--------|-------------|----------|
| In-app alerts | Store alerts and show them inside the app | yes |
| External delivery | Email/SMS/WhatsApp/push | no |
| No alert persistence | Button only, no record | no |

**User's choice:** Auto-selected in-app alerts.
**Notes:** External delivery is useful later but would expand this phase too much.

---

## the agent's Discretion

- Exact service/repository naming.
- Exact empty/loading/error UI copy.
- Whether analytics helpers are grouped under dashboard or workflow services.

## Deferred Ideas

- Email/SMS/WhatsApp/push notifications.
- Advanced charts and drill-down analytics.
- Configurable bottleneck thresholds.
