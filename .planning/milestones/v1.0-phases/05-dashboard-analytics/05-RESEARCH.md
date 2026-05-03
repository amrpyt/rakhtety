# Phase 05: Dashboard & Analytics - Research

**Researched:** 2026-04-29
**Status:** Ready for planning

## What Matters

Phase 05 should turn the dashboard from demo numbers into live operational visibility. The app already has the raw ingredients: workflows, workflow steps, employees, financial summaries, and a dashboard card pattern. The safest path is to add a small analytics service that calculates manager-facing values from existing data, then wire the dashboard UI to that service.

## Existing Assets

- `src/app/(dashboard)/dashboard/page.tsx` already has the dashboard shell and hardcoded cards.
- `src/components/dashboard/KpiGrid.tsx` and `KpiCard.tsx` provide the KPI card pattern.
- `src/components/dashboard/FinancialKpiGrid.tsx` already renders financial totals from Phase 3.
- `src/hooks/useFinancialDashboard.ts` shows the hook pattern for dashboard data.
- `workflowRepository.findAll` can load workflows.
- `workflowStepRepository.findByWorkflowId` can load steps with assigned employee names.
- `employeeRepository.findAll` can load active employees and profiles.
- `financialService.calculateDashboardSummary` already calculates pending debt and realized profit.

## Implementation Guidance

1. Keep analytics logic in services, not React components.
2. Put pure date/count calculations in a helper file with unit tests.
3. Use live Supabase-backed services for dashboard data, but avoid adding a separate analytics table.
4. Use a 7-day bottleneck threshold for `in_progress` or `blocked` steps.
5. Sort bottlenecks by oldest stuck age first.
6. Add in-app alert persistence with RLS if alerts are part of the phase.
7. Keep UI Arabic and compact.

## Risks

- `workflow_steps.updated_at` is only changed by some update paths. Use `created_at` fallback and document the limitation.
- Dashboard reads can become N+1. Acceptable for v1, but keep service boundaries clean so later optimization is easy.
- External alerts would expand scope. Keep Phase 05 alerts in-app only.
- `pnpm lint` currently prompts for ESLint setup; use tests, typecheck, and build as reliable gates until lint config exists.

## Recommended Plan

1. Create analytics types, pure calculations, and tests.
2. Add dashboard service and hook that gather live data.
3. Replace dashboard placeholders with live KPI, bottleneck, and workload UI.
4. Add persisted in-app bottleneck alerts and wire the alert button.

---

*Research source: local codebase + Phase 05 context*
