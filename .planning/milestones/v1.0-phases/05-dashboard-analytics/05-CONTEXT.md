# Phase 05: Dashboard & Analytics - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning
**Mode:** auto-selected defaults

<domain>
## Phase Boundary

Phase 05 delivers the operational dashboard layer: real KPI cards, bottleneck detection for stuck workflow steps, bottleneck visibility with employee ownership, and an in-app manager alert path. It does not add SMS/email/push delivery, charts-heavy analytics, or new workflow capabilities outside the dashboard.

</domain>

<decisions>
## Implementation Decisions

### KPI Source Of Truth
- **D-01:** Replace hardcoded dashboard numbers with live data from workflow, workflow step, employee, and financial services.
- **D-02:** Keep the existing compact KPI card/grid style. This is an operations screen, not a marketing page.
- **D-03:** Show the roadmap KPIs first: active files, completed this month, pending debt, and bottlenecks.
- **D-04:** Use Arabic labels and EGP currency formatting consistently.

### Bottleneck Rules
- **D-05:** A bottleneck is an `in_progress` or `blocked` workflow step whose `updated_at` is older than 7 days.
- **D-06:** If a step has never changed after creation, use `created_at` as the fallback age signal.
- **D-07:** Completed steps are never bottlenecks.
- **D-08:** Sort bottlenecks by oldest stuck age first so managers see the biggest fire first.

### Employee Workload
- **D-09:** Employee workload means assigned active workflows plus assigned non-completed steps.
- **D-10:** Use existing employee/profile data; do not add time tracking in this phase.
- **D-11:** Surface employee name beside each bottleneck so the manager knows who owns it.

### Alerts
- **D-12:** Implement alerts as in-app records and UI actions only.
- **D-13:** Alert delivery outside the app, like email, SMS, WhatsApp, or push notifications, is deferred.
- **D-14:** Alerts should link back to the workflow/step context when possible.

### the agent's Discretion
- Exact service/repository names.
- Whether bottleneck queries live in a dashboard service or a workflow analytics service.
- Empty/loading/error copy, as long as it stays Arabic and follows existing UI patterns.

</decisions>

<specifics>
## Specific Ideas

- Keep the dashboard dense and scannable for repeated manager use.
- Reuse the current `KpiGrid`, `KpiCard`, `Card`, `Badge`, and dashboard page structure.
- The current dashboard has hardcoded sample activity; Phase 05 should replace sample data with live app data.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product Scope
- `.planning/ROADMAP.md` - Phase 05 goal, requirements, success criteria, and plan outline.
- `.planning/REQUIREMENTS.md` - DASH-01 through DASH-05 and EMP-03 requirements.
- `.planning/PROJECT.md` - Arabic RTL product context and operational ERP constraints.

### Prior Phase Outputs
- `.planning/phases/03-financial-layer/03-VERIFICATION.md` - Financial dashboard summary already exists and should be reused, not duplicated.
- `.planning/phases/04-document-management/04-VERIFICATION.md` - Document completion rules affect workflow progress and bottleneck interpretation.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/(dashboard)/dashboard/page.tsx`: current dashboard route with hardcoded KPI and activity data.
- `src/components/dashboard/KpiGrid.tsx`: reusable KPI layout.
- `src/components/dashboard/KpiCard.tsx`: reusable KPI card.
- `src/components/dashboard/FinancialKpiGrid.tsx`: existing financial KPI section.
- `src/hooks/useFinancialDashboard.ts`: existing hook for financial totals.
- `src/lib/database/repositories/workflow.repository.ts`: workflow lookup and filtering.
- `src/lib/database/repositories/workflow-step.repository.ts`: step lookup with employee names and status dates.
- `src/lib/database/repositories/employee.repository.ts`: employee list and assigned workflow count.

### Established Patterns
- Services own business rules; repositories only talk to Supabase.
- Hooks bridge React UI to services.
- Dashboard UI uses cards, badges, and compact grid layouts.
- Arabic labels are expected in user-facing UI.

### Integration Points
- Add dashboard analytics service/repository logic beside existing service/repository layers.
- Add a dashboard analytics hook for the dashboard page.
- Replace hardcoded dashboard KPI and recent workflow arrays with live state.
- If alerts need persistence, add a small Supabase migration with RLS policies using `TO authenticated`.

</code_context>

<deferred>
## Deferred Ideas

- Email/SMS/WhatsApp/push notifications.
- Advanced charts, exports, and drill-down analytics.
- Time-based billing and detailed timesheets.
- OCR or document intelligence.

</deferred>

---

*Phase: 05-dashboard-analytics*
*Context gathered: 2026-04-29*
